// Fetches public repos + social preview thumbnails at build time.
// On failure (offline / rate limited) the committed src/data/repos.json is kept.
import { mkdir, writeFile, access } from 'node:fs/promises';

const USER = 'Kitkhachon-xx';
const OUT = new URL('../src/data/repos.json', import.meta.url);
const THUMBS = new URL('../public/thumbs/', import.meta.url);

const headers = { 'User-Agent': 'myresume-build', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function exists(u) {
  try { await access(u); return true; } catch { return false; }
}

try {
  const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=updated`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const all = await res.json();
  const repos = all.filter((r) => !r.fork && !r.archived && !r.private);

  await mkdir(THUMBS, { recursive: true });
  const out = [];
  for (const r of repos) {
    const file = `${r.name}.png`;
    const target = new URL(file, THUMBS);
    let thumb = null;
    try {
      const img = await fetch(`https://opengraph.githubassets.com/1/${USER}/${r.name}`);
      if (!img.ok) throw new Error(String(img.status));
      await writeFile(target, Buffer.from(await img.arrayBuffer()));
      thumb = `/thumbs/${file}`;
    } catch (e) {
      if (await exists(target)) thumb = `/thumbs/${file}`;
      else console.warn(`thumbnail failed for ${r.name}: ${e.message}`);
    }
    out.push({
      name: r.name,
      url: r.html_url,
      homepage: r.homepage || null,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      topics: r.topics || [],
      updated: r.pushed_at,
      thumb,
    });
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`fetch-repos: ${out.length} repos`);
} catch (e) {
  console.warn(`fetch-repos skipped (${e.message}); using committed data`);
}
