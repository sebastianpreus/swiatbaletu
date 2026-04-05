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
const CLEAN_FUTURE = process.argv.includes('--clean-future')
const TEATR_FILTER = (() => {
  const idx = process.argv.indexOf('--teatr')
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null
})()

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert Warsaw local time components to a proper ISO timestamp.
 * All scraped times are Polish local times (CET/CEST).
 * We construct the ISO string directly with the correct UTC offset
 * so that stored timestamps are accurate regardless of server timezone.
 */
function warsawDateToISO(year, month, day, hour, minute) {
  // Determine if the date falls in CET (+01:00) or CEST (+02:00)
  // CEST: last Sunday of March 02:00 → last Sunday of October 03:00
  const lastSundayOfMonth = (y, m) => {
    const last = new Date(Date.UTC(y, m, 0)) // last day of month
    return last.getUTCDate() - last.getUTCDay()
  }
  const cestStart = new Date(Date.UTC(year, 2, lastSundayOfMonth(year, 3), 1, 0, 0)) // March last Sun at 01:00 UTC
  const cestEnd = new Date(Date.UTC(year, 9, lastSundayOfMonth(year, 10), 1, 0, 0))  // October last Sun at 01:00 UTC

  // Build a preliminary UTC date assuming CET (+1), then check if it's actually CEST
  const utcAsCET = Date.UTC(year, month - 1, day, hour - 1, minute)
  const isCEST = utcAsCET >= cestStart.getTime() && utcAsCET < cestEnd.getTime()
  const offsetHours = isCEST ? 2 : 1

  const pad = (n) => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+${pad(offsetHours)}:00`
}

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
  // butik.teatrwielki.pl JSON API — full data with availability, no Puppeteer needed
  const now = new Date()
  const dataOd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const resp = await fetch(`https://butik.teatrwielki.pl/rezerwacja/termin.html?json=true&ajax_action=pobierz_terminy&data_od=${dataOd}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Cookie': 'SERVER=app01' }
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const json = await resp.json()
  if (json.status !== 'complete') throw new Error(`API status: ${json.status}`)

  const events = []
  const seen = new Set()

  for (const [date, dayEvents] of Object.entries(json.data)) {
    for (const e of dayEvents) {
      const [y, m, d] = date.split('-').map(Number)
      const [h, min] = (e.godzinaTerminu || '19:00').split(':').map(Number)
      const dateTime = warsawDateToISO(y, m, d, h, min)

      const key = `${dateTime}-${e.tytul}`
      if (seen.has(key)) continue
      seen.add(key)

      // Determine availability from wolneMiejsca + etykietaPrzycisku
      const label = (e.etykietaPrzycisku || '').toLowerCase()
      const wolne = e.wolneMiejsca ?? 0
      let dostepnosc = 'dostepne'
      let ticketLink = e.terminUrl?.replace(/&amp;/g, '&') || ''

      if (label.includes('sprzedaż zakończona') || label.includes('brak miejsc') || wolne === 0) {
        dostepnosc = 'wyprzedane'
        ticketLink = ''
      } else if (label.includes('powiadom')) {
        dostepnosc = 'wyprzedane'
        ticketLink = ''
      } else if (label.includes('niedostępny')) {
        dostepnosc = 'info'
        ticketLink = ''
      } else if (wolne > 0 && wolne < 20) {
        dostepnosc = 'malo_miejsc'
      }

      if (e.infoOdwolany) dostepnosc = 'odwolane'

      // Category from opis field
      const opisLower = (e.opis || '').toLowerCase()

      events.push({
        tytul: e.tytul || '',
        kompozytor: e.autor || '',
        kategoria: categorize(opisLower.includes('balet') ? 'Balet' : opisLower.includes('opera') ? 'Opera' : opisLower.includes('koncert') ? 'Koncert' : e.tytul),
        data_czas: dateTime,
        link_bilety: ticketLink,
        dostepnosc,
        zrodlo_url: e.urlWydarzenia || 'https://teatrwielki.pl/kalendarium/',
      })
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

    const [, hStr, mStr] = time.match(/(\d+):(\d+)/) || [, '19', '0']
    const dateTime = warsawDateToISO(year, month, parseInt(day), parseInt(hStr), parseInt(mStr))

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
        const dateTime = warsawDateToISO(year, month, parseInt(ev.day),
          timeMatch ? parseInt(timeMatch[1]) : 19,
          timeMatch ? parseInt(timeMatch[2]) : 0
        )

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
          const dateTime = warsawDateToISO(year, month, parseInt(ev.day),
            timeMatch ? parseInt(timeMatch[1]) : 19, timeMatch ? parseInt(timeMatch[2]) : 0
          )
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
// Ticket links: a[href*="bilety.opera.wroclaw.pl"] (Kup bilet)
// Detail links: a[href*="spektakl.php"] (Szczegóły)
// Sold out: text "Brak miejsc" or btn-disabled class
async function scrapeWroclaw() {
  const html = await fetchHTML('https://www.opera.wroclaw.pl/1/repertuar.php')
  const $ = cheerio.load(html)
  const events = []

  // Use LIST VIEW (.rep-single.list) — grid view has stale availability data
  $('.rep-single.list').each((_, el) => {
    const $el = $(el)
    // Title is in h3.rep-list-title, may contain <br> with subtitle/composer
    const titleEl = $el.find('.rep-list-title')
    const titleHtml = titleEl.html() || ''
    const title = (titleHtml.split(/<br\s*\/?>/i)[0] || '').replace(/<[^>]*>/g, '').trim()
    if (!title) return

    const category = $el.find('.feat-cat .feat-value').text().trim()
    const time = $el.find('.rep-list-time').text().trim()
    const dateString = $el.find('.date-string').text().trim() // "20260321"

    let dateTime = null
    if (dateString && dateString.length === 8) {
      const y = parseInt(dateString.substring(0, 4))
      const m = parseInt(dateString.substring(4, 6))
      const d = parseInt(dateString.substring(6, 8))
      const [h, min] = time ? time.split(':').map(Number) : [19, 0]
      dateTime = warsawDateToISO(y, m, d, h, min)
    }

    // Detail page link: spektakl.php?_id=... (btn-grey in list view)
    const detailsHref = $el.find('a[href*="spektakl.php"]').first().attr('href') || ''
    const detailsLink = detailsHref
      ? (detailsHref.startsWith('http') ? detailsHref : `https://www.opera.wroclaw.pl/1/${detailsHref.replace(/^\.\//, '')}`)
      : ''

    // Availability from list view (accurate, unlike grid)
    const hasBrakMiejsc = $el.find('.btn-disabled').length > 0 ||
      $el.find('a, button').filter((_, a) => $(a).text().trim().toLowerCase().includes('brak miejsc')).length > 0

    const buyBtn = $el.find('a.btn-red[href*="bilety.opera.wroclaw.pl"]').first()

    let ticketLink = ''
    let dostepnosc = null
    if (hasBrakMiejsc) {
      dostepnosc = 'wyprzedane'
    } else if (buyBtn.length > 0) {
      ticketLink = buyBtn.attr('href') || ''
      dostepnosc = 'dostepne'
    }

    if (dateTime) {
      events.push({
        tytul: title,
        kategoria: categorize(category || title),
        data_czas: dateTime,
        link_bilety: ticketLink,
        dostepnosc,
        zrodlo_url: detailsLink || 'https://www.opera.wroclaw.pl/1/repertuar.php',
      })
    }
  })

  return events
}

// ── 4. OPERA NOVA BYDGOSZCZ ─────────────────────────────────────────────────
// /repertuar.html — all months in one HTML (slick carousel), mobile view (.d-lg-none .text-center.p-1)
// Month changes detected by day number decreasing (e.g. 29 → 01 = next month)
async function scrapeBydgoszcz() {
  const html = await fetchHTML('https://www.opera.bydgoszcz.pl/repertuar.html')
  const $ = cheerio.load(html)
  const events = []
  const seen = new Set()
  const year = new Date().getFullYear()
  const monthMap = { 'marzec': 3, 'kwiecień': 4, 'maj': 5, 'czerwiec': 6, 'lipiec': 7, 'sierpień': 8,
    'wrzesień': 9, 'październik': 10, 'listopad': 11, 'grudzień': 12, 'styczeń': 1, 'luty': 2 }

  // Get starting month from header
  const monthName = $('.current-month h3.text-warning').first().text().trim().toLowerCase()
  let currentMonth = monthMap[monthName] || new Date().getMonth() + 1
  let prevDay = 0

  // Use mobile view entries — one per event, simpler structure
  $('.d-lg-none .text-center.p-1').each((_, block) => {
    const $block = $(block)
    const dayText = $block.find('h2.text-black').first().text().trim()
    const day = parseInt(dayText)
    if (isNaN(day) || day < 1 || day > 31) return

    // Detect month change: day decreased means next month
    if (day < prevDay) currentMonth++
    prevDay = day

    const $titleLink = $block.find('h5.text-warning a').first()
    const title = $titleLink.text().trim()
    if (!title) return

    const category = $block.find('h5 small, small.text-dark').text().trim()
    const detailHref = $titleLink.attr('href') || ''

    const blockText = $block.text()
    const timeMatch = blockText.match(/(\d{1,2}:\d{2})/)

    const ticketLink = $block.find('a[href*="bilety.operanova.bydgoszcz.pl"]').first().attr('href')
      || $block.find('a.btn-warning').first().attr('href')
      || ''

    const detailLink = detailHref
      ? (detailHref.startsWith('http') ? detailHref : `https://www.opera.bydgoszcz.pl${detailHref.startsWith('/') ? '' : '/'}${detailHref}`)
      : ''

    const timeParts = timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0]
    const dateTime = warsawDateToISO(year, currentMonth, day, timeParts[0], timeParts[1] || 0)

    const key = `${dateTime}-${title}`
    if (seen.has(key)) return
    seen.add(key)

    events.push({
      tytul: title,
      kategoria: categorize(category || title),
      data_czas: dateTime,
      link_bilety: ticketLink,
      dostepnosc: null, // will be filled from bilety.operanova
      zrodlo_url: detailLink || 'https://www.opera.bydgoszcz.pl/repertuar.html',
      _day: day, _month: currentMonth,
    })
  })

  // Fetch real availability from bilety.operanova.bydgoszcz.pl
  const monthsToCheck = [...new Set(events.map(e => e._month))]
  const availMap = new Map() // "day-month-HH:MM-TITLE_NORM" => { sold, href }

  for (const m of monthsToCheck) {
    const ym = `${year}-${String(m).padStart(2, '0')}`
    try {
      const biletHtml = await fetchHTML(`https://bilety.operanova.bydgoszcz.pl/MSI/mvc/pl?sort=Name&date=${ym}&datestart=0`)
      const $b = cheerio.load(biletHtml)

      $b('.movies-movie__single').each((_, card) => {
        const cardTitle = $b(card).find('h2').text().trim().toUpperCase()

        $b(card).find('.movies-movie__single__options del.disabled, .movies-movie__single__options a.js-link-popup').each((_, dateEl) => {
          const text = $b(dateEl).text().trim().replace(/\s+/g, ' ')
          const isSold = dateEl.tagName === 'del'
          const href = $b(dateEl).attr('href') || ''
          // text like "19 mar 19:00" or "27 mar 19:00"
          const dm = text.match(/(\d+)\s+\w+\s+(\d+:\d+)/)
          if (dm) {
            const key = `${dm[1]}-${m}-${dm[2]}-${cardTitle}`
            availMap.set(key, { sold: isSold, href: isSold ? '' : `https://bilety.operanova.bydgoszcz.pl${href}` })
          }
        })
      })
    } catch (err) {
      console.error(`  [Bydgoszcz] Błąd bilety ${ym}: ${err.message}`)
    }
  }

  // Match availability back to events
  for (const ev of events) {
    const timeMatch = ev.data_czas.match(/T(\d+):(\d+)/)
    const h = timeMatch ? parseInt(timeMatch[1]) + 1 : 19 // UTC→CET
    const mm = timeMatch ? timeMatch[2] : '00'
    const titleNorm = ev.tytul.toUpperCase()

    // Try matching with title normalization (bilety may add "- balet", double spaces etc.)
    for (const [key, val] of availMap) {
      const parts = key.split('-')
      const day = parts[0], month = parts[1]
      const cardTitle = parts.slice(3).join('-').replace(/\s+/g, ' ')
      if (parseInt(day) === ev._day && parseInt(month) === ev._month && (cardTitle.includes(titleNorm.substring(0, 5)) || titleNorm.includes(cardTitle.substring(0, 5)))) {
        ev.dostepnosc = val.sold ? 'wyprzedane' : 'dostepne'
        if (val.href && !val.sold) ev.link_bilety = val.href
        break
      }
    }

    delete ev._day
    delete ev._month
  }

  return events
}

// ── 5. TEATR WIELKI POZNAŃ ───────────────────────────────────────────────────
// /repertuar — sequential .reportaile-item__date + .reportaile-item__name blocks
// Ticket links: a.btn-buy-ticket[href*="bilety.opera.poznan.pl"]
// Detail links: title <a> inside .reportaile-item__name__title (e.g. /turandot-giacomo-puccini)
async function scrapePoznan() {
  const html = await fetchHTML('https://opera.poznan.pl/repertuar')
  const $ = cheerio.load(html)
  const events = []
  const seen = new Set()

  // Each .reportaile-item contains date, name, checkout sections
  // Walk through .reportaile-item containers or date+name sibling pairs
  const $items = $('.reportaile-item')

  $items.each((_, item) => {
    const $item = $(item)
    const dateText = $item.find('.reportaile-item__date__title').text().trim()
    const timeInfo = $item.find('.reportaile-item__date__info').text().trim()

    // Title: text in .reportaile-item__name__title
    const $titleEl = $item.find('.reportaile-item__name__title')
    const titleFull = $titleEl.text().trim()
    const category = $item.find('.reportaile-item__name__info small').text().trim()

    // Ticket link: btn-buy-ticket class
    const ticketLink = $item.find('a.btn-buy-ticket').first().attr('href') || ''

    // Detail page link: <a> wrapping .reportaile-item__name
    const $nameLink = $item.find('a[href]').filter((_, a) => $(a).find('.reportaile-item__name__title').length > 0).first()
    const titleHref = $nameLink.attr('href') || ''
    const detailLink = titleHref && titleHref !== '#'
      ? (titleHref.startsWith('http') ? titleHref : `https://opera.poznan.pl${titleHref.startsWith('/') ? '' : '/'}${titleHref}`)
      : ''

    if (!titleFull) return

    // Parse date: "19.03.2026"
    const dateMatch = dateText.match(/(\d{1,2})\.(\d{2})\.(\d{4})/)
    if (!dateMatch) return

    const timeMatch = timeInfo.match(/(\d{1,2}:\d{2})/)
    const timeParts = timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0]
    const dateTime = warsawDateToISO(
      parseInt(dateMatch[3]), parseInt(dateMatch[2]), parseInt(dateMatch[1]),
      timeParts[0], timeParts[1] || 0
    )

    // Deduplicate
    const key = `${dateTime}-${titleFull}`
    if (seen.has(key)) return
    seen.add(key)

    // Split "TURANDOT - Giacomo Puccini" into title and composer
    const parts = titleFull.split(/\s*-\s*/)
    const title = parts[0].trim()
    const composer = parts.slice(1).join(' - ').trim()

    // Find venue from .reportaile-item__place
    const venue = $item.find('.place-name').text().trim()

    // Availability: check if ticket button exists and is not disabled
    let dostepnosc = null
    if (ticketLink) {
      dostepnosc = 'dostepne'
    }
    // Check for sold out indicators
    const itemText = $item.text().toLowerCase()
    if (itemText.includes('wyprzedane') || itemText.includes('brak miejsc') || itemText.includes('sold out')) {
      dostepnosc = 'wyprzedane'
    }

    events.push({
      tytul: title,
      kompozytor: composer,
      kategoria: categorize(category),
      data_czas: dateTime,
      link_bilety: ticketLink,
      dostepnosc,
      sala: venue,
      zrodlo_url: detailLink || 'https://opera.poznan.pl/repertuar',
    })
  })

  // Fallback: if .reportaile-item didn't match, try the old date+name sibling approach
  if (events.length === 0) {
    const $dates = $('.reportaile-item__date')
    $dates.each((_, dateEl) => {
      const $dateBlock = $(dateEl)
      const dateText = $dateBlock.find('.reportaile-item__date__title').text().trim()
      const timeInfo = $dateBlock.find('.reportaile-item__date__info').text().trim()

      const $nameBlock = $dateBlock.next('.reportaile-item__name')
      if (!$nameBlock.length) return

      const $titleLink = $nameBlock.find('.reportaile-item__name__title a').first()
      const titleFull = ($titleLink.length ? $titleLink.text().trim() : $nameBlock.find('.reportaile-item__name__title').text().trim())
      const category = $nameBlock.find('.reportaile-item__name__info small').text().trim()

      // Ticket link from siblings
      const ticketLink = $nameBlock.nextAll('a.btn-buy-ticket').first().attr('href')
        || $nameBlock.parent().find('a.btn-buy-ticket').first().attr('href')
        || ''

      // Detail link from title
      const titleHref = $titleLink.attr('href') || ''
      const detailLink = titleHref
        ? (titleHref.startsWith('http') ? titleHref : `https://opera.poznan.pl${titleHref.startsWith('/') ? '' : '/'}${titleHref}`)
        : ''

      if (!titleFull) return

      const dateMatch = dateText.match(/(\d{1,2})\.(\d{2})\.(\d{4})/)
      if (!dateMatch) return

      const timeMatch = timeInfo.match(/(\d{1,2}:\d{2})/)
      const timeParts = timeMatch ? timeMatch[1].split(':').map(Number) : [19, 0]
      const dateTime = warsawDateToISO(
        parseInt(dateMatch[3]), parseInt(dateMatch[2]), parseInt(dateMatch[1]),
        timeParts[0], timeParts[1] || 0
      )

      const key = `${dateTime}-${titleFull}`
      if (seen.has(key)) return
      seen.add(key)

      const parts = titleFull.split(/\s*-\s*/)
      const title = parts[0].trim()
      const composer = parts.slice(1).join(' - ').trim()
      const venue = $nameBlock.nextAll('.reportaile-item__place').first().find('.place-name').text().trim()

      events.push({
        tytul: title,
        kompozytor: composer,
        kategoria: categorize(category),
        data_czas: dateTime,
        link_bilety: ticketLink,
        dostepnosc: ticketLink ? 'dostepne' : null,
        sala: venue,
        zrodlo_url: detailLink || 'https://opera.poznan.pl/repertuar',
      })
    })
  }

  return events
}

// ── 6. TEATR WIELKI ŁÓDŹ ─────────────────────────────────────────────────────
// /Repertuar,17 — event blocks: .mp_date (DD.MM, day, HH:MM) + h3 a (title) + .spectacle_row_val (category, composer)
// Ticket links: a[href*="bilety24"] (twlodz.bilety24.pl/kup-bilety/?id=...)
// Detail links: h3 a href pattern like "NAPOJ_MILOSNY,29,652"
async function scrapeLodz() {
  const allEvents = []
  const seen = new Set()
  const now = new Date()

  // Use bilety24 shop — has months from March to June, accurate availability
  for (let offset = 0; offset < 5; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    try {
      const html = await fetchHTML(`https://twlodz.bilety24.pl/?b24_month=${ym}`)
      const $ = cheerio.load(html)

      // Desktop view: .b24-event-month-list-default > .b24-day > .list-item
      let currentDate = ''
      $('.desktop-show .b24-day').each((_, dayEl) => {
        const $day = $(dayEl)
        const dayBar = $day.find('.b24-day-bar').text().trim() // "Piątek, 20 Marca"

        $day.find('.list-item').each((_, itemEl) => {
          const $item = $(itemEl)

          // Detail link: .list-item-image a[href*="wydarzenie"]
          const detailLink = $item.find('a.list-item-image').attr('href') || ''

          // Button: a.btn-buy — text can be "KUP BILET", "INFO", "ODWOŁANE", etc.
          const $btn = $item.find('a.btn-buy').first()
          const btnText = $btn.text().trim()
          const btnHref = $btn.attr('href') || ''

          // Title from btn title attribute: "Kup bilet - Opera: NAPÓJ MIŁOSNY - 2026-03-20 17:30 - 18:30 - Łódź"
          const btnTitle = $btn.attr('title') || ''
          const titleMatch = btnTitle.match(/(?:Opera|Balet|Koncert|Edukacja|Musical|Wydarzenie)[:\s]+(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)

          let title = '', dateStr = '', timeStr = '', category = ''
          if (titleMatch) {
            // Extract category from prefix
            const catMatch = btnTitle.match(/^[^-]*-\s*(Opera|Balet|Koncert|Edukacja|Musical|Wydarzenie)/)
            category = catMatch ? catMatch[1] : ''
            title = titleMatch[1].trim()
            dateStr = titleMatch[2]
            timeStr = titleMatch[3]
          }

          if (!title || !dateStr) return

          const [y, m, dd] = dateStr.split('-').map(Number)
          const [h, min] = timeStr.split(':').map(Number)
          const dateTime = warsawDateToISO(y, m, dd, h, min)

          const key = `${dateTime}-${title}`
          if (seen.has(key)) return
          seen.add(key)

          // Availability based on button text
          let dostepnosc = null
          let ticketLink = ''
          const btnLower = btnText.toLowerCase()
          if (btnLower.includes('kup bilet')) {
            dostepnosc = 'dostepne'
            ticketLink = btnHref
          } else if (btnLower.includes('odwołane') || btnLower.includes('cancelled')) {
            dostepnosc = 'odwolane'
          } else if (btnLower.includes('info')) {
            dostepnosc = 'info'
            ticketLink = btnHref // link to event page for details
          }

          allEvents.push({
            tytul: title.replace(/\s+/g, ' '),
            kategoria: categorize(category || title),
            data_czas: dateTime,
            link_bilety: ticketLink,
            dostepnosc,
            zrodlo_url: detailLink || `https://twlodz.bilety24.pl/?b24_month=${ym}`,
          })
        })
      })

      const monthEvents = allEvents.length - seen.size + [...seen].filter(k => allEvents.some(e => `${e.data_czas}-${e.tytul}` === k)).length
      console.log(`  [Łódź] ${ym}: ${$('.desktop-show .list-item').length} pozycji`)
    } catch (err) {
      console.error(`  [Łódź] Błąd ${ym}: ${err.message}`)
    }
  }

  return allEvents
}

// ── 7. OPERA KRAKOWSKA ───────────────────────────────────────────────────────
// Cloudflare protection — requires Puppeteer headless browser
async function scrapeKrakow() {
  // tickets.opera.krakow.pl — no Cloudflare, SoftCOM ticket system
  // Each event is a .card.card-border-left with h2 (title), p.card-text (date/time), a.js-wybierz-termin-btn (buy link + free seats)
  const events = []
  const seen = new Set()

  for (let m = new Date().getMonth() + 1; m <= 12; m++) {
    try {
      const url = `https://tickets.opera.krakow.pl/rezerwacja/termin.html?m=${m}&y=2026&termtoscroll=0`
      const html = await fetchHTML(url)
      const $ = cheerio.load(html)

      let monthCount = 0
      $('.card.card-border-left, .card.mb-3').each((_, card) => {
        const $card = $(card)
        const title = $card.find('h2').text().trim()
        if (!title || title.length < 2 || title === 'Wybierz datę:' || title === 'Wybierz:') return

        const dateText = $card.find('p.card-text').text().trim()
        // Format: "2026-03-19 (czwartek) 18:30"
        const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})\s*\([^)]+\)\s*(\d{1,2}:\d{2})/)
        if (!dateMatch) return

        const [dateStr, timeStr] = [dateMatch[1], dateMatch[2]]
        const [y, mo, d] = dateStr.split('-').map(Number)
        const [h, min] = timeStr.split(':').map(Number)
        const dateTime = warsawDateToISO(y, mo, d, h, min)

        const key = `${dateTime}-${title}`
        if (seen.has(key)) return
        seen.add(key)

        // Category from text between title and date (often "Opera", "Balet", etc.)
        const catText = $card.find('p.card-text.text-muted').text().trim()
        const catMatch = catText.match(/(Opera|Balet|Koncert|Edukacja|Musical|Operetka)/i)

        // Availability: button with "Wybierz" + "X wolnych" = available, or "Brak Miejsc" / "Powiadom"
        const buyBtn = $card.find('a.js-wybierz-termin-btn')
        const cardText = $card.text().toLowerCase()
        let dostepnosc = null
        let ticketLink = ''

        if (buyBtn.length > 0) {
          ticketLink = buyBtn.attr('href') || ''
          const freeMatch = buyBtn.text().match(/(\d+)\s*wolnych/)
          if (freeMatch && parseInt(freeMatch[1]) < 20) {
            dostepnosc = 'malo_miejsc'
          } else {
            dostepnosc = 'dostepne'
          }
        }
        if (cardText.includes('brak miejsc') || cardText.includes('niedostępny') || cardText.includes('powiadom')) {
          dostepnosc = 'wyprzedane'
          ticketLink = ''
        }

        events.push({
          tytul: title,
          kategoria: categorize(catMatch ? catMatch[1] : title),
          data_czas: dateTime,
          link_bilety: ticketLink,
          dostepnosc,
          zrodlo_url: `https://tickets.opera.krakow.pl/rezerwacja/termin.html?m=${m}&y=2026`,
        })
        monthCount++
      })

      if (monthCount > 0) {
        console.log(`  [Kraków] ${m}/2026: ${monthCount} wydarzeń`)
      } else {
        break // no more events
      }
    } catch (err) {
      console.error(`  [Kraków] Błąd ${m}/2026: ${err.message}`)
    }
  }

  return events
}

