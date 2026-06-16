import React, { useState } from 'react'
import LeadForm from '../../../components/LeadForm'
export default function AiLeadCapturePage() {
const [preference, setPreference] = useState('')
const [suggestion, setSuggestion] = useState('')
function generateSuggestion() {
  const text = preference.toLowerCase()
  if (text.includes('meat') || text.includes('beef')) {
    setSuggestion('AI Suggestion: Try Beef Choma Plate with Ugali, Kachumbari, and a cold soft drink.')
    return
  }
  if (text.includes('chicken')) {
    setSuggestion('AI Suggestion: Try Chicken Choma Plate with Chips and fresh juice.')
    return
  }
  if (text.includes('drink') || text.includes('bar')) {
    setSuggestion('AI Suggestion: Visit our bar menu and ask the waiter for today’s controlled stock specials.')
    return
  }
  setSuggestion('AI Suggestion: Try our best-selling choma meal and ask about today’s offer.')
}
return (
<section className="section">
<div className="container grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
<div>
<h1>AI Order Assistant</h1>
<p>
Tell us what you feel like eating or drinking. Our AI-enabled assistant will guide you.
</p>
<textarea
className="input"
rows="5"
placeholder="Example: I want beef, ugali, and something cold"
value={preference}
onChange={(e) => setPreference(e.target.value)}
/>
<br />
<br />
<button className="btn" onClick={generateSuggestion}>
Generate Suggestion
</button>
{suggestion ? (
<div className="card" style={{ marginTop: 20 }}>
{suggestion}
</div>
) : null}
</div>
<div className="card">
<h3>Want us to contact you?</h3>
<LeadForm type="AI_ORDER_ASSISTANT" />
</div>
</div>
</section>
)
}
