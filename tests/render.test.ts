import { describe, expect, it } from "vitest";
import { renderRobots, renderSecurityTxt } from "../src/render";
import { validateRobots, validateSecurityTxt } from "../src/validate";
import type { RobotsModel, SecurityTxtModel } from "../src/model";

const robots = (over: Partial<RobotsModel> = {}): RobotsModel => ({
    groups: [],
    protectedPaths: [],
    sitemaps: [],
    ...over,
});

describe("renderRobots", () => {
    it("falls back to a wildcard group rather than emitting an empty file", () => {
        // An empty robots.txt is not neutral — a crawler reads a 200 with no
        // rules as "everything is allowed", which may not be what an operator
        // who cleared the editor meant.
        const out = renderRobots(robots());

        expect(out).toContain("User-agent: *");
    });

    it("emits one User-agent line per agent in a group", () => {
        const out = renderRobots(
            robots({ groups: [{ userAgents: ["GPTBot", "CCBot"], allow: [], disallow: ["/admin"] }] }),
        );

        expect(out).toContain("User-agent: GPTBot");
        expect(out).toContain("User-agent: CCBot");
        expect(out).toContain("Disallow: /admin");
    });

    it("pins protected paths as Disallow in EVERY group", () => {
        // The security property of this file. A protected path that only lands
        // in the first group is crawlable by any agent matched later.
        const out = renderRobots(
            robots({
                protectedPaths: ["/secret"],
                groups: [
                    { userAgents: ["*"], allow: [], disallow: [] },
                    { userAgents: ["GPTBot"], allow: [], disallow: [] },
                ],
            }),
        );

        expect(out.match(/Disallow: \/secret/g)).toHaveLength(2);
    });

    it("refuses to Allow a protected path even when one is listed", () => {
        // Belt and braces behind the editor's own guard: an Allow that
        // contradicts a Disallow is exactly how a protected path leaks.
        const out = renderRobots(
            robots({
                protectedPaths: ["/secret"],
                groups: [{ userAgents: ["*"], allow: ["/secret"], disallow: [] }],
            }),
        );

        expect(out).not.toContain("Allow: /secret");
        expect(out).toContain("Disallow: /secret");
    });

    it("does not repeat a protected path that is also listed as disallowed", () => {
        const out = renderRobots(
            robots({
                protectedPaths: ["/secret"],
                groups: [{ userAgents: ["*"], allow: [], disallow: ["/secret"] }],
            }),
        );

        expect(out.match(/Disallow: \/secret/g)).toHaveLength(1);
    });

    it("omits a crawl delay of zero or below rather than writing a meaningless directive", () => {
        const withDelay = renderRobots(
            robots({ groups: [{ userAgents: ["*"], allow: [], disallow: [], crawlDelay: 10 }] }),
        );
        const withZero = renderRobots(
            robots({ groups: [{ userAgents: ["*"], allow: [], disallow: [], crawlDelay: 0 }] }),
        );

        expect(withDelay).toContain("Crawl-delay: 10");
        expect(withZero).not.toContain("Crawl-delay");
    });

    it("lists sitemaps and host after the groups", () => {
        const out = renderRobots(
            robots({ host: "example.com", sitemaps: ["https://example.com/sitemap.xml"] }),
        );

        expect(out.indexOf("User-agent")).toBeLessThan(out.indexOf("Host:"));
        expect(out).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("ends with exactly one trailing newline", () => {
        // Some crawlers drop a final directive that is not newline-terminated.
        const out = renderRobots(robots({ groups: [{ userAgents: ["*"], allow: [], disallow: ["/x"] }] }));

        expect(out.endsWith("\n")).toBe(true);
        expect(out.endsWith("\n\n")).toBe(false);
    });
});

describe("renderSecurityTxt", () => {
    it("puts Contact first, as RFC 9116 requires", () => {
        const out = renderSecurityTxt({
            contact: ["mailto:security@example.com"],
            expires: "2027-01-01T00:00:00Z",
        } as SecurityTxtModel);

        expect(out.split("\n")[0]).toBe("Contact: mailto:security@example.com");
    });

    it("emits every contact, since the field repeats", () => {
        const out = renderSecurityTxt({
            contact: ["mailto:a@example.com", "https://example.com/report"],
        } as SecurityTxtModel);

        expect(out).toContain("Contact: mailto:a@example.com");
        expect(out).toContain("Contact: https://example.com/report");
    });

    it("omits optional fields that are absent instead of writing empty ones", () => {
        const out = renderSecurityTxt({ contact: ["mailto:a@example.com"] } as SecurityTxtModel);

        expect(out).not.toContain("Encryption:");
        expect(out).not.toContain("Policy:");
    });
});

describe("validation", () => {
    it("reports a robots model with no problems as clean", () => {
        expect(validateRobots(robots({ groups: [{ userAgents: ["*"], allow: [], disallow: [] }] }))).toEqual([]);
    });

    it("flags a security.txt with no contact", () => {
        // Contact is the one required field; a security.txt without it tells a
        // researcher nothing.
        expect(validateSecurityTxt({ contact: [] } as SecurityTxtModel).length).toBeGreaterThan(0);
    });
});
