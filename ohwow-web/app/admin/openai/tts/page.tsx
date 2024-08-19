"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../page.module.css';
import CircularProgress from '@mui/material/CircularProgress';

export default function TtsForm() {
    const [text, setText] = useState('');
    const [ttsAudio, setTtsAudio] = useState('');
    const [isTtsLoading, setIsTtsLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy'); // Set a default voice

    useEffect(() => {
        if (localStorage.getItem('admin') === null)
            window.location.href = '/admin';
    }, []);

    const fetchAudioBlobURL = async (admin_tts: string) => {
        const response = await axios.post(admin_tts, {
            text: text,
            voice: selectedVoice,
        }, {
            responseType: 'blob' // This ensures you get the response in a Blob format
        });
        const audioBlobURL = URL.createObjectURL(response.data);
        return audioBlobURL;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVoice(e.target.value);
    };

    const fetchTtsResponse = async () => {
        setTtsAudio('');
        setIsTtsLoading(true);
        try {
            if (ttsAudio) {
                URL.revokeObjectURL(ttsAudio); // Revoke the previous audio blob URL
            }
            const currentAudioSrc = await fetchAudioBlobURL('https://ohwow-audio-gmviuexllq-uc.a.run.app/admin/tts');
            setTtsAudio(currentAudioSrc);
        } catch (error) {
            console.error('Error fetching OpenAI TTS response:', error);
        }
        finally {
            setIsTtsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (text.trim() !== '') {
            fetchTtsResponse();
        }
    };

    return (
        <main className={styles.chatGptFormContainer}>
            <br />
            <div>
                <input
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Enter any word or sentence"
                    style={{ width: "300px", fontSize: "24px", padding: "3px" }}
                />
                <br /><br />
                <label>
                    <b>Select Voice:</b>&nbsp;&nbsp;
                    <select value={selectedVoice} onChange={handleVoiceChange} style={{ width: "100px", fontSize: "20px" }}>
                        <option value="alloy">Alloy</option>
                        <option value="echo">Echo</option>
                        <option value="fable">Fable</option>
                        <option value="onyx">Onyx</option>
                        <option value="nova">Nova</option>
                        <option value="shimmer">Shimmer</option>
                    </select>
                </label>
                <br /><br />
                <button
                    onClick={handleSubmit}
                    disabled={isTtsLoading}
                    className={styles.chatGptSubmitButton}
                >
                    {isTtsLoading ? 'Loading...' : 'Submit'}
                </button>
            </div>
            <br /><br />
            <div>
                <h2>Audio Player:</h2>
                {isTtsLoading === true && <CircularProgress />}
                {ttsAudio !== "" && <audio src={ttsAudio} controls />}
            </div>
            <br /><br />
        </main>
    );
}
