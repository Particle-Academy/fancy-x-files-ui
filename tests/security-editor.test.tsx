// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { SecurityTxtEditor } from "../src/components/SecurityTxtEditor";
import type { SecurityTxtModel } from "../src/model";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    document.body.innerHTML = "";
});

const model = { contact: ["mailto:security@example.com"], expires: "2030-01-01T00:00:00Z" } as SecurityTxtModel;

/** The accessible name a label element or aria attribute gives a control. */
function accessibleName(el: HTMLElement): string {
    const labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) return labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim();
    if (el.id) {
        // useId ids contain ":" and jsdom has no CSS.escape, so match by property.
        const label = [...document.querySelectorAll("label")].find((l) => l.htmlFor === el.id);
        if (label) return (label.textContent ?? "").trim();
    }
    return (el.closest("label")?.textContent ?? "").trim();
}

describe("SecurityTxtEditor", () => {
    it("names the Expires field", () => {
        // axe `label`, critical (lab run 601, K31): the datetime input sat in
        // a Field with no label, and nothing tied the section heading to it.
        const host = document.createElement("div");
        document.body.append(host);
        const root = createRoot(host);
        act(() => root.render(<SecurityTxtEditor value={model} onChange={vi.fn()} />));

        const input = host.querySelector<HTMLInputElement>('[data-x-input="security-expires"]')!;
        expect(input).not.toBeNull();
        expect(accessibleName(input)).toMatch(/expires/i);

        act(() => root.unmount());
    });
});
