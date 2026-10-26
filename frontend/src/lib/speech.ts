import { Profile } from '../types';

export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function speakText(text: string, profile: Pick<Profile, 'voice' | 'speed' | 'pitch' | 'volume'> & Partial<Pick<Profile, 'voice_language'>>) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const preferredLanguage = profile.voice_language === 'hinglish' ? 'hi-IN' : profile.voice_language || 'en-US';
  const voice = getSpeechVoices().find(item => item.name === profile.voice) || getSpeechVoices().find(item => item.lang.startsWith(preferredLanguage));
  if (voice) utterance.voice = voice;
  utterance.lang = preferredLanguage;
  utterance.rate = [0.7, 0.85, 1, 1.15, 1.3][profile.speed] || 1;
  utterance.pitch = profile.pitch === 'low' ? 0.8 : profile.pitch === 'high' ? 1.2 : 1;
  utterance.volume = Math.max(0, Math.min(1, profile.volume / 100));
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
