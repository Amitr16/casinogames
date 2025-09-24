import React, { useState } from 'react'
import RouletteFeltGrid from '../../components/RouletteFeltGrid'
export default function RoulettePro({onDone}){
  const api = window.CASINO_API
  const [bets,setBets]=useState([])
  const [chip,setChip]=useState(5)
  const [res,setRes]=useState(null)
  const place = (b)=> setBets(prev=>[...prev,b])
  const spin = async()=>{
    const r = await fetch(`${api}/casino/roulette/spin`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake:1,currency:'USD', params:{bets}})})
    const j = await r.json(); setRes(j); onDone&&onDone()
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
          className="btn-primary text-2xl px-12 py-6"
          style={{minWidth: '200px'}}
        >
          <span className="flex items-center gap-3">
            <div className="text-3xl">🎡</div>
            <span className="font-black">SPIN WHEEL</span>
          </span>
        </button>
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
                  <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-yellow-500/30">
                    <span className="text-white font-semibold">{b.type}: <span className="text-yellow-400">{JSON.stringify(b.value||b.numbers)}</span></span>
                    <div className="chip text-sm font-bold text-white flex items-center justify-center w-12 h-12">
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
