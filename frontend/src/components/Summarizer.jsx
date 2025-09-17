import React, { useState } from 'react'
import axios from 'axios'
import mermaid from 'mermaid'

export default function Summarizer(){
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [translation, setTranslation] = useState('')
  const [mermaidCode, setMermaidCode] = useState('')

  const doSummarize = async () => {
    const r = await axios.post('http://localhost:4000/api/summarize', { text })
    setSummary(r.data.summary)
  }
  const doTranslate = async (to='English') => {
    const r = await axios.post('http://localhost:4000/api/translate', { text, to })
    setTranslation(r.data.translation)
  }
  const doIdeaToFlow = async () => {
    const r = await axios.post('http://localhost:4000/api/idea-to-flow', { ideaText: text })
    const code = r.data.mermaid || 'graph TD\nA[Start] --> B[End]'
    setMermaidCode(code)
    try { mermaid.initialize({ startOnLoad: false }) } catch(e){}
    setTimeout(()=> mermaid.init(undefined, document.querySelectorAll('.mermaid')), 200)
  }

  return (
    <div className="summarizer">
      <h3>Text Tools</h3>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} />
      <div className="btns">
        <button onClick={doSummarize}>Summarize</button>
        <button onClick={()=>doTranslate('English')}>Translate → English</button>
        <button onClick={doIdeaToFlow}>Idea → Flowchart</button>
      </div>

      {summary && (
        <div>
          <h4>Summary</h4>
          <pre>{summary}</pre>
        </div>
      )}

      {translation && (
        <div>
          <h4>Translation</h4>
          <pre>{translation}</pre>
        </div>
      )}

      {mermaidCode && (
        <div>
          <h4>Flowchart</h4>
          <div className="mermaid">{mermaidCode}</div>
        </div>
      )}
    </div>
  )
}
