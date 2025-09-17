import React, { useState } from 'react'
import Whiteboard from './components/Whiteboard'
import Summarizer from './components/Summarizer'

export default function App(){
  const [roomId, setRoomId] = useState('demo-room')
  return (
    <div className="app">
      <header><h1>AI Smart Whiteboard — Demo</h1></header>
      <main>
        <div className="left">
          <Whiteboard roomId={roomId} />
        </div>
        <div className="right">
          <Summarizer />
        </div>
      </main>
    </div>
  )
}
