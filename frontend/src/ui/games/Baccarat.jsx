import React, { useState } from 'react'
import BaccaratRoadmaps from '../../components/BaccaratRoadmaps'
export default function Baccarat({onDone}){
  const api=window.CASINO_API
  const [stake,setStake]=useState(5)
  const [side,setSide]=useState('player')
  const [res,setRes]=useState(null)
  const [entries,setEntries]=useState([])
  const play= async()=>{
    const r = await fetch(`${api}/casino/baccarat/play`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD', params:{bet_on:side}})})
    const j = await r.json(); setRes(j); setEntries(prev=>[{winner:j.result.winner}, ...prev].slice(0,144)); onDone&&onDone()
  }
  return <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
        🂢 BACCARAT ROYALE 🂢
      </h2>
      <div className="text-xl text-yellow-300 opacity-90 font-semibold">Player • Banker • Tie</div>
    </div>
    
    <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow">
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="$50" 
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet On</label>
        <select 
          value={side} 
          onChange={e=>setSide(e.target.value)} 
          className="input w-40 text-center text-xl font-bold"
        >
          <option value="player">🎯 Player</option>
          <option value="banker">🏦 Banker</option>
          <option value="tie">🤝 Tie</option>
        </select>
      </div>
      
      <button 
        onClick={play} 
        className="btn-primary text-2xl px-12 py-6"
        style={{minWidth: '200px'}}
      >
        <span className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <span className="font-black">PLACE BET</span>
        </span>
      </button>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
        <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
          ${res?.payout?.toFixed(2)||'0.00'}
        </div>
      </div>
    </div>
    
    {res && <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
      <div className="grid grid-cols-2 gap-12">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">PLAYER HAND</div>
          <div className="flex gap-3 justify-center mb-6">
            {res.result?.player?.map((card, i) => (
              <div key={i} className="playing-card w-20 h-28 flex items-center justify-center text-2xl font-black animate-card-deal" style={{animationDelay: `${i * 0.3}s`}}>
                {card}
              </div>
            ))}
          </div>
          <div className="text-white font-bold text-xl bg-blue-900/50 rounded-xl p-3 inline-block border-2 border-blue-400">
            Total: <span className="text-blue-400 text-2xl">{res.result?.player_total}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">BANKER HAND</div>
          <div className="flex gap-3 justify-center mb-6">
            {res.result?.banker?.map((card, i) => (
              <div key={i} className="playing-card w-20 h-28 flex items-center justify-center text-2xl font-black animate-card-deal" style={{animationDelay: `${(i + 2) * 0.3}s`}}>
                {card}
              </div>
            ))}
          </div>
          <div className="text-white font-bold text-xl bg-red-900/50 rounded-xl p-3 inline-block border-2 border-red-400">
            Total: <span className="text-red-400 text-2xl">{res.result?.banker_total}</span>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <div className={`text-4xl font-black p-6 rounded-2xl ${
          res.result?.winner === 'player' ? 'text-blue-400 bg-blue-900/30 animate-pulse-win' :
          res.result?.winner === 'banker' ? 'text-red-400 bg-red-900/30 animate-pulse-win' :
          'text-green-400 bg-green-900/30 animate-pulse-win'
        }`}>
          {res.result?.winner === 'player' && '🎯 PLAYER WINS! 🎯'}
          {res.result?.winner === 'banker' && '🏦 BANKER WINS! 🏦'}
          {res.result?.winner === 'tie' && '🤝 TIE GAME! 🤝'}
        </div>
        {res.result?.winner === 'tie' && (
          <div className="text-5xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-4">
            💰 8:1 TIE PAYOUT! 💰
          </div>
        )}
      </div>
    </div>}
    
    <div className="space-y-6">
      <div className="text-3xl mb-4 text-yellow-400 font-bold text-center text-shadow-gold">
        📊 BACCARAT ROADMAPS 📊
      </div>
      <BaccaratRoadmaps entries={entries}/>
    </div>
    
    <div className="grid grid-cols-3 gap-6 text-center text-yellow-300">
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🎯</div>
        <div className="font-bold text-lg">Player Bet</div>
        <div className="text-blue-400 font-bold text-xl">1:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">No commission</div>
      </div>
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🏦</div>
        <div className="font-bold text-lg">Banker Bet</div>
        <div className="text-red-400 font-bold text-xl">1:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">5% commission</div>
      </div>
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🤝</div>
        <div className="font-bold text-lg">Tie Bet</div>
        <div className="text-green-400 font-bold text-xl">8:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">High risk, high reward</div>
      </div>
    </div>
  </div>
}
