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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <RouletteFeltGrid chipValue={chip} onPlace={place}/>
        <div className="mt-6 flex gap-4 items-center justify-between p-4 bg-gradient-to-r from-green-700 to-green-800 rounded-xl border-2 border-yellow-400">
          <div className="text-yellow-400 font-semibold">Single • payout 35:1</div>
          <div className="flex gap-3">
            <input type="number" value={chip} onChange={e=>setChip(+e.target.value)} className="input w-24" placeholder="Chip" />
            <button onClick={()=>setBets([])} className="btn bg-red-600 hover:bg-red-700 text-white border-red-500">Clear</button>
            <button onClick={spin} className="btn-primary">🎯 Spin</button>
          </div>
        </div>
      </div>
      <div>
        <div className="text-xl mb-3 text-yellow-400 font-bold">Bet Slip</div>
        <div className="card">
          {bets.length===0 ? (
            <div className="text-white/60 text-center py-4">No bets</div>
          ) : (
            <div className="space-y-2">
              {bets.map((b,i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 bg-white/10 rounded-lg">
                  <span className="text-white font-medium">{b.type} {JSON.stringify(b.value||b.numbers)}</span>
                  <span className="text-yellow-400 font-bold">${b.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {res && <div className="mt-6 p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-white/20 shadow-lg">
          <div className="text-yellow-400 font-bold text-lg">Result: <span className="text-white">{res.result.spin.pocket}</span> ({res.result.spin.color})</div>
          <div className="text-yellow-400 font-bold text-lg">Payout: <span className="font-mono text-white">${res.payout?.toFixed(2)}</span></div>
        </div>}
      </div>
    </div>
  )
}
