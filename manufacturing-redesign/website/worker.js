import { connect } from "cloudflare:sockets";

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });

const noStore = (response) => {
  const next = new Response(response.body, response);
  next.headers.set("cache-control", "no-store");
  return next;
};

const securityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' blob: https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self' https://cloudflareinsights.com https://*.cloudflareinsights.com",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const withSecurityHeaders = (response) => {
  const next = new Response(response.body, response);
  next.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  next.headers.set("x-content-type-options", "nosniff");
  next.headers.set("x-frame-options", "DENY");
  next.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  next.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next.headers.set("content-security-policy", securityPolicy);
  return next;
};

const withAssetCaching = (response, pathname) => {
  const next = new Response(response.body, response);

  if (/\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?|mp4|webm|glb|gltf)$/i.test(pathname)) {
    next.headers.set("cache-control", "public, max-age=2592000, immutable");
  } else if (/\.(?:css|js)$/i.test(pathname)) {
    next.headers.set("cache-control", "public, max-age=31536000, immutable");
  } else if (response.headers.get("content-type")?.includes("text/html")) {
    next.headers.set("cache-control", "public, max-age=0, must-revalidate");
  }

  return next;
};

const encoder = new TextEncoder();
const sessionCookieName = "admin_session";
const SITE_MEDIA_MAX_SIZE = 8 * 1024 * 1024;
const PRODUCT_DETAIL_MEDIA_SLOTS = [
  ["rigging.rail", "Rigging & Safety", "Line array rigging rails", "line-array-rigging-rail.webp", "Black line array speaker rigging rail with precision pin holes"],
  ["rigging.pin", "Rigging & Safety", "Quick-release pins", "quick-release-pin-lanyard.webp", "Ball-lock quick-release pin with stainless steel tether for speaker rigging"],
  ["rigging.fly-plate", "Rigging & Safety", "Fly plates and links", "speaker-fly-plate.webp", "Powder-coated speaker fly plate with locking link"],
  ["rigging.clamp", "Rigging & Safety", "Clamp bridges", "rigging-clamp-bridge.webp", "Black machined clamp bridge for professional audio rigging"],
  ["enclosures.grille", "Enclosures & Grilles", "Speaker grilles", "speaker-perforated-grille.webp", "Formed round-hole perforated steel grille for a professional loudspeaker"],
  ["enclosures.chassis", "Enclosures & Grilles", "Amplifier chassis", "amplifier-sheet-metal-chassis.webp", "Black powder-coated rack amplifier sheet metal chassis"],
  ["enclosures.rear-plate", "Enclosures & Grilles", "Active speaker rear plates", "active-speaker-rear-plate.webp", "Blank active loudspeaker rear amplifier plate with ventilation and connector cutouts"],
  ["enclosures.tray", "Enclosures & Grilles", "Internal equipment trays", "internal-audio-mounting-tray.webp", "Bent sheet metal mounting tray for professional audio electronics"],
  ["mounting.yoke", "Mounting Hardware", "Speaker yoke brackets", "speaker-yoke-bracket.webp", "Heavy-duty powder-coated yoke bracket for an installation loudspeaker"],
  ["mounting.pole-cup", "Mounting Hardware", "Pole mount cups", "speaker-pole-mount-cup.webp", "Recessed 35 millimeter pole mount cup for a PA loudspeaker cabinet"],
  ["mounting.wall", "Mounting Hardware", "Wall mount brackets", "speaker-wall-mount-bracket.webp", "Adjustable tilt and swivel wall mount bracket for a professional loudspeaker"],
  ["mounting.truss", "Mounting Hardware", "Truss clamps and pivots", "speaker-truss-clamp-pivot.webp", "Truss clamp and pivot interface for mounting a professional loudspeaker"],
  ["cnc.heat-sink", "CNC & Thermal", "Aluminum heat sinks", "amplifier-aluminum-heat-sink.webp", "Black anodized finned aluminum heat sink for an active speaker amplifier"],
  ["cnc.adapter", "CNC & Thermal", "Driver adapter rings", "compression-driver-adapter-ring.webp", "CNC machined aluminum compression driver adapter ring with acoustic bore"],
  ["cnc.knobs", "CNC & Thermal", "Control knobs and adapters", "aluminum-audio-control-knobs.webp", "Black knurled aluminum control knobs and shaft adapter for audio equipment"],
  ["cnc.bracket", "CNC & Thermal", "Machined audio brackets", "cnc-audio-mounting-bracket.webp", "Black anodized CNC machined mounting bracket for professional audio electronics"],
  ["molded.waveguide", "Molded & Elastomer", "Speaker horns and waveguides", "injection-molded-speaker-waveguide.webp", "Black injection molded constant-directivity horn and waveguide for a PA loudspeaker"],
  ["molded.frame", "Molded & Elastomer", "Structural speaker frames", "molded-speaker-driver-frame.webp", "Glass-filled nylon molded structural frame for a professional loudspeaker driver"],
  ["molded.seals", "Molded & Elastomer", "Cabinet feet, gaskets and seals", "speaker-rubber-feet-gaskets.webp", "Molded rubber speaker cabinet feet with EPDM gasket and sealing ring"],
  ["molded.protection", "Molded & Elastomer", "Handles and protective plastics", "speaker-handle-corner-strain-relief.webp", "Molded recessed speaker handle, protective corner, and cable strain relief"],
  ["interfaces.connector", "Panels & Interfaces", "Amplifier and interface panels", "passive-speaker-connector-plate.webp", "Blank powder-coated connector plate for a passive professional loudspeaker"],
  ["interfaces.amplifier", "Panels & Interfaces", "Active speaker amplifier panels", "active-speaker-amplifier-panel.webp", "Blank active loudspeaker amplifier panel with power signal control and ventilation openings"],
  ["interfaces.crossover", "Panels & Interfaces", "Crossover mounting panels", "crossover-internal-mounting-panel.webp", "Bent internal mounting panel with standoffs for a loudspeaker crossover assembly"],
  ["interfaces.cover", "Panels & Interfaces", "Protective covers and cable brackets", "amplifier-protective-cover-bracket.webp", "Perforated protective cover and cable brackets for a speaker amplifier module"],
].map(([key, section, label, filename, alt]) => ({
  key: `products.detail.${key}`,
  page: "Products",
  section,
  label,
  defaultUrl: `/assets/product-catalog-v2/${filename}`,
  alt,
  aspect: "3:2",
}));
const SITE_MEDIA_SLOTS = [
  {
    key: "home.hero.production",
    page: "Home",
    section: "Hero",
    label: "Hero production image",
    defaultUrl: "/assets/responsive/capability-cnc-machining-520.webp",
    alt: "CNC machining center producing precision aluminum audio hardware",
    aspect: "8:5",
  },
  {
    key: "home.components.rigging",
    page: "Home",
    section: "Stage audio components",
    label: "Rigging and quick-release parts",
    defaultUrl: "/assets/responsive/speaker-c-clamps-520.webp",
    alt: "Line array rigging clamps and precision speaker suspension hardware",
    aspect: "3:2",
  },
  {
    key: "home.components.amplifier",
    page: "Home",
    section: "Stage audio components",
    label: "Amplifier chassis and heat sinks",
    defaultUrl: "/assets/responsive/amplifier-chassis-520.webp",
    alt: "Sheet metal amplifier chassis for professional stage audio equipment",
    aspect: "3:2",
  },
  {
    key: "home.components.grille",
    page: "Home",
    section: "Stage audio components",
    label: "Perforated speaker grilles",
    defaultUrl: "/assets/responsive/speaker-grille-closeup-520.webp",
    alt: "Round-hole perforated steel grille for a professional PA speaker",
    aspect: "3:2",
  },
  {
    key: "home.components.waveguide",
    page: "Home",
    section: "Stage audio components",
    label: "Speaker horns and waveguides",
    defaultUrl: "/assets/responsive/audio-waveguide-520.webp",
    alt: "Molded speaker waveguide and horn for professional stage loudspeakers",
    aspect: "3:2",
  },
  {
    key: "home.components.mounting",
    page: "Home",
    section: "Stage audio components",
    label: "Pole mount and stand hardware",
    defaultUrl: "/assets/responsive/pole-mount-hardware-520.webp",
    alt: "Pole mount and stand adapter hardware for stage speakers",
    aspect: "3:2",
  },
  {
    key: "home.components.safety",
    page: "Home",
    section: "Stage audio components",
    label: "Safety cables and retainers",
    defaultUrl: "/assets/responsive/locking-hardware-tether-520.webp",
    alt: "Safety cable and locking tether for professional stage speaker hardware",
    aspect: "3:2",
  },
  {
    key: "home.factory.floor",
    page: "Home",
    section: "Factory",
    label: "Factory production floor",
    defaultUrl: "/assets/factory-workshop-floor.webp",
    alt: "Metalcorex CNC workshop floor with multiple machining centers in Xiamen",
    aspect: "8:5",
  },
  {
    key: "products.system.rigging",
    page: "Products",
    section: "Component families",
    label: "Rigging and safety",
    defaultUrl: "/assets/product-catalog-v2/line-array-rigging-rail.webp",
    alt: "Black line array rigging rail with precision pin holes and safety hardware",
    aspect: "3:2",
  },
  {
    key: "products.system.enclosures",
    page: "Products",
    section: "Component families",
    label: "Enclosures and grilles",
    defaultUrl: "/assets/product-catalog-v2/speaker-perforated-grille.webp",
    alt: "Round-hole perforated and powder-coated grille for a professional loudspeaker",
    aspect: "3:2",
  },
  {
    key: "products.system.mounting",
    page: "Products",
    section: "Component families",
    label: "Mounting hardware",
    defaultUrl: "/assets/product-catalog-v2/speaker-yoke-bracket.webp",
    alt: "Heavy-duty powder-coated yoke bracket for a professional installation loudspeaker",
    aspect: "3:2",
  },
  {
    key: "products.system.cnc",
    page: "Products",
    section: "Component families",
    label: "CNC and thermal parts",
    defaultUrl: "/assets/product-catalog-v2/amplifier-aluminum-heat-sink.webp",
    alt: "Black anodized aluminum heat sink for an active loudspeaker amplifier",
    aspect: "3:2",
  },
  {
    key: "products.system.molded",
    page: "Products",
    section: "Component families",
    label: "Molded and elastomer parts",
    defaultUrl: "/assets/product-catalog-v2/injection-molded-speaker-waveguide.webp",
    alt: "Injection molded horn and waveguide for a professional PA loudspeaker",
    aspect: "3:2",
  },
  {
    key: "products.system.interfaces",
    page: "Products",
    section: "Component families",
    label: "Panels and interfaces",
    defaultUrl: "/assets/product-catalog-v2/active-speaker-amplifier-panel.webp",
    alt: "Sheet metal amplifier and interface panel for an active professional loudspeaker",
    aspect: "3:2",
  },
  ...PRODUCT_DETAIL_MEDIA_SLOTS,
  {
    key: "services.hero.factory",
    page: "Services",
    section: "Hero",
    label: "Services hero factory image",
    defaultUrl: "/assets/home-carousel/factory-production-floor.jpg",
    alt: "Metalcorex precision manufacturing floor in Xiamen, China",
    aspect: "16:6",
  },
  {
    key: "services.process.cnc",
    page: "Services",
    section: "Core services",
    label: "CNC machining process",
    defaultUrl: "/assets/capability-cnc-machining.webp",
    alt: "CNC machining an aluminum professional audio enclosure",
    aspect: "8:5",
  },
  {
    key: "services.process.sheet-metal",
    page: "Services",
    section: "Core services",
    label: "Sheet metal fabrication process",
    defaultUrl: "/assets/capability-sheet-metal.jpg",
    alt: "Sheet metal fabrication of perforated professional speaker grilles",
    aspect: "8:5",
  },
  {
    key: "services.process.mold",
    page: "Services",
    section: "Core services",
    label: "Mold design and fabrication",
    defaultUrl: "/assets/capability-mold-manufacturing.jpg",
    alt: "Precision injection mold fabrication and inspection",
    aspect: "8:5",
  },
  {
    key: "services.process.assembly",
    page: "Services",
    section: "Core services",
    label: "Assembly service",
    defaultUrl: "/assets/capability-assembly-packaging.jpg",
    alt: "Controlled assembly and packaging of professional audio enclosures",
    aspect: "8:5",
  },
  {
    key: "about.hero.audio",
    page: "Company",
    section: "About hero",
    label: "Professional audio application",
    defaultUrl: "/assets/audio-real-products/speaker-install-scene.webp",
    alt: "Professional installed loudspeaker supported by custom mounting hardware",
    aspect: "3:2",
  },
  {
    key: "about.factory.floor",
    page: "Company",
    section: "Factory",
    label: "Factory workshop",
    defaultUrl: "/assets/factory-workshop-floor.webp",
    alt: "Metalcorex CNC workshop with multiple machining centers",
    aspect: "8:5",
  },
];
const SITE_MEDIA_SLOT_MAP = new Map(SITE_MEDIA_SLOTS.map((slot) => [slot.key, slot]));

