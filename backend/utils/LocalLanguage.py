import whisper
from deep_translator import GoogleTranslator
from gtts import gTTS
import os
from langdetect import detect, DetectorFactory

# ----------------------------
# Reproducibility
# ----------------------------
DetectorFactory.seed = 0

# ----------------------------
# Whisper (Speech-to-Text)
# ----------------------------
stt_model = whisper.load_model("small")  # lightweight ~244MB

def speech_to_text(audio_path, language=None):
    """
    Convert speech to text using Whisper.
    Optional language code e.g., 'hi', 'en'.
    """
    try:
        result = stt_model.transcribe(audio_path, language=language)
        return result['text']
    except Exception as e:
        print("STT failed:", e)
        return ""

# ----------------------------
# Translation (deep-translator)
# ----------------------------

def safe_translate(text: str, to_lang: str, from_lang: str = "auto") -> str:
    """
    Translation using deep-translator (Google backend).
    Supports major Indian languages: hi, bn, ta, te, mr.
    """
    try:
        translated = GoogleTranslator(source=from_lang, target=to_lang).translate(text)
        return translated
    except Exception as e:
        print("⚠️ Translation failed:", e)
        return text  # fallback: return original text

# ----------------------------
# Text-to-Speech (gTTS)
# ----------------------------
def text_to_speech(text, lang="hi", filename="output.mp3"):
    """
    Convert text to speech using gTTS.
    """
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)
        return filename
    except Exception as e:
        print("TTS failed:", e)
        return None


def play_audio(filename):
    """
    Play audio file on Windows/Linux/macOS.
    """
    if os.name == "nt":
        os.system(f"start {filename}")
    else:
        os.system(f"xdg-open {filename}")
