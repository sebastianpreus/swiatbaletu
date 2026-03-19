import type { PortableTextBlock } from '@portabletext/types'

// Sanity types
export interface SanityImage {
  asset: {
    _ref: string
  }
  alt?: string
}

export interface Artykul {
  _id: string
  tytul: string
  slug: { current: string }
  kategoria: string
  zajawka: string
  zdjecie: SanityImage
  trescGlowna: PortableTextBlock[]
  autor: string
  dataPublikacji: string
  featured: boolean
  czasCzytania: number
  tagi: string[]
}

export interface Sylwetka {
  _id: string
  imieNazwisko: string
  slug: { current: string }
  rola: string
  zdjecie: SanityImage
  teatrGlowny: string
  narodowosc: string
  dataUrodzenia: string
  dataSmierci?: string
  bio: PortableTextBlock[]
  najwazniejszeRole: string[]
  aktywny: boolean
  polskiArtysta: boolean
  wyroznienie: boolean
  galeria?: { asset: unknown; alt?: string; caption?: string }[]
}

export interface Wywiad {
  _id: string
  tytul: string
  slug: { current: string }
  zajawka: string
  zdjecie: SanityImage
  tresc: PortableTextBlock[]
  dataPublikacji: string
  wywiadTygodnia: boolean
  funkcjaRozmowcy: string
  rozmowca: {
    imieNazwisko: string
    rola: string
    teatrGlowny: string
    slug?: { current: string }
  }
}

export interface TickerItem {
  _id: string
  tresc: string
  link?: string
  typ: 'info' | 'premiera' | 'transmisja' | 'promocja' | 'pilne'
}

export interface Promocja {
  _id: string
  tytul: string
  etykieta: string
  opis: string
  kod?: string
  linkDoOferty: string
  teatr?: {
    nazwa: string
    miasto: string
  }
}

// Supabase types
export interface Teatr {
  id: string
  nazwa: string
  miasto: string
  slug: string
  www?: string
  bilety?: string
}

export interface Spektakl {
  id: string
  tytul: string
  kompozytor?: string
  choreograf?: string
  teatr_id: string
  opis?: string
  zdjecie_url?: string
}

export interface Przedstawienie {
  id: string
  spektakl_id: string
  teatr_id: string
  data_czas: string
  link_bilety?: string
  dostepnosc: 'dostepne' | 'malo_miejsc' | 'wyprzedane' | 'premiera'
  cena_od?: number
  notatka?: string
  spektakl?: Spektakl
  teatr?: Teatr
}

export interface Obsada {
  id: string
  przedstawienie_id: string
  imie_nazwisko: string
  rola: string
  sanity_sylwetka_id?: string
}
