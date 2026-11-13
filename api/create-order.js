import { onRequestPost, onRequestOptions } from "../functions/api/create-order.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const env = {
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN
  };

  if (request.method === "OPTIONS") {
    return onRequestOptions({ request });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  return onRequestPost({ request, env });
}
