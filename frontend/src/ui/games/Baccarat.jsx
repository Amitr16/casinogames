import React, { useState } from 'react'
import { API_BASE_URL } from '../../config.js'
import BaccaratRoadmaps from '../../components/BaccaratRoadmaps'

// Helper function to convert card string to image filename
const getCardImage = (cardStr) => {
  // Extract value and suit from card string
  const value = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
  let suit = '';
  
  if (cardStr.includes('♠') || cardStr.includes('S')) suit = 'spades';
  else if (cardStr.includes('♥') || cardStr.includes('H')) suit = 'hearts';
  else if (cardStr.includes('♦') || cardStr.includes('D')) suit = 'diamonds';
  else if (cardStr.includes('♣') || cardStr.includes('C')) suit = 'clubs';
  else {
    // Fallback: assign suit based on position or random
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const suitIndex = (value.charCodeAt(0) + cardStr.length) % 4;
    suit = suits[suitIndex];
  }
  
  // Convert value to filename format
  let filenameValue = value.toLowerCase();
  if (filenameValue === 'j') filenameValue = 'jack';
  else if (filenameValue === 'q') filenameValue = 'queen';
  else if (filenameValue === 'k') filenameValue = 'king';
  else if (filenameValue === 'a') filenameValue = 'ace';
  
  return `/src/assets/png/${filenameValue}_of_${suit}.png`;
};
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
  return <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
        🂢 BACCARAT ROYALE 🂢
      </h2>
      <div className="text-xl text-yellow-300 opacity-90 font-semibold">Player • Banker • Tie</div>
    </div>
    
    <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow">
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="$50" 
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet On</label>
        <select 
          value={side} 
          onChange={e=>setSide(e.target.value)} 
          className="input w-40 text-center text-xl font-bold"
        >
          <option value="player">🎯 Player</option>
          <option value="banker">🏦 Banker</option>
          <option value="tie">🤝 Tie</option>
        </select>
      </div>
      
      <button 
        onClick={play} 
        className="btn-primary text-2xl px-12 py-6"
        style={{minWidth: '200px'}}
      >
        <span className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <span className="font-black">PLACE BET</span>
        </span>
      </button>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
        <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
          ${res?.payout?.toFixed(2)||'0.00'}
        </div>
      </div>
    </div>
    
    {/* Always show the table - Player and Banker areas visible even when empty */}
    <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
      <div className="grid grid-cols-2 gap-12">
        {/* Player Hand - Always Visible */}
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">PLAYER HAND</div>
          <div className="flex gap-3 justify-center mb-6 min-h-[160px] items-center">
            {res?.result?.player && Array.isArray(res.result.player) ? (
              res.result.player.map((card, i) => (
                <div 
                  key={i} 
                  className="playing-card"
                  style={{
                    width: '100px',
                    height: '140px',
                    borderRadius: '15px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)',
                    transform: 'perspective(1000px) rotateY(0deg)',
                    animation: `dealCard 0.6s ease-out ${i * 0.3}s both`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                >
                  <img 
                    src={getCardImage(card)}
                    alt={card}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                    onError={(e) => {
                      // Fallback to card back if image not found
                      e.target.src = '/src/assets/png/back.png';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-lg italic">
                Player cards will appear here
              </div>
            )}
          </div>
          {res?.result?.player_total !== undefined && (
            <div className="text-white font-bold text-xl bg-blue-900/50 rounded-xl p-3 inline-block border-2 border-blue-400">
              Total: <span className="text-blue-400 text-2xl">{res.result.player_total}</span>
            </div>
          )}
        </div>
        
        {/* Banker Hand - Always Visible */}
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">BANKER HAND</div>
          <div className="flex gap-3 justify-center mb-6 min-h-[160px] items-center">
            {res?.result?.banker && Array.isArray(res.result.banker) ? (
              res.result.banker.map((card, i) => (
                <div 
                  key={i} 
                  className="playing-card"
                  style={{
                    width: '100px',
                    height: '140px',
                    borderRadius: '15px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)',
                    transform: 'perspective(1000px) rotateY(0deg)',
                    animation: `dealCard 0.6s ease-out ${(i + 2) * 0.3}s both`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                >
                  <img 
                    src={getCardImage(card)}
                    alt={card}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                    onError={(e) => {
                      // Fallback to card back if image not found
                      e.target.src = '/src/assets/png/back.png';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-lg italic">
                Banker cards will appear here
              </div>
            )}
          </div>
          {res?.result?.banker_total !== undefined && (
            <div className="text-white font-bold text-xl bg-red-900/50 rounded-xl p-3 inline-block border-2 border-red-400">
              Total: <span className="text-red-400 text-2xl">{res.result.banker_total}</span>
            </div>
          )}
        </div>
      </div>
      
      {res?.result?.winner && (
        <div className="text-center mt-8">
          <div className={`text-4xl font-black p-6 rounded-2xl ${
            res.result.winner === 'player' ? 'text-blue-400 bg-blue-900/30 animate-pulse-win' :
            res.result.winner === 'banker' ? 'text-red-400 bg-red-900/30 animate-pulse-win' :
            'text-green-400 bg-green-900/30 animate-pulse-win'
          }`}>
            {res.result.winner === 'player' && '🎯 PLAYER WINS! 🎯'}
            {res.result.winner === 'banker' && '🏦 BANKER WINS! 🏦'}
            {res.result.winner === 'tie' && '🤝 TIE GAME! 🤝'}
          </div>
          {res.result.winner === 'tie' && (
            <div className="text-5xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-4">
              💰 8:1 TIE PAYOUT! 💰
            </div>
          )}
        </div>
      )}
    </div>
    
    <div className="space-y-6">
      <div className="text-3xl mb-4 text-yellow-400 font-bold text-center text-shadow-gold">
        📊 BACCARAT ROADMAPS 📊
      </div>
      <BaccaratRoadmaps entries={entries}/>
    </div>
    
    <div className="grid grid-cols-3 gap-6 text-center text-yellow-300">
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🎯</div>
        <div className="font-bold text-lg">Player Bet</div>
        <div className="text-blue-400 font-bold text-xl">1:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">No commission</div>
      </div>
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🏦</div>
        <div className="font-bold text-lg">Banker Bet</div>
        <div className="text-red-400 font-bold text-xl">1:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">5% commission</div>
      </div>
      <div className="glass-effect p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-3">🤝</div>
        <div className="font-bold text-lg">Tie Bet</div>
        <div className="text-green-400 font-bold text-xl">8:1 Payout</div>
        <div className="text-sm opacity-80 mt-2">High risk, high reward</div>
      </div>
    </div>
  </div>
}
