import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
   base: '/my-blog',

   prefetch: {
      prefetchAll: true,
      defaultStrategy: 'viewport',
   },

   vite: {
      plugins: [tailwindcss()],
   },
})
