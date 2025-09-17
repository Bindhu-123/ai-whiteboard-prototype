import React, { useRef, useEffect, useState } from 'react'
import io from 'socket.io-client'
import getStroke from 'perfect-freehand'

const socket = io('http://localhost:4000')

export default function Whiteboard({ roomId }){
  const svgRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState([])

  useEffect(()=>{
    socket.emit('join-room', { roomId, user: 'demo' })

    socket.on('draw', stroke => {
      const svg = svgRef.current
      if (!svg) return
      const path = document.createElementNS('http://www.w3.org/2000/svg','path')
      const d = stroke.map((p,i)=> (i? 'L':'M') + ' ' + p[0] + ' ' + p[1]).join(' ')
      path.setAttribute('d', d)
      path.setAttribute('stroke','black')
      path.setAttribute('stroke-width','2')
      path.setAttribute('fill','none')
      svg.appendChild(path)
    })

    socket.on('clear', () => {
      const svg = svgRef.current
      if (svg) svg.innerHTML = ''
    })

    return ()=> socket.off('draw')
  }, [roomId])

  const handlePointerDown = e => {
    setIsDrawing(true)
    const r = e.target.getBoundingClientRect()
    const p = [e.clientX - r.left, e.clientY - r.top]
    setPoints([p])
  }
  const handlePointerMove = e => {
    if(!isDrawing) return
    const r = e.target.getBoundingClientRect()
    const p = [e.clientX - r.left, e.clientY - r.top]
    setPoints(prev => {
      const next = [...prev, p]
      const svg = svgRef.current
      if (svg){
        const prevPreview = svg.querySelector('.preview')
        if (prevPreview) prevPreview.remove()
        const path = document.createElementNS('http://www.w3.org/2000/svg','path')
        const d = next.map((pt,i)=> (i? 'L':'M') + ' ' + pt[0] + ' ' + pt[1]).join(' ')
        path.setAttribute('d', d)
        path.setAttribute('stroke','gray')
        path.setAttribute('stroke-width','2')
        path.setAttribute('fill','none')
        path.classList.add('preview')
        svg.appendChild(path)
      }
      return next
    })
  }
  const handlePointerUp = e => {
    setIsDrawing(false)
    socket.emit('draw', { roomId, stroke: points })
    const svg = svgRef.current
    const prevPreview = svg.querySelector('.preview')
    if (prevPreview) prevPreview.remove()
    const path = document.createElementNS('http://www.w3.org/2000/svg','path')
    const d = points.map((pt,i)=> (i? 'L':'M') + ' ' + pt[0] + ' ' + pt[1]).join(' ')
    path.setAttribute('d', d)
    path.setAttribute('stroke','black')
    path.setAttribute('stroke-width','2')
    path.setAttribute('fill','none')
    svg.appendChild(path)
    setPoints([])
  }

  const clearBoard = () => {
    const svg = svgRef.current
    if (svg) svg.innerHTML = ''
    socket.emit('clear', { roomId })
  }

  return (
    <div className="whiteboard">
      <div className="wb-top">
        <button onClick={clearBoard}>Clear</button>
      </div>
      <svg
        ref={svgRef}
        className="canvas"
        width={800}
        height={500}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  )
}
