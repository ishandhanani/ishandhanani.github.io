import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PageTitle(), Component.Spacer(), Component.Darkmode()],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/ishandhanani",
      Twitter: "https://twitter.com/0xishand",
      LinkedIn: "https://www.linkedin.com/in/ishandhanani/",
      Email: "mailto:me@ishan.rs",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index", // This page refers to the CURRENT page being rendered
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.TagList()),
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.Backlinks()),
    Component.DesktopOnly(Component.RecentNotes()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index", // This page refers to the CURRENT page being rendered
    }),
    Component.ArticleTitle(),
  ],
  left: [],
  right: [],
}
