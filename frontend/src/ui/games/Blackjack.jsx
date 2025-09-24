import React, { useState, useMemo } from 'react'
import BlackjackAdvanced from '../../components/BlackjackAdvanced'
export default function Blackjack({onDone}){
  const api = window.CASINO_API
  const headers={'Content-Type':'application/json','X-User-Id':'demo-user'}
  const [stake,setStake]=useState(5)
  const [state,setState]=useState(null)
  const [res,setRes]=useState(null)
  const call = async(action)=>{
    const body = {stake, currency:'USD', action, state, params:{ref:state?.ref}}
    const r = await fetch(`${api}/casino/blackjack/play`, {method:'POST', headers, body: JSON.stringify(body)})
    const j = await r.json(); setRes(j); setState(j.result); onDone&&onDone()
  }
  const allowed = useMemo(()=>{
    const s = state||{}
    const final = s.final
    const can = {hit:false, stand:false, double:false, split:false, insurance:false, surrender:false}
    if(!s.player || final) return can
    const pv = s.pv||0
    can.hit = pv<21
    can.stand = true
    can.double = s.player?.length===2
    can.split = s.player?.length===2 && s.player[0]===s.player[1]
    can.insurance = (s.dealer && s.dealer[0]==='A' && s.player?.length===2)
    can.surrender = s.player?.length===2
    return can
  },[state])
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
          🂡 BLACKJACK ROYALE 🂡
        </h2>
        <div className="text-xl text-yellow-300 opacity-90 font-semibold">Beat the Dealer • Get 21</div>
      </div>
      
      <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow flex-wrap">
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
          <input 
            type="number" 
            min="1" 
            value={stake} 
            onChange={e=>setStake(parseFloat(e.target.value||'1'))} 
            className="input w-36 text-center text-2xl font-bold" 
            placeholder="$25" 
          />
        </div>
        
        <button 
          onClick={()=>call('deal')} 
          className="btn-primary text-2xl px-12 py-6"
          style={{minWidth: '200px'}}
        >
          <span className="flex items-center gap-3">
            <div className="text-3xl">🂡</div>
            <span className="font-black">DEAL CARDS</span>
          </span>
        </button>
        
        <BlackjackAdvanced allowed={allowed} onAction={name=>call(name)}/>
        
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
          <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
            ${res?.payout?.toFixed(2)||'0.00'}
          </div>
        </div>
      </div>
      
      {state && <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">DEALER HAND</div>
            <div className="flex gap-3 justify-center mb-6 flex-wrap">
              {Array.isArray(state.dealer) && state.dealer.map((card, i) => (
                <div key={i} className="playing-card w-20 h-28 flex items-center justify-center text-2xl font-black animate-card-deal" style={{animationDelay: `${i * 0.2}s`}}>
                  {card}
                </div>
              ))}
            </div>
            <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
              Total: <span className="text-yellow-400 text-2xl">{state.dv}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">YOUR HAND</div>
            <div className="flex gap-3 justify-center mb-6 flex-wrap">
              {state.player?.map((card, i) => (
                <div key={i} className="playing-card w-20 h-28 flex items-center justify-center text-2xl font-black animate-card-deal" style={{animationDelay: `${(i + 2) * 0.2}s`}}>
                  {card}
                </div>
              ))}
            </div>
            <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
              Total: <span className="text-yellow-400 text-2xl">{state.pv}</span>
            </div>
          </div>
        </div>
        
        {state.final && (
          <div className="text-center mt-8">
            <div className={`text-4xl font-black p-6 rounded-2xl ${
              res?.payout > 0 ? 'text-green-400 bg-green-900/30 animate-pulse-win' : 'text-red-400 bg-red-900/30'
            }`}>
              {res?.payout > 0 ? '🎉 YOU WIN! 🎉' : '💔 DEALER WINS 💔'}
            </div>
            {state.pv === 21 && state.player?.length === 2 && (
              <div className="text-6xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-4">
                ♠️ BLACKJACK! ♠️
              </div>
            )}
          </div>
        )}
      </div>}
      
      <div className="grid grid-cols-4 gap-4 text-center text-yellow-300">
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🂡</div>
          <div className="font-semibold">Blackjack</div>
          <div className="text-yellow-400 font-bold">3:2 Payout</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🃏</div>
          <div className="font-semibold">Regular Win</div>
          <div className="text-yellow-400 font-bold">1:1 Payout</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🤝</div>
          <div className="font-semibold">Push</div>
          <div className="text-yellow-400 font-bold">Bet Returned</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">💥</div>
          <div className="font-semibold">Bust</div>
          <div className="text-red-400 font-bold">Lose Bet</div>
        </div>
      </div>
    </div>
  )
}
