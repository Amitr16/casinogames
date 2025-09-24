import React from 'react'
export default function BlackjackAdvanced({allowed={}, onAction}){
  const Btn = ({name, label}) => (
    <button className={`px-3 py-2 rounded-xl ${allowed[name]?'bg-white/20':'bg-white/5 opacity-50 cursor-not-allowed'}`}
            disabled={!allowed[name]} onClick={()=>onAction && onAction(name)}>{label}</button>
  )
  return (
    <div className="flex gap-2 flex-wrap">
      <Btn name="hit" label="Hit" />
      <Btn name="stand" label="Stand" />
      <Btn name="double" label="Double" />
      <Btn name="split" label="Split" />
      <Btn name="insurance" label="Insurance" />
      <Btn name="surrender" label="Surrender" />
    </div>
  )
}
