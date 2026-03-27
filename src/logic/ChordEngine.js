const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Convert flat notes to sharp equivalents for the internal engine
function normalizeNote(note) {
  const flatToSharp = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  return flatToSharp[note] || note;
}

export function transposeChord(chord, steps) {
  const regex = /^([A-G][b#]?)([^/]*)(?:\/([A-G][b#]?))?$/;
  const match = chord.match(regex);
  if (!match) return chord; 
  
  const root = normalizeNote(match[1]);
  const quality = match[2] || '';
  const bass = match[3] ? normalizeNote(match[3]) : null;

  const rootIdx = NOTES.indexOf(root);
  if (rootIdx === -1) return chord; 
  
  let newRootIdx = (rootIdx + steps) % 12;
  if (newRootIdx < 0) newRootIdx += 12;
  
  let result = NOTES[newRootIdx] + quality;
  
  if (bass) {
    const bassIdx = NOTES.indexOf(bass);
    if (bassIdx !== -1) {
      let newBassIdx = (bassIdx + steps) % 12;
      if (newBassIdx < 0) newBassIdx += 12;
      result += '/' + NOTES[newBassIdx];
    }
  }
  return result;
}

// Nashville Number System Parser
export function parseNashvilleNumber(numberStr, baseKey) {
  if (!baseKey) return numberStr; // Need a key to parse numbers
  
  // Format: 1, 4, 5, 6-, 2m, 5/7 etc.
  // Match the root number (1-7), optional minor sign (- or m), and extensions (like 7, /3)
  const regex = /^([1-7])(-|m)?(.*)$/;
  const match = numberStr.match(regex);
  
  if (!match) return numberStr; // Not a Nashville number

  const degree = parseInt(match[1], 10) - 1; 
  const isMinor = match[2] === '-' || match[2] === 'm';
  let extensions = match[3] || '';

  const rootIdx = NOTES.indexOf(normalizeNote(baseKey));
  if (rootIdx === -1) return numberStr;

  let newRootIdx = (rootIdx + MAJOR_SCALE_INTERVALS[degree]) % 12;
  let quality = isMinor ? 'm' : '';

  // Handle bass inversions like 1/3
  if (extensions.includes('/')) {
    const extParts = extensions.split('/');
    if (extParts[1].match(/^[1-7]$/)) {
      const bassDegree = parseInt(extParts[1], 10) - 1;
      const bassRootIdx = (rootIdx + MAJOR_SCALE_INTERVALS[bassDegree]) % 12;
      extensions = extParts[0] + '/' + NOTES[bassRootIdx];
    }
  }

  return NOTES[newRootIdx] + quality + extensions;
}

// Worship Style "Rich Chords" Transformer
export function enrichChord(chord) {
  const regex = /^([A-G][b#]?)([^/]*)(?:\/([A-G][b#]?))?$/;
  const match = chord.match(regex);
  if (!match) return chord;
  
  const root = match[1];
  let quality = match[2] || '';
  const bass = match[3] ? `/${match[3]}` : '';

  if (quality === '') {
    if (root === 'F') quality = 'maj7';
    else quality = 'add9';
  } else if (quality === 'm') {
    quality = 'm7';
  }
  return `${root}${quality}${bass}`;
}

export function processLyrics(lyrics, transposeSteps, isRich, baseKey = 'C') {
  if (!lyrics) return '';

  // Get current actual key after transposition to pass to Nashville parser
  const currentKey = transposeSteps !== 0 ? transposeChord(baseKey, transposeSteps) : baseKey;

  return lyrics.replace(/\[(.*?)\]/g, (match, chordGroup) => {
    const chords = chordGroup.split(' ').map(chord => {
      let finalChord = chord.trim();
      if (!finalChord) return '';
      
      // 1. Resolve Nashville Numbers first (e.g. 6- -> C#m if key is E)
      if (finalChord.match(/^[1-7]/)) {
        finalChord = parseNashvilleNumber(finalChord, currentKey);
      } else {
        // Only transpose standard chords, nashville is already in currentKey
        if (transposeSteps !== 0) {
          finalChord = transposeChord(finalChord, transposeSteps);
        }
      }

      // 2. Enrich if requested
      if (isRich) finalChord = enrichChord(finalChord);
      
      return finalChord;
    });
    
    return `[${chords.join(' ')}]`;
  });
}
