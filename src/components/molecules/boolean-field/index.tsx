import React from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'

type BooleanFieldProps = {
  label: string
  name: string
  value?: boolean | string
  onChange: (value: boolean) => void
  onBlur?: () => void
  required?: boolean
  errors?: { [x: string]: unknown }
  className?: string
  description?: string
}

const BooleanField: React.FC<BooleanFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  errors,
  className,
  description
}) => {
  // Convert string values to boolean
  const booleanValue = typeof value === 'string' ? value === 'true' : Boolean(value)

  const handleToggle = () => {
    onChange(!booleanValue)
    onBlur?.()
  }

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleToggle}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-60 focus:ring-offset-2',
            {
              'bg-violet-60': booleanValue,
              'bg-grey-20': !booleanValue,
              'border-rose-50': errors && name && errors[name],
            }
          )}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
              {
                'translate-x-6': booleanValue,
                'translate-x-1': !booleanValue,
              }
            )}
          />
        </button>
        
        <span className={clsx('text-sm', {
          'text-grey-90 font-medium': booleanValue,
          'text-grey-50': !booleanValue,
        })}>
          {booleanValue ? 'Yes' : 'No'}
        </span>
      </div>

      {description && (
        <p className="text-xs text-grey-50 mt-1">{description}</p>
      )}

      <InputError name={name} errors={errors} />
    </div>
  )
}

export default BooleanField