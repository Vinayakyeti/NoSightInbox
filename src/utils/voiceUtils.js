export const speak = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech Synthesis not supported');
      reject(new Error('Speech Synthesis not supported'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    window.speechSynthesis.speak(utterance);
  });
};

export const startListening = (onResult, onError, options = {}) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech Recognition not supported');
    if (onError) onError(new Error('Speech Recognition not supported'));
    return null;
  }

  const recognition = new SpeechRecognition();
  
  recognition.continuous = options.continuous || false;
  recognition.interimResults = options.interimResults || false;
  recognition.lang = options.lang || 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
  };

  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start recognition:', error);
    if (onError) onError(error);
  }

  return recognition;
};

export const stopListening = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
