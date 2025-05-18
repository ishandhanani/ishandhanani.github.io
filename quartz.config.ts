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
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#fbf1c7", // Page background
          lightgray: "#d5c4a1", // Borders
          gray: "#bdae93", // Heavier borders, graph links
          darkgray: "#3c3836", // Body text
          dark: "#3c3836", // Header text, icons
          secondary: "#076678", // Link color
          tertiary: "#b57614", // Hover states
          highlight: "rgba(7, 102, 120, 0.1)", // Internal link bg, code line highlight
          textHighlight: "rgba(181, 118, 20, 0.25)", // Markdown ==highlight== bg
        },
        darkMode: {
          light: "#282828", // Page background
          lightgray: "#504945", // Borders
          gray: "#7c6f64", // Heavier borders, graph links
          darkgray: "#ebdbb2", // Body text
          dark: "#ebdbb2", // Header text, icons
          secondary: "#83a598", // Link color
          tertiary: "#fabd2f", // Hover states
          highlight: "rgba(131, 165, 152, 0.15)", // Internal link bg, code line highlight
          textHighlight: "rgba(250, 189, 47, 0.3)", // Markdown ==highlight== bg
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
