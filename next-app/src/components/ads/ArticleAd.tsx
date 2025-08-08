'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';

interface ArticleAdProps {
  index?: number;
}

export default function ArticleAd({ index = 0 }: ArticleAdProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-800/80 dark:via-amber-900/20 dark:to-orange-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-dashed border-amber-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative p-6 h-full flex flex-col justify-center items-center text-center min-h-[400px]">
        {/* Sponsor Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
          <Tag className="w-3 h-3" />
          Sponsor
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Premium Trading Aracları
          </h3>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
            Profesyonel trading için ihtiyacınız olan tüm araçlara erişin. 
            Gelişmiş analiz, otomatik stratejiler ve real-time veriler.
          </p>

          {/* Features */}
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              <span>Real-time Piyasa Verileri</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span>Gelişmiş Teknik Analiz</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span>Otomatik Trading Botları</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/40">
            <span>Ücretsiz Dene</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            * 30 gün ücretsiz deneme
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-700/20 dark:to-orange-700/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 dark:from-yellow-700/20 dark:to-amber-700/20 rounded-full blur-xl"></div>
      </div>
    </motion.div>
  );
}