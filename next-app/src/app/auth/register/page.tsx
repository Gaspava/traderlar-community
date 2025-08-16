'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            username: data.username,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Bu email adresi zaten kayıtlı');
        } else {
          setError('Kayıt olurken bir hata oluştu');
        }
        return;
      }

      // Create user profile in users table
      if (authData.user) {
        let profileCreated = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!profileCreated && attempts < maxAttempts) {
          attempts++;
          
          try {
            // First check if user already exists
            const { data: existingUser } = await supabase
              .from('users')
              .select('id, name, username')
              .eq('id', authData.user.id)
              .single();
            
            if (!existingUser) {
              // Insert new user profile
              const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert({
                  id: authData.user.id,
                  email: data.email,
                  name: data.name,
                  username: data.username,
                  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.id}`,
                  role: 'user'
                })
                .select()
                .single();

              if (insertError) {
                console.error(`Profile creation error (attempt ${attempts}):`, insertError);
                if (attempts === maxAttempts) {
                  setError('Profil oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
                  return;
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                console.log('User profile created successfully:', insertedUser);
                profileCreated = true;
              }
            } else {
              // User exists, update profile if needed
              const needsUpdate = !existingUser.name || !existingUser.username;
              
              if (needsUpdate) {
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ 
                    name: data.name, 
                    username: data.username 
                  })
                  .eq('id', authData.user.id);

                if (updateError) {
                  console.error('Profile update error:', updateError);
                }
              }
              profileCreated = true;
            }
          } catch (error) {
            console.error(`Profile operation error (attempt ${attempts}):`, error);
            if (attempts === maxAttempts) {
              setError('Profil işlemlerinde hata oluştu. Lütfen tekrar deneyin.');
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      router.push('/auth/verify-email');
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Ana Sayfaya Dön
      </Link>

      <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hoş Geldiniz</h1>
          <p className="text-muted-foreground">Trading topluluğuna katılın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                İsim Soyisim
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="Ahmet Yılmaz"
                  className="w-full bg-background border border-border rounded-lg px-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <input
                  {...register('username')}
                  type="text"
                  id="username"
                  placeholder="ahmetyilmaz"
                  className="w-full bg-background border border-border rounded-lg px-8 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="ornek@email.com"
                className="w-full bg-background border border-border rounded-lg px-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Kayıt olunuyor...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Üye Ol
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Giriş Yap
            </Link>
          </p>
        </div>

      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          2025 Traderlar.com. Tüm hakları saklıdır.
        </p>
      </div>
    </motion.div>
  );
}