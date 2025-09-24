import React, { useState } from 'react'
export default function Crash({onDone}){
  const api=window.CASINO_API
  const [stake,setStake]=useState(1)
  const [auto,setAuto]=useState(2.0)
  const [res,setRes]=useState(null)
  const [isFlying,setIsFlying]=useState(false)
  const [currentMultiplier,setCurrentMultiplier]=useState(1.0)
  const play= async()=>{
    setIsFlying(true)
    setCurrentMultiplier(1.0)
    setRes(null)
    
    const flightInterval = setInterval(() => {
      setCurrentMultiplier(prev => prev + 0.05)
    }, 100)
    
    const r = await fetch(`${api}/casino/crash/play`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD', params:{auto_cashout:auto}})})
    const j = await r.json()
    
    clearInterval(flightInterval)
    setTimeout(() => {
      setIsFlying(false)
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
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
        <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
          ${res?.payout?.toFixed(2)||'0.00'}
        </div>
      </div>
    </div>
    
    {/* Rocket Flight Animation Area */}
    {isFlying && (
      <div className="relative h-96 bg-gradient-to-b from-blue-900 to-purple-900 rounded-3xl border-4 border-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
        
        {/* Flying Rocket */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl transition-all duration-100 ease-linear"
          style={{
            transform: `translateX(-50%) translateY(-${Math.min(currentMultiplier * 20, 320)}px)`,
            animation: 'rocketFly 0.1s ease-in-out infinite alternate'
          }}
        >
          🚀
        </div>
        
        {/* Multiplier Display */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-6xl font-black text-yellow-400 text-shadow-gold animate-pulse">
          {currentMultiplier.toFixed(2)}x
        </div>
        
        {/* Flight Trail */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 bg-gradient-to-t from-orange-500 to-transparent opacity-70"
          style={{
            height: `${Math.min(currentMultiplier * 20, 320)}px`,
            animation: 'trailGlow 0.5s ease-in-out infinite alternate'
          }}
        ></div>
        
        {/* Stars Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
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
          {res.payout > 0 ? '🎉 SUCCESSFUL FLIGHT! 🎉' : '💥 ROCKET CRASHED! 💥'}
        </div>
        
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
