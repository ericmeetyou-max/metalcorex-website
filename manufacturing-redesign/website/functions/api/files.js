const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });

const requireAdmin = (request, env) => {
  const expected = env.ADMIN_TOKEN;

  if (!expected) {
    return false;
  }

  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${expected}`;
};

export async function onRequestGet({ request, env }) {
  if (!requireAdmin(request, env)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.RFQ_FILES) {
    return json({ error: "R2 binding RFQ_FILES is not configured." }, { status: 500 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return json({ error: "Missing file key" }, { status: 400 });
  }

  const object = await env.RFQ_FILES.get(key);

  if (!object) {
    return json({ error: "File not found" }, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "application/octet-stream",
      "content-disposition": `attachment; filename="${key.split("/").pop()}"`,
    },
  });
}
