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
    try {
      const r = await fetch(`${api}/casino/wallet/balance`, {headers:{'X-User-Id':'demo-user'}})
      if(r.ok){ setBalance(await r.json()) } else { setBalance({balance: 1000, currency: 'USD'}) }
    } catch(e) { 
      console.error(e)
      setBalance({balance: 1000, currency: 'USD'})
    }
  }
  useEffect(()=>{ refreshBalance() },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl shadow-2xl border-4 border-yellow-300">
          <div className="text-3xl font-bold text-black flex items-center gap-3">
            🎰 <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Kryzel Casino Pro</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-lg font-semibold text-black">
              Balance: <span className="font-mono bg-black/20 px-3 py-1 rounded-lg">${balance?.balance || '1000'} {balance?.currency || 'USD'}</span>
            </div>
            <a className="btn-ghost text-black border-black/20 hover:border-black/40" href="/sportsbook">← Back to Sportsbook</a>
          </div>
        </header>
        <nav className="flex gap-3 mb-8 flex-wrap justify-center">
          {TABS.map(t=>(<button key={t.key} className={`btn ${tab===t.key?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t.key)}>{t.label}</button>))}
        </nav>
        <main className="card">
          {tab==='roulette' && <Roulette onDone={refreshBalance}/>}
          {tab==='roulette-pro' && <RoulettePro onDone={refreshBalance}/>}
          {tab==='blackjack' && <Blackjack onDone={refreshBalance}/>}
          {tab==='baccarat' && <Baccarat onDone={refreshBalance}/>}
          {tab==='slots' && <Slots onDone={refreshBalance}/>}
          {tab==='reel-editor' && <SlotsEditor/>}
          {tab==='crash' && <Crash onDone={refreshBalance}/>}
          {tab==='crash-live' && <CrashLive/>}
          {tab==='admin' && <Admin/>}
        </main>
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
  const save = async()=>{ const r=await fetch(`${api}/casino/admin/config/${game}`,{method:'POST',headers,body:JSON.stringify(conf)}); if(r.ok) alert('Configuration saved successfully!') }
  const loadKpi = async()=>{ const r=await fetch(`${api}/casino/history?limit=200`,{headers}); if(r.ok){ const rows=await r.json(); const ggr=rows.reduce((a,b)=>a+(b.stake-b.payout),0); const wagered=rows.reduce((a,b)=>a+b.stake,0); const rtp=wagered?(1-(ggr/wagered)):0; setKpi({ggr:+ggr.toFixed(2), rtp:+rtp.toFixed(3), rounds:rows.length}) } }
  useEffect(()=>{ load(); loadKpi() },[game])
  if(!conf) return <div className="flex items-center justify-center p-8"><div className="text-xl text-yellow-400 animate-pulse">Loading Admin Panel...</div></div>
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-purple-700 to-purple-800 rounded-xl border-2 border-yellow-400 shadow-2xl">
        <div className="text-2xl font-bold text-yellow-400 mb-4 text-center">📊 Casino Analytics Dashboard</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-black/30 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-green-400">${kpi.ggr}</div>
            <div className="text-white/80 font-semibold">Gross Gaming Revenue</div>
          </div>
          <div className="text-center p-4 bg-black/30 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-blue-400">{(kpi.rtp * 100).toFixed(1)}%</div>
            <div className="text-white/80 font-semibold">Return to Player</div>
          </div>
          <div className="text-center p-4 bg-black/30 rounded-lg border border-white/20">
            <div className="text-3xl font-bold text-orange-400">{kpi.rounds}</div>
            <div className="text-white/80 font-semibold">Total Rounds</div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border-2 border-white/20 shadow-2xl">
        <div className="text-xl font-bold text-yellow-400 mb-4 text-center">⚙️ Game Configuration</div>
        <div className="flex gap-4 items-center justify-center mb-6">
          <select value={game} onChange={e=>setGame(e.target.value)} className="input w-40">
            <option value="slots">🎰 Slots</option>
            <option value="roulette">🎯 Roulette</option>
            <option value="blackjack">🂡 Blackjack</option>
            <option value="baccarat">🂢 Baccarat</option>
            <option value="crash">🚀 Crash</option>
          </select>
          <button onClick={save} className="btn-primary">💾 Save Configuration</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-yellow-400 font-semibold">Target RTP</label>
            <input type="number" step="0.001" value={conf.target_rtp} onChange={e=>setConf({...conf, target_rtp: parseFloat(e.target.value)})} className="input w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-yellow-400 font-semibold">Volatility</label>
            <input type="number" step="0.1" value={conf.volatility} onChange={e=>setConf({...conf, volatility: parseFloat(e.target.value)})} className="input w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-yellow-400 font-semibold">Min Bet ($)</label>
            <input type="number" value={conf.min_bet} onChange={e=>setConf({...conf, min_bet: parseFloat(e.target.value)})} className="input w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-yellow-400 font-semibold">Max Bet ($)</label>
            <input type="number" value={conf.max_bet} onChange={e=>setConf({...conf, max_bet: parseFloat(e.target.value)})} className="input w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
