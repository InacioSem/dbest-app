// server/services/audio/demoData.ts
import type { AudioAnalysis } from '../../../shared/types/index.js';

export const demoAudioAnalysis: AudioAnalysis = {
  transcription: {
    text: "Mwen renmen ou anpil, kè mwen ap bat pou ou. Lè mwen wè ou, tout bagay vin bèl. Ou se solèy ki klere lavi mwen. Anba syèl la, mwen danse pou ou. Kè mwen ap chante, lanmou sa a p ap janm fini.",
    language: 'ht',
    segments: [
      { start: 0.0, end: 5.2, text: "Mwen renmen ou anpil" },
      { start: 5.2, end: 10.8, text: "kè mwen ap bat pou ou" },
      { start: 15.0, end: 22.0, text: "Lè mwen wè ou, tout bagay vin bèl" },
      { start: 22.0, end: 30.0, text: "Ou se solèy ki klere lavi mwen" },
      { start: 35.0, end: 45.0, text: "Anba syèl la, mwen danse pou ou" },
      { start: 50.0, end: 60.0, text: "Kè mwen ap chante" },
      { start: 60.0, end: 75.0, text: "lanmou sa a p ap janm fini" },
      { start: 80.0, end: 95.0, text: "Lè mwen wè ou, tout bagay vin bèl" },
      { start: 95.0, end: 110.0, text: "Ou se solèy ki klere lavi mwen" },
      { start: 115.0, end: 130.0, text: "Anba syèl la, mwen danse pou ou" },
      { start: 135.0, end: 150.0, text: "Kè mwen ap chante, lanmou sa a p ap janm fini" },
    ],
  },
  bpm: 128,
  beatMarkers: Array.from({ length: 400 }, (_, i) => i * 0.46875), // 128 BPM = beat every 0.46875s
  songStructure: [
    { type: 'intro', startTime: 0, endTime: 10.8, energyLevel: 3 },
    { type: 'verse', startTime: 10.8, endTime: 30.0, lyrics: "Lè mwen wè ou, tout bagay vin bèl. Ou se solèy ki klere lavi mwen.", energyLevel: 5 },
    { type: 'chorus', startTime: 30.0, endTime: 60.0, lyrics: "Anba syèl la, mwen danse pou ou. Kè mwen ap chante.", energyLevel: 8 },
    { type: 'verse', startTime: 60.0, endTime: 80.0, lyrics: "lanmou sa a p ap janm fini", energyLevel: 5 },
    { type: 'chorus', startTime: 80.0, endTime: 115.0, lyrics: "Lè mwen wè ou, tout bagay vin bèl. Ou se solèy ki klere lavi mwen.", energyLevel: 9 },
    { type: 'bridge', startTime: 115.0, endTime: 135.0, lyrics: "Anba syèl la, mwen danse pou ou", energyLevel: 7 },
    { type: 'chorus', startTime: 135.0, endTime: 165.0, lyrics: "Kè mwen ap chante, lanmou sa a p ap janm fini", energyLevel: 10 },
    { type: 'outro', startTime: 165.0, endTime: 185.0, energyLevel: 3 },
  ],
  durationSeconds: 185,
  detectedLanguage: 'ht',
};
