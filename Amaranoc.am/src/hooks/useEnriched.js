import { useEffect, useState } from 'react'
import { parseOffer } from '../utils/parseOffer'


const KEY = 'amaranoc-offers-v1'
let cache = {}
try { cache = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
const subs = new Set()
const pending = new Set()

async function load(id) {
  if (cache[id] || pending.has(id)) return
  pending.add(id)
  try {
    const r = await fetch(`/site/am/offers/${id}`)
    if (!r.ok) throw new Error(r.status)
    const info = parseOffer(await r.text())
    if (info.images.length) {
      cache[id] = info
      try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch {}
      subs.forEach(f => f())
    }
  } catch {}
  pending.delete(id)
}

export function useEnriched(list) {
  const [, tick] = useState(0)
  useEffect(() => {
    const f = () => tick(n => n + 1)
    subs.add(f)
    const need = list.filter(o => !o.info && !cache[o.id])
    let i = 0
    const worker = async () => { while (i < need.length) await load(need[i++].id) }
    for (let k = 0; k < 4; k++) worker()
    return () => subs.delete(f)
  }, [list])
  return list.map(o => {
    const info = o.info || cache[o.id]
    return info ? { ...o, info, images: info.images } : o
  })
}