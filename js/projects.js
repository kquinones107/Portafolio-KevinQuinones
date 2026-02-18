import { CONFIG } from "../data/config.js";
import { FALLBACK_PROJECTS } from "../data/fallback-projects.js";
import { state } from "./state.js";
import { el, $, normalize, setPressed, inferType, typeLabel, typeBadgeClass, prettyDate } from "./ui.js";
import { getUser, getRepos } from "./services/github.js";

function repoCard(r) {
  const type = inferType(r);
  const badge = el("span", { className: `badge-pill ${typeBadgeClass(type)}` }, [typeLabel(type)]);

  const tags = el(
    "div",
    { className: "tags" },
    (r.topics || []).slice(0, 6).map((t) => el("span", { className: "tag" }, [t]))
  );

  const actions = el("div", { className: "project__actions" }, [
    el("a", { className: "btn btn--primary", href: `project.html?repo=${encodeURIComponent(r.name)}` }, ["Ver detalle"]),
    el("a", { className: "btn btn--ghost", href: r.html_url, target: "_blank", rel: "noreferrer" }, ["GitHub"]),
    r.homepage
      ? el("a", { className: "btn btn--ghost", href: r.homepage, target: "_blank", rel: "noreferrer" }, ["Demo"])
      : null,
  ].filter(Boolean));

  const body = el("div", { className: "project__body" }, [
    el("div", { className: "project__top" }, [
      el("h3", {}, [r.name]),
      badge,
    ]),
    el("p", { className: "muted project__meta" }, [r.description || "Sin descripción."]),
    el("p", { className: "muted small" }, [`${r.language || "—"} · Actualizado: ${prettyDate(r.updated_at)}`]),
    tags,
    actions,
  ]);

  const imagePath = `assets/img/projects/${r.name.toLowerCase()}.png`;
  const img = el("img", {
    src: imagePath,
    alt: `Screenshot de ${r.name}`,
    loading: "lazy",
    onerror: (e) => e.target.remove(),
  });

  const media = el("div", { className: "project__media" }, [
    img,
    el("strong", {}, [typeLabel(type)])
  ]);

  return el("article", { className: "card project", "data-type": type }, [media, body]);
}

function renderProjects(list) {
  const root = $("#projectsGrid");
  root.innerHTML = "";
  list.forEach((r) => root.append(repoCard(r)));
  $("#projectsCount").textContent = `${list.length} proyecto(s) mostrado(s).`;
}

function getFilteredRepos() {
  const q = normalize(state.query);
  return state.repos.filter((r) => {
    const type = inferType(r);
    const matchType = state.filter === "all" || state.filter === type;

    const haystack = normalize(
      [r.name, r.description, r.language, ...(r.topics || [])].join(" ")
    );
    const matchQuery = !q || haystack.includes(q);

    return matchType && matchQuery;
  });
}

function setupControls() {
  const buttons = Array.from(document.querySelectorAll(".filter"));
  const search = $("#projectSearch");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      setPressed(buttons, btn);
      renderProjects(getFilteredRepos());
    });
  });

  search.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderProjects(getFilteredRepos());
  });
}

function updateHeaderLinks() {
  const gh = document.getElementById("btnGithub");
  const li = document.getElementById("btnLinkedIn");
  if (gh) gh.href = `https://github.com/${CONFIG.githubUsername}`;
  if (li) li.href = "https://www.linkedin.com/in/kevin-jair-quinones-sierra-aa1b26265";
}

async function loadGitHub() {
  try {
    const repos = await getRepos(CONFIG.githubUsername);
    state.repos = repos;
  } catch (err) {
    console.error(err);
    state.repos = FALLBACK_PROJECTS;
  }
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  updateHeaderLinks();
  setupControls();

  await loadGitHub();
  renderProjects(getFilteredRepos());
}

init();
