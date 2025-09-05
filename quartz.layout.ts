import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PageTitle(), Component.Spacer()],
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

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Posts",
        limit: 3,
        linkToMore: "posts/" as SimpleSlug,
        filter: (page) => page.frontmatter?.title !== "Ishan Dhanani",
      }),
    ),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Posts",
        limit: 3,
        linkToMore: "posts/" as SimpleSlug,
        filter: (page) => page.frontmatter?.title !== "Ishan Dhanani",
      }),
    ),
  ],
  right: [],
}
