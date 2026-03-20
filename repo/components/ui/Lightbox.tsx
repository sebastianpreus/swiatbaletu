'use client'

import { useEffect, useCallback, useState } from 'react'

interface LightboxImage {
  src: string
  alt: string
  caption?: string
}

interface LightboxProps {
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const current = images[index]

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, goPrev, goNext])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay 70% opacity */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white text-[32px] leading-none cursor-pointer transition-colors"
        aria-label="Zamknij"
      >
        &times;
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/60 text-[13px] tracking-wide">
        {index + 1} / {images.length}
      </div>

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-3 sm:left-6 z-10 text-white/60 hover:text-white text-[36px] leading-none cursor-pointer transition-colors select-none"
          aria-label="Poprzednie"
        >
          &#8249;
        </button>
      )}

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-3 sm:right-6 z-10 text-white/60 hover:text-white text-[36px] leading-none cursor-pointer transition-colors select-none"
          aria-label="Następne"
        >
          &#8250;
        </button>
      )}

      {/* Image + caption */}
      <div
        className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-full max-h-[78vh] object-contain rounded-[4px]"
        />
        {current.caption && (
          <div className="text-white/70 text-[12px] mt-2 text-center max-w-[600px]">
            {current.caption}
          </div>
        )}
      </div>
    </div>
  )
}
