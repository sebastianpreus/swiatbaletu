export const metadata = {
  title: 'O nas — Świat Baletu',
  description: 'Poznaj twórców portalu Świat Baletu — Izabelę Sokołowską-Boulton i Sebastiana Preusa.',
}

export default function ONasPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-3">O nas</h1>
      <p className="text-[14px] text-text-2 leading-[1.8] mb-10 max-w-[720px]">
        Świat Baletu to portal stworzony z miłości do tańca klasycznego i opery.
        Łączymy wiedzę artystyczną z nowoczesną technologią, by przybliżać polskiemu
        odbiorcy piękno baletu — od kulis teatrów po scenę.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Iza */}
        <div className="flex flex-col items-center text-center">
          <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-[0.5px] border-border mb-5">
            <img
              src="/iza-sokolowska.jpg"
              alt="Izabela Sokołowska-Boulton"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h2 className="font-serif text-[22px] text-text-1 mb-1">Izabela Sokołowska-Boulton</h2>
          <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-4 font-medium">
            Redaktor naczelna · Choreograf
          </div>
          <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px]">
            Tancerka, choreograf i pedagog z wieloletnim doświadczeniem na scenach
            polskich i międzynarodowych. Jedyna Polka uhonorowana złotym medalem
            Międzynarodowego Konkursu Baletowego w Warnie — najważniejszego konkursu
            baletowego na świecie. Solistka Królewskiego Teatru Duńskiego w Kopenhadze,
            a obecnie Kierownik Baletu Opery Bałtyckiej w Gdańsku.
          </p>
          <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px] mt-3">
            W portalu Świat Baletu odpowiada za treści merytoryczne, dobór tematów
            i kontakt ze środowiskiem baletowym. Jej doświadczenie sceniczne i pedagogiczne
            nadaje portalowi autentyczny głos z wnętrza świata tańca klasycznego.
          </p>
        </div>

        {/* Sebastian */}
        <div className="flex flex-col items-center text-center">
          <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-[0.5px] border-border mb-5">
            <img
              src="/sebastian-preus.jpg"
              alt="Sebastian Preus"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h2 className="font-serif text-[22px] text-text-1 mb-1">Sebastian Preus</h2>
          <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-4 font-medium">
            Dyrektor techniczny · Fotograf
          </div>
          <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px]">
            Pasjonat baletu i fotografii artystycznej, specjalizujący się w fotografii
            baletowej, portretowej oraz kobiecej. Jego prace uchwytują emocje i ruch
            tancerzy, łącząc wrażliwość artystyczną z techniczną precyzją. Współpracuje
            z teatrami operowymi i szkołami baletowymi w całej Polsce.
          </p>
          <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px] mt-3">
            W portalu Świat Baletu odpowiada za stronę techniczną — architekturę serwisu,
            rozwój funkcjonalności, integrację z systemami biletowymi teatrów oraz
            automatyzację repertuarów. Projektuje i buduje narzędzia, które sprawiają,
            że świat baletu staje się bliższy każdemu odbiorcy.
          </p>
        </div>
      </div>

      {/* Kontakt */}
      <div id="kontakt" className="border-t-[0.5px] border-border pt-8 scroll-mt-20">
        <h2 className="font-serif text-[24px] text-text-1 mb-4">Kontakt</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-2 font-medium">Redakcja</div>
            <p className="text-[13px] text-text-2 leading-[1.8]">
              Masz temat na artykuł, chcesz zaproponować wywiad lub podzielić się
              informacją ze świata baletu? Napisz do nas.
            </p>
            <a href="mailto:redakcja@swiatbaletu.pl" className="text-[13px] text-gold hover:text-gold-dim transition-colors mt-2 inline-block">
              redakcja@swiatbaletu.pl
            </a>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-2 font-medium">Współpraca i reklama</div>
            <p className="text-[13px] text-text-2 leading-[1.8]">
              Jesteś przedstawicielem teatru, szkoły baletowej lub marki związanej
              z tańcem? Chętnie porozmawiamy o współpracy.
            </p>
            <a href="mailto:kontakt@swiatbaletu.pl" className="text-[13px] text-gold hover:text-gold-dim transition-colors mt-2 inline-block">
              kontakt@swiatbaletu.pl
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
