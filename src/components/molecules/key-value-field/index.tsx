import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'

type KeyValueFieldProps = {
  label: string
  name: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  errors?: { [x: string]: unknown }
  className?: string
}

const KeyValueField: React.FC<KeyValueFieldProps> = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  errors,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [keyValueContent, setKeyValueContent] = useState('')
  const editableRef = useRef<HTMLTextAreaElement>(null)

  // Function to parse complex HTML (tables, lists) to key-value pairs
  const parseHtmlToKeyValue = (html: string) => {
    if (!html) return ''
    
    const temp = document.createElement('div')
    temp.innerHTML = html
    
    const keyValuePairs: string[] = []
    
    // Extract from list items (li elements) - handles nested lists in tables
    const listItems = temp.querySelectorAll('li')
    listItems.forEach(li => {
      const text = li.textContent || li.innerText || ''
      if (text.includes(':')) {
        const cleanedText = text
          .replace(/\s+/g, ' ')  // Replace multiple spaces/newlines with single space
          .trim()
          .replace(/:\s*:/, ':') // Remove double colons
        keyValuePairs.push(cleanedText)
      }
    })
    
    // If no list items found, try to extract from table cells
    if (keyValuePairs.length === 0) {
      const tableCells = temp.querySelectorAll('td, th')
      tableCells.forEach(cell => {
        const cellText = cell.textContent || cell.innerText || ''
        const lines = cellText.split('\n').filter(line => line.trim())
        lines.forEach(line => {
          if (line.includes(':')) {
            const cleanedText = line
              .replace(/\s+/g, ' ')
              .trim()
              .replace(/:\s*:/, ':')
            keyValuePairs.push(cleanedText)
          }
        })
      })
    }
    
    // If still no pairs found, fall back to plain text extraction
    if (keyValuePairs.length === 0) {
      const plainText = temp.textContent || temp.innerText || ''
      const lines = plainText.split('\n').filter(line => line.trim())
      lines.forEach(line => {
        if (line.includes(':')) {
          const cleanedText = line
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/:\s*:/, ':')
          keyValuePairs.push(cleanedText)
        }
      })
    }
    
    return keyValuePairs.length > 0 ? keyValuePairs.join('\n') : (temp.textContent || temp.innerText || '')
  }

  // Function to convert plain text key-value pairs to structured HTML
  const keyValueToHtml = (text: string) => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    // Check if content looks like key-value pairs (contains colons)
    const hasKeyValuePairs = lines.some(line => line.includes(':'))
    
    if (hasKeyValuePairs) {
      // Format as list for key-value pairs
      const listItems = lines.map(line => {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':')
          const value = valueParts.join(':').trim()
          return `<li style="text-align: left;"><strong>${key.trim()}:</strong> ${value}</li>`
        } else {
          // Handle non-colon lines as regular list items
          return `<li style="text-align: left;">${line}</li>`
        }
      }).join('')
      
      return `<ul>${listItems}</ul>`
    } else {
      // Regular paragraph format for non-structured content
      return lines.map(line => `<p>${line}</p>`).join('')
    }
  }

  useEffect(() => {
    const parsedContent = parseHtmlToKeyValue(value)
    setKeyValueContent(parsedContent)
  }, [value])

  const handleStartEdit = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.focus()
      }
    }, 0)
  }

  const handleFinishEdit = () => {
    const newHtmlContent = keyValueToHtml(keyValueContent)
    onChange(newHtmlContent)
    setIsEditing(false)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleFinishEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setKeyValueContent(parseHtmlToKeyValue(value))
    }
  }

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      <div
        className={clsx(
          'w-full min-h-[80px] px-small py-xsmall bg-grey-5 border border-grey-20 rounded-rounded cursor-text',
          'focus-within:shadow-input focus-within:border-violet-60',
          {
            'border-rose-50 focus-within:shadow-cta focus-within:shadow-rose-60/10 focus-within:border-rose-50':
              errors && name && errors[name],
          }
        )}
        onClick={!isEditing ? handleStartEdit : undefined}
      >
        {isEditing ? (
          <textarea
            ref={editableRef}
            value={keyValueContent}
            onChange={(e) => setKeyValueContent(e.target.value)}
            className="outline-none w-full min-h-[60px] text-grey-90 leading-base bg-transparent resize-none"
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={6}
          />
        ) : (
          <div 
            className={clsx("text-grey-90 leading-base min-h-[60px] whitespace-pre-wrap", {
              "text-grey-40": !keyValueContent
            })}
          >
            {keyValueContent || (
              <span className="text-grey-40">{placeholder || 'Click to edit...'}</span>
            )}
          </div>
        )}
      </div>
      {isEditing && (
        <p className="text-xs text-grey-50 mt-1">
          Press Ctrl+Enter to save, Escape to cancel
        </p>
      )}
      <InputError name={name} errors={errors} />
    </div>
  )
}

export default KeyValueField