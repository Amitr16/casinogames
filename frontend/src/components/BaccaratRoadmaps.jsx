import React from 'react'
export default function BaccaratRoadmaps({entries=[]}){
  const cols = 24, rows = 6
  const grid = Array.from({length:rows}, ()=>Array(cols).fill(null))
  let c=0,r=0
  entries.forEach(e=>{ grid[r][c]=e; r+=1; if(r>=rows){ r=0; c+=1 } })
  return (
    <div className="p-4 bg-gradient-to-br from-green-800 to-green-900 rounded-2xl border-2 border-yellow-600 shadow-2xl">
      <div className="grid grid-cols-24 gap-1">
        {grid.flat().map((e,i)=>{
          const color = !e? 'transparent' : e.winner==='player'?'#3b82f6':(e.winner==='banker'?'#ef4444':'#10b981')
          return <div key={i} className="w-4 h-4 rounded-full border border-white/30 shadow-sm transition-all duration-300 hover:scale-110" 
                      style={{background: e?color:'rgba(255,255,255,0.1)'}}/>
        })}
      </div>
    </div>
  )
}
