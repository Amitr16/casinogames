import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config.js'
import Blackjack from './games/Blackjack'
import Baccarat from './games/Baccarat'
import Slots from './games/Slots'
import Crash from './games/Crash'
import RoulettePro from './games/RoulettePro'

const TABS=[
  {key:'roulette-pro', label:'🎡 Roulette'},
  {key:'blackjack', label:'🂡 Blackjack'},
  {key:'baccarat', label:'🂢 Baccarat'},
  {key:'slots', label:'🎰 Slots'},
  {key:'crash', label:'🚀 Crash'}
]

export default function App(){
  const [tab,setTab]=useState('roulette-pro')
  const api = API_BASE_URL
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
            {tab==='roulette-pro' && <RoulettePro onDone={refreshBalance}/>}
            {tab==='blackjack' && <Blackjack onDone={refreshBalance}/>}
            {tab==='baccarat' && <Baccarat onDone={refreshBalance}/>}
            {tab==='slots' && <Slots onDone={refreshBalance}/>}
            {tab==='crash' && <Crash onDone={refreshBalance}/>}
          </div>
        </main>
      </div>
    </div>
  )
}