const timingSafeEqual = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
};

const base64UrlEncode = (value) => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const base64UrlDecode = (value) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const sign = async (payload, env) => {
  const secret = env.ADMIN_SESSION_SECRET || env.ADMIN_TOKEN;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return base64UrlEncode(new Uint8Array(signature));
};

const createSessionToken = async (username, env) => {
  const payload = base64UrlEncode(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  }));
  const signature = await sign(payload, env);

  return `${payload}.${signature}`;
};

const verifySessionToken = async (token, env) => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = await sign(payload, env);

  if (!timingSafeEqual(signature, expected)) {
    return false;
  }

  try {
    const decoded = new TextDecoder().decode(base64UrlDecode(payload));
    const data = JSON.parse(decoded);

    return data.exp && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

const parseCookies = (request) => {
  const header = request.headers.get("cookie") || "";
  const cookies = new Map();

  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");

    if (name) {
      cookies.set(name, value.join("="));
    }
  }

  return cookies;
};

const sessionCookie = (token) =>
  `${sessionCookieName}=${token}; Path=/; Max-Age=${60 * 60 * 8}; HttpOnly; Secure; SameSite=Lax`;

const clearSessionCookie = () =>
  `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

const escapeHeader = (value) =>
  String(value || "").replace(/[\r\n]+/g, " ").trim();

const escapeMimeText = (value) =>
  String(value || "").replace(/\r?\n/g, "\r\n");

const base64Encode = (value) => {
  const bytes = encoder.encode(String(value || ""));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64UrlEncode(new Uint8Array(digest));
};

const normalizePath = (path) => {
  if (path === "/") {
    return "/";
  }

  return path.replace(/\/$/, "");
};

const shouldTrackPageView = (request) => {
  if (request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (path === "/" || path.endsWith(".html") || ["/products", "/materials", "/surface-treatment", "/blog"].includes(path)) {
    return true;
  }

  if (path.startsWith("/api") || path.startsWith("/admin") || path.includes(".")) {
    return false;
  }

  return false;
};

const trackPageView = async (request, env, pathOverride = "") => {
  if (!env.DB) {
    return;
  }

  const url = new URL(request.url);
  const path = normalizePath(pathOverride || url.pathname);

  if (path.startsWith("/api") || path.startsWith("/admin")) {
    return;
  }

  const userAgent = request.headers.get("user-agent") || "";

  if (/bot|crawler|spider|preview|uptime|monitor/i.test(userAgent)) {
    return;
  }

  const ip = request.headers.get("cf-connecting-ip") || "";
  const visitorKey = await sha256(`${ip}|${userAgent}`);

  await env.DB.prepare(`
    INSERT INTO analytics_events (id, created_at, path, referrer, country, visitor_key, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    new Date().toISOString(),
    path,
    request.headers.get("referer") || "",
    request.cf?.country || "",
    visitorKey,
    userAgent.slice(0, 500)
  ).run();
};

const handleTrackPost = async (request, env) => {
  const data = await request.json().catch(() => ({}));
  await trackPageView(request, env, data.path || "");

  return json({ ok: true }, {
    headers: {
      "cache-control": "no-store",
    },
  });
};

const buildRfqEmail = ({ submission, files, origin }) => {
  const fileLines = files.length
    ? files.map((file) => {
        const link = `${origin}/api/files?key=${encodeURIComponent(file.key)}`;
        return `- ${file.name} (${file.size} bytes)\n  ${link}`;
      }).join("\n")
    : "No drawing files attached.";

  return `New RFQ received from metalcorex.com

Submission ID: ${submission.id}
Submitted at: ${submission.createdAt}

Customer
- Name: ${submission.name || "-"}
- Company: ${submission.company || "-"}
- Email: ${submission.email || "-"}
- Country: ${submission.country || "-"}

Requirement
- Part Name: ${submission.partName || submission.part_name || "-"}
- Process: ${submission.process || "-"}
- Material: ${submission.material || "-"}
- Annual Quantity: ${submission.annualQuantity || submission.annual_quantity || submission.quantity || "-"}
- Project Stage: ${submission.projectStage || submission.project_stage || "-"}

Details
${submission.message || submission.details || "-"}

Drawing files
${fileLines}

Admin inbox
${origin}/admin
`;
};

const buildCustomerConfirmationEmail = ({ submission, origin }) => `Dear ${submission.name || "Customer"},

Thank you for sending your RFQ to Metalcorex.

We received your request for ${submission.partName || submission.part_name || "custom audio components"} and our engineering team will review the drawings, material, process, quantity, and project stage.

Typical next steps:
- We check manufacturability and any drawing risks.
- We confirm process, material, surface finish, and packaging requirements.
- We reply with questions or a quotation by email.

RFQ ID: ${submission.id}
Company: ${submission.company || "-"}
Part Name: ${submission.partName || submission.part_name || "-"}
Process: ${submission.process || "-"}
Annual Quantity: ${submission.annualQuantity || submission.annual_quantity || submission.quantity || "-"}

If you need to add more drawings or notes, simply reply to this email.

Metalcorex
Professional OEM Manufacturing Partner for Speaker & Professional Audio Brands
${origin}
`;

