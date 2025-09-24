import React, { useState, useEffect } from 'react'
import Roulette from './games/Roulette'
import Blackjack from './games/Blackjack'
import Baccarat from './games/Baccarat'
import Slots from './games/Slots'
import Crash from './games/Crash'
import RoulettePro from './games/RoulettePro'
import SlotsEditor from '../components/SlotsReelEditor'
import CrashLive from '../components/CrashWSClient'

const TABS=[
  {key:'roulette', label:'🎡 Roulette'},
  {key:'roulette-pro', label:'🎡 Roulette Felt'},
  {key:'blackjack', label:'🂡 Blackjack+'},
  {key:'baccarat', label:'🂢 Baccarat+'},
  {key:'slots', label:'🎰 Slots'},
  {key:'reel-editor', label:'🛠️ Reel Editor'},
  {key:'crash', label:'🚀 Crash (REST)'},
  {key:'crash-live', label:'📡 Crash (WS)'},
  {key:'admin', label:'⚙️ Admin'}
]

export default function App(){
  const [tab,setTab]=useState('roulette-pro')
  const api = window.CASINO_API
  const [balance, setBalance] = useState(null)

  const refreshBalance = async ()=>{
    const r = await fetch(`${api}/casino/wallet/balance`, {headers:{'X-User-Id':'demo-user'}})
    if(r.ok){ setBalance(await r.json()) }
  }
  useEffect(()=>{ refreshBalance() },[])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="text-2xl font-semibold">Kryzel Casino Pro</div>
        <div className="flex gap-3 items-center">
          <div className="text-sm opacity-80">Balance: <span className="font-mono">{JSON.stringify(balance)||'—'}</span></div>
          <a className="btn-ghost" href="/sportsbook">← Back to Sportsbook</a>
        </div>
      </header>
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(t=>(<button key={t.key} className={`btn ${tab===t.key?'bg-gold text-black':'btn-ghost'}`} onClick={()=>setTab(t.key)}>{t.label}</button>))}
      </div>
      <div className="card">
        {tab==='roulette' && <Roulette onDone={refreshBalance}/>}
        {tab==='roulette-pro' && <RoulettePro onDone={refreshBalance}/>}
        {tab==='blackjack' && <Blackjack onDone={refreshBalance}/>}
        {tab==='baccarat' && <Baccarat onDone={refreshBalance}/>}
        {tab==='slots' && <Slots onDone={refreshBalance}/>}
        {tab==='reel-editor' && <SlotsEditor/>}
        {tab==='crash' && <Crash onDone={refreshBalance}/>}
        {tab==='crash-live' && <CrashLive/>}
        {tab==='admin' && <Admin/>}
      </div>
    </div>
  )
}

function Admin(){
  const api = window.CASINO_API
  const [game, setGame]=useState('slots')
  const [conf, setConf]=useState(null)
  const [kpi, setKpi]=useState({ggr:0, rtp:0, rounds:0})
  const headers={'Content-Type':'application/json','X-User-Id':'demo-user'}
  const load = async()=>{ const r=await fetch(`${api}/casino/admin/config/${game}`,{headers}); if(r.ok) setConf(await r.json()) }
  const save = async()=>{ const r=await fetch(`${api}/casino/admin/config/${game}`,{method:'POST',headers,body:JSON.stringify(conf)}); if(r.ok) alert('Saved') }
  const loadKpi = async()=>{ const r=await fetch(`${api}/casino/history?limit=200`,{headers}); if(r.ok){ const rows=await r.json(); const ggr=rows.reduce((a,b)=>a+(b.stake-b.payout),0); const wagered=rows.reduce((a,b)=>a+b.stake,0); const rtp=wagered?(1-(ggr/wagered)):0; setKpi({ggr:+ggr.toFixed(2), rtp:+rtp.toFixed(3), rounds:rows.length}) } }
  useEffect(()=>{ load(); loadKpi() },[game])
  if(!conf) return <div>Loading…</div>
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="card">GGR: ${kpi.ggr}</div>
        <div className="card">RTP: {kpi.rtp}</div>
        <div className="card">Rounds: {kpi.rounds}</div>
      </div>
      <div className="flex gap-2">
        <select className="input" value={game} onChange={e=>setGame(e.target.value)}>
          {['slots','roulette','blackjack','baccarat','crash'].map(g=>(<option key={g} value={g}>{g}</option>))}
        </select>
        <button className="btn-primary" onClick={save}>Save</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label>Target RTP <input className="input w-full" type="number" step="0.001" value={conf.target_rtp} onChange={e=>setConf({...conf, target_rtp: parseFloat(e.target.value)})}/></label>
        <label>Volatility <input className="input w-full" type="number" step="0.1" value={conf.volatility} onChange={e=>setConf({...conf, volatility: parseFloat(e.target.value)})}/></label>
        <label>Min Bet <input className="input w-full" type="number" value={conf.min_bet} onChange={e=>setConf({...conf, min_bet: parseFloat(e.target.value)})}/></label>
        <label>Max Bet <input className="input w-full" type="number" value={conf.max_bet} onChange={e=>setConf({...conf, max_bet: parseFloat(e.target.value)})}/></label>
      </div>
    </div>
  )
}
