import React, { useState } from 'react'
import BaccaratRoadmaps from '../../components/BaccaratRoadmaps'
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
    
    {res && <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
      <div className="grid grid-cols-2 gap-12">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">PLAYER HAND</div>
          <div className="flex gap-3 justify-center mb-6">
            {res.result?.player?.map((card, i) => {
              const getSuitSymbol = (cardStr) => {
                if (cardStr.includes('♠') || cardStr.includes('S')) return '♠';
                if (cardStr.includes('♥') || cardStr.includes('H')) return '♥';
                if (cardStr.includes('♦') || cardStr.includes('D')) return '♦';
                if (cardStr.includes('♣') || cardStr.includes('C')) return '♣';
                const suits = ['♠', '♥', '♦', '♣'];
                const cardValue = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
                const suitIndex = (cardValue.charCodeAt(0) + i) % 4;
                return suits[suitIndex];
              };
              
              const getCardValue = (cardStr) => {
                const value = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
                return value || cardStr;
              };
              
              const suit = getSuitSymbol(card);
              const value = getCardValue(card);
              const isRed = suit === '♥' || suit === '♦';
              const cardColor = isRed ? '#DC143C' : '#000000';
              
              return (
                <div 
                  key={i} 
                  className="playing-card"
                  style={{
                    width: '100px',
                    height: '140px',
                    background: 'linear-gradient(145deg, #FFFEF7, #F8F8FF, #FFFEF7)',
                    border: '3px solid #2C2C2C',
                    borderRadius: '15px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.8)',
                    transform: 'perspective(1000px) rotateY(0deg)',
                    animation: `dealCard 0.6s ease-out ${i * 0.3}s both`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: cardColor,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.95), 0 0 0 1px rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    textAlign: 'center',
                    color: cardColor
                  }}>
                    <div>{value}</div>
                    <div style={{ fontSize: '14px' }}>{suit}</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    textAlign: 'center',
                    transform: 'rotate(180deg)',
                    color: cardColor
                  }}>
                    <div>{value}</div>
                    <div style={{ fontSize: '14px' }}>{suit}</div>
                  </div>
                  
                  {(() => {
                    const renderCardContent = (value, suit, cardColor) => {
                      const numValue = parseInt(value);
                      
                      if (value === 'J' || value === 'Q' || value === 'K') {
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: cardColor
                          }}>
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>{value}</div>
                            <div style={{ fontSize: '24px' }}>{suit}</div>
                          </div>
                        );
                      }
                      
                      if (value === 'A') {
                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: cardColor
                          }}>
                            {suit}
                          </div>
                        );
                      }
                      
                      if (numValue >= 2 && numValue <= 10) {
                        const suitPositions = [];
                        const suitSize = '16px';
                        
                        if (numValue === 2) {
                          suitPositions.push({ top: '25%', left: '50%' });
                          suitPositions.push({ bottom: '25%', left: '50%', transform: 'rotate(180deg)' });
                        } else if (numValue === 3) {
                          suitPositions.push({ top: '20%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '20%', left: '50%', transform: 'rotate(180deg)' });
                        } else if (numValue === 4) {
                          suitPositions.push({ top: '25%', left: '30%' });
                          suitPositions.push({ top: '25%', right: '30%' });
                          suitPositions.push({ bottom: '25%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '25%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 5) {
                          suitPositions.push({ top: '20%', left: '30%' });
                          suitPositions.push({ top: '20%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '20%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '20%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 6) {
                          suitPositions.push({ top: '20%', left: '30%' });
                          suitPositions.push({ top: '20%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '20%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '20%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 7) {
                          suitPositions.push({ top: '18%', left: '30%' });
                          suitPositions.push({ top: '18%', right: '30%' });
                          suitPositions.push({ top: '35%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '18%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 8) {
                          suitPositions.push({ top: '18%', left: '30%' });
                          suitPositions.push({ top: '18%', right: '30%' });
                          suitPositions.push({ top: '35%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '35%', left: '50%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 9) {
                          suitPositions.push({ top: '15%', left: '30%' });
                          suitPositions.push({ top: '15%', right: '30%' });
                          suitPositions.push({ top: '32%', left: '30%' });
                          suitPositions.push({ top: '32%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '32%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '32%', right: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 10) {
                          suitPositions.push({ top: '15%', left: '30%' });
                          suitPositions.push({ top: '15%', right: '30%' });
                          suitPositions.push({ top: '30%', left: '50%' });
                          suitPositions.push({ top: '40%', left: '30%' });
                          suitPositions.push({ top: '40%', right: '30%' });
                          suitPositions.push({ bottom: '40%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '40%', right: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '30%', left: '50%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', right: '30%', transform: 'rotate(180deg)' });
                        }
                        
                        return (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {suitPositions.map((pos, idx) => (
                              <div
                                key={idx}
                                style={{
                                  position: 'absolute',
                                  fontSize: suitSize,
                                  fontWeight: 'bold',
                                  color: cardColor,
                                  transform: `translate(-50%, -50%) ${pos.transform || ''}`,
                                  ...pos
                                }}
                              >
                                {suit}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          fontSize: '36px',
                          fontWeight: 'bold',
                          color: cardColor
                        }}>
                          {suit}
                        </div>
                      );
                    };
                    
                    return renderCardContent(value, suit, cardColor);
                  })()}
                  
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 50%)`,
                    borderRadius: '12px',
                    pointerEvents: 'none'
                  }} />
                </div>
              );
            })}
          </div>
          <div className="text-white font-bold text-xl bg-blue-900/50 rounded-xl p-3 inline-block border-2 border-blue-400">
            Total: <span className="text-blue-400 text-2xl">{res.result?.player_total}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 text-shadow-gold">BANKER HAND</div>
          <div className="flex gap-3 justify-center mb-6">
            {res.result?.banker?.map((card, i) => {
              const getSuitSymbol = (cardStr) => {
                if (cardStr.includes('♠') || cardStr.includes('S')) return '♠';
                if (cardStr.includes('♥') || cardStr.includes('H')) return '♥';
                if (cardStr.includes('♦') || cardStr.includes('D')) return '♦';
                if (cardStr.includes('♣') || cardStr.includes('C')) return '♣';
                const suits = ['♠', '♥', '♦', '♣'];
                const cardValue = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
                const suitIndex = (cardValue.charCodeAt(0) + i) % 4;
                return suits[suitIndex];
              };
              
              const getCardValue = (cardStr) => {
                const value = cardStr.replace(/[♠♥♦♣SHDC]/g, '').trim();
                return value || cardStr;
              };
              
              const suit = getSuitSymbol(card);
              const value = getCardValue(card);
              const isRed = suit === '♥' || suit === '♦';
              const cardColor = isRed ? '#DC143C' : '#000000';
              
              return (
                <div 
                  key={i} 
                  className="playing-card"
                  style={{
                    width: '100px',
                    height: '140px',
                    background: 'linear-gradient(145deg, #FFFEF7, #F8F8FF, #FFFEF7)',
                    border: '3px solid #2C2C2C',
                    borderRadius: '15px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.8)',
                    transform: 'perspective(1000px) rotateY(0deg)',
                    animation: `dealCard 0.6s ease-out ${(i + 2) * 0.3}s both`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: cardColor,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.95), 0 0 0 1px rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    textAlign: 'center',
                    color: cardColor
                  }}>
                    <div>{value}</div>
                    <div style={{ fontSize: '14px' }}>{suit}</div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    textAlign: 'center',
                    transform: 'rotate(180deg)',
                    color: cardColor
                  }}>
                    <div>{value}</div>
                    <div style={{ fontSize: '14px' }}>{suit}</div>
                  </div>
                  
                  {(() => {
                    const renderCardContent = (value, suit, cardColor) => {
                      const numValue = parseInt(value);
                      
                      if (value === 'J' || value === 'Q' || value === 'K') {
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: cardColor
                          }}>
                            <div style={{ fontSize: '32px', marginBottom: '4px' }}>{value}</div>
                            <div style={{ fontSize: '24px' }}>{suit}</div>
                          </div>
                        );
                      }
                      
                      if (value === 'A') {
                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: cardColor
                          }}>
                            {suit}
                          </div>
                        );
                      }
                      
                      if (numValue >= 2 && numValue <= 10) {
                        const suitPositions = [];
                        const suitSize = '16px';
                        
                        if (numValue === 2) {
                          suitPositions.push({ top: '25%', left: '50%' });
                          suitPositions.push({ bottom: '25%', left: '50%', transform: 'rotate(180deg)' });
                        } else if (numValue === 3) {
                          suitPositions.push({ top: '20%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '20%', left: '50%', transform: 'rotate(180deg)' });
                        } else if (numValue === 4) {
                          suitPositions.push({ top: '25%', left: '30%' });
                          suitPositions.push({ top: '25%', right: '30%' });
                          suitPositions.push({ bottom: '25%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '25%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 5) {
                          suitPositions.push({ top: '20%', left: '30%' });
                          suitPositions.push({ top: '20%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '20%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '20%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 6) {
                          suitPositions.push({ top: '20%', left: '30%' });
                          suitPositions.push({ top: '20%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '20%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '20%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 7) {
                          suitPositions.push({ top: '18%', left: '30%' });
                          suitPositions.push({ top: '18%', right: '30%' });
                          suitPositions.push({ top: '35%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '18%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 8) {
                          suitPositions.push({ top: '18%', left: '30%' });
                          suitPositions.push({ top: '18%', right: '30%' });
                          suitPositions.push({ top: '35%', left: '50%' });
                          suitPositions.push({ top: '50%', left: '30%' });
                          suitPositions.push({ top: '50%', right: '30%' });
                          suitPositions.push({ bottom: '35%', left: '50%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '18%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 9) {
                          suitPositions.push({ top: '15%', left: '30%' });
                          suitPositions.push({ top: '15%', right: '30%' });
                          suitPositions.push({ top: '32%', left: '30%' });
                          suitPositions.push({ top: '32%', right: '30%' });
                          suitPositions.push({ top: '50%', left: '50%' });
                          suitPositions.push({ bottom: '32%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '32%', right: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', right: '30%', transform: 'rotate(180deg)' });
                        } else if (numValue === 10) {
                          suitPositions.push({ top: '15%', left: '30%' });
                          suitPositions.push({ top: '15%', right: '30%' });
                          suitPositions.push({ top: '30%', left: '50%' });
                          suitPositions.push({ top: '40%', left: '30%' });
                          suitPositions.push({ top: '40%', right: '30%' });
                          suitPositions.push({ bottom: '40%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '40%', right: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '30%', left: '50%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', left: '30%', transform: 'rotate(180deg)' });
                          suitPositions.push({ bottom: '15%', right: '30%', transform: 'rotate(180deg)' });
                        }
                        
                        return (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {suitPositions.map((pos, idx) => (
                              <div
                                key={idx}
                                style={{
                                  position: 'absolute',
                                  fontSize: suitSize,
                                  fontWeight: 'bold',
                                  color: cardColor,
                                  transform: `translate(-50%, -50%) ${pos.transform || ''}`,
                                  ...pos
                                }}
                              >
                                {suit}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          fontSize: '36px',
                          fontWeight: 'bold',
                          color: cardColor
                        }}>
                          {suit}
                        </div>
                      );
                    };
                    
                    return renderCardContent(value, suit, cardColor);
                  })()}
                  
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 50%)`,
                    borderRadius: '12px',
                    pointerEvents: 'none'
                  }} />
                </div>
              );
            })}
          </div>
          <div className="text-white font-bold text-xl bg-red-900/50 rounded-xl p-3 inline-block border-2 border-red-400">
            Total: <span className="text-red-400 text-2xl">{res.result?.banker_total}</span>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <div className={`text-4xl font-black p-6 rounded-2xl ${
          res.result?.winner === 'player' ? 'text-blue-400 bg-blue-900/30 animate-pulse-win' :
          res.result?.winner === 'banker' ? 'text-red-400 bg-red-900/30 animate-pulse-win' :
          'text-green-400 bg-green-900/30 animate-pulse-win'
        }`}>
          {res.result?.winner === 'player' && '🎯 PLAYER WINS! 🎯'}
          {res.result?.winner === 'banker' && '🏦 BANKER WINS! 🏦'}
          {res.result?.winner === 'tie' && '🤝 TIE GAME! 🤝'}
        </div>
        {res.result?.winner === 'tie' && (
          <div className="text-5xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-4">
            💰 8:1 TIE PAYOUT! 💰
          </div>
        )}
      </div>
    </div>}
    
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
