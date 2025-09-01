type MdFile = {
   file: string
   url: string
}

type MdContent = {
   rawContent(): string
   compiledContent(): Promise<string>
}

type Heading = {
   depth: 1 | 2 | 3 | 4 | 5 | 6
   slug: string
   text: string
}

export type MdProps<FM> = MdFile &
   MdContent & {
      frontmatter: Omit<FM, 'layout'> & MdFile
      content: Omit<FM, 'layout'> & MdFile
      headings: Heading[]
   }

export type Post<FM> = MdFile &
   MdContent & {
      frontmatter: FM
      getHeadings(): Heading[]
   }
