import { defineNuxtConfig } from "nuxt/config"
import { fileURLToPath } from "url"

const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url))
const rootDir = fileURLToPath(new URL("../../", import.meta.url))

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  alias: {
    "@vueuse/head": `${rootDir}/src`,
  },
  workspaceDir: rootDir,
  hooks: {
    "modules:done"({ nuxt }) {
      // Replace #head alias
      nuxt.options.alias["#_head"] = nuxt.options.alias["#head"]
      nuxt.options.alias["#head"] = runtimeDir
      nuxt.options.build.transpile.push(runtimeDir)
    },
  },
})
