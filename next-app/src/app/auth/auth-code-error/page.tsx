'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCodeErrorPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Ana Sayfaya Dön
      </Link>

      <div className="bg-white/90 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Kimlik Doğrulama Hatası
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Giriş işlemi tamamlanırken bir hata oluştu. Lütfen tekrar deneyin.
        </p>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
          >
            Tekrar Giriş Yap
          </Link>
          
          <Link
            href="/auth/register"
            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
          >
            Yeni Hesap Oluştur
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Sorun devam ederse lütfen destek ekibiyle iletişime geçin.
        </p>
      </div>
    </motion.div>
  );
}