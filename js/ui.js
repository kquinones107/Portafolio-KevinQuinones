export const $ = (sel) => document.querySelector(sel);

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [k, v] of Object.entries(props)) {
    if (k === "className") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, String(v));
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }

  return node;
}

export function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function setPressed(buttons, activeBtn) {
  buttons.forEach((b) => b.setAttribute("aria-pressed", b === activeBtn ? "true" : "false"));
}

export function prettyDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

// Deducción simple de tipo según topics/language/nombre (puedes mejorar)
export function inferType(repo) {
  const t = new Set((repo.topics || []).map((x) => x.toLowerCase()));
  const name = (repo.name || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  if (t.has("react-native") || t.has("expo") || name.includes("mobile") || name.includes("app")) return "mobile";
  if (t.has("backend") || t.has("api") || t.has("nestjs") || t.has("express") || name.includes("api")) return "backend";
  if (t.has("react") || t.has("frontend") || lang.includes("javascript") || lang.includes("typescript")) return "web";
  return "other";
}

export function typeLabel(type) {
  return ({ web: "Web", mobile: "Móvil", backend: "Backend", other: "Otro" })[type] || "Proyecto";
}

export function typeBadgeClass(type) {
  return `badge-pill badge-pill--${type}`;
}
