import React, { useState } from 'react'
export default function Crash({onDone}){
  const api=window.CASINO_API
  const [stake,setStake]=useState(1)
  const [auto,setAuto]=useState(2.0)
  const [res,setRes]=useState(null)
  const play= async()=>{
    const r = await fetch(`${api}/casino/crash/play`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD', params:{auto_cashout:auto}})})
    const j = await r.json(); setRes(j); onDone&&onDone()
  }
  return <div>
    <div className="flex gap-2 items-center mb-3">
      <input className="input" type="number" min="1" value={stake} onChange={e=>setStake(parseFloat(e.target.value||'1'))}/>
      <input className="input" type="number" step="0.1" value={auto} onChange={e=>setAuto(parseFloat(e.target.value||'2'))}/>
      <button className="btn-primary" onClick={play}>Go</button>
      <div className="text-sm opacity-60">Payout: ${res?.payout?.toFixed(2)||'0.00'}</div>
    </div>
  </div>
}
