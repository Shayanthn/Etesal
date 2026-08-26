/**
 * Audio Tag and Metadata Extractor
 * Reads ID3 tags, artist, title, album, duration, and embedded cover image from audio files.
 */

export interface ExtractedAudioMeta {
  title: string;
  artist: string;
  album: string;
  genre: string;
  durationFormatted: string;
  durationSeconds: number;
  coverUrl?: string;
  fileSizeMb: number;
  fileDataUrl: string;
}

export async function extractAudioMetadata(file: File): Promise<ExtractedAudioMeta> {
  const fileSizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
  const fileDataUrl = URL.createObjectURL(file);

  // Default clean fallback names derived from filename
  const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  let title = cleanBaseName;
  let artist = 'هنرمند ناشناس';
  let album = 'تک‌آهنگ';
  let genre = 'Electronic';
  let coverUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

  // If filename is in format "Artist - Title"
  if (cleanBaseName.includes(' - ')) {
    const parts = cleanBaseName.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Get duration using Web Audio Element
  let durationFormatted = '03:30';
  let durationSeconds = 210;

  try {
    const audio = new Audio();
    audio.src = fileDataUrl;
    
    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
          durationSeconds = Math.round(audio.duration);
          const mins = Math.floor(durationSeconds / 60);
          const secs = durationSeconds % 60;
          durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        resolve();
      };
      audio.onerror = () => resolve();
      setTimeout(resolve, 1500); // 1.5s timeout safety
    });
  } catch (e) {
    console.warn('Could not read audio duration via Audio element:', e);
  }

  // Try parsing ID3 tags binary from arrayBuffer (ID3v2 parser for title, artist, album, and APIC cover)
  try {
    const buffer = await file.slice(0, Math.min(file.size, 1024 * 512)).arrayBuffer();
    const view = new DataView(buffer);

    // Check for ID3v2 header
    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
      // ID3v2 detected
      const version = view.getUint8(3);
      let offset = 10;
      const tagSize = ((view.getUint8(6) & 0x7f) << 21) |
                      ((view.getUint8(7) & 0x7f) << 14) |
                      ((view.getUint8(8) & 0x7f) << 7) |
                      (view.getUint8(9) & 0x7f);

      const maxOffset = Math.min(buffer.byteLength, 10 + tagSize);

      while (offset + 10 < maxOffset) {
        let frameId = '';
        for (let i = 0; i < 4; i++) {
          const charCode = view.getUint8(offset + i);
          if (charCode >= 32 && charCode <= 126) {
            frameId += String.fromCharCode(charCode);
          }
        }

        if (frameId.length < 4) break;

        let frameSize = 0;
        if (version === 4) {
          frameSize = ((view.getUint8(offset + 4) & 0x7f) << 21) |
                      ((view.getUint8(offset + 5) & 0x7f) << 14) |
                      ((view.getUint8(offset + 6) & 0x7f) << 7) |
                      (view.getUint8(offset + 7) & 0x7f);
        } else {
          frameSize = (view.getUint8(offset + 4) << 24) |
                      (view.getUint8(offset + 5) << 16) |
                      (view.getUint8(offset + 6) << 8) |
                      view.getUint8(offset + 7);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) break;

        const frameDataOffset = offset + 10;
        
        // Text Frames
        if (frameId === 'TIT2') { // Title
          const val = decodeId3String(buffer, frameDataOffset, frameSize);
          if (val && val.trim()) title = val.trim();
        } else if (frameId === 'TPE1') { // Artist
          const val = decodeId3String(buffer, frameDataOffset, frameSize);
          if (val && val.trim()) artist = val.trim();
        } else if (frameId === 'TALB') { // Album
          const val = decodeId3String(buffer, frameDataOffset, frameSize);
          if (val && val.trim()) album = val.trim();
        } else if (frameId === 'TCON') { // Genre
          const val = decodeId3String(buffer, frameDataOffset, frameSize);
          if (val && val.trim()) genre = val.trim();
        } else if (frameId === 'APIC') { // Picture
          const pic = extractApicPicture(buffer, frameDataOffset, frameSize);
          if (pic) coverUrl = pic;
        }

        offset += 10 + frameSize;
      }
    }
  } catch (err) {
    console.warn('ID3 tag extraction completed with fallback info:', err);
  }

  return {
    title,
    artist,
    album,
    genre,
    durationFormatted,
    durationSeconds,
    coverUrl,
    fileSizeMb,
    fileDataUrl
  };
}

function decodeId3String(buffer: ArrayBuffer, offset: number, length: number): string {
  if (length <= 1) return '';
  const encoding = new DataView(buffer).getUint8(offset);
  const bytes = new Uint8Array(buffer, offset + 1, length - 1);
  try {
    if (encoding === 1 || encoding === 2) {
      // UTF-16
      return new TextDecoder('utf-16').decode(bytes).replace(/\0/g, '');
    } else if (encoding === 3) {
      // UTF-8
      return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '');
    } else {
      // ISO-8859-1
      return new TextDecoder('iso-8859-1').decode(bytes).replace(/\0/g, '');
    }
  } catch {
    return '';
  }
}

function extractApicPicture(buffer: ArrayBuffer, offset: number, length: number): string | null {
  try {
    const view = new DataView(buffer);
    let cur = offset + 1; // skip encoding
    
    // Read mime type string (null-terminated)
    let mime = '';
    while (cur < offset + length && view.getUint8(cur) !== 0) {
      mime += String.fromCharCode(view.getUint8(cur));
      cur++;
    }
    cur++; // skip null
    cur++; // skip picture type byte

    // Read description (null-terminated)
    while (cur < offset + length && view.getUint8(cur) !== 0) {
      cur++;
    }
    cur++; // skip null terminator

    if (cur < offset + length) {
      const imgBytes = new Uint8Array(buffer, cur, (offset + length) - cur);
      const mimeType = mime || 'image/jpeg';
      const blob = new Blob([imgBytes], { type: mimeType });
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('APIC image extraction skipped:', e);
  }
  return null;
}
