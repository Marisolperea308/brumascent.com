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
    if (CONFIG.instagram) links.push('<a target="_blank" rel="noopener" href="https://instagram.com/' + esc(CONFIG.instagram) + '">Instagram <small>@' + esc(CONFIG.instagram) + '</small></a>');
    if (CONFIG.tiktok) links.push('<a target="_blank" rel="noopener" href="https://www.tiktok.com/@' + esc(CONFIG.tiktok) + '">TikTok <small>@' + esc(CONFIG.tiktok) + '</small></a>');
    if (CONFIG.whatsapp) links.push('<a target="_blank" rel="noopener" href="' + linkPedido(null) + '">WhatsApp</a>');
    var anio = $("#anio"); if (anio) anio.textContent = new Date().getFullYear();
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
        el.innerHTML = '<img class="foto-hogar" src="img/hogar-spray.webp?v=2" alt="" loading="lazy">';
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
        ((p.precio || CONFIG.precioGeneral) ? '<span class="carta-precio">' + esc(p.precio || CONFIG.precioGeneral) + '</span>' : '') +
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
    var ref = e.target.closest(".referencia-link");
    if (ref) { e.preventDefault(); e.stopPropagation(); if (ref.dataset.refUrl) window.open(ref.dataset.refUrl, "_blank", "noopener"); return; }
    var b = e.target.closest(".carta"); if (b) abrir(b.dataset.num);
  });
  }


  /* ---------- carrito Bruma Scent ---------- */
  var carrito = [];
  var opcionesEnvio = [];
  var envioSeleccionado = null;
  var codigoPostalCotizado = "";
  try { carrito = JSON.parse(localStorage.getItem("brumaCarrito") || "[]"); } catch (e) { carrito = []; }
  function precioNumero(p) {
    var v = String(p.precio || CONFIG.precioGeneral || "$250").replace(/[^0-9.,]/g, "").replace(",", ".");
    var n = Number(v); return isFinite(n) && n > 0 ? n : 250;
  }
  function dinero(n) { return "$" + Number(n).toLocaleString("es-MX", {maximumFractionDigits:2}) + " MXN"; }
  function guardarCarrito() { try { localStorage.setItem("brumaCarrito", JSON.stringify(carrito)); } catch (e) {} }
  function totalCarrito() { return carrito.reduce(function(t,x){return t+x.precio*x.cantidad;},0); }
  function renderCarrito() {
    var count = carrito.reduce(function(t,x){return t+x.cantidad;},0);
    var badge = document.getElementById("brumaCartCount");
    if (badge) badge.textContent = count;
    var lista = document.getElementById("brumaCartItems");
    var total = document.getElementById("brumaCartTotal");
    var vacio = document.getElementById("brumaCartEmpty");
    if (!lista) return;
    vacio.hidden = carrito.length > 0;
    lista.innerHTML = carrito.map(function(x){
      return '<li class="bruma-cart-row"><div class="bruma-cart-info"><strong>'+esc(x.nombre)+'</strong><small>N.º '+num2(x.num)+' · '+dinero(x.precio)+'</small></div><div class="bruma-cart-qty"><button type="button" data-cart-action="menos" data-num="'+x.num+'" aria-label="Restar">−</button><span>'+x.cantidad+'</span><button type="button" data-cart-action="mas" data-num="'+x.num+'" aria-label="Sumar">+</button><button type="button" class="bruma-cart-remove" data-cart-action="quitar" data-num="'+x.num+'" aria-label="Eliminar">×</button></div></li>';
    }).join("");
    var costoEnvio = envioSeleccionado ? Number(envioSeleccionado.price) : 0;
    total.textContent = dinero(totalCarrito() + costoEnvio);
    var desglose = document.getElementById("brumaShippingTotal");
    if (desglose) desglose.textContent = envioSeleccionado ? "Envío: " + dinero(costoEnvio) : "Envío: por cotizar";
    var wa = document.getElementById("brumaCartWhatsapp");
    if (wa) wa.disabled = carrito.length === 0;
    var pay = document.getElementById("brumaCartPay");
    if (pay) pay.disabled = carrito.length === 0 || !envioSeleccionado;
  }
  function agregarAlCarrito(num) {
    var p = PERFUMES.find(function(x){return x.num===Number(num);});
    if (!p || p.disponible === false) return;
    var item = carrito.find(function(x){return x.num===p.num;});
    if (item) item.cantidad += 1;
    else carrito.push({num:p.num,nombre:p.nombre,precio:precioNumero(p),cantidad:1});
    guardarCarrito(); renderCarrito();
    var aviso=document.getElementById("brumaCartNotice");
    if(aviso){aviso.textContent=p.nombre+" se agregó a tu carrito.";aviso.hidden=false;}
  }
  function abrirCarrito() {
    var d=document.getElementById("brumaCartDialog");
    if(d && d.showModal) d.showModal();
    else if(d) d.setAttribute("open","");
    renderCarrito();
  }
  function crearCarrito() {
    if(document.getElementById("brumaCartLauncher")) return;
    var launcher=document.createElement("button");
    launcher.type="button";launcher.id="brumaCartLauncher";launcher.className="bruma-cart-launcher";
    launcher.setAttribute("aria-label","Abrir carrito de compras");
    launcher.innerHTML='🛍 <span>Mi carrito</span><b id="brumaCartCount">0</b>';
    document.body.appendChild(launcher);
    var dialog=document.createElement("dialog");
    dialog.id="brumaCartDialog";dialog.className="bruma-cart-dialog";
    dialog.innerHTML='<div class="bruma-cart-head"><div><small>BRUMA SCENT</small><h2>Tu carrito</h2></div><button type="button" id="brumaCartClose" aria-label="Cerrar">×</button></div><p class="bruma-cart-empty" id="brumaCartEmpty">Tu carrito está esperando sus primeros aromas.</p><ul id="brumaCartItems" class="bruma-cart-items"></ul><section class="bruma-shipping-box"><h3>Envío a domicilio</h3><label for="brumaZipCode">Código postal de entrega</label><div class="bruma-shipping-form"><input id="brumaZipCode" type="text" inputmode="numeric" maxlength="5" placeholder="Ej. 64000" autocomplete="postal-code"><button type="button" id="brumaQuoteShipping">Cotizar envío</button></div><div id="brumaShippingOptions" class="bruma-shipping-options" aria-live="polite"></div><p id="brumaShippingTotal" class="bruma-shipping-total">Envío: por cotizar</p></section><section class="bruma-customer-box" id="brumaCustomerBox">       <h3>Datos para tu entrega</h3>       <p>Completa tus datos antes de continuar al pago seguro.</p>       <div class="bruma-customer-grid">         <label>Nombre completo<input id="brumaCustomerName" type="text" autocomplete="name" maxlength="100" required placeholder="Nombre y apellidos"></label>         <label>Correo electrónico<input id="brumaCustomerEmail" type="email" autocomplete="email" maxlength="120" required placeholder="correo@ejemplo.com"></label>         <label>Celular (10 dígitos)<input id="brumaCustomerPhone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" required placeholder="8112345678"></label>         <label>Calle<input id="brumaCustomerStreet" type="text" autocomplete="address-line1" maxlength="120" required placeholder="Nombre de la calle"></label>         <label>Número exterior<input id="brumaCustomerNumber" type="text" maxlength="20" required placeholder="Ej. 123"></label>         <label>Colonia<input id="brumaCustomerNeighborhood" type="text" autocomplete="address-level3" maxlength="80" required placeholder="Tu colonia"></label>         <label>Ciudad o municipio<input id="brumaCustomerCity" type="text" autocomplete="address-level2" maxlength="80" required placeholder="Tu ciudad"></label>         <label>Estado<input id="brumaCustomerState" type="text" autocomplete="address-level1" maxlength="60" required placeholder="Tu estado"></label>         <label class="bruma-customer-wide">Referencias para la entrega (opcional)<input id="brumaCustomerReferences" type="text" maxlength="160" placeholder="Entre calles, color de fachada, etc."></label>       </div>       <small>El código postal será el mismo que utilizaste para cotizar el envío.</small>     </section><div class="bruma-cart-total"><span>Total</span><strong id="brumaCartTotal">$0 MXN</strong></div><button type="button" class="bruma-cart-whatsapp" id="brumaCartWhatsapp">Enviar pedido por WhatsApp</button><button type="button" class="bruma-cart-pay" id="brumaCartPay" aria-describedby="brumaPayNote" disabled>Pagar productos + envío con Mercado Pago</button><p class="bruma-cart-note" id="brumaPayNote">Calcula el envío y selecciona una paquetería para habilitar el pago.</p><p class="bruma-cart-notice" id="brumaCartNotice" hidden aria-live="polite"></p>';
    document.body.appendChild(dialog);
    launcher.addEventListener("click",abrirCarrito);
    document.getElementById("brumaCartClose").addEventListener("click",function(){dialog.close();});
    dialog.addEventListener("click",function(e){if(e.target===dialog)dialog.close();});
    dialog.addEventListener("click",function(e){
      var b=e.target.closest("[data-cart-action]");if(!b)return;
      var n=Number(b.dataset.num),x=carrito.find(function(i){return i.num===n;});if(!x)return;
      if(b.dataset.cartAction==="mas")x.cantidad++;
      if(b.dataset.cartAction==="menos")x.cantidad--;
      if(b.dataset.cartAction==="quitar"||x.cantidad<=0)carrito=carrito.filter(function(i){return i.num!==n;});
      guardarCarrito();renderCarrito();
    });
    document.getElementById("brumaQuoteShipping").addEventListener("click", async function(){
      var input=document.getElementById("brumaZipCode");
      var zip=String(input.value||"").replace(/\D/g,"");
      var optionsBox=document.getElementById("brumaShippingOptions");
      var notice=document.getElementById("brumaCartNotice");
      if(!/^\d{5}$/.test(zip)){optionsBox.innerHTML="";envioSeleccionado=null;renderCarrito();if(notice){notice.hidden=false;notice.textContent="Escribe un código postal válido de 5 dígitos.";}return;}
      var btn=this;btn.disabled=true;btn.textContent="Cotizando…";optionsBox.textContent="Consultando tarifas disponibles…";
      try{
        var response=await fetch("/api/pakke-rates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({zipCode:zip})});
        var data=await response.json();
        if(!response.ok||!Array.isArray(data.options))throw new Error(data.error||"No pudimos obtener tarifas de Pakke.");
        var paqueteriasPermitidas = ["fedex", "estafeta", "dhl"];
        var opcionesFiltradas = data.options.filter(function(o) {
          var nombre = String(o.courierName || "").toLowerCase();
          return paqueteriasPermitidas.some(function(p) {
            return nombre.includes(p);
          });
        });
        opcionesEnvio = paqueteriasPermitidas.map(function(p) {
          var servicios = opcionesFiltradas.filter(function(o) {
            return String(o.courierName || "").toLowerCase().includes(p);
          });
          if (!servicios.length) return null;
          return servicios.reduce(function(menor, actual) {
            return Number(actual.price) < Number(menor.price) ? actual : menor;
          });
        }).filter(function(o) {
          return o !== null;
        });
        codigoPostalCotizado = zip;
        envioSeleccionado = null;
        optionsBox.innerHTML=opcionesEnvio.map(function(o,i){
          return '<label class="bruma-shipping-option"><input type="radio" name="brumaShippingChoice" value="'+i+'"><span><strong>'+esc(o.courierName)+' · '+esc(o.serviceName)+'</strong><small>'+(o.deliveryDays?esc(o.deliveryDays)+" · ":"")+dinero(o.price)+'</small></span></label>';
        }).join("");
        optionsBox.querySelectorAll('input[name="brumaShippingChoice"]').forEach(function(radio){
          radio.addEventListener("change",function(){
            envioSeleccionado=opcionesEnvio[Number(this.value)];
            var payNote=document.getElementById("brumaPayNote");
            if(payNote)payNote.textContent="Envío seleccionado. El importe se verificará nuevamente con Pakke antes de abrir Mercado Pago.";
            renderCarrito();
          });
        });
        if(notice){notice.hidden=false;notice.textContent="Elige la paquetería que prefieras para continuar.";}
      }catch(error){
        console.error("Bruma Pakke quote error:", error && error.name, error && error.message);
        optionsBox.textContent="";
        if(notice){notice.hidden=false;notice.textContent="Error al cotizar ("+(error && error.name ? error.name : "Error")+"): "+(error && error.message ? error.message : "No se pudo obtener respuesta del servidor.");}
      }finally{btn.disabled=false;btn.textContent="Cotizar envío";}
    });
    document.getElementById("brumaZipCode").addEventListener("input",function(){
      if(String(this.value).replace(/\D/g,"")!==codigoPostalCotizado){envioSeleccionado=null;opcionesEnvio=[];document.getElementById("brumaShippingOptions").innerHTML="";renderCarrito();}
    });
    document.getElementById("brumaCartWhatsapp").addEventListener("click",function(){
      if(!carrito.length)return;
      var lineas=carrito.map(function(x){return "• "+x.cantidad+" × "+x.nombre+" (N.º "+num2(x.num)+") — "+dinero(x.precio*x.cantidad);});
      var mensaje="Hola Bruma Scent, quiero realizar este pedido:\n\n"+lineas.join("\n")+"\n\nTotal: "+dinero(totalCarrito())+"\n¿Me confirmas disponibilidad y opciones de entrega?";
      window.open("https://wa.me/"+String(CONFIG.whatsapp||"528115888283").replace(/\D/g,"")+"?text="+encodeURIComponent(mensaje),"_blank","noopener");
    });
    document.getElementById("brumaCartPay").addEventListener("click", async function(){
      if(!carrito.length) return;
      var boton=this;
      var aviso=document.getElementById("brumaCartNotice");
      var nombreCliente=String(document.getElementById("brumaCustomerName").value||"").trim().replace(/\s+/g," ");
      var partesNombre=nombreCliente.split(" ");
      var correoCliente=String(document.getElementById("brumaCustomerEmail").value||"").trim();
      var telefonoCliente=String(document.getElementById("brumaCustomerPhone").value||"").replace(/\D/g,"");
      var calleCliente=String(document.getElementById("brumaCustomerStreet").value||"").trim();
      var numeroCliente=String(document.getElementById("brumaCustomerNumber").value||"").trim();
      var coloniaCliente=String(document.getElementById("brumaCustomerNeighborhood").value||"").trim();
      var ciudadCliente=String(document.getElementById("brumaCustomerCity").value||"").trim();
      var estadoCliente=String(document.getElementById("brumaCustomerState").value||"").trim();
      var referenciasCliente=String(document.getElementById("brumaCustomerReferences").value||"").trim();
      if(partesNombre.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoCliente) || telefonoCliente.length!==10 || !calleCliente || !numeroCliente || !coloniaCliente || !ciudadCliente || !estadoCliente){
        if(aviso){aviso.hidden=false;aviso.textContent="Completa tus datos: nombre y apellidos, correo válido, celular de 10 dígitos y domicilio.";}
        document.getElementById("brumaCustomerBox").scrollIntoView({behavior:"smooth",block:"center"});
        return;
      }
      var customerData={
        firstName:partesNombre.shift(),lastName:partesNombre.join(" "),email:correoCliente,phone:telefonoCliente,
        street:calleCliente,streetNumber:numeroCliente,neighborhood:coloniaCliente,city:ciudadCliente,state:estadoCliente,references:referenciasCliente
      };
      boton.disabled=true; boton.textContent="Conectando con Mercado Pago…";
      if(aviso){aviso.hidden=false;aviso.textContent="Estamos preparando tu pago seguro.";}
      try {
        if(!envioSeleccionado || !codigoPostalCotizado) throw new Error("Primero calcula y selecciona una paquetería para tu envío.");
        var respuesta=await fetch("/api/create-order",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            items:carrito.map(function(x){return {num:x.num,quantity:x.cantidad};}),
            shipping:{zipCode:codigoPostalCotizado,courierCode:envioSeleccionado.courierCode,serviceId:envioSeleccionado.serviceId},
            customer:customerData
          })
        });
        var datos=await respuesta.json();
        if(!respuesta.ok || !datos.checkout_url) throw new Error(datos.error || ("No se pudo iniciar el pago (HTTP "+respuesta.status+")."));
        var destino;
        try { destino=new URL(datos.checkout_url); } catch(_) { throw new Error("Mercado Pago respondió con un enlace de pago no válido. Estamos revisando la conexión."); }
        var host=destino.hostname.toLowerCase();
        var dominioSeguro=["mercadopago.com.mx","mercadopago.com"].some(function(d){return host===d || host.endsWith("."+d);});
        if(destino.protocol!=="https:" || !dominioSeguro) throw new Error("El enlace recibido no pertenece a Mercado Pago. No continúes; estamos revisándolo.");
        window.location.assign(destino.href);
      } catch(error) {
        if(aviso){aviso.hidden=false;aviso.textContent=error.message || "No se pudo conectar con Mercado Pago. Intenta de nuevo.";}
        boton.disabled=false;boton.textContent="Pagar en línea con Mercado Pago";
      }
    });
    renderCarrito();
  }
  var fichaAdd=document.createElement("button");
  fichaAdd.type="button";fichaAdd.id="fichaAgregarCarrito";fichaAdd.className="btn btn-ancho bruma-add-cart";
  fichaAdd.textContent="Agregar al carrito";
  var fichaPedirEl=document.getElementById("fichaPedir");
  if(fichaPedirEl && fichaPedirEl.parentNode) fichaPedirEl.parentNode.insertBefore(fichaAdd,fichaPedirEl);
  fichaAdd.addEventListener("click",function(){
    var m=String(document.getElementById("fichaNum").textContent).match(/\d+/);
    if(m){agregarAlCarrito(Number(m[0]));abrirCarrito();}
  });
  crearCarrito();

  /* ---------- preguntas ---------- */
  function pintarPreguntas() {
    if (!$("#faq")) return;
    $("#faq").innerHTML = (window.PREGUNTAS || []).map(function (q) {
      return '<details><summary>' + esc(q.p) + '</summary><p>' + esc(q.r) + '</p></details>';
    }).join("");
  }

  /* ---------- Navidad Bruma Scent: nieve interactiva y aromas de invierno ---------- */
  function activarNavidad() {
    document.body.classList.add("navidad-season");
    if (!document.getElementById("navidadBar")) {
      var bar = document.createElement("aside");
      bar.id = "navidadBar";
      bar.className = "navidad-bar";
      bar.innerHTML = '<span class="navidad-sparkle" aria-hidden="true">✦</span><span class="navidad-copy"><strong>BRUMA SCENT · CHRISTMAS EDITION</strong><small>Una temporada para envolverlo todo en aroma.</small></span><button type="button" class="navidad-magic" id="navidadMagic" aria-pressed="false">❄ Crear magia</button><span class="navidad-sparkle navidad-sparkle-end" aria-hidden="true">✧</span>';
      document.body.insertBefore(bar, document.body.firstChild);
      var magic = document.getElementById("navidadMagic");
      magic.addEventListener("click", function () {
        var activo = magic.getAttribute("aria-pressed") !== "true";
        magic.setAttribute("aria-pressed", String(activo));
        magic.textContent = activo ? "✧ Magia activada" : "❄ Crear magia";
        document.body.classList.toggle("navidad-nieve-activa", activo);
        if (activo) {
          var symbols = ["❄", "✦", "✧", "❅", "✶", "❄", "✧", "❅"];
          for (var i = 0; i < 34; i++) {
            var particle = document.createElement("span");
            particle.className = "navidad-particle";
            particle.textContent = symbols[i % symbols.length];
            particle.style.left = (2 + Math.random() * 96) + "%";
            particle.style.animationDelay = (Math.random() * 2.2) + "s";
            particle.style.animationDuration = (5.5 + Math.random() * 5) + "s";
            particle.style.fontSize = (12 + Math.random() * 20) + "px";
            particle.style.color = ["#fffaf0", "#e4d3a3", "#d5e8e4"][i % 3];
            particle.style.setProperty("--drift", ((Math.random() * 100) - 50) + "px");
            document.body.appendChild(particle);
            window.setTimeout(function (node) { if (node.parentNode) node.parentNode.removeChild(node); }, 11500, particle);
          }
        }
      });
    }
  }

  var AROMAS_INVIERNO = [
    {num:64, tipo:"Dulces y envolventes", etiqueta:"Vainilla · gamuza · incienso", mood:"El abrazo de invierno"},
    {num:34, tipo:"Dulces y envolventes", etiqueta:"Rosa · praliné · vainilla", mood:"Noche de celebración"},
    {num:51, tipo:"Dulces y envolventes", etiqueta:"Caramelo · pistacho · sándalo", mood:"Dulzura sofisticada"},
    {num:130, tipo:"Intensos y misteriosos", etiqueta:"Tabaco · vainilla · cacao", mood:"Noche junto a la chimenea"},
    {num:139, tipo:"Intensos y misteriosos", etiqueta:"Mirra · oud · pachulí", mood:"Lujo profundo"},
    {num:121, tipo:"Intensos y misteriosos", etiqueta:"Canela · cuero · tabaco", mood:"Una estela inolvidable"},
    {num:43, tipo:"Elegantes y suaves", etiqueta:"Lavanda · vainilla · sándalo", mood:"Elegancia de cashmere"},
    {num:116, tipo:"Elegantes y suaves", etiqueta:"Benjuí · ámbar · maderas", mood:"Luz dorada"},
    {num:55, tipo:"Elegantes y suaves", etiqueta:"Té matcha · higo · cedro", mood:"Invierno minimalista"},
    {num:155, tipo:"Dulces y envolventes", etiqueta:"Azafrán · miel · vainilla · haba tonka", mood:"El lujo de las noches de invierno"},
    {num:156, tipo:"Elegantes y suaves", etiqueta:"Lavanda · azahar · vainilla · almizcle", mood:"Un clásico para cualquier ocasión"},
    {num:157, tipo:"Dulces y envolventes", etiqueta:"Kiwi · lichi · chocolate blanco · quequito", mood:"Dulzura divertida"},
    {num:158, tipo:"Dulces y envolventes", etiqueta:"Vainilla bourbon · jazmín · benjuí", mood:"Noche magnética"},
    {num:159, tipo:"Elegantes y suaves", etiqueta:"Amapola · iris · higo · haba tonka", mood:"Flores aterciopeladas"},
    {num:160, tipo:"Intensos y misteriosos", etiqueta:"Canela · oud · pimienta rosa · vetiver", mood:"Maderas especiadas"},
    {num:161, tipo:"Intensos y misteriosos", etiqueta:"Whisky · castaña · iris · cedro", mood:"Elegancia de invierno"},
    {num:162, tipo:"Elegantes y suaves", etiqueta:"Jengibre · cardamomo · azahar · pachulí", mood:"Frescura especiada"}
  ];

  function pintarAromasInvierno(filtro) {
    var grid = $("#inviernoGrid");
    if (!grid) return;
    var tipo = filtro || "Todos";
    var seleccion = AROMAS_INVIERNO.filter(function (x) { return tipo === "Todos" || x.tipo === tipo; });
    grid.innerHTML = seleccion.map(function (x) {
      var p = PERFUMES.find(function (o) { return o.num === x.num; });
      if (!p) return "";
      return '<article class="invierno-card"><button type="button" class="invierno-card-btn" data-invierno-num="' + p.num + '" aria-label="Ver ' + esc(p.nombre) + '"><span class="invierno-card-top"><span class="invierno-num">N.º ' + num2(p.num) + '</span><span class="invierno-flake" aria-hidden="true">✦</span></span><span class="invierno-bottle" style="--tono:' + tono(p) + '"><img src="img/botella-neutra.webp" alt="" loading="lazy"><i></i></span><span class="invierno-mood">' + esc(x.mood) + '</span><strong>' + esc(p.nombre) + '</strong><span class="invierno-notes">' + esc(x.etiqueta) + '</span><span class="invierno-card-link">Descubrir aroma ↗</span></button></article>';
    }).join("");
    document.querySelectorAll("[data-invierno-filtro]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.inviernoFiltro === tipo));
    });
  }
  activarNavidad();
  activarPromoBuenFin();
  pintarAromasInvierno("Todos");
  var inviernoFiltros = $("#inviernoFiltros");
  if (inviernoFiltros) inviernoFiltros.addEventListener("click", function (e) {
    var b = e.target.closest("[data-invierno-filtro]");
    if (b) pintarAromasInvierno(b.dataset.inviernoFiltro);
  });
  var inviernoGrid = $("#inviernoGrid");
  if (inviernoGrid) inviernoGrid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-invierno-num]");
    if (b) abrir(b.dataset.inviernoNum);
  });


  /* ---------- buscador de gustos olfativos ---------- */
  var BUSQUEDA_GUSTOS = {
    dulce: ["dulce","gourmand","vainilla","caramelo","praline","praliné","chocolate","miel","tonka","quequito","pastel","cremoso","crema","azucar","azúcar"],
    fresco: ["fresco","fresca","cítrico","citrico","bergamota","limon","limón","mandarina","naranja","toronja","jengibre","acuatico","acuático","marino"],
    floral: ["floral","florales","rosa","jazmin","jazmín","azahar","lavanda","iris","violeta","orquidea","orquídea","tuberosa","peonia","peonía"],
    vainilla: ["vainilla","cremoso","cremosa","tonka","benjui","benjuí","leche","almendra","avainillado"],
    amaderado: ["madera","amaderado","amaderada","oud","sándalo","sandalo","cedro","vetiver","pachuli","pachulí","guayaco","incienso","cuero"],
    ambar: ["ámbar","ambar","ambarado","resina","mirra","labdanum","benjui","benjuí","balsamico","balsámico"],
    especiado: ["especiado","especiada","canela","pimienta","cardamomo","azafran","azafrán","clavo","nuez moscada","whisky","tabaco"],
    limpio: ["limpio","limpia","suave","almizcle","musk","algodon","algodón","jabón","jabon","talco","aireado","transparente"],
    frutal: ["frutal","frutales","fruta","frutas","frambuesa","pera","manzana","kiwi","lichi","litchi","membrillo","higo","cassis","grosella","durazno","melocoton","melocotón"]
  };
  var GUSTOS_SELECCIONADOS = [];
  function prepararTextoPerfume(p) {
    return [p.nombre,p.marca,p.inspiradoEn,p.familia,p.ocasion,p.descripcion].concat(p.destacadas||[],p.salida||[],p.corazon||[],p.fondo||[]).join(" ").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"");
  }
  function tokensDeGusto(texto) {
    var limpio=String(texto||"").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"");
    var encontrados=[];
    Object.keys(BUSQUEDA_GUSTOS).forEach(function(clave){
      var sinonimos=BUSQUEDA_GUSTOS[clave];
      if(sinonimos.some(function(palabra){return limpio.indexOf(palabra.normalize("NFD").replace(/\p{Diacritic}/gu,""))>=0;})) encontrados.push(clave);
    });
    return encontrados;
  }
  function buscarMiAroma(texto,genero) {
    var gustos=GUSTOS_SELECCIONADOS.concat(tokensDeGusto(texto)).filter(function(v,i,a){return a.indexOf(v)===i;});
    var palabras=String(texto||"").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").split(/[^a-z0-9]+/).filter(function(w){return w.length>3;});
    var resultados=PERFUMES.filter(function(p){return p.disponible!==false&&!esAmbiental(p)&&(genero==="todos"||generoDe(p)===genero||((genero==="mujer"||genero==="hombre")&&generoDe(p)==="unisex"));}).map(function(p){
      var corpus=prepararTextoPerfume(p).normalize("NFD").replace(/\p{Diacritic}/gu,"");
      var puntos=0,razones=[];
      gustos.forEach(function(g){
        var hits=BUSQUEDA_GUSTOS[g].filter(function(w){return corpus.indexOf(w.normalize("NFD").replace(/\p{Diacritic}/gu,""))>=0;});
        if(hits.length){puntos+=Math.min(hits.length,3)*2;razones.push(hits.slice(0,2).join(" y "));}
      });
      palabras.forEach(function(w){if(corpus.indexOf(w)>=0)puntos+=1;});
      return {p:p,puntos:puntos,razones:razones};
    }).filter(function(x){return x.puntos>0;}).sort(function(a,b){return b.puntos-a.puntos;}).slice(0,6);
    return {gustos:gustos,resultados:resultados};
  }
  var formularioGustos=$("#buscadorPerfume");
  if(formularioGustos){
    var chipsGustos=$("#gustoChips");
    chipsGustos.addEventListener("click",function(e){
      var b=e.target.closest("[data-gusto]");if(!b)return;
      var g=b.dataset.gusto,idx=GUSTOS_SELECCIONADOS.indexOf(g);
      if(idx>=0)GUSTOS_SELECCIONADOS.splice(idx,1);else GUSTOS_SELECCIONADOS.push(g);
      b.setAttribute("aria-pressed",String(GUSTOS_SELECCIONADOS.indexOf(g)>=0));
    });
    formularioGustos.addEventListener("submit",function(e){
      e.preventDefault();
      var texto=$("#gustoTexto").value, genero=$("#gustoGenero").value, datos=buscarMiAroma(texto,genero),dest=$("#resultadoGustos");
      if(!datos.gustos.length&&!String(texto).trim()){
        dest.innerHTML='<div class="resultado-vacio">Cuéntanos qué notas o estilos disfrutas, o selecciona al menos una de las opciones para encontrar tus aromas.</div>';return;
      }
      if(!datos.resultados.length){
        dest.innerHTML='<div class="resultado-vacio">Aún no encontramos coincidencias claras. Prueba con otras notas o sensaciones, por ejemplo: vainilla, cítricos, flores, maderas o aromas dulces.</div>';return;
      }
      dest.innerHTML='<h3 class="resultado-titulo">Estas inspiraciones podrían encantarte</h3><p class="resultado-sub">Encontramos '+datos.resultados.length+' coincidencias en nuestro catálogo según tus preferencias.</p><div class="resultado-grid">'+datos.resultados.map(function(x){
        var p=x.p,razon=x.razones.length?'Coincide contigo por: '+x.razones.join(', '):'Tiene notas y descripciones relacionadas con lo que escribiste.';
        return '<article class="resultado-card"><span class="resultado-num">BRUMA SCENT · N.º '+num2(p.num)+'</span><h3>'+esc(p.nombre)+'</h3><span class="resultado-marca">'+esc(p.marca||"")+'</span><p class="resultado-match">'+esc(razon)+'</p><button type="button" class="resultado-link" data-gusto-num="'+p.num+'">Ver notas y detalles ↗</button></article>';
      }).join("")+'</div>';
      dest.querySelectorAll("[data-gusto-num]").forEach(function(b){b.addEventListener("click",function(){abrir(b.dataset.gustoNum);});});
      dest.scrollIntoView({behavior:"smooth",block:"nearest"});
    });
  }


  /* ---------- Promoción especial Buen Fin Bruma Scent ---------- */
  function activarPromoBuenFin() {
    if (estado.genero === "hogar" || document.getElementById("promoBuenFin")) return;
    var bar = document.createElement("aside");
    bar.id = "promoBuenFin";
    bar.className = "promo-buenfin";
    bar.setAttribute("aria-label", "Promoción especial Buen Fin Bruma Scent");
    bar.innerHTML = '<div class="promo-buenfin-inner"><span class="promo-buenfin-kicker">BRUMA SCENT · ESPECIAL BUEN FIN</span><strong class="promo-buenfin-price">3 PERFUMES POR <b>$600</b></strong><span class="promo-buenfin-dates">12 AL 16 DE NOVIEMBRE</span><span class="promo-buenfin-note">Arma tu trío de aromas favoritos · No aplica en aromatizantes navideños</span><a class="promo-buenfin-cta" href="mujer.html">Elegir mis perfumes ↗</a></div>';
    var seasonal = document.getElementById("navidadBar");
    if (seasonal && seasonal.parentNode) seasonal.parentNode.insertBefore(bar, seasonal.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
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
