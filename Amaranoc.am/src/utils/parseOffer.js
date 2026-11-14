// amaranoc.am/am/offers/ID էջի HTML-ից հանում է նկարները և մանրամասները
const imgRe = /_next\/image\?url=(https?%3A%2F%2Fapi\.amaranoc\.am%2F[^&"'\s)]+)/g
const L = { code: 'Կոդ', address: 'Հասցե', night: 'Գիշերակաց', area: 'Շինության մակերես', totalArea: 'Ընդհանուր մակերես',
  guests: 'Մարդկանց թույլատրելի քանակ', nightGuests: 'Մարդկանց թույլատրելի քանակը գիշերակացով',
  rooms: 'Սենյակների քանակ', baths: 'Սանհանգույցների քանակ', pool: 'Լողավազան' }

export function parseOffer(html) {
  const images = [...new Set([...html.matchAll(imgRe)].map(m => decodeURIComponent(m[1])))]
  const lines = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean)
  const info = { images }
  for (const [k, label] of Object.entries(L)) {
    const i = lines.indexOf(label)
    if (i >= 0) info[k] = lines[i + 1]
  }
  info.guests = +info.guests || info.guests
  info.nightGuests = +info.nightGuests || info.nightGuests
  const from = lines.indexOf('Առավելություններ', lines.indexOf('Նշեք Ձեր ցանկալի օրերը'))
  const to = lines.indexOf('Կարծիքներ', from)
  info.amenities = from >= 0 && to > from ? lines.slice(from + 1, to) : []
  return info
}