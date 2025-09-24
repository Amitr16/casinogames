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
  return <div className="p-3 bg-white/10 rounded-2xl">x{ x.toFixed(2) } {crashed && '— CRASH!'}</div>
}
