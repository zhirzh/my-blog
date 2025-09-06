import type { HeadingTree, MdHeading, MdInstance } from '@/types'

export type Frontmatter = {
   layout: string
   title: string
   date: string
}

type Post = MdInstance<Frontmatter> & {
   formattedDate: string
   nextPost: Post | undefined
   prevPost: Post | undefined
}

export function getPost(file: string) {
   const files = import.meta.glob<MdInstance<Frontmatter>>(
      '@/pages/posts/**/*.md',
      { eager: true },
   )

   const posts = Object.values(files).map<Post>((file) => {
      const formattedDate = getFormattedDate(file.frontmatter.date)
      return {
         ...file,
         formattedDate,
         nextPost: undefined,
         prevPost: undefined,
      }
   })

   posts.sort((a, b) => {
      const aDate = a.frontmatter.date
      const bDate = b.frontmatter.date
      return aDate.localeCompare(bDate)
   })

   posts.forEach((post, i) => {
      post.nextPost = posts[i + 1]
      post.prevPost = posts[i - 1]
   })

   const post = posts.find((p) => p.file === file)!
   return post
}

function getFormattedDate(date: string) {
   const d = new Date(date)

   const year = d.getFullYear()
   const month = d.toLocaleString('en-US', { month: 'long' })
   const day = d.getDate()
   const suffix = getOrdinalSuffix(day)

   return `${month} ${day}${suffix}, ${year}`
}

function getOrdinalSuffix(n: number) {
   if (n >= 11 && n <= 13) return 'th'

   switch (n % 10) {
      case 1:
         return 'st'
      case 2:
         return 'nd'
      case 3:
         return 'rd'
      default:
         return 'th'
   }
}

export function getHeadingTree(headings: MdHeading[]) {
   const root = { depth: 0, children: [] } as unknown as HeadingTree

   const nodes = headings.map<HeadingTree>((h) => ({ ...h, children: [] }))

   const stack: HeadingTree[] = [root]
   for (const node of nodes) {
      while (true) {
         const last = stack[stack.length - 1]!
         if (last.depth < node.depth) {
            last.children.push(node)
            break
         }
         stack.pop()
      }
      stack.push(node)
   }

   return stack[0]!.children
}
