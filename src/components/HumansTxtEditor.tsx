import { Button, Input, Textarea } from "@particle-academy/react-fancy";
import type { HumansTxtEntry, HumansTxtModel } from "../model.js";
import { validateHumansTxt } from "../validate.js";
import { IssueList, Section, StringList } from "./internal.js";

export interface HumansTxtEditorProps {
  value: HumansTxtModel;
  onChange: (next: HumansTxtModel) => void;
  hideIssues?: boolean;
  className?: string;
}

/** Controlled humans.txt editor: team credits + thanks + site colophon. */
export function HumansTxtEditor({
  value,
  onChange,
  hideIssues,
  className,
}: HumansTxtEditorProps) {
  const issues = validateHumansTxt(value);
  const patch = (next: Partial<HumansTxtModel>) =>
    onChange({ ...value, ...next });

  const updateMember = (index: number, next: Partial<HumansTxtEntry>) =>
    patch({
      team: value.team.map((m, i) => (i === index ? { ...m, ...next } : m)),
    });

  const addMember = () =>
    patch({ team: [...value.team, { role: "", name: "" }] });

  const removeMember = (index: number) =>
    patch({ team: value.team.filter((_, i) => i !== index) });

  return (
    <div className={className} data-x-editor="humansTxt">
      <Section
        title="Team"
        handle="humans-team"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={addMember}
            data-x-add="humans-member"
          >
            Add person
          </Button>
        }
      >
        {value.team.map((member, i) => (
          <div
            key={i}
            data-x-member={i}
            style={{
              display: "flex",
              gap: "0.4rem",
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 7rem" }}>
              <Input
                label={i === 0 ? "Role" : undefined}
                value={member.role}
                onValueChange={(role) => updateMember(i, { role })}
                placeholder="Developer"
                data-x-input={`humans-role:${i}`}
              />
            </div>
            <div style={{ flex: "1 1 8rem" }}>
              <Input
                label={i === 0 ? "Name" : undefined}
                value={member.name}
                onValueChange={(name) => updateMember(i, { name })}
                placeholder="Ada Lovelace"
                data-x-input={`humans-name:${i}`}
              />
            </div>
            <div style={{ flex: "1 1 8rem" }}>
              <Input
                label={i === 0 ? "Contact" : undefined}
                value={member.contact ?? ""}
                onValueChange={(v) =>
                  updateMember(i, { contact: v || undefined })
                }
                placeholder="@handle"
                data-x-input={`humans-contact:${i}`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              color="red"
              onClick={() => removeMember(i)}
              data-x-remove={`humans-member:${i}`}
            >
              ×
            </Button>
          </div>
        ))}
      </Section>

      <Section title="Thanks" handle="humans-thanks">
        <StringList
          handle="humans-thanks"
          values={value.thanks ?? []}
          onChange={(thanks) => patch({ thanks: thanks.length ? thanks : undefined })}
          placeholder="Open-source maintainers"
        />
      </Section>

      <Section title="Site" handle="humans-site">
        <Textarea
          value={value.site ?? ""}
          onValueChange={(v) => patch({ site: v || undefined })}
          placeholder={"Standards: HTML5, CSS3\nComponents: react-fancy"}
          data-x-input="humans-site"
        />
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="humansTxt" />}
    </div>
  );
}
