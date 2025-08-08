'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DatabaseTest() {
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [dbMessage, setDbMessage] = useState('')

  const testDatabase = async () => {
    setDbStatus('testing')
    setDbMessage('Veritabanı bağlantısı test ediliyor...')

    try {
      const supabase = createClient()
      
      // Try to query the database (this will check if we can connect)
      const { data, error } = await supabase
        .from('test') // This will fail if table doesn't exist, but connection will work
        .select('*')
        .limit(1)

      if (error) {
        // If it's a table not found error, that's actually good - it means connection works
        if (error.message.includes('relation "public.test" does not exist') || 
            error.message.includes('does not exist')) {
          setDbStatus('success')
          setDbMessage('✅ Veritabanı bağlantısı başarılı! (Test tablosu bulunamadı, bu normal)')
        } else {
          throw error
        }
      } else {
        setDbStatus('success')
        setDbMessage('✅ Veritabanı bağlantısı başarılı!')
      }
      
    } catch (error: any) {
      console.error('Database connection error:', error)
      setDbStatus('error')
      setDbMessage(`❌ Veritabanı hatası: ${error.message}`)
    }
  }

  const getStatusColor = () => {
    switch (dbStatus) {
      case 'idle': return 'bg-neutral-100 text-neutral-800 border-neutral-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Database Connection Test</h3>
        <button 
          onClick={testDatabase}
          disabled={dbStatus === 'testing'}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {dbStatus === 'testing' ? 'Test Ediliyor...' : 'Test Et'}
        </button>
      </div>
      
      {dbStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {dbStatus === 'testing' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            )}
            <span className="font-medium">{dbMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}