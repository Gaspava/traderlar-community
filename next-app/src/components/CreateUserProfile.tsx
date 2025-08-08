'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreateUserProfile() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage('Lütfen önce giriş yapın');
        return;
      }

      const response = await fetch('/api/test/create-user', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil oluşturulamadı');
      }

      setMessage('Profil başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error:', error);
      setMessage(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black rounded-lg p-4 border border-neutral-800 shadow-lg">
      <h3 className="text-white font-medium mb-2">Test: Kullanıcı Profili</h3>
      <button
        onClick={handleCreateProfile}
        disabled={loading}
        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Oluşturuluyor...' : 'Profil Oluştur'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('başarı') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}