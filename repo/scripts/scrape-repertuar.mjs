/**
 * Scraper repertuarów polskich teatrów operowych i baletowych.
 *
 * Pobiera aktualne repertuary ze stron 7 teatrów i zapisuje do Supabase.
 *
 * Użycie:
 *   node scripts/scrape-repertuar.mjs              # wszystkie teatry
 *   node scripts/scrape-repertuar.mjs --teatr warszawa  # tylko jeden teatr
 *   node scripts/scrape-repertuar.mjs --dry-run     # podgląd bez zapisu
 *
 * Wymaga: cheerio, puppeteer (dla Krakowa)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN = process.argv.includes('--dry-run')
const TEATR_FILTER = (() => {
  const idx = process.argv.indexOf('--teatr')
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null
})()

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pl-PL,pl;q=0.9',
    },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return await res.text()
}

const MONTHS = {
  'stycznia': 1, 'lutego': 2, 'marca': 3, 'kwietnia': 4,
  'maja': 5, 'czerwca': 6, 'lipca': 7, 'sierpnia': 8,
  'września': 9, 'października': 10, 'listopada': 11, 'grudnia': 12,
}

function categorize(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('balet')) return 'balet'
  if (t.includes('opera') && !t.includes('operetk')) return 'opera'
  if (t.includes('operetk')) return 'operetka'
  if (t.includes('koncert') || t.includes('recital')) return 'koncert'
  if (t.includes('edukac') || t.includes('dzieci') || t.includes('warsztat')) return 'edukacja'
  if (t.includes('musical')) return 'musical'
  return 'inne'
}

// ── 1. TEATR WIELKI WARSZAWA ─────────────────────────────────────────────────
// Endpoint: /kalendarium/data/YYYY/MM/ — returns HTML with .event elements
async function scrapeWarszawa() {
  const events = []
  const seen = new Set() // deduplicate
  const now = new Date()

  for (let offset = 0; offset < 5; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')

    try {
      const html = await fetchHTML(`https://teatrwielki.pl/kalendarium/data/${year}/${month}/`)
      const $ = cheerio.load(html)

      $('li.data-event').each((_, el) => {
        const $el = $(el)
        const $a = $el.find('.event-in h3 a').first()
        const title = $a.text().trim()
        if (!title) return

        const href = $a.attr('href') || ''
        const category = $el.find('.category').first().text().trim()
        const hall = $el.find('.hall').first().text().trim()
        const composer = $el.find('.event-in h4').first().text().trim()

        const dateMatch = href.match(/termin\/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})/)
        if (!dateMatch) return

        // Deduplicate by href (same event appears in nested li)
        if (seen.has(href)) return
        seen.add(href)

        const dateTime = new Date(
          parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]),
          parseInt(dateMatch[4]), parseInt(dateMatch[5])
        ).toISOString()

        // Ticket link: a.btn.yellow with href to butik.teatrwielki.pl
        // IMPORTANT: use > direct child selector to avoid picking up buttons from nested events
        const $price = $el.find('> .price')
        const ticketLink = $price.find('a.yellow').first().attr('href') || ''
        const detailLink = $price.find('a.btn').not('.yellow').first().attr('href') || ''

        events.push({
          tytul: title,
          kompozytor: composer,
          kategoria: categorize(category),
          data_czas: dateTime,
          link_bilety: ticketLink,
          dostepnosc: null, // kalendarium doesn't have availability info
          sala: hall,
          zrodlo_url: (detailLink || href).startsWith('http') ? (detailLink || href) : `https://teatrwielki.pl${detailLink || href}`,
        })
      })
    } catch (err) {
      console.error(`  [Warszawa] Błąd miesiąca ${month}: ${err.message}`)
    }
  }

  return events
}

// ── 2. OPERA BAŁTYCKA GDAŃSK ────────────────────────────────────────────────
// /repertuar + /repertuar/filterAjax?year-month=YYYY-MM for subsequent months
// Clean CSS selectors: .repertoire-list-item__* with incremented IDs
function parseGdanskHTML(html) {
  const $ = cheerio.load(html)
  const events = []

  const totalItems = $('[id^="desc-repertoire-title-"]').length

  for (let i = 0; i < totalItems; i++) {
    const title = $(`#desc-repertoire-title-${i}`).text().trim()
    const day = $(`#desc-repertoire-date-d-${i}`).text().trim()
    const monthYear = $(`#desc-repertoire-date-my-${i}`).text().trim()
    const time = $(`#desc-repertoire-date-hi-${i}`).text().trim()

    if (!title || !day) continue

    let month = null, year = 2026
    for (const [name, num] of Object.entries(MONTHS)) {
      if (monthYear.toLowerCase().includes(name)) { month = num; break }
    }
    const yearMatch = monthYear.match(/(\d{4})/)
    if (yearMatch) year = parseInt(yearMatch[1])
    if (!month) continue

    const dateTime = new Date(year, month - 1, parseInt(day),
      ...((time.match(/(\d+):(\d+)/) || [, 19, 0]).slice(1).map(Number))
    ).toISOString()

    const $item = $(`#desc-repertoire-title-${i}`).closest('.repertoire-list-item__content')
    const label = $item.find('.repertoire-list-item__label').text().trim()
    const author = $item.find('.repertoire-list-item__author').text().trim()

    // Use aria-describedby to find matching buttons for this event
    const descId = `desc-repertoire-title-${i}`
    const $ticketBtn = $(`a.btn--yellow[aria-describedby*="${descId}"]`)
    const ticketLink = $ticketBtn.attr('href') || ''

    // "czytaj więcej" link = event detail page
    const $detailBtn = $(`a.btn--green[aria-describedby*="${descId}"]`)
    const detailLink = $detailBtn.attr('href') || ''

    // Check availability: disabled button = sold out, "ostatnie bilety" = last tickets
    const $soldOutBtn = $item.closest('.repertoire-list-item').find('button[disabled]')
    const $lastTickets = $item.closest('.repertoire-list-item').find('.repertoire-list-item__tickets-title')
    let dostepnosc = 'dostepne'
    if ($soldOutBtn.length && $soldOutBtn.text().includes('wyprzedane')) {
      dostepnosc = 'wyprzedane'
    } else if ($lastTickets.length && $lastTickets.text().includes('ostatnie')) {
      dostepnosc = 'malo_miejsc'
    }

    events.push({
      tytul: title,
      kompozytor: author || '',
      kategoria: categorize(label),
      data_czas: dateTime,
      link_bilety: ticketLink,
      dostepnosc,
      zrodlo_url: detailLink ? `https://operabaltycka.pl${detailLink}` : 'https://operabaltycka.pl/repertuar',
    })
  }

  return events
}

async function scrapeGdansk() {
  // URL parameter ?yearMonth=YYYY-MM returns server-rendered HTML for that month
  const allEvents = []
  const seen = new Set()
  const now = new Date()

  for (let offset = 0; offset < 5; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    try {
      const html = await fetchHTML(`https://operabaltycka.pl/repertuar?yearMonth=${ym}`)
      const events = parseGdanskHTML(html)

      let newCount = 0
      for (const ev of events) {
        const key = `${ev.data_czas}-${ev.tytul}`
        if (!seen.has(key)) {
          seen.add(key)
          allEvents.push(ev)
          newCount++
        }
      }
      console.log(`  [Gdańsk] ${ym}: ${events.length} pozycji, +${newCount} nowych`)
    } catch (err) {
      console.error(`  [Gdańsk] Błąd ${ym}: ${err.message}`)
    }
  }

  return allEvents
}

/* OLD PUPPETEER CODE REMOVED - using ?yearMonth= instead */
/* eslint-disable */ if (false) { (async()=>{ let browser; try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36')

    console.log('  [Gdańsk] Uruchamiam przeglądarkę...')
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto('https://operabaltycka.pl/repertuar', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })
    await new Promise(r => setTimeout(r, 3000))

    // Accept Cookiebot (required for JS to work properly)
    try {
      const frames = page.frames()
      for (const frame of frames) {
        if (frame.url().includes('cookiebot')) {
          const allowBtn = await frame.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll')
          if (allowBtn) {
            await allowBtn.click()
            console.log('  [Gdańsk] Cookiebot zaakceptowany')
            await new Promise(r => setTimeout(r, 2000))
          }
        }
      }
    } catch { /* no cookiebot */ }

    const parsedEvents = []
    const seen = new Set()

    // Extract events from current page state
    async function extractCurrentEvents() {
      return await page.evaluate(() => {
        const events = []
        // Get ALL repertoire items — including hidden ones from other months
        // The page uses .repertoire-list-item__wrapper elements
        const wrappers = document.querySelectorAll('.repertoire-list-item__wrapper, .repertoire-list-item')
        console.log('Total wrappers found:', wrappers.length)

        wrappers.forEach(wrapper => {
          const titleEl = wrapper.querySelector('.repertoire-list-item__title, h2[class*="title"]')
          const dayEl = wrapper.querySelector('[class*="repertoire-list-item__day"] time, [id^="desc-repertoire-date-d"]')
          const myEl = wrapper.querySelector('.repertoire-list-item__month-year, [id^="desc-repertoire-date-my"]')
          const hiEl = wrapper.querySelector('[id^="desc-repertoire-date-hi"], .repertoire-list-item__hour time')
          const labelEl = wrapper.querySelector('.repertoire-list-item__label')
          const authorEl = wrapper.querySelector('.repertoire-list-item__author')
          // Ticket links use aria-describedby with the title ID
          const titleId = titleEl?.id || ''
          const ticketEl = titleId
            ? document.querySelector(`a[href*="bilety24"][aria-describedby*="${titleId}"]`)
            : wrapper.querySelector('a[href*="bilety24"]')
          const eventLink = wrapper.querySelector('a[href*="/wydarzenie/"]')

          const title = titleEl?.textContent?.trim()
          const day = dayEl?.textContent?.trim()
          const monthYear = myEl?.textContent?.trim()
          const time = hiEl?.textContent?.trim()

          if (title && day && monthYear) {
            events.push({
              title, day, monthYear, time,
              label: labelEl?.textContent?.trim() || '',
              author: authorEl?.textContent?.trim() || '',
              ticketLink: ticketEl?.href || '',
              eventUrl: eventLink?.href || '',
            })
          }
        })

        // Also try: count all title IDs to see max index
        let maxIdx = -1
        for (let i = 0; i < 200; i++) {
          if (document.getElementById('desc-repertoire-title-' + i)) maxIdx = i
        }
        if (events.length === 0 && maxIdx >= 0) {
          console.log('Fallback: found IDs up to', maxIdx)
          for (let i = 0; i <= maxIdx; i++) {
            const t = document.getElementById('desc-repertoire-title-' + i)?.textContent?.trim()
            const d = document.getElementById('desc-repertoire-date-d-' + i)?.textContent?.trim()
            const m = document.getElementById('desc-repertoire-date-my-' + i)?.textContent?.trim()
            const h = document.getElementById('desc-repertoire-date-hi-' + i)?.textContent?.trim()
            if (t && d && m) events.push({ title: t, day: d, monthYear: m, time: h || '', label: '', author: '', ticketLink: '', eventUrl: '' })
          }
        }

        return events
      })
    }

    // Iterate through months
    for (let monthIdx = 0; monthIdx < 5; monthIdx++) {
      const rawEvents = await extractCurrentEvents()

      for (const ev of rawEvents) {
        let month = null, year = 2026
        for (const [name, num] of Object.entries(MONTHS)) {
          if (ev.monthYear.toLowerCase().includes(name)) { month = num; break }
        }
        const yearMatch = ev.monthYear.match(/(\d{4})/)
        if (yearMatch) year = parseInt(yearMatch[1])
        if (!month) continue

        const timeMatch = ev.time?.match(/(\d+):(\d+)/)
        const dateTime = new Date(year, month - 1, parseInt(ev.day),
          timeMatch ? parseInt(timeMatch[1]) : 19,
          timeMatch ? parseInt(timeMatch[2]) : 0
        ).toISOString()

        const key = `${dateTime}-${ev.title}`
        if (!seen.has(key)) {
          seen.add(key)
          parsedEvents.push({
            tytul: ev.title,
            kompozytor: ev.author || '',
            kategoria: categorize(ev.label),
            data_czas: dateTime,
            link_bilety: ev.ticketLink,
            zrodlo_url: 'https://operabaltycka.pl/repertuar',
          })
        }
      }

      console.log(`  [Gdańsk] Miesiąc ${monthIdx + 1}: ${rawEvents.length} na stronie, razem: ${parsedEvents.length}`)

      // Click next month button, wait for AJAX response, re-extract
      try {
        const nextBtn = await page.$('button.js-next-month')
        if (!nextBtn) break

        const [response] = await Promise.all([
          page.waitForResponse(resp => resp.url().includes('filterAjax'), { timeout: 15000 }),
          nextBtn.click(),
        ])
        await new Promise(r => setTimeout(r, 2000)) // let DOM update

        // Re-extract from updated page
        const rawEvents = await extractCurrentEvents()
        let newCount = 0
        for (const ev of rawEvents) {
          let month = null, year = 2026
          for (const [name, num] of Object.entries(MONTHS)) {
            if (ev.monthYear.toLowerCase().includes(name)) { month = num; break }
          }
          const yearMatch = ev.monthYear.match(/(\d{4})/)
          if (yearMatch) year = parseInt(yearMatch[1])
          if (!month) continue
          const timeMatch = ev.time?.match(/(\d+):(\d+)/)
          const dateTime = new Date(year, month - 1, parseInt(ev.day),
            timeMatch ? parseInt(timeMatch[1]) : 19, timeMatch ? parseInt(timeMatch[2]) : 0
          ).toISOString()
          const key = `${dateTime}-${ev.title}`
          if (!seen.has(key)) {
            seen.add(key)
            parsedEvents.push({
              tytul: ev.title, kompozytor: ev.author || '', kategoria: categorize(ev.label),
              data_czas: dateTime, link_bilety: ev.ticketLink, zrodlo_url: 'https://operabaltycka.pl/repertuar',
            })
            newCount++
          }
        }
        console.log(`  [Gdańsk] Miesiąc ${monthIdx + 2}: +${newCount} nowych, razem: ${parsedEvents.length}`)
      } catch (err) {
        // Timeout = no more AJAX = no more months
        console.log(`  [Gdańsk] Koniec miesięcy (${err.message?.substring(0, 30)})`)
        break
      }
    }

    return parsedEvents
  } catch (err) {
    console.error(`  [Gdańsk] Puppeteer error: ${err.message}`)
    // Fallback to static HTML (only current month)
    console.log('  [Gdańsk] Fallback: static HTML (tylko bieżący miesiąc)')
    const html = await fetchHTML('https://operabaltycka.pl/repertuar')
    return parseGdanskHTML(html)
  } finally {
    if (browser) await browser.close()
  }
})()}

