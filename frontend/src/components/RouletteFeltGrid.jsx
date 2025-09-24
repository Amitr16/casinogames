import React, { useMemo, useRef, useLayoutEffect, useState, useCallback } from 'react'
import bets from '../assets/roulette_bets.json'

const getNumberColor = (num) => {
  if (num === 0) return '#228B22'
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
  return redNumbers.includes(num) ? '#DC143C' : '#000000'
}

function RouletteFeltGrid({chipValue=5, onPlace, disabled=false}){
  const [hover, setHover] = useState(null)
  
  // Helper function to handle betting with disabled state
  const handleBet = (betData) => {
    if (disabled || !onPlace) return
    onPlace(betData)
  }
  
  // Use JSON meta as single source of truth
  const BASE_W = bets.meta.canvas.w   // 1440
  const BASE_H = bets.meta.canvas.h   // 900
  const cellW = bets.meta.cell_w
  const cellH = bets.meta.cell_h
  const origin = bets.meta.inside_origin
  
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  const recomputeScale = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const avail = el.clientWidth - 48 // account for padding
    const s = Math.min(avail / BASE_W, 1) // don't upscale beyond 1
    setScale(s)
  }, [BASE_W])

  useLayoutEffect(() => {
    recomputeScale()
    window.addEventListener('resize', recomputeScale)
    return () => window.removeEventListener('resize', recomputeScale)
  }, [recomputeScale])
  
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
    // Zero pocket positioned according to JSON meta
    hs.push({n:0, x:60, y:200, w:100, h:360})
    return hs
  },[origin, cellW, cellH])
  
  return (
    <div
      className="relative bg-green-800 rounded-2xl p-6 shadow-2xl border-4 border-yellow-600"
      ref={containerRef}
      style={{ 
        overflow: 'hidden', // No scrolling
        height: 'fit-content' // Auto-adjust height to content
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-green-700 to-green-900 rounded-2xl"></div>

      {/* Scaled canvas using calculated height to align with 2:1 buttons */}
      <div
        className="relative"
        style={{
          width: BASE_W,
          height: 680, // Adjusted height to align with existing 2:1 payout button
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Main number grid using base coordinates */}
        {singles.slice(0, -1).map(h => (
          <div
            key={h.n}
            onMouseEnter={()=>!disabled && setHover({type:'single', payout:35, selection:[h.n]})}
            onMouseLeave={()=>!disabled && setHover(null)}
            onClick={()=>handleBet({type:'single', value:h.n, numbers:[h.n], amount: chipValue})}
            className={`absolute transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
              disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
            }`}
            style={{
              left: h.x,                // raw base coords (NO /1.5)
              top: h.y,
              width: h.w,
              height: h.h,
              backgroundColor: getNumberColor(h.n),
              border: '2px solid #FFD700'
            }}
          >
            {h.n}
          </div>
        ))}
        
        {/* Zero pocket using base coordinates */}
        <div
          onMouseEnter={()=>!disabled && setHover({type:'single', payout:35, selection:[0]})}
          onMouseLeave={()=>!disabled && setHover(null)}
          onClick={()=>handleBet({type:'single', value:0, numbers:[0], amount: chipValue})}
          className={`absolute transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-2xl ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
          }`}
          style={{
            left: 60,
            top: 200,
            width: 100,
            height: 360,
            backgroundColor: '#228B22',
            border: '2px solid #FFD700'
          }}
        >
          0
        </div>
        
        {/* Dozen bets - Full width buttons matching table above */}
        <div className="absolute" style={{ left: 180, top: 560 }}>
          <div className="flex gap-2" style={{ width: '1080px' }}>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'dozen', payout:2, selection:'1st 12'})}
              onMouseLeave={()=>!disabled && setHover(null)}
              onClick={()=>handleBet({type:'dozen', value:'1st', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-xl ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 80,
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700'
              }}
            >
              1st 12
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'dozen', payout:2, selection:'2nd 12'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'dozen', value:'2nd', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-xl ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 80,
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700'
              }}
            >
              2nd 12
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'dozen', payout:2, selection:'3rd 12'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'dozen', value:'3rd', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-xl ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 80,
                backgroundColor: '#1A202C',
                border: '2px solid #FFD700'
              }}
            >
              3rd 12
            </div>
          </div>
        </div>
        
        {/* Quick bet areas - Full width buttons matching table above */}
        <div className="absolute" style={{ left: 180, top: 660 }}>
          <div className="flex gap-2" style={{ width: '1080px' }}>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'red', payout:1, selection:'red'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'color', value:'red', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#DC143C',
                border: '2px solid #FFD700'
              }}
            >
              RED
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'black', payout:1, selection:'black'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'color', value:'black', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#000000',
                border: '2px solid #FFD700'
              }}
            >
              BLACK
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'odd', payout:1, selection:'odd'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'even_odd', value:'odd', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#4A5568',
                border: '2px solid #FFD700'
              }}
            >
              ODD
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'even', payout:1, selection:'even'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'even_odd', value:'even', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#4A5568',
                border: '2px solid #FFD700'
              }}
            >
              EVEN
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'low', payout:1, selection:'1-18'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'low_high', value:'1-18', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#2D3748',
                border: '2px solid #FFD700'
              }}
            >
              1-18
            </div>
            <div
              onMouseEnter={()=>!disabled && setHover({type:'high', payout:1, selection:'19-36'})}
              onMouseLeave={()=>setHover(null)}
              onClick={()=>handleBet({type:'low_high', value:'19-36', numbers:[], amount: chipValue})}
              className={`transition-all duration-200 rounded-lg border-2 border-transparent z-20 flex items-center justify-center text-white font-bold text-lg ${
                disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-yellow-400/30 hover:border-yellow-400 hover:shadow-lg hover:scale-105'
              }`}
              style={{
                flex: 1,  // Each button takes equal width
                height: 60,
                backgroundColor: '#2D3748',
                border: '2px solid #FFD700'
              }}
            >
              19-36
            </div>
          </div>
        </div>
      </div>
      
      {hover && <div className="absolute left-4 top-4 bg-black/90 text-yellow-400 text-sm px-3 py-2 rounded-lg shadow-lg border border-yellow-400 z-30">{hover.type} • payout {hover.payout}:1</div>}
    </div>
  )
}

export default RouletteFeltGrid;
