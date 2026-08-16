export const Colors = {
  brand: {
    50: "#eef4ff",
    100: "#d9e6ff",
    200: "#b8d0ff",
    500: "#2b72e6",
    600: "#1f58c4",
    700: "#1a469f",
  },
  ink: "#171717",
  muted: "#475569",
  subtle: "#94a3b8",
  bg: "#eef4ff",
  card: "#ffffff",
  paper: "#ffffff",
  paperInk: "#171717",
  paperMuted: "#334155",
  paperSubtle: "#64748b",
  paperBorder: "#e2e8f0",
  good: "#059669",
  warn: "#d97706",
  bad: "#dc2626",
} as const;

export const siteConfig = {
  name: "Stratus",
  tagline: "Rainfall TEAM Battle Cards",
  description: "Internal hospital intelligence for conferences, outreach, and sales.",
  company: "Rainfall Health",
  email: "info@rainfallhealth.com",
  website: "https://www.rainfallhealth.com",
  copyright: `© ${new Date().getFullYear()} Rainfall Health · Internal use only`,
} as const;
