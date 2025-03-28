// src/utils/audioUtils.js

/**
 * Função para normalizar áudio para melhor detecção de voz
 * @param {Float32Array} audioData - Dados de áudio do microfone
 * @returns {Float32Array} - Dados de áudio normalizados
 */
export const normalizeAudio = (audioData) => {
  // Encontrar o valor máximo absoluto
  let maxVal = 0;
  for (let i = 0; i < audioData.length; i++) {
    const absVal = Math.abs(audioData[i]);
    if (absVal > maxVal) {
      maxVal = absVal;
    }
  }
  
  // Se o volume for muito baixo, não normalizamos
  if (maxVal < 0.01) return audioData;
  
  // Normalizar com base no máximo
  const result = new Float32Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    result[i] = audioData[i] / maxVal;
  }
  
  return result;
};

/**
 * Detecta silêncio no stream de áudio
 * @param {Float32Array} audioData - Dados de áudio do microfone
 * @param {number} threshold - Limiar para considerar como silêncio (0.0 a 1.0)
 * @returns {boolean} - true se for detectado silêncio
 */
export const detectSilence = (audioData, threshold = 0.05) => {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += Math.abs(audioData[i]);
  }
  
  const average = sum / audioData.length;
  return average < threshold;
};

/**
 * Funções para resampling do áudio para compatibilidade com Deepgram
 * @param {AudioBuffer} audioBuffer - Buffer de áudio do AudioContext
 * @param {number} targetSampleRate - Taxa de amostragem desejada (geralmente 16000 para STT)
 * @returns {Float32Array} - Dados de áudio com nova taxa de amostragem
 */
export const resampleAudio = (audioBuffer, targetSampleRate = 16000) => {
  const originalSampleRate = audioBuffer.sampleRate;
  
  // Se já estiver na taxa desejada, retornar como está
  if (originalSampleRate === targetSampleRate) {
    return audioBuffer.getChannelData(0);
  }
  
  // Cálculo da nova duração
  const originalLength = audioBuffer.length;
  const newLength = Math.round(originalLength * targetSampleRate / originalSampleRate);
  const result = new Float32Array(newLength);
  
  // Dados do canal 0 (mono)
  const data = audioBuffer.getChannelData(0);
  
  // Fator de conversão
  const ratio = originalSampleRate / targetSampleRate;
  
  // Interpolação linear simples
  for (let i = 0; i < newLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    
    if (index + 1 < originalLength) {
      result[i] = data[index] * (1 - fraction) + data[index + 1] * fraction;
    } else {
      result[i] = data[index];
    }
  }
  
  return result;
};

/**
 * Converter Float32Array para Int16Array para envio via rede
 * @param {Float32Array} float32Array - Dados em Float32
 * @returns {Int16Array} - Dados convertidos para Int16
 */
export const floatToInt16 = (float32Array) => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Converter de -1.0 <-> 1.0 para -32768 <-> 32767
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
};