/**
 * Creates a URL-safe slug from a given string
 * Handles Turkish characters, special characters, and whitespace properly
 * 
 * @param text - The input text to convert to slug
 * @returns A URL-safe slug string
 * 
 * @example
 * slugify('Algoritmik Ticaret Başlangıç Rehberi!') 
 * // Returns: 'algoritmik-ticaret-baslangic-rehberi'
 * 
 * slugify('  Python ile Trading Bot   ') 
 * // Returns: 'python-ile-trading-bot'
 * 
 * slugify('MT5 & API Kullanımı (Detaylı)') 
 * // Returns: 'mt5-api-kullanimi-detayli'
 */
export function slugify(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim() // Remove leading/trailing whitespace
    .toLowerCase()
    // Replace Turkish characters with ASCII equivalents
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Replace other accented characters
    .replace(/[áàâäã]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôöõ]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/ñ/g, 'n')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .replace(/ń/g, 'n')
    .replace(/ř/g, 'r')
    .replace(/ś/g, 's')
    .replace(/ť/g, 't')
    .replace(/ž/g, 'z')
    // Remove any remaining non-alphanumeric characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces/tabs/newlines with single hyphen
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 * 
 * @example
 * makeSlugUnique('trading-bot', ['trading-bot', 'trading-bot-2'])
 * // Returns: 'trading-bot-3'
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Validates if a slug is safe and follows proper format
 * 
 * @param slug - The slug to validate
 * @returns True if slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Check if slug only contains lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  
  // Check length (should be between 1 and 200 characters)
  if (slug.length < 1 || slug.length > 200) {
    return false;
  }

  return slugRegex.test(slug);
}