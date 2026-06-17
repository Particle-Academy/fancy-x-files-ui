/**
 * Local render logic — produces the real text/XML each well-known file will
 * become on disk, mirroring the output format of the `fancy-x-files` PHP / JS
 * packages. Kept here (rather than imported) so the preview is real + the
 * package builds standalone.
 */
import type {
  AgentsModel,
  HumansTxtModel,
  LlmsTxtModel,
  RobotsModel,
  SecurityTxtModel,
  SitemapModel,
  XFileKind,
  XFilesModel,
} from "./model.js";

/** Render a robots.txt body. Protected paths are pinned Disallow everywhere. */
export function renderRobots(model: RobotsModel): string {
  const lines: string[] = [];
  const groups = model.groups.length
    ? model.groups
    : [{ userAgents: ["*"], allow: [], disallow: [] }];

  groups.forEach((group, i) => {
    if (i > 0) lines.push("");
    const agents = group.userAgents.length ? group.userAgents : ["*"];
    for (const ua of agents) lines.push(`User-agent: ${ua}`);

    // Protected paths are forced Disallow on every group and can never appear
    // in Allow (the editor guards that; we belt-and-braces it here too).
    const protectedSet = new Set(model.protectedPaths);
    for (const path of model.protectedPaths) lines.push(`Disallow: ${path}`);
    for (const path of group.disallow) {
      if (!protectedSet.has(path)) lines.push(`Disallow: ${path}`);
    }
    for (const path of group.allow) {
      if (!protectedSet.has(path)) lines.push(`Allow: ${path}`);
    }
    if (group.crawlDelay != null && group.crawlDelay > 0) {
      lines.push(`Crawl-delay: ${group.crawlDelay}`);
    }
  });

  if (model.host) {
    lines.push("");
    lines.push(`Host: ${model.host}`);
  }
  if (model.sitemaps.length) {
    lines.push("");
    for (const sm of model.sitemaps) lines.push(`Sitemap: ${sm}`);
  }
  return lines.join("\n") + "\n";
}

/** Render an RFC 9116 security.txt body. */
export function renderSecurityTxt(model: SecurityTxtModel): string {
  const lines: string[] = [];
  for (const c of model.contact) lines.push(`Contact: ${c}`);
  if (model.expires) lines.push(`Expires: ${model.expires}`);
  if (model.encryption) lines.push(`Encryption: ${model.encryption}`);
  if (model.acknowledgments)
    lines.push(`Acknowledgments: ${model.acknowledgments}`);
  if (model.preferredLanguages)
    lines.push(`Preferred-Languages: ${model.preferredLanguages}`);
  if (model.canonical) lines.push(`Canonical: ${model.canonical}`);
  if (model.policy) lines.push(`Policy: ${model.policy}`);
  if (model.hiring) lines.push(`Hiring: ${model.hiring}`);
  return lines.join("\n") + "\n";
}

/** Render an llms.txt Markdown document. */
export function renderLlmsTxt(model: LlmsTxtModel): string {
  const lines: string[] = [];
  lines.push(`# ${model.title || "Untitled"}`);
  if (model.summary) {
    lines.push("");
    lines.push(`> ${model.summary}`);
  }
  if (model.details) {
    lines.push("");
    lines.push(model.details);
  }
  for (const section of model.sections) {
    lines.push("");
    lines.push(`## ${section.name}`);
    lines.push("");
    for (const link of section.links) {
      const notes = link.notes ? `: ${link.notes}` : "";
      lines.push(`- [${link.title}](${link.url})${notes}`);
    }
  }
  return lines.join("\n") + "\n";
}

/** Render a humans.txt body. */
export function renderHumansTxt(model: HumansTxtModel): string {
  const lines: string[] = [];
  if (model.team.length) {
    lines.push("/* TEAM */");
    for (const m of model.team) {
      lines.push(`${m.role}: ${m.name}`);
      if (m.contact) lines.push(`Contact: ${m.contact}`);
    }
  }
  if (model.thanks && model.thanks.length) {
    if (lines.length) lines.push("");
    lines.push("/* THANKS */");
    for (const t of model.thanks) lines.push(t);
  }
  if (model.site) {
    if (lines.length) lines.push("");
    lines.push("/* SITE */");
    lines.push(model.site);
  }
  return lines.join("\n") + "\n";
}

const xmlEscape = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Render a sitemap.xml document. */
export function renderSitemap(model: SitemapModel): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const u of model.urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${xmlEscape(u.loc)}</loc>`);
    if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (u.priority != null)
      lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return lines.join("\n") + "\n";
}

/** Render the /AGENTS register as JSON. */
export function renderAgents(model: AgentsModel): string {
  const doc: Record<string, unknown> = {
    agents: model.agents.map((a) => {
      const out: Record<string, unknown> = { id: a.id, policy: a.policy };
      if (a.name) out.name = a.name;
      if (a.url) out.url = a.url;
      if (a.scope) out.scope = a.scope;
      return out;
    }),
  };
  if (model.contact) doc.contact = model.contact;
  return JSON.stringify(doc, null, 2) + "\n";
}

/** Render any well-known file from its model. */
export function renderXFile(kind: XFileKind, model: unknown): string {
  switch (kind) {
    case "robots":
      return renderRobots(model as RobotsModel);
    case "securityTxt":
      return renderSecurityTxt(model as SecurityTxtModel);
    case "llmsTxt":
      return renderLlmsTxt(model as LlmsTxtModel);
    case "humansTxt":
      return renderHumansTxt(model as HumansTxtModel);
    case "sitemap":
      return renderSitemap(model as SitemapModel);
    case "agents":
      return renderAgents(model as AgentsModel);
  }
}

/** Pull a single model out of the aggregate by kind. */
export function pickModel(value: XFilesModel, kind: XFileKind): unknown {
  return value[kind];
}
