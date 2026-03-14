import { defineField, defineType } from 'sanity'

export const sylwetka = defineType({
  name: 'sylwetka',
  title: 'Sylwetka artysty',
  type: 'document',
  fields: [
    defineField({
      name: 'imieNazwisko',
      type: 'string',
      title: 'Imię i nazwisko',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug URL',
      options: { source: 'imieNazwisko' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rola',
      type: 'string',
      title: 'Rola/Funkcja',
      options: {
        list: [
          'Tancerz/ka',
          'Primabalerina',
          'Choreograf',
          'Dyrygent',
          'Dyrektor artystyczny',
          'Kompozytor',
          'Legenda',
        ],
      },
    }),
    defineField({
      name: 'zdjecie',
      type: 'image',
      title: 'Zdjęcie',
      options: { hotspot: true },
    }),
    defineField({
      name: 'teatrGlowny',
      type: 'string',
      title: 'Teatr / Zespół',
    }),
    defineField({
      name: 'narodowosc',
      type: 'string',
      title: 'Narodowość',
    }),
    defineField({
      name: 'dataUrodzenia',
      type: 'date',
      title: 'Data urodzenia',
    }),
    defineField({
      name: 'dataSmierci',
      type: 'date',
      title: 'Data śmierci (jeśli dotyczy)',
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Biografia',
    }),
    defineField({
      name: 'najwazniejszeRole',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Najważniejsze role',
    }),
    defineField({
      name: 'aktywny',
      type: 'boolean',
      title: 'Aktywny artysta?',
      initialValue: true,
    }),
    defineField({
      name: 'polskiArtysta',
      type: 'boolean',
      title: 'Polski artysta?',
      initialValue: false,
    }),
    defineField({
      name: 'wyroznienie',
      type: 'boolean',
      title: 'Wyróżniony na stronie głównej?',
      initialValue: false,
    }),
  ],
})
