'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Save, 
  Camera, 
  MapPin, 
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  User as UserIcon,
  Mail,
  AtSign
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır').regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  bio: z.string().max(500, 'Bio en fazla 500 karakter olabilir').optional(),
  location: z.string().max(100, 'Konum en fazla 100 karakter olabilir').optional(),
  website: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  twitter: z.string().regex(/^[A-Za-z0-9_]*$/, 'Geçerli bir Twitter kullanıcı adı giriniz').optional(),
  github: z.string().regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Geçerli bir GitHub kullanıcı adı giriniz').optional(),
  linkedin: z.string().regex(/^[a-zA-Z0-9-]{3,100}$/, 'Geçerli bir LinkedIn kullanıcı adı giriniz').optional(),
  years_trading: z.number().min(0).max(50).optional(),
  trading_style: z.string().optional(),
  favorite_markets: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  profile: User;
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      username: profile.username,
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      twitter: profile.twitter || '',
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      years_trading: profile.years_trading || 0,
      trading_style: profile.trading_style || '',
      favorite_markets: profile.favorite_markets || [],
    }
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
      
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload to Supabase Storage
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
        
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      // Update profile
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
        
      toast({
        title: "Avatar güncellendi",
        description: "Profil fotoğrafınız başarıyla güncellendi.",
      });
      
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Avatar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };
  
  const tradingStyles = [
    'Scalping',
    'Day Trading',
    'Swing Trading',
    'Position Trading',
    'Algoritmik Trading',
    'Copy Trading'
  ];
  
  const markets = [
    'Forex',
    'Kripto',
    'Hisse',
    'Emtia',
    'Endeks',
    'Opsiyon'
  ];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
              <Camera className="h-4 w-4" />
              Fotoğrafı Değiştir
            </div>
          </Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG veya GIF. Maksimum 2MB.
          </p>
        </div>
      </div>
      
      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Ad Soyad
            </div>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Adınız Soyadınız"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              Kullanıcı Adı
            </div>
          </Label>
          <Input
            id="username"
            {...register('username')}
            placeholder="kullaniciadi"
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>
      </div>
      
      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Hakkında</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Kendinizden bahsedin..."
          rows={4}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>
      
      {/* Location & Website */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Konum
            </div>
          </Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="İstanbul, Türkiye"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Website
            </div>
          </Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://example.com"
            type="url"
          />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>
      </div>
      
      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Sosyal Medya</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="twitter">
              <div className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </div>
            </Label>
            <Input
              id="twitter"
              {...register('twitter')}
              placeholder="kullaniciadi"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </div>
            </Label>
            <Input
              id="github"
              {...register('github')}
              placeholder="kullaniciadi"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </div>
            </Label>
            <Input
              id="linkedin"
              {...register('linkedin')}
              placeholder="kullaniciadi"
            />
          </div>
        </div>
      </div>
      
      {/* Trading Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Trading Bilgileri</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="years_trading">Deneyim (Yıl)</Label>
            <Input
              id="years_trading"
              type="number"
              min="0"
              max="50"
              {...register('years_trading', { valueAsNumber: true })}
              placeholder="5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trading_style">Trading Stili</Label>
            <Select
              value={watch('trading_style')}
              onValueChange={(value) => setValue('trading_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stil seçin" />
              </SelectTrigger>
              <SelectContent>
                {tradingStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </form>
  );
}