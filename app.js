/* =========================================================
   BRUMA SCENT — funcionamiento de la página
   Normalmente no hace falta tocar este archivo:
   los datos viven en productos.js
   ========================================================= */
(function () {
  "use strict";

  var PERFUMES = (window.PERFUMES || []).slice().sort(function (a, b) { return a.num - b.num; });
  var CONFIG = window.CONFIG || {};
  var FAMILIAS = ["Floral", "Floral frutal", "Dulce", "Oriental", "Amaderado", "Fresco", "Acuático", "Aromático", "Chipre"];

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var GENEROS = ["mujer", "hombre", "unisex", "hogar"];
  var estado = { genero: (GENEROS.indexOf(document.body.dataset.genero) >= 0 ? document.body.dataset.genero : "mujer"), familia: "Todos", texto: "" };
  var QUIEN = { mujer: " para ella", hombre: " para él", unisex: " unisex", hogar: " para tu hogar" };
  var ES_CATALOGO = !!document.getElementById("rejilla");
  /* Género: "mujer", "hombre" o "unisex" (aparece en las dos secciones). Sin dato = mujer. */
  function generoDe(p) { return p.genero || "mujer"; }
  function esAmbiental(p) { return p.tipo === "ambiental" || generoDe(p) === "hogar"; }
  /* En qué colección aparece cada aroma:
     mujer/hombre: los suyos + "unisex" + "ambos" · unisex: solo "unisex" · hogar: aromas ambientales */
  function enGenero(p, g) {
    if (g === "hogar") return esAmbiental(p);
    if (esAmbiental(p)) return false;
    var x = generoDe(p);
    if (g === "unisex") return x === "unisex";
    return x === g || x === "unisex" || x === "ambos";
  }
  function deEsteGenero() {
    var l = PERFUMES.filter(function (p) { return enGenero(p, estado.genero); });
    var compartido = function (p) { var x = generoDe(p); return x === "unisex" || x === "ambos"; };
    if (estado.genero === "unisex" || estado.genero === "hogar") return l;
    var propios = l.filter(function (p) { return !compartido(p); }), uni = l.filter(compartido);
    return propios.concat(uni);  // los unisex van al final de cada sección
  }

  /* ---------- utilidades ---------- */
  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  /* Color del líquido: toma el "tono" del perfume y lo aclara para que
     siempre se vea pastel, aunque el color original sea oscuro. */
  function tono(p) {
    var hex = String(p.tono || "").trim();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return "#f3dc9b";
    if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, h = 0, d = mx - mn;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    var l2 = 0.92 + 0.04 * l;                       // siempre muy claro: 92% a 96%
    var s2 = Math.min(s, 0.7) * (l < 0.3 ? 0.7 : 1);  // suaviza los colores muy oscuros
    return "hsl(" + Math.round(h) + " " + Math.round(s2 * 100) + "% " + Math.round(l2 * 100) + "%)";
  }
  function num2(n) { return (n < 10 ? "0" : "") + n; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Foto de cada nota: se toma de notas.js (fotos de Unsplash).
     Si una nota no tiene foto, se usa la foto genérica "_generica". */
  var FOTOS = window.FOTOS_NOTAS || {};
  var RECORTE = { arriba: "top", abajo: "bottom", izquierda: "left", derecha: "right" };
  function urlFoto(nota, px) {
    var f = FOTOS[nota] || FOTOS[String(nota).trim()] || FOTOS._generica;
    if (!f) return "";
    var url = typeof f === "string" ? f : f.url;
    var crop = (typeof f === "object" && RECORTE[f.encuadre]) || "entropy";
    if (!/images\.unsplash\.com/.test(url)) return url;
    return url.split("?")[0] + "?w=" + px + "&h=" + px + "&fit=crop&crop=" + crop + "&auto=format&q=60";
  }
  function imgNota(nota, px) {
    px = px || 64;
    var gen = urlFoto("_generica", px);
    return '<img src="' + esc(urlFoto(nota, px)) + '" alt="" loading="lazy" width="' + px + '" height="' + px + '" referrerpolicy="no-referrer"' +
      ' onerror="if(this.dataset.f||!\'' + esc(gen) + '\'){this.style.visibility=\'hidden\'}else{this.dataset.f=1;this.src=\'' + esc(gen) + '\'}">';
  }
  function linkPedido(p) {
    var wa = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    if (wa) {
      var msg = !p ? "Hola Bruma Scent, quiero información sobre sus perfumes."
        : esAmbiental(p) ? "Hola Bruma Scent, me interesa el aroma para hogar N.º " + num2(p.num) + ", " + p.nombre + " (" + (p.presentacion || "") + "). ¿Me das informes?"
        : (CONFIG.mensaje || "Hola, me interesa el N.º {num}").replace("{num}", num2(p.num)).replace("{nombre}", p.nombre).replace("{marca}", p.marca);
      return "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg);
    }
    return CONFIG.instagram ? "https://ig.me/m/" + CONFIG.instagram : "#contacto";
  }
  function textoPedir() { return CONFIG.whatsapp ? "Pedir por WhatsApp" : "Pedir por Instagram"; }
  function textoBusqueda(p) {
    return slug([p.num, num2(p.num), p.nombre, p.inspiradoEn, p.marca, p.familia,
      (p.salida || []).join(" "), (p.corazon || []).join(" "), (p.fondo || []).join(" ")].join(" "));
  }
  PERFUMES.forEach(function (p) { p._busca = textoBusqueda(p); });

  /* ---------- contacto ---------- */
  function pintarContacto() {
    document.querySelectorAll(".js-contacto").forEach(function (a) {
      a.href = linkPedido(null); a.target = "_blank"; a.rel = "noopener";
      if (a.classList.contains("btn-linea")) a.textContent = textoPedir();
    });
    var links = [];
    if (CONFIG.whatsapp) links.push('<a class="btn" target="_blank" rel="noopener" href="' + linkPedido(null) + '">WhatsApp</a>');
    if (CONFIG.instagram) links.push('<a class="btn btn-linea" target="_blank" rel="noopener" href="https://instagram.com/' + esc(CONFIG.instagram) + '">@' + esc(CONFIG.instagram) + '</a>');
    if (CONFIG.tiktok) links.push('<a class="btn btn-linea" target="_blank" rel="noopener" href="https://www.tiktok.com/@' + esc(CONFIG.tiktok) + '">TikTok</a>');
    $("#pieLinks").innerHTML = links.join("");
  }

  /* ---------- portada ---------- */
  function pintarPortada() {
    var fila = $("#vitrina"); if (!fila) return;
    var elegidos = (CONFIG.portada || []).map(function (n) { return PERFUMES.find(function (p) { return p.num === Number(n); }); }).filter(Boolean);
    if (!elegidos.length) elegidos = PERFUMES.slice(0, 10);
    fila.innerHTML = elegidos.map(function (p) {
      return '<li><button type="button" data-num="' + p.num + '" aria-label="Ver ' + esc(p.nombre) + '">' +
        '<span class="apoyo"><span class="frasco" style="--tono:' + tono(p) + '"><img src="img/botella-neutra-sm.webp" alt="" width="173" height="520" loading="lazy"><i></i></span></span>' +
        '<span class="vitrina-nom">' + esc(p.nombre) + '</span></button></li>';
    }).join("");
    fila.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-num]"); if (b) abrir(b.dataset.num);
    });
  }

  /* ---------- catálogo ---------- */
  /* Cuentas ("64 aromas") y frascos de los cuadros de colección */
  function pintarColecciones() {
    document.querySelectorAll("[data-cuenta]").forEach(function (el) {
      el.textContent = PERFUMES.filter(function (p) { return enGenero(p, el.dataset.cuenta); }).length + " aromas";
    });
    var t = $("#totalAromas"); if (t) t.textContent = PERFUMES.filter(function (p) { return !esAmbiental(p); }).length;
    /* Una sola botella por colección; su color está en estilos.css (--frasco-ella / --frasco-el / --frasco-uni).
       En "hogar" se muestra img/hogar-spray.webp. */
    document.querySelectorAll("[data-frascos]").forEach(function (el) {
      if (el.dataset.frascos === "hogar") {  // imagen neutral (sin temporada) del atomizador
        el.innerHTML = '<img class="foto-hogar" src="img/hogar-spray.webp" alt="" loading="lazy">';
        return;
      }
      el.innerHTML = '<span class="frasco"><img src="img/botella-neutra.webp" alt="" width="333" height="1000" loading="lazy"><i></i></span>';
    });
  }
  function pintarChips() {
    var base = deEsteGenero();
    var presentes = FAMILIAS.filter(function (f) { return base.some(function (p) { return p.familia === f; }); });
    base.forEach(function (p) { if (p.familia && presentes.indexOf(p.familia) < 0) presentes.push(p.familia); });
    var lista = ["Todos"].concat(presentes);
    $("#chips").innerHTML = lista.map(function (f) {
      var n = f === "Todos" ? base.length : base.filter(function (p) { return p.familia === f; }).length;
      return '<button type="button" class="chip" data-f="' + esc(f) + '" aria-pressed="' + (estado.familia === f) + '">' + esc(f) + '<span>' + n + '</span></button>';
    }).join("");
  }
  function etiqueta(p) {
    if (p.disponible === false) return "Agotado";
    if (p.nuevo) return "Nuevo";
    if (p.masPedido) return "Más pedido";
    return p.familia;
  }
  function filtrados() {
    var t = slug(estado.texto);
    return deEsteGenero().filter(function (p) {
      return (estado.familia === "Todos" || p.familia === estado.familia) && (!t || p._busca.indexOf(t) >= 0);
    });
  }
  function pintarRejilla() {
    var lista = filtrados();
    $("#rejilla").innerHTML = lista.map(function (p) {
      return '<li><button type="button" class="carta" data-num="' + p.num + '" aria-label="Ver notas de ' + esc(p.nombre) + '">' +
        '<span class="carta-top"><span class="carta-num">N.º ' + num2(p.num) + '</span><span class="carta-tag">' + esc(etiqueta(p)) + '</span></span>' +
        '<span class="carta-img">' + (p.foto ? '<img class="foto-producto" src="' + esc(p.foto) + '" alt="" loading="lazy">'
          : '<span class="frasco" style="--tono:' + tono(p) + '"><img src="img/botella-neutra-sm.webp" alt="" loading="lazy" width="173" height="520"><i></i></span>') + '</span>' +
        '<span class="carta-txt"><span class="carta-insp">' + (esAmbiental(p) ? "Aroma para tu hogar" : "Inspirado en") + '</span><span class="carta-nombre">' + esc(p.nombre) + '</span>' +
        '<span class="carta-marca">' + esc(esAmbiental(p) ? (p.presentacion || "") : p.marca) + '</span>' +
        '<span class="carta-notas">' + (p.destacadas || []).slice(0, 4).map(function (n) { return imgNota(n); }).join("") + '</span></span>' +
        '</button></li>';
    }).join("");
    var total = lista.length;
    var deG = deEsteGenero().length, quien = QUIEN[estado.genero] || "";
    $("#cuenta").textContent = total === deG ? total + " aromas" + quien : total + (total === 1 ? " aroma" : " aromas") + " de " + deG + quien;
    $("#vacio").hidden = total > 0;
  }

  /* ---------- ficha ---------- */
  var ficha = $("#ficha");
  function similares(p) {
    var mias = [].concat(p.salida || [], p.corazon || [], p.fondo || []);
    var g = esAmbiental(p) ? "hogar" : (ES_CATALOGO ? estado.genero : (generoDe(p) === "hombre" ? "hombre" : "mujer"));
    return PERFUMES.filter(function (o) { return o.num !== p.num && enGenero(o, g); }).map(function (o) {
      var suyas = [].concat(o.salida || [], o.corazon || [], o.fondo || []);
      var comun = suyas.filter(function (n) { return mias.indexOf(n) >= 0; }).length;
      return { o: o, s: comun + (o.familia === p.familia ? 2 : 0) };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.o; });
  }
  function abrir(num, sinHash) {
    var p = PERFUMES.find(function (x) { return x.num === Number(num); });
    if (!p) return;
    $("#fichaNum").textContent = "N.º " + num2(p.num);
    $("#fichaMarca").textContent = esAmbiental(p) ? (p.presentacion || "Aroma para tu hogar") : "Inspirado en " + p.inspiradoEn + " · " + p.marca;
    var foto = $("#fichaFoto");
    if (foto) { foto.hidden = !p.foto; if (p.foto) foto.src = p.foto; }
    $("#fichaFrasco").hidden = !!p.foto;
    $("#fichaNombre").textContent = p.nombre;
    $("#fichaFrasco").style.setProperty("--tono", tono(p));
    $("#fichaFamilia").textContent = p.familia;
    $("#fichaOcasion").textContent = p.ocasion || "";
    $("#fichaOcasion").hidden = !p.ocasion;
    $("#fichaDest").innerHTML = (p.destacadas || []).slice(0, 4).map(function (n) {
      return '<li><span class="nota-img">' + imgNota(n, 180) + '</span>' + esc(n) + '</li>';
    }).join("");
    $("#fichaDesc").textContent = p.descripcion || "";
    var pisos = (esAmbiental(p) ? [["Notas", [].concat(p.salida || [], p.corazon || [], p.fondo || [])]] : [["Salida", p.salida], ["Corazón", p.corazon], ["Fondo", p.fondo]]).filter(function (x) { return x[1] && x[1].length; });
    $("#fichaPiramide").innerHTML = pisos.map(function (x) {
      return '<div class="piso"><span class="piso-tit">' + x[0] + '</span><span class="piso-notas">' +
        x[1].map(function (n) { return '<span>' + imgNota(n) + esc(n) + '</span>'; }).join("") + '</span></div>';
    }).join("");
    var precio = p.precio || CONFIG.precioGeneral;
    $("#fichaPrecio").hidden = !precio;
    $("#fichaPrecio").textContent = precio || "";
    var pedir = $("#fichaPedir");
    pedir.href = linkPedido(p);
    pedir.textContent = p.disponible === false ? "Agotado · preguntar disponibilidad" : textoPedir();
    var sim = similares(p);
    $("#fichaSimilaresBox").hidden = !sim.length;
    $("#fichaSimilares").innerHTML = sim.map(function (o) {
      return '<li><button type="button" data-num="' + o.num + '"><small>' + num2(o.num) + '</small>' + esc(o.nombre) + '</button></li>';
    }).join("");
    if (!ficha.open) { if (ficha.showModal) ficha.showModal(); else ficha.setAttribute("open", ""); }
    ficha.scrollTop = 0; $(".ficha-in", ficha).scrollTop = 0;
    if (!sinHash) { try { history.replaceState(null, "", "#perfume-" + num2(p.num)); } catch (e) {} }
  }
  function cerrar() {
    if (ficha.open) { if (ficha.close) ficha.close(); else ficha.removeAttribute("open"); }
  }
  ficha.addEventListener("close", function () {
    if (/^#perfume-/.test(location.hash)) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  });
  ficha.addEventListener("click", function (e) { if (e.target === ficha) cerrar(); });
  $("#fichaCerrar").addEventListener("click", cerrar);
  $("#fichaSimilares").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-num]"); if (b) abrir(b.dataset.num);
  });
  function desdeHash() {
    var m = location.hash.match(/^#perfume-(\d+)/);
    if (m) { abrir(m[1], true); return; }
    var g = location.hash.match(/^#(mujer|hombre)$/);
    if (g) location.href = g[1] + ".html";  // ligas viejas #mujer / #hombre
  }

  /* ---------- eventos del catálogo ---------- */
  if (ES_CATALOGO) {
  $("#chips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    estado.familia = b.dataset.f; pintarChips(); pintarRejilla();
  });
  $("#buscar").addEventListener("input", function (e) { estado.texto = e.target.value; pintarRejilla(); });
  $("#limpiar").addEventListener("click", function () {
    estado.familia = "Todos"; estado.texto = ""; $("#buscar").value = ""; pintarChips(); pintarRejilla();
  });
  $("#rejilla").addEventListener("click", function (e) {
    var b = e.target.closest(".carta"); if (b) abrir(b.dataset.num);
  });
  }

  /* ---------- preguntas ---------- */
  function pintarPreguntas() {
    if (!$("#faq")) return;
    $("#faq").innerHTML = (window.PREGUNTAS || []).map(function (q) {
      return '<details><summary>' + esc(q.p) + '</summary><p>' + esc(q.r) + '</p></details>';
    }).join("");
  }

  /* ---------- arranque ---------- */
  pintarContacto();
  pintarPortada();
  pintarColecciones();
  if (ES_CATALOGO) { pintarChips(); pintarRejilla(); }
  pintarPreguntas();
  desdeHash();
  window.addEventListener("hashchange", desdeHash);
})();