// ── 3. OPERA WROCŁAWSKA ──────────────────────────────────────────────────────
// /1/repertuar.php — .rep-single blocks with .title, .feat-cat, .rep-date, .rep-time, .date-string
async function scrapeWroclaw() {
  const html = await fetchHTML('https://www.opera.wroclaw.pl/1/repertuar.php')
  const $ = cheerio.load(html)
  const events = []

  $('.rep-single').each((_, el) => {
    const $el = $(el)
    const title = $el.find('h4.title').text().trim()
    if (!title) return

    const category = $el.find('.feat-cat .feat-value').text().trim()
    const day = $el.find('.rep-date .day').text().trim()
    const monthStr = $el.find('.rep-date .month').text().trim() // "marca, So"
    const time = $el.find('.rep-time').text().trim()
    const dateString = $el.find('.date-string').text().trim() // "20260321"

    let dateTime = null
    if (dateString && dateString.length === 8) {
      const y = parseInt(dateString.substring(0, 4))
      const m = parseInt(dateString.substring(4, 6)) - 1
      const d = parseInt(dateString.substring(6, 8))
      const [h, min] = time ? time.split(':').map(Number) : [19, 0]
      dateTime = new Date(y, m, d, h, min).toISOString()
    }

    const available = !$el.find('.btn-disabled').length
    const detailsLink = $el.find('a[href*="spektakl.php"]').attr('href') || ''
    const ticketLink = $el.find('a[href*="bilet"]').attr('href') || ''

    if (dateTime) {
      events.push({
        tytul: title,
        kategoria: categorize(category || title),
        data_czas: dateTime,
        link_bilety: ticketLink,
        dostepnosc: available ? 'dostepne' : 'wyprzedane',
        zrodlo_url: detailsLink ? `https://www.opera.wroclaw.pl/1/${detailsLink}` : 'https://www.opera.wroclaw.pl/1/repertuar.php',
      })
    }
  })

  return events
}

