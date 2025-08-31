export const ICON_CATEGORIES = ["all","lang", "tech", "aws"] as const

// Keep filenames in sync with /public/vectors structure.
// You can add more here later without changing any code.
export const ICONS: Record<Exclude<(typeof ICON_CATEGORIES)[number], "all">, string[]> = {
  lang:[
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

  tech: [
    "angular",
    "api",
    "auth",
    "auth0",
    "aws",
    "azure",
    "chrome",
    "desktop",
    "django",
    "email",
    "excel",
    "express",
    "firebase",
    "flask",
    "flutter",
    "gcp",
    "gmail",
    "jwt",
    "key",
    "mobile",
    "mongodb",
    "mysql",
    "netlify",
    "node",
    "oracle",
    "pdf",
    "postgresql",
    "react-lib",
    "spring",
    "table",
    "typescript",
    "vscode",
    "web"

  ],
  aws: ["ebs", 
    "ec2", 
    "lambda"],
}
