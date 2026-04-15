import { defineField, defineType } from 'sanity'

export const strona = defineType({
  name: 'strona',
  title: 'Strona techniczna',
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
      name: 'opis',
      type: 'text',
      title: 'Krótki opis (SEO)',
      rows: 2,
    }),
    defineField({
      name: 'tresc',
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
          name: 'osoba',
          title: 'Osoba (profil)',
          fields: [
            { name: 'imie', type: 'string', title: 'Imię i nazwisko' },
            { name: 'rola', type: 'string', title: 'Rola / stanowisko' },
            { name: 'zdjecie', type: 'image', title: 'Zdjęcie', options: { hotspot: true } },
            { name: 'bio', type: 'text', title: 'Opis (akapit 1)', rows: 4 },
            { name: 'bio2', type: 'text', title: 'Opis (akapit 2)', rows: 4 },
          ],
          preview: {
            select: { title: 'imie', subtitle: 'rola' },
          },
        },
        {
          type: 'object',
          name: 'kontakt',
          title: 'Sekcja kontaktowa',
          fields: [
            { name: 'tytulSekcji', type: 'string', title: 'Tytuł sekcji' },
            {
              name: 'kolumny',
              type: 'array',
              title: 'Kolumny kontaktowe',
              of: [{
                type: 'object',
                fields: [
                  { name: 'naglowek', type: 'string', title: 'Nagłówek' },
                  { name: 'tekst', type: 'text', title: 'Tekst', rows: 2 },
                  { name: 'email', type: 'string', title: 'Email' },
                ],
              }],
            },
          ],
          preview: {
            select: { title: 'tytulSekcji' },
            prepare: ({ title }) => ({ title: title || 'Kontakt' }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'tytul' },
  },
})
