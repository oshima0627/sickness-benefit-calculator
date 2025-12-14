'use client'

import { useState } from 'react'
import { FAQ_DATA } from '../utils/constants'
import './FAQ.css'

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (openItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="faq">
      <h3 className="section-title">よくある質問</h3>
      
      <div className="faq-list">
        {FAQ_DATA.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${openItems.has(index) ? 'open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.has(index)}
            >
              <span className="question-text">{item.question}</span>
              <span className="question-icon">
                {openItems.has(index) ? '−' : '+'}
              </span>
            </button>
            
            <div className="faq-answer">
              <div className="answer-content">
                <p>{item.answer}</p>
                {item.source && (
                  <cite className="answer-source">出典: {item.source}</cite>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}