import React, { useState } from 'react'
export default function Slots({onDone}){
  const api = window.CASINO_API
  const [stake,setStake]=useState(1)
  const [spinning,setSpinning]=useState(false)
  const [res,setRes]=useState(null)
  const spin = async()=>{
    setSpinning(true)
    const r = await fetch(`${api}/casino/slots/spin`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD'})})
    const j = await r.json()
    setRes(j); setSpinning(false); onDone&&onDone()
  }
  const reels = res?.result?.reels || []
  return <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
        🎰 ROYAL SLOTS PALACE 🎰
      </h2>
      <div className="text-xl text-yellow-300 opacity-90 font-semibold">Spin the Reels of Fortune</div>
    </div>
    
    <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow">
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="$10" 
        />
      </div>
      
      <button 
        onClick={spin} 
        disabled={spinning} 
        className={`btn text-2xl px-12 py-6 ${spinning ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'}`}
        style={{minWidth: '200px'}}
      >
        {spinning ? (
          <span className="flex items-center gap-3">
            <div className="animate-spin text-3xl">🎰</div>
            <span className="font-black">SPINNING...</span>
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <div className="text-3xl">🎰</div>
            <span className="font-black">SPIN TO WIN</span>
          </span>
        )}
      </button>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
        <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
          ${res?.payout?.toFixed(2)||'0.00'}
        </div>
      </div>
    </div>
    
    <div className="reel-container relative">
      <div className="grid grid-cols-5 gap-6">
        {reels.map((col,ci)=>(
          <div key={ci} className="reel w-32 h-48">
            <div 
              className={`flex flex-col transition-all duration-3000 ease-out ${spinning ? 'animate-spin-reel' : ''}`} 
              style={{transform: spinning?'translateY(-200%)':'translateY(0)'}}
            >
              {col.map((s,ri)=>(
                <div 
                  key={ri} 
                  className="reel-symbol h-16 w-full flex items-center justify-center text-5xl font-black"
                  style={{
                    textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                    filter: spinning ? 'blur(3px)' : 'blur(0px)'
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute top-1/2 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent transform -translate-y-1/2 pointer-events-none border-y-4 border-yellow-400/60 rounded-lg"></div>
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
        <div className="text-4xl mb-2">🍒</div>
        <div className="font-semibold">Cherry</div>
        <div className="text-yellow-400 font-bold">2x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2">🍋</div>
        <div className="font-semibold">Lemon</div>
        <div className="text-yellow-400 font-bold">3x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2">🍊</div>
        <div className="font-semibold">Orange</div>
        <div className="text-yellow-400 font-bold">4x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2">🍇</div>
        <div className="font-semibold">Grapes</div>
        <div className="text-yellow-400 font-bold">5x Payout</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-2">💎</div>
        <div className="font-semibold">Diamond</div>
        <div className="text-yellow-400 font-bold">10x Payout</div>
      </div>
    </div>
  </div>
}
