// Cloudflare Pages Function: Mercado Pago Checkout Pro Orders
const CATALOG = [{"num":13,"name":"Cosmic 2.0","price":250,"available":true},{"num":17,"name":"Divine Elixir","price":250,"available":true},{"num":18,"name":"Divine Le Parfum","price":250,"available":true},{"num":25,"name":"Bamboo","price":250,"available":true},{"num":26,"name":"Happy","price":250,"available":true},{"num":27,"name":"Idôle","price":250,"available":true},{"num":28,"name":"Idôle Peach N Roses","price":250,"available":true},{"num":29,"name":"Irresistible","price":250,"available":true},{"num":31,"name":"La Belle Fleur Terrible","price":250,"available":true},{"num":32,"name":"La Belle Paradise Garden","price":250,"available":true},{"num":34,"name":"La Nuit Trésor","price":250,"available":true},{"num":37,"name":"Libre Platine","price":250,"available":true},{"num":39,"name":"L'Interdit","price":250,"available":true},{"num":42,"name":"Love, Don't Be Shy","price":250,"available":true},{"num":43,"name":"Mon Guerlain","price":250,"available":true},{"num":45,"name":"Miss Dior Essence","price":250,"available":true},{"num":47,"name":"My Way Nectar","price":250,"available":true},{"num":48,"name":"Palatine","price":250,"available":true},{"num":49,"name":"Paradoxe Radical","price":250,"available":true},{"num":51,"name":"Rare","price":250,"available":true},{"num":52,"name":"Red Roses","price":250,"available":true},{"num":53,"name":"Scandal Le Parfum","price":250,"available":true},{"num":54,"name":"Sì","price":250,"available":true},{"num":55,"name":"Thé Matcha 26","price":250,"available":true},{"num":56,"name":"White Suede","price":250,"available":true},{"num":58,"name":"Valentino Donna","price":250,"available":true},{"num":59,"name":"Born in Roma Extradose","price":250,"available":true},{"num":60,"name":"Born in Roma Green","price":250,"available":true},{"num":61,"name":"Very Good Girl","price":250,"available":true},{"num":62,"name":"Wicked For Good","price":250,"available":true},{"num":63,"name":"Wood Sage & Sea Salt","price":250,"available":true},{"num":64,"name":"Babycat","price":250,"available":true},{"num":65,"name":"Purple Melancholia","price":250,"available":true},{"num":101,"name":"Afternoon Swim","price":250,"available":true},{"num":102,"name":"Perseus","price":250,"available":true},{"num":103,"name":"Layton Exclusif","price":250,"available":true},{"num":104,"name":"Blu Mediterraneo","price":250,"available":true},{"num":105,"name":"Jasmine Coast","price":250,"available":true},{"num":106,"name":"Virgin Island Water","price":250,"available":true},{"num":107,"name":"Pacific Chill","price":250,"available":true},{"num":108,"name":"Royal Mayfair","price":250,"available":true},{"num":109,"name":"Eros Flame","price":250,"available":true},{"num":110,"name":"L'Immensité","price":250,"available":true},{"num":111,"name":"Imagination","price":250,"available":true},{"num":112,"name":"Sauvage","price":250,"available":true},{"num":113,"name":"Odyssey Mandarin Sky","price":250,"available":true},{"num":114,"name":"Y","price":250,"available":true},{"num":115,"name":"One Million Elixir","price":250,"available":true},{"num":116,"name":"Paradigme","price":250,"available":true},{"num":118,"name":"Acqua di Giò","price":250,"available":true},{"num":119,"name":"Armani Code","price":250,"available":true},{"num":120,"name":"Valentino Uomo","price":250,"available":true},{"num":121,"name":"Spicebomb Dark Leather","price":250,"available":true},{"num":122,"name":"Man in Black","price":250,"available":true},{"num":123,"name":"Aventus","price":250,"available":true},{"num":124,"name":"Another 13","price":250,"available":true},{"num":125,"name":"Baccarat Rouge 540","price":250,"available":true},{"num":126,"name":"Dior Homme Intense","price":250,"available":true},{"num":127,"name":"MYSLF Le Parfum","price":250,"available":true},{"num":128,"name":"Bleu de Chanel","price":250,"available":true},{"num":129,"name":"Dylan Blue","price":250,"available":true},{"num":130,"name":"Tobacco Vanille","price":250,"available":true},{"num":131,"name":"Tobacco Oud","price":250,"available":true},{"num":132,"name":"Invictus Victory","price":250,"available":true},{"num":133,"name":"Ombre Nomade","price":250,"available":true},{"num":134,"name":"Ombre Leather","price":250,"available":true},{"num":135,"name":"Ultra Male","price":250,"available":true},{"num":136,"name":"Polo Blue","price":250,"available":true},{"num":137,"name":"Cinque Terre","price":250,"available":true},{"num":138,"name":"Dioriviera","price":250,"available":true},{"num":139,"name":"Myrrhe 55","price":250,"available":true},{"num":140,"name":"Valentino Uomo Intense","price":250,"available":true},{"num":141,"name":"Born in Roma Coral Fantasy","price":250,"available":true},{"num":142,"name":"Terre d'Hermès","price":250,"available":true},{"num":143,"name":"Luna Rossa Carbon","price":250,"available":true},{"num":144,"name":"Armani Code Parfum","price":250,"available":true},{"num":145,"name":"Invictus","price":250,"available":true},{"num":146,"name":"Allure Homme Sport","price":250,"available":true},{"num":147,"name":"F*cking Fabulous","price":250,"available":true},{"num":148,"name":"Ralph's Club New York","price":250,"available":true},{"num":149,"name":"Ginger Biscuit","price":250,"available":true},{"num":150,"name":"Spicebomb Extreme","price":250,"available":true},{"num":152,"name":"Wood Sage & Sea Salt","price":250,"available":true},{"num":201,"name":"Cuento de Navidad","price":350,"available":true},{"num":202,"name":"Christmas Tree","price":350,"available":true},{"num":153,"name":"212 VIP Rosé","price":250,"available":true},{"num":154,"name":"Jasmine Coast","price":250,"available":true},{"num":155,"name":"Libre Le Parfum","price":250,"available":true},{"num":156,"name":"Libre Eau de Parfum","price":250,"available":true},{"num":157,"name":"Fantasy","price":250,"available":true},{"num":158,"name":"Donna Born In Roma Intense","price":250,"available":true},{"num":159,"name":"Scarlet Poppy Intense","price":250,"available":true},{"num":160,"name":"Polo Supreme Oud","price":250,"available":true},{"num":161,"name":"Gentleman Eau de Parfum Réserve Privée","price":250,"available":true},{"num":162,"name":"MYSLF L'Absolu","price":250,"available":true}];
const ALLOWED_ORIGINS = new Set([
  "https://brumascent-com.pages.dev",
  "https://brumascent.com",
  "https://www.brumascent.com"
]);
function cors(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://brumascent-com.pages.dev";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function reply(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) }
  });
}
export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request.headers.get("Origin") || "") });
}
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.has(origin)) return reply({ error: "Origen no autorizado." }, 403, origin);
  if (!env.MP_ACCESS_TOKEN) return reply({ error: "Falta configurar MP_ACCESS_TOKEN en Cloudflare." }, 500, origin);
  let body;
  try { body = await request.json(); } catch (_) { return reply({ error: "Solicitud inválida." }, 400, origin); }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return reply({ error: "El carrito está vacío o contiene demasiados productos." }, 400, origin);
  }
  const items = [];
  for (const row of body.items) {
    const product = CATALOG.find(p => p.num === Number(row.num));
    const quantity = Number(row.quantity);
    if (!product || !product.available || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return reply({ error: "Hay un producto o cantidad no válida en tu carrito. Actualiza la página e inténtalo de nuevo." }, 400, origin);
    }
    items.push({
      title: product.name,
      quantity,
      unit_price: product.price.toFixed(2)
    });
  }
  const total = items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);
  const idempotencyKey = crypto.randomUUID();
  const payload = {
    type: "online",
    processing_mode: "manual",
    capture_mode: "automatic_async",
    total_amount: total.toFixed(2),
    external_reference: "BRUMA-" + crypto.randomUUID(),
    description: "Pedido en línea Bruma Scent",
    items
  };
  let mpResponse;
  try {
    mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.MP_ACCESS_TOKEN,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(payload)
    });
  } catch (_) {
    return reply({ error: "No pudimos conectar con Mercado Pago. Intenta de nuevo." }, 502, origin);
  }
  const result = await mpResponse.json().catch(() => ({}));
  if (!mpResponse.ok || !result.checkout_url) {
    console.error("Mercado Pago order error", mpResponse.status, result);
    return reply({ error: "Mercado Pago no pudo crear el pago. Revisa la configuración e inténtalo de nuevo." }, 502, origin);
  }
  return reply({ checkout_url: result.checkout_url, order_id: result.id }, 200, origin);
}
