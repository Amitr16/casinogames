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
    <div>
      <div className="flex gap-2 items-center mb-3">
        <input className="input" type="number" min="1" value={stake} onChange={e=>setStake(parseFloat(e.target.value||'1'))}/>
        <button className="btn-primary" onClick={()=>call('deal')}>Deal</button>
        <BlackjackAdvanced allowed={allowed} onAction={name=>call(name)}/>
        <div className="text-sm opacity-60">Paid: ${res?.payout?.toFixed(2)||'0.00'}</div>
      </div>
      {state && <div className="space-y-6 p-6 bg-green-800 rounded-2xl shadow-2xl border-4 border-yellow-600">
        <div className="flex gap-4 items-center">
          <span className="text-yellow-400 font-bold text-lg">Dealer:</span>
          <div className="flex gap-2">
            {Array.isArray(state.dealer) && state.dealer.map((card, i) => (
              <div key={i} className="w-12 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold transform hover:scale-105 transition-transform animate-card-deal">
                {card}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-yellow-400 font-bold text-lg">Player:</span>
          <div className="flex gap-2">
            {state.player?.map((card, i) => (
              <div key={i} className="w-12 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold transform hover:scale-105 transition-transform animate-card-deal">
                {card}
              </div>
            ))}
          </div>
        </div>
        <div className="text-yellow-400 font-semibold text-lg">Total P/D: <span className="font-mono">{state.pv} / {state.dv}</span></div>
      </div>}
    </div>
  )
}
