import React, { useState } from 'react'
import RouletteFeltGrid from '../../components/RouletteFeltGrid'

function RoulettePro({onDone}){
  const api = window.CASINO_API
  const [bets,setBets]=useState([])
  const [chip,setChip]=useState(5)
  const [res,setRes]=useState(null)
  const [spinning,setSpinning]=useState(false)
  const [wheelRotation,setWheelRotation]=useState(0)
  const place = (b)=> setBets(prev=>[...prev,b])
  const spin = async()=>{
    setSpinning(true)
    setWheelRotation(prev => prev + 1800 + Math.random() * 720)
    
    try {
      const r = await fetch(`${api}/casino/roulette/spin`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake:1,currency:'USD', params:{bets}})})
      
      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`)
      }
      
      const j = await r.json()
      
      if (j && j.result && j.result.spin) {
        setTimeout(() => {
          setRes(j)
          setSpinning(false)
          onDone&&onDone()
        }, 3000)
      } else {
        console.error('Invalid response structure:', j)
        setTimeout(() => {
          setSpinning(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Roulette spin error:', error)
      setTimeout(() => {
        setSpinning(false)
      }, 3000)
    }
  }
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
          🎡 ROULETTE ROYALE 🎡
        </h2>
        <div className="text-xl text-yellow-300 opacity-90 font-semibold">Place Your Bets • Spin the Wheel of Fortune</div>
      </div>
      
      <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow flex-wrap">
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Chip Value</label>
          <input 
            type="number" 
            value={chip} 
            onChange={e=>setChip(+e.target.value)} 
            className="input w-36 text-center text-2xl font-bold" 
            placeholder="$5" 
          />
        </div>
        
        <button 
          onClick={()=>setBets([])} 
          className="btn bg-red-600 hover:bg-red-700 text-white border-red-500 text-xl px-8 py-4"
        >
          <span className="flex items-center gap-2">
            <div className="text-2xl">🗑️</div>
            <span className="font-black">CLEAR</span>
          </span>
        </button>
        
        <button 
          onClick={spin} 
          disabled={spinning}
          className="btn-primary text-2xl px-12 py-6"
          style={{
            minWidth: '200px',
            opacity: spinning ? 0.6 : 1,
            transform: spinning ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <span className="flex items-center gap-3">
            <div className="text-3xl" style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: spinning ? 'none' : 'transform 0.5s ease'
            }}>🎡</div>
            <span className="font-black">
              {spinning ? 'SPINNING...' : 'SPIN WHEEL'}
            </span>
          </span>
        </button>
      </div>
      
      {/* Enhanced Professional Roulette Wheel - Always Visible */}
      <div style={{
        position: 'relative',
        width: '1000px',
        height: '1000px',
        margin: '20px auto',
        background: 'radial-gradient(circle, #8B4513 0%, #654321 30%, #2F1B14 100%)',
        borderRadius: '50%',
        border: '30px solid #FFD700',
        boxShadow: '0 0 120px rgba(255, 215, 0, 0.9), inset 0 0 80px rgba(0,0,0,0.6)',
        overflow: 'visible'
      }}>
        {/* Rotating Container - All elements rotate together */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '900px',
          height: '900px',
          transform: `translate(-50%, -50%) rotate(${wheelRotation}deg)`,
          transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
        }}>
          {/* Outer Ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '900px',
            height: '900px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '20px solid #B8860B',
            background: 'radial-gradient(circle, #DAA520 0%, #B8860B 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4)'
          }}>
            {/* Main Wheel with Numbers */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '820px',
              height: '820px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: '#2F1B14',
              border: '10px solid #FFD700',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.6)'
            }}>
              {/* Number Segments - Combined colored background and number display */}
              {[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26].map((num, i) => {
                const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
                const angle = i * (360/37);
                const segmentColor = num === 0 ? '#228B22' : isRed ? '#DC143C' : '#000000';
                
                return (
                  <div key={num} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -339px)`
                  }}>
                    {/* Colored Segment Background */}
                    <div style={{
                      width: '0',
                      height: '0',
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: `339px solid ${segmentColor}`,
                      opacity: 0.9
                    }} />
                    
                    {/* Number Display - positioned relative to segment */}
                    <div style={{
                      position: 'absolute',
                      top: '70px',
                      left: '50%',
                      transform: `translateX(-50%) rotate(${-angle}deg)`,
                      color: '#FFFFFF',
                      fontSize: '18px',
                      fontWeight: '900',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
                      background: `radial-gradient(circle, ${segmentColor}, ${segmentColor === '#228B22' ? '#006400' : segmentColor === '#DC143C' ? '#8B0000' : '#000000'})`,
                      width: '35px',
                      height: '25px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFD700',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.2)',
                      zIndex: 10
                    }}>
                      {num}
                    </div>
                  </div>
                );
              })}
              
              {/* Divider Lines */}
              {Array.from({length: 37}).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '3px',
                    height: '359px',
                    background: 'linear-gradient(to bottom, #FFD700, #B8860B)',
                    transformOrigin: '1.5px 179.5px',
                    transform: `translate(-50%, -50%) rotate(${i * (360/37)}deg) translate(-1.5px, -179.5px)`,
                    zIndex: 5
                  }}
                />
              ))}
            </div>
            
            {/* Center Hub */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, #FFD700 0%, #DAA520 50%, #B8860B 100%)',
              borderRadius: '50%',
              border: '16px solid #FFF8DC',
              boxShadow: '0 0 50px rgba(255,215,0,0.9), inset 0 0 30px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              zIndex: 20
            }}>
              🎰
            </div>
          </div>
        </div>
        
        {/* Animated Ball - Realistic Physics - Outside rotating container */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transformOrigin: '0 0',
          transform: spinning 
            ? `translate(-50%, -50%) rotate(${-wheelRotation * 1.5}deg) translate(0, -420px)`
            : res 
              ? `translate(-50%, -50%) rotate(${res.result.spin.pocket * (360/37)}deg) translate(0, -420px)`
              : 'translate(-50%, -50%) rotate(0deg) translate(0, -420px)',
          width: '32px',
          height: '32px',
          background: 'radial-gradient(circle, #FFFFFF 0%, #E0E0E0 70%, #C0C0C0 100%)',
          borderRadius: '50%',
          border: '6px solid #C0C0C0',
          boxShadow: '0 0 40px rgba(255,255,255,0.9), 0 10px 20px rgba(0,0,0,0.4)',
          transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.5s ease-out',
          zIndex: 25
        }} />
        
        {/* Outer Decorative Ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1068px',
          height: '1068px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '8px solid #8B4513',
          background: 'conic-gradient(from 0deg, #DAA520, #FFD700, #DAA520, #B8860B, #DAA520)',
          opacity: 0.4,
          zIndex: 1
        }} />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="casino-felt p-6 rounded-3xl border-4 border-yellow-600 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-yellow-400 text-shadow-gold">BETTING TABLE</div>
            </div>
            <RouletteFeltGrid chipValue={chip} onPlace={place}/>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-3xl neon-glow">
            <div className="text-yellow-400 font-bold text-xl mb-4 text-center text-shadow-gold">💰 BET SLIP 💰</div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center text-yellow-300 opacity-60 py-4">
                  No bets placed yet. Click on the table to place bets!
                </div>
              ) : (
                bets.map((b,i) => (
                  <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-yellow-500/30" style={{
                    animation: `chipPlace 0.5s ease-out ${i * 0.1}s both`
                  }}>
                    <span className="text-white font-semibold">{b.type}: <span className="text-yellow-400">{JSON.stringify(b.value||b.numbers)}</span></span>
                    <div className="chip text-sm font-bold text-white flex items-center justify-center w-12 h-12" style={{
                      background: `radial-gradient(circle, ${b.amount >= 100 ? '#8B0000' : b.amount >= 50 ? '#006400' : b.amount >= 25 ? '#000080' : '#8B4513'}, #000)`,
                      border: '3px solid #FFD700',
                      borderRadius: '50%',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                      transform: 'perspective(100px) rotateX(15deg)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'perspective(100px) rotateX(15deg) translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'perspective(100px) rotateX(15deg) translateY(0px)'
                    }}>
                      ${b.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-yellow-500/30 flex justify-between items-center">
              <span className="text-white font-bold text-lg">Total Bet:</span>
              <div className="balance-display text-xl">
                ${bets.reduce((sum,b)=>sum+b.amount,0)}
              </div>
            </div>
          </div>
          
          {res && <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-green-800/50"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-yellow-400 mb-6 text-shadow-gold">🎯 WINNING NUMBER 🎯</div>
              <div className={`text-8xl font-black mb-4 p-6 rounded-full border-4 inline-block ${
                res.result.spin.color === 'red' ? 'text-red-400 border-red-400 bg-red-900/30' :
                res.result.spin.color === 'black' ? 'text-white border-white bg-gray-900/30' :
                'text-green-400 border-green-400 bg-green-900/30'
              } animate-pulse-win`}>
                {res.result.spin.pocket}
              </div>
              <div className={`text-2xl font-bold mb-4 ${
                res.result.spin.color === 'red' ? 'text-red-400' :
                res.result.spin.color === 'black' ? 'text-white' :
                'text-green-400'
              }`}>
                {res.result.spin.color?.toUpperCase()}
              </div>
              {res.payout > 0 && (
                <div className="text-4xl font-black text-yellow-400 text-shadow-gold animate-jackpot">
                  🎉 WINNER! 🎉
                </div>
              )}
            </div>
          </div>}
          
          <div className="grid grid-cols-1 gap-4 text-center text-yellow-300">
            <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🔴</div>
              <div className="font-semibold">Red/Black</div>
              <div className="text-yellow-400 font-bold">1:1 Payout</div>
            </div>
            <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🔢</div>
              <div className="font-semibold">Straight Up</div>
              <div className="text-yellow-400 font-bold">35:1 Payout</div>
            </div>
            <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">Dozens</div>
              <div className="text-yellow-400 font-bold">2:1 Payout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoulettePro;
