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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textValue, setTextValue] = useState('')

  // Convert HTML with <br> tags to plain text with \n for display
  const htmlToText = (html: string): string => {
    if (!html) return ''
    
    // Replace <br> tags with newlines
    let text = html.replace(/<br\s*\/?>/gi, '\n')
    
    // Remove any remaining HTML tags
    text = text.replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    text = textarea.value
    
    return text
  }

  // Convert plain text with \n to HTML with <br> tags for storage
  const textToHtml = (text: string): string => {
    if (!text) return ''
    
    // Escape HTML characters
    const div = document.createElement('div')
    div.textContent = text
    let html = div.innerHTML
    
    // Replace newlines with <br> tags
    html = html.replace(/\n/g, '<br>')
    
    return html
  }

  // Auto-resize textarea to fit content
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.max(80, textareaRef.current.scrollHeight) + 'px'
    }
  }

  // Initialize text value from HTML value
  useEffect(() => {
    const text = htmlToText(value || '')
    setTextValue(text)
  }, [value])

  // Auto-resize when text changes
  useEffect(() => {
    autoResize()
  }, [textValue])

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setTextValue(newText)
    
    // Convert text to HTML for storage
    const htmlValue = textToHtml(newText)
    onChange(htmlValue)
  }

  // Handle blur event
  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
  }

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      
      {/* Simple Textarea */}
      <textarea
        ref={textareaRef}
        name={name}
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder || 'Enter description...'}
        className={clsx(
          'w-full min-h-[80px] px-small py-xsmall bg-grey-5 border border-grey-20 rounded-rounded resize-none overflow-hidden',
          'focus:shadow-input focus:border-violet-60 focus:outline-none',
          'text-grey-90 leading-base font-normal',
          {
            'border-rose-50 focus:shadow-cta focus:shadow-rose-60/10 focus:border-rose-50':
              errors && name && errors[name],
          }
        )}
        style={{
          lineHeight: '1.5',
          fontFamily: 'inherit',
        }}
      />
      
      <div className="flex justify-between items-center mt-1">
        <InputError name={name} errors={errors} />
        <p className="text-xs text-grey-50">
          Press Enter for new lines.
        </p>
      </div>
    </div>
  )
}

export default RichTextField
