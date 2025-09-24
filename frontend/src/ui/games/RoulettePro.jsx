import React, { useState } from 'react'
import RouletteFeltGrid from '../../components/RouletteFeltGrid'
export default function RoulettePro({onDone}){
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
    
    const r = await fetch(`${api}/casino/roulette/spin`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake:1,currency:'USD', params:{bets}})})
    const j = await r.json()
    
    setTimeout(() => {
      setRes(j)
      setSpinning(false)
      onDone&&onDone()
    }, 3000)
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
      
      {/* Roulette Wheel Animation Area */}
      {spinning && (
        <div className="relative h-96 bg-gradient-to-br from-green-900 to-green-800 rounded-full border-8 border-yellow-500 shadow-2xl overflow-hidden mx-auto" style={{width: '384px', height: '384px'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 animate-pulse rounded-full"></div>
          
          {/* Spinning Wheel */}
          <div 
            className="absolute inset-4 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-red-800 via-black to-red-800 shadow-inner"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              animation: spinning ? 'wheelSpin 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none',
              background: `conic-gradient(
                from 0deg,
                #dc2626 0deg, #dc2626 9.73deg,
                #000000 9.73deg, #000000 19.46deg,
                #dc2626 19.46deg, #dc2626 29.19deg,
                #000000 29.19deg, #000000 38.92deg,
                #dc2626 38.92deg, #dc2626 48.65deg,
                #000000 48.65deg, #000000 58.38deg,
                #dc2626 58.38deg, #dc2626 68.11deg,
                #000000 68.11deg, #000000 77.84deg,
                #dc2626 77.84deg, #dc2626 87.57deg,
                #000000 87.57deg, #000000 97.3deg,
                #dc2626 97.3deg, #dc2626 107.03deg,
                #000000 107.03deg, #000000 116.76deg,
                #dc2626 116.76deg, #dc2626 126.49deg,
                #000000 126.49deg, #000000 136.22deg,
                #dc2626 136.22deg, #dc2626 145.95deg,
                #000000 145.95deg, #000000 155.68deg,
                #dc2626 155.68deg, #dc2626 165.41deg,
                #000000 165.41deg, #000000 175.14deg,
                #dc2626 175.14deg, #dc2626 184.87deg,
                #000000 184.87deg, #000000 194.6deg,
                #dc2626 194.6deg, #dc2626 204.33deg,
                #000000 204.33deg, #000000 214.06deg,
                #dc2626 214.06deg, #dc2626 223.79deg,
                #000000 223.79deg, #000000 233.52deg,
                #dc2626 233.52deg, #dc2626 243.25deg,
                #000000 243.25deg, #000000 252.98deg,
                #dc2626 252.98deg, #dc2626 262.71deg,
                #000000 262.71deg, #000000 272.44deg,
                #dc2626 272.44deg, #dc2626 282.17deg,
                #000000 282.17deg, #000000 291.9deg,
                #dc2626 291.9deg, #dc2626 301.63deg,
                #000000 301.63deg, #000000 311.36deg,
                #dc2626 311.36deg, #dc2626 321.09deg,
                #000000 321.09deg, #000000 330.82deg,
                #dc2626 330.82deg, #dc2626 340.55deg,
                #000000 340.55deg, #000000 350.28deg,
                #dc2626 350.28deg, #dc2626 360deg
              )`
            }}
          >
            {/* Wheel Numbers */}
            {[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26].map((num, i) => (
              <div
                key={num}
                className="absolute text-white font-bold text-sm"
                style={{
                  transform: `rotate(${i * (360/37)}deg) translateY(-140px)`,
                  transformOrigin: '50% 150px',
                  color: num === 0 ? '#22c55e' : (num % 2 === 0 ? '#ffffff' : '#ffffff')
                }}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-4 border-yellow-300 shadow-lg flex items-center justify-center">
            <div className="text-2xl">🎡</div>
          </div>
          
          {/* Ball Pointer */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-300 animate-bounce"></div>
        </div>
      )}
      
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
