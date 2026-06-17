import { Field, Input } from "@particle-academy/react-fancy";
import type { SecurityTxtModel } from "../model.js";
import { validateSecurityTxt } from "../validate.js";
import { IssueList, Section, StringList } from "./internal.js";

export interface SecurityTxtEditorProps {
  value: SecurityTxtModel;
  onChange: (next: SecurityTxtModel) => void;
  hideIssues?: boolean;
  className?: string;
}

/**
 * Controlled security.txt editor (RFC 9116). Contact is required (one or more
 * mailto:/https: URIs) and Expires must be a future date — surfaced both as a
 * date input and inline issues from {@link validateSecurityTxt}.
 */
export function SecurityTxtEditor({
  value,
  onChange,
  hideIssues,
  className,
}: SecurityTxtEditorProps) {
  const issues = validateSecurityTxt(value);
  const patch = (next: Partial<SecurityTxtModel>) =>
    onChange({ ...value, ...next });

  // <input type="datetime-local"> wants `YYYY-MM-DDTHH:mm`; tolerate a stored
  // ISO string with seconds/zone by trimming to minutes for the control.
  const expiresLocal = value.expires ? value.expires.slice(0, 16) : "";

  return (
    <div className={className} data-x-editor="securityTxt">
      <Section title="Contact (required)" handle="security-contact">
        <StringList
          handle="security-contact"
          values={value.contact}
          onChange={(contact) => patch({ contact })}
          placeholder="mailto:security@example.com"
        />
      </Section>

      <Section title="Expires (required, future)" handle="security-expires">
        <Field description="Must be a date/time in the future.">
          <input
            type="datetime-local"
            value={expiresLocal}
            onChange={(e) =>
              patch({
                expires: e.target.value
                  ? `${e.target.value}:00Z`
                  : "",
              })
            }
            data-x-input="security-expires"
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "0.4rem",
              border: "1px solid var(--rf-border, #e5e7eb)",
            }}
          />
        </Field>
      </Section>

      <Section title="Optional fields" handle="security-optional">
        <Input
          label="Encryption"
          value={value.encryption ?? ""}
          onValueChange={(v) => patch({ encryption: v || undefined })}
          placeholder="https://example.com/pgp-key.txt"
          data-x-input="security-encryption"
        />
        <Input
          label="Acknowledgments"
          value={value.acknowledgments ?? ""}
          onValueChange={(v) => patch({ acknowledgments: v || undefined })}
          placeholder="https://example.com/hall-of-fame"
          data-x-input="security-acknowledgments"
        />
        <Input
          label="Preferred-Languages"
          value={value.preferredLanguages ?? ""}
          onValueChange={(v) => patch({ preferredLanguages: v || undefined })}
          placeholder="en, fr"
          data-x-input="security-languages"
        />
        <Input
          label="Canonical"
          value={value.canonical ?? ""}
          onValueChange={(v) => patch({ canonical: v || undefined })}
          placeholder="https://example.com/.well-known/security.txt"
          data-x-input="security-canonical"
        />
        <Input
          label="Policy"
          value={value.policy ?? ""}
          onValueChange={(v) => patch({ policy: v || undefined })}
          placeholder="https://example.com/security-policy"
          data-x-input="security-policy"
        />
        <Input
          label="Hiring"
          value={value.hiring ?? ""}
          onValueChange={(v) => patch({ hiring: v || undefined })}
          placeholder="https://example.com/jobs"
          data-x-input="security-hiring"
        />
      </Section>

      {hideIssues ? null : <IssueList issues={issues} testid="securityTxt" />}
    </div>
  );
}
