// Title Similarity Utility Functions for Forum Related Topics

// Turkish stop words to filter out
const TURKISH_STOP_WORDS = [
  've', 'ile', 'için', 'bir', 'bu', 'şu', 'o', 'da', 'de', 'den', 'dan',
  'ta', 'te', 'na', 'ne', 'ya', 'ye', 'ka', 'ke', 'sa', 'se',
  'mi', 'mı', 'mu', 'mü', 'ki', 'dı', 'di', 'du', 'dü',
  'lar', 'ler', 'ın', 'in', 'un', 'ün', 'nın', 'nin', 'nun', 'nün'
];

// Trading-specific terminology mapping
const TRADING_TERMS: Record<string, string[]> = {
  'bitcoin': ['btc', 'bitcoin', 'coin'],
  'ethereum': ['eth', 'ethereum', 'ether'],
  'forex': ['döviz', 'currency', 'fx', 'parite'],
  'analiz': ['analysis', 'teknik', 'temel', 'chart'],
  'strateji': ['strategy', 'sistem', 'method', 'yöntem'],
  'bot': ['robot', 'otomasyon', 'algoritma', 'automatic'],
  'ticaret': ['trading', 'trade', 'alım', 'satım'],
  'piyasa': ['market', 'borsa', 'exchange'],
  'yatırım': ['investment', 'invest', 'portfolio', 'portföy'],
  'risk': ['risk', 'stop', 'loss', 'zarar'],
  'kazanç': ['profit', 'kar', 'getiri', 'return'],
  'işlem': ['transaction', 'order', 'emir', 'pozisyon']
};

/**
 * Preprocess title by removing stop words and normalizing
 */
function preprocessTitle(title: string): string[] {
  if (!title) return [];
  
  return title
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞIÖÇ]/gi, '') // Keep Turkish characters
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !TURKISH_STOP_WORDS.includes(word) &&
      !word.match(/^\d+$/) // Filter out numbers
    )
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

/**
 * Expand words using trading terminology dictionary
 */
function expandWithSynonyms(words: string[]): string[] {
  const expandedWords = [...words];
  
  words.forEach(word => {
    // Check if word matches any trading term
    Object.entries(TRADING_TERMS).forEach(([key, synonyms]) => {
      if (synonyms.includes(word) || key === word) {
        // Add all synonyms
        synonyms.forEach(synonym => {
          if (!expandedWords.includes(synonym)) {
            expandedWords.push(synonym);
          }
        });
        // Add the key term
        if (!expandedWords.includes(key)) {
          expandedWords.push(key);
        }
      }
    });
  });
  
  return expandedWords;
}

/**
 * Calculate Jaccard similarity between two sets of words
 */
function calculateJaccardSimilarity(words1: string[], words2: string[]): number {
  if (words1.length === 0 && words2.length === 0) return 0;
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate word overlap score with position weighting
 */
function calculateWordOverlapScore(title1: string, title2: string): number {
  const words1 = preprocessTitle(title1);
  const words2 = preprocessTitle(title2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let score = 0;
  const maxLength = Math.max(words1.length, words2.length);
  
  // Check each word and give bonus for early positions
  words1.forEach((word, index) => {
    if (words2.includes(word)) {
      // Words at the beginning get higher weight
      const positionWeight = 1 - (index / maxLength) * 0.3;
      score += positionWeight;
    }
  });
  
  // Normalize by average length
  const avgLength = (words1.length + words2.length) / 2;
  return score / avgLength;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate fuzzy similarity using normalized Levenshtein distance
 */
function calculateFuzzySimilarity(title1: string, title2: string): number {
  const maxLength = Math.max(title1.length, title2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(title1.toLowerCase(), title2.toLowerCase());
  return 1 - (distance / maxLength);
}

/**
 * Main function to calculate comprehensive title similarity
 */
export function calculateTitleSimilarity(title1: string, title2: string): number {
  if (!title1 || !title2) return 0;
  if (title1 === title2) return 1;
  
  // Preprocess titles
  const words1 = preprocessTitle(title1);
  const words2 = preprocessTitle(title2);
  
  // Expand with synonyms
  const expandedWords1 = expandWithSynonyms(words1);
  const expandedWords2 = expandWithSynonyms(words2);
  
  // Calculate different similarity scores
  const jaccardScore = calculateJaccardSimilarity(expandedWords1, expandedWords2);
  const overlapScore = calculateWordOverlapScore(title1, title2);
  const fuzzyScore = calculateFuzzySimilarity(title1, title2);
  
  // Weighted combination
  const finalScore = (
    jaccardScore * 0.5 +      // Jaccard similarity (main factor)
    overlapScore * 0.3 +      // Word overlap with position weighting
    fuzzyScore * 0.2          // Fuzzy matching for typos
  );
  
  return Math.min(1, Math.max(0, finalScore)); // Clamp between 0 and 1
}

/**
 * Generate SQL LIKE patterns for database queries
 */
export function generateSearchPatterns(title: string): string[] {
  const words = preprocessTitle(title);
  const expandedWords = expandWithSynonyms(words);
  
  return expandedWords
    .filter(word => word.length >= 3) // Only meaningful words
    .map(word => `%${word}%`)
    .slice(0, 5); // Limit to avoid too complex queries
}

/**
 * Debug function to analyze similarity calculation
 */
export function debugTitleSimilarity(title1: string, title2: string): {
  similarity: number;
  details: {
    words1: string[];
    words2: string[];
    expandedWords1: string[];
    expandedWords2: string[];
    jaccardScore: number;
    overlapScore: number;
    fuzzyScore: number;
  };
} {
  const words1 = preprocessTitle(title1);
  const words2 = preprocessTitle(title2);
  const expandedWords1 = expandWithSynonyms(words1);
  const expandedWords2 = expandWithSynonyms(words2);
  
  const jaccardScore = calculateJaccardSimilarity(expandedWords1, expandedWords2);
  const overlapScore = calculateWordOverlapScore(title1, title2);
  const fuzzyScore = calculateFuzzySimilarity(title1, title2);
  
  const similarity = calculateTitleSimilarity(title1, title2);
  
  return {
    similarity,
    details: {
      words1,
      words2,
      expandedWords1,
      expandedWords2,
      jaccardScore,
      overlapScore,
      fuzzyScore
    }
  };
}