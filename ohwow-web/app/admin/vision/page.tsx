"use client";
import { useEffect, useState, useRef } from 'react';
import Webcam from "react-webcam";
import styles from './page.module.css';

export default function GptVision() {
    const [isMobile, setIsMobile] = useState(false);
    const [poi, setPoi] = useState('');
    const [loading, setLoading] = useState(false);
    const webcamRef = useRef<Webcam | null>(null);

    useEffect(() => {
        if (localStorage.getItem('admin') === null)
            window.location.href = '/admin';
        // Detect if we're running on mobile after mounting
        const isMobileCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(isMobileCheck);
    }, []);

    // Handle webcam image capture and predict poi
    const handleWebcamCapture = async () => {
        setPoi('');
        setLoading(true);
        if (webcamRef.current) {
            const screenshotDataUri = webcamRef.current?.getScreenshot();
            if (screenshotDataUri) {
                fetch(screenshotDataUri)
                    .then(res => res.blob())
                    .then(blob => processImage(blob));
            }
        }
    };

    // Handle file input change and predict poi
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setPoi('');
        setLoading(true);
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            processImage(file);
        }
    };

    // Process image file/blob and predict poi
    const processImage = async (image: string | Blob) => {
        let formData = new FormData();
        formData.append('file', image);
        fetch('https://ohwow-audio-gmviuexllq-uc.a.run.app/detect-poi', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                if (data) {
                    setPoi(data);
                }
            }).catch(error => console.error('Error:', error));
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>OHWOW VISION AI</h1>
            {isMobile ? (
                <div className={styles.file_input_container}>
                    <input type="file" accept="image/jpeg" capture="environment" onChange={handleImageChange} />
                </div>
            ) : (
                <div>
                    <Webcam className={styles.webcam_container} audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
                    <br />
                    <button className={styles.capture_button} onClick={handleWebcamCapture}>Capture photo</button>
                </div>
            )}
            <br />
            {poi && <h2 className={styles.poi_display}>{poi}</h2>}
            {loading && <h2 className={styles.poi_display}>Detecting...</h2>}
        </div>
    );
}