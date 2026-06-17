import { Button, Callout, Input } from "@particle-academy/react-fancy";
import type { RobotsGroup, RobotsModel } from "../model.js";
import { validateRobots } from "../validate.js";
import { IssueList, Section, StringList } from "./internal.js";

export interface RobotsEditorProps {
  /** Controlled robots.txt model. */
  value: RobotsModel;
  /** Fires with the next model on every edit. */
  onChange: (next: RobotsModel) => void;
  /** Hide the inline validation issue list. Default `false`. */
  hideIssues?: boolean;
  className?: string;
}

/**
 * Controlled robots.txt rule builder.
 *
 * Protected-path safety (mirrors the PHP `protect()` rail): paths listed under
 * **Protected paths** are pinned Disallowed for every group and can NEVER be
 * Allowed. The editor:
 *  - renders protected chips in red, labelled "Disallowed everywhere";
 *  - strips a protected path out of any group's Allow list as you protect it;
 *  - flags (via {@link validateRobots}) any protected path still sitting in an
 *    Allow list, so the issue surfaces inline.
 */
export function RobotsEditor({
  value,
  onChange,
  hideIssues,
  className,
}: RobotsEditorProps) {
  const issues = validateRobots(value);

  const patch = (next: Partial<RobotsModel>) => onChange({ ...value, ...next });

  const updateGroup = (index: number, next: Partial<RobotsGroup>) => {
    const groups = value.groups.map((g, i) =>
      i === index ? { ...g, ...next } : g,
    );
    onChange({ ...value, groups });
  };

  const addGroup = () =>
    patch({
      groups: [
        ...value.groups,
        { userAgents: ["*"], allow: [], disallow: [] },
      ],
    });

  const removeGroup = (index: number) =>
    patch({ groups: value.groups.filter((_, i) => i !== index) });

  /** Setting Allow for a group: protected paths are filtered out entirely. */
  const setAllow = (index: number, next: string[]) => {
    const filtered = next.filter((p) => !value.protectedPaths.includes(p));
    updateGroup(index, { allow: filtered });
  };

  /** Protecting a path also removes it from every group's Allow list. */
  const setProtected = (next: string[]) => {
    const protectedSet = new Set(next);
    const groups = value.groups.map((g) => ({
      ...g,
      allow: g.allow.filter((p) => !protectedSet.has(p)),
    }));
    onChange({ ...value, protectedPaths: next, groups });
  };

  return (
    <div className={className} data-x-editor="robots">
      <Section
        title="Protected paths"
        handle="robots-protected"
        action={
          value.protectedPaths.length ? (
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
              Disallowed for every agent · cannot be Allowed
            </span>
          ) : null
        }
      >
        <Callout color="red">
          Paths added here are pinned <strong>Disallow</strong> on every
          user-agent group and can never be marked Allow. This mirrors the
          server-side <code>protect()</code> safety rail.
        </Callout>
        <StringList
          handle="robots-protected"
          values={value.protectedPaths}
          onChange={setProtected}
          placeholder="/admin"
        />
      </Section>

      <Section
        title="Sitemaps"
        handle="robots-sitemaps"
      >
        <StringList
          handle="robots-sitemaps"
          values={value.sitemaps}
          onChange={(sitemaps) => patch({ sitemaps })}
          placeholder="https://example.com/sitemap.xml"
        />
      </Section>

      <Section title="Host" handle="robots-host">
        <Input
          value={value.host ?? ""}
          onValueChange={(host) => patch({ host: host || undefined })}
          placeholder="example.com"
          data-x-input="robots-host"
        />
      </Section>

      <Section
        title="User-agent groups"
        handle="robots-groups"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={addGroup}
            data-x-add="robots-group"
          >
            Add group
          </Button>
        }
      >
        {value.groups.map((group, i) => (
          <div
            key={i}
            data-x-group={i}
            style={{
              border: "1px solid var(--rf-border, #e5e7eb)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: "0.8rem" }}>Group {i + 1}</strong>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => removeGroup(i)}
                data-x-remove={`robots-group:${i}`}
                disabled={value.groups.length <= 1}
              >
                Remove
              </Button>
            </div>
            <StringList
              label="User-agents"
              handle={`robots-ua:${i}`}
              values={group.userAgents}
              onChange={(userAgents) => updateGroup(i, { userAgents })}
              placeholder="*"
            />
            <StringList
              label="Disallow"
              handle={`robots-disallow:${i}`}
              values={group.disallow}
              onChange={(disallow) => updateGroup(i, { disallow })}
              placeholder="/private"
            />
            <StringList
              label="Allow"
              handle={`robots-allow:${i}`}
              values={group.allow}
              onChange={(allow) => setAllow(i, allow)}
              placeholder="/public"
              disallowedValues={value.protectedPaths}
              disallowedReason={(p) =>
                `"${p}" is protected and cannot be Allowed.`
              }
            />
            <div style={{ maxWidth: "12rem" }}>
              <Input
                type="number"
                label="Crawl-delay (s)"
                value={group.crawlDelay != null ? String(group.crawlDelay) : ""}
                onValueChange={(v) =>
                  updateGroup(i, {
                    crawlDelay: v === "" ? undefined : Number(v),
                  })
                }
                data-x-input={`robots-crawldelay:${i}`}
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="robots" />}
    </div>
  );
}
