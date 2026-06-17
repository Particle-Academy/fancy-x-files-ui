import { Button, Input, Textarea } from "@particle-academy/react-fancy";
import type { LlmsLink, LlmsSection, LlmsTxtModel } from "../model.js";
import { validateLlmsTxt } from "../validate.js";
import { IssueList, Section } from "./internal.js";

export interface LlmsTxtEditorProps {
  value: LlmsTxtModel;
  onChange: (next: LlmsTxtModel) => void;
  hideIssues?: boolean;
  className?: string;
}

/** Controlled llms.txt editor: title/summary/details + repeatable sections. */
export function LlmsTxtEditor({
  value,
  onChange,
  hideIssues,
  className,
}: LlmsTxtEditorProps) {
  const issues = validateLlmsTxt(value);
  const patch = (next: Partial<LlmsTxtModel>) => onChange({ ...value, ...next });

  const updateSection = (index: number, next: Partial<LlmsSection>) => {
    const sections = value.sections.map((s, i) =>
      i === index ? { ...s, ...next } : s,
    );
    patch({ sections });
  };

  const addSection = () =>
    patch({ sections: [...value.sections, { name: "", links: [] }] });

  const removeSection = (index: number) =>
    patch({ sections: value.sections.filter((_, i) => i !== index) });

  const updateLink = (
    si: number,
    li: number,
    next: Partial<LlmsLink>,
  ) => {
    const links = value.sections[si].links.map((l, i) =>
      i === li ? { ...l, ...next } : l,
    );
    updateSection(si, { links });
  };

  const addLink = (si: number) =>
    updateSection(si, {
      links: [...value.sections[si].links, { title: "", url: "" }],
    });

  const removeLink = (si: number, li: number) =>
    updateSection(si, {
      links: value.sections[si].links.filter((_, i) => i !== li),
    });

  return (
    <div className={className} data-x-editor="llmsTxt">
      <Section title="Header" handle="llms-header">
        <Input
          label="Title"
          value={value.title}
          onValueChange={(title) => patch({ title })}
          placeholder="Example Corp"
          data-x-input="llms-title"
        />
        <Textarea
          label="Summary"
          value={value.summary ?? ""}
          onValueChange={(v) => patch({ summary: v || undefined })}
          placeholder="One-line blockquote summary."
          data-x-input="llms-summary"
        />
        <Textarea
          label="Details"
          value={value.details ?? ""}
          onValueChange={(v) => patch({ details: v || undefined })}
          placeholder="Free-form Markdown paragraph(s)."
          data-x-input="llms-details"
        />
      </Section>

      <Section
        title="Sections"
        handle="llms-sections"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={addSection}
            data-x-add="llms-section"
          >
            Add section
          </Button>
        }
      >
        {value.sections.map((section, si) => (
          <div
            key={si}
            data-x-section-row={si}
            style={{
              border: "1px solid var(--rf-border, #e5e7eb)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Section name"
                  value={section.name}
                  onValueChange={(name) => updateSection(si, { name })}
                  placeholder="Docs"
                  data-x-input={`llms-section-name:${si}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => removeSection(si)}
                data-x-remove={`llms-section:${si}`}
              >
                Remove
              </Button>
            </div>

            {section.links.map((link, li) => (
              <div
                key={li}
                data-x-link-row={`${si}:${li}`}
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "end",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 8rem" }}>
                  <Input
                    label={li === 0 ? "Title" : undefined}
                    value={link.title}
                    onValueChange={(title) => updateLink(si, li, { title })}
                    placeholder="Getting started"
                    data-x-input={`llms-link-title:${si}:${li}`}
                  />
                </div>
                <div style={{ flex: "1 1 10rem" }}>
                  <Input
                    label={li === 0 ? "URL" : undefined}
                    value={link.url}
                    onValueChange={(url) => updateLink(si, li, { url })}
                    placeholder="https://example.com/docs"
                    data-x-input={`llms-link-url:${si}:${li}`}
                  />
                </div>
                <div style={{ flex: "1 1 8rem" }}>
                  <Input
                    label={li === 0 ? "Notes" : undefined}
                    value={link.notes ?? ""}
                    onValueChange={(v) =>
                      updateLink(si, li, { notes: v || undefined })
                    }
                    placeholder="optional"
                    data-x-input={`llms-link-notes:${si}:${li}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  color="red"
                  onClick={() => removeLink(si, li)}
                  data-x-remove={`llms-link:${si}:${li}`}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() => addLink(si)}
              data-x-add={`llms-link:${si}`}
            >
              Add link
            </Button>
          </div>
        ))}
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="llmsTxt" />}
    </div>
  );
}
