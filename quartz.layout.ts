import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzPluginData } from "./quartz/plugins/vfile" // Import for filterFn type

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PageTitle(), Component.Spacer(), Component.Search(), Component.Darkmode()],
  afterBody: [
    // Component.ConditionalRender({
    //   component: Component.RecentNotes({
    //     title: "", // Suppress the default title
    //     limit: 3,
    //     showTags: false, // You can set this to true if you want tags under recent posts
    //     linkToMore: "/posts" as any, // Assumes articles will be in content/posts/
    //   }),
    //   condition: (page) => page.fileData.slug === "index",
    // }), // Removed from homepage bottom, will be in left sidebar
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/ishandhanani",
      Twitter: "https://twitter.com/0xishand",
      LinkedIn: "https://www.linkedin.com/in/ishandhanani/",
      // "RSS Feed": "/index.xml", // Add if you have RSS set up and want it in footer
    },
  }),
}

const excludeHomepageFilter = (page: QuartzPluginData) => page.slug !== "index"

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
  left: [
    Component.RecentNotes({
      title: "Recent Posts",
      limit: 5,
      showTags: false,
      linkToMore: "/posts" as any,
      filter: excludeHomepageFilter, // Changed from filterFn to filter, and corrected filter logic
    }),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.TagList()),
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.Backlinks()),
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
  left: [
    Component.RecentNotes({
      title: "Recent Posts",
      limit: 5,
      showTags: false,
      linkToMore: "/posts" as any,
      filter: excludeHomepageFilter, // Changed from filterFn to filter, and corrected filter logic
    }),
  ],
  right: [],
}
