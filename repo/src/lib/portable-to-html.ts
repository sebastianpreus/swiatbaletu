import { toHTML } from '@portabletext/to-html'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || blocks.length === 0) return ''

  return toHTML(blocks, {
    components: {
      types: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image: ({ value }: any) => {
          if (value?.asset?._ref) {
            const [, id, dimensions, format] = value.asset._ref.split('-')
            const url = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`
            return `<img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 3px; margin: 16px 0;" />`
          }
          return ''
        },
      },
      marks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link: ({ children, value }: any) =>
          `<a href="${value?.href}" style="color: #A8832A; text-decoration: underline;">${children}</a>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        strong: ({ children }: any) =>
          `<strong style="font-weight: 600;">${children}</strong>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        em: ({ children }: any) =>
          `<em>${children}</em>`,
      },
      block: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h2: ({ children }: any) =>
          `<h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: #1a1814; margin: 24px 0 10px; font-weight: 600;">${children}</h2>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h3: ({ children }: any) =>
          `<h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #A8832A; margin: 20px 0 8px; font-weight: 600;">${children}</h3>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        normal: ({ children }: any) =>
          `<p style="margin: 0 0 14px; line-height: 1.7;">${children}</p>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blockquote: ({ children }: any) =>
          `<blockquote style="border-left: 3px solid #A8832A; padding: 10px 20px; margin: 16px 0; color: #6b6457; font-style: italic;">${children}</blockquote>`,
      },
    },
  })
}
