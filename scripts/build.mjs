#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const contentPath = path.join(root, "site-editor", "content.json");
const stylesPath = path.join(root, "src", "styles.css");
const publicDir = path.join(root, "public");

const content = JSON.parse(await readFile(contentPath, "utf8"));
const styles = await readFile(stylesPath, "utf8");

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await cp(publicDir, dist, { recursive: true });
await writeFile(path.join(dist, "assets", "styles.css"), styles);
await writeFile(path.join(dist, "index.html"), renderPage(content));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function telHref(phone) {
  return `tel:${String(phone || "").replace(/[^+\d]/g, "")}`;
}

function renderList(items, renderer) {
  return (items || []).map(renderer).join("\n");
}

function iconSvg(name) {
  const icons = {
    shield: `<path d="M12 5l8-3 8 3v8c0 9-6 14-8 15-2-1-8-6-8-15V5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`,
    truck: `<path d="M4 18V8h12v10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 12h5l3 3v3h-8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="8" cy="20" r="2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="20" cy="20" r="2" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    pin: `<path d="M20 21c4-5 6-8 6-11a6 6 0 10-12 0c0 3 2 6 6 11z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="10" r="2.2" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    clock: `<path d="M20 7a13 13 0 1013 13A13 13 0 0020 7z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M20 13v7l5 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    trowel: `<path d="M11 21l9-9 6 6-9 9H11v-6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 12l-3-3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
    excavator: `<path d="M11 20h7l3 3h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M10 18V9h9v6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 12l5 3-2 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="23" r="2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="22" cy="23" r="2" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    rebar: `<path d="M10 26V14l10-6 10 6v12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 26V13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 26V10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M25 26V13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
    drain: `<path d="M10 10c6-2 14-2 20 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 16c6-2 10-2 16 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18c0 5-4 8-4 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M26 18c0 5-4 8-4 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
    bricks: `<path d="M10 14h12v6H10z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M22 20h12v6H22z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 20h12v6H10z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M22 14h12v6H22z" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    clipboard: `<path d="M14 10h12v4H14z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 14h16v18H12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 18h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M16 22h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
    phone: `<path d="M14 9l4-3 6 6-3 4c2 4 5 7 9 9l4-3 6 6-3 4c-3 2-7 2-10 1-10-4-18-12-22-22-1-3-1-7 1-10z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`,
  };
  const inner = icons[name] || icons.shield;
  return `<svg viewBox="0 0 40 32" aria-hidden="true" focusable="false">${inner}</svg>`;
}

