import React, { useState } from 'react'
export default function Crash({onDone}){
  const api=window.CASINO_API
  const [stake,setStake]=useState(1)
  const [auto,setAuto]=useState(2.0)
  const [res,setRes]=useState(null)
  const [isFlying,setIsFlying]=useState(false)
  const [currentMultiplier,setCurrentMultiplier]=useState(1.0)
  const [flightTime,setFlightTime]=useState(0)
  const [cashedOut,setCashedOut]=useState(false)
  const [cashoutMultiplier,setCashoutMultiplier]=useState(null)
  const [showExplosion,setShowExplosion]=useState(false)
  
  const cashOut = () => {
    if (isFlying && !cashedOut) {
      setCashedOut(true)
      setCashoutMultiplier(currentMultiplier)
    }
  }
  
  const play= async()=>{
    setIsFlying(true)
    setCurrentMultiplier(1.0)
    setFlightTime(0)
    setRes(null)
    setCashedOut(false)
    setCashoutMultiplier(null)
    setShowExplosion(false)
    
    const flightInterval = setInterval(() => {
      setCurrentMultiplier(prev => prev + 0.05)
      setFlightTime(prev => prev + 0.1)
    }, 100)
    
    const apiPromise = fetch(`${api}/casino/crash/play`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD', params:{auto_cashout:auto}})})
    
    setTimeout(async () => {
      clearInterval(flightInterval)
      
      if (!cashedOut) {
        setShowExplosion(true)
        setTimeout(() => setShowExplosion(false), 1000)
      }
      
      setIsFlying(false)
      setFlightTime(0)
      
      const r = await apiPromise
      const j = await r.json()
      
      if (cashedOut && cashoutMultiplier) {
        j.payout = stake * cashoutMultiplier
        j.result = { ...j.result, cashed_out: true, cashout_multiplier: cashoutMultiplier }
      }
      
      setRes(j)
      onDone&&onDone()
    }, 3000)
  }
  return <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
        🚀 CRASH ROYALE 🚀
      </h2>
      <div className="text-xl text-yellow-300 opacity-90 font-semibold">Ride the Rocket • Cash Out Before the Crash</div>
    </div>
    
    <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow">
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="$20" 
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Auto Cashout</label>
        <input 
          type="number" 
          step="0.1" 
          value={auto} 
          onChange={e=>setAuto(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="2.0x" 
        />
      </div>
      
      <button 
        onClick={play} 
        className="btn text-2xl px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-2 border-red-400"
        style={{minWidth: '200px'}}
      >
        <span className="flex items-center gap-3">
          <div className="text-3xl animate-bounce">🚀</div>
          <span className="font-black">LAUNCH</span>
        </span>
      </button>
      
      {/* Live Stake Display and Cashout Button */}
      {isFlying && !cashedOut && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-green-400 font-bold text-sm uppercase tracking-widest">Current Value</label>
          <div className="balance-display text-3xl font-black text-green-400 animate-pulse">
            ${(stake * currentMultiplier).toFixed(2)}
          </div>
          <button 
            onClick={cashOut}
            className="btn text-xl px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-2 border-green-400 animate-pulse"
          >
            💰 CASH OUT 💰
          </button>
        </div>
      )}
      
      {/* Cashed Out Display */}
      {cashedOut && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-green-400 font-bold text-sm uppercase tracking-widest">Cashed Out!</label>
          <div className="balance-display text-3xl font-black text-green-400 animate-pulse-win">
            ${(stake * cashoutMultiplier).toFixed(2)}
          </div>
          <div className="text-lg text-green-300 font-bold">
            @ {cashoutMultiplier.toFixed(2)}x
          </div>
        </div>
      )}
      
      {/* Final Result Display */}
      {!isFlying && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
          <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
            ${res?.payout?.toFixed(2)||'0.00'}
          </div>
        </div>
      )}
    </div>
    
    {/* Rocket Flight Animation Area */}
    {isFlying && (
      <div style={{
        position: 'relative',
        height: '400px',
        background: 'linear-gradient(to bottom, #1e3a8a, #581c87)',
        borderRadius: '24px',
        border: '4px solid #eab308',
        overflow: 'hidden',
        margin: '20px 0'
      }}>
        {/* Flying Rocket */}
        <div style={{
          position: 'absolute',
          bottom: `${20 + Math.min(currentMultiplier * 25, 350)}px`,
          left: `${Math.min(5 + currentMultiplier * 12, 75)}%`,
          fontSize: '60px',
          transition: 'all 0.1s ease-linear',
          transform: 'rotate(45deg)'
        }}>
          🚀
        </div>
        
        {/* Multiplier Display */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fbbf24',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          {currentMultiplier.toFixed(2)}x
        </div>
        
        {/* Diagonal Flight Trail */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '5%',
          width: `${Math.min(currentMultiplier * 12, 70)}%`,
          height: `${Math.min(currentMultiplier * 25, 350)}px`,
          background: `linear-gradient(45deg, #f97316 0%, rgba(249, 115, 22, 0.6) 30%, rgba(249, 115, 22, 0.3) 60%, transparent 100%)`,
          opacity: 0.8,
          clipPath: `polygon(0 100%, 6px 94%, ${Math.min(currentMultiplier * 12, 70)}% ${100 - Math.min(currentMultiplier * 22, 85)}%, ${Math.min(currentMultiplier * 8, 50)}% 100%)`
        }}></div>
        
        {/* Explosion Animation */}
        {showExplosion && (
          <div style={{
            position: 'absolute',
            bottom: `${20 + Math.min(currentMultiplier * 25, 350)}px`,
            left: `${Math.min(5 + currentMultiplier * 12, 75)}%`,
            transform: 'translate(-50%, 50%)',
            fontSize: '120px',
            animation: 'explosion 1s ease-out',
            zIndex: 10
          }}>
            💥
          </div>
        )}
        
        {/* Stars Background */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '4px',
          height: '4px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '3px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          width: '2px',
          height: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.7
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '25%',
          width: '3px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.5
        }}></div>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '70%',
          width: '2px',
          height: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>
      </div>
    )}
    
    {res && <div className="relative p-8 bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-3xl border-4 border-red-500 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse"></div>
      <div className="relative z-10 text-center">
        <div className="text-3xl font-bold text-yellow-400 mb-6 text-shadow-gold">🚀 CRASH RESULT 🚀</div>
        
        <div className="mb-8">
          <div className={`text-8xl font-black mb-4 ${
            res.result?.multiplier >= 2 ? 'text-green-400 animate-pulse-win' : 
            res.result?.multiplier >= 1.5 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {res.result?.multiplier?.toFixed(2)}x
          </div>
          
          {res.result?.auto_cashout && (
            <div className="text-2xl text-green-400 font-bold bg-green-900/30 rounded-xl p-4 inline-block border-2 border-green-400">
              ✅ Auto Cashout: {res.result.auto_cashout}x
            </div>
          )}
        </div>
        
        <div className={`text-4xl font-black p-6 rounded-2xl ${
          res.payout > 0 ? 'text-green-400 bg-green-900/30 animate-pulse-win' : 'text-red-400 bg-red-900/30'
        }`}>
          {res.result?.cashed_out ? '💰 CASHED OUT SAFELY! 💰' : 
           res.payout > 0 ? '🎉 SUCCESSFUL FLIGHT! 🎉' : '💥 ROCKET CRASHED! 💥'}
        </div>
        
        {res.result?.cashed_out && (
          <div className="text-2xl text-green-400 font-bold bg-green-900/30 rounded-xl p-4 inline-block border-2 border-green-400 mt-4">
            ✅ Cashed Out at: {res.result.cashout_multiplier?.toFixed(2)}x
          </div>
        )}
        
        {res.result?.multiplier >= 5 && (
          <div className="text-6xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-6">
            🌟 HIGH MULTIPLIER! 🌟
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 text-6xl animate-ball-bounce">
        {res.payout > 0 ? '🚀' : '💥'}
      </div>
    </div>}
    
    <div className="grid grid-cols-4 gap-4 text-center text-yellow-300">
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">🚀</div>
        <div className="font-semibold">Low Risk</div>
        <div className="text-green-400 font-bold">1.2x - 2.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">⭐</div>
        <div className="font-semibold">Medium Risk</div>
        <div className="text-yellow-400 font-bold">2.0x - 5.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">🔥</div>
        <div className="font-semibold">High Risk</div>
        <div className="text-orange-400 font-bold">5.0x - 10.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">💎</div>
        <div className="font-semibold">Extreme Risk</div>
        <div className="text-red-400 font-bold">10.0x+</div>
      </div>
    </div>
  </div>
}
