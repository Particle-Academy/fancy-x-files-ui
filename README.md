# @particle-academy/fancy-x-files-ui

A headless [react-fancy](https://github.com/Particle-Academy/react-fancy) editor
suite for the **well-known files** modeled by
[`fancy-x-files`](https://github.com/Particle-Academy/fancy-x-files) —
`robots.txt`, `security.txt`, `llms.txt`, `humans.txt`, `sitemap.xml`, and the
`/AGENTS` register.

This is the optional, out-of-the-box editor. It defines its own small TS model
types (it does **not** import the PHP/JS port) so it builds and ships
standalone. It pairs naturally with the backends:

- **PHP:** `particle-academy/fancy-x-files` (Composer)
- **JS/TS:** `@particle-academy/fancy-x-files` (npm)

Use the model types here as the wire format to/from those packages.

## Human+ UX

Every component is **controlled** (`value` + `onChange`), takes **JSON-friendly**
inputs (arrays of objects + primitives), and carries **stable `data-*` handles**
on every interactive element. That means an embedded agent can read the current
model, propose a new one, and hand it back through the very same `onChange` a
human uses — no DOM scraping. The surface is ready to be wrapped in an
`agent-integrations` MCP bridge.

## Install

```sh
npm install @particle-academy/fancy-x-files-ui
```

Peer deps: `react` (^18 || ^19), `react-dom`, and
`@particle-academy/react-fancy` (>= 4). Make sure react-fancy's stylesheet is
loaded in your app — this package ships no CSS of its own.

## Quick start — `<XFilesManager>`

The headline compound component: tabs (one per file kind) holding the aggregate
model, wiring each editor beside its live text preview.

```tsx
import { useState } from "react";
import {
  XFilesManager,
  emptyRobots,
  type XFilesModel,
} from "@particle-academy/fancy-x-files-ui";

export function WellKnownFilesEditor() {
  const [files, setFiles] = useState<XFilesModel>({
    robots: {
      groups: [{ userAgents: ["*"], allow: [], disallow: ["/api"] }],
      sitemaps: ["https://example.com/sitemap.xml"],
      protectedPaths: ["/admin"], // pinned Disallow everywhere, never Allowable
    },
  });

  return <XFilesManager value={files} onChange={setFiles} />;
}
```

Each tab where a model is absent shows an **"Add <file>"** affordance that seeds
an empty-but-valid model (`emptyRobots()`, `emptySecurityTxt()`, …).

## Single editors

Every editor is also usable on its own — same controlled contract:

```tsx
import { RobotsEditor, XFilePreview } from "@particle-academy/fancy-x-files-ui";

<RobotsEditor value={robots} onChange={setRobots} />
<XFilePreview kind="robots" model={robots} />
```

| Component            | Props                                  |
| -------------------- | -------------------------------------- |
| `XFilesManager`      | `value`, `onChange`, `kinds?`, `activeKind?`, `defaultKind?`, `onActiveKindChange?` |
| `RobotsEditor`       | `value`, `onChange`, `hideIssues?`     |
| `SecurityTxtEditor`  | `value`, `onChange`, `hideIssues?`     |
| `LlmsTxtEditor`      | `value`, `onChange`, `hideIssues?`     |
| `HumansTxtEditor`    | `value`, `onChange`, `hideIssues?`     |
| `SitemapEditor`      | `value`, `onChange`, `hideIssues?`     |
| `AgentsEditor`       | `value`, `onChange`, `hideIssues?`     |
| `XFilePreview`       | `kind`, `model`, `filename?`           |

## Protected-path safety (robots.txt)

`RobotsEditor` mirrors the server-side `protect()` rail. Paths listed under
**Protected paths**:

- are pinned **Disallow** on every user-agent group in the rendered output;
- are **stripped from any group's Allow list** the moment you protect them;
- are **rejected** if you try to add them to an Allow list (the chip renders red
  and the value never enters the model);
- and, as a belt-and-braces guard, `validateRobots` flags any protected path
  still found in an Allow list so it surfaces inline.

So an agent (or a human) cannot accidentally expose a protected path by
Allowing it.

## Render + validate helpers

The text preview is produced by local render logic that mirrors the
`fancy-x-files` output format — exported for headless use:

```ts
import { renderXFile, validateModel } from "@particle-academy/fancy-x-files-ui";

const txt = renderXFile("robots", robots); // -> robots.txt body
const issues = validateModel("securityTxt", securityTxt); // -> string[]
```

## License

MIT
