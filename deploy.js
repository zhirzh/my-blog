#!/usr/bin/env node

import fs from 'fs'
import pages from 'gh-pages'

// set gh-pages cache directory
process.env.CACHE_DIR = '.deploy'

console.log('Starting...')

pages.publish(
   'dist',
   {
      nojekyll: true,
      beforeAdd(git) {
         // delete dotfiles (and folder)
         const keep = ['.git', '.nojekyll']
         fs.readdirSync(git.cwd).forEach((file) => {
            if (!file.startsWith('.')) return
            if (keep.includes(file)) return
            fs.rmSync(`${git.cwd}/${file}`, { recursive: true })
         })
      },
   },
   (err) => {
      if (err) {
         console.error('Failed:', err)
         process.exit(1)
      }
      console.log('Done')
   },
)
