import { defineField, defineType } from 'sanity'

export const artykul = defineType({
  name: 'artykul',
  title: 'Artykuł',
  type: 'document',
  fields: [
    defineField({
      name: 'tytul',
      type: 'string',
      title: 'Tytuł',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug URL',
      options: { source: 'tytul' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kategoria',
      type: 'string',
      title: 'Kategoria',
      options: {
        list: ['Recenzja', 'Technika', 'Historia', 'Wywiad', 'Aktualności', 'Premiera'],
      },
    }),
    defineField({
      name: 'zajawka',
      type: 'text',
      title: 'Zajawka (lead)',
      rows: 3,
    }),
    defineField({
      name: 'zdjecie',
      type: 'image',
      title: 'Zdjęcie główne (miniaturka)',
      description: 'Używane jako miniaturka na stronie głównej i listach. Jeśli nie ustawisz „Okładki artykułu", pojawi się też na górze artykułu.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Opis alternatywny',
        }),
      ],
    }),
    defineField({
      name: 'zdjecieArtykul',
      type: 'image',
      title: 'Okładka artykułu (opcjonalnie)',
      description: 'Duże zdjęcie na górze strony artykułu. Pozwala pokazać w artykule inne zdjęcie niż miniaturka na stronie głównej. Jeśli puste — użyte zostanie zdjęcie główne.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Opis alternatywny',
        }),
      ],
    }),
    defineField({
      name: 'trescGlowna',
      type: 'array',
      title: 'Treść',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Podpis / opis alternatywny',
            },
          ],
        },
        {
          type: 'object',
          name: 'gallery',
          title: 'Galeria zdjęć',
          fields: [
            {
              name: 'images',
              type: 'array',
              title: 'Zdjęcia',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    { name: 'alt', type: 'string', title: 'Opis alternatywny' },
                    { name: 'caption', type: 'string', title: 'Podpis pod zdjęciem' },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: { images: 'images' },
            prepare: ({ images }: { images?: unknown[] }) => ({
              title: `Galeria (${images?.length ?? 0} zdjęć)`,
            }),
          },
        },
        {
          type: 'object',
          name: 'youtubeEmbed',
          title: 'Osadzony film YouTube',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL YouTube',
            },
          ],
          preview: {
            select: { url: 'url' },
            prepare: ({ url }: { url?: string }) => ({
              title: 'Film YouTube',
              subtitle: url,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'autor',
      type: 'string',
      title: 'Autor',
    }),
    defineField({
      name: 'dataPublikacji',
      type: 'datetime',
      title: 'Data publikacji',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Artykuł wyróżniony',
      initialValue: false,
    }),
    defineField({
      name: 'czasCzytania',
      type: 'number',
      title: 'Czas czytania (minuty)',
    }),
    defineField({
      name: 'tagi',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Tagi',
    }),
    defineField({
      name: 'bannerGlowna',
      type: 'boolean',
      title: 'Pokaż na bannerze strony głównej?',
      description: 'Wyróżniona informacja na pasku pod hero. Tylko jeden artykuł powinien mieć tę flagę.',
      initialValue: false,
    }),
  ],
})
