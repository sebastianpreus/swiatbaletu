// Artykuły na stronę główną
export const FEATURED_ARTICLES_QUERY = `
  *[_type == "artykul"] | order(featured desc, dataPublikacji desc) [0..5] {
    _id, tytul, slug, kategoria, zajawka, czasCzytania,
    zdjecie { asset, alt },
    dataPublikacji, autor
  }
`

// Wywiad tygodnia
export const WYWIAD_TYGODNIA_QUERY = `
  *[_type == "wywiad" && wywiadTygodnia == true] | order(dataPublikacji desc) [0] {
    _id, tytul, slug, zajawka, dataPublikacji,
    zdjecie { asset, alt },
    rozmowca->{ imieNazwisko, rola, teatrGlowny }
  }
`

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
    zdjecie { asset, alt },
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
    bio, najwazniejszeRole
  }
`

// Wszystkie wywiady
export const ALL_INTERVIEWS_QUERY = `
  *[_type == "wywiad"] | order(dataPublikacji desc) {
    _id, tytul, slug, zajawka, dataPublikacji, wywiadTygodnia,
    zdjecie { asset, alt },
    rozmowca->{ imieNazwisko, rola, teatrGlowny }
  }
`

// Pojedynczy wywiad po slug
export const INTERVIEW_BY_SLUG_QUERY = `
  *[_type == "wywiad" && slug.current == $slug] [0] {
    _id, tytul, slug, zajawka, dataPublikacji, funkcjaRozmowcy,
    zdjecie { asset, alt },
    tresc,
    rozmowca->{ imieNazwisko, rola, teatrGlowny, slug }
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
    dyrektorArtystyczny, liczbaMiejsc, stronaWww, linkBilety,
    logo { asset },
    zdjecie { asset, alt },
    opis
  }
`

// Pojedynczy teatr po slug z Sanity
export const TEATR_BY_SLUG_QUERY = `
  *[_type == "teatr" && slug.current == $slug] [0] {
    _id, nazwa, slug, miasto, adres, rokZalozenia,
    dyrektorArtystyczny, liczbaMiejsc, stronaWww, linkBilety,
    logo { asset },
    zdjecie { asset, alt },
    opis
  }
`
