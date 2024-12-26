class Utils {
  static singular(word: string) {
    // Handle regular plural patterns
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    
    if (word.endsWith('ses') || word.endsWith('shes') || word.endsWith('ches') || word.endsWith('xes')) {
      return word.slice(0, -2);
    }

    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }

    // If no plural pattern matches, return original word
    return word;
  }

  static plural(word: string) {
    // Handle words ending in y
    if (word.endsWith('y')) {
      // If preceded by a consonant, change y to ies
      if (!/[aeiou]/.test(word[word.length - 2])) {
        return word.slice(0, -1) + 'ies';
      }
      // If preceded by a vowel, just add s
      return word + 's';
    }

    // Handle words ending in o, s, z, x, ch, sh
    if (word.endsWith('o') || word.endsWith('s') || word.endsWith('z') || 
        word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }

    // Handle words ending in f or fe
    if (word.endsWith('f')) {
      return word.slice(0, -1) + 'ves';
    }
    if (word.endsWith('fe')) {
      return word.slice(0, -2) + 'ves';
    }

    // Default case: add s
    return word + 's';
  }

  static capitalize(word: string) {
    // Capitalize the first letter of all words
    return word
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  static decamelize(word: string) {
    // Split camelCase into separate words with spaces
    return word
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase();
  }
}

export { Utils };
