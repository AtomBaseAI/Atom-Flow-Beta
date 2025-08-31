export const ICON_CATEGORIES = ["all", "tech", "aws"] as const

// Keep filenames in sync with /public/vectors structure.
// You can add more here later without changing any code.
export const ICONS: Record<Exclude<(typeof ICON_CATEGORIES)[number], "all">, string[]> = {
  tech: [
    "angular",
    "api",
    "auth",
    "auth0",
    "aws",
    "azure",
    "c",
    "chrome",
    "cpp",
    "csharp",
    "dart",
    "desktop",
    "django",
    "email",
    "excel",
    "express",
    "firebase",
  ],
  aws: ["ebs", "ec2", "lambda"],
}