// ── 4. OPERA NOVA BYDGOSZCZ ─────────────────────────────────────────────────
// /repertuar.html — month sections with h3 (Marzec/Kwiecień/...), day h2, title h5>a, time, ticket
async function scrapeBydgoszcz() {
  const html = await fetchHTML('https://www.opera.bydgoszcz.pl/repertuar.html')
  const $ = cheerio.load(html)
  const events = []
  const seen = new Set()
  const year = new Date().getFullYear()
  const monthMap = { 'marzec': 3, 'kwiecień': 4, 'maj': 5, 'czerwiec': 6, 'lipiec': 7, 'sierpień': 8 }

  // Strategy: find all month sections, then inside each, find day+event blocks
  // Month headers: h3.text-warning containing month name
  // Day blocks: h2 with day number, then h5>a with title, small with category, time text, ticket link

  // Walk through the mobile list view which has cleaner structure
  // Pattern in d-lg-none: h2(day), h5>a(title)+small(cat), time, ticket link
  let currentMonth = null

  // Find all current-month sections
  $('.current-month').each((_, section) => {
    const $section = $(section)
    const monthName = $section.find('h3.text-warning').first().text().trim().toLowerCase()
    const month = monthMap[monthName]
    if (!month) return

    // Find all event blocks within this month
    // Each event: text-center p-1 block with h2 (day), h5>a (title), small (cat), time, ticket
    $section.find('.text-center.p-1, .text-center').each((_, block) => {
      const $block = $(block)
      const dayText = $block.find('h2').first().text().trim()
      const day = parseInt(dayText)
      if (isNaN(day) || day < 1 || day > 31) return

      const $titleLink = $block.find('h5 a[href*="spektakle"]').first()
      const title = $titleLink.text().trim()
      if (!title) return

      const category = $block.find('h5 small').text().trim()
      const href = $titleLink.attr('href') || ''

      // Time — plain text like "19:00"
      const blockText = $block.text()
      const timeMatch = blockText.match(/(\d{1,2}:\d{2})/)

      // Ticket link
      const ticketLink = $block.find('a[href*="bilety"]').first().attr('href') || ''

      const dateTime = new Date(year, month - 1, day,
        ...(timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0])
      ).toISOString()

      const key = `${dateTime}-${title}`
      if (seen.has(key)) return
      seen.add(key)

      events.push({
        tytul: title,
        kategoria: categorize(category || title),
        data_czas: dateTime,
        link_bilety: ticketLink,
        zrodlo_url: href ? `https://www.opera.bydgoszcz.pl${href}` : 'https://www.opera.bydgoszcz.pl/repertuar.html',
      })
    })
  })

  return events
}