const sendRfqEmail = async ({ request, env, submission, files }) => {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const smtpHost = env.SMTP_HOST || "smtp0001.neo.space";
  const smtpPort = Number(env.SMTP_PORT || "465");
  const smtpUser = env.SMTP_USERNAME;
  const smtpPassword = env.SMTP_PASSWORD;
  const to = escapeHeader(env.RFQ_TO_EMAIL || "sales@metalcorex.com");
  const from = escapeHeader(env.SMTP_FROM || smtpUser || "mason.h@metalcorex.com");
  const replyTo = escapeHeader(submission.email);
  const subject = escapeHeader(`Metalcorex RFQ: ${submission.company || submission.name || submission.id}`);
  const body = buildRfqEmail({ submission, files, origin });
  const messageId = `<${submission.id}@metalcorex.com>`;

  if (!smtpUser || !smtpPassword) {
    return { ok: false, code: "SMTP_NOT_CONFIGURED", reason: "SMTP username or password is not configured." };
  }

  const raw = [
    `From: Metalcorex RFQ <${from}>`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${subject}`,
    `Date: ${new Date(submission.createdAt).toUTCString()}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    escapeMimeText(body),
  ].filter(Boolean).join("\r\n");

  await sendSmtpMail({
    host: smtpHost,
    port: smtpPort,
    username: smtpUser,
    password: smtpPassword,
    from,
    to,
    raw,
  });

  return { ok: true, messageId };
};

