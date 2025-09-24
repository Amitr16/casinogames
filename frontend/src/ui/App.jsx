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
    <div style={{
      minHeight: '100vh',
      padding: '32px',
      background: `
        radial-gradient(ellipse at top, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(218, 165, 32, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 25%, #2a1810 50%, #1a0f0a 75%, #0a0a0a 100%)
      `,
      backgroundAttachment: 'fixed',
      fontFamily: "'Cinzel', serif",
      color: 'white'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{
          background: `
            linear-gradient(135deg, rgba(139, 69, 19, 0.9) 0%, rgba(218, 165, 32, 0.95) 25%, rgba(255, 215, 0, 1) 50%, rgba(218, 165, 32, 0.95) 75%, rgba(139, 69, 19, 0.9) 100%),
            radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)
          `,
          border: '4px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: `
            0 0 50px rgba(255, 215, 0, 0.6),
            inset 0 4px 20px rgba(255, 255, 255, 0.3),
            inset 0 -4px 20px rgba(0, 0, 0, 0.4),
            0 20px 60px rgba(0, 0, 0, 0.5)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'floating 3s ease-in-out infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              fontSize: '4rem',
              animation: 'glow-pulse 2s ease-in-out infinite alternate'
            }}>🎰</div>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '3.5rem',
                fontWeight: '900',
                textShadow: `
                  3px 3px 6px rgba(0, 0, 0, 0.9),
                  0 0 30px rgba(255, 215, 0, 0.8),
                  0 0 60px rgba(255, 215, 0, 0.5)
                `,
                background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                KRYZEL CASINO
              </h1>
              <div style={{
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                opacity: 0.8
              }}>Royal Gaming Experience</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              padding: '12px 24px',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '20px',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
            }}>
              💰 ${balance?.balance || '1000'} {balance?.currency || 'USD'}
            </div>
            <a style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              color: '#FFD700',
              padding: '12px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }} href="/sportsbook">
              ← Sportsbook
            </a>
          </div>
        </header>
        
        <nav style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
        }}>
          {TABS.map(t=>(
            <button 
              key={t.key} 
              onClick={()=>setTab(t.key)}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.125rem',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '12px',
                border: tab === t.key ? '2px solid #FFD700' : '2px solid rgba(255, 215, 0, 0.3)',
                background: tab === t.key 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)'
                  : 'rgba(0, 0, 0, 0.3)',
                color: tab === t.key ? '#000' : '#FFD700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: tab === t.key 
                  ? '0 0 30px rgba(255, 215, 0, 0.6)'
                  : '0 4px 15px rgba(0, 0, 0, 0.3)',
                textShadow: tab === t.key ? 'none' : '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}
              onMouseEnter={(e) => {
                if (tab !== t.key) {
                  e.target.style.background = 'rgba(255, 215, 0, 0.1)';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== t.key) {
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
        
        <main style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.2)',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
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
  if(!conf) return <div className="flex items-center justify-center p-12"><div className="text-3xl text-yellow-400 animate-glow-pulse text-shadow-gold">Loading Admin Panel...</div></div>
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
          ⚙️ CASINO CONTROL CENTER ⚙️
        </h2>
        <div className="text-xl text-yellow-300 opacity-90 font-semibold">Analytics • Configuration • Management</div>
      </div>
      
      <div className="glass-effect p-8 rounded-3xl neon-glow">
        <div className="text-3xl font-bold text-yellow-400 mb-8 text-center text-shadow-gold">📊 PERFORMANCE ANALYTICS 📊</div>
        <div className="grid grid-cols-3 gap-6">
          <div className="kpi-card">
            <div className="text-5xl font-black text-green-400 mb-3">${kpi.ggr}</div>
            <div className="text-white font-bold text-lg">Gross Gaming Revenue</div>
            <div className="text-green-300 text-sm opacity-80 mt-2">Total house edge</div>
          </div>
          <div className="kpi-card">
            <div className="text-5xl font-black text-blue-400 mb-3">{(kpi.rtp * 100).toFixed(1)}%</div>
            <div className="text-white font-bold text-lg">Return to Player</div>
            <div className="text-blue-300 text-sm opacity-80 mt-2">Player payout rate</div>
          </div>
          <div className="kpi-card">
            <div className="text-5xl font-black text-orange-400 mb-3">{kpi.rounds}</div>
            <div className="text-white font-bold text-lg">Total Rounds</div>
            <div className="text-orange-300 text-sm opacity-80 mt-2">Games played</div>
          </div>
        </div>
      </div>
      
      <div className="glass-effect p-8 rounded-3xl neon-glow">
        <div className="text-3xl font-bold text-yellow-400 mb-8 text-center text-shadow-gold">🎮 GAME CONFIGURATION 🎮</div>
        
        <div className="flex gap-8 items-center justify-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Select Game</label>
            <select 
              value={game} 
              onChange={e=>setGame(e.target.value)} 
              className="input w-48 text-center text-xl font-bold"
            >
              <option value="slots">🎰 Royal Slots</option>
              <option value="roulette">🎡 Roulette Royale</option>
              <option value="blackjack">🂡 Blackjack Royale</option>
              <option value="baccarat">🂢 Baccarat Royale</option>
              <option value="crash">🚀 Crash Royale</option>
            </select>
          </div>
          
          <button 
            onClick={save} 
            className="btn-primary text-2xl px-12 py-6"
            style={{minWidth: '200px'}}
          >
            <span className="flex items-center gap-3">
              <div className="text-3xl">💾</div>
              <span className="font-black">SAVE CONFIG</span>
            </span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-yellow-400 font-bold text-lg uppercase tracking-wide">Target RTP (%)</label>
            <input 
              type="number" 
              step="0.001" 
              value={conf.target_rtp} 
              onChange={e=>setConf({...conf, target_rtp: parseFloat(e.target.value)})} 
              className="input w-full text-center text-2xl font-bold" 
            />
            <div className="text-yellow-300 text-sm opacity-70">Return to Player percentage</div>
          </div>
          
          <div className="space-y-4">
            <label className="text-yellow-400 font-bold text-lg uppercase tracking-wide">Volatility</label>
            <input 
              type="number" 
              step="0.1" 
              value={conf.volatility} 
              onChange={e=>setConf({...conf, volatility: parseFloat(e.target.value)})} 
              className="input w-full text-center text-2xl font-bold" 
            />
            <div className="text-yellow-300 text-sm opacity-70">Game variance level</div>
          </div>
          
          <div className="space-y-4">
            <label className="text-yellow-400 font-bold text-lg uppercase tracking-wide">Min Bet ($)</label>
            <input 
              type="number" 
              value={conf.min_bet} 
              onChange={e=>setConf({...conf, min_bet: parseFloat(e.target.value)})} 
              className="input w-full text-center text-2xl font-bold" 
            />
            <div className="text-yellow-300 text-sm opacity-70">Minimum bet amount</div>
          </div>
          
          <div className="space-y-4">
            <label className="text-yellow-400 font-bold text-lg uppercase tracking-wide">Max Bet ($)</label>
            <input 
              type="number" 
              value={conf.max_bet} 
              onChange={e=>setConf({...conf, max_bet: parseFloat(e.target.value)})} 
              className="input w-full text-center text-2xl font-bold" 
            />
            <div className="text-yellow-300 text-sm opacity-70">Maximum bet amount</div>
          </div>
        </div>
      </div>
    </div>
  )
}