// ── 5. TEATR WIELKI POZNAŃ ───────────────────────────────────────────────────
// /repertuar — sequential .reportaile-item__date + .reportaile-item__name blocks
async function scrapePoznan() {
  const html = await fetchHTML('https://opera.poznan.pl/repertuar')
  const $ = cheerio.load(html)
  const events = []
  const seen = new Set()

  // Collect all date blocks and pair with adjacent name blocks
  const $dates = $('.reportaile-item__date')
  $dates.each((_, dateEl) => {
    const $dateBlock = $(dateEl)
    const dateText = $dateBlock.find('.reportaile-item__date__title').text().trim()
    const timeInfo = $dateBlock.find('.reportaile-item__date__info').text().trim()

    // Find the next sibling name block
    const $nameBlock = $dateBlock.next('.reportaile-item__name')
    if (!$nameBlock.length) return

    const titleFull = $nameBlock.find('.reportaile-item__name__title').text().trim()
    const category = $nameBlock.find('.reportaile-item__name__info small').text().trim()
    const ticketLink = $nameBlock.nextAll('.btn-buy-ticket, .reportaile-item__checkout').first().find('a').attr('href') || ''

    if (!titleFull) return

    // Parse date: "19.03.2026"
    const dateMatch = dateText.match(/(\d{1,2})\.(\d{2})\.(\d{4})/)
    if (!dateMatch) return

    const timeMatch = timeInfo.match(/(\d{1,2}:\d{2})/)
    const dateTime = new Date(
      parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]),
      ...(timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0])
    ).toISOString()

    // Deduplicate
    const key = `${dateTime}-${titleFull}`
    if (seen.has(key)) return
    seen.add(key)

    // Split "TURANDOT - Giacomo Puccini" into title and composer
    const parts = titleFull.split(/\s*-\s*/)
    const title = parts[0].trim()
    const composer = parts.slice(1).join(' - ').trim()

    // Find venue from sibling .reportaile-item__place
    const $place = $nameBlock.nextAll('.reportaile-item__place').first()
    const venue = $place.find('.place-name').text().trim()

    events.push({
      tytul: title,
      kompozytor: composer,
      kategoria: categorize(category),
      data_czas: dateTime,
      link_bilety: ticketLink,
      sala: venue,
      zrodlo_url: 'https://opera.poznan.pl/repertuar',
    })
  })

  return events
}

