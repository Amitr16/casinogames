import React, { useState } from 'react'
export default function SlotsReelEditor(){
  const [reels, setReels] = useState([['A','K','Q'],['Q','J','10'],['7','★','◆'],['A','K','Q'],['♣','A','K']])
  const addSymbol=(ri)=>{
    const s = prompt('Symbol?'); if(!s) return
    const next=[...reels]; next[ri]=[...next[ri], s]; setReels(next)
  }
  const exportJson=()=>{
    const data = { reels }
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'})
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='reels.json'; a.click()
  }
  return (
    <div className="space-y-3">
      <div className="text-sm opacity-70">Reel Editor</div>
      <div className="grid grid-cols-5 gap-2">
        {reels.map((col,ri)=>(
          <div key={ri} className="p-2 bg-white/10 rounded-2xl">
            <div className="text-xs opacity-70 mb-1">Reel {ri+1}</div>
            <div className="space-y-1">{col.map((s,si)=>(<div key={si} className="px-2 py-1 bg-black/30 rounded">{s}</div>))}</div>
            <button className="mt-2 px-2 py-1 bg-white/20 rounded" onClick={()=>addSymbol(ri)}>Add</button>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={exportJson}>Export</button>
    </div>
  )
}
