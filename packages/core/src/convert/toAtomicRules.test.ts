import { describe, it, expect } from "vite-plus/test";

import { createStitches } from "../createStitches.js";

describe("atomic mode", () => {
  it("decomposes base styles into one class per property", () => {
    const { css, getCssText } = createStitches({ atomic: true });

    const button = css({ color: "red", padding: "10px" });
    const result = button();

    // Should have atomic classes (s-*) in the className
    const atomicClasses = result.className.split(" ").filter((c) => c.startsWith("s-"));
    expect(atomicClasses.length).toBe(2);

    const cssText = getCssText();
    expect(cssText).toContain("color:red");
    expect(cssText).toContain("padding:10px");
  });

  it("emits valid adjacent CSS rules", () => {
    const { css } = createStitches({ atomic: true });

    const result = css({ color: "red", padding: "10px" })();

    expect(result.cssText).toMatch(
      /^@layer seams\.styled\{\.s-\w+\{color:red\}\.s-\w+\{padding:10px\}\}$/,
    );
  });

  it("isolates identical declarations across cascade layers", () => {
    const { css } = createStitches({ atomic: true });

    const baseClass = css({ fontWeight: "500" })()
      .className.split(" ")
      .find((className) => className.startsWith("s-"));
    const inlineClass = css({})({ css: { fontWeight: "500" } })
      .className.split(" ")
      .find((className) => className.startsWith("s-"));

    expect(inlineClass).not.toBe(baseClass);
  });

  it("deduplicates identical declarations across components", () => {
    const { css, getCssText } = createStitches({ atomic: true });

    const a = css({ color: "red", padding: "10px" });
    const b = css({ color: "red", fontSize: "16px" });

    const resultA = a();
    const resultB = b();

    // Both should share the same atomic class for `color: red`
    const classesA = resultA.className.split(" ").filter((c) => c.startsWith("s-"));
    const classesB = resultB.className.split(" ").filter((c) => c.startsWith("s-"));

    const shared = classesA.filter((c) => classesB.includes(c));
    expect(shared.length).toBe(1); // the color:red class

    // CSS should contain color:red only once
    const cssText = getCssText();
    const colorRedCount = cssText.match(/color:red/g)?.length ?? 0;
    expect(colorRedCount).toBe(1);
  });

  it("handles nested selectors (pseudo-classes)", () => {
    const { css, getCssText } = createStitches({ atomic: true });

    const button = css({
      color: "blue",
      "&:hover": { color: "red" },
    });

    button();

    const cssText = getCssText();
    // Should have a :hover rule
    expect(cssText).toMatch(/\.s-\w+:hover\{color:red\}/);
    // Base color should be separate
    expect(cssText).toMatch(/\.s-\w+\{color:blue\}/);
  });

  it("handles media queries", () => {
    const { css, getCssText } = createStitches({
      atomic: true,
      media: { sm: "(min-width: 640px)" },
    });

    const box = css({
      color: "black",
      "@sm": { color: "white" },
    });

    box();

    const cssText = getCssText();
    expect(cssText).toContain("color:black");
    expect(cssText).toContain("@media (min-width: 640px)");
    expect(cssText).toContain("color:white");
  });

  it("produces atomic classes for variant styles", () => {
    const { css, getCssText } = createStitches({ atomic: true });

    const button = css({
      padding: "8px",
      variants: {
        size: {
          sm: { padding: "4px" },
          lg: { padding: "16px" },
        },
      },
    });

    const result = button({ size: "sm" });

    // Should have atomic classes from both base and variant
    const atomicClasses = result.className.split(" ").filter((c) => c.startsWith("s-"));
    expect(atomicClasses.length).toBeGreaterThanOrEqual(2);

    const cssText = getCssText();
    expect(cssText).toContain("padding:8px");
    expect(cssText).toContain("padding:4px");
  });

  it("produces atomic classes for css prop", () => {
    const { css, getCssText } = createStitches({ atomic: true });

    const box = css({ color: "black" });
    box({ css: { margin: "20px" } });

    const cssText = getCssText();
    expect(cssText).toContain("color:black");
    expect(cssText).toContain("margin:20px");
  });

  it("resolves theme tokens in atomic classes", () => {
    const { css, getCssText } = createStitches({
      atomic: true,
      theme: { colors: { primary: "#0070f3" } },
    });

    const box = css({ color: "$primary" });
    box();

    const cssText = getCssText();
    expect(cssText).toContain("var(--colors-primary)");
  });

  it("expands utils into separate atomic classes", () => {
    const { css, getCssText } = createStitches({
      atomic: true,
      utils: {
        mx: (value: unknown) => ({ marginLeft: value, marginRight: value }),
      },
    });

    const box = css({ mx: "10px" } as Record<string, unknown>);
    const result = box();

    const atomicClasses = result.className.split(" ").filter((c) => c.startsWith("s-"));
    expect(atomicClasses.length).toBe(2); // marginLeft + marginRight

    const cssText = getCssText();
    expect(cssText).toContain("margin-left:10px");
    expect(cssText).toContain("margin-right:10px");
  });

  it("variant layer ordering beats base layer", () => {
    const { css, sheet } = createStitches({ atomic: true });

    const button = css({
      padding: "8px",
      variants: {
        size: { sm: { padding: "4px" } },
      },
    });

    button({ size: "sm" });

    // Base padding goes into styled group, variant padding into onevar group
    const styledRules = sheet.rules.styled.rules.join("");
    const onevarRules = sheet.rules.onevar.rules.join("");

    expect(styledRules).toContain("padding:8px");
    expect(onevarRules).toContain("padding:4px");
  });

  it("keeps component identifier class for selector targeting", () => {
    const { css } = createStitches({ atomic: true });

    const button = css({ color: "red" });
    const result = button();

    // The component class (c-*) should be in the className for targeting
    expect(result.className).toContain(button.className);
    expect(button.className).toMatch(/^c-/);
    expect(button.selector).toMatch(/^\.c-/);
  });

  it("composes atomic classes from multiple components", () => {
    const { css } = createStitches({ atomic: true });

    const base = css("div", { color: "red", padding: "8px" });
    const composed = css(base, { fontWeight: "bold" });

    const result = composed();

    // Should have atomic classes from both base and composed
    const atomicClasses = result.className.split(" ").filter((c) => c.startsWith("s-"));
    expect(atomicClasses.length).toBe(3); // color + padding + fontWeight
  });
});
