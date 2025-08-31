export const ICON_CATEGORIES = ["all", "lang", "framework", "testing", "database","files", "cloud", "tech", "aws"] as const

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
  testing: [
    "cucumber-bdd",
    "jest",
    "junit5",
    "mocha",
    "playwright",
    "puppeteer",
    "selenium"
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
  files:[
   "txt",
   "pdf",
   "jpg",
   "png",
   "mp3",
   "mp4",
   "zip",
   "exe",
   "iso",
   "csv",
   "figma",
   "excel",
   "powerpoint",
   "ppt",
   "word",
   "photoshop",
   "illustrator",
   "lightroom",
   "premiere",
   "xd" 
  ],
  tech: [
    "api",
    "auth",
    "auth0",
    "chrome",
    "desktop",
    "email",
    "gmail",
    "jwt",
    "key",
    "mobile",
    "table",
    "vscode",
    "web"

  ],
  aws: ["ebs",
    "ec2",
    "lambda"],
}
