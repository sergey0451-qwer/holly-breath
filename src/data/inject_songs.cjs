const fs = require('fs');

let songsJs = fs.readFileSync('songs.js', 'utf8');
const newSongsOrig = JSON.parse(fs.readFileSync('parsed_songs.json', 'utf8'));

const existingIds = new Set();
const idMatches = songsJs.matchAll(/id:\s*["']([^"']+)["']/g);
for (const m of idMatches) {
    existingIds.add(m[1]);
}

const newSongs = newSongsOrig.filter(s => !existingIds.has(s.id));
console.log(`Filtered out ${newSongsOrig.length - newSongs.length} duplicates. Injecting ${newSongs.length} new songs.`);

let jsString = '';
for (const song of newSongs) {
    // Escape backticks and ${} to not break the JS template literal
    let lyrics = song.standardLyrics.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    jsString += `  {
    id: "${song.id}",
    title: "${song.title.replace(/"/g, '\\"')}",
    artist: "${song.artist.replace(/"/g, '\\"')}",
    bpm: ${song.bpm},
    defaultKey: "${song.defaultKey}",
    standardLyrics: \`${lyrics}\`
  },
`;
}

const insertPos = songsJs.lastIndexOf('];');
if (insertPos !== -1) {
    let before = songsJs.substring(0, insertPos);
    before = before.trimRight();
    if (!before.endsWith(',') && !before.endsWith('[')) {
        before += ',';
    }
    const after = songsJs.substring(insertPos);
    
    songsJs = before + '\n' + jsString + after;
    fs.writeFileSync('songs.js', songsJs, 'utf8');
    console.log('Successfully injected songs into songs.js');
} else {
    console.log('Error: Could not find "];"');
}
