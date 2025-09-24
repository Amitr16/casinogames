import React from 'react'
export default function BaccaratRoadmaps({entries=[]}){
  const cols = 24, rows = 6
  const grid = Array.from({length:rows}, ()=>Array(cols).fill(null))
  let c=0,r=0
  entries.forEach(e=>{ grid[r][c]=e; r+=1; if(r>=rows){ r=0; c+=1 } })
  return (
    <div className="p-2 bg-white/10 rounded-2xl">
      <div className="grid grid-cols-24 gap-[2px]">
        {grid.flat().map((e,i)=>{
          const color = !e? 'transparent' : e.winner==='player'?'#4da6ff':(e.winner==='banker'?'#ff4d6d':'#7cf5a0')
          return <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{background: e?color:'transparent'}}/>
        })}
      </div>
    </div>
  )
}
