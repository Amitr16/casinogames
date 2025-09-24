import React from 'react'
export default function BaccaratRoadmaps({entries=[]}){
  const cols = 24, rows = 6
  const grid = Array.from({length:rows}, ()=>Array(cols).fill(null))
  let c=0,r=0
  entries.forEach(e=>{ grid[r][c]=e; r+=1; if(r>=rows){ r=0; c+=1 } })
  return (
    <div className="p-8 casino-felt rounded-3xl border-4 border-yellow-600 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-green-800/50"></div>
      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-yellow-400 text-shadow-gold mb-2">Game History Roadmap</div>
          <div className="text-yellow-300 opacity-80">Track the patterns • Predict the future</div>
        </div>
        
        <div className="grid grid-cols-24 gap-2 p-4 bg-black/30 rounded-2xl border-2 border-yellow-500/30">
          {grid.flat().map((e,i)=>{
            const color = !e? 'transparent' : 
              e.winner==='player'? '#3b82f6' : 
              e.winner==='banker'? '#ef4444' : '#10b981'
            const symbol = !e? '' : 
              e.winner==='player'? 'P' : 
              e.winner==='banker'? 'B' : 'T'
            
            return (
              <div 
                key={i} 
                className="w-6 h-6 rounded-full border-2 border-white/40 shadow-lg transition-all duration-300 hover:scale-125 hover:shadow-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer" 
                style={{
                  background: e ? `linear-gradient(135deg, ${color}, ${color}dd)` : 'rgba(255,255,255,0.1)',
                  boxShadow: e ? `0 0 10px ${color}66` : 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
                title={e ? `${e.winner.charAt(0).toUpperCase() + e.winner.slice(1)} wins` : 'No result'}
              >
                {symbol}
              </div>
            )
          })}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div className="glass-effect p-3 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-500 mx-auto mb-2 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">P</div>
            <div className="text-blue-400 font-semibold">Player Wins</div>
          </div>
          <div className="glass-effect p-3 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-2 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">B</div>
            <div className="text-red-400 font-semibold">Banker Wins</div>
          </div>
          <div className="glass-effect p-3 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-green-500 mx-auto mb-2 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">T</div>
            <div className="text-green-400 font-semibold">Tie Games</div>
          </div>
        </div>
      </div>
    </div>
  )
}
