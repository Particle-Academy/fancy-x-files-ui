import { useState } from "react";
import { Badge, Button, Callout, Input } from "@particle-academy/react-fancy";

/**
 * Shared internal building blocks for the editors. Not exported from the
 * package root — these are implementation details of the editors.
 */

/** Surface a list of validation issues as a soft warning callout. */
export function IssueList({
  issues,
  testid,
}: {
  issues: string[];
  testid?: string;
}) {
  if (!issues.length) return null;
  return (
    <Callout color="amber" data-x-issues={testid ?? ""}>
      <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
        {issues.map((issue, i) => (
          <li key={i} data-x-issue>
            {issue}
          </li>
        ))}
      </ul>
    </Callout>
  );
}

/**
 * Controlled add/remove list of plain strings rendered as chips with an
 * inline "add a row" input. `disallowedValues` are rejected on add and, if
 * already present, flagged — used by RobotsEditor to keep protected paths out
 * of an Allow list.
 */
export function StringList({
  label,
  values,
  onChange,
  placeholder,
  handle,
  disallowedValues,
  disallowedReason,
}: {
  label?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** data-* handle base, e.g. "robots-allow". */
  handle: string;
  disallowedValues?: string[];
  disallowedReason?: (value: string) => string;
}) {
  const [draft, setDraft] = useState("");
  const blocked = new Set(disallowedValues ?? []);

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };

  const remove = (value: string) =>
    onChange(values.filter((v) => v !== value));

  return (
    <div data-x-list={handle}>
      {label ? (
        <div
          style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem",
          marginBottom: values.length ? "0.4rem" : 0,
        }}
      >
        {values.map((value) => {
          const isBlocked = blocked.has(value);
          return (
            <Badge
              key={value}
              color={isBlocked ? "red" : "slate"}
              variant={isBlocked ? "soft" : "outline"}
              data-x-chip={`${handle}:${value}`}
              title={
                isBlocked && disallowedReason
                  ? disallowedReason(value)
                  : undefined
              }
            >
              {value}
              <button
                type="button"
                onClick={() => remove(value)}
                aria-label={`Remove ${value}`}
                data-x-remove={`${handle}:${value}`}
                style={{
                  marginLeft: "0.35rem",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </Badge>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <Input
          value={draft}
          onValueChange={setDraft}
          placeholder={placeholder}
          data-x-input={`${handle}-draft`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={add}
          data-x-add={handle}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/** A labelled section wrapper used to group fields inside an editor. */
export function Section({
  title,
  action,
  children,
  handle,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  handle?: string;
}) {
  return (
    <section
      data-x-section={handle}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>
          {title}
        </h4>
        {action}
      </div>
      {children}
    </section>
  );
}
