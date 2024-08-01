import React, { useState } from 'react';
import axios from 'axios';
import './generate.css'


function GenerateAudio() {
    const [text, setText] = useState('');
    const [speakerId, setSpeakerId] = useState('');
    const [audioSrc, setAudioSrc] = useState('');
    const [error, setError] = useState('');

    const hexToUint8Array = (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
    };

    const generateSpeech = async () => {
        try {
            const response = await axios.post('https://crayfish-ready-starfish.ngrok-free.app/generate-speech', {
                text,
                speaker_id: parseInt(speakerId),
            });

            const audioDataHex = response.data.audio;
            const audioDataArray = hexToUint8Array(audioDataHex);
            const audioBlob = new Blob([audioDataArray], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioSrc(audioUrl);
            setError('');
        } catch (error) {
            console.error(error);
            setError('Error generating speech. Please check the inputs.');
        }
    };

    return (
        <div>
            <section className='section-card'>
                <div className='card'>
                    <h1 className='title'>Vocalize.io</h1>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text here" className='text-input' /><br />
                    <input type="number" value={speakerId} onChange={(e) => setSpeakerId(e.target.value)} placeholder="Enter speaker ID (0 to 999)" className='speaker-input' /><br />
                    <button onClick={generateSpeech} className='generate-btn'>Generate Speech</button><br/>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {audioSrc && <audio controls src={audioSrc} className='audio-out'></audio>}
                </div>
            </section>
           
        </div>
    );
}

export default GenerateAudio;
