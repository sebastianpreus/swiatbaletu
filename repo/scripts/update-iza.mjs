import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

let keyCounter = 0
function rk() { return 'k' + Date.now().toString(36) + (keyCounter++).toString(36) }

function block(style, text) {
  const children = []
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({ _type: 'span', _key: rk(), text: part.slice(2, -2), marks: ['strong'] })
    } else if (part) {
      children.push({ _type: 'span', _key: rk(), text: part, marks: [] })
    }
  }
  return { _type: 'block', _key: rk(), style, children, markDefs: [] }
}

function imgBlock(assetId, alt) {
  return { _type: 'image', _key: rk(), asset: { _type: 'reference', _ref: assetId }, alt }
}

function quote(text) {
  return { _type: 'block', _key: rk(), style: 'blockquote', children: [{ _type: 'span', _key: rk(), text, marks: [] }], markDefs: [] }
}

async function main() {
  // Get existing gallery assets from the sylwetka
  const existing = await client.fetch('*[_id == "sylwetka-sokolowska-boulton"][0] { galeria[] { asset } }')
  const galRefs = existing?.galeria?.map(g => g.asset._ref) || []
  console.log('Gallery assets:', galRefs.length)

  // Get the hero image asset
  const heroDoc = await client.fetch('*[_id == "sylwetka-sokolowska-boulton"][0] { zdjecie { asset } }')
  const heroRef = heroDoc?.zdjecie?.asset?._ref

  // Upload scene photo (gallery-01 is from Royal Danish Theatre)
  const sceneRef = galRefs[0] // gallery-01: Kr\u00f3lewski Teatr Du\u0144ski
  const varnaRef = galRefs[1] // gallery-02: Konkurs w Warnie
  const donkiRef = galRefs[2] // gallery-03: Don Kichot
  const portraitRef = galRefs[3] // gallery-04: portret
  const probaRef = galRefs[4] // gallery-05: pr\u00f3ba
  const sylphRef = galRefs[5] // gallery-06: La Sylphide

  // =============================================
  // UPDATED ARTICLE - much longer, engaging
  // =============================================
  const articleBlocks = [
    block('normal', 'Gda\u0144sk, Wybrze\u017ce, szara codzienno\u015b\u0107 lat dziewi\u0119\u0107dziesi\u0105tych \u2014 nieoczywiste t\u0142o dla przysz\u0142ej gwiazdy \u015bwiatowego baletu. A jednak w\u0142a\u015bnie st\u0105d, z miasta portowego nad Ba\u0142tykiem, wysz\u0142a jedna z najwybitniejszych polskich baletnic swojego pokolenia. Izabela Soko\u0142owska-Boulton \u2014 jedyna Polka ze z\u0142otym medalem Mi\u0119dzynarodowego Konkursu Baletowego w Warnie, solistka Kr\u00f3lewskiego Teatru Du\u0144skiego w Kopenhadze, a dzi\u015b Kierownik Baletu Opery Ba\u0142tyckiej w rodzinnym mie\u015bcie. Jej historia to nie jest zwyk\u0142a opowie\u015b\u0107 o karierze \u2014 to historia cz\u0142owieka, kt\u00f3ry postanowi\u0142 \u017cy\u0107.'),

    block('h2', 'Przypadek, kt\u00f3ry zmieni\u0142 wszystko'),
    block('normal', 'Wszystko zacz\u0119\u0142o si\u0119 od przypadku. Izabela mia\u0142a osiem lat, gdy do jej klasy w gda\u0144skiej podstaw\u00f3wce przysz\u0142a kobieta ze szko\u0142y baletowej, szukaj\u0105c dzieci z predyspozycjami. Ma\u0142a Iza dosta\u0142a si\u0119 na egzaminy \u2014 i ju\u017c nigdy nie wr\u00f3ci\u0142a do zwyk\u0142ego dzieci\u0144stwa. Od 1994 roku by\u0142a uczennic\u0105 Og\u00f3lnokszta\u0142c\u0105cej Szko\u0142y Baletowej w Gda\u0144sku. Codzienne treningi, rygor, musztra, nauczyciele kt\u00f3rzy nie znali s\u0142owa \u201ewystarczaj\u0105co\u201d. Dla jednych to brzmi jak trauma \u2014 dla Izabeli by\u0142 to w\u0142a\u015bnie ten rodzaj presji, kt\u00f3ry zamienia\u0142a w nap\u0119d.'),
    block('normal', 'Ju\u017c w czasie nauki zacz\u0119\u0142a zdobywa\u0107 nagrody na krajowych konkursach baletowych. W 1999 i 2001 roku wyr\u00f3\u017cnienia na Og\u00f3lnopolskim Konkursie Baletowym w Gda\u0144sku. W 2002 roku pierwsze miejsce na I Og\u00f3lnopolskim Konkursie na Najlepszego Absolwenta Szk\u00f3\u0142 Baletowych w Szczecinie. Rok p\u00f3\u017aniej zwyci\u0119stwo w XIII Og\u00f3lnopolskim Konkursie Ta\u0144ca im. Wojciecha Wiesi\u00f3\u0142\u0142owskiego. Ka\u017cdy kolejny medal potwierdza\u0142 to, co pedagodzy widzieli od lat \u2014 Izabela by\u0142a wyj\u0105tkowa.'),

    block('h2', 'Warna \u2014 olimpiada baletu'),
    block('normal', 'Prawdziwy prze\u0142om nast\u0105pi\u0142 latem 2002 roku w Bu\u0142garii. Mi\u0119dzynarodowy Konkurs Baletowy w Warnie \u2014 zwany olimpiad\u0105 baletu \u2014 to najbardziej presti\u017cowe zawody baletowe na \u015bwiecie. Odbywaj\u0105 si\u0119 co dwa lata, gromadz\u0105c najzdolniejszych tancerzy z kilkudziesi\u0119ciu kraj\u00f3w. Trzy tygodnie pr\u00f3b, dziesi\u0105tki konkurent\u00f3w, mi\u0119dzynarodowe jury. Kiedy Izabela zobaczy\u0142a swoje nazwisko na samej g\u00f3rze tablicy wynik\u00f3w \u2014 wiedzia\u0142a, \u017ce co\u015b w\u0142a\u015bnie si\u0119 zmieni\u0142o bezpowrotnie. Z\u0142oty medal. Do dzi\u015b pozostaje jedyn\u0105 Polk\u0105, kt\u00f3ra zdoby\u0142a to wyr\u00f3\u017cnienie.'),

    imgBlock(varnaRef, 'Izabela Soko\u0142owska-Boulton \u2014 Konkurs Baletowy w Warnie, 2002'),

    block('h2', 'Kopenhaga \u2014 siedemna\u015bcie lat i bilet w jedn\u0105 stron\u0119'),
    block('normal', 'Z medalem w kieszeni i misiem pod pach\u0105 Izabela wsiad\u0142a sama na prom w Gda\u0144sku. Mia\u0142a siedemna\u015bcie lat. Bez konsultacji z rodzicami, bez planu B. Prosto z promu trafi\u0142a do Kr\u00f3lewskiego Teatru Du\u0144skiego w Kopenhadze \u2014 jednej z najstarszych i najbardziej presti\u017cowych scen baletowych na \u015bwiecie, z tradycj\u0105 si\u0119gaj\u0105c\u0105 XVIII wieku i dziedzictwem Augusta Bournonville\u2019a. Podpisa\u0142a kontrakt na miejscu.'),
    quote('\u201eMia\u0142am siedemna\u015bcie lat, bilet w jedn\u0105 stron\u0119 i misia pod pach\u0105. Nie zna\u0142am nikogo. Wiedzia\u0142am tylko, \u017ce chc\u0119 ta\u0144czy\u0107.\u201d'),
    block('normal', 'W 2002 roku do\u0142\u0105czy\u0142a do corps de ballet. Trzy lata p\u00f3\u017aniej, w 2005 roku, awansowa\u0142a na solistk\u0119 \u2014 pozycja zarezerwowana dla najlepszych. Ta\u0144czy\u0142a g\u0142\u00f3wne partie w repertuarze klasycznym Bournonville\u2019a: tytu\u0142ow\u0105 Sylfid\u0119 w La Sylphide, Irm\u0119 w Abdallah, Senorit\u0119 w La Ventana, role w Napoli, Le Conservatoire, A Folk Tale i Kermesse in Bruges. R\u00f3wnocze\u015bnie podbija\u0142a repertuar wsp\u00f3\u0142czesny \u2014 pracowa\u0142a z Williamem Forsythe\u2019em (In the Middle, Somewhat Elevated), Ji\u0159\u00edm Kyli\u00e1nem, Sidi Larbi Cherkaoui, Johnem Neumeierem i Alexeiem Ratmanskym.'),
    block('normal', 'W\u015br\u00f3d jej najwa\u017cniejszych kreacji w Kopenhadze by\u0142y: Caroline Mathilde w dramatycznym Livl\u00e6gen bes\u00f8g (Wizyta lekarza), Nausikaa w Odyssey, Clara w Dziadku do orzech\u00f3w, a tak\u017ce role w Serenadzie Balanchine\u2019a, Etiudach i Ma\u0142ej Syrence. Krytycy chwalili jej po\u0142\u0105czenie technicznej precyzji z g\u0142\u0119bok\u0105 emocjonalno\u015bci\u0105.'),

    imgBlock(sceneRef, 'Izabela Soko\u0142owska-Boulton \u2014 Kr\u00f3lewski Teatr Du\u0144ski, Kopenhaga'),

    block('h2', 'Pr\u00f3ba \u2014 gdy \u015bwiat si\u0119 zatrzyma\u0142'),
    block('normal', 'Na szczycie kariery \u015bwiat si\u0119 zatrzyma\u0142. Najpierw kontuzja, potem ci\u0105\u017ca i narodziny synka Fivosa. A potem diagnoza, kt\u00f3ra przekre\u015bli\u0142a naraz i przesz\u0142o\u015b\u0107, i przysz\u0142o\u015b\u0107. Giant Cell Tumor \u2014 niezwykle rzadki, agresywny nowotw\u00f3r kr\u0119gos\u0142upa w kr\u0119gu L3. Lekarze dawali jej dwa miesi\u0105ce \u017cycia.'),
    block('normal', 'Pierwsza operacja \u2014 stabilizacja kr\u0119gos\u0142upa z wszczepem \u201ekoszyka\u201d zast\u0119puj\u0105cego zniszczony kr\u0105g \u2014 nie przynios\u0142a poprawy. Przerzuty do p\u0142uc. B\u00f3l, kt\u00f3rego nie \u0142agodzi\u0142a nawet morfina. Druga operacja i znowu komplikacje. Chemioterapia i radioterapia bez efektu. Medycyna zachodnia nie mia\u0142a dla niej odpowiedzi. W tym samym czasie m\u0105\u017c odszed\u0142 \u2014 i zabra\u0142 ze sob\u0105 kilkumiesi\u0119cznego Fivosa do Grecji.'),
    quote('\u201eLekarze powiedzieli, \u017ce mam dwa miesi\u0105ce. Ale ja mia\u0142am syna, do kt\u00f3rego musia\u0142am wr\u00f3ci\u0107. To nie by\u0142a opcja \u2014 to by\u0142 jedyny mo\u017cliwy scenariusz.\u201d'),
    block('normal', 'Ratunek przyszed\u0142 przez internet, od obcej kobiety \u2014 Leny, Dunki polskiego pochodzenia. Przyjaciele z Kopenhagi spontanicznie zorganizowali zbi\u00f3rk\u0119 \u201eTalent do ocalenia. Ratujmy Iz\u0119\u201d. 55 tysi\u0119cy dolar\u00f3w na leczenie w Chinach. W klinice w Tianjinie zastosowano eksperymentaln\u0105 terapi\u0119 genow\u0105. Miesi\u0105ce walki, niepewno\u015bci, samotno\u015bci z dala od syna. Stopniowo guzy zacz\u0119\u0142y si\u0119 zmniejsza\u0107. Obumar\u0142y. Wci\u0105\u017c s\u0105 w jej ciele \u2014 ale nie rosn\u0105, nie atakuj\u0105, nie dyktuj\u0105 warunk\u00f3w. Wygra\u0142a.'),

    block('h2', 'Powr\u00f3t \u2014 inaczej, ale wci\u0105\u017c w balecie'),
    block('normal', 'Prawa noga nigdy nie odzyska\u0142a pe\u0142nej sprawno\u015bci. Ka\u017cdy dzie\u0144 to praca z b\u00f3lem. Powr\u00f3t na wielk\u0105 scen\u0119 jako tancerka okaza\u0142 si\u0119 niemo\u017cliwy. Ale Izabela nie wr\u00f3ci\u0142a po to, \u017ceby ta\u0144czy\u0107 \u2014 wr\u00f3ci\u0142a po to, \u017ceby trwa\u0107 w balecie inaczej. Odzyska\u0142a opiek\u0119 nad Fivosem po d\u0142ugiej walce s\u0105dowej. Wysz\u0142a za m\u0105\u017c za Marcusa Boultona. Urodzi\u0142a c\u00f3rk\u0119 Maj\u0119. Uko\u0144czy\u0142a pedagogik\u0119 baletu na Uniwersytecie Muzycznym Fryderyka Chopina w Warszawie.'),
    block('normal', 'W 2011 roku do\u0142\u0105czy\u0142a do Sopockiego Teatru Ta\u0144ca, wsp\u00f3\u0142tworz\u0105c choreografi\u0119 do DALI i wyst\u0119puj\u0105c w FAST ACT. W latach 2012\u20132016 pracowa\u0142a jako pedagog tanca w Szkole Baletowej w Gda\u0144sku \u2014 tej samej, w kt\u00f3rej sama si\u0119 uczy\u0142a. We wrze\u015bniu 2016 roku obj\u0119\u0142a stanowisko baletmistrzyni i zast\u0119pczyni kierownika baletu w Operze Ba\u0142tyckiej w Gda\u0144sku.'),

    imgBlock(donkiRef, 'Opera Ba\u0142tycka \u2014 Don Kichot w choreografii Soko\u0142owskiej-Boulton, 2023'),

    block('h2', 'Choreografka wielkiej sceny'),
    block('normal', 'W Operze Ba\u0142tyckiej Izabela odkry\u0142a now\u0105 artystyczn\u0105 to\u017csamo\u015b\u0107 \u2014 jako choreografka. Wsp\u00f3lnie z Wojciechem Warszawskim stworzy\u0142a serie pe\u0142nospektaklowych inscenizacji, kt\u00f3re przyci\u0105gn\u0119\u0142y publiczno\u015b\u0107 i uznanie krytyk\u00f3w. W 2018 roku premiera Giselle z jej choreografi\u0105 drugiego aktu. W 2021 roku Kopciuszek do muzyki Prokofiewa, z kostiumami Hanny W\u00f3jcikowskiej-Szymczak i scenografi\u0105 Damiana Styrny. W 2022 roku Don Kichot \u2014 oparty na tradycji Petipy i Gorskiego, ale z w\u0142asn\u0105 wizj\u0105 artystyczn\u0105.'),
    block('normal', 'Najnowszym dzie\u0142em jest Fantazja i Fortuna \u2014 widowiskowy podw\u00f3jny wiecz\u00f3r baletowy z premier\u0105 16 maja 2025 roku. Pierwsza cz\u0119\u015b\u0107, Fantazja, to jej samodzielna choreografia do Symphonie fantastique Berlioza. Druga, Fortuna, to wsp\u00f3lne dzie\u0142o z Warszawskim do Carmina Burana Orffa. Spektakl uzyska\u0142 entuzjastyczne recenzje i sta\u0142 si\u0119 jednym z najwa\u017cniejszych wydarze\u0144 sezonu w Operze Ba\u0142tyckiej.'),

    imgBlock(probaRef, 'Izabela Soko\u0142owska-Boulton podczas pr\u00f3by w Operze Ba\u0142tyckiej'),

    block('h2', 'Nagrody i wyr\u00f3\u017cnienia'),
    block('normal', 'Z\u0142oty medal Mi\u0119dzynarodowego Konkursu Baletowego w Warnie (2002). Gryf Pomorski \u2014 nagroda Marsza\u0142ka Wojew\u00f3dztwa Pomorskiego w kategorii debiut (2003). Odznaka honorowa \u201eZas\u0142u\u017cony dla Kultury Polskiej\u201d Ministerstwa Kultury i Dziedzictwa Narodowego (2009). Stypendystka Ministra Kultury. Nagroda Prezydenta Miasta Gda\u0144ska (2020). Wielokrotne wyr\u00f3\u017cnienia na og\u00f3lnopolskich konkursach baletowych.'),

    block('h2', 'Survivor'),
    block('normal', 'Dzi\u015b Izabela Soko\u0142owska-Boulton wstaje ka\u017cdego ranka z b\u00f3lem, kt\u00f3ry towarzyszy jej od lat. Nie znika, nie odpuszcza \u2014 ale te\u017c ju\u017c dawno przesta\u0142 decydowa\u0107 o tym, jak wygl\u0105da jej dzie\u0144. Nowe projekty, nowe choreografie, nowi tancerze kt\u00f3rym przekazuje to, co sama zdobywa\u0142a przez lata na scenach Kopenhagi i Gda\u0144ska. Ka\u017cda sala pr\u00f3b to dla niej przestrze\u0144, w kt\u00f3rej czas dzia\u0142a inaczej \u2014 wolniej, dok\u0142adniej, z wi\u0119kszym sensem.'),
    quote('\u201eTaniec to nie tylko scena. To spos\u00f3b, w jaki walcz\u0119 i w jaki \u017cyj\u0119.\u201d'),
    block('normal', 'Na swoim Instagramie opisuje siebie jednym s\u0142owem: Survivor. I trudno o lepsze podsumowanie niezwyk\u0142ej drogi kobiety, kt\u00f3ra z gda\u0144skiej podstaw\u00f3wki trafi\u0142a na szczyty \u015bwiatowego baletu, stan\u0119\u0142a w obliczu \u015bmierci, straci\u0142a wszystko \u2014 i odbudowa\u0142a si\u0119 od nowa. Kurtyna nigdy do ko\u0144ca nie opada. To chyba najpi\u0119kniejsza rzecz w balecie.'),
  ]

  // Update article
  await client.patch('art-sokolowska-boulton').set({
    trescGlowna: articleBlocks,
    czasCzytania: 12,
    zajawka: 'Od gda\u0144skiej szko\u0142y baletowej przez z\u0142oty medal w Warnie i scen\u0119 Kr\u00f3lewskiego Teatru Du\u0144skiego, przez walk\u0119 ze \u015bmierteln\u0105 chorob\u0105 i utrat\u0119 dziecka, a\u017c po powr\u00f3t jako Kierownik Baletu Opery Ba\u0142tyckiej. Historia jedynej Polki ze z\u0142otem najwa\u017cniejszego konkursu baletowego \u015bwiata \u2014 i kobiety, kt\u00f3ra nie podda\u0142a si\u0119 wyrokowi.',
  }).commit()
  console.log('\u2713 Artyku\u0142 zaktualizowany')

  // Update sylwetka bio too
  const bioBlocks = [
    block('h2', 'Izabela Soko\u0142owska-Boulton \u2014 od z\u0142ota Warny do gda\u0144skiej sceny'),
    block('h3', 'Narodziny talentu'),
    block('normal', 'Izabela Soko\u0142owska-Boulton urodzi\u0142a si\u0119 w 1984 roku w Gda\u0144sku. Mia\u0142a osiem lat, gdy do jej klasy przysz\u0142a kobieta ze szko\u0142y baletowej szukaj\u0105c dzieci z predyspozycjami. Od 1994 roku by\u0142a uczennic\u0105 Og\u00f3lnokszta\u0142c\u0105cej Szko\u0142y Baletowej w Gda\u0144sku. Ju\u017c w czasie nauki zdobywa\u0142a nagrody na krajowych konkursach, a w 2002 roku si\u0119gn\u0119\u0142a po z\u0142oty medal na Mi\u0119dzynarodowym Konkursie Baletowym w Warnie \u2014 zwanym olimpiad\u0105 baletu. Do dzi\u015b pozostaje jedyn\u0105 Polk\u0105 z tym wyr\u00f3\u017cnieniem.'),
    imgBlock(varnaRef, 'Konkurs Baletowy w Warnie, 2002'),
    block('h3', 'Kopenhaga \u2014 solistka Kr\u00f3lewskiego Teatru Du\u0144skiego'),
    block('normal', 'Maj\u0105c siedemna\u015bcie lat wsiad\u0142a sama na prom do Danii. W Kr\u00f3lewskim Teatrze Du\u0144skim awansowa\u0142a na solistk\u0119 w 2005 roku. Ta\u0144czy\u0142a tytu\u0142ow\u0105 Sylfid\u0119 w La Sylphide, Caroline Mathilde, Nausika\u0119, Klar\u0119, a tak\u017ce role w Napoli, Le Conservatoire i A Folk Tale. Pracowa\u0142a z Forsythe\u2019em, Kyli\u00e1nem, Cherkaoui, Neumeierem i Ratmanskym.'),
    imgBlock(sceneRef, 'Kr\u00f3lewski Teatr Du\u0144ski, Kopenhaga'),
    block('h3', 'Powr\u00f3t do Gda\u0144ska'),
    block('normal', 'Po latach za granic\u0105 wr\u00f3ci\u0142a do rodzinnego miasta. Uko\u0144czy\u0142a pedagogik\u0119 baletu na UMFC w Warszawie. Od 2016 roku jest Kierownikiem Baletu i Choreografem Opery Ba\u0142tyckiej, gdzie stworzy\u0142a inscenizacje Giselle, Kopciuszka, Don Kichota i Fantazji i Fortuny. Na Instagramie opisuje siebie jednym s\u0142owem: Survivor.'),
    imgBlock(donkiRef, 'Don Kichot \u2014 Opera Ba\u0142tycka, 2023'),
    block('h3', 'Nagrody'),
    block('normal', 'Z\u0142oty medal w Warnie (2002), Gryf Pomorski (2003), odznaka \u201eZas\u0142u\u017cony dla Kultury Polskiej\u201d (2009), stypendium Ministra Kultury, nagroda Prezydenta Gda\u0144ska (2020).'),
  ]

  await client.patch('sylwetka-sokolowska-boulton').set({
    bio: bioBlocks,
    najwazniejszeRole: [
      'Sylfida (La Sylphide)',
      'Clara (Dziadek do orzech\u00f3w)',
      'Caroline Mathilde (Livl\u00e6gen bes\u00f8g)',
      'Nausikaa (Odyssey)',
      'Kitri (Don Kichot)',
      'Irma (Abdallah)',
      'In the Middle, Somewhat Elevated (Forsythe)',
    ],
  }).commit()
  console.log('\u2713 Sylwetka zaktualizowana')
  console.log('\nGotowe!')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
