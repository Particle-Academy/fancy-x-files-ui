import { Button, Input, Select } from "@particle-academy/react-fancy";
import type {
  SitemapChangeFreq,
  SitemapModel,
  SitemapUrl,
} from "../model.js";
import { validateSitemap } from "../validate.js";
import { IssueList, Section } from "./internal.js";

export interface SitemapEditorProps {
  value: SitemapModel;
  onChange: (next: SitemapModel) => void;
  hideIssues?: boolean;
  className?: string;
}

const CHANGE_FREQS: SitemapChangeFreq[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

/** Controlled sitemap.xml editor: a flat list of URL entries. */
export function SitemapEditor({
  value,
  onChange,
  hideIssues,
  className,
}: SitemapEditorProps) {
  const issues = validateSitemap(value);
  const patch = (next: Partial<SitemapModel>) => onChange({ ...value, ...next });

  const updateUrl = (index: number, next: Partial<SitemapUrl>) =>
    patch({
      urls: value.urls.map((u, i) => (i === index ? { ...u, ...next } : u)),
    });

  const addUrl = () => patch({ urls: [...value.urls, { loc: "" }] });

  const removeUrl = (index: number) =>
    patch({ urls: value.urls.filter((_, i) => i !== index) });

  return (
    <div className={className} data-x-editor="sitemap">
      <Section
        title="URLs"
        handle="sitemap-urls"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={addUrl}
            data-x-add="sitemap-url"
          >
            Add URL
          </Button>
        }
      >
        {value.urls.map((url, i) => (
          <div
            key={i}
            data-x-url={i}
            style={{
              border: "1px solid var(--rf-border, #e5e7eb)",
              borderRadius: "0.5rem",
              padding: "0.6rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.4rem", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="loc"
                  value={url.loc}
                  onValueChange={(loc) => updateUrl(i, { loc })}
                  placeholder="https://example.com/page"
                  data-x-input={`sitemap-loc:${i}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => removeUrl(i)}
                data-x-remove={`sitemap-url:${i}`}
              >
                ×
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 9rem" }}>
                <Input
                  label="lastmod"
                  type="text"
                  value={url.lastmod ?? ""}
                  onValueChange={(v) =>
                    updateUrl(i, { lastmod: v || undefined })
                  }
                  placeholder="2026-01-01"
                  data-x-input={`sitemap-lastmod:${i}`}
                />
              </div>
              <div style={{ flex: "1 1 9rem" }}>
                <Select
                  label="changefreq"
                  value={url.changefreq ?? ""}
                  list={["", ...CHANGE_FREQS]}
                  onValueChange={(v) =>
                    updateUrl(i, {
                      changefreq: (v || undefined) as
                        | SitemapChangeFreq
                        | undefined,
                    })
                  }
                  data-x-input={`sitemap-changefreq:${i}`}
                />
              </div>
              <div style={{ flex: "1 1 6rem" }}>
                <Input
                  label="priority"
                  type="number"
                  value={url.priority != null ? String(url.priority) : ""}
                  onValueChange={(v) =>
                    updateUrl(i, {
                      priority: v === "" ? undefined : Number(v),
                    })
                  }
                  placeholder="0.5"
                  data-x-input={`sitemap-priority:${i}`}
                />
              </div>
            </div>
          </div>
        ))}
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="sitemap" />}
    </div>
  );
}
