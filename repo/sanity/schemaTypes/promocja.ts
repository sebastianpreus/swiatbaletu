import { defineField, defineType } from 'sanity'

export const promocja = defineType({
  name: 'promocja',
  title: 'Promocja / Oferta specjalna',
  type: 'document',
  fields: [
    defineField({
      name: 'tytul',
      type: 'string',
      title: 'Tytuł promocji',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'etykieta',
      type: 'string',
      title: 'Etykieta (np. "Tylko do niedzieli")',
    }),
    defineField({
      name: 'opis',
      type: 'text',
      title: 'Opis',
      rows: 2,
    }),
    defineField({
      name: 'kod',
      type: 'string',
      title: 'Kod rabatowy (opcjonalnie)',
    }),
    defineField({
      name: 'linkDoOferty',
      type: 'url',
      title: 'Link do oferty / kasy biletowej',
    }),
    defineField({
      name: 'aktywna',
      type: 'boolean',
      title: 'Aktywna?',
      initialValue: true,
    }),
    defineField({
      name: 'naStrGlownej',
      type: 'boolean',
      title: 'Pokaż na stronie głównej?',
      initialValue: false,
    }),
    defineField({
      name: 'dataOd',
      type: 'datetime',
      title: 'Ważna od',
    }),
    defineField({
      name: 'dataDo',
      type: 'datetime',
      title: 'Ważna do',
    }),
    defineField({
      name: 'teatr',
      type: 'reference',
      to: [{ type: 'teatr' }],
      title: 'Powiązany teatr',
    }),
  ],
})
