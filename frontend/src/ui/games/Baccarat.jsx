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
  return <div className="space-y-6">
    <div className="flex gap-4 items-center justify-center p-4 bg-gradient-to-r from-green-700 to-green-800 rounded-xl border-2 border-yellow-400">
      <input type="number" value={stake} onChange={e=>setStake(+e.target.value)} className="input w-24" placeholder="Stake" />
      <select value={side} onChange={e=>setSide(e.target.value)} className="input w-32">
        <option value="player">Player</option>
        <option value="banker">Banker</option>
        <option value="tie">Tie</option>
      </select>
      <button onClick={play} className="btn-primary">🎯 Play</button>
      <div className="text-xl font-bold text-yellow-400">Payout: <span className="font-mono">${res?.payout?.toFixed(2)||'0.00'}</span></div>
    </div>
    {res && <div className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-white/20 shadow-lg">
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg mb-2">Player Cards</div>
          <div className="flex gap-2 justify-center">
            {res.result?.player?.map((card, i) => (
              <div key={i} className="w-12 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold animate-card-deal">
                {card}
              </div>
            ))}
          </div>
          <div className="text-white font-semibold mt-2">Total: {res.result?.player_total}</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg mb-2">Banker Cards</div>
          <div className="flex gap-2 justify-center">
            {res.result?.banker?.map((card, i) => (
              <div key={i} className="w-12 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold animate-card-deal">
                {card}
              </div>
            ))}
          </div>
          <div className="text-white font-semibold mt-2">Total: {res.result?.banker_total}</div>
        </div>
      </div>
      <div className="text-center mt-4">
        <div className="text-2xl font-bold text-yellow-400">Winner: <span className="text-white capitalize">{res.result?.winner}</span></div>
      </div>
    </div>}
    <div>
      <div className="text-xl mb-3 text-yellow-400 font-bold text-center">Baccarat Roadmaps</div>
      <BaccaratRoadmaps entries={entries}/>
    </div>
  </div>
}