// ── 8. OPERA NA ZAMKU W SZCZECINIE ───────────────────────────────────────────
// Server-rendered repertoire at /repertuar/YYYYMM
// Real DOM structure (verified 2026-03):
//   article.event--teaser
//     div.event__teaser-small__event   ← date/time live here (DIVs not spans)
//       div.event__teaser-small__day   "07"
//       div.event__teaser-small__date  "03 / 2026"
//       div.event__teaser-small__week  "sobota"
//       div.event__teaser-small__time  " 19:00"
//       a[href*="rezerwacja"]          "Kup bilet"
//     div.event__teaser-small__performance
//       a[href^="/repertuar/slug"]
//         article.performance--teaser-small
//           div.performance__teaser-small__descrition
//             div > div (composer text, may be absent)
//             h2 > span (title)
//             div.performance__category > div.field__item (category)
async function scrapeSzczecin() {
  const events = []
  const seen = new Set()
  const now = new Date()

  // Scrape current month + next 3 months
  for (let offset = 0; offset < 4; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`

    try {
      const url = `https://www.opera.szczecin.pl/repertuar/${ym}`
      const html = await fetchHTML(url)
      const $ = cheerio.load(html)

      let monthCount = 0

      // Iterate over each top-level event article (article.event--teaser)
      $('article.event--teaser').each((_, el) => {
        const $article = $(el)

        // ── Date/time: all stored in DIVs inside .event__teaser-small__event ──
        const dayNum   = $article.find('.event__teaser-small__day').first().text().trim()
        const monthYear = $article.find('.event__teaser-small__date').first().text().trim()
        const timeStr  = $article.find('.event__teaser-small__time').first().text().trim()

        if (!dayNum || !monthYear || !timeStr) return

        // monthYear format: "03 / 2026"
        if (!monthYear.match(/^\d{2}\s*\/\s*\d{4}$/)) return
        const [mm, yyyy] = monthYear.split('/').map(s => parseInt(s.trim()))
        const day = parseInt(dayNum)
        // timeStr may have leading space: " 19:00"
        const cleanTime = timeStr.trim()
        if (!cleanTime.match(/^\d{1,2}:\d{2}$/)) return
        const [hours, minutes] = cleanTime.split(':').map(Number)

        const dateTime = warsawDateToISO(yyyy, mm, day, hours, minutes)

        // ── Performance link & title ──
        const $perfLink = $article.find('.event__teaser-small__performance a[href^="/repertuar/"]').first()
        const href = $perfLink.attr('href')
        if (!href || href.match(/^\/repertuar\/\d{6}$/)) return

        // Title is in h2 > span inside the performance article
        const title = $perfLink.find('h2').text().trim()
        if (!title) return

        const key = `${dateTime}-${title}`
        if (seen.has(key)) return
        seen.add(key)

        // ── Category: div.performance__category > div.field__item ──
        const kategoria = $perfLink.find('.performance__category .field__item').first().text().trim() || null

        // ── Composer: first div inside the description wrapper, before h2 ──
        // The description div contains an optional composer div, then h2, then category
        const $descr = $perfLink.find('.performance__teaser-small__descrition')
        let composer = ''
        $descr.children('div').first().children('div').each((_, s) => {
          const text = $(s).text().trim()
          if (text && text !== title && !text.match(/^(Opera|Balet|Koncert|Operetka|Musical|Edukacja|Spektakl)/i) && text.length > 2 && text.length < 120) {
            composer = text
          }
        })

        // ── Ticket link: "Kup bilet" anchor inside the event date column ──
        const ticketLink = $article.find('.event__teaser-small__event a[href*="rezerwacja"]').first().attr('href') || null

        events.push({
          tytul: title,
          kompozytor: composer || null,
          data_czas: dateTime,
          link_bilety: ticketLink || null,
          zrodlo_url: `https://www.opera.szczecin.pl${href}`,
          dostepnosc: ticketLink ? 'dostepne' : null,
          kategoria: kategoria || null,
        })
        monthCount++
      })

      console.log(`  [Szczecin] ${ym}: ${monthCount} pozycji`)
    } catch (err) {
      console.error(`  [Szczecin] Błąd ${ym}: ${err.message}`)
    }
  }

  return events
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
  { key: 'szczecin', name: 'Opera na Zamku', slug: 'opera-na-zamku-szczecin', scraper: scrapeSzczecin },
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
  if (events.length === 0) return { added: 0, updated: 0, unchanged: 0 }

  const miastaMap = {
    'teatr-wielki-warszawa': 'Warszawa',
    'opera-krakowska': 'Kraków',
    'opera-wroclawska': 'Wrocław',
    'opera-baltycka': 'Gdańsk',
    'opera-nova-bydgoszcz': 'Bydgoszcz',
    'teatr-wielki-poznan': 'Poznań',
    'teatr-wielki-lodz': 'Łódź',
    'opera-na-zamku-szczecin': 'Szczecin',
  }

  const teatrId = await ensureTeatr(teatrSlug, teatrName, miastaMap[teatrSlug])

  // Clean future events before reimport (preserves history)
  if (CLEAN_FUTURE) {
    const today = new Date().toISOString().split('T')[0] + 'T00:00:00'
    const { error } = await supabase.from('przedstawienia')
      .delete()
      .eq('teatr_id', teatrId)
      .gte('data_czas', today)
    if (error) console.error(`  ✗ Clean future error: ${error.message}`)
    else console.log(`  ♻ Wyczyszczono przyszłe przedstawienia`)
  }

  let added = 0, updated = 0, unchanged = 0

  // Ensure all spektakle exist first (deduplicated)
  const spektaklCache = new Map()
  for (const event of events) {
    const key = `${event.tytul}||${event.kompozytor || ''}`
    if (!spektaklCache.has(key)) {
      spektaklCache.set(key, await ensureSpektakl(event.tytul, event.kompozytor || null, teatrId))
    }
  }

  if (CLEAN_FUTURE) {
    // After cleaning future, batch insert all events at once
    const rows = events.map(event => {
      const key = `${event.tytul}||${event.kompozytor || ''}`
      const row = {
        spektakl_id: spektaklCache.get(key),
        teatr_id: teatrId,
        data_czas: event.data_czas,
        link_bilety: event.link_bilety || null,
        dostepnosc: event.dostepnosc || null,
        notatka: event.kategoria || null,
      }
      if (event.zrodlo_url) row.link_szczegoly = event.zrodlo_url
      return row
    })

    // Filter only future events for insert (past ones were not deleted)
    const now = new Date().toISOString().split('T')[0] + 'T00:00:00'
    const futureRows = rows.filter(r => r.data_czas >= now)
    const pastRows = rows.filter(r => r.data_czas < now)

    // Batch insert future in chunks of 100
    for (let i = 0; i < futureRows.length; i += 100) {
      const chunk = futureRows.slice(i, i + 100)
      const { error } = await supabase.from('przedstawienia').insert(chunk)
      if (error) {
        console.error(`  ✗ Batch insert error: ${error.message}`)
      } else {
        added += chunk.length
      }
    }

    // Past events — upsert individually (they still exist in DB)
    for (const event of pastRows) {
      // These were not deleted, just skip or update
      unchanged++
    }
  } else {
    // Without clean-future: check each event individually
    for (const event of events) {
      const key = `${event.tytul}||${event.kompozytor || ''}`
      const spektaklId = spektaklCache.get(key)

      const updateData = {
        link_bilety: event.link_bilety || null,
        dostepnosc: event.dostepnosc || null,
        notatka: event.kategoria || null,
      }
      if (event.zrodlo_url) updateData.link_szczegoly = event.zrodlo_url

      const { data: existing } = await supabase.from('przedstawienia')
        .select('id, dostepnosc, link_bilety, link_szczegoly')
        .eq('spektakl_id', spektaklId)
        .eq('teatr_id', teatrId)
        .eq('data_czas', event.data_czas)
        .maybeSingle()

      if (existing) {
        const changed = existing.dostepnosc !== updateData.dostepnosc ||
                         existing.link_bilety !== updateData.link_bilety ||
                         (updateData.link_szczegoly && existing.link_szczegoly !== updateData.link_szczegoly)
        if (changed) {
          const { error } = await supabase.from('przedstawienia')
            .update(updateData)
            .eq('id', existing.id)
          if (error) console.error(`  ✗ Update error: ${event.tytul}: ${error.message}`)
          else updated++
        } else {
          unchanged++
        }
        continue
      }

      const { error } = await supabase.from('przedstawienia').insert({
        spektakl_id: spektaklId, teatr_id: teatrId, data_czas: event.data_czas, ...updateData,
      })
      if (error) console.error(`  ✗ Insert error: ${event.tytul}: ${error.message}`)
      else added++
    }
  }

  return { added, updated, unchanged }
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
          const avail = e.dostepnosc ? ` [${e.dostepnosc}]` : ''
          const ticket = e.link_bilety ? ' [BILET]' : ''
          const detail = e.zrodlo_url && e.zrodlo_url !== '' ? ' [URL]' : ''
          console.log(`    • ${dt} | ${e.kategoria} | ${e.tytul}${avail}${ticket}${detail}`)
        }
        if (events.length > 5) console.log(`    ... i ${events.length - 5} więcej`)
        results.push({ theater: theater.name, events: events.length, added: 0, updated: 0, unchanged: 0 })
      } else {
        const { added, updated, unchanged } = await syncToSupabase(theater.slug, theater.name, events)
        console.log(`  ✓ Nowych: ${added}, zaktualizowanych: ${updated}, bez zmian: ${unchanged}`)
        results.push({ theater: theater.name, events: events.length, added, updated, unchanged })
      }
    } catch (err) {
      console.error(`  ✗ Błąd: ${err.message}`)
      results.push({ theater: theater.name, events: 0, added: 0, updated: 0, unchanged: 0, error: err.message })
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
    const status = r.error ? `✗ ${r.error}` : `✓ ${r.events} wydarzeń${DRY_RUN ? '' : `, +${r.added} nowych, ↻${r.updated} zaktual.`}`
    console.log(`  ${r.theater}: ${status}`)
  }
  console.log(`\n  RAZEM: ${totalEvents} wydarzeń${DRY_RUN ? '' : `, ${totalAdded} dodanych do bazy`}`)
  console.log()

  // Save last scrape timestamp to Supabase meta table
  if (!DRY_RUN) {
    const { error: metaErr } = await supabase.from('meta').upsert({
      klucz: 'last_scrape',
      wartosc: JSON.stringify({
        timestamp: new Date().toISOString(),
        events: totalEvents,
        added: totalAdded,
      }),
    })
    if (metaErr) console.error(`  ✗ Meta save error: ${metaErr.message}`)
    else console.log(`  ✓ Zapisano timestamp w bazie`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
