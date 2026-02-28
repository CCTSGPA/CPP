import { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * Cloudflare Turnstile Widget Component
 * 
 * A CAPTCHA alternative that verifies users with minimal friction.
 * Automatically loads the Turnstile script and renders the widget.
 * 
 * @example
 * <TurnstileWidget
 *   siteKey="your-site-key"
 *   onVerify={(token) => console.log('Verified:', token)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 */
const TurnstileWidget = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
  refreshOnExpire = true,
}) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(() => !siteKey ? 'Site key is required' : null)

  // Load Turnstile script
  useEffect(() => {
    if (!siteKey) {
      return
    }

    // Check if script already loaded
    if (window.turnstile) {
      setIsLoaded(true)
      return
    }

    // Check if script is loading
    const existingScript = document.querySelector('script[src*="turnstile"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true))
      return
    }

    // Load Turnstile script
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
    }
    
    script.onerror = () => {
      const err = 'Failed to load Turnstile script'
      setError(err)
      onError?.(err)
    }
    
    document.head.appendChild(script)

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          console.warn('Error removing Turnstile widget:', e)
        }
      }
    }
  }, [siteKey, onError])

  // Render widget when script is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile || !siteKey) {
      return
    }

    // Remove existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
        // eslint-disable-next-line no-unused-vars
      } catch (_e) {
        // Widget might already be removed
      }
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        size: size,
        callback: (token) => {
          setError(null)
          onVerify?.(token)
        },
        'error-callback': (err) => {
          setError(err)
          onError?.(err)
        },
        'expired-callback': () => {
          onExpire?.()
          if (refreshOnExpire && widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current)
          }
        },
      })
      // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      const renderError = 'Failed to render Turnstile widget'
      // Use setTimeout to avoid direct setState in effect
      setTimeout(() => setError(renderError), 0)
      onError?.(renderError)
    }
  }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire, refreshOnExpire])

  // Reset widget method
  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [])

  // Expose reset method via ref
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.reset = reset
    }
  }, [reset])

  if (!siteKey) {
    return null
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div ref={containerRef} />
      {error && (
        <p className="text-red-500 text-sm mt-2">
          Verification error: {error}
        </p>
      )}
    </div>
  )
}

TurnstileWidget.propTypes = {
  siteKey: PropTypes.string.isRequired,
  onVerify: PropTypes.func,
  onError: PropTypes.func,
  onExpire: PropTypes.func,
  theme: PropTypes.oneOf(['auto', 'light', 'dark']),
  size: PropTypes.oneOf(['normal', 'compact']),
  className: PropTypes.string,
  refreshOnExpire: PropTypes.bool,
}

export default TurnstileWidget