const sendCustomerConfirmationEmail = async ({ request, env, submission }) => {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const smtpHost = env.SMTP_HOST || "smtp0001.neo.space";
  const smtpPort = Number(env.SMTP_PORT || "465");
  const smtpUser = env.SMTP_USERNAME;
  const smtpPassword = env.SMTP_PASSWORD;
  const to = escapeHeader(submission.email);
  const from = escapeHeader(env.SMTP_FROM || smtpUser || "mason.h@metalcorex.com");
  const subject = escapeHeader(`We received your Metalcorex RFQ: ${submission.partName || submission.id}`);

  if (!smtpUser || !smtpPassword || !to) {
    return { ok: false, code: "SMTP_NOT_CONFIGURED", reason: "SMTP username, password, or customer email is missing." };
  }

  const raw = [
    `From: Metalcorex RFQ Team <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date(submission.createdAt).toUTCString()}`,
    `Message-ID: <customer-${submission.id}@metalcorex.com>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    escapeMimeText(buildCustomerConfirmationEmail({ submission, origin })),
  ].join("\r\n");

  await sendSmtpMail({
    host: smtpHost,
    port: smtpPort,
    username: smtpUser,
    password: smtpPassword,
    from,
    to,
    raw,
  });

  return { ok: true };
};

const readSmtpResponse = async (reader) => {
  const decoder = new TextDecoder();
  let response = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      throw new Error("SMTP connection closed unexpectedly.");
    }

    response += decoder.decode(value);

    const lines = response.split(/\r?\n/).filter(Boolean);
    const last = lines[lines.length - 1] || "";

    if (/^\d{3} /.test(last)) {
      return response;
    }
  }
};

const assertSmtp = (response, allowedCodes) => {
  const code = response.slice(0, 3);

  if (!allowedCodes.includes(code)) {
    throw new Error(`SMTP ${code}: ${response.replace(/\s+/g, " ").trim()}`);
  }
};

const writeSmtp = async (writer, reader, command, allowedCodes) => {
  await writer.write(encoder.encode(`${command}\r\n`));
  const response = await readSmtpResponse(reader);
  assertSmtp(response, allowedCodes);
  return response;
};

const dotStuff = (message) =>
  message.replace(/\r?\n/g, "\r\n").replace(/(^|\r\n)\./g, "$1..");

const sendSmtpMail = async ({ host, port, username, password, from, to, raw }) => {
  const socket = connect({ hostname: host, port }, { secureTransport: "on" });
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();

  try {
    assertSmtp(await readSmtpResponse(reader), ["220"]);
    await writeSmtp(writer, reader, "EHLO metalcorex.com", ["250"]);
    await writeSmtp(writer, reader, "AUTH LOGIN", ["334"]);
    await writeSmtp(writer, reader, base64Encode(username), ["334"]);
    await writeSmtp(writer, reader, base64Encode(password), ["235"]);
    await writeSmtp(writer, reader, `MAIL FROM:<${from}>`, ["250"]);
    await writeSmtp(writer, reader, `RCPT TO:<${to}>`, ["250", "251"]);
    await writeSmtp(writer, reader, "DATA", ["354"]);
    await writer.write(encoder.encode(`${dotStuff(raw)}\r\n.\r\n`));
    assertSmtp(await readSmtpResponse(reader), ["250"]);
    await writeSmtp(writer, reader, "QUIT", ["221"]);
  } finally {
    writer.releaseLock();
    reader.releaseLock();
    await socket.close().catch(() => {});
  }
};

const adminLoginHtml = (message = "Sign in to view RFQs and manage product gallery photos.") => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login | Metalcorex</title>
    <meta name="robots" content="noindex,nofollow">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.css?v=admin-basic-2">
  </head>
  <body class="products-page admin-page is-locked">
    <main>
      <section class="admin-login-screen" id="adminLogin">
        <form class="admin-login-card" method="post" action="/admin-login">
          <img class="admin-login-logo" src="/assets/metalcorex-logo-white.png" alt="Metalcorex">
          <p class="eyebrow">Admin Login</p>
          <h1>Metalcorex backend</h1>
          <label>Username<input name="username" autocomplete="username" required autofocus></label>
          <label>Password
            <span class="password-input-wrap">
              <input id="adminPassword" name="password" type="password" autocomplete="current-password" required>
              <button class="password-toggle" type="button" aria-label="Show password" aria-pressed="false" data-password-toggle>Show</button>
            </span>
          </label>
          <button class="button primary full" type="submit">Sign In</button>
          <p class="form-note">${message}</p>
        </form>
      </section>
    </main>
    <script>
      const passwordToggle = document.querySelector("[data-password-toggle]");
      const adminPassword = document.querySelector("#adminPassword");
      passwordToggle?.addEventListener("click", () => {
        const isVisible = adminPassword.type === "text";
        adminPassword.type = isVisible ? "password" : "text";
        passwordToggle.textContent = isVisible ? "Show" : "Hide";
        passwordToggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
        passwordToggle.setAttribute("aria-pressed", String(!isVisible));
      });
    </script>
  </body>
</html>`;

const adminLoginResponse = (message, status = 200) =>
  new Response(adminLoginHtml(message), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[match]);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const renderServerTrafficChart = (items = []) => {
  if (!items.length) {
    return '<p class="form-note">No traffic recorded yet. Visit the public site to start collecting analytics.</p>';
  }

  const maxViews = Math.max(...items.map((item) => Number(item.views || 0)), 1);

  return items.map((item) => {
    const views = Number(item.views || 0);
    const visitors = Number(item.visitors || 0);
    const height = Math.max(8, Math.round((views / maxViews) * 100));
    const day = escapeHtml(item.day || "");
    const label = day.slice(5);

    return `<div class="traffic-bar" title="${day}: ${views} views / ${visitors} visitors"><span style="height: ${height}%"></span><small>${label}</small></div>`;
  }).join("");
};

const renderServerRankList = (items = [], labelKey, valueKey, emptyText) => {
  if (!items.length) {
    return `<p class="form-note">${escapeHtml(emptyText)}</p>`;
  }

  const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);

  return items.map((item) => {
    const value = Number(item[valueKey] || 0);
    const width = Math.max(4, Math.round((value / maxValue) * 100));

    return `<div class="admin-rank-item"><div><strong>${escapeHtml(item[labelKey] || "-")}</strong><span>${formatNumber(value)} views</span></div><em><i style="width: ${width}%"></i></em></div>`;
  }).join("");
};

const renderServerRecentRfqs = (items = []) => {
  if (!items.length) {
    return '<p class="form-note">No RFQs submitted yet.</p>';
  }

  return items.map((item) => `
    <div class="admin-rfq-mini">
      <strong>${escapeHtml(item.company || item.name || "-")}</strong>
      <span>${escapeHtml(item.process || "-")} · ${escapeHtml(item.country || "-")}</span>
      <small>${escapeHtml(new Date(item.created_at).toLocaleString("en-US"))}</small>
    </div>
  `).join("");
};

const emptyDashboard = {
  metrics: {
    rfqsTotal: 0,
    rfqsLast7: 0,
    spamTotal: 0,
    spamLast7: 0,
    filesTotal: 0,
    filesSize: 0,
    viewsToday: 0,
    viewsLast7: 0,
    viewsLast30: 0,
    uniqueLast30: 0,
  },
  dailyVisits: [],
  topPages: [],
  countries: [],
  recentRfqs: [],
};

const zohoEnvStatus = (env) => {
  const required = ["ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN", "ZOHO_ORGANIZATION_ID"];
  const missing = required.filter((name) => !env[name]);

  return {
    configured: missing.length === 0,
    missing,
  };
};

const zohoApiBase = (env) => (env.ZOHO_API_BASE || "https://www.zohoapis.com").replace(/\/$/, "");
const zohoAccountsBase = (env) => (env.ZOHO_ACCOUNTS_BASE || "https://accounts.zoho.com").replace(/\/$/, "");

const toMoney = (value) => {
  const parsed = Number(String(value ?? "0").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const isoDate = (date) => date.toISOString().slice(0, 10);

const normalizeZohoStatus = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");

const refreshZohoAccessToken = async (env) => {
  const body = new URLSearchParams({
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const response = await fetch(`${zohoAccountsBase(env)}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Zoho token refresh failed: ${response.status}`);
  }

  return data.access_token;
};

const zohoGet = async (env, accessToken, resource, params = {}) => {
  const url = new URL(`${zohoApiBase(env)}/inventory/v1/${resource.replace(/^\//, "")}`);
  url.searchParams.set("organization_id", env.ZOHO_ORGANIZATION_ID);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: { authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.code > 0) {
    throw new Error(data.message || `Zoho API request failed: ${response.status}`);
  }

  return data;
};

const zohoPaged = async (env, accessToken, resource, key, params = {}) => {
  const rows = [];
  const maxPages = Number(env.ZOHO_MAX_PAGES || 5);

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await zohoGet(env, accessToken, resource, {
      page,
      per_page: 200,
      sort_column: "created_time",
      sort_order: "D",
      ...params,
    });
    const pageRows = data[key] || [];
    rows.push(...pageRows);

    if (data.page_context?.has_more_page === false || pageRows.length < 200) {
      break;
    }
  }

  return rows;
};

const loadZohoSummary = async (env) => {
  const config = zohoEnvStatus(env);

  if (!config.configured) {
    return {
      configured: false,
      missing: config.missing,
      message: "Zoho secrets are not configured yet.",
    };
  }

  const today = new Date();
  const startDate = env.ZOHO_SUMMARY_START_DATE || `${today.getUTCFullYear()}-01-01`;
  const endDate = env.ZOHO_SUMMARY_END_DATE || isoDate(today);
  const dueEndDate = isoDate(addDays(today, Number(env.ZOHO_DUE_DAYS || 7)));
  const accessToken = await refreshZohoAccessToken(env);

  const [invoices, purchaseOrders, salesOrders] = await Promise.all([
    zohoPaged(env, accessToken, "invoices", "invoices", { date_start: startDate, date_end: endDate }),
    zohoPaged(env, accessToken, "purchaseorders", "purchaseorders", { date_start: startDate, date_end: endDate }),
    zohoPaged(env, accessToken, "salesorders", "salesorders", { date_start: startDate, date_end: endDate }),
  ]);

  const paidInvoices = invoices.filter((invoice) => {
    const status = normalizeZohoStatus(invoice.status || invoice.status_formatted);
    return status.includes("paid") || toMoney(invoice.balance) === 0;
  });
  const issuedPurchaseOrders = purchaseOrders.filter((po) => {
    const status = normalizeZohoStatus(po.status || po.status_formatted);
    return !["cancelled", "canceled", "void", "draft"].includes(status);
  });
  const openSalesOrders = salesOrders.filter((order) => {
    const status = normalizeZohoStatus(order.status || order.status_formatted);
    return !["fulfilled", "void", "cancelled", "canceled", "closed"].includes(status);
  });
  const duePurchaseOrders = issuedPurchaseOrders
    .filter((po) => {
      const due = po.expected_delivery_date || po.delivery_date;
      const status = normalizeZohoStatus(po.status || po.status_formatted);
      return due && due >= isoDate(today) && due <= dueEndDate && !["received", "closed", "billed"].includes(status);
    })
    .sort((left, right) => String(left.expected_delivery_date || left.delivery_date).localeCompare(String(right.expected_delivery_date || right.delivery_date)))
    .slice(0, 8);

  const revenue = paidInvoices.reduce((sum, invoice) => sum + toMoney(invoice.total), 0);
  const purchaseCost = issuedPurchaseOrders.reduce((sum, po) => sum + toMoney(po.total), 0);
  const profit = revenue - purchaseCost;

  return {
    configured: true,
    range: { startDate, endDate, dueEndDate },
    generatedAt: new Date().toISOString(),
    metrics: {
      paidInvoices: paidInvoices.length,
      revenue,
      issuedPurchaseOrders: issuedPurchaseOrders.length,
      purchaseCost,
      profit,
      openSalesOrders: openSalesOrders.length,
      duePurchaseOrders: duePurchaseOrders.length,
    },
    duePurchaseOrders: duePurchaseOrders.map((po) => ({
      number: po.purchaseorder_number,
      vendor: po.vendor_name,
      status: po.status_formatted || po.status,
      dueDate: po.expected_delivery_date || po.delivery_date,
      total: toMoney(po.total),
      currency: po.currency_code || "",
    })),
    openSalesOrders: openSalesOrders.slice(0, 8).map((order) => ({
      number: order.salesorder_number,
      customer: order.customer_name,
      status: order.status_formatted || order.status,
      date: order.date,
      total: toMoney(order.total),
      currency: order.currency_code || "",
    })),
  };
};

const adminHtml = (dashboard = emptyDashboard) => {
  const metrics = { ...emptyDashboard.metrics, ...(dashboard.metrics || {}) };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Website Admin | Metalcorex</title>
    <meta name="robots" content="noindex,nofollow">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.min.css?v=site-20260731-27">
  </head>
  <body class="products-page admin-page" data-auth-mode="cookie">
    <header class="site-header solid-header">
      <a class="brand" href="/" aria-label="Metalcorex home"><img class="brand-logo" src="/assets/metalcorex-logo-white.png" alt="Metalcorex"></a>
      <nav class="nav" aria-label="Admin navigation">
        <a href="/products.html">Public Gallery</a>
        <a href="/#quote">RFQ</a>
      </nav>
    </header>
    <main class="admin-console">
      <section class="admin-command-bar">
        <div>
          <p class="eyebrow">Operations Console</p>
          <h1>Metalcorex backend</h1>
          <p class="form-note">RFQ pipeline, drawing storage, website traffic, and gallery operations.</p>
        </div>
        <div class="admin-actions">
          <a class="button ghost" href="/" target="_blank" rel="noreferrer">View Site</a>
          <button class="button primary" type="button" id="refreshDashboard">Refresh</button>
          <a class="button ghost" href="/admin-logout">Sign Out</a>
        </div>
      </section>

      <section class="admin-metrics" aria-label="Business metrics">
        <article class="admin-metric-card"><span>Views Today</span><strong id="metricViewsToday">${formatNumber(metrics.viewsToday)}</strong><small id="metricViews7">${formatNumber(metrics.viewsLast7)} in 7 days</small></article>
        <article class="admin-metric-card"><span>30-Day Visitors</span><strong id="metricVisitors30">${formatNumber(metrics.uniqueLast30)}</strong><small id="metricViews30">${formatNumber(metrics.viewsLast30)} page views</small></article>
        <article class="admin-metric-card"><span>Total RFQs</span><strong id="metricRfqs">${formatNumber(metrics.rfqsTotal)}</strong><small id="metricRfqs7">${formatNumber(metrics.rfqsLast7)} in 7 days</small></article>
        <article class="admin-metric-card"><span>Drawing Files</span><strong id="metricFiles">${formatNumber(metrics.filesTotal)}</strong><small id="metricFileSize">${formatBytes(metrics.filesSize)} stored</small></article>
        <article class="admin-metric-card admin-spam-metric"><span>Spam Blocked</span><strong id="metricSpam">${formatNumber(metrics.spamTotal)}</strong><small id="metricSpam7">${formatNumber(metrics.spamLast7)} in 7 days</small></article>
      </section>

      <section class="admin-dashboard-grid">
        <article class="admin-panel admin-panel-large">
          <div class="admin-panel-head">
            <div><p class="eyebrow">Zoho Inventory</p><h2>Business control center</h2></div>
            <span class="admin-pill" id="zohoStatus">Checking connection</span>
          </div>
          <div class="zoho-metrics" id="zohoMetrics">
            <article><span>Paid Revenue</span><strong>--</strong><small>This year</small></article>
            <article><span>Purchase Cost</span><strong>--</strong><small>Issued PO</small></article>
            <article><span>Profit Snapshot</span><strong>--</strong><small>Before detailed tax rules</small></article>
            <article><span>Open Orders</span><strong>--</strong><small>Needs attention</small></article>
          </div>
          <div class="zoho-work-grid">
            <div>
              <div class="admin-panel-head compact-head"><div><p class="eyebrow">Purchasing</p><h3>PO due soon</h3></div></div>
              <div class="zoho-list" id="zohoDuePos"><p class="form-note">Loading Zoho purchase orders...</p></div>
            </div>
            <div>
              <div class="admin-panel-head compact-head"><div><p class="eyebrow">Sales</p><h3>Open sales orders</h3></div></div>
              <div class="zoho-list" id="zohoOpenOrders"><p class="form-note">Loading Zoho sales orders...</p></div>
            </div>
          </div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><p class="eyebrow">Next Step</p><h2>Automation ideas</h2></div></div>
          <div class="zoho-action-list">
            <div><strong>RFQ to Zoho</strong><span>Create a customer and sales order draft from a website inquiry.</span></div>
            <div><strong>One-click customs docs</strong><span>Generate invoice and packing list from a Zoho order.</span></div>
            <div><strong>Daily business digest</strong><span>Email overdue PO, open orders, paid invoices, and profit.</span></div>
          </div>
        </article>
      </section>

      <section class="admin-dashboard-grid">
        <article class="admin-panel admin-panel-large">
          <div class="admin-panel-head">
            <div><p class="eyebrow">Traffic</p><h2>Website visits, last 14 days</h2></div>
            <span class="admin-pill">Live D1 analytics</span>
          </div>
          <div class="traffic-chart" id="trafficChart">${renderServerTrafficChart(dashboard.dailyVisits || [])}</div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><p class="eyebrow">Pages</p><h2>Top visited pages</h2></div></div>
          <div class="admin-rank-list" id="topPages">${renderServerRankList(dashboard.topPages || [], "path", "views", "No page views recorded yet.")}</div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><p class="eyebrow">Markets</p><h2>Visitor countries</h2></div></div>
          <div class="admin-rank-list" id="countryList">${renderServerRankList(dashboard.countries || [], "country", "views", "No country data recorded yet.")}</div>
        </article>
      </section>

      <section class="admin-dashboard-grid">
        <section class="admin-panel admin-panel-large">
          <div class="admin-panel-head">
            <div>
              <p class="eyebrow">RFQ Inbox</p>
              <h2>Customer drawings and machining requirements</h2>
            </div>
            <div class="admin-actions compact-actions">
              <a class="button ghost" href="/api/rfq.csv">Export CSV</a>
              <button class="button primary" type="button" id="refreshRfqs">Refresh RFQs</button>
            </div>
          </div>
          <div class="admin-filter-row">
            <label>
              Search
              <input id="rfqSearch" type="search" placeholder="Email, company, country, part name">
            </label>
            <label>
              Status
              <select id="rfqStatusFilter">
                <option value="">Active RFQs (Spam excluded)</option>
                <option>New</option>
                <option>Quoted</option>
                <option>Followed Up</option>
                <option>Won</option>
                <option>Lost</option>
                <option>Spam</option>
              </select>
            </label>
          </div>
          <div class="rfq-list" id="rfqList"><p class="form-note">No RFQ records loaded yet.</p></div>
        </section>

        <aside class="admin-panel">
          <div class="admin-panel-head"><div><p class="eyebrow">Recent</p><h2>Latest RFQs</h2></div></div>
          <div class="admin-rank-list" id="recentRfqs">${renderServerRecentRfqs(dashboard.recentRfqs || [])}</div>
        </aside>
      </section>

      <section class="admin-panel admin-media-panel" id="website-images">
        <div class="admin-panel-head admin-media-head">
          <div>
            <p class="eyebrow">Website Image Library</p>
            <h2>Replace key images without editing code</h2>
            <p class="form-note">Choose a registered image position, preview your file, then publish it. The original image remains available as a safe default.</p>
          </div>
          <div class="admin-media-tools">
            <label>Page
              <select id="mediaPageFilter">
                <option value="">All pages</option>
                <option value="Home" selected>Home</option>
                <option value="Products">Products</option>
                <option value="Services">Services</option>
                <option value="Company">Company</option>
              </select>
            </label>
            <button class="button ghost" type="button" id="refreshMedia">Refresh Images</button>
          </div>
        </div>
        <div class="admin-media-notice" role="status" id="mediaGlobalStatus">
          JPG, PNG, WebP or AVIF · maximum 8 MB · use professional audio and real manufacturing imagery.
        </div>
        <div class="admin-media-grid" id="mediaGrid">
          <p class="form-note">Loading website image positions...</p>
        </div>
      </section>
    </main>
    <footer class="site-footer"><span>&copy; <span id="year"></span> Metalcorex. Internal gallery management.</span><a href="/products.html">Public gallery</a></footer>
    <script src="/rfq-admin.js?v=rfq-spam-2"></script>
  </body>
</html>`;
};

const adminResponse = (dashboard) =>
  new Response(adminHtml(dashboard), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });

const requireAdmin = (request, env) => {
  const expected = env.ADMIN_TOKEN;

  if (!expected) {
    return false;
  }

  return (request.headers.get("authorization") || "") === `Bearer ${expected}`;
};

const validateBasicAuth = (request, env) => {
  const auth = request.headers.get("authorization") || "";

  if (!auth.startsWith("Basic ")) {
    return false;
  }

  try {
    const decoded = atob(auth.slice(6));
    const separator = decoded.indexOf(":");

    if (separator === -1) {
      return false;
    }

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    return validateAdminCredentials(username, password, env).ok;
  } catch {
    return false;
  }
};

const adminChallenge = () =>
  new Response("Authentication required.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="Metalcorex Admin", charset="UTF-8"',
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });

const requireAdminSession = async (request, env) => {
  if (validateBasicAuth(request, env)) {
    return true;
  }

  const auth = request.headers.get("authorization") || "";
  const cookies = parseCookies(request);
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : cookies.get(sessionCookieName) || "";

  if (!token) {
    return false;
  }

  if (env.ADMIN_TOKEN && timingSafeEqual(token, env.ADMIN_TOKEN)) {
    return true;
  }

  return verifySessionToken(token, env);
};

const validateAdminCredentials = (username, password, env) => {
  const expectedUser = env.ADMIN_USER || "mason";
  const expectedPassword = env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { ok: false, error: "Admin password is not configured.", status: 500 };
  }

  const ok = timingSafeEqual(String(username || ""), expectedUser) &&
    timingSafeEqual(String(password || ""), expectedPassword);

  if (!ok) {
    return { ok: false, error: "Invalid username or password.", status: 401 };
  }

  return { ok: true, username: expectedUser };
};

const handleLogin = async (request, env) => {
  const { username, password } = await request.json().catch(() => ({}));
  const result = validateAdminCredentials(username, password, env);

  if (!result.ok) {
    return json({ error: result.error }, { status: result.status });
  }

  const token = await createSessionToken(result.username, env);

  return json(
    { ok: true, token, expires_in: 60 * 60 * 8 },
    { headers: { "set-cookie": sessionCookie(token) } }
  );
};

const handleAdminFormPost = async (request, env) => {
  const data = await request.formData();
  const result = validateAdminCredentials(data.get("username"), data.get("password"), env);

  if (!result.ok) {
    return adminLoginResponse(result.error, result.status);
  }

  const token = await createSessionToken(result.username, env);

  return new Response(null, {
    status: 303,
    headers: {
      location: "/admin",
      "set-cookie": sessionCookie(token),
      "cache-control": "no-store",
    },
  });
};

const handleLogout = () =>
  json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });

const handleAdminLogout = () =>
  new Response(null, {
    status: 303,
    headers: {
      location: "/admin-login",
      "set-cookie": clearSessionCookie(),
      "cache-control": "no-store",
    },
  });

const RFQ_ALLOWED_EXTENSIONS = new Set([
  "pdf", "step", "stp", "stl", "igs", "iges", "dwg", "dxf",
  "zip", "rar", "7z", "png", "jpg", "jpeg",
]);
const RFQ_MAX_FILE_SIZE = 25 * 1024 * 1024;
const RFQ_MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const RFQ_MAX_FILES = 8;
const rfqText = (value, maxLength = 500) => String(value || "").trim().slice(0, maxLength);
const RFQ_SPAM_THRESHOLD = 8;

const rfqHash = async (value) => {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
};

const normalizeRfqFingerprintText = (value) => String(value || "")
  .toLowerCase()
  .replace(/https?:\/\/\S+/g, " [url] ")
  .replace(/[^a-z0-9\u00c0-\u024f\u4e00-\u9fff]+/g, " ")
  .trim()
  .slice(0, 1800);

const addSpamSignal = (assessment, points, reason) => {
  assessment.score += points;
  assessment.reasons.push(reason);
};

const assessRfqSpam = ({ request, data, submission, files, activity }) => {
  const assessment = { score: 0, reasons: [] };
  const name = normalizeRfqFingerprintText(submission.name);
  const company = normalizeRfqFingerprintText(submission.company);
  const partName = normalizeRfqFingerprintText(submission.partName);
  const message = normalizeRfqFingerprintText(submission.message);
  const combined = `${name} ${company} ${partName} ${message}`;
  const rawCombined = `${submission.name} ${submission.company} ${submission.partName} ${submission.message}`;
  const origin = request.headers.get("origin");

  if (rfqText(data.get("website"), 200)) {
    addSpamSignal(assessment, 20, "honeypot completed");
  }

  if (origin) {
    try {
      const hostname = new URL(origin).hostname.toLowerCase();
      if (hostname !== "metalcorex.com" && hostname !== "www.metalcorex.com") {
        addSpamSignal(assessment, 12, "untrusted form origin");
      }
    } catch {
      addSpamSignal(assessment, 8, "invalid form origin");
    }
  }

  const startedAt = Number(data.get("form_started_at") || 0);
  const nonce = rfqText(data.get("form_nonce"), 160);
  if (!startedAt || !nonce) {
    addSpamSignal(assessment, 2, "missing browser form proof");
  } else {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < 3000) addSpamSignal(assessment, 4, "form completed too quickly");
    if (elapsed < 0 || elapsed > 8 * 60 * 60 * 1000) addSpamSignal(assessment, 2, "stale or invalid form timing");
    if (nonce.length < 16) addSpamSignal(assessment, 2, "invalid form nonce");
  }

  if (/robertinala|robertoramp/i.test(combined)) {
    addSpamSignal(assessment, 14, "known automated campaign signature");
  }
  if (/@jmailservice\.com$/i.test(submission.email)) {
    addSpamSignal(assessment, 10, "known solicitation email domain");
  }
  if (company === "google" && !/@google\.com$/i.test(submission.email)) {
    addSpamSignal(assessment, 6, "impersonated company name");
  }

  const solicitationPattern = /(search engine optimization|\bseo\b|first page of google|top (?:of|on) (?:google|search)|search results|targeted (?:website )?traffic|website traffic|backlinks?|guest posts?|digital marketing|video (?:advertis|marketing)|advertis(?:e|ing)|promo code|lead generation|improve your ranking|rank(?:ing)? your website|increase your sales|website promotion)/i;
  if (solicitationPattern.test(combined)) {
    addSpamSignal(assessment, 8, "unrelated marketing solicitation");
  }

  if (/(clickto\.cc|alstr\.in|bit\.ly|tinyurl\.com|t\.co|cutt\.ly|rebrand\.ly)/i.test(rawCombined)) {
    addSpamSignal(assessment, 7, "shortened or campaign URL");
  } else if (/(https?:\/\/|www\.)/i.test(`${submission.message} ${submission.partName}`)) {
    addSpamSignal(assessment, 3, "external URL in project fields");
  }

  if (/(would you be interested|is this something you(?:'|\u2019)?d like to explore|i wanted to know your price|contact me for more information)/i.test(combined)) {
    addSpamSignal(assessment, 3, "generic solicitation wording");
  }
  if (name && company && partName && name === company && company === partName) {
    addSpamSignal(assessment, 4, "repeated identity fields");
  }
  if (!files.length) addSpamSignal(assessment, 1, "no drawing attached");
  if (submission.message.length < 70) addSpamSignal(assessment, 1, "very short project description");

  if (activity.clientLastHour >= 6) addSpamSignal(assessment, 9, "client submission rate exceeded");
  if (activity.emailLastDay >= 4) addSpamSignal(assessment, 8, "email submission rate exceeded");
  if (activity.repeatedSpam) addSpamSignal(assessment, 10, "repeated blocked content");

  return assessment;
};

const loadRfqSecurityContext = async (env, request, submission) => {
  const rawClient = request.headers.get("cf-connecting-ip")
    || String(request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "unknown";
  const clientKey = await rfqHash(`rfq-client:${rawClient}`);
  const emailHash = await rfqHash(`rfq-email:${submission.email}`);
  const fingerprint = await rfqHash([
    normalizeRfqFingerprintText(submission.company),
    normalizeRfqFingerprintText(submission.partName),
    normalizeRfqFingerprintText(submission.message),
  ].join("|"));
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const duplicateSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [clientCount, emailCount, repeatedSpam, duplicateAccepted] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS total FROM rfq_security_events WHERE client_key = ? AND created_at >= ?")
      .bind(clientKey, hourAgo).first(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM rfq_security_events WHERE email_hash = ? AND created_at >= ?")
      .bind(emailHash, dayAgo).first(),
    env.DB.prepare("SELECT id FROM rfq_security_events WHERE fingerprint = ? AND outcome = 'Spam' AND created_at >= ? LIMIT 1")
      .bind(fingerprint, monthAgo).first(),
    env.DB.prepare("SELECT submission_id FROM rfq_security_events WHERE fingerprint = ? AND email_hash = ? AND outcome = 'Accepted' AND created_at >= ? ORDER BY created_at DESC LIMIT 1")
      .bind(fingerprint, emailHash, duplicateSince).first(),
  ]);

  return {
    clientKey,
    emailHash,
    fingerprint,
    clientLastHour: Number(clientCount?.total || 0),
    emailLastDay: Number(emailCount?.total || 0),
    repeatedSpam: Boolean(repeatedSpam),
    duplicateSubmissionId: duplicateAccepted?.submission_id || "",
  };
};

const recordRfqSecurityEvent = async (env, context, outcome, reason = "", submissionId = "") => {
  await env.DB.prepare(`
    INSERT INTO rfq_security_events (id, created_at, client_key, email_hash, fingerprint, outcome, reason, submission_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    new Date().toISOString(),
    context.clientKey,
    context.emailHash,
    context.fingerprint,
    outcome,
    rfqText(reason, 1000),
    submissionId
  ).run();
};

const handleRfqPost = async (request, env) => {
  if (!env.DB || !env.RFQ_FILES) {
    return json({ error: "RFQ backend is not configured. Bind D1 as DB and R2 as RFQ_FILES." }, { status: 500 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > RFQ_MAX_TOTAL_SIZE + 2 * 1024 * 1024) {
    return json({ error: "The upload is too large. Please keep all files below 50 MB total." }, { status: 413 });
  }

  const contentType = String(request.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
    return json({ error: "Submit RFQ fields and drawings as form data." }, { status: 415 });
  }

  await ensureRfqSchema(env);

  const data = await request.formData().catch(() => null);
  if (!data) {
    return json({ error: "The RFQ form data could not be read. Please review the fields and try again." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const files = data.getAll("drawings").filter((item) => item && item.name && item.size > 0);
  const storedFiles = [];
  const submission = {
    id,
    createdAt,
    name: rfqText(data.get("name"), 120),
    company: rfqText(data.get("company"), 180),
    email: rfqText(data.get("email"), 254).toLowerCase(),
    country: rfqText(data.get("country"), 120),
    partName: rfqText(data.get("part_name") || data.get("partName"), 180),
    process: rfqText(data.get("manufacturing_process") || data.get("process"), 120),
    material: rfqText(data.get("material"), 180),
    annualQuantity: rfqText(data.get("annual_quantity") || data.get("quantity"), 120),
    projectStage: rfqText(data.get("project_stage"), 120),
    quantity: rfqText(data.get("annual_quantity") || data.get("quantity"), 120),
    message: rfqText(data.get("message") || data.get("details"), 5000),
    details: rfqText(data.get("message") || data.get("details"), 5000),
  };

  const security = await loadRfqSecurityContext(env, request, submission);
  if (security.duplicateSubmissionId) {
    await recordRfqSecurityEvent(env, security, "Duplicate", "duplicate accepted submission", security.duplicateSubmissionId);
    return json({ ok: true, id: security.duplicateSubmissionId, duplicate: true });
  }

  const spamAssessment = assessRfqSpam({ request, data, submission, files, activity: security });
  if (spamAssessment.score >= RFQ_SPAM_THRESHOLD) {
    const reason = `Spam filter score ${spamAssessment.score}: ${spamAssessment.reasons.join("; ")}`;

    if (submission.name && submission.email) {
      await env.DB.prepare(`
        INSERT INTO rfq_submissions (
          id, created_at, name, company, email, country, part_name, process, material,
          annual_quantity, project_stage, quantity, details, status, internal_notes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        submission.id,
        submission.createdAt,
        submission.name,
        submission.company,
        submission.email,
        submission.country,
        submission.partName,
        submission.process,
        submission.material,
        submission.annualQuantity,
        submission.projectStage,
        submission.quantity,
        submission.details,
        "Spam",
        reason,
        submission.createdAt
      ).run();
    }

    await recordRfqSecurityEvent(env, security, "Spam", reason, submission.name && submission.email ? submission.id : "");
    return json({ ok: true, id: submission.id });
  }

  const missingFields = [
    ["name", submission.name],
    ["company", submission.company],
    ["email", submission.email],
    ["country", submission.country],
    ["part name", submission.partName],
    ["manufacturing process", submission.process],
    ["message", submission.message],
  ].filter(([, value]) => !value).map(([label]) => label);

  if (missingFields.length) {
    return json({ error: `Please complete: ${missingFields.join(", ")}.` }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(submission.email)) {
    return json({ error: "Please enter a valid business email address." }, { status: 400 });
  }

  if (files.length > RFQ_MAX_FILES) {
    return json({ error: `Please upload no more than ${RFQ_MAX_FILES} files.` }, { status: 400 });
  }

  let totalFileSize = 0;
  for (const file of files) {
    const extension = String(file.name).split(".").pop().toLowerCase();
    if (!RFQ_ALLOWED_EXTENSIONS.has(extension)) {
      return json({ error: `Unsupported file type: ${file.name}.` }, { status: 400 });
    }
    if (file.size > RFQ_MAX_FILE_SIZE) {
      return json({ error: `${file.name} exceeds the 25 MB file limit.` }, { status: 413 });
    }
    totalFileSize += file.size;
  }

  if (totalFileSize > RFQ_MAX_TOTAL_SIZE) {
    return json({ error: "Please keep all uploaded files below 50 MB total." }, { status: 413 });
  }

  await env.DB.prepare(`
    INSERT INTO rfq_submissions (
      id, created_at, name, company, email, country, part_name, process, material, annual_quantity, project_stage, quantity, details, status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    submission.id,
    submission.createdAt,
    submission.name,
    submission.company,
    submission.email,
    submission.country,
    submission.partName,
    submission.process,
    submission.material,
    submission.annualQuantity,
    submission.projectStage,
    submission.quantity,
    submission.details,
    "New",
    submission.createdAt
  ).run();

  await recordRfqSecurityEvent(env, security, "Accepted", `score ${spamAssessment.score}`, submission.id);

  for (const file of files) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${id}/${Date.now()}-${cleanName}`;

    await env.RFQ_FILES.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    const record = {
      submission_id: id,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      key,
    };

    storedFiles.push(record);

    await env.DB.prepare(`
      INSERT INTO rfq_files (submission_id, name, type, size, key)
      VALUES (?, ?, ?, ?, ?)
    `).bind(record.submission_id, record.name, record.type, record.size, record.key).run();
  }

  const email = await sendRfqEmail({ request, env, submission, files: storedFiles }).catch((error) => ({
    ok: false,
    code: error.code || "UNKNOWN",
    reason: error.message,
  }));

  const customerEmail = await sendCustomerConfirmationEmail({ request, env, submission }).catch((error) => ({
    ok: false,
    code: error.code || "UNKNOWN",
    reason: error.message,
  }));

  return json({ ok: true, id, files: storedFiles.length, email, customerEmail });
};

const handleRfqGet = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB) {
    return json({ error: "D1 database binding DB is not configured." }, { status: 500 });
  }

  await ensureRfqSchema(env);

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") || "").trim();
  const status = (url.searchParams.get("status") || "").trim();
  const baseSelect = `
    SELECT id, created_at, name, company, email, country, part_name, process, material,
           annual_quantity, project_stage, quantity, details, status, internal_notes, updated_at
    FROM rfq_submissions
  `;
  const where = [];
  const bindings = [];

  if (search) {
    where.push(`(email LIKE ? OR company LIKE ? OR country LIKE ? OR part_name LIKE ? OR name LIKE ?)`);
    const like = `%${search}%`;
    bindings.push(like, like, like, like, like);
  }

  if (status && allowedRfqStatuses.has(status)) {
    where.push(`status = ?`);
    bindings.push(status);
  } else {
    where.push(`COALESCE(status, 'New') <> 'Spam'`);
  }

  const submissions = await env.DB.prepare(`
    ${baseSelect}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC
    LIMIT 200
  `).bind(...bindings).all();

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
};

const allowedRfqStatuses = new Set(["New", "Quoted", "Followed Up", "Won", "Lost", "Spam"]);

const ensureRfqSchema = async (env) => {
  if (!env.DB) {
    return;
  }

  const statements = [
    "ALTER TABLE rfq_submissions ADD COLUMN part_name TEXT",
    "ALTER TABLE rfq_submissions ADD COLUMN annual_quantity TEXT",
    "ALTER TABLE rfq_submissions ADD COLUMN project_stage TEXT",
    "ALTER TABLE rfq_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'New'",
    "ALTER TABLE rfq_submissions ADD COLUMN internal_notes TEXT",
    "ALTER TABLE rfq_submissions ADD COLUMN updated_at TEXT",
    "CREATE INDEX IF NOT EXISTS idx_rfq_created_at ON rfq_submissions (created_at)",
    "CREATE INDEX IF NOT EXISTS idx_rfq_status ON rfq_submissions (status)",
    `CREATE TABLE IF NOT EXISTS rfq_security_events (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      client_key TEXT NOT NULL,
      email_hash TEXT,
      fingerprint TEXT,
      outcome TEXT NOT NULL,
      reason TEXT,
      submission_id TEXT
    )`,
    "CREATE INDEX IF NOT EXISTS idx_rfq_security_client_time ON rfq_security_events (client_key, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_rfq_security_email_time ON rfq_security_events (email_hash, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_rfq_security_fingerprint_time ON rfq_security_events (fingerprint, created_at)",
  ];

  for (const statement of statements) {
    await env.DB.prepare(statement).run().catch(() => {});
  }
};

const handleRfqUpdate = async (request, env, id) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB) {
    return json({ error: "D1 database binding DB is not configured." }, { status: 500 });
  }

  await ensureRfqSchema(env);

  const data = await request.json().catch(() => ({}));
  const status = String(data.status || "New");
  const internalNotes = String(data.internal_notes || data.internalNotes || "");

  if (!allowedRfqStatuses.has(status)) {
    return json({ error: "Invalid RFQ status." }, { status: 400 });
  }

  await env.DB.prepare(`
    UPDATE rfq_submissions
    SET status = ?, internal_notes = ?, updated_at = ?
    WHERE id = ?
  `).bind(status, internalNotes, new Date().toISOString(), id).run();

  return json({ ok: true });
};

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const handleRfqCsv = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB) {
    return json({ error: "D1 database binding DB is not configured." }, { status: 500 });
  }

  await ensureRfqSchema(env);

  const rows = await env.DB.prepare(`
    SELECT created_at, status, name, company, email, country, part_name, process, material,
           annual_quantity, project_stage, details, internal_notes
    FROM rfq_submissions
    WHERE COALESCE(status, 'New') <> 'Spam'
    ORDER BY created_at DESC
    LIMIT 1000
  `).all();

  const headers = [
    "Created At", "Status", "Name", "Company", "Email", "Country", "Part Name",
    "Manufacturing Process", "Material", "Annual Quantity", "Project Stage", "Message", "Internal Notes",
  ];
  const lines = [headers.map(csvEscape).join(",")];

  for (const row of rows.results || []) {
    lines.push([
      row.created_at, row.status, row.name, row.company, row.email, row.country, row.part_name,
      row.process, row.material, row.annual_quantity || row.quantity, row.project_stage, row.details, row.internal_notes,
    ].map(csvEscape).join(","));
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="metalcorex-rfqs.csv"`,
      "cache-control": "no-store",
    },
  });
};

const dateDaysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const loadDashboardData = async (env) => {
  if (!env.DB) {
    return emptyDashboard;
  }

  await ensureRfqSchema(env);

  const today = new Date().toISOString().slice(0, 10);
  const last7 = dateDaysAgo(7);
  const last14 = dateDaysAgo(14);
  const last30 = dateDaysAgo(30);

  const [rfqStats, spamStats, fileStats, visitStats, dailyVisits, topPages, countries, recentRfqs] = await Promise.all([
    env.DB.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last30
      FROM rfq_submissions
      WHERE COALESCE(status, 'New') <> 'Spam'
    `).bind(last7, last30).first(),
    env.DB.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7
      FROM rfq_submissions
      WHERE status = 'Spam'
    `).bind(last7).first(),
    env.DB.prepare(`
      SELECT COUNT(f.id) AS total_files, COALESCE(SUM(f.size), 0) AS total_size
      FROM rfq_files f
      JOIN rfq_submissions r ON r.id = f.submission_id
      WHERE COALESCE(r.status, 'New') <> 'Spam'
    `).first(),
    env.DB.prepare(`
      SELECT
        COUNT(*) AS total_views,
        SUM(CASE WHEN substr(created_at, 1, 10) = ? THEN 1 ELSE 0 END) AS today_views,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7_views,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last30_views,
        COUNT(DISTINCT CASE WHEN created_at >= ? THEN visitor_key END) AS unique_last30
      FROM analytics_events
    `).bind(today, last7, last30, last30).first(),
    env.DB.prepare(`
      SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_key) AS visitors
      FROM analytics_events
      WHERE created_at >= ?
      GROUP BY day
      ORDER BY day ASC
    `).bind(last14).all(),
    env.DB.prepare(`
      SELECT path, COUNT(*) AS views
      FROM analytics_events
      WHERE created_at >= ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 6
    `).bind(last30).all(),
    env.DB.prepare(`
      SELECT COALESCE(NULLIF(country, ''), 'Unknown') AS country, COUNT(*) AS views
      FROM analytics_events
      WHERE created_at >= ?
      GROUP BY country
      ORDER BY views DESC
      LIMIT 6
    `).bind(last30).all(),
    env.DB.prepare(`
      SELECT id, created_at, name, company, email, country, part_name, process, material, annual_quantity, quantity, status
      FROM rfq_submissions
      WHERE COALESCE(status, 'New') <> 'Spam'
      ORDER BY created_at DESC
      LIMIT 5
    `).all(),
  ]);

  return {
    metrics: {
      rfqsTotal: Number(rfqStats?.total || 0),
      rfqsLast7: Number(rfqStats?.last7 || 0),
      rfqsLast30: Number(rfqStats?.last30 || 0),
      spamTotal: Number(spamStats?.total || 0),
      spamLast7: Number(spamStats?.last7 || 0),
      filesTotal: Number(fileStats?.total_files || 0),
      filesSize: Number(fileStats?.total_size || 0),
      viewsTotal: Number(visitStats?.total_views || 0),
      viewsToday: Number(visitStats?.today_views || 0),
      viewsLast7: Number(visitStats?.last7_views || 0),
      viewsLast30: Number(visitStats?.last30_views || 0),
      uniqueLast30: Number(visitStats?.unique_last30 || 0),
    },
    dailyVisits: dailyVisits.results || [],
    topPages: topPages.results || [],
    countries: countries.results || [],
    recentRfqs: recentRfqs.results || [],
  };
};

const handleDashboardGet = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB) {
    return json({ error: "D1 database binding DB is not configured." }, { status: 500 });
  }

  return json(await loadDashboardData(env));
};

const handleZohoSummaryGet = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return json(await loadZohoSummary(env));
  } catch (error) {
    return json({
      configured: true,
      error: error.message || "Could not load Zoho Inventory data.",
    }, { status: 502 });
  }
};

const ensureSiteMediaSchema = async (env) => {
  if (!env.DB) {
    throw new Error("D1 database binding DB is not configured.");
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS site_media (
      slot_key TEXT PRIMARY KEY,
      object_key TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      alt_text TEXT,
      updated_at TEXT NOT NULL
    )
  `).run();
};

const siteMediaExtension = (mimeType) => ({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
})[mimeType] || "";

const siteMediaHasValidSignature = (bytes, mimeType) => {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }

  if (mimeType === "image/webp") {
    return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  }

  if (mimeType === "image/avif") {
    const signature = new TextDecoder().decode(bytes.slice(4, 32));
    return signature.includes("ftyp") && /avif|avis/.test(signature);
  }

  return false;
};

const loadSiteMediaRows = async (env) => {
  if (!env.DB) return [];
  await ensureSiteMediaSchema(env);
  const result = await env.DB.prepare(`
    SELECT slot_key, object_key, mime_type, size, alt_text, updated_at
    FROM site_media
  `).all();
  return result.results || [];
};

const siteMediaPublicItem = (slot, row) => ({
  key: slot.key,
  url: row ? `/site-media/${encodeURIComponent(slot.key)}?v=${encodeURIComponent(row.updated_at)}` : slot.defaultUrl,
  alt: row?.alt_text || slot.alt,
  updatedAt: row?.updated_at || null,
  isCustom: Boolean(row),
});

const handleSiteMediaPublicGet = async (env) => {
  const rows = await loadSiteMediaRows(env);
  const rowMap = new Map(rows.map((row) => [row.slot_key, row]));
  const items = SITE_MEDIA_SLOTS.map((slot) => siteMediaPublicItem(slot, rowMap.get(slot.key)));

  return json(
    { items },
    { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } }
  );
};

const handleSiteMediaAdminGet = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await loadSiteMediaRows(env);
  const rowMap = new Map(rows.map((row) => [row.slot_key, row]));
  const items = SITE_MEDIA_SLOTS.map((slot) => {
    const row = rowMap.get(slot.key);
    return {
      ...slot,
      ...siteMediaPublicItem(slot, row),
      size: Number(row?.size || 0),
      mimeType: row?.mime_type || "",
    };
  });

  return json({ items }, { headers: { "cache-control": "no-store" } });
};

const handleSiteMediaAdminPost = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB || !env.RFQ_FILES) {
    return json({ error: "Website image storage is not configured." }, { status: 500 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > SITE_MEDIA_MAX_SIZE + 512 * 1024) {
    return json({ error: "Image must be 8 MB or smaller." }, { status: 413 });
  }

  const data = await request.formData().catch(() => null);
  const slotKey = String(data?.get("slot") || "");
  const slot = SITE_MEDIA_SLOT_MAP.get(slotKey);
  const file = data?.get("file");
  const altText = String(data?.get("alt") || "").trim().slice(0, 220);

  if (!slot) {
    return json({ error: "Unknown website image position." }, { status: 400 });
  }

  if (!(file instanceof File) || !file.size) {
    return json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (file.size > SITE_MEDIA_MAX_SIZE) {
    return json({ error: "Image must be 8 MB or smaller." }, { status: 413 });
  }

  const mimeType = String(file.type || "").toLowerCase();
  const extension = siteMediaExtension(mimeType);
  if (!extension) {
    return json({ error: "Use a JPG, PNG, WebP, or AVIF image." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!siteMediaHasValidSignature(bytes, mimeType)) {
    return json({ error: "The selected file does not match its image format." }, { status: 415 });
  }

  await ensureSiteMediaSchema(env);
  const existing = await env.DB.prepare(`
    SELECT object_key FROM site_media WHERE slot_key = ?
  `).bind(slotKey).first();
  const updatedAt = new Date().toISOString();
  const objectKey = `site-media/${slotKey}/${crypto.randomUUID()}.${extension}`;

  await env.RFQ_FILES.put(objectKey, bytes, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      slot: slotKey,
      originalName: String(file.name || "image").slice(0, 180),
    },
  });

  try {
    await env.DB.prepare(`
      INSERT INTO site_media (slot_key, object_key, mime_type, size, alt_text, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot_key) DO UPDATE SET
        object_key = excluded.object_key,
        mime_type = excluded.mime_type,
        size = excluded.size,
        alt_text = excluded.alt_text,
        updated_at = excluded.updated_at
    `).bind(slotKey, objectKey, mimeType, file.size, altText || slot.alt, updatedAt).run();
  } catch (error) {
    await env.RFQ_FILES.delete(objectKey);
    throw error;
  }

  if (existing?.object_key && existing.object_key !== objectKey) {
    await env.RFQ_FILES.delete(existing.object_key);
  }

  return json({
    ok: true,
    item: siteMediaPublicItem(slot, {
      alt_text: altText || slot.alt,
      updated_at: updatedAt,
    }),
  });
};

const handleSiteMediaAdminDelete = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.DB || !env.RFQ_FILES) {
    return json({ error: "Website image storage is not configured." }, { status: 500 });
  }

  const slotKey = new URL(request.url).searchParams.get("slot") || "";
  const slot = SITE_MEDIA_SLOT_MAP.get(slotKey);
  if (!slot) {
    return json({ error: "Unknown website image position." }, { status: 400 });
  }

  await ensureSiteMediaSchema(env);
  const existing = await env.DB.prepare(`
    SELECT object_key FROM site_media WHERE slot_key = ?
  `).bind(slotKey).first();

  await env.DB.prepare("DELETE FROM site_media WHERE slot_key = ?").bind(slotKey).run();
  if (existing?.object_key) {
    await env.RFQ_FILES.delete(existing.object_key);
  }

  return json({ ok: true, item: siteMediaPublicItem(slot, null) });
};

const handleSiteMediaFileGet = async (request, env, slotKey) => {
  const slot = SITE_MEDIA_SLOT_MAP.get(slotKey);
  if (!slot || !env.DB || !env.RFQ_FILES) {
    return json({ error: "Image not found" }, { status: 404 });
  }

  await ensureSiteMediaSchema(env);
  const row = await env.DB.prepare(`
    SELECT object_key, mime_type, updated_at FROM site_media WHERE slot_key = ?
  `).bind(slotKey).first();

  if (!row?.object_key) {
    return new Response(null, {
      status: 302,
      headers: {
        location: slot.defaultUrl,
        "cache-control": "public, max-age=60",
      },
    });
  }

  const object = await env.RFQ_FILES.get(row.object_key);
  if (!object) {
    return new Response(null, {
      status: 302,
      headers: {
        location: slot.defaultUrl,
        "cache-control": "public, max-age=60",
      },
    });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || row.mime_type || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      "etag": object.httpEtag || `"${row.updated_at}"`,
    },
  });
};

const handleFileGet = async (request, env) => {
  if (!(await requireAdminSession(request, env))) {
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
};

const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  const legacyPageRedirects = new Map([
    ["/blog-cnc-machining-basics.html", "/blog/design-tips/professional-audio-parts-that-benefit-from-cnc-machining/"],
    ["/blog-cnc-tolerances.html", "/blog/cnc-machining/cnc-machining-tolerances-for-aluminum-audio-hardware/"],
    ["/blog-material-selection.html", "/materials"],
    ["/blog-sheet-metal-fabrication.html", "/blog/sheet-metal/speaker-cabinet-metal-parts-brackets-plates-handles-and-inserts/"],
    ["/blog-surface-treatment-guide.html", "/surface-treatment"],
  ]);
  const legacyDestination = legacyPageRedirects.get(url.pathname);

  if (legacyDestination && (request.method === "GET" || request.method === "HEAD")) {
    return new Response(null, {
      status: 301,
      headers: {
        location: legacyDestination,
        "cache-control": "public, max-age=86400",
      },
    });
  }

    if ((url.pathname === "/admin-login" || url.pathname === "/admin-login/") && request.method === "POST") {
      return handleAdminFormPost(request, env);
    }

    if (url.pathname === "/admin-logout" || url.pathname === "/admin-logout/") {
      return handleAdminLogout();
    }

    if (url.pathname === "/admin-login" || url.pathname === "/admin-login/") {
      if (await requireAdminSession(request, env)) {
        return new Response(null, {
          status: 303,
          headers: {
            location: "/admin",
            "cache-control": "no-store",
          },
        });
      }

      return adminLoginResponse();
    }

    if ((url.pathname === "/admin" || url.pathname === "/admin/") && request.method === "POST") {
      return handleAdminFormPost(request, env);
    }

    if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname === "/admin.html") {
      if (!(await requireAdminSession(request, env))) {
        return new Response(null, {
          status: 303,
          headers: {
            location: "/admin-login",
            "cache-control": "no-store",
          },
        });
      }

      return adminResponse(await loadDashboardData(env));
    }

    if (url.pathname === "/api/rfq" && request.method === "POST") {
      return handleRfqPost(request, env);
    }

    if (url.pathname === "/api/track" && request.method === "POST") {
      return handleTrackPost(request, env);
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
      return handleLogout();
    }

    if (url.pathname === "/api/rfq" && request.method === "GET") {
      return handleRfqGet(request, env);
    }

    if (url.pathname === "/api/rfq.csv" && request.method === "GET") {
      return handleRfqCsv(request, env);
    }

    const rfqUpdateMatch = url.pathname.match(/^\/api\/rfq\/([^/]+)$/);
    if (rfqUpdateMatch && request.method === "PATCH") {
      return handleRfqUpdate(request, env, decodeURIComponent(rfqUpdateMatch[1]));
    }

    if (url.pathname === "/api/dashboard" && request.method === "GET") {
      return handleDashboardGet(request, env);
    }

    if (url.pathname === "/api/site-media" && request.method === "GET") {
      return handleSiteMediaPublicGet(env);
    }

    if (url.pathname === "/api/admin/site-media" && request.method === "GET") {
      return handleSiteMediaAdminGet(request, env);
    }

    if (url.pathname === "/api/admin/site-media" && request.method === "POST") {
      return handleSiteMediaAdminPost(request, env);
    }

    if (url.pathname === "/api/admin/site-media" && request.method === "DELETE") {
      return handleSiteMediaAdminDelete(request, env);
    }

    const siteMediaMatch = url.pathname.match(/^\/site-media\/([^/]+)$/);
    if (siteMediaMatch && (request.method === "GET" || request.method === "HEAD")) {
      return handleSiteMediaFileGet(request, env, decodeURIComponent(siteMediaMatch[1]));
    }

    if (url.pathname === "/api/zoho/summary" && request.method === "GET") {
      return handleZohoSummaryGet(request, env);
    }

    if (url.pathname === "/api/files" && request.method === "GET") {
      return handleFileGet(request, env);
    }

    if (url.pathname === "/rfq-admin.js") {
      return noStore(await env.ASSETS.fetch(request));
    }

  const assetResponse = await env.ASSETS.fetch(request);
  return withAssetCaching(assetResponse, url.pathname);
};

export default {
  async fetch(request, env, ctx) {
    return withSecurityHeaders(await handleRequest(request, env, ctx));
  },
};
