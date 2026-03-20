'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'

interface GalleryImage {
  src: string
  srcFull?: string
  alt: string
  caption?: string
}

interface GalleryWithLightboxProps {
  images: GalleryImage[]
}

export default function GalleryWithLightbox({ images }: GalleryWithLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxImages = images.map((img) => ({
    src: img.srcFull || img.src,
    alt: img.alt,
    caption: img.caption,
  }))

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <figure
            key={idx}
            className="overflow-hidden rounded-[6px] border-[0.5px] border-border cursor-pointer group"
            onClick={() => setLightboxIndex(idx)}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {img.caption && (
              <figcaption className="text-[10px] text-text-2 px-2 py-1.5 bg-bg-section">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
