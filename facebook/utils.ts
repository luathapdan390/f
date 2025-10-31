// Decodes a base64 string into a Uint8Array.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Converts a Uint8Array of raw audio data into a Int16Array (PCM format).
export function toInt16Array(bytes: Uint8Array): Int16Array {
    return new Int16Array(bytes.buffer);
}

// Helper to write a string to a DataView.
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Creates a Blob in WAV file format from raw 16-bit PCM data.
export function createWavBlob(pcmData: Int16Array, sampleRate: number, numChannels: number): Blob {
  const headerSize = 44;
  const dataSize = pcmData.length * 2; // 16-bit PCM = 2 bytes per sample
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);
  const bitsPerSample = 16;

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(headerSize + i * 2, pcmData[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}