// ── 6. TEATR WIELKI ŁÓDŹ ─────────────────────────────────────────────────────
// /Repertuar,17 — event blocks: .mp_date (DD.MM, day, HH:MM) + h3 a (title) + .spectacle_row_val (category, composer)
async function scrapeLodz() {
  const html = await fetchHTML('https://www.operalodz.com/Repertuar,17')
  const $ = cheerio.load(html)
  const events = []

  // Split HTML by mp_date blocks — each event has: mp_date div, then main_program_right div
  // Strategy: walk through all .mp_date elements and pair with next h3 title
  const year = new Date().getFullYear()

  // Find all date containers
  $('.mp_date').each((_, dateEl) => {
    const $date = $(dateEl)
    const dateText = $date.find('.f30').first().text().trim() // "18.03"
    const timeText = $date.find('.f30').last().text().trim()  // "11:00"

    const dateMatch = dateText.match(/(\d{1,2})\.(\d{2})/)
    const timeMatch = timeText.match(/(\d{1,2}:\d{2})/)
    if (!dateMatch) return

    const month = parseInt(dateMatch[2])
    const day = parseInt(dateMatch[1])
    const [h, min] = timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0]
    const dateTime = new Date(year, month - 1, day, h, min).toISOString()

    // Find ticket link near this date
    const $ticketContainer = $date.parent()
    const ticketLink = $ticketContainer.find('a[href*="bilety24"], a[href*="bilet"]').first().attr('href') || ''

    // Find title — it's in the sibling #main_program_right div
    const $right = $ticketContainer.next('#main_program_right, [id="main_program_right"]')
    const title = $right.find('h3 a').first().text().replace(/›/g, '').replace(/&rsaquo;/g, '').trim()
    if (!title) return

    // Category and composer from spectacle_row_val
    const rows = []
    $right.find('.spectacle_row').each((_, row) => {
      const label = $(row).find('.spectacle_row_lab').text().trim()
      const value = $(row).find('.spectacle_row_val').text().trim()
      rows.push({ label, value })
    })

    const category = rows.find(r => !r.label && ['Opera', 'Balet', 'Koncert', 'Edukacja', 'Musical'].includes(r.value))?.value || ''
    const composer = rows.find(r => r.label.includes('Kompozytor'))?.value || ''

    events.push({
      tytul: title.replace(/\s+/g, ' '),
      kompozytor: composer,
      kategoria: categorize(category || title),
      data_czas: dateTime,
      link_bilety: ticketLink,
      zrodlo_url: 'https://www.operalodz.com/Repertuar,17',
    })
  })

  return events
}

