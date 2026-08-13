// Run this any time you add/remove mp3s in Musics/:
//   node generate-playlist.js
//
// It scans the Musics folder, keeps any custom "artist" or "cover" you've
// already set for a song in songs.json, and writes the file back out —
// no need to touch index.html or songs.json by hand.

const fs = require('fs');
const path = require('path');

const MUSIC_DIR = path.join(__dirname, 'Musics');
const OUTPUT_FILE = path.join(__dirname, 'songs.json');
const DEFAULT_ARTIST = 'Binesh';

function loadExisting() {
  try {
    const raw = fs.readFileSync(OUTPUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function main() {
  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`Couldn't find a "Musics" folder next to this script at:\n  ${MUSIC_DIR}`);
    process.exit(1);
  }

  const existing = loadExisting();
  const existingByFile = Object.fromEntries(existing.map(s => [s.file, s]));

  const files = fs
    .readdirSync(MUSIC_DIR)
    .filter(f => /\.(mp3|m4a|wav|ogg)$/i.test(f))
    .filter(f => !f.startsWith('.')) // skip hidden/junk files like macOS ._files
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.warn('No audio files found in Musics/. songs.json will be empty.');
  }

  const songs = files.map(file => {
    const prior = existingByFile[file];
    const title = prior?.title || path.parse(file).name;
    return {
      title,
      artist: prior?.artist || DEFAULT_ARTIST,
      file,
      ...(prior?.cover ? { cover: prior.cover } : {}),
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2) + '\n');

  console.log(`songs.json updated — ${songs.length} track(s):`);
  songs.forEach(s => console.log(`  • ${s.title}`));
}

main();
