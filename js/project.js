import { CONFIG } from "../data/config.js";
import { el, $, prettyDate } from "./ui.js";
import { getRepo } from "./services/github.js";

function getRepoParam() {
  const url = new URL(window.location.href);
  return url.searchParams.get("repo");
}

function setStatus(msg) {
  $("#statusDetail").textContent = msg;
}

async function init() {
  const repoName = getRepoParam();

  if (!repoName) {
    $("#repoName").textContent = "Repo no especificado";
    setStatus("Falta el parámetro ?repo=NombreDelRepo");
    return;
  }

  try {
    setStatus("Cargando desde GitHub…");
    const repo = await getRepo(CONFIG.githubUsername, repoName);

    document.title = `${repo.name} | Proyecto`;
    $("#repoName").textContent = repo.name;
    $("#repoMeta").textContent = `Actualizado: ${prettyDate(repo.updated_at)} · Creado: ${prettyDate(repo.created_at)}`;
    $("#repoDesc").textContent = repo.description;

    $("#repoLang").textContent = repo.language;
    $("#repoStars").textContent = String(repo.stargazers_count);
    $("#repoForks").textContent = String(repo.forks_count);
    $("#repoIssues").textContent = String(repo.open_issues_count);
    $("#repoBranch").textContent = repo.default_branch;

    // Links
    $("#repoLink").href = repo.html_url;
    $("#btnCode").href = repo.html_url;

    if (repo.homepage) {
      const demo = $("#btnDemo");
      demo.href = repo.homepage;
      demo.style.display = "";
    }

    // Topics
    const topicsRoot = $("#repoTopics");
    topicsRoot.innerHTML = "";
    (repo.topics || []).forEach((t) => topicsRoot.append(el("span", { className: "tag" }, [t])));

    setStatus("Listo ✅");
  } catch (err) {
    console.error(err);
    $("#repoName").textContent = "Error cargando proyecto";
    setStatus("No se pudo cargar el repo (rate limit o repo no existe).");
  }
}

init();
