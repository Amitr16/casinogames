import React, { useState, useRef, useLayoutEffect } from 'react'
export default function Crash({onDone}){
  const api=window.CASINO_API
  const [stake,setStake]=useState(1)
  const [auto,setAuto]=useState(2.0)
  const [res,setRes]=useState(null)
  const [isFlying,setIsFlying]=useState(false)
  const [currentMultiplier,setCurrentMultiplier]=useState(1.0)
  const [flightTime,setFlightTime]=useState(0)
  const [cashedOut,setCashedOut]=useState(false)
  const [cashoutMultiplier,setCashoutMultiplier]=useState(null)
  const [showExplosion,setShowExplosion]=useState(false)
  
  // SVG trail refs and state
  const containerRef = useRef(null)
  const rocketRef = useRef(null)
  const [trailPoints, setTrailPoints] = useState({ x0: 0, y0: 0, x1: 0, y1: 0 })
  
  // Set the fixed launch point once (10% from left, 20px from bottom)
  useLayoutEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current
      const rect = el.getBoundingClientRect()
      setTrailPoints(p => ({
        ...p,
        x0: rect.width * 0.10,
        y0: rect.height - 20
      }))
    }
  }, [])
  
  // Update the moving endpoint each frame
  useLayoutEffect(() => {
    if (!isFlying || !containerRef.current || !rocketRef.current) return
    
    let raf
    const tick = () => {
      if (containerRef.current && rocketRef.current) {
        const c = containerRef.current.getBoundingClientRect()
        const r = rocketRef.current.getBoundingClientRect()
        // Bottom-center of rocket relative to container (this is where trail starts)
        const bx = r.left + r.width / 2 - c.left
        const by = r.top + r.height - c.top
        // Trail extends backward from rocket engine
        const trailLength = 60 // pixels
        const angle = -45 * (Math.PI / 180) // -45 degrees in radians
        const tx = bx + Math.cos(angle) * trailLength
        const ty = by + Math.sin(angle) * trailLength
        setTrailPoints(p => ({ x0: bx, y0: by, x1: tx, y1: ty }))
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isFlying])
  
  const cashOut = () => {
    if (isFlying && !cashedOut) {
      setCashedOut(true)
      setCashoutMultiplier(currentMultiplier)
      // Mark as manual cashout (will be handled in the timeout)
      window.manualCashout = { cashedOut: true, multiplier: currentMultiplier }
    }
  }
  
  const play= async()=>{
    setIsFlying(true)
    setCurrentMultiplier(1.0)
    setFlightTime(0)
    setRes(null)
    setCashedOut(false)
    setCashoutMultiplier(null)
    setShowExplosion(false)
    
    // Get the crash result from backend first
    const r = await fetch(`${api}/casino/crash/play`, {method:'POST', headers:{'Content-Type':'application/json','X-User-Id':'demo-user'}, body: JSON.stringify({stake, currency:'USD', params:{auto_cashout:auto}})})
    const j = await r.json()
    const actualCrashMultiplier = j.result?.multiplier || 1.01
    
    let autoCashedOut = false
    let manualCashedOut = false
    
    const flightInterval = setInterval(() => {
      setCurrentMultiplier(prev => {
        const newMultiplier = prev + 0.05
        
        // Check for auto cashout trigger
        if (!autoCashedOut && !manualCashedOut && auto && newMultiplier >= auto) {
          autoCashedOut = true
          setCashedOut(true)
          setCashoutMultiplier(auto)
          // Update the result to show auto cashout
          j.payout = stake * auto
          j.result = { ...j.result, auto_cashed_out: true, auto_cashout_multiplier: auto }
          // Stop the animation immediately when auto cashout triggers
          clearInterval(flightInterval)
          setTimeout(() => {
            setIsFlying(false)
            setFlightTime(0)
            setRes(j)
            onDone&&onDone()
          }, 500) // Brief pause to show the auto cashout moment
          return auto // Stop at auto cashout value
        }
        
        return newMultiplier
      })
      setFlightTime(prev => prev + 0.1)
    }, 100)
    
    // Calculate flight duration based on actual crash multiplier (but cap it)
    const flightDuration = Math.min(actualCrashMultiplier * 1000, 5000) // Max 5 seconds
    
    setTimeout(() => {
      // Only run this if auto cashout didn't already trigger
      if (!autoCashedOut) {
        clearInterval(flightInterval)
        
        // Stop at actual crash multiplier if not already cashed out
        if (!manualCashedOut) {
          setCurrentMultiplier(actualCrashMultiplier)
          setShowExplosion(true)
          
          // Hold explosion for 3 seconds before showing result
          setTimeout(() => {
            setShowExplosion(false)
            setIsFlying(false)
            setFlightTime(0)
            
            // If manual cashout happened, override the result
            if (window.manualCashout?.cashedOut) {
              j.payout = stake * window.manualCashout.multiplier
              j.result = { ...j.result, manual_cashed_out: true, manual_cashout_multiplier: window.manualCashout.multiplier }
              window.manualCashout = null // Clean up
            }
            
            setRes(j)
            onDone&&onDone()
          }, 3000) // Hold explosion for 3 seconds
        } else {
          // For manual cashouts, transition immediately
          setIsFlying(false)
          setFlightTime(0)
          
          // If manual cashout happened, override the result
          if (window.manualCashout?.cashedOut) {
            j.payout = stake * window.manualCashout.multiplier
            j.result = { ...j.result, manual_cashed_out: true, manual_cashout_multiplier: window.manualCashout.multiplier }
            window.manualCashout = null // Clean up
          }
          
          setRes(j)
          onDone&&onDone()
        }
      }
    }, flightDuration)
  }
  return <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-bold text-shadow-gold text-yellow-400 mb-4 animate-glow-pulse casino-title">
        🚀 CRASH ROYALE 🚀
      </h2>
      <div className="text-xl text-yellow-300 opacity-90 font-semibold">Ride the Rocket • Cash Out Before the Crash</div>
    </div>
    
    <div className="flex gap-8 items-center justify-center p-8 glass-effect rounded-3xl neon-glow">
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Bet Amount</label>
        <input 
          type="number" 
          value={stake} 
          onChange={e=>setStake(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="$20" 
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Auto Cashout</label>
        <input 
          type="number" 
          step="0.1" 
          value={auto} 
          onChange={e=>setAuto(+e.target.value)} 
          className="input w-36 text-center text-2xl font-bold" 
          placeholder="2.0x" 
        />
      </div>
      
      <button 
        onClick={play} 
        className="btn text-2xl px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-2 border-red-400"
        style={{minWidth: '200px'}}
      >
        <span className="flex items-center gap-3">
          <div className="text-3xl animate-bounce">🚀</div>
          <span className="font-black">LAUNCH</span>
        </span>
      </button>
      
      {/* Live Stake Display and Cashout Button */}
      {isFlying && !cashedOut && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-green-400 font-bold text-sm uppercase tracking-widest">Current Value</label>
          <div className="balance-display text-3xl font-black text-green-400 animate-pulse">
            ${(stake * currentMultiplier).toFixed(2)}
          </div>
          <button 
            onClick={cashOut}
            className="btn text-xl px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-2 border-green-400 animate-pulse"
          >
            💰 CASH OUT 💰
          </button>
        </div>
      )}
      
      {/* Cashed Out Display */}
      {cashedOut && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-green-400 font-bold text-sm uppercase tracking-widest">Cashed Out!</label>
          <div className="balance-display text-3xl font-black text-green-400 animate-pulse-win">
            ${(stake * cashoutMultiplier).toFixed(2)}
          </div>
          <div className="text-lg text-green-300 font-bold">
            @ {cashoutMultiplier.toFixed(2)}x
          </div>
        </div>
      )}
      
      {/* Final Result Display */}
      {!isFlying && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Total Win</label>
          <div className={`balance-display text-3xl font-black ${res?.payout > 0 ? 'animate-pulse-win' : ''}`}>
            ${res?.payout?.toFixed(2)||'0.00'}
          </div>
        </div>
      )}
    </div>
    
    {/* Rocket Flight Animation Area */}
    {isFlying && (
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          height: '400px',
          background: 'linear-gradient(to bottom, #1e3a8a, #581c87)',
          borderRadius: '24px',
          border: '4px solid #eab308',
          overflow: 'hidden',
          margin: '20px 0'
        }}>
        {/* SVG Trail Overlay */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <defs>
            <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ff8c42" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffa726" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Dynamic trail line */}
          <line 
            x1={trailPoints.x0} 
            y1={trailPoints.y0} 
            x2={trailPoints.x1} 
            y2={trailPoints.y1}
            stroke="url(#trail)" 
            strokeWidth="8" 
            strokeLinecap="round"
            filter="url(#glow)" 
          />
        </svg>
        
        {/* Flying Rocket */}
        <div 
          ref={rocketRef}
          style={{
            position: 'absolute',
            bottom: `${20 + Math.min(currentMultiplier * 35, 380)}px`,
            left: `${Math.min(10 + currentMultiplier * 8, 60)}%`,
            fontSize: '60px',
            transition: 'all 0.1s ease-linear',
            transform: 'rotate(-15deg)',
            display: 'inline-block',
            zIndex: 2
          }}>
          🚀
        </div>
        
        {/* Multiplier Display */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fbbf24',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          {currentMultiplier.toFixed(2)}x
        </div>
        
        {/* Explosion Animation */}
        {showExplosion && (
          <div style={{
            position: 'absolute',
            bottom: `${20 + Math.min(currentMultiplier * 35, 380) + 40}px`,
            left: `${Math.min(10 + currentMultiplier * 8, 60)}%`,
            transform: 'translate(-50%, 50%)',
            fontSize: '120px',
            animation: 'explosion 3s ease-out',
            zIndex: 10
          }}>
            💥
          </div>
        )}
        
        {/* Additional explosion effects during crash */}
        {showExplosion && (
          <>
            <div style={{
              position: 'absolute',
              bottom: `${20 + Math.min(currentMultiplier * 35, 380) + 40}px`,
              left: `${Math.min(10 + currentMultiplier * 8, 60)}%`,
              transform: 'translate(-50%, 50%)',
              fontSize: '80px',
              animation: 'explosion 3s ease-out 0.2s',
              zIndex: 9,
              opacity: 0.8
            }}>
              💥
            </div>
            <div style={{
              position: 'absolute',
              bottom: `${20 + Math.min(currentMultiplier * 35, 380) + 40}px`,
              left: `${Math.min(10 + currentMultiplier * 8, 60)}%`,
              transform: 'translate(-50%, 50%)',
              fontSize: '60px',
              animation: 'explosion 3s ease-out 0.4s',
              zIndex: 8,
              opacity: 0.6
            }}>
              💥
            </div>
          </>
        )}
        
        {/* Stars Background */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '4px',
          height: '4px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '3px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          width: '2px',
          height: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.7
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '25%',
          width: '3px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.5
        }}></div>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '70%',
          width: '2px',
          height: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>
      </div>
    )}
    
    {res && <div className="relative p-8 bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-3xl border-4 border-red-500 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse"></div>
      <div className="relative z-10 text-center">
        <div className="text-3xl font-bold text-yellow-400 mb-6 text-shadow-gold">
          {res.result?.auto_cashed_out ? '🎯 AUTO CASHOUT RESULT 🎯' :
           res.result?.manual_cashed_out ? '🎯 CASHOUT RESULT 🎯' :
           '🚀 CRASH RESULT 🚀'}
        </div>
        
        <div className="mb-8">
          <div className={`text-8xl font-black mb-4 ${
            res.result?.multiplier >= 2 ? 'text-green-400 animate-pulse-win' : 
            res.result?.multiplier >= 1.5 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {/* Show the relevant multiplier based on what actually happened */}
            {res.result?.auto_cashed_out ? res.result.auto_cashout_multiplier?.toFixed(2) + 'x' :
             res.result?.manual_cashed_out ? res.result.manual_cashout_multiplier?.toFixed(2) + 'x' :
             res.result?.multiplier?.toFixed(2) + 'x'}
          </div>
          
          {res.result?.auto_cashed_out && (
            <div className="space-y-2">
              <div className="text-2xl text-green-400 font-bold bg-green-900/30 rounded-xl p-4 inline-block border-2 border-green-400">
                ✅ Auto Cashout: {res.result.auto_cashout_multiplier?.toFixed(2)}x
              </div>
              <div className="text-lg text-gray-400 font-semibold">
                💥 Would have crashed at: {res.result?.multiplier?.toFixed(2)}x
              </div>
            </div>
          )}
          
          {res.result?.manual_cashed_out && (
            <div className="text-2xl text-blue-400 font-bold bg-blue-900/30 rounded-xl p-4 inline-block border-2 border-blue-400">
              🎯 Manual Cashout: {res.result.manual_cashout_multiplier?.toFixed(2)}x
            </div>
          )}
        </div>
        
        <div className={`text-4xl font-black p-6 rounded-2xl ${
          res.payout > 0 ? 'text-green-400 bg-green-900/30 animate-pulse-win' : 'text-red-400 bg-red-900/30'
        }`}>
          {res.result?.auto_cashed_out ? '✅ AUTO CASHOUT TRIGGERED! ✅' :
           res.result?.manual_cashed_out ? '🎯 MANUAL CASHOUT SUCCESS! 🎯' : 
           res.payout > 0 ? '🎉 SUCCESSFUL FLIGHT! 🎉' : '💥 ROCKET CRASHED! 💥'}
        </div>
        
        {res.result?.multiplier >= 5 && (
          <div className="text-6xl font-black text-yellow-400 text-shadow-gold animate-jackpot mt-6">
            🌟 HIGH MULTIPLIER! 🌟
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 text-6xl animate-ball-bounce">
        {res.payout > 0 ? '🚀' : '💥'}
      </div>
    </div>}
    
    <div className="grid grid-cols-4 gap-4 text-center text-yellow-300">
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">🚀</div>
        <div className="font-semibold">Low Risk</div>
        <div className="text-green-400 font-bold">1.2x - 2.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">⭐</div>
        <div className="font-semibold">Medium Risk</div>
        <div className="text-yellow-400 font-bold">2.0x - 5.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">🔥</div>
        <div className="font-semibold">High Risk</div>
        <div className="text-orange-400 font-bold">5.0x - 10.0x</div>
      </div>
      <div className="glass-effect p-4 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="text-3xl mb-2">💎</div>
        <div className="font-semibold">Extreme Risk</div>
        <div className="text-red-400 font-bold">10.0x+</div>
      </div>
    </div>
  </div>
}
