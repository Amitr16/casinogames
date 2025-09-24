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
  return <div className="grid grid-cols-2 gap-4">
    <div>
      <div className="flex gap-2 items-center mb-3">
        <input className="input" type="number" min="1" value={stake} onChange={e=>setStake(parseFloat(e.target.value||'1'))}/>
        <select className="input" value={side} onChange={e=>setSide(e.target.value)}>
          <option value="player">Player</option><option value="banker">Banker</option><option value="tie">Tie</option>
        </select>
        <button className="btn-primary" onClick={play}>Play</button>
        <div className="text-sm opacity-60">Payout: ${res?.payout?.toFixed(2)||'0.00'}</div>
      </div>
      {res && <div className="space-y-2">
        <div>Player: {res.result.player?.join(' ')}</div>
        <div>Banker: {res.result.banker?.join(' ')}</div>
        <div>Winner: {res.result.winner}</div>
      </div>}
    </div>
    <div>
      <div className="text-sm opacity-70 mb-2">Roadmaps</div>
      <BaccaratRoadmaps entries={entries}/>
    </div>
  </div>
}
