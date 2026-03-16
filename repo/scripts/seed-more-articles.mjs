import { createClient } from 'next-sanity'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const articles = [
  {
    _id: 'art-giselle-romantyzm',
    _type: 'artykul',
    tytul: 'Giselle — arcydzieło romantyzmu',
    slug: { _type: 'slug', current: 'giselle-arcydzielo-romantyzmu' },
    kategoria: 'Historia',
    zajawka: 'Dlaczego balet sprzed niemal dwóch wieków wciąż porusza i zachwyca? Giselle jako fundament romantycznego repertuaru.',
    autor: 'Katarzyna Lewandowska',
    dataPublikacji: '2026-03-10T10:00:00Z',
    featured: false,
    czasCzytania: 7,
    tagi: ['historia', 'romantyzm', 'giselle'],
    trescGlowna: [
      { _type: 'block', _key: 'g1', style: 'normal', children: [{ _type: 'span', _key: 'g1s', text: 'Giselle, wystawiona po raz pierwszy w 1841 roku w Paryżu, jest jednym z najstarszych baletów wciąż obecnych w repertuarze światowych teatrów. Jej siła tkwi w połączeniu prostej, ale poruszającej historii miłosnej z niezwykłą muzyką Adolphe\'a Adama.' }] },
      { _type: 'block', _key: 'g2', style: 'h2', children: [{ _type: 'span', _key: 'g2s', text: 'Dwa akty, dwa światy' }] },
      { _type: 'block', _key: 'g3', style: 'normal', children: [{ _type: 'span', _key: 'g3s', text: 'Pierwszy akt osadzony jest w realistycznym świecie wiejskim — pełnym radości, tańca i naiwnej miłości. Drugi akt przenosi nas do królestwa Wilis, duchów dziewcząt zmarłych przed ślubem, które tańczą w świetle księżyca.' }] },
      { _type: 'block', _key: 'g4', style: 'normal', children: [{ _type: 'span', _key: 'g4s', text: 'Ten kontrast między ziemskim realizmem a nadprzyrodzonym eterycznym pięknem drugiego aktu to esencja romantyzmu w balecie. Technika sur les pointes, która w tamtych czasach była nowością, służyła tu wyrażeniu nieziemskości Wilis.' }] },
    ],
  },
  {
    _id: 'art-polskie-szkoly',
    _type: 'artykul',
    tytul: 'Polskie szkoły baletowe — tradycja i przyszłość',
    slug: { _type: 'slug', current: 'polskie-szkoly-baletowe' },
    kategoria: 'Aktualności',
    zajawka: 'Przegląd najważniejszych szkół baletowych w Polsce — od Warszawy po Gdańsk. Jak kształci się nowe pokolenie tancerzy?',
    autor: 'Tomasz Wiśniewski',
    dataPublikacji: '2026-03-08T09:00:00Z',
    featured: false,
    czasCzytania: 6,
    tagi: ['edukacja', 'polska', 'szkoły baletowe'],
    trescGlowna: [
      { _type: 'block', _key: 'p1', style: 'normal', children: [{ _type: 'span', _key: 'p1s', text: 'Polska ma bogatą tradycję kształcenia baletowego sięgającą XIX wieku. Dziś funkcjonuje kilka renomowanych szkół, które przygotowują młodych tancerzy do karier na scenach krajowych i międzynarodowych.' }] },
      { _type: 'block', _key: 'p2', style: 'h2', children: [{ _type: 'span', _key: 'p2s', text: 'Ogólnokształcąca Szkoła Baletowa w Warszawie' }] },
      { _type: 'block', _key: 'p3', style: 'normal', children: [{ _type: 'span', _key: 'p3s', text: 'Najstarsza i najbardziej prestiżowa placówka tego typu w Polsce. Jej absolwenci tańczą na scenach od Teatru Wielkiego po Royal Ballet w Londynie. Program łączy intensywny trening klasyczny z pełnym wykształceniem ogólnym.' }] },
    ],
  },
  {
    _id: 'art-muzyka-baletu',
    _type: 'artykul',
    tytul: 'Muzyka w balecie — od Czajkowskiego do współczesności',
    slug: { _type: 'slug', current: 'muzyka-w-balecie' },
    kategoria: 'Technika',
    zajawka: 'Jak zmieniała się rola muzyki w balecie? Od wielkich partytur romantycznych po eksperymenty z muzyką elektroniczną.',
    autor: 'Anna Kowalczyk',
    dataPublikacji: '2026-03-06T14:00:00Z',
    featured: false,
    czasCzytania: 9,
    tagi: ['muzyka', 'kompozytorzy', 'historia'],
    trescGlowna: [
      { _type: 'block', _key: 'm1', style: 'normal', children: [{ _type: 'span', _key: 'm1s', text: 'Relacja między muzyką a tańcem w balecie przeszła fascynującą ewolucję. We wczesnych baletach muzyka pełniła głównie funkcję akompaniamentu — to choreografia dyktowała strukturę. Wszystko zmieniło się z pojawieniem się Piotra Czajkowskiego.' }] },
      { _type: 'block', _key: 'm2', style: 'h2', children: [{ _type: 'span', _key: 'm2s', text: 'Rewolucja Czajkowskiego' }] },
      { _type: 'block', _key: 'm3', style: 'normal', children: [{ _type: 'span', _key: 'm3s', text: 'Jezioro Łabędzie, Śpiąca Królewna i Dziadek do orzechów — ta trylogia zdefiniowała nowy standard muzyki baletowej. Czajkowski potraktował balet jako pełnoprawną formę muzyczną, tworząc partytury o symfonicznej głębi i emocjonalnym bogactwie.' }] },
    ],
  },
]

console.log('=== Seeding additional articles ===')
for (const art of articles) {
  await client.createOrReplace(art)
  console.log(`  ✓ ${art._id}: ${art.tytul}`)
}
console.log('=== Done! ===')
