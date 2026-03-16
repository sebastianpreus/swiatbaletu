import { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '../../sanity/lib/image'

export const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-[28px] font-normal text-text-1 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-[22px] font-normal text-text-1 mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-[14px] text-text-2 leading-[1.85] mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-[3px] border-gold pl-5 my-6 italic text-[14px] text-text-2 leading-[1.8]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-text-1">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      return (
        <figure className="my-6">
          <img
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            className="w-full rounded-lg"
          />
          {value.alt && (
            <figcaption className="text-[11px] text-text-2 mt-2 text-center italic">
              {value.alt}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-[14px] text-text-2 leading-[1.8]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-[14px] text-text-2 leading-[1.8]">{children}</ol>
    ),
  },
}
