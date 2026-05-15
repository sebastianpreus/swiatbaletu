import { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '../../sanity/lib/image'
import GalleryWithLightbox from '../ui/GalleryWithLightbox'

export const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-[28px] font-normal text-text-1 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-[22px] font-normal text-text-1 mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-[16px] text-text-2 leading-[1.9] mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-[3px] border-gold pl-5 my-6 italic text-[16px] text-text-2 leading-[1.9]">
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
        style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'underline' }}
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
    gallery: ({ value }) => {
      if (!value?.images?.length) return null
      const images = value.images.map((img: { asset?: object; alt?: string; caption?: string }) => ({
        src: urlFor(img).width(400).height(300).url(),
        srcFull: urlFor(img).width(1400).url(),
        alt: img.alt || '',
        caption: img.caption,
      }))
      return <GalleryWithLightbox images={images} />
    },
    youtubeEmbed: ({ value }) => {
      if (!value?.url) return null
      const videoId = (value.url as string).match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      )?.[1]
      if (!videoId) return null
      return (
        <div className="my-8 rounded-lg overflow-hidden" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-[16px] text-text-2 leading-[1.9]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-[16px] text-text-2 leading-[1.9]">{children}</ol>
    ),
  },
}
