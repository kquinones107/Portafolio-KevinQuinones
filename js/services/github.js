import { CONFIG } from "../../data/config.js";

const API = "https://api.github.com";

function headers() {
  const h = {
    Accept: "application/vnd.github+json",
  };
  if (CONFIG.githubToken) h.Authorization = `Bearer ${CONFIG.githubToken}`;
  return h;
}

async function request(path) {
  const res = await fetch(`${API}${path}`, { headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/**
 * GitHub topics requieren preview o un Accept específico en algunos casos,
 * pero con application/vnd.github+json suele funcionar bien hoy.
 */
export async function getUser(username) {
  return request(`/users/${encodeURIComponent(username)}`);
}

export async function getRepos(username) {
  // per_page máximo 100, ordenado por actualización
  const repos = await request(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
  );

  let filtered = repos;

  if (CONFIG.hideForks) filtered = filtered.filter((r) => !r.fork);
  if (CONFIG.hideArchived) filtered = filtered.filter((r) => !r.archived);

  // Normalizamos campos que usaremos en UI
  return filtered.slice(0, CONFIG.maxRepos).map((r) => ({
    id: String(r.id),
    name: r.name,
    description: r.description || "Sin descripción (puedes agregarla en GitHub).",
    html_url: r.html_url,
    homepage: r.homepage || "",
    language: r.language || "—",
    topics: Array.isArray(r.topics) ? r.topics : [],
    stargazers_count: r.stargazers_count ?? 0,
    forks_count: r.forks_count ?? 0,
    updated_at: r.updated_at,
  }));
}

export async function getRepo(username, repoName) {
  // Endpoint de repo trae menos topics que repos list en algunos casos.
  // Para asegurar topics, hacemos 2 requests:
  const repo = await request(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`);
  const topicsRes = await request(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/topics`
  );

  return {
    id: String(repo.id),
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || "Sin descripción (puedes agregarla en GitHub).",
    html_url: repo.html_url,
    homepage: repo.homepage || "",
    language: repo.language || "—",
    topics: topicsRes?.names || [],
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    updated_at: repo.updated_at,
    created_at: repo.created_at,
    default_branch: repo.default_branch,
    open_issues_count: repo.open_issues_count ?? 0,
  };
}
