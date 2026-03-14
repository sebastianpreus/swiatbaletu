import { defineField, defineType } from 'sanity'

export const ticker = defineType({
  name: 'ticker',
  title: 'Ticker (pasek na żywo)',
  type: 'document',
  fields: [
    defineField({
      name: 'tresc',
      type: 'string',
      title: 'Treść komunikatu',
      description: 'Maks. 120 znaków',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'link',
      type: 'url',
      title: 'Link (opcjonalnie)',
    }),
    defineField({
      name: 'aktywny',
      type: 'boolean',
      title: 'Aktywny?',
      initialValue: true,
    }),
    defineField({
      name: 'kolejnosc',
      type: 'number',
      title: 'Kolejność wyświetlania',
    }),
    defineField({
      name: 'dataWygasniecia',
      type: 'datetime',
      title: 'Data wygaśnięcia (opcjonalnie)',
      description: 'Zostaw puste jeśli komunikat jest bezterminowy',
    }),
    defineField({
      name: 'typ',
      type: 'string',
      title: 'Typ',
      options: {
        list: ['info', 'premiera', 'transmisja', 'promocja', 'pilne'],
      },
    }),
  ],
  orderings: [
    {
      title: 'Kolejność',
      name: 'kolejnoscAsc',
      by: [{ field: 'kolejnosc', direction: 'asc' }],
    },
  ],
})
