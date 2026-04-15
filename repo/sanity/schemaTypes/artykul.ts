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
      title: 'Zdjęcie główne',
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
