/**
 * @particle-academy/fancy-x-files-ui
 *
 * A headless react-fancy editor suite for the well-known files modeled by
 * `fancy-x-files` — robots.txt, security.txt, llms.txt, humans.txt,
 * sitemap.xml, and the /AGENTS register. Every component is controlled
 * (`value` + `onChange`), JSON-friendly, and carries stable `data-*` handles,
 * so an embedded agent can read and propose changes through the same channel a
 * human uses (Human+ UX contract).
 */

// Model types + helpers
export type {
  XFileKind,
  XFileModelMap,
  XFilesModel,
  RobotsModel,
  RobotsGroup,
  SecurityTxtModel,
  LlmsTxtModel,
  LlmsSection,
  LlmsLink,
  HumansTxtModel,
  HumansTxtEntry,
  SitemapModel,
  SitemapUrl,
  SitemapChangeFreq,
  AgentsModel,
  AgentEntry,
} from "./model.js";
export {
  X_FILE_META,
  emptyRobots,
  emptySecurityTxt,
  emptyLlmsTxt,
  emptyHumansTxt,
  emptySitemap,
  emptyAgents,
} from "./model.js";

// Render logic (text/XML preview, mirrors the fancy-x-files output format)
export {
  renderXFile,
  renderRobots,
  renderSecurityTxt,
  renderLlmsTxt,
  renderHumansTxt,
  renderSitemap,
  renderAgents,
  pickModel,
} from "./render.js";

// Validation helpers
export {
  validateModel,
  validateRobots,
  validateSecurityTxt,
  validateLlmsTxt,
  validateHumansTxt,
  validateSitemap,
  validateAgents,
} from "./validate.js";

// Components
export { RobotsEditor } from "./components/RobotsEditor.js";
export type { RobotsEditorProps } from "./components/RobotsEditor.js";
export { SecurityTxtEditor } from "./components/SecurityTxtEditor.js";
export type { SecurityTxtEditorProps } from "./components/SecurityTxtEditor.js";
export { LlmsTxtEditor } from "./components/LlmsTxtEditor.js";
export type { LlmsTxtEditorProps } from "./components/LlmsTxtEditor.js";
export { HumansTxtEditor } from "./components/HumansTxtEditor.js";
export type { HumansTxtEditorProps } from "./components/HumansTxtEditor.js";
export { SitemapEditor } from "./components/SitemapEditor.js";
export type { SitemapEditorProps } from "./components/SitemapEditor.js";
export { AgentsEditor } from "./components/AgentsEditor.js";
export type { AgentsEditorProps } from "./components/AgentsEditor.js";
export { XFilePreview } from "./components/XFilePreview.js";
export type { XFilePreviewProps } from "./components/XFilePreview.js";
export { XFilesManager } from "./components/XFilesManager.js";
export type { XFilesManagerProps } from "./components/XFilesManager.js";
