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
    <div className="flex gap-4 items-center justify-center mb-6">
      <input type="number" value={stake} onChange={e=>setStake(+e.target.value)} className="input w-24" placeholder="Stake" />
      <button onClick={spin} disabled={spinning} className={`btn ${spinning ? 'btn-ghost opacity-50' : 'btn-primary'}`}>
        {spinning ? '🎰 Spinning...' : '🎰 Spin'}
      </button>
      <div className="text-xl font-bold text-yellow-400">Win: <span className="font-mono">${res?.payout?.toFixed(2)||'0.00'}</span></div>
    </div>
    <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl border-4 border-yellow-300 shadow-2xl mb-6">
      {reels.map((col,ci)=>(
        <div key={ci} className="w-24 h-36 overflow-hidden rounded-xl bg-white shadow-inner border-2 border-gray-300">
          <div className={`flex flex-col transition-transform duration-1000 ease-out ${spinning ? 'animate-spin-reel' : ''}`} 
               style={{transform: spinning?'translateY(-200%)':'translateY(0)'}}>
            {col.map((s,ri)=>(<div key={ri} className="h-12 w-full flex items-center justify-center text-3xl font-bold bg-white border-b border-gray-200 shadow-sm">{s}</div>))}
          </div>
        </div>
      ))}
    </div>
    {res?.result?.wins?.length>0 && <pre className="text-xs opacity-70 mt-3">{JSON.stringify(res.result.wins, null, 2)}</pre>}
  </div>
}
