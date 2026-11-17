# Contributing to @particle-academy/fancy-x-files-ui

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

## Layout

- `src/model.ts` — the package's own TS model types and `empty*()` seeds. It
  does **not** import the PHP or JS `fancy-x-files` port, so it builds and ships
  standalone; the model types are the wire format to and from those packages.
- `src/render.ts` — local render logic that mirrors the `fancy-x-files` output
  format.
- `src/validate.ts` — per-kind validators.
- `src/components/` — one editor per file kind, `XFilePreview`, and the
  `XFilesManager` compound.
- `tests/` — vitest suites.

The package ships no CSS of its own; it styles through react-fancy.

## Build and test

```bash
npm run build   # tsup
npm run lint    # tsc --noEmit && eslint .
npm test        # vitest run
```

## Changelog

Update `CHANGELOG.md` in the same commit as the change.
