import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'

type RichTextFieldProps = {
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

const RichTextField: React.FC<RichTextFieldProps> = ({
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
  const [htmlContent, setHtmlContent] = useState(value)
  const editableRef = useRef<HTMLDivElement>(null)

  // Function to strip HTML tags for display
  const stripHtml = (html: string) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Function to convert plain text to basic HTML
  const textToHtml = (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('')
  }

  useEffect(() => {
    setHtmlContent(value)
  }, [value])

  const handleStartEdit = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (editableRef.current) {
        // Set the content as plain text for editing
        editableRef.current.textContent = stripHtml(htmlContent)
        editableRef.current.focus()
      }
    }, 0)
  }

  const handleFinishEdit = () => {
    if (editableRef.current) {
      const plainText = editableRef.current.textContent || ''
      const newHtmlContent = textToHtml(plainText)
      setHtmlContent(newHtmlContent)
      onChange(newHtmlContent)
      setIsEditing(false)
      onBlur?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleFinishEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      if (editableRef.current) {
        editableRef.current.textContent = stripHtml(value)
      }
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
          <div
            ref={editableRef}
            contentEditable
            className="outline-none w-full min-h-[60px] text-grey-90 leading-base"
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div 
            className={clsx("text-grey-90 leading-base min-h-[60px]", {
              "text-grey-40": !htmlContent
            })}
            dangerouslySetInnerHTML={{ 
              __html: htmlContent || `<p class="text-grey-40">${placeholder || 'Click to edit...'}</p>`
            }}
          />
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

export default RichTextField