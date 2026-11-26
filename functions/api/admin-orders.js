// Panel privado de pedidos Bruma Scent.
// Requiere configurar ADMIN_PANEL_PASSWORD como Secret en Cloudflare Pages.
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Pragma": "no-cache"
    }
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_PANEL_PASSWORD) {
    return json({ error: "Falta configurar la contraseña del panel en Cloudflare." }, 503);
  }
  const supplied = request.headers.get("x-admin-password") || "";
  const expected = String(env.ADMIN_PANEL_PASSWORD);
  if (!supplied || supplied.length !== expected.length) {
    return json({ error: "Contraseña incorrecta." }, 401);
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return json({ error: "Contraseña incorrecta." }, 401);
  if (!env.DB) return json({ error: "La base de datos de pedidos no está disponible." }, 503);

  try {
    const result = await env.DB.prepare(
      "SELECT id, referencia, mercado_pago_id, estado, nombre, correo, telefono, calle, numero_exterior, colonia, ciudad, estado_domicilio, codigo_postal, referencias_entrega, productos, paqueteria, envio, total, fecha FROM pedidos ORDER BY fecha DESC LIMIT 200"
    ).all();
    return json({ pedidos: result.results || [] });
  } catch (error) {
    console.error("Error consultando pedidos para panel:", error && error.message ? error.message : "Error D1");
    return json({ error: "No se pudieron consultar los pedidos. Verifica la tabla pedidos en D1." }, 500);
  }
}
