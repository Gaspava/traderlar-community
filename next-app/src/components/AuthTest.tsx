'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthTest() {
  const [authStatus, setAuthStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [authMessage, setAuthMessage] = useState('')

  const testAuth = async () => {
    setAuthStatus('testing')
    setAuthMessage('Authentication sistemi test ediliyor...')

    try {
      const supabase = createClient()
      
      // Test auth system by checking current session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      // Check if we can get user (even if null, it means auth system is working)
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // "Auth session missing" is actually a GOOD sign - it means auth system is working
      if (userError && userError.message === 'Auth session missing!') {
        setAuthStatus('success')
        setAuthMessage('✅ Authentication sistemi çalışıyor! (Oturum açmış kullanıcı yok - Bu normal!)')
        return
      }

      if (userError) {
        throw userError
      }

      setAuthStatus('success')
      if (user) {
        setAuthMessage('✅ Authentication sistemi çalışıyor! (Kullanıcı oturum açmış)')
      } else {
        setAuthMessage('✅ Authentication sistemi çalışıyor! (Oturum açmış kullanıcı yok)')
      }
      
    } catch (error: any) {
      console.error('Auth system error:', error)
      setAuthStatus('error')
      setAuthMessage(`❌ Authentication hatası: ${error.message}`)
    }
  }

  const getStatusColor = () => {
    switch (authStatus) {
      case 'idle': return 'bg-neutral-100 text-neutral-800 border-neutral-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Authentication Test</h3>
        <button 
          onClick={testAuth}
          disabled={authStatus === 'testing'}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {authStatus === 'testing' ? 'Test Ediliyor...' : 'Test Et'}
        </button>
      </div>
      
      {authStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {authStatus === 'testing' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            )}
            <span className="font-medium">{authMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}