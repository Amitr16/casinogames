import React, { useEffect, useState } from 'react'
export default function CrashWSClient({wsUrl}){
  const [x, setX] = useState(1.0)
  const [crashed, setCrashed] = useState(false)
  useEffect(()=>{
    const url = wsUrl || (window.CASINO_API.replace('http','ws') + '/ws/crash')
    const ws = new WebSocket(url)
    ws.onmessage = (ev)=>{
      const msg = JSON.parse(ev.data)
      if(msg.type==='tick'){ setX(msg.x) }
      if(msg.type==='crash'){ setCrashed(true) }
    }
    return ()=>ws.close()
  },[wsUrl])
  return <div className="p-6 bg-gradient-to-r from-red-900 to-orange-900 rounded-2xl border-2 border-red-600 shadow-2xl">
    <div className="text-4xl font-bold text-center">
      <span className={`${crashed ? 'text-red-400 animate-pulse' : 'text-green-400'} transition-all duration-300`}>
        {x.toFixed(2)}x
      </span>
      {crashed && <div className="text-red-500 text-2xl mt-2 animate-bounce">💥 CRASHED!</div>}
    </div>
  </div>
}
