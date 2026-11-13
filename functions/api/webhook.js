// Cloudflare Pages Function: Mercado Pago Orders webhook
// Configura MP_WEBHOOK_SECRET como Secret en Cloudflare Pages.
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(request, dataId, secret) {
  const signature = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  const parts = Object.fromEntries(signature.split(",").map(part => {
    const index = part.indexOf("=");
    return index < 0 ? ["", ""] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }));
  if (!parts.ts || !parts.v1 || !dataId) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const expected = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  return constantTimeEqual(expected, parts.v1.toLowerCase());
}

export async function onRequestPost({ request, env }) {
  if (!env.MP_ACCESS_TOKEN || !env.MP_WEBHOOK_SECRET || !env.DB) {
    console.error("Webhook sin configuración requerida.");
    return json({ error: "Configuración incompleta." }, 500);
  }

  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  if (body.type !== "order" && url.searchParams.get("type") !== "order") {
    return json({ received: true, ignored: true });
  }

  const orderId = String(url.searchParams.get("data.id") || body.data?.id || "");
  if (!orderId) return json({ error: "Falta el identificador de la order." }, 400);

  const valid = await verifySignature(request, orderId, env.MP_WEBHOOK_SECRET);
  if (!valid) return json({ error: "Firma no válida." }, 401);

  // Consultamos la order directamente en Mercado Pago; no confiamos en el estado del webhook.
  const mpResponse = await fetch("https://api.mercadopago.com/v1/orders/" + encodeURIComponent(orderId), {
    headers: { "Authorization": "Bearer " + env.MP_ACCESS_TOKEN }
  });
  if (!mpResponse.ok) {
    console.error("No se pudo consultar la order de Mercado Pago:", mpResponse.status);
    return json({ error: "No se pudo verificar la order." }, 502);
  }

  const order = await mpResponse.json();
  const reference = String(order.external_reference || "");
  if (!reference.startsWith("BRUMA-")) return json({ received: true, ignored: true });

  const status = String(order.status || "").toLowerCase();
  let localStatus = "";
  if (status === "processed") localStatus = "pagado";
  else if (status === "canceled" || status === "cancelled") localStatus = "cancelado";
  else if (status === "expired") localStatus = "vencido";
  else if (status === "created" || status === "pending" || status === "action_required") localStatus = "pendiente";

  if (localStatus) {
    await env.DB.prepare(
      "UPDATE pedidos SET estado = ?, mercado_pago_id = ? WHERE referencia = ?"
    ).bind(localStatus, orderId, reference).run();
  }

  return json({ received: true });
}

export async function onRequestGet() {
  return json({ service: "Bruma Scent Mercado Pago webhook", ready: true });
}