// ── 7. OPERA KRAKOWSKA ───────────────────────────────────────────────────────
// Cloudflare protection — requires Puppeteer headless browser
async function scrapeKrakow() {
  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36')
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pl-PL,pl;q=0.9' })

    console.log('  [Kraków] Uruchamiam przeglądarkę...')
    await page.goto('https://opera.krakow.pl/pl/repertuar/kalendarz', {
      waitUntil: 'networkidle2',
      timeout: 45000,
    })

    // Wait for Cloudflare challenge + page render
    await new Promise(r => setTimeout(r, 8000))

    const html = await page.content()
    const $ = cheerio.load(html)
    const events = []

    // Try CSS selectors first
    $('[class*="calendar-event"], [class*="event-item"], [class*="calendar__item"], article').each((_, el) => {
      const $el = $(el)
      const title = $el.find('h3, h4, [class*="title"]').first().text().trim()
      const timeText = $el.find('[class*="time"], [class*="hour"]').first().text().trim()
      const dateAttr = $el.find('time').attr('datetime')
      const category = $el.find('[class*="category"], [class*="tag"]').first().text().trim()
      const ticketLink = $el.find('a[href*="bilet"]').first().attr('href') || ''

      if (!title || title.length < 3) return

      let dateTime = null
      if (dateAttr) {
        const timeM = timeText.match(/(\d{1,2}):(\d{2})/)
        const d = new Date(dateAttr)
        if (timeM) { d.setHours(parseInt(timeM[1]), parseInt(timeM[2])) }
        dateTime = d.toISOString()
      }

      if (dateTime) {
        events.push({
          tytul: title,
          kategoria: categorize(category || title),
          data_czas: dateTime,
          link_bilety: ticketLink,
          zrodlo_url: 'https://opera.krakow.pl/pl/repertuar/kalendarz',
        })
      }
    })

    // Fallback: parse page text
    if (events.length === 0) {
      const bodyText = await page.evaluate(() => document.body.innerText)
      console.log('  [Kraków] Fallback: parsing text, length:', bodyText.length)

      // Look for date + event patterns
      const dateBlocks = bodyText.split(/\n/).filter(l => l.trim().length > 0)
      let currentDate = null

      for (const line of dateBlocks) {
        // Date line: "15 marca 2026"
        const dateM = line.match(/(\d{1,2})\s+(marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s*(\d{4})?/i)
        if (dateM) {
          const m = Object.entries(MONTHS).find(([k]) => dateM[2].toLowerCase().includes(k))
          if (m) currentDate = { day: parseInt(dateM[1]), month: m[1], year: dateM[3] ? parseInt(dateM[3]) : 2026 }
          continue
        }

        // Time + event line: "19:00 Turandot"
        const eventM = line.match(/^(\d{1,2}:\d{2})\s+(.+)/)
        if (eventM && currentDate) {
          const [h, min] = eventM[1].split(':').map(Number)
          const dateTime = new Date(currentDate.year, currentDate.month - 1, currentDate.day, h, min).toISOString()
          events.push({
            tytul: eventM[2].trim(),
            kategoria: categorize(eventM[2]),
            data_czas: dateTime,
            link_bilety: '',
            zrodlo_url: 'https://opera.krakow.pl/pl/repertuar/kalendarz',
          })
        }
      }
    }

    return events
  } catch (err) {
    console.error(`  [Kraków] Puppeteer error: ${err.message}`)
    console.error('  [Kraków] Skipping — Cloudflare protection active')
    return []
  } finally {
    if (browser) await browser.close()
  }
}

