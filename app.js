/* =========================================================
   BRUMA SCENT — funcionamiento de la página
   Normalmente no hace falta tocar este archivo:
   los datos viven en productos.js
   ========================================================= */
(function () {
  "use strict";

  var PERFUMES = (window.PERFUMES || []).slice().sort(function (a, b) { return a.num - b.num; });
  var CONFIG = window.CONFIG || {};
  var FAMILIAS = ["Floral", "Floral frutal", "Dulce", "Oriental", "Amaderado", "Fresco", "Chipre"];

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var estado = { familia: "Todos", texto: "" };

  /* ---------- utilidades ---------- */
  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  /* Color del líquido: toma el "tono" del perfume y lo aclara para que
     siempre se vea pastel, aunque el color original sea oscuro. */
  function hslDe(p) {
    var hex = String(p.tono || "").trim();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) hex = "#f3dc9b";
    if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, h = 0, d = mx - mn;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return { h: Math.round(h), s: s, l: l };
  }
  function tono(p) {
    var c = hslDe(p);
    var l2 = 0.92 + 0.04 * c.l;                          // siempre muy claro: 92% a 96%
    var s2 = Math.min(c.s, 0.7) * (c.l < 0.3 ? 0.7 : 1);  // suaviza los colores muy oscuros
    return "hsl(" + c.h + " " + Math.round(s2 * 100) + "% " + Math.round(l2 * 100) + "%)";
  }
  /* Fondo pastel de la tarjeta, un poco más intenso que el líquido.
     Los tonos casi blancos o grises reciben un toque crema. */
  function fondo(p) {
    var c = hslDe(p);
    var s = c.s < 0.12 ? 0.35 : Math.min(Math.max(c.s, 0.45), 0.75);
    var h = c.s < 0.12 ? 38 : c.h;
    return "hsl(" + h + " " + Math.round(s * 100) + "% 88%)";
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
      var msg = p ? (CONFIG.mensaje || "Hola, me interesa el N.º {num}")
        .replace("{num}", num2(p.num)).replace("{nombre}", p.nombre).replace("{marca}", p.marca)
        : "Hola Bruma Scent, quiero información sobre sus perfumes.";
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
    var t = $("#totalAromas"); if (t) t.textContent = PERFUMES.length;
    var lv = $(".vitrina-link"); if (lv) lv.textContent = "Ver los " + PERFUMES.length;
    var fila = $("#vitrina"); if (!fila) return;
    var elegidos = (CONFIG.portada || []).map(function (n) { return PERFUMES.find(function (p) { return p.num === Number(n); }); }).filter(Boolean);
    if (!elegidos.length) elegidos = PERFUMES.slice(0, 10);
    fila.innerHTML = elegidos.map(function (p) {
      return '<li><button type="button" data-num="' + p.num + '" aria-label="Ver ' + esc(p.nombre) + '">' +
        '<span class="apoyo" style="--fondo:' + fondo(p) + '"><span class="frasco" style="--tono:' + tono(p) + '"><img src="img/botella-neutra-sm.webp" alt="" width="173" height="520" loading="lazy"><i></i></span></span>' +
        '<span class="vitrina-nom">' + esc(p.nombre) + '</span></button></li>';
    }).join("");
    fila.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-num]"); if (b) abrir(b.dataset.num);
    });
  }

  /* ---------- catálogo ---------- */
  function pintarChips() {
    var presentes = FAMILIAS.filter(function (f) { return PERFUMES.some(function (p) { return p.familia === f; }); });
    PERFUMES.forEach(function (p) { if (p.familia && presentes.indexOf(p.familia) < 0) presentes.push(p.familia); });
    var lista = ["Todos"].concat(presentes);
    $("#chips").innerHTML = lista.map(function (f) {
      var n = f === "Todos" ? PERFUMES.length : PERFUMES.filter(function (p) { return p.familia === f; }).length;
      return '<button type="button" class="chip" data-fam="' + slug(f) + '" data-f="' + esc(f) + '" aria-pressed="' + (estado.familia === f) + '">' + esc(f) + '<span>' + n + '</span></button>';
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
    return PERFUMES.filter(function (p) {
      return (estado.familia === "Todos" || p.familia === estado.familia) && (!t || p._busca.indexOf(t) >= 0);
    });
  }
  function pintarRejilla() {
    var lista = filtrados();
    $("#rejilla").innerHTML = lista.map(function (p) {
      return '<li><button type="button" class="carta" style="--fondo:' + fondo(p) + '" data-num="' + p.num + '" aria-label="Ver notas de ' + esc(p.nombre) + '">' +
        '<span class="carta-top"><span class="carta-num">N.º ' + num2(p.num) + '</span><span class="carta-tag">' + esc(etiqueta(p)) + '</span></span>' +
        '<span class="carta-img"><span class="frasco" style="--tono:' + tono(p) + '"><img src="img/botella-neutra-sm.webp" alt="" loading="lazy" width="173" height="520"><i></i></span></span>' +
        '<span class="carta-txt"><span class="carta-insp">Inspirado en</span><span class="carta-nombre">' + esc(p.nombre) + '</span>' +
        '<span class="carta-marca">' + esc(p.marca) + '</span>' +
        '<span class="carta-notas">' + (p.destacadas || []).slice(0, 4).map(function (n) { return imgNota(n); }).join("") + '</span></span>' +
        '</button></li>';
    }).join("");
    var total = lista.length;
    $("#cuenta").textContent = total === PERFUMES.length ? total + " aromas" : total + (total === 1 ? " aroma" : " aromas") + " de " + PERFUMES.length;
    $("#vacio").hidden = total > 0;
  }

  /* ---------- ficha ---------- */
  var ficha = $("#ficha");
  function similares(p) {
    var mias = [].concat(p.salida || [], p.corazon || [], p.fondo || []);
    return PERFUMES.filter(function (o) { return o.num !== p.num; }).map(function (o) {
      var suyas = [].concat(o.salida || [], o.corazon || [], o.fondo || []);
      var comun = suyas.filter(function (n) { return mias.indexOf(n) >= 0; }).length;
      return { o: o, s: comun + (o.familia === p.familia ? 2 : 0) };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.o; });
  }
  function abrir(num, sinHash) {
    var p = PERFUMES.find(function (x) { return x.num === Number(num); });
    if (!p) return;
    $("#fichaNum").textContent = "N.º " + num2(p.num);
    $("#fichaMarca").textContent = "Inspirado en " + p.inspiradoEn + " · " + p.marca;
    $("#fichaNombre").textContent = p.nombre;
    $("#fichaFrasco").style.setProperty("--tono", tono(p));
    ficha.style.setProperty("--fondo", fondo(p));
    $("#fichaFamilia").textContent = p.familia;
    $("#fichaOcasion").textContent = p.ocasion || "";
    $("#fichaOcasion").hidden = !p.ocasion;
    $("#fichaDest").innerHTML = (p.destacadas || []).slice(0, 4).map(function (n) {
      return '<li><span class="nota-img">' + imgNota(n, 180) + '</span>' + esc(n) + '</li>';
    }).join("");
    $("#fichaDesc").textContent = p.descripcion || "";
    var pisos = [["Salida", p.salida], ["Corazón", p.corazon], ["Fondo", p.fondo]].filter(function (x) { return x[1] && x[1].length; });
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
    if (/^#perfume-/.test(location.hash)) { try { history.replaceState(null, "", "#catalogo"); } catch (e) {} }
  });
  ficha.addEventListener("click", function (e) { if (e.target === ficha) cerrar(); });
  $("#fichaCerrar").addEventListener("click", cerrar);
  $("#fichaSimilares").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-num]"); if (b) abrir(b.dataset.num);
  });
  function desdeHash() {
    var m = location.hash.match(/^#perfume-(\d+)/);
    if (m) abrir(m[1], true);
  }

  /* ---------- eventos del catálogo ---------- */
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

  /* ---------- preguntas ---------- */
  function pintarPreguntas() {
    $("#faq").innerHTML = (window.PREGUNTAS || []).map(function (q) {
      return '<details><summary>' + esc(q.p) + '</summary><p>' + esc(q.r) + '</p></details>';
    }).join("");
  }

  /* ---------- cinta de notas ---------- */
  function pintarCinta() {
    var c = $("#cinta"); if (!c) return;
    var cuenta = {};
    PERFUMES.forEach(function (p) { (p.destacadas || []).forEach(function (n) { cuenta[n] = (cuenta[n] || 0) + 1; }); });
    var notas = Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; }).slice(0, 14);
    var uno = notas.map(function (n) { return '<span class="cinta-item">' + imgNota(n, 64) + esc(n) + '</span>'; }).join("");
    c.innerHTML = '<div class="cinta-pista">' + uno + uno + '</div>';
  }

  /* ---------- arranque ---------- */
  pintarContacto();
  pintarPortada();
  pintarChips();
  pintarRejilla();
  pintarPreguntas();
  pintarCinta();
  desdeHash();
  window.addEventListener("hashchange", desdeHash);
})();
