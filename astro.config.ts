import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import type { Element } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Nodes as MdastNodes, Root as MdastRoot } from 'mdast'
import { visit } from 'unist-util-visit'

const baseUrl = '/my-blog'

// https://astro.build/config
export default defineConfig({
   base: baseUrl,

   prefetch: {
      prefetchAll: true,
      defaultStrategy: 'viewport',
   },

   markdown: {
      remarkPlugins: [remarkBaseUrlResolver],
   },

   vite: {
      plugins: [tailwindcss()],
   },
})

function remarkBaseUrlResolver() {
   return (tree: MdastRoot) => {
      visit(tree, (node) => {
         resolveMarkdownNodeBaseUrl(node)
      })
   }
}

function resolveMarkdownNodeBaseUrl(node: MdastNodes) {
   switch (node.type) {
      case 'definition':
      case 'image':
      case 'link': {
         if (node.url.startsWith('/')) {
            node.url = baseUrl + node.url
         }
         break
      }

      case 'html': {
         const html = node.value
         const hast = fromHtml(html)
         visit(hast, 'element', (elem) => {
            resolveHtmlElementBaseUrl(elem)
         })
         node.value = toHtml(hast)
         break
      }
   }
}

function resolveHtmlElementBaseUrl(_elem: Element) {
   type HtmlElement = {
      [K in keyof HTMLElementTagNameMap]: {
         tagName: K
         properties: HTMLElementTagNameMap[K]
      }
   }[keyof HTMLElementTagNameMap]

   const elem = _elem as Element & HtmlElement

   switch (elem.tagName) {
      case 'a': {
         if (elem.properties.href.startsWith('/')) {
            elem.properties.href = baseUrl + elem.properties.href
         }
         break
      }

      case 'img':
      case 'iframe':
      case 'video': {
         if (elem.properties.src.startsWith('/')) {
            elem.properties.src = baseUrl + elem.properties.src
         }
         break
      }
   }
}