// ── Theater registry ─────────────────────────────────────────────────────────

const THEATERS = [
  { key: 'warszawa', name: 'Teatr Wielki — Opera Narodowa', slug: 'teatr-wielki-warszawa', scraper: scrapeWarszawa },
  { key: 'gdansk', name: 'Opera Bałtycka', slug: 'opera-baltycka', scraper: scrapeGdansk },
  { key: 'wroclaw', name: 'Opera Wrocławska', slug: 'opera-wroclawska', scraper: scrapeWroclaw },
  { key: 'bydgoszcz', name: 'Opera Nova', slug: 'opera-nova-bydgoszcz', scraper: scrapeBydgoszcz },
  { key: 'poznan', name: 'Teatr Wielki w Poznaniu', slug: 'teatr-wielki-poznan', scraper: scrapePoznan },
  { key: 'lodz', name: 'Teatr Wielki w Łodzi', slug: 'teatr-wielki-lodz', scraper: scrapeLodz },
  { key: 'krakow', name: 'Opera Krakowska', slug: 'opera-krakowska', scraper: scrapeKrakow },
]

// ── Supabase sync ────────────────────────────────────────────────────────────

async function ensureTeatr(slug, nazwa, miasto) {
  const { data } = await supabase.from('teatry').select('id').eq('slug', slug).single()
  if (data) return data.id

  const { data: newTeatr, error } = await supabase.from('teatry')
    .insert({ nazwa, slug, miasto })
    .select('id')
    .single()

  if (error) throw new Error(`Cannot create teatr ${slug}: ${error.message}`)
  console.log(`  ✚ Dodano teatr: ${nazwa}`)
  return newTeatr.id
}

async function ensureSpektakl(tytul, kompozytor, teatrId) {
  const { data } = await supabase.from('spektakle')
    .select('id')
    .eq('tytul', tytul)
    .eq('teatr_id', teatrId)
    .maybeSingle()

  if (data) return data.id

  const { data: newSpektakl, error } = await supabase.from('spektakle')
    .insert({ tytul, kompozytor: kompozytor || null, teatr_id: teatrId })
    .select('id')
    .single()

  if (error) throw new Error(`Cannot create spektakl "${tytul}": ${error.message}`)
  return newSpektakl.id
}

