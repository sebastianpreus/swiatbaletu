import { defineField, defineType } from 'sanity'

export const wywiad = defineType({
  name: 'wywiad',
  title: 'Wywiad',
  type: 'document',
  fields: [
    defineField({
      name: 'tytul',
      type: 'string',
      title: 'Tytuł wywiadu',
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
      name: 'rozmowca',
      type: 'reference',
      to: [{ type: 'sylwetka' }],
      title: 'Rozmówca',
    }),
    defineField({
      name: 'funkcjaRozmowcy',
      type: 'string',
      title: 'Funkcja w momencie wywiadu',
    }),
    defineField({
      name: 'zajawka',
      type: 'text',
      title: 'Lead',
      rows: 3,
    }),
    defineField({
      name: 'zdjecie',
      type: 'image',
      title: 'Zdjęcie',
      options: { hotspot: true },
    }),
    defineField({
      name: 'tresc',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Treść wywiadu',
    }),
    defineField({
      name: 'dataPublikacji',
      type: 'datetime',
      title: 'Data publikacji',
    }),
    defineField({
      name: 'wywiadTygodnia',
      type: 'boolean',
      title: 'Wywiad tygodnia?',
      initialValue: false,
    }),
  ],
})
