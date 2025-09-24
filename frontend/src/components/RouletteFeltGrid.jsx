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
    <div className="relative">
      <img src={felt} className="w-[960px] h-[600px] object-contain select-none" />
      {singles.map(h => (
        <div key={h.n}
          onMouseEnter={()=>setHover({type:'single', payout:35, selection:[h.n]})}
          onMouseLeave={()=>setHover(null)}
          onClick={()=>onPlace && onPlace({type:'single', value:h.n, numbers:[h.n], amount: chipValue})}
          className="absolute cursor-pointer"
          style={{left:h.x/1.5, top:h.y/1.5, width:h.w/1.5, height:h.h/1.5, background:'rgba(255,255,255,0.01)'}}
        />
      ))}
      {hover && <div className="absolute left-2 top-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{hover.type} • payout {hover.payout}:1</div>}
    </div>
  )
}
