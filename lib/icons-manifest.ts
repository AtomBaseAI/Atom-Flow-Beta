export const ICON_CATEGORIES = ["all", "lang", "framework", "cloud", "tech", "aws"] as const

// Keep filenames in sync with /public/vectors structure.
// You can add more here later without changing any code.
export const ICONS: Record<Exclude<(typeof ICON_CATEGORIES)[number], "all">, string[]> = {
  lang: [
    "c",
    "cpp",
    "csharp",
    "dart",
    "go",
    "java",
    "js",
    "json",
    "php",
    "python",
    "ruby",
    "typescript",
    "sql"
  ],
  framework: [
    "angular",
    "django",
    "express",
    "flask",
    "flutter",
    "node",
    "react-lib",
    "spring",
  ],
  cloud: [
    "aws",
    "azure",
    "firebase",
    "gcp",
    "oracle",
    "netlify",
    "vercel"
  ],
  database: [
    "mongodb",
    "mysql",
    "postgresql",
  ],
  tech: [
    "api",
    "auth",
    "auth0",
    "chrome",
    "desktop",
    "email",
    "excel",
    "gmail",
    "jwt",
    "key",
    "mobile",
    "pdf",
    "table",
    "vscode",
    "web"

  ],
  aws: ["ebs",
    "ec2",
    "lambda"],
}
