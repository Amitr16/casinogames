import React, { useMemo, useState } from 'react'
import bets from '../assets/roulette_bets.json'

const getNumberColor = (num) => {
  if (num === 0) return '#228B22'
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
  return redNumbers.includes(num) ? '#DC143C' : '#000000'
}

function RouletteFeltGrid({chipValue=5, onPlace}){
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
      
      <div className="relative" style={{ width: '1600px', height: '800px' }}>
        {singles.slice(0, -1).map(h => (
          <div key={h.n}
            onMouseEnter={()=>setHover({type:'single', payout:35, selection:[h.n]})}
            onMouseLeave={()=>setHover(null)}
            onClick={()=>onPlace && onPlace({type:'single', value:h.n, numbers:[h.n], amount: chipValue})}
            className="absolute cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-xl"
            style={{
              left: h.x/1.5, 
              top: h.y/1.5, 
              width: h.w/1.5, 
              height: h.h/1.5,
              backgroundColor: getNumberColor(h.n),
              border: '2px solid #FFD700'
            }}
          >
            {h.n}
          </div>
        ))}
        
        <div
          onMouseEnter={()=>setHover({type:'single', payout:35, selection:[0]})}
          onMouseLeave={()=>setHover(null)}
          onClick={()=>onPlace && onPlace({type:'single', value:0, numbers:[0], amount: chipValue})}
          className="absolute cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-2xl"
          style={{
            left: 40,
            top: 133,
            width: 67,
            height: 240,
            backgroundColor: '#228B22',
            border: '2px solid #FFD700'
          }}
        >
          0
        </div>
        
        <div className="absolute" style={{ left: '250px', top: '167px' }}>
          <div className="flex">
            <div
              onMouseEnter={()=>setHover({type:'red', payout:1, selection:'red'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'red', value:'red', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-lg"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#DC143C',
                border: '2px solid #FFD700',
                marginRight: '4px'
              }}
            >
              RED
            </div>
            <div
              onMouseEnter={()=>setHover({type:'black', payout:1, selection:'black'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'black', value:'black', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-lg"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#000000',
                border: '2px solid #FFD700'
              }}
            >
              BLACK
            </div>
          </div>
          
          <div className="flex mt-2">
            <div
              onMouseEnter={()=>setHover({type:'odd', payout:1, selection:'odd'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'odd', value:'odd', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#4A5568',
                border: '2px solid #FFD700',
                marginRight: '4px'
              }}
            >
              ODD
            </div>
            <div
              onMouseEnter={()=>setHover({type:'even', payout:1, selection:'even'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'even', value:'even', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#4A5568',
                border: '2px solid #FFD700'
              }}
            >
              EVEN
            </div>
          </div>
          
          <div className="flex mt-2">
            <div
              onMouseEnter={()=>setHover({type:'low', payout:1, selection:'1-18'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'low', value:'1-18', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#2D3748',
                border: '2px solid #FFD700',
                marginRight: '4px'
              }}
            >
              1-18
            </div>
            <div
              onMouseEnter={()=>setHover({type:'high', payout:1, selection:'19-36'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'high', value:'19-36', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#2D3748',
                border: '2px solid #FFD700'
              }}
            >
              19-36
            </div>
          </div>
        </div>
        
        <div className="absolute" style={{ left: '150px', top: '350px' }}>
          <div className="flex">
            <div
              onMouseEnter={()=>setHover({type:'dozen', payout:2, selection:'1st 12'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'dozen', value:'1st', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '90px',
                height: '30px',
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700',
                marginRight: '4px'
              }}
            >
              1st 12
            </div>
            <div
              onMouseEnter={()=>setHover({type:'dozen', payout:2, selection:'2nd 12'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'dozen', value:'2nd', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '90px',
                height: '30px',
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700',
                marginRight: '4px'
              }}
            >
              2nd 12
            </div>
            <div
              onMouseEnter={()=>setHover({type:'dozen', payout:2, selection:'3rd 12'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>onPlace && onPlace({type:'dozen', value:'3rd', numbers:[], amount: chipValue})}
              className="cursor-pointer hover:bg-yellow-400/30 transition-all duration-200 rounded-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:scale-105 z-20 flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: '90px',
                height: '30px',
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700'
              }}
            >
              3rd 12
            </div>
          </div>
        </div>
      </div>
      
      {hover && <div className="absolute left-4 top-4 bg-black/90 text-yellow-400 text-sm px-3 py-2 rounded-lg shadow-lg border border-yellow-400 z-30">{hover.type} • payout {hover.payout}:1</div>}
    </div>
  )
}

export default RouletteFeltGrid;
