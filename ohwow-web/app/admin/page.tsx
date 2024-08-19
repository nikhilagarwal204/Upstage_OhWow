"use client"
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { isAuthenticated, login, logout } from '../.auth';

export default function AdminWeb() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // We'll use a state variable to track authentication status.
    // Initially set to false and updated within useEffect after component mounts.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Update authentication status after component mounts.
        setIsLoggedIn(isAuthenticated());
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(username, password)) {
            setIsLoggedIn(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return (
            <main className={styles.mainlogin}>
                <h1>Oh Wow WEB ADMIN PORTAL!</h1>
                <br /><br />
                <form onSubmit={handleLogin}>
                    <input className={styles.login} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <br /><br />
                    <input className={styles.login} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <br /><br /><br />
                    <button className={styles.loginbutton} type="submit">Log In</button>
                </form>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <h1>WELCOME to the Oh Wow WEB ADMIN PORTAL!!</h1>
            <br />
            <h2><a href="/admin/openai/chatgpt">ADVANCED GPT PORTAL</a></h2>
            <h2><a href="/admin/openai/tts">OPENAI TTS VOICES</a></h2>
            <h2><a href="/admin/generate">B2B GENERATE PORTAL</a></h2>
            <h2><a href="/admin/vision">OHWOW VISION AI</a></h2>
            <br /><br /><br /><br />
            <button className={styles.loginbutton} onClick={handleLogout}>Log Out</button>
        </main>
    );
}