async function syncToSupabase(teatrSlug, teatrName, events) {
  if (events.length === 0) return { added: 0, skipped: 0 }

  const miastaMap = {
    'teatr-wielki-warszawa': 'Warszawa',
    'opera-krakowska': 'Kraków',
    'opera-wroclawska': 'Wrocław',
    'opera-baltycka': 'Gdańsk',
    'opera-nova-bydgoszcz': 'Bydgoszcz',
    'teatr-wielki-poznan': 'Poznań',
    'teatr-wielki-lodz': 'Łódź',
  }

  const teatrId = await ensureTeatr(teatrSlug, teatrName, miastaMap[teatrSlug])
  let added = 0, skipped = 0

  for (const event of events) {
    const spektaklId = await ensureSpektakl(event.tytul, event.kompozytor || null, teatrId)

    // Check if this exact showing already exists
    const { data: existing } = await supabase.from('przedstawienia')
      .select('id')
      .eq('spektakl_id', spektaklId)
      .eq('teatr_id', teatrId)
      .eq('data_czas', event.data_czas)
      .maybeSingle()

    if (existing) { skipped++; continue }

    const insertData = {
      spektakl_id: spektaklId,
      teatr_id: teatrId,
      data_czas: event.data_czas,
      link_bilety: event.link_bilety || null,
      dostepnosc: event.dostepnosc || null,
      notatka: event.kategoria || null,
    }
    // Add link_szczegoly if column exists (added via ALTER TABLE)
    if (event.zrodlo_url) insertData.link_szczegoly = event.zrodlo_url

    const { error } = await supabase.from('przedstawienia').insert(insertData)

    if (error) {
      console.error(`  ✗ Error: ${event.tytul} @ ${event.data_czas}: ${error.message}`)
    } else {
      added++
    }
  }

  return { added, skipped }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  🎭 Scraper repertuarów — Świat Baletu')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Tryb: ${DRY_RUN ? 'DRY RUN (bez zapisu)' : 'ZAPIS DO SUPABASE'}`)
  console.log(`  Teatry: ${TEATR_FILTER || 'wszystkie'}`)
  console.log()

  const theaters = TEATR_FILTER
    ? THEATERS.filter(t => t.key.includes(TEATR_FILTER))
    : THEATERS

  if (theaters.length === 0) {
    console.error('Nie znaleziono teatru:', TEATR_FILTER)
    process.exit(1)
  }

  const results = []

  for (const theater of theaters) {
    console.log(`▸ ${theater.name}...`)

    try {
      const events = await theater.scraper()
      console.log(`  ✓ Znaleziono ${events.length} wydarzeń`)

      if (DRY_RUN) {
        for (const e of events.slice(0, 5)) {
          const dt = e.data_czas ? new Date(e.data_czas).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '??'
          console.log(`    • ${dt} | ${e.kategoria} | ${e.tytul}`)
        }
        if (events.length > 5) console.log(`    ... i ${events.length - 5} więcej`)
        results.push({ theater: theater.name, events: events.length, added: 0, skipped: 0 })
      } else {
        const { added, skipped } = await syncToSupabase(theater.slug, theater.name, events)
        console.log(`  ✓ Dodano: ${added}, pominięto (duplikaty): ${skipped}`)
        results.push({ theater: theater.name, events: events.length, added, skipped })
      }
    } catch (err) {
      console.error(`  ✗ Błąd: ${err.message}`)
      results.push({ theater: theater.name, events: 0, added: 0, skipped: 0, error: err.message })
    }

    console.log()
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  PODSUMOWANIE')
  console.log('═══════════════════════════════════════════════════════════')
  let totalEvents = 0, totalAdded = 0
  for (const r of results) {
    totalEvents += r.events
    totalAdded += r.added
    const status = r.error ? `✗ ${r.error}` : `✓ ${r.events} wydarzeń${DRY_RUN ? '' : `, ${r.added} nowych`}`
    console.log(`  ${r.theater}: ${status}`)
  }
  console.log(`\n  RAZEM: ${totalEvents} wydarzeń${DRY_RUN ? '' : `, ${totalAdded} dodanych do bazy`}`)
  console.log()
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
