"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../page.module.css';

export default function ChatGptForm() {
    const [prompt, setPrompt] = useState('');
    const [gpt4TurboResponse, setGpt4TurboResponse] = useState('');
    const [isGpt4TurboLoading, setIsGpt4TurboLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4-turbo-2024-04-09'); // Set a default model
    const [tempValue, setTempValue] = useState<number | undefined>();
    const [frequencyPenality, setFrequencyPenality] = useState<number | undefined>();
    const [presencePenality, setPresencePenality] = useState<number | undefined>();

    useEffect(() => {
        if (localStorage.getItem('admin') === null)
            window.location.href = '/admin';
    }, []);

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value);
    };

    const fetchGpt4TurboResponse = async () => {
        if (prompt.length === 0) {
            return;
        }
        setIsGpt4TurboLoading(true);
        try {
            const response = await axios.post('https://ohwow-audio-gmviuexllq-uc.a.run.app/admin/gpt', {
                model: selectedModel,
                prompt: prompt,
                temperature: tempValue,
                frequency_penalty: frequencyPenality,
                presence_penalty: presencePenality,
            });
            setGpt4TurboResponse(response.data);
        } catch (error) {
            console.error('Error fetching GPT-4 Turbo response:', error);
        }
        setIsGpt4TurboLoading(false);
    };

    return (
        <main className={styles.chatGptFormContainer}>
            <br />
            <div>
                <textarea
                    className={styles.chatGptInputBox}
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Enter your prompt"
                />
            </div>
            <br />
            <div>
                <div>
                    &nbsp;&nbsp;
                    <select value={selectedModel} onChange={handleModelChange} style={{ width: "220px", fontSize: "22px" }}>
                        <option value="gpt-4-turbo-2024-04-09">gpt-4-turbo-2024-04-09</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="gpt-4-0125-preview">gpt-4-0125-preview</option>
                        <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
                        <option value="gpt-4">gpt-4</option>
                        <option value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</option>
                        <option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</option>
                    </select>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="number" value={tempValue} onChange={(e) => setTempValue(Number(e.target.value))} min="0.0" max="2.0" step="0.1" placeholder='Temperature: 0.0 to 2.0' style={{ width: "250px", fontSize: "22px" }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="number" value={frequencyPenality} onChange={(e) => setFrequencyPenality(Number(e.target.value))} min="-2.0" max="2.0" step="0.1" placeholder='Frequency Penality: -2.0 to 2.0' style={{ width: "320px", fontSize: "22px" }} />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="number" value={presencePenality} onChange={(e) => setPresencePenality(Number(e.target.value))} min="-2.0" max="2.0" step="0.1" placeholder='Presence Penalty: -2.0 to 2.0' style={{ width: "300px", fontSize: "22px" }} />
                    <br />
                    &nbsp;&nbsp;
                    <button
                        onClick={fetchGpt4TurboResponse}
                        disabled={isGpt4TurboLoading}
                        className={styles.chatGptSubmitButton}
                    >
                        {isGpt4TurboLoading ? 'Generating...' : 'Generate'}
                    </button>
                    &nbsp;&nbsp;
                    <h2 style={{ display: "inline" }}>{selectedModel} Response:</h2>
                </div>
                <br />
                <textarea
                    value={gpt4TurboResponse}
                    readOnly
                    className={styles.chatGptResponseBox}
                />
            </div>
        </main>
    );
}
