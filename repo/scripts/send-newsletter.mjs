#!/usr/bin/env node

/**
 * Skrypt do wysyłki newslettera z linii komend
 *
 * Użycie:
 *   node scripts/send-newsletter.mjs --id <sanity_id>                    # wysyłka do wszystkich
 *   node scripts/send-newsletter.mjs --id <sanity_id> --test me@email.pl # mail testowy
 *   node scripts/send-newsletter.mjs --id <sanity_id> --preview          # otwórz podgląd
 */

import 'dotenv/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const API_KEY = process.env.NEWSLETTER_API_KEY

const args = process.argv.slice(2)
const idIdx = args.indexOf('--id')
const testIdx = args.indexOf('--test')
const isPreview = args.includes('--preview')

if (idIdx === -1 || !args[idIdx + 1]) {
  console.error('Użycie: node scripts/send-newsletter.mjs --id <sanity_newsletter_id> [--test email] [--preview]')
  process.exit(1)
}

const newsletterId = args[idIdx + 1]

if (isPreview) {
  const url = `${SITE_URL}/api/newsletter/podglad?id=${newsletterId}`
  console.log(`\n📧 Podgląd newslettera:\n${url}\n`)

  // Spróbuj otworzyć w przeglądarce
  const { exec } = await import('child_process')
  exec(`start ${url}`)
  process.exit(0)
}

const testEmail = testIdx !== -1 ? args[testIdx + 1] : null

if (!API_KEY) {
  console.error('❌ Brak NEWSLETTER_API_KEY w zmiennych środowiskowych')
  process.exit(1)
}

console.log(`\n📧 ${testEmail ? `Wysyłka testowa na ${testEmail}` : '⚠️  WYSYŁKA DO WSZYSTKICH SUBSKRYBENTÓW'}`)
console.log(`Newsletter ID: ${newsletterId}`)

if (!testEmail) {
  console.log('\nCzy na pewno chcesz wysłać do wszystkich? (Ctrl+C aby anulować, Enter aby kontynuować)')
  await new Promise((resolve) => {
    process.stdin.once('data', resolve)
  })
}

try {
  const res = await fetch(`${SITE_URL}/api/newsletter/wyslij`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      id: newsletterId,
      testEmail: testEmail || undefined,
    }),
  })

  const data = await res.json()

  if (res.ok) {
    console.log(`\n✅ ${data.message}`)
    if (data.successCount !== undefined) {
      console.log(`   Wysłano: ${data.successCount} / ${data.total}`)
      if (data.failCount > 0) {
        console.log(`   Błędy: ${data.failCount}`)
      }
    }
  } else {
    console.error(`\n❌ Błąd: ${data.error}`)
  }
} catch (err) {
  console.error(`\n❌ Błąd połączenia: ${err.message}`)
}
