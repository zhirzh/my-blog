import type {
   MarkdownHeading,
   MarkdownInstance,
   MarkdownLayoutProps,
} from 'astro'

type MarkdownHeadingDepth = 1 | 2 | 3 | 4 | 5 | 6

export type MdHeading = MarkdownHeading & {
   depth: MarkdownHeadingDepth
}

export type MdLayoutProps<FM extends Record<string, any>> =
   MarkdownLayoutProps<FM> & {
      headings: MdHeading[]
   }

export type MdInstance<FM extends Record<string, any>> =
   MarkdownInstance<FM> & {
      getHeadings(): MdHeading[]
   }

export type HeadingTree = MdHeading & {
   children: HeadingTree[]
}

declare global {
   type Nullish = null | undefined
   type Falsy = false | 0 | '' | Nullish
   interface Array<T> {
      filter(predicate: BooleanConstructor): Exclude<T, Falsy>[]
   }
}
