/**
 * Utility for playing text-to-speech using the best available English voice.
 */

export function playPronunciation(text: string) {
 if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
 
 window.speechSynthesis.cancel();
 
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.lang = "en-US";
 utterance.rate = 0.85; // Slightly slower than default for better clarity

 const voices = window.speechSynthesis.getVoices();
 
 // High quality voices ordered by preference
 const preferredVoices = [
 "Google US English", // Chrome desktop high quality
 "Google UK English Female",
 "Google UK English Male",
 "Samantha", // Apple premium
 "Alex", // Apple classic high quality
 "Daniel", // Apple UK
 "Victoria", // Apple US
 "Microsoft Zira", // Windows US Female
 "Microsoft David" // Windows US Male
 ];

 let selectedVoice: SpeechSynthesisVoice | null = null;
 
 // Find first matching preferred voice
 for (const preferred of preferredVoices) {
 const voice = voices.find(v => v.name.includes(preferred));
 if (voice) {
 selectedVoice = voice;
 break;
 }
 }

 // Fallback to any native English voice if no preferred voice found
 if (!selectedVoice) {
 selectedVoice = voices.find(v => v.lang.startsWith("en-")) || null;
 }

 if (selectedVoice) {
 utterance.voice = selectedVoice;
 }

 window.speechSynthesis.speak(utterance);
}

// Trigger voice loading in advance
if (typeof window !== "undefined" && "speechSynthesis" in window) {
 window.speechSynthesis.getVoices();
 // Listen for async voices load
 if (window.speechSynthesis.onvoiceschanged !== undefined) {
 window.speechSynthesis.onvoiceschanged = () => {
 window.speechSynthesis.getVoices();
 };
 }
}