function brandMarkSvg() {
  return `<svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <rect width="64" height="64" rx="18" fill="none" stroke="rgba(22,58,74,0.42)" stroke-width="4"/>
    <path d="M20 46l10-30h10l10 30" fill="none" stroke="rgba(22,58,74,0.9)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M25 31h16" fill="none" stroke="rgba(255,122,47,0.92)" stroke-width="6" stroke-linecap="round"/>
    <path d="M43 16v30" fill="none" stroke="rgba(22,58,74,0.9)" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

function renderHeadline(headline) {
  const parts = String(headline || "").split(/\r?\n/).filter(Boolean);
  if (parts.length <= 1) return escapeHtml(headline);
  return parts.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
}

function renderPage(data) {
  const business = data.business || {};
  const hero = data.hero || {};
  const services = data.services || {};
  const work = data.work || {};
  const serviceArea = data.service_area || {};
  const contact = data.contact || {};
  const form = data.form || {};
  const footer = data.footer || {};
  const chatbot = data.chatbot || {};
  const phone = business.phone || "";

  const title = `${business.name} | ${business.location}`;
  const description = hero.body || business.tagline || "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="preload" as="image" href="${escapeHtml(hero.image)}" />
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body>
    <div class="top-bar">
      <div class="container header" id="top">
        <a class="brand" href="#top" aria-label="${escapeHtml(business.name)} home">
          <span class="brand-mark">${brandMarkSvg()}</span>
          <span class="brand-text">
            <strong>${escapeHtml(business.name)}</strong>
            <small>${escapeHtml(business.location)}</small>
          </span>
        </a>

        <nav class="nav" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#service-area">Service Area</a>
          <a href="#contact">Contact</a>
        </nav>

        <div class="header-actions">
          <a class="button primary" href="#contact">${escapeHtml(hero.primary_cta_text || "Request a Quote")}</a>
          <a class="button secondary" href="${telHref(phone)}">
            ${iconSvg("phone")}
            <span>${escapeHtml(hero.secondary_cta_text || `Call ${phone}`)}</span>
          </a>
        </div>
      </div>
    </div>

    <main>
      <section class="hero">
        <div class="container hero-shell">
          <div class="hero-grid">
            <div class="hero-copy">
              <h1>${renderHeadline(hero.headline)}</h1>
              <div class="hero-underline" aria-hidden="true"></div>
              <p>${escapeHtml(hero.body)}</p>
              <div class="hero-actions-row">
                <a class="button primary" href="#contact">${escapeHtml(hero.primary_cta_text || "Request a Quote")}</a>
                <a class="button tertiary" href="#services">${escapeHtml(hero.tertiary_cta_text || "View Services")}</a>
              </div>
              <div class="trust-row" role="list">
                ${renderList(data.trust || [], (item) => `<div class="trust-chip" role="listitem">
                  ${iconSvg(item.icon)}
                  <span>${escapeHtml(item.label)}</span>
                </div>`)}
              </div>
            </div>
            <div class="hero-media" aria-hidden="true">
              <img src="${escapeHtml(hero.image)}" alt="${escapeHtml(hero.image_alt)}" />
            </div>
          </div>
        </div>
      </section>

      <section id="services" class="section">
        <div class="container">
          <h2>${escapeHtml(services.heading)}</h2>
          <p class="section-intro">${escapeHtml(services.intro)}</p>
          <div class="services-grid">
            ${renderList(services.items || [], (service) => `<article class="service-card">
              <div class="service-icon" aria-hidden="true">${iconSvg(service.icon)}</div>
              <div>
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.description)}</p>
              </div>
            </article>`)}
          </div>

          <div class="jobs-band">
            <strong>${escapeHtml(services.jobs_label || "Typical jobs")}</strong>
            <div class="pill-row" role="list">
              ${renderList(services.jobs || [], (item) => `<span class="pill" role="listitem">${escapeHtml(item)}</span>`)}
            </div>
            <a class="button tertiary" href="#contact">${escapeHtml(services.jobs_cta || "Request a Quote")}</a>
          </div>
        </div>
      </section>

      <section id="work" class="section">
        <div class="container">
          <h2>${escapeHtml(work.heading)}</h2>
          <p class="section-intro">${escapeHtml(work.intro)}</p>
          <div class="work-grid">
            ${renderList(work.items || [], (item) => `<article class="work-card">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy" />
              <div class="work-body">
                <span class="tag">${escapeHtml(item.tag)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>`)}
          </div>
        </div>
      </section>

      <section id="service-area" class="section area-contact">
        <div class="container">
          <h2>${escapeHtml(serviceArea.heading)}</h2>
          <p class="section-intro">${escapeHtml(serviceArea.body)}</p>
          <div class="area-grid">
            <div class="panel">
              <h3>${escapeHtml(serviceArea.card_title || "Service area")}</h3>
              <p>${escapeHtml(serviceArea.card_body)}</p>
              <div class="map-chip" aria-hidden="true">${escapeHtml(serviceArea.map_label || "Mini-Cassia")}</div>
              <ul class="places">
                ${renderList(serviceArea.places || [], (place) => `<li>${escapeHtml(place)}</li>`)}
              </ul>
              <p>${escapeHtml(serviceArea.note)}</p>
            </div>

            <div class="panel" id="contact">
              <h3>${escapeHtml(contact.heading)}</h3>
              <p>${escapeHtml(contact.body)}</p>
              <form class="inquiry-form" data-inquiry-form>
                <label>
                  <span>${escapeHtml(form.name_label || "Name")}</span>
                  <input name="name" autocomplete="name" required />
                </label>
                <label>
                  <span>${escapeHtml(form.phone_label || "Phone")}</span>
                  <input name="phone" autocomplete="tel" required />
                </label>
                <label class="span-2">
                  <span>${escapeHtml(form.email_label || "Email (optional)")}</span>
                  <input name="email" type="email" autocomplete="email" />
                </label>
                <label class="span-2">
                  <span>${escapeHtml(form.location_label || "Job location")}</span>
                  <input name="job_location" autocomplete="street-address" required />
                </label>
                <label class="span-2">
                  <span>${escapeHtml(form.service_label || "Service needed")}</span>
                  <select name="service_needed" required>
                    ${renderList(form.service_options || [], (option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)}
                  </select>
                </label>
                <label class="span-2">
                  <span>${escapeHtml(form.details_label || "Project details")}</span>
                  <textarea name="message" required></textarea>
                </label>
                <input name="interest_type" type="hidden" value="construction inquiry" />
                <button class="button primary span-2" type="submit">${escapeHtml(form.submit_text || "Send request")}</button>
                <p class="form-note">${escapeHtml(contact.form_note)}</p>
                <p class="form-status" data-form-status role="status"></p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <strong>${escapeHtml(business.name)}</strong>
          <p>${escapeHtml(footer.tagline)}</p>
          <div class="footer-links">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <p>${escapeHtml(footer.legal)}</p>
      </div>
    </footer>

    <script>
      const form = document.querySelector("[data-inquiry-form]");
      const status = document.querySelector("[data-form-status]");
      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Sending your request...";
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.source_page = window.location.href;
        try {
          const response = await fetch("/api/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.ok === false) {
            throw new Error(data.error || "Could not send the inquiry.");
          }
          form.reset();
          status.textContent = "Request sent. We’ll follow up as soon as we can.";
        } catch (error) {
          status.textContent = error.message || "Something went wrong. Please call instead.";
        }
      });
    </script>

    <script>
      window.BusinessStubChatbot = {
        enabled: true,
        endpoint: "/api/chatbot",
        targetType: "stub",
        stubSlug: "${escapeHtml(String(data.stub_slug || ""))}",
        title: "${escapeHtml(String(chatbot.title || "Business assistant"))}",
        greeting: "${escapeHtml(String(chatbot.greeting || "Ask a question and we can help with next steps."))}",
        launcherLabel: "${escapeHtml(String(chatbot.launcher_label || "Ask a question"))}"
      };
    </script>
    <script src="https://businessstub.com/assets/chatbot.js" defer></script>
  </body>
</html>`;
}
