// Genera un tono de alerta simple (WAV, sin dependencias) para el sonido
// que suena en bucle dentro de la app mientras hay una toma pendiente sin
// resolver. Dos tonos alternados tipo "beep-beep", pensados para ser
// reconocibles pero no estridentes.
import { writeFileSync, mkdirSync } from 'node:fs';

const SAMPLE_RATE = 44100;

function tone(freqHz, durationSec, volume = 0.5) {
  const samples = Math.floor(SAMPLE_RATE * durationSec);
  const data = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    // Attack/release cortos (envolvente) para evitar "clicks" al empezar/terminar el tono.
    const t = i / SAMPLE_RATE;
    const envelope = Math.min(1, t / 0.01, (durationSec - t) / 0.01);
    const value = Math.sin(2 * Math.PI * freqHz * t) * volume * Math.max(0, envelope);
    data[i] = Math.round(value * 32767);
  }
  return data;
}

function silence(durationSec) {
  return new Int16Array(Math.floor(SAMPLE_RATE * durationSec));
}

function concat(...arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Int16Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

function buildWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');

  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat = PCM
  buffer.writeUInt16LE(1, 22); // NumChannels = mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  return buffer;
}

const samples = concat(
  tone(880, 0.18),
  silence(0.1),
  tone(880, 0.18),
  silence(0.1),
  tone(660, 0.28),
  silence(0.5)
);

mkdirSync('public/sounds', { recursive: true });
writeFileSync('public/sounds/alert.wav', buildWav(samples));
console.log('Sonido de alerta generado en public/sounds/alert.wav');
