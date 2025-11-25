import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "ishan",
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
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        body: "Verdana, sans-serif",
        code: "monospace",
      },
      colors: {
        lightMode: {
          light: "#120c0e",
          lightgray: "#40363a",
          gray: "#6b5f63",
          darkgray: "#d9d8dc",
          dark: "#d9d8dc",
          secondary: "#eb99a1",
          tertiary: "#e26f7a",
          highlight: "rgba(235, 153, 161, 0.15)",
          textHighlight: "#eb99a1",
        },
        darkMode: {
          light: "#120c0e",
          lightgray: "#40363a",
          gray: "#6b5f63",
          darkgray: "#d9d8dc",
          dark: "#d9d8dc",
          secondary: "#eb99a1",
          tertiary: "#e26f7a",
          highlight: "rgba(235, 153, 161, 0.15)",
          textHighlight: "#eb99a1",
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
      // Disabled - can't use local fonts for OG images
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
