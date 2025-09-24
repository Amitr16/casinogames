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
        <div className="mt-3 flex gap-2">
          <button className="btn-ghost" onClick={()=>setBets([])}>Clear</button>
          <button className="btn-primary" onClick={spin}>Spin</button>
        </div>
      </div>
      <div>
        <div className="text-sm opacity-70 mb-2">Bet Slip</div>
        <div className="card">
          {bets.length===0? 'No bets' : bets.map((b,i)=>(<div key={i} className="text-sm">{b.type} {JSON.stringify(b.value||b.numbers)} — ${b.amount}</div>))}
        </div>
        {res && <div className="mt-3 card">
          <div>Result: <b>{res.result.spin.pocket}</b> ({res.result.spin.color})</div>
          <div>Payout: ${res.payout?.toFixed(2)}</div>
        </div>}
      </div>
    </div>
  )
}
