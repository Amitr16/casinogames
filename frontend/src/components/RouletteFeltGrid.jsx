import React, { useMemo, useState } from 'react'
import bets from '../assets/roulette_bets.json'
import felt from '../assets/svg/roulette_felt.svg'

export default function RouletteFeltGrid({chipValue=5, onPlace}){
  const [hover, setHover] = useState(null)
  const cellW = bets.meta.cell_w, cellH = bets.meta.cell_h
  const origin = bets.meta.inside_origin
  const singles = useMemo(()=>{
    const hs = []
    const grid = bets.numbers_layout
    for(let r=0;r<3;r++){
      for(let c=0;c<12;c++){
        const n = grid[r][c]
        const x = origin[0] + c*cellW
        const y = origin[1] + r*cellH
        hs.push({n, x, y, w:cellW, h:cellH})
      }
    }
    hs.push({n:0, x:60, y:200, w:100, h:360})
    return hs
  },[])
  return (
    <div className="relative bg-green-800 rounded-2xl p-6 shadow-2xl border-4 border-yellow-600">
      <div className="absolute inset-0 bg-gradient-radial from-green-700 to-green-900 rounded-2xl"></div>
      <img src={felt} className="w-[960px] h-[600px] object-contain select-none relative z-10" />
      {singles.map(h => (
        <div key={h.n}
          onMouseEnter={()=>setHover({type:'single', payout:35, selection:[h.n]})}
          onMouseLeave={()=>setHover(null)}
          onClick={()=>onPlace && onPlace({type:'single', value:h.n, numbers:[h.n], amount: chipValue})}
          className="absolute cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20"
          style={{left:h.x/1.5, top:h.y/1.5, width:h.w/1.5, height:h.h/1.5}}
        />
      ))}
      {hover && <div className="absolute left-4 top-4 bg-black/90 text-yellow-400 text-sm px-3 py-2 rounded-lg shadow-lg border border-yellow-400 z-30">{hover.type} • payout {hover.payout}:1</div>}
    </div>
  )
}
