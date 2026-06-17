import { Badge, Card } from "@particle-academy/react-fancy";
import { X_FILE_META, type XFileKind } from "../model.js";
import { renderXFile } from "../render.js";

export interface XFilePreviewProps {
  /** Which well-known file to preview. */
  kind: XFileKind;
  /** The model for that file kind. */
  model: unknown;
  /** Override the filename label shown in the header. */
  filename?: string;
  className?: string;
}

/**
 * Renders the real text/XML a well-known file will become on disk, using the
 * local render logic that mirrors the `fancy-x-files` output format. Shown in
 * a Card with a monospace <pre> so what you see is what ships.
 */
export function XFilePreview({
  kind,
  model,
  filename,
  className,
}: XFilePreviewProps) {
  const meta = X_FILE_META[kind];
  const text = model != null ? renderXFile(kind, model) : "";

  return (
    <Card variant="outlined" padding="none" className={className}>
      <Card.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid var(--rf-border, #e5e7eb)",
        }}
      >
        <code style={{ fontSize: "0.8rem" }} data-x-preview-name={kind}>
          {filename ?? meta.filename}
        </code>
        <Badge color="slate" variant="soft" size="sm">
          preview
        </Badge>
      </Card.Header>
      <Card.Body style={{ padding: 0 }}>
        <pre
          data-x-preview={kind}
          style={{
            margin: 0,
            padding: "0.75rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
          }}
        >
          {text || "— empty —"}
        </pre>
      </Card.Body>
    </Card>
  );
}
