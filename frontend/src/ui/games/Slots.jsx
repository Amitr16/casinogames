import React, { useState } from 'react'
export default function Slots({onDone}){
  const api = window.CASINO_API
  const [stake,setStake]=useState(1)
  const [spinning,setSpinning]=useState(false)
  const [reelStates,setReelStates]=useState([false, false, false, false, false])
  const [res,setRes]=useState(null)
  
  const spinningSymbols = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '💎', '🍀', '⭐', '🎯']
  
  const spin = async()=>{
    setSpinning(true)
    setReelStates([true, true, true, true, true])
    
    const r = await fetch(`${api}/casino/slots/spin`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD'})})
    const j = await r.json()
    setRes(j)
    
    setTimeout(() => setReelStates(prev => [false, ...prev.slice(1)]), 2000)
    setTimeout(() => setReelStates(prev => [prev[0], false, ...prev.slice(2)]), 2500)
    setTimeout(() => setReelStates(prev => [prev[0], prev[1], false, ...prev.slice(3)]), 3000)
    setTimeout(() => setReelStates(prev => [prev[0], prev[1], prev[2], false, prev[4]]), 3500)
    setTimeout(() => {
      setReelStates([false, false, false, false, false])
      setSpinning(false)
      onDone&&onDone()
    }, 4000)
  }
  const reels = res?.result?.reels || []
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '3rem',
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
        marginBottom: '16px',
        animation: 'glow-pulse 2s ease-in-out infinite alternate'
      }}>
        🎰 ROYAL SLOTS PALACE 🎰
      </h2>
      <div style={{
        fontSize: '1.25rem',
        color: '#fde047',
        opacity: 0.9,
        fontWeight: '600'
      }}>Spin the Reels of Fortune</div>
    </div>
    
    <div style={{
      display: 'flex',
      gap: '32px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '24px',
      boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <label style={{
          color: '#fbbf24',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          placeholder="$10"
          style={{
            width: '144px',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(255, 215, 0, 0.5)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#FFD700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          }}
        />
      </div>
      
      <button 
        onClick={spin} 
        disabled={spinning}
        style={{
          minWidth: '200px',
          fontSize: '1.5rem',
          padding: '24px 48px',
          borderRadius: '12px',
          border: spinning ? '2px solid rgba(255, 215, 0, 0.3)' : '2px solid #FFD700',
          background: spinning 
            ? 'rgba(0, 0, 0, 0.3)'
            : 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
          color: spinning ? '#FFD700' : '#000',
          cursor: spinning ? 'not-allowed' : 'pointer',
          opacity: spinning ? 0.5 : 1,
          fontWeight: '900',
          boxShadow: spinning 
            ? '0 4px 15px rgba(0, 0, 0, 0.3)'
            : '0 0 30px rgba(255, 215, 0, 0.6)',
          transition: 'all 0.3s ease'
        }}
      >
        {spinning ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🎰</div>
            <span>SPINNING...</span>
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem' }}>🎰</div>
            <span>SPIN TO WIN</span>
          </span>
        )}
      </button>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <label style={{
          color: '#fbbf24',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>Total Win</label>
        <div style={{
          fontSize: '2rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          padding: '12px 24px',
          border: '2px solid rgba(255, 215, 0, 0.5)',
          borderRadius: '20px',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
          animation: res?.payout > 0 ? 'pulse-win 1s ease-in-out infinite' : 'none'
        }}>
          ${res?.payout?.toFixed(2)||'0.00'}
        </div>
      </div>
    </div>
    
    <div style={{ position: 'relative', padding: '32px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '24px',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '32px',
        borderRadius: '24px',
        border: '4px solid rgba(255, 215, 0, 0.5)',
        boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
      }}>
        {reels.map((col,ci)=>(
          <div key={ci} style={{
            width: '128px',
            height: '192px',
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8) 0%, rgba(218, 165, 32, 0.6) 100%)',
            borderRadius: '16px',
            border: '3px solid rgba(255, 215, 0, 0.7)',
            overflow: 'hidden',
            boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            {reelStates[ci] ? (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fastReelSpin 0.05s linear infinite',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0
                  }}
                >
                  {[...Array(30)].map((_, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        height: '64px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '900',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                        filter: 'blur(4px) brightness(1.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                        opacity: 0.8
                      }}
                    >
                      {spinningSymbols[idx % spinningSymbols.length]}
                    </div>
                  ))}
                </div>
                
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      linear-gradient(to bottom, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.1) 20%, 
                        rgba(255, 255, 255, 0.2) 50%, 
                        rgba(255, 255, 255, 0.1) 80%, 
                        transparent 100%
                      )
                    `,
                    animation: 'motionBlur 0.1s linear infinite',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            ) : (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.5s ease-out'
                }}
              >
                {col.map((s,ri)=>(
                  <div 
                    key={ri} 
                    style={{
                      height: '64px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      fontWeight: '900',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                      filter: 'blur(0px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '80px',
        background: 'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.3), transparent)',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        borderTop: '4px solid rgba(255, 215, 0, 0.6)',
        borderBottom: '4px solid rgba(255, 215, 0, 0.6)',
        borderRadius: '8px'
      }}></div>
    </div>
    
    {res?.payout > 0 && (
      <div className="text-center animate-jackpot p-8 glass-effect rounded-3xl neon-glow">
        <div className="text-8xl font-black text-yellow-400 text-shadow-gold animate-bounce mb-4">
          🎉 JACKPOT WINNER! 🎉
        </div>
        <div className="text-4xl text-yellow-300 font-bold">
          Congratulations! You won ${res.payout.toFixed(2)}!
        </div>
        <div className="text-xl text-yellow-200 mt-2 opacity-80">
          Fortune favors the bold!
        </div>
      </div>
    )}
    
    <div className="grid grid-cols-5 gap-4 text-center text-yellow-300">
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2" style={{
          fontFamily: 'serif',
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>A</div>
        <div className="font-semibold">Ace</div>
        <div className="text-yellow-400 font-bold">5x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2" style={{
          fontFamily: 'serif',
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>K</div>
        <div className="font-semibold">King</div>
        <div className="text-yellow-400 font-bold">4x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2" style={{
          fontFamily: 'serif',
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>Q</div>
        <div className="font-semibold">Queen</div>
        <div className="text-yellow-400 font-bold">3x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2" style={{
          fontFamily: 'serif',
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>J</div>
        <div className="font-semibold">Jack</div>
        <div className="text-yellow-400 font-bold">2x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2">💎</div>
        <div className="font-semibold">Diamond</div>
        <div className="text-yellow-400 font-bold">10x Payout</div>
      </div>
    </div>
  </div>
}
