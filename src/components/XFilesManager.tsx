import { useState } from "react";
import { Badge, Tabs } from "@particle-academy/react-fancy";
import {
  X_FILE_META,
  emptyAgents,
  emptyHumansTxt,
  emptyLlmsTxt,
  emptyRobots,
  emptySecurityTxt,
  emptySitemap,
  type XFileKind,
  type XFilesModel,
} from "../model.js";
import { validateModel } from "../validate.js";
import { AgentsEditor } from "./AgentsEditor.js";
import { HumansTxtEditor } from "./HumansTxtEditor.js";
import { LlmsTxtEditor } from "./LlmsTxtEditor.js";
import { RobotsEditor } from "./RobotsEditor.js";
import { SecurityTxtEditor } from "./SecurityTxtEditor.js";
import { SitemapEditor } from "./SitemapEditor.js";
import { XFilePreview } from "./XFilePreview.js";

export interface XFilesManagerProps {
  /** The aggregate model — each key optional; absent keys offer an "Add" CTA. */
  value: XFilesModel;
  /** Fires with the next aggregate model on every edit. */
  onChange: (next: XFilesModel) => void;
  /** Restrict + order the tabs. Default: all six kinds. */
  kinds?: XFileKind[];
  /** Controlled active tab (a file kind). */
  activeKind?: XFileKind;
  /** Default active tab when uncontrolled. */
  defaultKind?: XFileKind;
  onActiveKindChange?: (kind: XFileKind) => void;
  className?: string;
}

const ALL_KINDS: XFileKind[] = [
  "robots",
  "securityTxt",
  "llmsTxt",
  "sitemap",
  "humansTxt",
  "agents",
];

const EMPTY: Record<XFileKind, () => XFilesModel[XFileKind]> = {
  robots: emptyRobots,
  securityTxt: emptySecurityTxt,
  llmsTxt: emptyLlmsTxt,
  humansTxt: emptyHumansTxt,
  sitemap: emptySitemap,
  agents: emptyAgents,
};

/**
 * The headline compound component. Tabs (one per file kind) hold the aggregate
 * `value` + `onChange`, wiring each editor next to its live preview. Fully
 * controlled and JSON-friendly so an embedded agent can read the whole set of
 * well-known files and propose edits through the same channel (Human+ UX).
 */
export function XFilesManager({
  value,
  onChange,
  kinds = ALL_KINDS,
  activeKind,
  defaultKind,
  onActiveKindChange,
  className,
}: XFilesManagerProps) {
  const [internalActive, setInternalActive] = useState<XFileKind>(
    defaultKind ?? kinds[0],
  );
  const active = activeKind ?? internalActive;

  const setActive = (kind: string) => {
    const k = kind as XFileKind;
    if (activeKind == null) setInternalActive(k);
    onActiveKindChange?.(k);
  };

  const patch = (kind: XFileKind, model: XFilesModel[XFileKind]) =>
    onChange({ ...value, [kind]: model });

  const ensure = (kind: XFileKind) => {
    if (value[kind] == null) patch(kind, EMPTY[kind]());
  };

  const issueCount = (kind: XFileKind): number =>
    value[kind] != null ? validateModel(kind, value[kind]).length : 0;

  const renderEditor = (kind: XFileKind) => {
    const model = value[kind];
    if (model == null) {
      return (
        <div
          data-x-empty={kind}
          style={{
            padding: "1.5rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            alignItems: "center",
          }}
        >
          <p style={{ margin: 0, opacity: 0.7 }}>
            No {X_FILE_META[kind].label} yet.
          </p>
          <button
            type="button"
            onClick={() => ensure(kind)}
            data-x-create={kind}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "0.4rem",
              border: "1px solid var(--rf-border, #e5e7eb)",
              cursor: "pointer",
              background: "transparent",
            }}
          >
            Add {X_FILE_META[kind].label}
          </button>
        </div>
      );
    }

    switch (kind) {
      case "robots":
        return (
          <RobotsEditor
            value={model as never}
            onChange={(m) => patch("robots", m)}
          />
        );
      case "securityTxt":
        return (
          <SecurityTxtEditor
            value={model as never}
            onChange={(m) => patch("securityTxt", m)}
          />
        );
      case "llmsTxt":
        return (
          <LlmsTxtEditor
            value={model as never}
            onChange={(m) => patch("llmsTxt", m)}
          />
        );
      case "sitemap":
        return (
          <SitemapEditor
            value={model as never}
            onChange={(m) => patch("sitemap", m)}
          />
        );
      case "humansTxt":
        return (
          <HumansTxtEditor
            value={model as never}
            onChange={(m) => patch("humansTxt", m)}
          />
        );
      case "agents":
        return (
          <AgentsEditor
            value={model as never}
            onChange={(m) => patch("agents", m)}
          />
        );
    }
  };

  return (
    <div className={className} data-x-manager>
      <Tabs activeTab={active} onTabChange={setActive}>
        <Tabs.List>
          {kinds.map((kind) => {
            const count = issueCount(kind);
            return (
              <Tabs.Tab key={kind} value={kind} data-x-tab={kind}>
                {X_FILE_META[kind].label}
                {count > 0 ? (
                  <Badge
                    color="amber"
                    variant="soft"
                    size="sm"
                    style={{ marginLeft: "0.4rem" }}
                  >
                    {count}
                  </Badge>
                ) : null}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        <Tabs.Panels>
          {kinds.map((kind) => (
            <Tabs.Panel key={kind} value={kind}>
              <div
                data-x-pane={kind}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: "1rem",
                  alignItems: "start",
                }}
              >
                <div>{renderEditor(kind)}</div>
                <div style={{ position: "sticky", top: "1rem" }}>
                  <XFilePreview kind={kind} model={value[kind]} />
                </div>
              </div>
            </Tabs.Panel>
          ))}
        </Tabs.Panels>
      </Tabs>
    </div>
  );
}
