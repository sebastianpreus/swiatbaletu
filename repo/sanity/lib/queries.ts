// Ticker — tylko aktywne, posortowane, niewygasłe
export const TICKER_QUERY = `
  *[_type == "ticker" && aktywny == true && (
    !defined(dataWygasniecia) || dataWygasniecia > now()
  )] | order(kolejnosc asc) {
    _id, tresc, link, typ
  }
`

// Sylwetki wyróżnione
export const FEATURED_PROFILES_QUERY = `
  *[_type == "sylwetka" && wyroznienie == true] | order(imieNazwisko asc) [0..7] {
    _id, imieNazwisko, slug, rola, teatrGlowny, aktywny,
    zdjecie { asset, alt }
  }
`

// Promocje aktywne na stronie głównej
export const ACTIVE_PROMOS_QUERY = `
  *[_type == "promocja" && aktywna == true && naStrGlownej == true && (
    !defined(dataDo) || dataDo > now()
  )] | order(_createdAt desc) [0..2] {
    _id, tytul, etykieta, opis, kod, linkDoOferty,
    teatr->{ nazwa, miasto }
  }
`

// Sylwetki do wspólnej siatki na stronie głównej. Sylwetki nie mają
// dataPublikacji, więc do wspólnego sortowania z artykułami służy _createdAt.
export const HOMEPAGE_PROFILES_QUERY = `
  *[_type == "sylwetka"] | order(_createdAt desc) [0..7] {
    _id, imieNazwisko, slug, rola, teatrGlowny, _createdAt,
    zdjecie { asset, alt }
  }
`

// Wszystkie artykuły dla strony głównej — jedna pula, którą sekcje
// (banner, hero, kolumna boczna, siatka) rozdzielają między siebie.
// Patrz components/home/homepageArticles.ts
export const HOMEPAGE_ARTICLES_QUERY = `
  *[_type == "artykul"] | order(dataPublikacji desc) {
    _id, tytul, slug, kategoria, zajawka, czasCzytania,
    zdjecie { asset, alt },
    dataPublikacji, autor, featured, bannerGlowna
  }
`

// Wszystkie artykuły (lista)
export const ALL_ARTICLES_QUERY = `
  *[_type == "artykul"] | order(dataPublikacji desc) {
    _id, tytul, slug, kategoria, zajawka, czasCzytania,
    zdjecie { asset, alt },
    dataPublikacji, autor
  }
`

// Pojedynczy artykuł po slug
export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "artykul" && slug.current == $slug] [0] {
    _id, tytul, slug, kategoria, zajawka, czasCzytania,
    zdjecie { asset, alt, zrodlo },
    zdjecieArtykul { asset, alt, zrodlo },
    trescGlowna,
    dataPublikacji, autor, tagi
  }
`

// Wszystkie sylwetki
export const ALL_PROFILES_QUERY = `
  *[_type == "sylwetka"] | order(imieNazwisko asc) {
    _id, imieNazwisko, slug, rola, teatrGlowny, aktywny, polskiArtysta,
    zdjecie { asset, alt }
  }
`

// Pojedyncza sylwetka po slug
export const PROFILE_BY_SLUG_QUERY = `
  *[_type == "sylwetka" && slug.current == $slug] [0] {
    _id, imieNazwisko, slug, rola, teatrGlowny, narodowosc,
    dataUrodzenia, dataSmierci, aktywny, polskiArtysta,
    zdjecie { asset, alt },
    bio, najwazniejszeRole,
    galeria[] { asset, alt, caption }
  }
`

// Wywiady = artykuły z kategorią "Wywiad".
// Wywiad to zwykły artykuł — pojawia się na stronie głównej i w /artykuly,
// a zakładka /wywiady jest dodatkowym, filtrowanym widokiem tych samych treści.
export const INTERVIEW_ARTICLES_QUERY = `
  *[_type == "artykul" && kategoria == "Wywiad"] | order(featured desc, dataPublikacji desc) {
    _id, tytul, slug, zajawka, dataPublikacji, autor, czasCzytania, featured,
    zdjecie { asset, alt }
  }
`

// Wszystkie promocje aktywne
export const ALL_PROMOS_QUERY = `
  *[_type == "promocja" && aktywna == true && (
    !defined(dataDo) || dataDo > now()
  )] | order(_createdAt desc) {
    _id, tytul, etykieta, opis, kod, linkDoOferty, dataOd, dataDo,
    teatr->{ nazwa, miasto }
  }
`

// Wszystkie teatry z Sanity
export const ALL_TEATRY_SANITY_QUERY = `
  *[_type == "teatr"] | order(nazwa asc) {
    _id, nazwa, slug, miasto, adres, rokZalozenia,
    dyrektor, kierownikBaletu, liczbaMiejsc, stronaWww, linkBilety,
    logo { asset },
    zdjecie { asset, alt },
    opis
  }
`

// Newsletter po ID
export const NEWSLETTER_BY_ID_QUERY = `
  *[_type == "newsletter" && _id == $id][0] {
    _id, tytul, preheader, wstep, tresc, ctaText, ctaLink, status,
    polecaneArtykuly[]->{ tytul, slug, zajawka, kategoria }
  }
`

// Email powitalny (newsletter o slugId "email-powitalny")
export const WELCOME_EMAIL_QUERY = `
  *[_type == "newsletter" && slugId.current == "email-powitalny"][0] {
    _id, tytul, preheader, wstep, tresc, ctaText, ctaLink,
    polecaneArtykuly[]->{ tytul, slug, zajawka, kategoria }
  }
`

// Wszystkie newslettery
export const ALL_NEWSLETTERS_QUERY = `
  *[_type == "newsletter"] | order(_createdAt desc) {
    _id, tytul, status, dataWyslania, liczbaOdbiorcow
  }
`

// Pojedynczy teatr po slug z Sanity
export const TEATR_BY_SLUG_QUERY = `
  *[_type == "teatr" && slug.current == $slug] [0] {
    _id, nazwa, slug, miasto, adres, rokZalozenia,
    dyrektor, kierownikBaletu, liczbaMiejsc, stronaWww, linkBilety,
    logo { asset },
    zdjecie { asset, alt },
    opis
  }
`

// Strona techniczna po slug
export const STRONA_BY_SLUG_QUERY = `
  *[_type == "strona" && slug.current == $slug] [0] {
    _id, tytul, slug, opis, tresc
  }
`
