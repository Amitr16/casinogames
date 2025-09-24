import React, { useState, useMemo } from 'react'
import BlackjackAdvanced from '../../components/BlackjackAdvanced'
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
      
      {state && (
        <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl">
          <div className="space-y-12">
            {/* Dealer Section - Top of Table */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <div className="text-yellow-400 font-bold text-3xl mb-6 text-shadow-gold flex items-center justify-center gap-3">
                  <span>🎩</span> DEALER <span>🎩</span>
                </div>
                <div className="flex gap-3 justify-center mb-6 flex-wrap">
                {Array.isArray(state.dealer) && state.dealer.map((card, i) => {
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
                        animation: dealingCards ? `dealCard 0.6s ease-out ${i * 0.3}s both` : 'none',
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
                      
                      {/* Realistic Card Content */}
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
                        background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 50%), 
                                     radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 50%)`,
                        borderRadius: '12px',
                        pointerEvents: 'none'
                      }} />
                    </div>
                  );
                })}
              </div>
                <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
                  Total: <span className="text-yellow-400 text-2xl">{state.dv}</span>
                </div>
              </div>
            </div>
          
            {/* Player Section - Bottom of Table */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <div className="text-yellow-400 font-bold text-3xl mb-6 text-shadow-gold flex items-center justify-center gap-3">
                  <span>👤</span> YOUR HAND <span>👤</span>
                </div>
                <div className="flex gap-3 justify-center mb-6 flex-wrap">
                {state.player?.map((card, i) => {
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
                        animation: dealingCards ? `dealCard 0.6s ease-out ${(i + 2) * 0.3}s both` : 'none',
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
                      
                      {/* Realistic Card Content */}
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
                        background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 50%), 
                                     radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 50%)`,
                        borderRadius: '12px',
                        pointerEvents: 'none'
                      }} />
                    </div>
                  );
                })}
              </div>
                <div className="text-white font-bold text-xl bg-black/50 rounded-xl p-3 inline-block">
                  Total: <span className="text-yellow-400 text-2xl">{state.pv}</span>
                </div>
              </div>
            </div>
          </div>
        
          {state.final && (
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
      )}
      
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
