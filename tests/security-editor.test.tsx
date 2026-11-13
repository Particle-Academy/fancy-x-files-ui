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

    it("shows focus on the Expires field while one of its inner controls has it", () => {
        // Lab run 651 (test-81): a Tab walk reaches the datetime input's
        // month / day / year / time segments and then its calendar button,
        // all inside the browser's shadow root. On that last stop the input
        // matches `:focus-within` but NOT `:focus-visible`, so the browser
        // outline went away and nothing showed focus (react-fancy's DatePicker
        // hit the same thing, K7). The input is styled inline, which cannot
        // say `:focus-within`, so the editor ships the rule in a <style>.
        const host = document.createElement("div");
        document.body.append(host);
        const root = createRoot(host);
        act(() => root.render(<SecurityTxtEditor value={model} onChange={vi.fn()} />));

        const input = host.querySelector<HTMLInputElement>('[data-x-input="security-expires"]')!;
        const rules = [...host.querySelectorAll("style")].flatMap((s) => [...(s.sheet?.cssRules ?? [])]).filter(
            (r): r is CSSStyleRule => r instanceof CSSStyleRule && r.selectorText.includes(":focus-within"),
        );
        // The rules that reach THIS input once `:focus-within` matches. (jsdom's
        // selector engine matches `:where(.dark, …) x` with no dark ancestor, so
        // the dark rule is told apart by its selector, not by toggling `.dark`.)
        document.documentElement.classList.add("dark");
        const applying = rules.filter((r) => input.matches(r.selectorText.replace(/:focus-within/g, "")));
        document.documentElement.classList.remove("dark");
        const light = applying.filter((r) => !/\.dark/.test(r.selectorText));
        const dark = applying.filter((r) => /\.dark/.test(r.selectorText));
        expect(light.length, "a :focus-within rule reaches the Expires input").toBe(1);
        // jsdom keeps the `outline` shorthand as written (no longhands).
        const outline = light[0].style.getPropertyValue("outline");
        expect(outline).toMatch(/^2px solid /);
        expect(outline).toContain("--fancy-focus");
        expect(dark.length, "a dark-host rule reaches the Expires input").toBe(1);
        expect(dark[0].style.outlineColor).toContain("--fancy-focus-dark");
        // Nothing inline may switch the outline off: an inline declaration would win.
        expect(input.style.outline).toBe("");
        expect(input.style.outlineStyle).toBe("");

        act(() => root.unmount());
    });
});
