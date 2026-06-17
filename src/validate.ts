/**
 * Validation helpers. Each `validate*` returns a flat `string[]` of
 * human-readable issues (empty array == valid). The editors surface these
 * inline, and an embedded agent can call them to check a proposal before
 * handing it back.
 */
import type {
  AgentsModel,
  HumansTxtModel,
  LlmsTxtModel,
  RobotsModel,
  SecurityTxtModel,
  SitemapModel,
  XFileKind,
} from "./model.js";

const looksLikeUrl = (s: string): boolean =>
  /^https?:\/\/\S+$/i.test(s.trim());

export function validateRobots(model: RobotsModel): string[] {
  const issues: string[] = [];
  if (!model.groups.length) {
    issues.push("At least one user-agent group is required.");
  }
  model.groups.forEach((group, i) => {
    const where = `Group ${i + 1}`;
    if (!group.userAgents.length) {
      issues.push(`${where}: needs at least one User-agent (use "*" for all).`);
    }
    // Protected paths must never be Allowed — mirrors PHP protect() safety.
    for (const path of group.allow) {
      if (model.protectedPaths.includes(path)) {
        issues.push(
          `${where}: "${path}" is a protected path and cannot be Allowed. Remove it from Allow or unprotect it.`,
        );
      }
    }
    if (group.crawlDelay != null && group.crawlDelay < 0) {
      issues.push(`${where}: Crawl-delay must be ≥ 0.`);
    }
  });
  for (const sm of model.sitemaps) {
    if (!looksLikeUrl(sm)) {
      issues.push(`Sitemap "${sm}" should be an absolute http(s) URL.`);
    }
  }
  return issues;
}

export function validateSecurityTxt(model: SecurityTxtModel): string[] {
  const issues: string[] = [];
  if (!model.contact.length || model.contact.every((c) => !c.trim())) {
    issues.push("At least one Contact is required (mailto: or https: URI).");
  }
  if (!model.expires) {
    issues.push("Expires is required.");
  } else {
    const when = new Date(model.expires);
    if (Number.isNaN(when.getTime())) {
      issues.push("Expires must be a valid date/time.");
    } else if (when.getTime() <= Date.now()) {
      issues.push("Expires must be a date in the future.");
    }
  }
  return issues;
}

export function validateLlmsTxt(model: LlmsTxtModel): string[] {
  const issues: string[] = [];
  if (!model.title.trim()) issues.push("Title is required.");
  model.sections.forEach((section, i) => {
    if (!section.name.trim()) {
      issues.push(`Section ${i + 1}: needs a name.`);
    }
    section.links.forEach((link, j) => {
      const where = `Section ${i + 1} · link ${j + 1}`;
      if (!link.title.trim()) issues.push(`${where}: needs a title.`);
      if (!looksLikeUrl(link.url)) {
        issues.push(`${where}: URL should be an absolute http(s) URL.`);
      }
    });
  });
  return issues;
}

export function validateHumansTxt(model: HumansTxtModel): string[] {
  const issues: string[] = [];
  model.team.forEach((m, i) => {
    if (!m.role.trim()) issues.push(`Team member ${i + 1}: needs a role.`);
    if (!m.name.trim()) issues.push(`Team member ${i + 1}: needs a name.`);
  });
  return issues;
}

export function validateSitemap(model: SitemapModel): string[] {
  const issues: string[] = [];
  if (!model.urls.length) issues.push("Add at least one URL.");
  model.urls.forEach((u, i) => {
    if (!looksLikeUrl(u.loc)) {
      issues.push(`URL ${i + 1}: <loc> should be an absolute http(s) URL.`);
    }
    if (u.priority != null && (u.priority < 0 || u.priority > 1)) {
      issues.push(`URL ${i + 1}: priority must be between 0.0 and 1.0.`);
    }
  });
  return issues;
}

export function validateAgents(model: AgentsModel): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  model.agents.forEach((a, i) => {
    if (!a.id.trim()) {
      issues.push(`Agent ${i + 1}: needs an id.`);
    } else if (seen.has(a.id)) {
      issues.push(`Agent ${i + 1}: duplicate id "${a.id}".`);
    } else {
      seen.add(a.id);
    }
    if (a.url && !looksLikeUrl(a.url)) {
      issues.push(`Agent ${i + 1}: url should be an absolute http(s) URL.`);
    }
  });
  return issues;
}

/** Dispatch validation by file kind. */
export function validateModel(kind: XFileKind, model: unknown): string[] {
  switch (kind) {
    case "robots":
      return validateRobots(model as RobotsModel);
    case "securityTxt":
      return validateSecurityTxt(model as SecurityTxtModel);
    case "llmsTxt":
      return validateLlmsTxt(model as LlmsTxtModel);
    case "humansTxt":
      return validateHumansTxt(model as HumansTxtModel);
    case "sitemap":
      return validateSitemap(model as SitemapModel);
    case "agents":
      return validateAgents(model as AgentsModel);
  }
}
