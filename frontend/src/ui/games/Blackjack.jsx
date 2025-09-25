import React, { useState, useMemo } from 'react'
import BlackjackAdvanced from '../../components/BlackjackAdvanced'

// Helper function to convert card string to image filename
const getCardImage = (cardStr) => {
  // Handle card back (dealer's hole card)
  if (cardStr === '🂠' || cardStr === 'back' || !cardStr || cardStr.trim() === '') {
    return '/src/assets/png/back.png';
  }
  
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

// Helper function to calculate card value
const getCardValue = (cardStr) => {
  if (!cardStr || cardStr === '🂠' || cardStr.trim() === '') return 0;
  const value = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
  if (value === 'A') return 11;
  if (['J','Q','K'].includes(value)) return 10;
  return parseInt(value) || 0;
};

// Helper function to calculate hand total
const getHandTotal = (cards) => {
  if (!cards || !Array.isArray(cards)) return 0;
  return cards.reduce((sum, card) => sum + getCardValue(card), 0);
};
export default function Blackjack({onDone}){
  const api = window.CASINO_API
  const headers={'Content-Type':'application/json','X-User-Id':'demo-user'}
  const [stake,setStake]=useState(5)
  const [state,setState]=useState(null)
  const [res,setRes]=useState(null)
  const [dealingCards,setDealingCards]=useState(false)
  const call = async(action)=>{
    if(action === 'deal') {
      setDealingCards(true)
      setTimeout(() => setDealingCards(false), 2000)
    }
    
    const body = {stake, currency:'USD', action, state, params:{ref:state?.ref}}
    const r = await fetch(`${api}/casino/blackjack/play`, {method:'POST', headers, body: JSON.stringify(body)})
    const j = await r.json(); setRes(j); setState(j.result); onDone&&onDone()
  }
  const allowed = useMemo(()=>{
    const s = state||{}
    const final = s.final
    const can = {hit:false, stand:false, double:false, split:false, insurance:false, surrender:false}
    if(!s.player || final) return can
    const pv = s.pv||0
    can.hit = pv<21
    can.stand = true
    can.double = s.player?.length===2
    can.split = s.player?.length===2 && s.player[0]===s.player[1]
    can.insurance = (s.dealer && s.dealer[0]==='A' && s.player?.length===2)
    can.surrender = s.player?.length===2
    return can
  },[state])
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
          🂡 BLACKJACK ROYALE 🂡
        </h2>
        <div className="text-xl text-yellow-300 opacity-90 font-semibold">Beat the Dealer • Get 21</div>
      </div>
      
      <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow flex-wrap">
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
          <input 
            type="number" 
            min="1" 
            value={stake} 
            onChange={e=>setStake(parseFloat(e.target.value||'1'))} 
            className="input w-36 text-center text-2xl font-bold" 
            placeholder="$25" 
          />
        </div>
        
        <button 
          onClick={()=>call('deal')} 
          className="btn-primary text-2xl px-12 py-6"
          style={{minWidth: '200px'}}
        >
          <span className="flex items-center gap-3">
            <div className="text-3xl">🂡</div>
            <span className="font-black">DEAL CARDS</span>
          </span>
        </button>
        
        <BlackjackAdvanced allowed={allowed} onAction={name=>call(name)}/>
        
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
          <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
            ${res?.payout?.toFixed(2)||'0.00'}
          </div>
        </div>
      </div>
      
      {/* Always show the table - dealer area visible even when empty */}
      <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
        <div className="space-y-12">
          {/* Dealer Section - Top of Table - Always Visible */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent rounded-2xl"></div>
            <div className="relative z-10 p-6">
              <div className="text-yellow-400 font-bold text-3xl mb-6 text-shadow-gold flex items-center justify-center gap-3">
                <span>🎩</span> DEALER <span>🎩</span>
              </div>
              <div className="flex gap-3 justify-center mb-6 flex-wrap min-h-[160px] items-center">
                {state?.dealer && Array.isArray(state.dealer) ? (
                  state.dealer.map((card, i) => (
                    <div 
                      key={i} 
                      className="playing-card"
                      style={{
                        width: '100px',
                        height: '140px',
                        borderRadius: '15px',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)',
                        transform: 'perspective(1000px) rotateY(0deg)',
                        animation: dealingCards ? `dealCard 0.6s ease-out ${i * 0.3}s both` : 'none',
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
                    Dealer's cards will appear here
                  </div>
                )}
              </div>
              {state?.dealer && (
                <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
                  Total: <span className="text-yellow-400 text-2xl">
                    {getHandTotal(state.dealer)}
                  </span>
                </div>
              )}
            </div>
          </div>
        
          {/* Player Section - Bottom of Table - Only show when cards are dealt */}
          {state && (
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <div className="text-yellow-400 font-bold text-3xl mb-6 text-shadow-gold flex items-center justify-center gap-3">
                  <span>👤</span> YOUR HAND <span>👤</span>
                </div>
                <div className="flex gap-3 justify-center mb-6 flex-wrap">
                  {state.player?.map((card, i) => (
                    <div 
                      key={i} 
                      className="playing-card"
                      style={{
                        width: '100px',
                        height: '140px',
                        borderRadius: '15px',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.8)',
                        transform: 'perspective(1000px) rotateY(0deg)',
                        animation: dealingCards ? `dealCard 0.6s ease-out ${(i + 2) * 0.3}s both` : 'none',
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
                  ))}
                </div>
                <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
                  Total: <span className="text-yellow-400 text-2xl">{state.pv}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      
        {state?.final && (
          <div className="text-center mt-8">
            <div className={`text-4xl font-black p-6 rounded-2xl ${
              res?.payout > 0 ? 'text-green-400 bg-green-900/30 animate-pulse-win' : 'text-red-400 bg-red-900/30'
            }`}>
              {res?.payout > 0 ? '🎉 YOU WIN! 🎉' : '💔 DEALER WINS 💔'}
            </div>
            {state.pv === 21 && state.player?.length === 2 && (
              <div className="text-6xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-4">
                ♠️ BLACKJACK! ♠️
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-4 text-center text-yellow-300">
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🂡</div>
          <div className="font-semibold">Blackjack</div>
          <div className="text-yellow-400 font-bold">3:2 Payout</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🃏</div>
          <div className="font-semibold">Regular Win</div>
          <div className="text-yellow-400 font-bold">1:1 Payout</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">🤝</div>
          <div className="font-semibold">Push</div>
          <div className="text-yellow-400 font-bold">Bet Returned</div>
        </div>
        <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
          <div className="text-3xl mb-2">💥</div>
          <div className="font-semibold">Bust</div>
          <div className="text-red-400 font-bold">Lose Bet</div>
        </div>
      </div>
    </div>
  )
}
