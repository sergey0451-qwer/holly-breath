const fs = require('fs');

const rawText = fs.readFileSync('parsed_raw.txt', 'utf8');
const lines = rawText.split('\n').map(l => l.trimRight());

const songs = [];
let currentSong = null;

const transMap = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','і':'i','ї':'yi','є':'ye','ґ':'g'};
function generateId(title) {
    let t = title.toLowerCase();
    let res = "";
    for(let c of t) {
        res += transMap[c] || c;
    }
    return res.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect new song: line contains ALL CAPS (mostly) and next few lines have "Tempo:"
    // It should have some letters, not just symbols
    const hasLetters = /[A-ZА-ЯІЇЄҐ]/.test(line);
    const looksLikeTitle = hasLetters && line === line.toUpperCase() && !line.includes('||') && !line.startsWith('INTRO') && !line.startsWith('KEY');
    
    // Check if within 5 lines we have "Tempo:"
    let hasTempo = false;
    let bpm = 70;
    if (looksLikeTitle) {
        for (let j = 1; j <= 5 && i + j < lines.length; j++) {
            if (lines[i+j] && lines[i+j].toLowerCase().includes('tempo')) {
                hasTempo = true;
                const match = lines[i+j].match(/(\d+)\s*bpm/i);
                if (match) bpm = parseInt(match[1]);
                break;
            }
        }
    }
    
    if (hasTempo) {
        if (currentSong) {
            songs.push(currentSong);
        }
        
        let titleArtist = line.split('-');
        let title = titleArtist[0].trim();
        let artist = titleArtist.length > 1 ? titleArtist[1].trim() : "Unknown";
        
        currentSong = {
            id: generateId(title),
            title: title,
            artist: artist,
            bpm: bpm,
            defaultKey: "C", // default, will try to parse later
            standardLyricsLines: []
        };
    } else if (currentSong) {
        // Parse key
        if (line.toLowerCase().startsWith('key:') || line.toLowerCase().startsWith('key ')) {
            const keyMatch = line.match(/(?:Key:?)\s*([A-G][#b]?)/i);
            if (keyMatch) {
                let k = keyMatch[1].toUpperCase();
                if(k.includes('B')) k = k.replace('B', 'b');
                if(k.includes('#')) k = k.replace('#', '#');
                // Ensure proper capitalization for A-G
                k = k.charAt(0).toUpperCase() + k.slice(1);
                currentSong.defaultKey = k;
            }
            currentSong.standardLyricsLines.push(line);
        } else {
            currentSong.standardLyricsLines.push(line);
        }
    }
}

if (currentSong) {
    songs.push(currentSong);
}

// Clean up standardLyricsLines to a string
songs.forEach(s => {
    while(s.standardLyricsLines.length > 0 && s.standardLyricsLines[0].trim() === '') {
        s.standardLyricsLines.shift();
    }
    s.standardLyrics = '\\n' + s.standardLyricsLines.join('\n') + '\\n';
    delete s.standardLyricsLines;
});

fs.writeFileSync('parsed_songs.json', JSON.stringify(songs, null, 2), 'utf8');
console.log('Successfully parsed ' + songs.length + ' songs.');
