'use client';

import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-neutral-800 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
        >
          <Mail className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-2">Email Adresinizi Doğrulayın</h1>
        <p className="text-neutral-400 mb-6">
          Kayıt işleminizi tamamlamak için email adresinize gönderdiğimiz doğrulama linkine tıklayın.
        </p>

        <div className="bg-neutral-900/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-300">
            Email gelmedi mi? Spam klasörünüzü kontrol edin veya tekrar gönderin.
          </p>
        </div>

        <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-4">
          Tekrar Gönder
        </button>

        <Link
          href="/auth/login"
          className="text-green-400 hover:text-green-300 font-medium transition-colors text-sm"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    </motion.div>
  );
}