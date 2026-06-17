/**
 * TS model types for the well-known files modeled by `fancy-x-files`.
 *
 * These are intentionally small, standalone shapes (this package does NOT
 * import the PHP/JS port) so the editor builds + ships independently. They
 * mirror the canonical shapes emitted by the `fancy-x-files` packages.
 *
 * Every model is plain JSON: arrays of objects + primitives. That makes the
 * whole surface agent-emittable — an embedded agent can read the current
 * model, propose a new one, and hand it back through the same `onChange`
 * channel a human uses (Human+ UX contract).
 */

/** The well-known files this suite can edit + preview. */
export type XFileKind =
  | "robots"
  | "securityTxt"
  | "llmsTxt"
  | "humansTxt"
  | "sitemap"
  | "agents";

/** robots.txt — grouped crawl rules, sitemaps, host, protected paths. */
export interface RobotsGroup {
  /** `User-agent` lines for this group. `["*"]` for all. */
  userAgents: string[];
  /** `Allow:` paths. */
  allow: string[];
  /** `Disallow:` paths. */
  disallow: string[];
  /** Optional `Crawl-delay:` seconds. */
  crawlDelay?: number;
}

export interface RobotsModel {
  groups: RobotsGroup[];
  /** Absolute `Sitemap:` URLs. */
  sitemaps: string[];
  /**
   * Paths that must be Disallowed for every user-agent and may NEVER be
   * Allowed — mirrors the PHP `protect()` safety rail. The renderer pins
   * these as Disallow on every group; the editor refuses to Allow them.
   */
  protectedPaths: string[];
  /** Optional `Host:` directive. */
  host?: string;
}

/** security.txt (RFC 9116). */
export interface SecurityTxtModel {
  /** `Contact:` — one or more mailto:/https: URIs. At least one required. */
  contact: string[];
  /** `Expires:` — ISO 8601 timestamp; MUST be in the future. */
  expires: string;
  /** `Encryption:` URI. */
  encryption?: string;
  /** `Acknowledgments:` URI. */
  acknowledgments?: string;
  /** `Preferred-Languages:` comma-separated tags. */
  preferredLanguages?: string;
  /** `Canonical:` URI. */
  canonical?: string;
  /** `Policy:` URI. */
  policy?: string;
  /** `Hiring:` URI. */
  hiring?: string;
}

/** llms.txt — Markdown index of resources for LLMs. */
export interface LlmsLink {
  title: string;
  url: string;
  notes?: string;
}

export interface LlmsSection {
  name: string;
  links: LlmsLink[];
}

export interface LlmsTxtModel {
  title: string;
  /** The blockquote summary directly under the H1. */
  summary?: string;
  /** Free-form Markdown paragraph(s) of detail. */
  details?: string;
  sections: LlmsSection[];
}

/** humans.txt — credits + site colophon. */
export interface HumansTxtEntry {
  /** e.g. "Developer", "Designer". */
  role: string;
  name: string;
  /** Optional contact / handle / site. */
  contact?: string;
}

export interface HumansTxtModel {
  team: HumansTxtEntry[];
  /** "Site" section free-text (Standards, Components, Software, …). */
  site?: string;
  thanks?: string[];
}

/** sitemap.xml — a flat URL set. */
export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapUrl {
  loc: string;
  /** ISO 8601 date. */
  lastmod?: string;
  changefreq?: SitemapChangeFreq;
  /** 0.0 – 1.0. */
  priority?: number;
}

export interface SitemapModel {
  urls: SitemapUrl[];
}

/**
 * /AGENTS — a machine-readable register of the agents allowed (or denied) to
 * act on the site, mirroring the robots-style "agent policy" idea.
 */
export interface AgentEntry {
  /** Stable identifier / handle for the agent. */
  id: string;
  /** Human label. */
  name?: string;
  /** Policy for this agent. */
  policy: "allow" | "deny";
  /** Optional homepage / contact URL. */
  url?: string;
  /** Optional one-line description of permitted scope. */
  scope?: string;
}

export interface AgentsModel {
  agents: AgentEntry[];
  /** Optional contact for policy questions. */
  contact?: string;
}

/** The aggregate value held by `XFilesManager`. */
export interface XFilesModel {
  robots?: RobotsModel;
  securityTxt?: SecurityTxtModel;
  llmsTxt?: LlmsTxtModel;
  humansTxt?: HumansTxtModel;
  sitemap?: SitemapModel;
  agents?: AgentsModel;
}

/** Map a file kind to its model type. */
export interface XFileModelMap {
  robots: RobotsModel;
  securityTxt: SecurityTxtModel;
  llmsTxt: LlmsTxtModel;
  humansTxt: HumansTxtModel;
  sitemap: SitemapModel;
  agents: AgentsModel;
}

/** Empty-but-valid starting models, handy for "add this file" affordances. */
export const emptyRobots = (): RobotsModel => ({
  groups: [{ userAgents: ["*"], allow: [], disallow: [] }],
  sitemaps: [],
  protectedPaths: [],
});

export const emptySecurityTxt = (): SecurityTxtModel => ({
  contact: [],
  expires: "",
});

export const emptyLlmsTxt = (): LlmsTxtModel => ({
  title: "",
  sections: [],
});

export const emptyHumansTxt = (): HumansTxtModel => ({ team: [] });

export const emptySitemap = (): SitemapModel => ({ urls: [] });

export const emptyAgents = (): AgentsModel => ({ agents: [] });

/** Human-readable label + on-disk filename for each kind. */
export const X_FILE_META: Record<
  XFileKind,
  { label: string; filename: string }
> = {
  robots: { label: "robots.txt", filename: "robots.txt" },
  securityTxt: { label: "security.txt", filename: ".well-known/security.txt" },
  llmsTxt: { label: "llms.txt", filename: "llms.txt" },
  humansTxt: { label: "humans.txt", filename: "humans.txt" },
  sitemap: { label: "sitemap.xml", filename: "sitemap.xml" },
  agents: { label: "AGENTS", filename: ".well-known/agents.json" },
};
