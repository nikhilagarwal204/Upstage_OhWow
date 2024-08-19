"use client";
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect } from 'react';

export default function GeneratePortal() {
    const [formData, setFormData] = useState({
        name: "",
        cover: "",
        details: "",
        script: "",
    });
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(158); // Initial time in seconds (2.5 minutes)

    useEffect(() => {
        if (localStorage.getItem('admin') === null)
            window.location.href = '/admin';
    }, []);

    useEffect(() => {
        // Start the countdown when loading is true
        let intervalId: NodeJS.Timeout;
        if (loading) {
            intervalId = setInterval(() => {
                setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => {
            // Cleanup the interval when the component is unmounted or loading is false
            clearInterval(intervalId);
        };
    }, [loading]);

    const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMusicFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);  // set loading to true when the request starts
        try {
            const base64 = await convertFileToBase64(musicFile);
            const formDataWithMusic = { ...formData, bg_music_base64: base64 };
            const response = await fetch('https://b2b---ohwow-audio-gmviuexllq-uc.a.run.app/admin/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataWithMusic)
            });
            const result = (await response.text()).replace(/\"/g, '');

            // Redirect to the returned URL
            window.location.href = result;

        } catch (error) {
            console.error("There was an error posting the data", error);
        } finally {
            setLoading(false);  // set loading to false once the request is finished
        }
    };

    const convertFileToBase64 = (file: Blob | null) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            if (file) {
                reader.readAsDataURL(file);
            } else {
                reject(new Error('Invalid file'));
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const areAllFieldsFilled = () => {
        return Object.values(formData).every(field => field.trim() !== '');
    };

    return (
        <div>
            <h1>B2B Oh Wow Portal - AI Generated Place&apos;s Audio</h1>
            <br />
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name*"
                    style={{ width: "300px", fontSize: "24px", padding: "3px" }}
                />
                <br /><br />
                <input
                    type="text"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    placeholder="Details*"
                    style={{ width: "400px", fontSize: "24px", padding: "3px" }}
                />
                <br /><br />
                <input
                    type="url"
                    name="cover"
                    value={formData.cover}
                    onChange={handleChange}
                    placeholder="Image URL*"
                    style={{ width: "700px", fontSize: "22px", padding: "3px" }}
                />
                <br /><br />
                <textarea
                    name="script"
                    value={formData.script}
                    onChange={handleChange}
                    placeholder="Script*"
                    style={{ width: "800px", height: "400px", fontSize: "20px", padding: "3px" }}
                />
                <br /><br />
                <input
                    type="file"
                    accept=".mp3"
                    onChange={handleMusicChange}
                    style={{ width: "300px", fontSize: "24px", padding: "3px" }}
                />
                <br /><br />
                <button type="submit" disabled={!areAllFieldsFilled()} style={{ width: "150px", fontSize: "30px" }}>Submit</button>
                {
                    loading && <><br /><span>GENERATING ({timeLeft}s left)</span><CircularProgress /></>
                }
            </form>
        </div>
    );
}
