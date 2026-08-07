import { createStitches } from "@artmsilva/seams-react";

export const { styled, css, globalCss, keyframes, createTheme, theme, getCssText } = createStitches(
  {
    atomic: true,
    prefix: "seams-docs",
    theme: {
      colors: {
        // Brand
        brand: "#0066FF",
        brandLight: "#3388FF",
        brandDark: "#0044CC",

        // Accent
        accent: "#7C3AED",
        accentLight: "#9F67FF",

        // Semantic
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",

        // Surfaces
        bg: "#0A0F1E",
        bgSubtle: "#111827",
        bgMuted: "#1F2937",
        bgElevated: "#263044",

        // Text
        text: "#F9FAFB",
        textSecondary: "#9CA3AF",
        textMuted: "#6B7280",

        // Borders
        border: "#374151",
        borderSubtle: "#1F2937",

        // Code
        codeBg: "#0D1117",
        codeText: "#E6EDF3",

        // Interactive
        link: "#3388FF",
        linkHover: "#66AAFF",
      },
      space: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "32px",
        8: "48px",
      },
      fonts: {
        body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        mono: "'SF Mono', SFMono-Regular, ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace",
      },
      fontSizes: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "56px",
      },
      fontWeights: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      lineHeights: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75",
      },
      radii: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
      },
      shadows: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
        md: "0 4px 6px rgba(0, 0, 0, 0.3)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(0, 102, 255, 0.15)",
      },
    },
    media: {
      sm: "(min-width: 640px)",
      md: "(min-width: 768px)",
      lg: "(min-width: 1024px)",
      xl: "(min-width: 1280px)",
    },
    utils: {
      mx: (value: string) => ({ marginLeft: value, marginRight: value }),
      my: (value: string) => ({ marginTop: value, marginBottom: value }),
      px: (value: string) => ({ paddingLeft: value, paddingRight: value }),
      py: (value: string) => ({ paddingTop: value, paddingBottom: value }),
    },
  },
);

export const lightTheme = createTheme("light-theme", {
  colors: {
    brand: "#0055DD",
    brandLight: "#2277EE",
    brandDark: "#003399",

    accent: "#6D28D9",
    accentLight: "#8B5CF6",

    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",

    bg: "#FFFFFF",
    bgSubtle: "#F9FAFB",
    bgMuted: "#F3F4F6",
    bgElevated: "#FFFFFF",

    text: "#111827",
    textSecondary: "#4B5563",
    textMuted: "#9CA3AF",

    border: "#E5E7EB",
    borderSubtle: "#F3F4F6",

    codeBg: "#F6F8FA",
    codeText: "#24292F",

    link: "#0055DD",
    linkHover: "#003399",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    glow: "0 0 20px rgba(0, 85, 221, 0.1)",
  },
});
