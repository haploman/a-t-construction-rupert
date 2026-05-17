export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inquiry") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204 });
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST, OPTIONS" });
      }
      return handleInquiry(request, env);
    }

    if (url.pathname === "/api/chatbot") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204 });
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST, OPTIONS" });
      }
      return handleChatbot(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, error: "Not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleInquiry(request, env) {
  const intakeKey = String(env.STUB_INTAKE_KEY || env.BUSINESSSTUB_INTAKE_KEY || "").trim();
  if (!intakeKey) {
    return json({ ok: false, error: "Inquiry routing is not configured yet." }, 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "Invalid inquiry payload." }, 400);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const jobLocation = String(body.job_location || "").trim();
  const serviceNeeded = String(body.service_needed || "").trim();
  if (!name || !message) {
    return json({ ok: false, error: "Name and project details are required." }, 400);
  }

  const stitchedMessage = [
    serviceNeeded ? `Service needed: ${serviceNeeded}` : "",
    jobLocation ? `Job location: ${jobLocation}` : "",
    message ? `Details: ${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    stub_slug: String(env.STUB_SLUG || "a-t-construction-rupert").trim(),
    name,
    email,
    message: stitchedMessage || message,
    phone: String(body.phone || "").trim(),
    company: String(body.company || "").trim(),
    interest_type: String(body.interest_type || "construction inquiry").trim(),
    source_page: String(body.source_page || request.url).trim(),
  };

  const base = String(env.BUSINESSSTUB_API_BASE || "https://businessstub.com").replace(/\/+$/, "");
  const upstream = await fetch(`${base}/api/stub-site-inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Stub-Intake-Key": intakeKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!upstream.ok || data?.ok === false) {
    return json({ ok: false, error: data?.error || "Inquiry could not be sent." }, upstream.status || 502);
  }

  return json({ ok: true });
}

async function handleChatbot(request, env) {
  const intakeKey = String(env.STUB_INTAKE_KEY || env.BUSINESSSTUB_INTAKE_KEY || "").trim();
  if (!intakeKey) {
    return json({ error: "STUB_INTAKE_KEY is not configured" }, 500);
  }

  const body = await request.json().catch(() => null);
  if (!body || !String(body.message || "").trim()) {
    return json({ error: "Message is required" }, 400);
  }

  const base = String(env.BUSINESSSTUB_API_BASE || "https://businessstub.com").replace(/\/+$/, "");
  const upstream = await fetch(`${base}/api/chatbot/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Stub-Intake-Key": intakeKey,
    },
    body: JSON.stringify({
      ...body,
      target_type: "stub",
      stub_slug: String(env.STUB_SLUG || body.stub_slug || "").trim(),
      source_page: body.source_page || request.headers.get("referer") || "",
    }),
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") || "application/json" },
  });
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
