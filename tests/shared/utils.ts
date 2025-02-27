import { createHead, HeadObject, renderHeadToString, useHead } from "../../src"
import { createSSRApp } from "vue"
import { renderToString } from "@vue/server-renderer"

export async function ssrRenderHeadToString(input: HeadObject) {
  const head = createHead()
  const app = createSSRApp({
    setup() {
      useHead(input)
      return () => "<div>hi</div>"
    },
  })
  app.use(head)
  await renderToString(app)

  return renderHeadToString(head)
}
