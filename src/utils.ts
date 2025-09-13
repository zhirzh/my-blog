import type { HeadingTree, MdHeading, MdInstance } from '@/types'

export type Frontmatter = {
   layout: string
   title: string
   date: string
}

type Post = MdInstance<Frontmatter> & {
   formattedDate: string
   preview: string
   nextPost: Post | undefined
   prevPost: Post | undefined
}

async function loadPostFile(file: MdInstance<Frontmatter>) {
   const formattedDate = getFormattedDate(file.frontmatter.date)
   const content = await file.compiledContent()

   // const preview = content.split('<!-- preview -->')[0]
   const preview = content.match(/(<p>.*?<\/p>)/s)?.[1]
   if (!preview) throw new Error('No preview found')

   const post: Post = {
      ...file,
      formattedDate,
      preview,
      nextPost: undefined,
      prevPost: undefined,
   }

   return post
}

export async function getPosts() {
   const files = import.meta.glob<MdInstance<Frontmatter>>(
      '@/pages/posts/**/*.md',
      { eager: true },
   )

   const posts = await Promise.all(
      Object.values(files).map((file) => loadPostFile(file)),
   )

   posts.sort((a, b) => {
      const aDate = a.frontmatter.date
      const bDate = b.frontmatter.date
      return bDate.localeCompare(aDate)
   })

   posts.forEach((post, i) => {
      post.nextPost = posts[i + 1]
      post.prevPost = posts[i - 1]
   })

   return posts
}

export async function getPost(file: string) {
   const posts = await getPosts()
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
