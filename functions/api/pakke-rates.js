// Cloudflare Pages Function: cotización de envíos Pakke para Bruma Scent
const ALLOWED_ORIGINS = new Set([
  "https://brumascent-com.pages.dev",
  "https://brumascent.com",
  "https://www.brumascent.com"
]);
const ZIP_ORIGEN = "64988";
function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://brumascent-com.pages.dev",
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
  if (!env.PAKKE_API_KEY) return reply({ error: "Falta configurar PAKKE_API_KEY en Cloudflare." }, 500, origin);
  let body;
  try { body = await request.json(); } catch (_) { return reply({ error: "Solicitud inválida." }, 400, origin); }
  const zip = String(body.zipCode || "").replace(/\D/g, "");
  if (!/^\d{5}$/.test(zip)) return reply({ error: "Escribe un código postal mexicano de 5 dígitos." }, 400, origin);
  let response;
  try {
    response = await fetch("https://seller.pakke.mx/api/v1/Shipments/rates", {
      method: "POST",
      headers: {
        "Authorization": env.PAKKE_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        ZipCodeFrom: ZIP_ORIGEN,
        ZipCodeTo: zip,
        Parcel: { Weight: 1, Width: 10, Height: 10, Length: 10 },
        CouponCode: "",
        InsuredAmount: 0
      })
    });
  } catch (_) {
    return reply({ error: "No pudimos conectar con Pakke. Intenta de nuevo." }, 502, origin);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Pakke rates error", response.status, data);
    const upstreamError = data && (data.message || data.error?.message || data.details || data.error?.details || data.error);
    const safeDetail = typeof upstreamError === "string" ? upstreamError : "";
    return reply({
      error: "Pakke rechazó la cotización (HTTP " + response.status + ").",
      detail: safeDetail.slice(0, 240) || "La respuesta de Pakke no incluyó una explicación legible."
    }, 502, origin);
  }
  const rates = Array.isArray(data.Pakke) ? data.Pakke : [];
  const options = rates.filter(r => Number(r.TotalPrice) >= 0 && r.CourierCode && r.CourierServiceId).map(r => ({
    courierCode: String(r.CourierCode),
    courierName: String(r.CourierName || r.CourierCode),
    serviceId: String(r.CourierServiceId),
    serviceName: String(r.CourierServiceName || "Servicio de envío"),
    deliveryDays: String(r.DeliveryDays || ""),
    price: Number(r.TotalPrice),
    bestOption: Boolean(r.BestOption)
  })).sort((a, b) => a.price - b.price);
  if (!options.length) return reply({ error: "Pakke no encontró servicios disponibles para ese código postal." }, 404, origin);
  return reply({ options }, 200, origin);
}
