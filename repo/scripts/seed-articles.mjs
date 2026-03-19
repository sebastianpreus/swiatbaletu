import { createClient } from 'next-sanity'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

let kc = 0
function rk() { return 'k' + Date.now().toString(36) + (kc++).toString(36) }
const sleep = ms => new Promise(r => setTimeout(r, ms))

function b(style, text) {
  const children = []
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  for (const p of parts) {
    if (p.startsWith('**') && p.endsWith('**')) children.push({ _type: 'span', _key: rk(), text: p.slice(2, -2), marks: ['strong'] })
    else if (p) children.push({ _type: 'span', _key: rk(), text: p, marks: [] })
  }
  return { _type: 'block', _key: rk(), style, children, markDefs: [] }
}
function img(assetId, alt) { return { _type: 'image', _key: rk(), asset: { _type: 'reference', _ref: assetId }, alt } }
function q(text) { return b('blockquote', text) }

async function uploadWiki(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`
  await sleep(4000)
  const r = await fetch(url, { headers: { 'User-Agent': 'SwiatBaletu/1.0' } })
  const d = await r.json()
  const page = Object.values(d.query.pages)[0]
  const imgUrl = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url
  if (!imgUrl) { console.log('  \u2717 Not found:', filename); return null }
  await sleep(3000)
  const ir = await fetch(imgUrl, { headers: { 'User-Agent': 'SwiatBaletu/1.0' } })
  if (!ir.ok) { console.log('  \u2717 Download failed:', ir.status); return null }
  const buf = Buffer.from(await ir.arrayBuffer())
  console.log('  \u2713', filename, (buf.length / 1024).toFixed(0), 'KB')
  return client.assets.upload('image', buf, { filename: filename.replace(/[^a-zA-Z0-9.-]/g, '_') })
}

async function main() {
  console.log('=== Uploading images ===\n')

  // Images for articles
  const nutcracker = await uploadWiki('Nutcracker -1890.JPG')
  const pointeShoe = await uploadWiki('Russian ballet pointe shoes, 1997, silk - Bata Shoe Museum - DSC00244.JPG')
  const teatrWielki = await uploadWiki('Marcin Zaleski - Plac Teatralny w Warszawie.jpg')
  const teatrWielkiModern = await uploadWiki('Grand Theatre in Warsaw, Poland2.JPG')

  console.log('\n=== Creating articles ===\n')

  // ─── ARTICLE 1: Sezon 2025/2026 ───
  console.log('\u25b8 Sezon 2025/2026...')
  const sezonBlocks = [
    b('normal', 'Sezon artystyczny 2025/2026 w polskich teatrach operowych i baletowych zapowiada si\u0119 jako jeden z najbardziej ekscytuj\u0105cych w ostatnich latach. Od futurystycznych wizji Roberta Bondary w Warszawie, przez neoklasyczne arcydzie\u0142a w \u0141odzi, po mi\u0119dzynarodowe festiwale w Poznaniu \u2014 polskie sceny oferuj\u0105 program, kt\u00f3ry zadowoli zar\u00f3wno mi\u0142o\u015bnik\u00f3w tradycji, jak i poszukiwaczy artystycznego novum.'),
    b('h2', 'Warszawa: Polski Balet Narodowy'),
    b('normal', 'Teatr Wielki \u2014 Opera Narodowa wchodzi w sezon z rozmachem. Nowy dyrektor Boris Kud\u0142i\u010dka zapowiedzia\u0142 288 wydarze\u0144, w tym trzy premiery baletowe. Sezon otworzy\u0142a w listopadzie \u201eSymfonia Ta\u0144ca\u201d \u2014 tr\u00f3jcz\u0119\u015bciowy wiecz\u00f3r \u0142\u0105cz\u0105cy Symphony in C Balanchine\u2019a z \u201eSsss...\u201d Edwarda Cluga i \u201eSi\u00f3dm\u0105 Symfoni\u0105\u201d van Schayka.'),
    b('normal', 'Prawdziwym wydarzeniem sezonu mo\u017ce okaza\u0107 si\u0119 majowa premiera \u201e\u0141owcy android\u00f3w\u201d. Robert Bondara si\u0119gn\u0105\u0142 po powie\u015b\u0107 Philipa K. Dicka, tworz\u0105c balet do oryginalnej muzyki Przemys\u0142awa Zycha. Sezon zamknie w czerwcu \u201eUrojenia\u201d Izadory Weiss z kostiumami duetu Paprocki & Brzozowski.'),
    b('h2', 'Krak\u00f3w i Wroc\u0142aw'),
    b('normal', 'Opera Krakowska postawi\u0142a na baletow\u0105 adaptacj\u0119 Requiem Mozarta oraz cenionego Kopciuszka Giorgia Madii. Opera Wroc\u0142awska pod kierunkiem Ma\u0142gorzaty Dzierzon prezentuje \u201eLumi\u00e8re\u201d \u2014 tr\u00f3jcz\u0119\u015bciowy wiecz\u00f3r z choreografiami Ji\u0159\u00edho Kyli\u00e1na, Rafaela Bonacheli i Meryl Tankard. Na zako\u0144czenie sezonu oba teatry przygotowuj\u0105 Sen nocy letniej.'),
    b('h2', '\u0141\u00f3d\u017a: Spotkania Baletowe'),
    b('normal', 'Teatr Wielki w \u0141odzi otwiera sezon Dziadkiem do orzech\u00f3w Youriego Vamosa, a \u201eSupernova\u201d Sharon Eyal to hipnotyczny wsp\u00f3\u0142czesny taniec. Per\u0142\u0105 sezonu b\u0119d\u0105 XXVIII \u0141\u00f3dzkie Spotkania Baletowe w kwietniu 2026 \u2014 z go\u015bcinnymi wyst\u0119pami English National Ballet, Companhia Nacional de Bailado i Gauthier Dance ze Stuttgartu.'),
    b('h2', 'Pozna\u0144, Gda\u0144sk i Bydgoszcz'),
    b('normal', 'Teatr Wielki w Poznaniu obchodzi 115-lecie istnienia z festiwalem Przedwio\u015bnie Baletowe. Opera Ba\u0142tycka prezentuje Fantazj\u0119 i Fortun\u0119 w choreografii Izabeli Soko\u0142owskiej-Boulton. Opera Nova w Bydgoszczy zaskakuje Carmen Johana Ingera \u2014 ognist\u0105, wsp\u00f3\u0142czesn\u0105 interpretacj\u0105.'),
    b('h2', 'Trendy sezonu'),
    b('normal', 'Polskie teatry coraz ch\u0119tniej si\u0119gaj\u0105 po wsp\u00f3\u0142czesnych choreograf\u00f3w o mi\u0119dzynarodowej renomie \u2014 Clug, Eyal, Kyli\u00e1n, Inger. Sen nocy letniej staje si\u0119 hitem sezonu \u2014 pojawia si\u0119 w repertuarze a\u017c trzech scen. Widoczne jest te\u017c rosn\u0105ce zainteresowanie tworzeniem oryginalnych balet\u00f3w \u2014 \u0141owca android\u00f3w Bondary czy Urojenia Weiss to dzie\u0142a powstaj\u0105ce od zera.'),
  ]
  if (teatrWielkiModern) sezonBlocks.splice(2, 0, img(teatrWielkiModern._id, 'Teatr Wielki \u2014 Opera Narodowa w Warszawie'))

  await client.createOrReplace({
    _id: 'art-sezon-2025-2026',
    _type: 'artykul',
    tytul: 'Sezon 2025/2026 \u2014 premiery baletowe w polskich teatrach',
    slug: { _type: 'slug', current: 'sezon-2025-2026-premiery' },
    kategoria: 'Aktualności',
    zajawka: 'Od futurystycznych wizji Bondary w Warszawie po mi\u0119dzynarodowe festiwale w \u0141odzi i Poznaniu. Przegl\u0105d najciekawszych premier baletowych sezonu 2025/2026 na siedmiu polskich scenach.',
    trescGlowna: sezonBlocks,
    autor: 'Redakcja \u015awiat Baletu',
    dataPublikacji: '2026-03-18T10:00:00Z',
    featured: true,
    czasCzytania: 10,
    tagi: ['sezon 2025/2026', 'premiery', 'balet', 'Polska', 'repertuar'],
  })
  console.log('  \u2713 Sezon 2025/2026')

  // ─── ARTICLE 2: 5 baletów ───
  console.log('\u25b8 5 balet\u00f3w...')
  const baletBlocks = [
    b('normal', 'Pami\u0119tam swoje pierwsze wej\u015bcie do opery. Czerwony aksamit foteli, zapach drewna sceny, cichy szmer orkiestry stroj\u0105cej instrumenty. A potem \u2014 cisza, podniesienie kurtyny i \u015bwiat, kt\u00f3ry zmieni\u0142 moje \u017cycie. Je\u015bli jeszcze nie byli\u015bcie na balecie, macie przed sob\u0105 jedno z najpi\u0119kniejszych do\u015bwiadcze\u0144 kulturalnych. Ten przewodnik pomo\u017ce Wam wybra\u0107 pierwszy spektakl.'),
    b('h2', '1. Jezioro \u0141ab\u0119dzie'),
    b('normal', 'Je\u015bli balet ma swoj\u0105 Mona Lis\u0119, to jest ni\u0105 Jezioro \u0141ab\u0119dzie. Ksi\u0105\u017c\u0119 Zygfryd zakochuje si\u0119 w \u0142ab\u0119dzicy Odetcie, kt\u00f3r\u0105 z\u0142a kl\u0105twa zamieni\u0142a z dziewczyny w ptaka. Czarnoksi\u0119\u017cnik Rotbart przyprowadza na bal sw\u0105 c\u00f3rk\u0119 Odile \u2014 identyczn\u0105, ale ubran\u0105 na czarno \u2014 i ksi\u0105\u017c\u0119, oszukany, przysi\u0119ga mi\u0142o\u015b\u0107 nie tej, kt\u00f3rej powinien.'),
    b('normal', 'S\u0142ynne 32 fouett\u00e9s \u2014 seria obrot\u00f3w na jednej nodze w trzecim akcie \u2014 to techniczny sprawdzian i moment, przy kt\u00f3rym publiczno\u015b\u0107 wstrzymuje oddech. Ciekawostka: premiera w 1877 roku by\u0142a klap\u0105. Dopiero po \u015bmierci Czajkowskiego Petipa i Iwanow stworzyli wersj\u0119, kt\u00f3r\u0105 znamy dzi\u015b.'),
    b('h2', '2. Dziadek do orzech\u00f3w'),
    b('normal', 'Wigilia, choinka, tajemniczy wujek Drosselmeyer i drewniany dziadek do orzech\u00f3w, kt\u00f3ry o\u017cywia si\u0119 w nocy. Ma\u0142a Klara trafia do krainy sn\u00f3w, walczy z Kr\u00f3lem Myszy i podr\u00f3\u017cuje przez Kr\u00f3lestwo S\u0142odyczy. To najpopularniejszy balet na \u015bwiecie i idealny na pierwsze wyj\u015bcie do teatru \u2014 tak\u017ce z dzie\u0107mi.'),
    b('normal', 'Czajkowski nie lubi\u0142 tego baletu i uwa\u017ca\u0142 go za gorszy od Jeziora \u0141ab\u0119dziego. Historia pokaza\u0142a, \u017ce si\u0119 myli\u0142 \u2014 Dziadek do orzech\u00f3w jest najcz\u0119\u015bciej wystawianym baletem na planecie.'),
    b('h2', '3. Giselle'),
    b('normal', 'M\u0142oda wiejska dziewczyna zakochuje si\u0119 w szlachcicu Albrechcie, nie wiedz\u0105c, \u017ce jest zar\u0119czony z inn\u0105. Kiedy prawda wychodzi na jaw, Giselle umiera z rozpaczy. W drugim akcie pojawia si\u0119 jako jedna z willis \u2014 duch\u00f3w dziewcz\u0105t, kt\u00f3re zmar\u0142y przed \u015blubem. To kamie\u0144 pr\u00f3bierczy dla ka\u017cdej baletnicy \u2014 wymaga nie tylko techniki, ale przede wszystkim aktorstwa.'),
    b('normal', 'Giselle mia\u0142a premier\u0119 w Pary\u017cu w 1841 roku i jest jedynym romantycznym baletem, kt\u00f3ry nieprzerwanie figuruje w repertuarze teatr\u00f3w na ca\u0142ym \u015bwiecie. Ma niemal 185 lat i wcale si\u0119 nie starzeje.'),
    b('h2', '4. Romeo i Julia'),
    b('normal', 'Szekspir na scenie baletowej \u2014 i to w wersji, kt\u00f3ra potrafi wyci\u015bn\u0105\u0107 \u0142zy. Prokofiew napisa\u0142 partytur\u0119 pe\u0142n\u0105 dramatyzmu, czu\u0142o\u015bci i niebezpiecze\u0144stwa. Scena balkonowa to chwila czystego pi\u0119kna, a pojedynek Tybalta z Merkucjem trzyma w napi\u0119ciu jak najlepszy thriller.'),
    b('normal', 'Ciekawostka: Prokofiew pierwotnie napisa\u0142 szcz\u0119\u015bliwe zako\u0144czenie \u2014 Romeo zd\u0105\u017ca na czas i Julia \u017cyje. Choreografowie zaprotestowali. Kompozytor wreszcie zmieni\u0142 fina\u0142, przyznaj\u0105c, \u017ce mieli racj\u0119.'),
    b('h2', '5. Don Kichot'),
    b('normal', 'Zapominajcie o smutnym rycerzu \u2014 baletowy Don Kichot to iskrz\u0105ca si\u0119 rado\u015bci\u0105 komedia, w kt\u00f3rej prawdziwymi bohaterami s\u0105 m\u0142odzi kochankowie Kitri i Bazyli. Hiszpa\u0144skie s\u0142o\u0144ce, wachlarze, toreros i tyle energii na scenie, \u017ce wychodzicie z teatru z uczuciem, jakby kto\u015b wla\u0142 Wam \u017cycia prosto w \u017cy\u0142y.'),
    b('normal', 'Grand pas de deux Kitri i Bazylego w trzecim akcie to festiwal wirtuozerii. Publiczno\u015b\u0107 nagradza oklaskami w trakcie ta\u0144ca \u2014 co w balecie jest rzadko\u015bci\u0105 i znakiem, \u017ce dzieje si\u0119 co\u015b wyj\u0105tkowego.'),
    b('h2', 'Praktyczne wskaz\u00f3wki'),
    b('normal', '**Kiedy klaska\u0107?** Po zako\u0144czeniu ka\u017cdej wariacji, po pas de deux i na ko\u0144cu akt\u00f3w. Je\u015bli nie jeste\u015bcie pewni \u2014 poczekajcie, a\u017c zaczn\u0105 inni. **Co za\u0142o\u017cy\u0107?** Elegancki str\u00f3j codzienny wystarczy. **Lornetka:** je\u015bli macie, zabierzcie \u2014 detale pracy st\u00f3p s\u0105 fascynuj\u0105ce.'),
  ]
  if (nutcracker) baletBlocks.splice(5, 0, img(nutcracker._id, 'Dziadek do orzech\u00f3w \u2014 oryginalny projekt z 1892 roku'))

  await client.createOrReplace({
    _id: 'art-5-baletow',
    _type: 'artykul',
    tytul: '5 balet\u00f3w, kt\u00f3re trzeba zobaczy\u0107 \u2014 przewodnik dla pocz\u0105tkuj\u0105cych',
    slug: { _type: 'slug', current: '5-baletow-ktore-trzeba-zobaczyc' },
    kategoria: 'Technika',
    zajawka: 'Jezioro \u0141ab\u0119dzie, Dziadek do orzech\u00f3w, Giselle, Romeo i Julia, Don Kichot \u2014 pi\u0119\u0107 arcydzie\u0142, od kt\u00f3rych warto zacz\u0105\u0107 przygod\u0119 z baletem. Praktyczny przewodnik z ciekawostkami.',
    trescGlowna: baletBlocks,
    autor: 'Redakcja \u015awiat Baletu',
    dataPublikacji: '2026-03-17T10:00:00Z',
    featured: true,
    czasCzytania: 12,
    tagi: ['balet', 'przewodnik', 'Jezioro \u0141ab\u0119dzie', 'Dziadek do orzech\u00f3w', 'Giselle', 'Romeo i Julia', 'Don Kichot'],
  })
  console.log('  \u2713 5 balet\u00f3w')

  // ─── ARTICLE 3: Pointy ───
  console.log('\u25b8 Pointy...')
  const pointyBlocks = [
    b('normal', 'Niewiele przedmiot\u00f3w w \u015bwiecie sztuki budzi tyle fascynacji i jednocze\u015bnie grozy co buty pointowe. Te pozornie delikatne, satynowe pantofelki s\u0105 narz\u0119dziem pracy, instrumentem wyrazu artystycznego i \u2014 nie ukrywajmy \u2014 przyrz\u0105dem tortur.'),
    b('h2', 'Marie Taglioni i narodziny marzenia'),
    b('normal', 'Zanim Marie Taglioni wesz\u0142a na scen\u0119 paryskiej Opery 12 marca 1832 roku w roli Sylfidy, tancerki okazjonalnie wspina\u0142y si\u0119 na czubki palc\u00f3w. To Taglioni uczyni\u0142a z ta\u0144czenia en pointe centralny element estetyki baletu romantycznego. Jej buty nie mia\u0142y jednak nic wsp\u00f3lnego z dzisiejszymi \u2014 by\u0142y to zwyk\u0142e satynowe pantofelki bez pude\u0142ka i wk\u0142adki. Utrzymywa\u0142a si\u0119 na palcach wy\u0142\u0105cznie si\u0142\u0105 w\u0142asnych st\u00f3p.'),
    b('normal', 'Taglioni by\u0142a tak \u015bwiadoma wagi swoich but\u00f3w, \u017ce podobno kaza\u0142a s\u0142u\u017cebnicy gotowa\u0107 je w garnku, aby satyn idealnie dopasowa\u0107 do kszta\u0142tu stopy.'),
    b('h2', 'W\u0142oskie innowacje i Anna Paw\u0142owa'),
    b('normal', 'Pierina Legnani ta\u0144czy\u0142a ju\u017c w butach z prymitywnym pude\u0142kiem z warstw klejonej tkaniny. Prze\u0142omow\u0105 postaci\u0105 okaza\u0142a si\u0119 Anna Paw\u0142owa \u2014 jako jedna z pierwszych zacz\u0119\u0142a wk\u0142ada\u0107 do but\u00f3w p\u0142askie kawa\u0142ki twardej sk\u00f3ry, tworz\u0105c prototyp wsp\u00f3\u0142czesnego shanka. Inne tancerki nazywa\u0142y j\u0105 \u201eoszustk\u0105\u201d. Historia przyzna\u0142a racj\u0119 Paw\u0142owej.'),
    b('h2', 'Anatomia wsp\u00f3\u0142czesnego pointa'),
    b('normal', 'Pude\u0142ko (box), shank, platforma, satynowa pow\u0142oka \u2014 ca\u0142y but wa\u017cy zaledwie oko\u0142o 120 gram\u00f3w. L\u017cejszy ni\u017c przeci\u0119tne jab\u0142ko. W ostatnich latach producenci zacz\u0119li oferowa\u0107 pointy w r\u00f3\u017cnych odcieniach sk\u00f3ry \u2014 co by\u0142o od dawna postulowane przez tancerki o ciemnej karnacji.'),
    b('h2', 'Cena pi\u0119kna'),
    b('normal', 'Krwawe p\u0119cherze, z\u0142amane paznokcie, halluksy, deformacje palc\u00f3w \u2014 to codzienno\u015b\u0107 tancerek. Ponad 90% zawodowych tancerek do\u015bwiadczy\u0142o powa\u017cnych uraz\u00f3w st\u00f3p. Przeci\u0119tna solistka zu\u017cywa 200-300 par point\u00f3w rocznie \u2014 jedna para wystarcza na 20-30 minut ta\u0144czenia. Bolszoj zam\u00f3wia oko\u0142o 8 000 par rocznie.'),
    b('normal', 'Wiele tancerek przed u\u017cyciem celowo niszczy buty: \u0142amie shank, t\u0142ucze pude\u0142ko w drzwiach, moczy w wodzie. Ten rytualny proces zajmuje od 20 minut do godziny i jest tak indywidualny jak odcisk palca.'),
    b('h2', 'Przysz\u0142o\u015b\u0107: druk 3D'),
    b('normal', 'Firmy eksperymentuj\u0105 z drukiem 3D pozwalaj\u0105cym stworzy\u0107 pude\u0142ko idealnie dopasowane do skanu stopy. Bada si\u0119 w\u0142\u00f3kna w\u0119glowe zamiast tradycyjnego shanka. Pojawi\u0142y si\u0119 te\u017c inteligentne wk\u0142adki z czujnikami nacisku. A jednak w Freed of London nadal pracuj\u0105 dok\u0142adnie tak jak sto lat temu: ig\u0142a, klej, m\u0142otek i para wyszkolonych r\u0105k.'),
  ]
  if (pointeShoe) pointyBlocks.splice(6, 0, img(pointeShoe._id, 'Rosyjskie buty pointowe z 1997 roku \u2014 Bata Shoe Museum'))

  // Update existing pointy article instead of creating new
  await client.patch('art-pointy').set({
    trescGlowna: pointyBlocks,
    czasCzytania: 10,
    tytul: 'Historia but\u00f3w pointowych \u2014 od Taglioni do wsp\u00f3\u0142czesno\u015bci',
    zajawka: 'Od satynowych pantofelk\u00f3w Marie Taglioni przez innowacje Anny Paw\u0142owej po druk 3D. Fascynuj\u0105ca historia przedmiotu, kt\u00f3ry zmieni\u0142 oblicze baletu \u2014 i st\u00f3p tancerek.',
  }).commit()
  console.log('  \u2713 Pointy (zaktualizowany)')

  // ─── ARTICLE 4: Balet w Polsce ───
  console.log('\u25b8 Balet w Polsce...')
  const polskaBlocks = [
    b('normal', 'Gdy my\u015blimy o wielkich tradycjach baletowych, na my\u015bl przychodz\u0105 Pary\u017c, Petersburg czy Londyn. Tymczasem Polska ma w\u0142asn\u0105, fascynuj\u0105c\u0105 histori\u0119 ta\u0144ca klasycznego, si\u0119gaj\u0105c\u0105 kr\u00f3lewskich dwor\u00f3w XVI wieku.'),
    b('h2', 'Kr\u00f3lewskie pocz\u0105tki'),
    b('normal', 'Pierwsze widowiska taneczne pojawi\u0142y si\u0119 na polskim dworze w XVI wieku, wraz z dworem kr\u00f3lowej Bony Sforzy. Za w\u0142a\u015bciwego prekursora uznaje si\u0119 kr\u00f3la W\u0142adys\u0142awa IV Waz\u0119, kt\u00f3ry w latach 30. XVII wieku sprowadzi\u0142 do Warszawy w\u0142oskich artyst\u00f3w. W 1785 roku powo\u0142ano Tancerzy Narodowych Jego Kr\u00f3lewskiej Mo\u015bci \u2014 pierwszy w pe\u0142ni polski zesp\u00f3\u0142 baletowy.'),
    b('h2', 'Narodziny Teatru Wielkiego'),
    b('normal', 'Gmach Teatru Wielkiego, zaprojektowany przez Antonio Corazziego, otwarto 24 lutego 1833 roku. Lata 1837\u20131860 to z\u0142oty wiek warszawskiego baletu romantycznego. Maurice Pion wystawi\u0142 Sylfid\u0119 w 1839 roku, a w\u015br\u00f3d gwiazd epoki b\u0142yszcza\u0142y Konstancja Turczynowiczowa i Helena Cholewicka.'),
    b('normal', 'Repertuar obejmowa\u0142 nie tylko zachodnie klasyki, ale i oryginalne dzie\u0142a polskie \u2014 balet Wesele w Ojcowie z muzyk\u0105 Kurpi\u0144skiego \u0142\u0105czy\u0142 klasyczn\u0105 technik\u0119 z polskim folklorem.'),
    b('h2', 'Zabory i emigracja talent\u00f3w'),
    b('normal', 'Utrata niepodleg\u0142o\u015bci bole\u015bnie odbi\u0142a si\u0119 na polskim balecie. Feliks Krzesi\u0144ski wyjechal do Petersburga, a jego c\u00f3rka Matylda sta\u0142a si\u0119 gwiazd\u0105 baletu rosyjskiego. Podobne losy spotka\u0142y rodzin\u0119 Ni\u017cy\u0144skich \u2014 ich dzieci Wac\u0142aw i Bronis\u0142awa wpisali si\u0119 z\u0142otymi zg\u0142oskami w histori\u0119 \u015bwiatowego baletu, ale pod szyldem rosyjskim. W Baletach Rosyjskich Dagi\u0142ewa pracowa\u0142o blisko 90 polskich tancerzy.'),
    b('h2', 'Powojenna odbudowa'),
    b('normal', 'Po wojnie balet warszawski zaczyna\u0142 od zera. Teatr Wielki zosta\u0142 zbombardowany w 1939 roku. Odbudowany gmach oddano do u\u017cytku dopiero w 1965 roku \u2014 powsta\u0142a jedna z najwi\u0119kszych scen operowych \u015bwiata, o powierzchni 1150 metr\u00f3w kwadratowych.'),
    b('h2', 'Szko\u0142y baletowe'),
    b('normal', 'Warszawska szko\u0142a im. Romana Turczynowicza, bytomska im. Ludomira R\u00f3\u017cyckiego, gda\u0144ska za\u0142o\u017cona w 1950 roku przez Janin\u0119 Jarzyn\u00f3wn\u0119-Sobczak, pozna\u0144ska im. Olgi S\u0142awskiej-Lipczy\u0144skiej i \u0142\u00f3dzka im. Feliksa Parnella \u2014 to fundament kszta\u0142cenia, kt\u00f3ry daje Polsce solidn\u0105 baz\u0119 kadrow\u0105.'),
    b('h2', 'Wsp\u00f3\u0142czesno\u015b\u0107: Polski Balet Narodowy'),
    b('normal', 'W 2009 roku zesp\u00f3\u0142 baletowy Teatru Wielkiego otrzyma\u0142 autonomi\u0119 jako Polski Balet Narodowy. Pod dyrekcj\u0105 Krzysztofa Pastora zesp\u00f3\u0142 licz\u0105cy blisko 90 tancerzy prezentuje repertuar \u0142\u0105cz\u0105cy wielkie klasyki z ambitnymi premierami. Polscy tancerze pracuj\u0105 dzi\u015b w czo\u0142owych zespo\u0142ach na \u015bwiecie \u2014 od American Ballet Theatre po Royal Ballet.'),
  ]
  if (teatrWielki) polskaBlocks.splice(4, 0, img(teatrWielki._id, 'Plac Teatralny w Warszawie \u2014 obraz Marcina Zaleskiego, XIX wiek'))

  await client.createOrReplace({
    _id: 'art-balet-w-polsce',
    _type: 'artykul',
    tytul: 'Balet w Polsce \u2014 od Teatru Wielkiego po wsp\u00f3\u0142czesno\u015b\u0107',
    slug: { _type: 'slug', current: 'balet-w-polsce-historia' },
    kategoria: 'Historia',
    zajawka: 'Od kr\u00f3lewskich widowisk na Zamku Kr\u00f3lewskim przez z\u0142oty wiek romantyzmu i wojenne zniszczenia a\u017c po wsp\u00f3\u0142czesny Polski Balet Narodowy. Fascynuj\u0105ca historia ta\u0144ca klasycznego w Polsce.',
    trescGlowna: polskaBlocks,
    autor: 'Redakcja \u015awiat Baletu',
    dataPublikacji: '2026-03-15T10:00:00Z',
    featured: true,
    czasCzytania: 11,
    tagi: ['balet', 'Polska', 'historia', 'Teatr Wielki', 'Polski Balet Narodowy'],
  })
  console.log('  \u2713 Balet w Polsce')

  console.log('\n\u2713 Gotowe! 4 artyku\u0142y za\u0142adowane.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
