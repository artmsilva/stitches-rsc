import type { CSSObject, StitchesConfig } from "../types/css.js";

import { toCamelCase } from "./toCamelCase.js";
import { toHash } from "./toHash.js";
import { toHyphenCase } from "./toHyphenCase.js";
import { toPolyfilledValue } from "./toPolyfilledValue.js";
import { toResolvedMediaQueryRanges } from "./toResolvedMediaQueryRanges.js";
import { toResolvedSelectors } from "./toResolvedSelectors.js";
import { toSizingValue } from "./toSizingValue.js";
import { toTailDashed } from "./toTailDashed.js";
import { toTokenizedValue } from "./toTokenizedValue.js";
import { unitlessProps } from "./toCssRules.js";

/** Comma matcher outside rounded brackets. */
const comma = /\s*,\s*(?![^()]*\))/;

/** Default toString method of Objects. */
const toStringOfObject = Object.prototype.toString;

/**
 * Converts selectors, conditions, and a declaration into a CSS rule string.
 */
const toCssString = (declaration: string, selectors: string[], conditions: string[]): string =>
  `${conditions.map((c) => `${c}{`).join("")}${selectors.join(",")}{${declaration}}${"}".repeat(conditions.length)}`;

/**
 * Decomposes a style object into atomic CSS rules — one rule per property-value pair.
 *
 * Each unique declaration (including its selector context and media conditions)
 * is hashed to a deterministic class name. Identical declarations across different
 * components produce the same class, enabling global CSS deduplication.
 *
 * Returns an array of all atomic class names produced.
 */
export const toAtomicCssRules = (
  style: CSSObject,
  config: StitchesConfig,
  layer: string,
  onAtomicRule: (className: string, cssText: string) => void,
): string[] => {
  const classNames: string[] = [];

  /** Last utility that was used, cached to prevent recursion. */
  let lastUtil: ((data: unknown) => CSSObject) | null = null;

  /** Last polyfill that was used, cached to prevent recursion. */
  let lastPoly: ((data: string | number) => CSSObject) | null = null;

  const walk = (style: CSSObject, selectors: string[], conditions: string[]): void => {
    let name: string;
    let data: unknown;

    const each = (style: CSSObject): void => {
      for (name in style) {
        const isAtRuleLike = name.charCodeAt(0) === 64;
        const styleValue = style[name];
        const datas = isAtRuleLike && Array.isArray(styleValue) ? styleValue : [styleValue];

        for (data of datas) {
          const camelName = toCamelCase(name);

          const isRuleLike =
            typeof data === "object" &&
            data &&
            (data as object).toString === toStringOfObject &&
            (!(camelName in config.utils) || !selectors.length);

          // Expand utils
          if (camelName in config.utils && !isRuleLike) {
            const util = config.utils[camelName]!;
            if (util !== lastUtil) {
              lastUtil = util;
              each(util(data) as CSSObject);
              lastUtil = null;
              continue;
            }
          }
          // Expand polyfills
          else if (camelName in toPolyfilledValue) {
            const poly = toPolyfilledValue[camelName]!;
            if (poly !== lastPoly) {
              lastPoly = poly;
              each(poly(data as string | number));
              lastPoly = null;
              continue;
            }
          }

          // Resolve media query names
          if (isAtRuleLike) {
            const atRuleName = name.slice(1);
            name = toResolvedMediaQueryRanges(
              atRuleName in config.media ? "@media " + config.media[atRuleName] : name,
            );
          }

          // Nesting: recurse into child rules
          if (isRuleLike) {
            const nextConditions = isAtRuleLike ? conditions.concat(name) : [...conditions];
            const nextSelectors = isAtRuleLike
              ? [...selectors]
              : toResolvedSelectors(selectors, name.split(comma));

            walk(data as CSSObject, nextSelectors, nextConditions);
          }
          // Leaf declaration: emit atomic rule
          else {
            // Resolve CSS property name
            let cssName = name;
            if (!isAtRuleLike && name.charCodeAt(0) === 36) {
              cssName = `--${toTailDashed(config.prefix)}${name.slice(1).replace(/\$/g, "-")}`;
            }

            // Resolve CSS value
            let cssValue: string;
            if (typeof data === "number") {
              cssValue =
                data && !(camelName in unitlessProps) && cssName.charCodeAt(0) !== 45
                  ? String(data) + "px"
                  : String(data);
            } else {
              cssValue = toTokenizedValue(
                toSizingValue(camelName, data == null ? "" : String(data)),
                config.prefix,
                config.themeMap[camelName],
              );
            }

            const declaration = `${isAtRuleLike ? `${cssName} ` : `${toHyphenCase(cssName)}:`}${cssValue}`;

            // Hash the full context: conditions + selector modifiers + declaration
            // This ensures the same declaration under different contexts gets unique classes.
            const selectorSuffix = selectors
              .map((s) => s.replace(/&/g, ""))
              .filter(Boolean)
              .join(",");
            const hashInput = [layer, ...conditions, selectorSuffix, declaration].join("|");
            const atomicClassName = `s-${toHash(hashInput)}`;

            // Build the final selector by replacing & with .{atomicClassName}
            const resolvedSelectors = selectors.map((s) =>
              s.includes("&") ? s.replace(/&/g, `.${atomicClassName}`) : `.${atomicClassName} ${s}`,
            );

            const cssText = toCssString(declaration, resolvedSelectors, conditions);

            classNames.push(atomicClassName);
            onAtomicRule(atomicClassName, cssText);
          }
        }
      }
    };

    each(style);
  };

  walk(style, ["&"], []);
  return classNames;
};
