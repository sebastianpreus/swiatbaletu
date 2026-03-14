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
      of: [{ type: 'block' }, { type: 'image' }],
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
      title: 'Na stronie głównej?',
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
  ],
})
