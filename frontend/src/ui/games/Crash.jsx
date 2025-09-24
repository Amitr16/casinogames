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
  return <div className="space-y-6">
    <div className="flex gap-4 items-center justify-center p-4 bg-gradient-to-r from-red-700 to-orange-700 rounded-xl border-2 border-red-400">
      <input type="number" value={stake} onChange={e=>setStake(+e.target.value)} className="input w-24" placeholder="Stake" />
      <input type="number" step="0.1" value={auto} onChange={e=>setAuto(+e.target.value)} className="input w-32" placeholder="Auto Cashout" />
      <button onClick={play} className="btn bg-red-600 hover:bg-red-700 text-white border-red-500">🚀 Launch</button>
      <div className="text-xl font-bold text-yellow-400">Payout: <span className="font-mono">${res?.payout?.toFixed(2)||'0.00'}</span></div>
    </div>
    {res && <div className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-white/20 shadow-lg text-center">
      <div className="text-2xl font-bold text-yellow-400 mb-2">Crash Result</div>
      <div className="text-4xl font-bold text-white mb-2">{res.result?.multiplier?.toFixed(2)}x</div>
      {res.result?.auto_cashout && <div className="text-lg text-green-400">Auto Cashout: {res.result.auto_cashout}x</div>}
    </div>}
  </div>
}
