import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🚀",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "ishan.rs",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Cal Sans",
        body: "Geist",
        code: "Berkeley Mono",
      },
      colors: {
        lightMode: {
          light: "#fefefe", // Pure white
          lightgray: "#f1f3f4", // Soft gray borders
          gray: "#8b949e", // Neutral gray
          darkgray: "#24292f", // Rich dark text
          dark: "#1c2128", // Deep headers
          secondary: "#0969da", // GitHub blue
          tertiary: "#0550ae", // Darker blue hover
          highlight: "rgba(9, 105, 218, 0.06)", // Subtle blue highlight
          textHighlight: "#fff8c4", // Warm highlight
        },
        darkMode: {
          light: "#0d1117", // GitHub dark bg
          lightgray: "#21262d", // Subtle borders
          gray: "#656d76", // Muted elements
          darkgray: "#e6edf3", // Clean white text
          dark: "#f0f6fc", // Bright headers
          secondary: "#58a6ff", // Bright blue links
          tertiary: "#1f6feb", // Blue hover
          highlight: "rgba(88, 166, 255, 0.1)", // Blue highlight
          textHighlight: "#ffd60a", // Gold highlight
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
