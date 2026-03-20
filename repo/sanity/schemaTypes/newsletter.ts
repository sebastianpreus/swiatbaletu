import { defineType, defineField } from 'sanity'

export const newsletter = defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  fields: [
    defineField({
      name: 'tytul',
      type: 'string',
      title: 'Tytuł / Temat maila',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'preheader',
      type: 'string',
      title: 'Preheader',
      description: 'Krótki tekst widoczny w podglądzie maila w skrzynce (maks. 120 znaków)',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'wstep',
      type: 'text',
      title: 'Wstęp',
      description: 'Krótki wstęp na górze newslettera (1-3 zdania)',
      rows: 3,
    }),
    defineField({
      name: 'tresc',
      type: 'array',
      title: 'Treść newslettera',
      description: 'Główna treść — tekst, zdjęcia, formatowanie',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'polecaneArtykuly',
      type: 'array',
      title: 'Polecane artykuły',
      description: 'Linki do artykułów na portalu — zachęcają do odwiedzin',
      of: [
        {
          type: 'reference',
          to: [{ type: 'artykul' }],
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'Tekst przycisku CTA',
      description: 'Np. "Czytaj więcej na portalu", "Zobacz repertuar"',
      initialValue: 'Odwiedź Świat Baletu',
    }),
    defineField({
      name: 'ctaLink',
      type: 'url',
      title: 'Link przycisku CTA',
      initialValue: 'https://swiatbaletu.vercel.app',
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          { title: 'Szkic', value: 'szkic' },
          { title: 'Gotowy do wysyłki', value: 'gotowy' },
          { title: 'Wysłany', value: 'wyslany' },
        ],
        layout: 'radio',
      },
      initialValue: 'szkic',
    }),
    defineField({
      name: 'dataWyslania',
      type: 'datetime',
      title: 'Data wysłania',
      description: 'Uzupełniane automatycznie po wysyłce',
      readOnly: true,
    }),
    defineField({
      name: 'liczbaOdbiorcow',
      type: 'number',
      title: 'Liczba odbiorców',
      description: 'Uzupełniane automatycznie po wysyłce',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Najnowsze',
      name: 'newest',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'tytul',
      status: 'status',
      date: 'dataWyslania',
    },
    prepare({ title, status, date }) {
      const statusLabels: Record<string, string> = {
        szkic: '📝 Szkic',
        gotowy: '✅ Gotowy',
        wyslany: '📨 Wysłany',
      }
      return {
        title: title || 'Bez tytułu',
        subtitle: `${statusLabels[status] || status}${date ? ` · ${new Date(date).toLocaleDateString('pl-PL')}` : ''}`,
      }
    },
  },
})
