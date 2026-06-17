import { Button, Input, Select } from "@particle-academy/react-fancy";
import type { AgentEntry, AgentsModel } from "../model.js";
import { validateAgents } from "../validate.js";
import { IssueList, Section } from "./internal.js";

export interface AgentsEditorProps {
  value: AgentsModel;
  onChange: (next: AgentsModel) => void;
  hideIssues?: boolean;
  className?: string;
}

/** Controlled /AGENTS register editor: per-agent allow/deny policy. */
export function AgentsEditor({
  value,
  onChange,
  hideIssues,
  className,
}: AgentsEditorProps) {
  const issues = validateAgents(value);
  const patch = (next: Partial<AgentsModel>) => onChange({ ...value, ...next });

  const updateAgent = (index: number, next: Partial<AgentEntry>) =>
    patch({
      agents: value.agents.map((a, i) =>
        i === index ? { ...a, ...next } : a,
      ),
    });

  const addAgent = () =>
    patch({ agents: [...value.agents, { id: "", policy: "allow" }] });

  const removeAgent = (index: number) =>
    patch({ agents: value.agents.filter((_, i) => i !== index) });

  return (
    <div className={className} data-x-editor="agents">
      <Section title="Policy contact" handle="agents-contact">
        <Input
          value={value.contact ?? ""}
          onValueChange={(v) => patch({ contact: v || undefined })}
          placeholder="mailto:agents@example.com"
          data-x-input="agents-contact"
        />
      </Section>

      <Section
        title="Agents"
        handle="agents-list"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={addAgent}
            data-x-add="agents-agent"
          >
            Add agent
          </Button>
        }
      >
        {value.agents.map((agent, i) => (
          <div
            key={i}
            data-x-agent={i}
            style={{
              border: "1px solid var(--rf-border, #e5e7eb)",
              borderRadius: "0.5rem",
              padding: "0.6rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                alignItems: "end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 8rem" }}>
                <Input
                  label="id"
                  value={agent.id}
                  onValueChange={(id) => updateAgent(i, { id })}
                  placeholder="gptbot"
                  data-x-input={`agents-id:${i}`}
                />
              </div>
              <div style={{ flex: "1 1 8rem" }}>
                <Input
                  label="name"
                  value={agent.name ?? ""}
                  onValueChange={(v) => updateAgent(i, { name: v || undefined })}
                  placeholder="GPTBot"
                  data-x-input={`agents-name:${i}`}
                />
              </div>
              <div style={{ flex: "0 1 7rem" }}>
                <Select
                  label="policy"
                  value={agent.policy}
                  list={["allow", "deny"]}
                  onValueChange={(v) =>
                    updateAgent(i, { policy: v as AgentEntry["policy"] })
                  }
                  data-x-input={`agents-policy:${i}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                color="red"
                onClick={() => removeAgent(i)}
                data-x-remove={`agents-agent:${i}`}
              >
                ×
              </Button>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 9rem" }}>
                <Input
                  label="url"
                  value={agent.url ?? ""}
                  onValueChange={(v) => updateAgent(i, { url: v || undefined })}
                  placeholder="https://example.com/bot"
                  data-x-input={`agents-url:${i}`}
                />
              </div>
              <div style={{ flex: "2 1 12rem" }}>
                <Input
                  label="scope"
                  value={agent.scope ?? ""}
                  onValueChange={(v) =>
                    updateAgent(i, { scope: v || undefined })
                  }
                  placeholder="read-only crawl of /docs"
                  data-x-input={`agents-scope:${i}`}
                />
              </div>
            </div>
          </div>
        ))}
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="agents" />}
    </div>
  );
}
