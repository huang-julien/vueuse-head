import { createSSRApp, ref, h } from "vue"
import { renderToString } from "@vue/server-renderer"
import { createHead, renderHeadToString, useHead, Head } from "../src"
import { ssrRenderHeadToString } from "./shared/utils"

describe("vue ssr", () => {
  test("server", async () => {
    const headResult = await ssrRenderHeadToString({
      title: `hello`,
      htmlAttrs: {
        lang: "zh",
      },
      meta: [
        {
          name: "description",
          content: "desc",
        },
        {
          name: "description",
          content: "desc 2",
        },
        {
          property: "og:locale:alternate",
          content: "fr",
          key: "fr",
        },
        {
          property: "og:locale:alternate",
          content: "zh",
          key: "zh",
        },
      ],
      script: [
        {
          src: "foo.js",
        },
      ],
    })

    expect(headResult.headTags).toMatchInlineSnapshot(
      '"<title>hello</title><meta name=\\"description\\" content=\\"desc 2\\"><meta property=\\"og:locale:alternate\\" content=\\"fr\\"><meta property=\\"og:locale:alternate\\" content=\\"zh\\"><script src=\\"foo.js\\"></script><meta name=\\"head:count\\" content=\\"4\\">"',
    )
    expect(headResult.htmlAttrs).toEqual(` lang="zh" data-head-attrs="lang"`)
  })

  test("useHead: server async setup", async () => {
    const head = createHead()
    const app = createSSRApp({
      async setup() {
        const title = ref(`initial title`)
        useHead({ title })
        await new Promise((resolve) => setTimeout(resolve, 200))
        title.value = "new title"
        return () => <div>hi</div>
      },
    })
    app.use(head)
    await renderToString(app)

    const { headTags } = renderHeadToString(head)
    expect(headTags).match(/new title/)
  })

  test("<Head>: link & meta with v-for", async () => {
    const head = createHead()
    const app = createSSRApp({
      template: `<Head>
      <meta v-for="meta in metaList" :key="meta.property" :property="meta.property" :content="meta.content" />
      </Head>`,
      components: { Head },
      data() {
        return {
          metaList: [
            { property: "test1", content: "test1" },
            { property: "test2", content: "test2" },
          ],
        }
      },
    })
    app.use(head)
    await renderToString(app)

    const { headTags } = renderHeadToString(head)
    expect(headTags).toMatchInlineSnapshot(
      '"<meta property=\\"test1\\" content=\\"test1\\"><meta property=\\"test2\\" content=\\"test2\\"><meta name=\\"head:count\\" content=\\"2\\">"',
    )
  })

  test("<Head>: server async setup", async () => {
    const head = createHead()
    const app = createSSRApp({
      async setup() {
        const title = ref(`initial title`)
        await new Promise((resolve) => setTimeout(resolve, 200))
        title.value = "new title"
        return () => <Head>{() => <title>{title.value}</title>}</Head>
      },
    })
    app.use(head)
    await renderToString(app)

    const { headTags } = renderHeadToString(head)
    expect(headTags).match(/new title/)
  })

  test("children", async () => {
    const headResult = await ssrRenderHeadToString({
      script: [
        {
          children: `console.log('hi')`,
        },
      ],
    })

    expect(headResult.headTags).equals(
      `<script>console.log('hi')</script><meta name="head:count" content="1">`,
    )
  })

  test("script key", async () => {
    const headResult = await ssrRenderHeadToString({
      script: [
        {
          key: "my-script",
          children: `console.log('A')`,
        },
        {
          key: "my-script",
          children: `console.log('B')`,
        },
      ],
    })

    expect(headResult.headTags).equals(
      `<script>console.log('B')</script><meta name="head:count" content="1">`,
    )
  })
})
