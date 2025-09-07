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
  const [internalValue, setInternalValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Convert HTML with <br> tags to plain text with newlines for editing
  const htmlToPlainText = (html: string): string => {
    if (!html) return ''
    
    // Handle <br> and <br/> and <br /> tags (case insensitive)
    let plainText = html.replace(/<br\s*\/?>/gi, '\n')
    
    // Handle paragraph tags by replacing </p><p> with double newlines and removing outer <p> tags
    plainText = plainText.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    plainText = plainText.replace(/<\/?p[^>]*>/gi, '\n')
    
    // Handle div tags similarly to p tags
    plainText = plainText.replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    plainText = plainText.replace(/<\/?div[^>]*>/gi, '\n')
    
    // Remove any other HTML tags
    plainText = plainText.replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = plainText
    plainText = tempDiv.textContent || tempDiv.innerText || ''
    
    // Clean up multiple newlines and trim
    plainText = plainText.replace(/\n\s*\n\s*\n/g, '\n\n').trim()
    
    return plainText
  }

  // Convert plain text with newlines to HTML with <br> tags for storage
  const plainTextToHtml = (plainText: string): string => {
    if (!plainText) return ''
    
    // Escape HTML characters first
    const escaped = plainText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    
    // Convert newlines to <br> tags
    return escaped.replace(/\n/g, '<br>')
  }

  // Initialize and sync with external value changes
  useEffect(() => {
    const plainText = htmlToPlainText(value || '')
    setInternalValue(plainText)
  }, [value])

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(80, textarea.scrollHeight)}px`
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    
    // Auto-resize
    autoResize(e.target)
    
    // Convert to HTML and call parent onChange
    const htmlValue = plainTextToHtml(newValue)
    onChange(htmlValue)
  }

  const handleTextareaBlur = () => {
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow normal Enter behavior for new lines
    // Optionally, you can add Ctrl+Enter for some special action if needed
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = internalValue.substring(0, start) + '  ' + internalValue.substring(end)
      setInternalValue(newValue)
      
      // Update HTML value
      const htmlValue = plainTextToHtml(newValue)
      onChange(htmlValue)
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // Auto-resize on mount and when value changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current)
    }
  }, [internalValue])

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      <div className="relative">
        <textarea
          ref={textareaRef}
          name={name}
          value={internalValue}
          onChange={handleTextareaChange}
          onBlur={handleTextareaBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Enter description...'}
          className={clsx(
            'w-full min-h-[80px] max-h-[400px] px-small py-xsmall bg-grey-5 border border-grey-20 rounded-rounded resize-none',
            'focus:shadow-input focus:border-violet-60 focus:outline-none',
            'text-grey-90 leading-base font-normal text-small',
            'placeholder:text-grey-40',
            {
              'border-rose-50 focus:shadow-cta focus:shadow-rose-60/10 focus:border-rose-50':
                errors && name && errors[name],
            }
          )}
          style={{
            lineHeight: '1.5',
            fontFamily: 'inherit'
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <InputError name={name} errors={errors} />
        <p className="text-xs text-grey-50">
          Use Enter for new lines. HTML tags will be escaped automatically.
        </p>
      </div>
    </div>
  )
}

export default RichTextField
