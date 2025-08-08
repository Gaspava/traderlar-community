'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [message, setMessage] = useState('Supabase bağlantısı test ediliyor...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        
        // Test the connection with a simple health check
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        // If we get here, the connection is working
        setStatus('success')
        setMessage('✅ Supabase bağlantısı başarılı!')
        
      } catch (error: any) {
        console.error('Supabase connection error:', error)
        setStatus('error')
        setMessage(`❌ Bağlantı hatası: ${error.message}`)
      }
    }

    testConnection()
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center gap-2">
        {status === 'testing' && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}