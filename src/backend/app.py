from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
import torch
import soundfile as sf
from datasets import load_dataset
import io

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")

embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    data = request.json
    text = data['text']
    speaker_id = data['speaker_id']

    if speaker_id < 0 or speaker_id >= len(embeddings_dataset):
        return jsonify({'error': 'Invalid speaker_id'}), 400

    inputs = processor(text=text, return_tensors="pt")
    speaker_embeddings = torch.tensor(embeddings_dataset[speaker_id]["xvector"]).unsqueeze(0)
    speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)

    with io.BytesIO() as buf:
        sf.write(buf, speech.numpy(), samplerate=16000, format='WAV')
        audio_data = buf.getvalue()

    return jsonify({'audio': audio_data.hex()})

if __name__ == '__main__':
    app.run(debug=True)
