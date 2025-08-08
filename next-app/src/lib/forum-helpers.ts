export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[Ğ]/g, 'g')
    .replace(/[Ü]/g, 'u')
    .replace(/[Ş]/g, 's')
    .replace(/[İ]/g, 'i')
    .replace(/[Ö]/g, 'o')
    .replace(/[Ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} hafta önce`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ay önce`;
  return date.toLocaleDateString('tr-TR');
}

export function getIconComponent(iconName: string) {
  const icons: { [key: string]: string } = {
    'MessageCircle': 'MessageCircle',
    'Bot': 'Bot',
    'TrendingUp': 'TrendingUp',
    'LineChart': 'LineChart',
    'GraduationCap': 'GraduationCap',
    'Code': 'Code',
    'PieChart': 'PieChart',
    'Bitcoin': 'Bitcoin',
    'Building': 'Building',
    'Brain': 'Brain',
    'Scale': 'Scale'
  };
  
  return icons[iconName] || 'MessageCircle';
}