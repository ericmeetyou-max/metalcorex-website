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

const fileRecord = (submissionId, file, key) => ({
  submission_id: submissionId,
  name: file.name,
  type: file.type || "application/octet-stream",
  size: file.size,
  key,
});

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.RFQ_FILES) {
    return json({ error: "RFQ backend is not configured. Bind D1 as DB and R2 as RFQ_FILES." }, { status: 500 });
  }

  const data = await request.formData();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const files = data.getAll("drawings").filter((item) => item && item.name && item.size > 0);
  const storedFiles = [];

  await env.DB.prepare(`
    INSERT INTO rfq_submissions (
      id, created_at, name, company, email, country, process, material, quantity, details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    createdAt,
    data.get("name") || "",
    data.get("company") || "",
    data.get("email") || "",
    data.get("country") || "",
    data.get("process") || "",
    data.get("material") || "",
    data.get("quantity") || "",
    data.get("details") || ""
  ).run();

  for (const file of files) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${id}/${Date.now()}-${cleanName}`;
    await env.RFQ_FILES.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    const record = fileRecord(id, file, key);
    storedFiles.push(record);

    await env.DB.prepare(`
      INSERT INTO rfq_files (submission_id, name, type, size, key)
      VALUES (?, ?, ?, ?, ?)
    `).bind(record.submission_id, record.name, record.type, record.size, record.key).run();
  }

  return json({ ok: true, id, files: storedFiles.length });
}

export async function onRequestGet({ request, env }) {
  if (!requireAdmin(request, env)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB) {
    return json({ error: "D1 database binding DB is not configured." }, { status: 500 });
  }

  const submissions = await env.DB.prepare(`
    SELECT id, created_at, name, company, email, country, process, material, quantity, details
    FROM rfq_submissions
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  const files = await env.DB.prepare(`
    SELECT submission_id, name, type, size, key
    FROM rfq_files
    ORDER BY name ASC
  `).all();

  const filesBySubmission = new Map();

  for (const file of files.results || []) {
    const list = filesBySubmission.get(file.submission_id) || [];
    list.push({
      name: file.name,
      type: file.type,
      size: file.size,
      key: file.key,
      url: `/api/files?key=${encodeURIComponent(file.key)}`,
    });
    filesBySubmission.set(file.submission_id, list);
  }

  const items = (submissions.results || []).map((item) => ({
    ...item,
    files: filesBySubmission.get(item.id) || [],
  }));

  return json({ items });
}
