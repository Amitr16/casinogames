import React, { useState, useEffect, useRef } from 'react'
import RouletteFeltGrid from '../../components/RouletteFeltGrid'

// Shared geometry constants for perfect concentricity
const NUM_SLOTS = 37;
const DEG = 360 / NUM_SLOTS;
const WHEEL_OUTER_RADIUS = 350; // must match triangle depth + number ring
const ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

// Self-calibrating winner calculation - no more guessing constants!

// Normalize to (-180, 180]
const norm = d => {
  let x = ((d % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
};

// Mod that always returns [0, m)
const mod = (x, m) => ((x % m) + m) % m;

// Angular distance helper
const adist = (a, b) => {
  let d = mod(a - b, 360);
  if (d > 180) d -= 360;
  return Math.abs(d);
};

// Signed shortest distance in degrees
const sdist = (a, b) => {
  let d = mod(a - b, 360);
  if (d > 180) d -= 360;
  return d;
};

// Read final **screen angle** of an element, whatever wrappers/offsets exist.
function getScreenAngle(el) {
  if (!el) return 0;
  const t = getComputedStyle(el).transform || 'matrix(1,0,0,1,0,0)';
  const m = new DOMMatrixReadOnly(t);
  const radians = Math.atan2(m.b, m.a);      // m.b = sinθ, m.a = cosθ
  const deg = radians * (180 / Math.PI);     // clockwise, CSS 0° at 3 o'clock
  return mod(deg, 360);
}

function RoulettePro({onDone}){
  
  const api = window.CASINO_API
  const [bets,setBets]=useState([])
  const [chip,setChip]=useState(5)
  const [spinning,setSpinning]=useState(false)
  const [wheelRotation,setWheelRotation]=useState(0)
  const [ballOffset,setBallOffset]=useState(0) // tiny post-spin polish
  const [resultUI,setResultUI]=useState(null) // what you show in the panel
  const [showCelebration,setShowCelebration]=useState(false)
  const [winAmount,setWinAmount]=useState(0)
  const [showPopup,setShowPopup]=useState(false)
  const [popupMessage,setPopupMessage]=useState('')
  const [popupType,setPopupType]=useState('') // 'win' or 'lose'
  
  
  // guards
  const spinIdRef = useRef(0)
  const wheelRef = useRef(0)
  useEffect(() => { wheelRef.current = wheelRotation }, [wheelRotation])
  
  // Listen for transitionend to compute winner from DOM
  useEffect(() => {
    const el = wheelContainerRef.current;
    if (!el) return;

    const onEnd = (e) => {
      if (e.propertyName !== 'transform') return;

      // Wait a frame so the browser commits final matrix
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeWinnerFromDOM();   // <-- defined above
        });
      });
    };

    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, []);
  
  // DOM-based angle reading refs
  const ballRef = useRef(null)       // the ball element
  const wheelContainerRef = useRef(null)  // the rotating wheel container (numbers ring)
  const zeroRef = useRef(null)       // the DOM node for pocket 0 (inside wheelRef)
  
  
  // Compute winner from DOM after transition ends
  const computeWinnerFromDOM = () => {
    setSpinning(false);

    // READ BOTH: ball and a wheel reference that rotates with the ring
    const ballDeg = getScreenAngle(ballRef.current);   // includes ball's -1.5 factor + offset
    const zeroDeg = getScreenAngle(zeroRef.current);   // pocket-0 angle on screen INCLUDING wheel rotation

    // If zeroRef marks a boundary (between slots) use PHASE=0.5; if it marks the center use 0.
    const PHASE = 0; // set to 0.5 if your zeroRef element is a divider/boundary

    // Ball relative to wheel's pocket-0 baseline
    const rel = mod(ballDeg - zeroDeg, 360);           // 0..360 relative angle

    // Nearest pocket center (phase accounts for center vs boundary)
    const idx = mod(Math.round(rel / DEG - PHASE), NUM_SLOTS);
    const pocketFinal = ORDER[idx];

    // Optional micro-center
    const centerDeg = mod(zeroDeg + (idx + PHASE) * DEG, 360);
    const delta = sdist(centerDeg, ballDeg);
    if (Math.abs(delta) > 0.1) setBallOffset(o => o + delta);

    // Show the derived winner
    setResultUI({ pocket: pocketFinal, serverPocket: null });
    
    // Calculate winnings and trigger celebrations
    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0)
    const winnings = calculateWinnings(pocketFinal, bets)
    
    console.log('DEBUG: Winner calculation', {
      pocketFinal, totalBet, winnings, bets
    });
    
    if (winnings > 0) {
      console.log('DEBUG: Triggering celebration for', winnings);
      triggerCelebration(winnings)
    } else if (totalBet > 0) {
      console.log('DEBUG: Triggering loss for', totalBet);
      triggerLoss(totalBet)
    } else {
      console.log('DEBUG: No bets placed, no celebration');
    }
    
    // Reset everything after a short delay to show the result
    setTimeout(() => {
      setBets([]) // Clear all bets
      setWheelRotation(0) // Reset wheel to zero degrees
      setBallOffset(0) // Reset ball offset
      setResultUI(null) // Clear result display
    }, 2000) // 2 seconds after result is shown
    
    onDone && onDone();
  };

  const place = (b)=> {
    if (spinning) return; // Don't allow betting during spin
    setBets(prev=>[...prev,b])
  }
  
  // Calculate winnings based on bet type and winning number
  const calculateWinnings = (winningNumber, bets) => {
    let totalWinnings = 0
    
    bets.forEach(bet => {
      const { type, value, numbers, amount } = bet
      let won = false
      let multiplier = 0
      
      switch (type) {
        case 'single':
          if (numbers && numbers.includes(winningNumber)) {
            won = true
            multiplier = 36 // 35:1 payout + original bet
          }
          break
          
        case 'color':
          const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber)
          const isBlack = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(winningNumber)
          const isGreen = winningNumber === 0
          
          if ((value === 'red' && isRed) || (value === 'black' && isBlack) || (value === 'green' && isGreen)) {
            won = true
            multiplier = 2 // 1:1 payout + original bet
          }
          break
          
        case 'even_odd':
          if (winningNumber !== 0) {
            const isEven = winningNumber % 2 === 0
            if ((value === 'even' && isEven) || (value === 'odd' && !isEven)) {
              won = true
              multiplier = 2 // 1:1 payout + original bet
            }
          }
          break
          
        case 'low_high':
          if (winningNumber !== 0) {
            if ((value === '1-18' && winningNumber >= 1 && winningNumber <= 18) ||
                (value === '19-36' && winningNumber >= 19 && winningNumber <= 36)) {
              won = true
              multiplier = 2 // 1:1 payout + original bet
            }
          }
          break
          
        case 'dozen':
          if (winningNumber !== 0) {
            const isFirstDozen = winningNumber >= 1 && winningNumber <= 12
            const isSecondDozen = winningNumber >= 13 && winningNumber <= 24
            const isThirdDozen = winningNumber >= 25 && winningNumber <= 36
            
            if ((value === '1st' && isFirstDozen) ||
                (value === '2nd' && isSecondDozen) ||
                (value === '3rd' && isThirdDozen)) {
              won = true
              multiplier = 3 // 2:1 payout + original bet
            }
          }
          break
      }
      
      if (won) {
        totalWinnings += amount * multiplier
      }
    })
    
    return totalWinnings
  }
  
  // Show celebration animation
  const triggerCelebration = (amount) => {
    console.log('DEBUG: triggerCelebration called with amount:', amount);
    setWinAmount(amount)
    setShowCelebration(true)
    setShowPopup(true)
    setPopupMessage(`🎉 YOU WON $${amount}! 🎉`)
    setPopupType('win')
    
    // Hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false)
    }, 5000)
    
    // Hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }
  
  // Show loss message
  const triggerLoss = (totalBet) => {
    console.log('DEBUG: triggerLoss called with totalBet:', totalBet);
    setShowPopup(true)
    setPopupMessage(`💸 You lost $${totalBet}. Better luck next time! 💸`)
    setPopupType('lose')
    
    // Hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }
  const spin = async()=>{
    if (spinning || bets.length === 0) return; // Don't allow spin without bets
    const id = ++spinIdRef.current;

    setSpinning(true);
    setBallOffset(0);
    setResultUI(null);

    // Plan a natural-looking spin amount (do NOT solve for server pocket)
    const base = 5 * 360;              // ≥ a few full turns
    const jitter = Math.random() * 720;  // extra randomness
    const delta = base + jitter;

    setWheelRotation(prev => prev + delta);

    // (Optional) still call server for auditing / payout calc
    // but do NOT use it to set the wheel or UI winner.
    let serverPocket = null;
    try {
      const betsToSend = bets.length > 0 ? bets : [{type:'single', value:0, numbers:[0], amount:1}]
      const r = await fetch(`${api}/casino/roulette/spin`, {
        method:'POST',
        headers:{'Content-Type':'application/json','X-User-Id':'demo-user'},
        body: JSON.stringify({stake:1,currency:'USD', params:{bets: betsToSend}})
      })
      const j = await r.json()
      serverPocket = j?.result?.spin?.pocket ?? null;
    } catch (e) {
      console.warn('spin api failed (Pattern B continues visually):', e);
    }

    // Winner calculation now happens on transitionend event
  }
  // Confetti component
  const Confetti = () => {
    if (!showCelebration) return null
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 30}px`,
              color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF9FF3', '#54A0FF'][Math.floor(Math.random() * 8)]
            }}
          >
            {['🎉', '🎊', '✨', '💫', '🌟', '⭐', '🎈', '🎁'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>
    )
  }
  
  // Popup component
  const Popup = () => {
    if (!showPopup) return null
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className={`relative p-8 rounded-3xl border-4 shadow-2xl text-center max-w-md mx-4 transform transition-all duration-500 ${
          popupType === 'win' 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 text-white' 
            : 'bg-gradient-to-br from-red-500 to-red-700 border-red-300 text-white'
        } ${showPopup ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="text-6xl mb-4">
            {popupType === 'win' ? '🎉' : '💸'}
          </div>
          <div className="text-2xl font-bold mb-2">
            {popupMessage}
          </div>
          {popupType === 'win' && (
            <div className="text-lg opacity-90">
              Congratulations! 🎊
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
          🎡 ROULETTE ROYALE 🎡
        </h2>
        <div className="text-xl text-yellow-300 opacity-90 font-semibold">Place Your Bets • Spin the Wheel of Fortune</div>
      </div>
      
      <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow flex-wrap">
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Chip Value</label>
          <input 
            type="number" 
            value={chip} 
            onChange={e=>setChip(+e.target.value)} 
            className="input w-36 text-center text-2xl font-bold" 
            placeholder="$5" 
          />
        </div>
        
        <button 
          onClick={()=>setBets([])} 
          className="btn bg-red-600 hover:bg-red-700 text-white border-red-500 text-xl px-8 py-4"
        >
          <span className="flex items-center gap-2">
            <div className="text-2xl">🗑️</div>
            <span className="font-black">CLEAR</span>
          </span>
        </button>
        
        <button 
          onClick={spin} 
          disabled={spinning || bets.length === 0}
          className="btn-primary text-2xl px-12 py-6"
          style={{
            minWidth: '200px',
            opacity: (spinning || bets.length === 0) ? 0.6 : 1,
            transform: spinning ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <span className="flex items-center gap-3">
            <div className="text-3xl" style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: spinning ? 'none' : 'transform 0.5s ease'
            }}>🎡</div>
            <span className="font-black">
              {spinning ? 'SPINNING...' : bets.length === 0 ? 'PLACE A BET' : 'SPIN WHEEL'}
            </span>
          </span>
        </button>
        
        {/* Soft message when no bets are placed */}
        {bets.length === 0 && !spinning && (
          <div className="text-center mt-4">
            <div className="text-yellow-300 text-lg font-semibold opacity-80 animate-pulse">
              💡 Place your bets on the table below to start spinning! 💡
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Professional Roulette Wheel - Always Visible */}
      <div style={{
        position: 'relative',
        width: '1000px',
        height: '1000px',
        margin: '20px auto',
        background: 'radial-gradient(circle, #8B4513 0%, #654321 30%, #2F1B14 100%)',
        borderRadius: '50%',
        border: '30px solid #FFD700',
        boxShadow: '0 0 120px rgba(255, 215, 0, 0.9), inset 0 0 80px rgba(0,0,0,0.6)',
        overflow: 'visible'
      }}>
        {/* Rotating Container - All elements rotate together */}
        <div 
          ref={wheelContainerRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '900px',
            height: '900px',
            transform: `translate(-50%, -50%) rotate(${wheelRotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}>
          {/* Outer Ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '900px',
            height: '900px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '20px solid #B8860B',
            background: 'radial-gradient(circle, #DAA520 0%, #B8860B 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4)'
          }}>
            {/* Main Wheel with Numbers */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '820px',
              height: '820px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: '#2F1B14',
              border: '10px solid #FFD700',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.6)'
            }}>
              {/* Number Segments - Combined colored background and number display */}
              {[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26].map((num, i) => {
                const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
                const angle = i * DEG;
                const segmentColor = num === 0 ? '#228B22' : isRed ? '#DC143C' : '#000000';
                
                return (
                    <div 
                      key={num} 
                      ref={num === 0 ? zeroRef : null}   // <— this one becomes our angle baseline
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transformOrigin: '50% 50%',
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${WHEEL_OUTER_RADIUS}px)`
                      }}>
                      {/* Colored Segment Background */}
                      <div style={{
                        width: '0',
                        height: '0',
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: `${WHEEL_OUTER_RADIUS}px solid ${segmentColor}`,
                        opacity: 0.9
                      }} />
                      
                      {/* Number Display - positioned relative to segment */}
                      <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${-angle}deg)`,
                        color: '#FFFFFF',
                        fontSize: '18px',
                        fontWeight: '900',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
                        background: `radial-gradient(circle, ${segmentColor}, ${segmentColor === '#228B22' ? '#006400' : segmentColor === '#DC143C' ? '#8B0000' : '#000000'})`,
                        width: '35px',
                        height: '25px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #FFD700',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.2)',
                        zIndex: 10
                      }}>
                        {num}
                      </div>
                    </div>
                );
              })}
              
              {/* Divider Lines - Anchor at center with half-segment offset */}
              {Array.from({length: NUM_SLOTS}).map((_, i) => {
                const dividerAngle = (i + 0.5) * DEG; // half-slot boundary
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '3px',
                      height: `${WHEEL_OUTER_RADIUS + 100}px`, // Extend to outer circumference
                      background: 'linear-gradient(to bottom, #FFD700, #B8860B)',
                      transformOrigin: '50% 100%',
                      transform: `translate(-50%, 0) rotate(${dividerAngle}deg)`,
                      marginTop: `-${WHEEL_OUTER_RADIUS + 100}px`, // Adjust margin to match height
                      zIndex: 5
                    }}
                  />
                );
              })}
            </div>
            
            {/* Center Hub */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, #FFD700 0%, #DAA520 50%, #B8860B 100%)',
              borderRadius: '50%',
              border: '16px solid #FFF8DC',
              boxShadow: '0 0 50px rgba(255,215,0,0.9), inset 0 0 30px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              zIndex: 20
            }}>
              🎰
            </div>
          </div>
        </div>
        
        {/* Animated Ball - Realistic Physics - Outside rotating container */}
        <div 
          ref={ballRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
            transform: `translate(-50%, -50%) rotate(${
              (-wheelRotation * 1.5) + ballOffset
            }deg) translate(0, -420px)`,
            width: '32px',
            height: '32px',
            background: 'radial-gradient(circle, #FFFFFF 0%, #E0E0E0 70%, #C0C0C0 100%)',
            borderRadius: '50%',
            border: '6px solid #C0C0C0',
            boxShadow: '0 0 40px rgba(255,255,255,0.9), 0 10px 20px rgba(0,0,0,0.4)',
            transition: spinning
              ? 'transform 3s cubic-bezier(0.25,0.46,0.45,0.94)' // physics feel
              : 'transform 300ms ease-out',                      // micro-center only
            zIndex: 25
          }} 
          onMouseEnter={() => console.log('Ball state:', { spinning, ballOffset, wheelRotation })}
        />
        
        {/* Outer Decorative Ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1068px',
          height: '1068px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '8px solid #8B4513',
          background: 'conic-gradient(from 0deg, #DAA520, #FFD700, #DAA520, #B8860B, #DAA520)',
          opacity: 0.4,
          zIndex: 1
        }} />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="casino-felt p-6 rounded-3xl border-4 border-yellow-600 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-yellow-400 text-shadow-gold">BETTING TABLE</div>
              {bets.length === 0 && !spinning && (
                <div className="text-yellow-300 text-sm mt-2 opacity-70">
                  Click on any number or betting area to place your bet
                </div>
              )}
            </div>
            <RouletteFeltGrid chipValue={chip} onPlace={place} disabled={spinning}/>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-3xl neon-glow">
            <div className="text-yellow-400 font-bold text-xl mb-4 text-center text-shadow-gold">💰 BET SLIP 💰</div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center text-yellow-300 opacity-60 py-4">
                  No bets placed yet. Click on the table to place bets!
                </div>
              ) : (
                bets.map((b,i) => (
                  <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-yellow-500/30" style={{
                    animation: `chipPlace 0.5s ease-out ${i * 0.1}s both`
                  }}>
                    <span className="text-white font-semibold">{b.type}: <span className="text-yellow-400">{JSON.stringify(b.value||b.numbers)}</span></span>
                    <div className="flex items-center gap-2">
                      <div className="chip text-sm font-bold text-white flex items-center justify-center w-12 h-12" style={{
                        background: `radial-gradient(circle, ${b.amount >= 100 ? '#8B0000' : b.amount >= 50 ? '#006400' : b.amount >= 25 ? '#000080' : '#8B4513'}, #000)`,
                        border: '3px solid #FFD700',
                        borderRadius: '50%',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                        transform: 'perspective(100px) rotateX(15deg)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'perspective(100px) rotateX(15deg) translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'perspective(100px) rotateX(15deg) translateY(0px)'
                      }}>
                        ${b.amount}
                      </div>
                      <button
                        onClick={() => setBets(prev => prev.filter((_, index) => index !== i))}
                        className="ml-2 w-8 h-8 flex items-center justify-center text-white text-lg font-bold hover:text-red-500 hover:scale-110 transition-transform duration-200"
                        title="Remove bet"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-yellow-500/30 flex justify-between items-center">
              <span className="text-white font-bold text-lg">Total Bet:</span>
              <div className="balance-display text-xl">
                ${bets.reduce((sum,b)=>sum+b.amount,0)}
              </div>
            </div>
          </div>
          
          {resultUI && <div className="casino-felt p-8 rounded-3xl border-4 border-yellow-600 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-green-800/50"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-yellow-400 mb-6 text-shadow-gold">🎯 WINNING NUMBER 🎯</div>
              <div className={`text-8xl font-black mb-4 p-6 rounded-full border-4 inline-block ${
                resultUI.pocket === 0 ? 'text-green-400 border-green-400 bg-green-900/30' :
                [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(resultUI.pocket) ? 'text-red-400 border-red-400 bg-red-900/30' :
                'text-white border-white bg-gray-900/30'
              } animate-pulse-win`}>
                {resultUI.pocket}
              </div>
              <div className={`text-2xl font-bold mb-4 ${
                resultUI.pocket === 0 ? 'text-green-400' :
                [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(resultUI.pocket) ? 'text-red-400' :
                'text-white'
              }`}>
                {resultUI.pocket === 0 ? 'GREEN' :
                 [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(resultUI.pocket) ? 'RED' :
                 'BLACK'}
              </div>
              {/* Optional: audit */}
              {resultUI.serverPocket != null && (
                <div className="text-xs opacity-60">
                  server:{String(resultUI.serverPocket)} • client:{String(resultUI.pocket)}
                </div>
              )}
            </div>
          </div>}
          
        </div>
      </div>
      
      {/* Confetti Animation */}
      <Confetti />
      
      {/* Popup Messages */}
      <Popup />
    </div>
  )
}

export default RoulettePro;
