import { defineField, defineType } from 'sanity'

export const teatr = defineType({
  name: 'teatr',
  title: 'Teatr',
  type: 'document',
  fields: [
    defineField({
      name: 'nazwa',
      type: 'string',
      title: 'Nazwa teatru',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug URL',
      options: { source: 'nazwa' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'miasto',
      type: 'string',
      title: 'Miasto',
      options: {
        list: ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Bydgoszcz', 'Inne'],
      },
    }),
    defineField({
      name: 'adres',
      type: 'string',
      title: 'Adres',
    }),
    defineField({
      name: 'rokZalozenia',
      type: 'number',
      title: 'Rok założenia',
    }),
    defineField({
      name: 'dyrektorArtystyczny',
      type: 'string',
      title: 'Dyrektor artystyczny',
    }),
    defineField({
      name: 'liczbaMiejsc',
      type: 'number',
      title: 'Liczba miejsc (sala główna)',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
    }),
    defineField({
      name: 'zdjecie',
      type: 'image',
      title: 'Zdjęcie budynku',
      options: { hotspot: true },
    }),
    defineField({
      name: 'opis',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Opis',
    }),
    defineField({
      name: 'stronaWww',
      type: 'url',
      title: 'Strona WWW',
    }),
    defineField({
      name: 'linkBilety',
      type: 'url',
      title: 'Link do kasy biletowej',
    }),
  ],
})
