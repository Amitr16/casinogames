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
      {state && <div className="space-y-2">
        <div>Dealer: {Array.isArray(state.dealer)? state.dealer.join(' ') : ''}</div>
        <div>Player: {state.player?.join(' ')}</div>
        <div>Total P/D: {state.pv} / {state.dv}</div>
      </div>}
    </div>
  )
}
