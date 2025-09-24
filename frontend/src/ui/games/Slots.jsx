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
  return <div>
    <div className="flex gap-2 items-center mb-3">
      <input className="input" type="number" min="1" value={stake} onChange={e=>setStake(parseFloat(e.target.value||'1'))}/>
      <button className="btn-primary" onClick={spin} disabled={spinning}>{spinning?'Spinning…':'Spin'}</button>
      <div className="text-sm opacity-60">Win: ${res?.payout?.toFixed(2)||'0.00'}</div>
    </div>
    <div className="grid grid-cols-5 gap-2 p-3 bg-black/30 rounded-2xl border border-white/10">
      {reels.map((col,ci)=>(
        <div key={ci} className="w-24 h-36 overflow-hidden rounded-xl bg-white/5">
          <div className="flex flex-col transition-transform duration-700" style={{transform: spinning?'translateY(-100%)':'translateY(0)'}}>
            {col.map((s,ri)=>(<div key={ri} className="h-12 w-full flex items-center justify-center text-2xl">{s}</div>))}
          </div>
        </div>
      ))}
    </div>
    {res?.result?.wins?.length>0 && <pre className="text-xs opacity-70 mt-3">{JSON.stringify(res.result.wins, null, 2)}</pre>}
  </div>
}
