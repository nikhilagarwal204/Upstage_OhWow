"use client";
import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from './react-spech-kit/src';  // Adjust the path if needed
import { FaMicrophone } from 'react-icons/fa';
import axios from 'axios';
import { useSpeechSynthesis } from './react-spech-kit/src';

interface TransparentVideoProps {
  videoSrc: string;
  bgImage: string;
  gender: string;
}

const SpeechRecognitionComponent: React.FC<TransparentVideoProps> = ({ videoSrc, bgImage, gender }) => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [text, setText] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const speed = 65;

  const onEnd = () => {
    setVideoPlaying(false);
  }

  const { speak, supported: synthesisSupported, voices, speaking } = useSpeechSynthesis({ onEnd });

  const onResult = (result: string) => {
    setTranscript(prev => `${prev} ${result}`);
  };

  const onError = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'not-allowed') {
      setBlocked(true);
    }
  };

  const { listen, stop, supported } = useSpeechRecognition({ onResult, onError });

  const toggleListening = () => {
    if (listening) {
      stop();
      sendTranscriptToBackend();
      setListening(false);
    } else {
      listen({ interimResults: false });
      setTranscript('');
      setSpokenText('');
      setListening(true);
      setBlocked(false);
    }
  };

  const sendTranscriptToBackend = async () => {
    try {
      console.log(transcript);
      if (transcript.toLowerCase().includes('place') || transcript.toLowerCase().includes('worth')) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setText("Hallasan National Park has Amazing trail! Sometimes it can get quite crowded but the views and nature makes it all worth it!");
      }
      else {
        const response = await axios.post('https://askohwowchatbackend.onrender.com/llm', { text: transcript });
        setText(response.data);
      }
    } catch (error) {
      console.error('Error sending transcript:', error);
    };
  };

  useEffect(() => {
    const selectedVoice = voices.find((v: SpeechSynthesisVoice) => v.voiceURI === (gender === 'male' ? 'Google UK English Male' : 'Google UK English Female'));
    console.log(text, speaking);
    if (text && speaking) {
      speak({ text: text, voice: selectedVoice, rate: 0.9 });
      console.log(text, speaking);
      setVideoPlaying(true);
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setSpokenText((prev) => prev + text.charAt(index));
          index += 1;
        } else {
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);

    }
  }, [text]);


  return (
    <div>
      {/* <h2>Speech Recognition</h2> */}
      {!supported && <p>Your browser doesnt support Speech Recognition.</p>}

      <div style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '80vh',
        overflow: 'hidden',
        position: 'relative',
      }}>

        <div style={{ position: 'absolute', bottom: '-5px', left: '0' }}>
          {videoPlaying ? (
            <video loop autoPlay muted playsInline style={{ width: '100%', height: 'auto' }}>
              <source src={videoSrc} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={gender === 'male' ? '/male.png' : '/female.png'} alt="Background" style={{ width: '60%', height: 'auto' }} />
          )}
        </div>
      </div>

      {supported && (
        <>
          <div style={{ position: 'absolute', top: '69%', left: '83%', transform: 'translateX(-50%)' }}>
            <button
              type="button"
              onClick={toggleListening}
              style={{
                backgroundColor: listening ? '#d9d8d2' : '#F2EF6E', // Visual feedback for listening state
                border: 'none',
                borderRadius: '50%',
                padding: listening ? '30px' : '25px',
                cursor: 'pointer',
              }}
              disabled={blocked}
            >
              <FaMicrophone color="black" size={24} />
            </button>

            {blocked && <p>The microphone is blocked in your browser settings.</p>}
          </div>

          <div>
            <p style={transcript ? { backgroundColor: '#F2EF6E', borderRadius: '5%', padding: '8px', width: 'auto', marginRight: '8px', marginLeft: '8px', display: 'inline-block' } : {}}>
              {transcript}
            </p>
          </div>
          <div>
            <p style={spokenText ? { backgroundColor: '#d9d8d2', borderRadius: '5%', padding: '8px', marginRight: '8px', marginLeft: '8px', display: 'inline-block', marginTop: '0' } : {}}>
              {spokenText}
            </p>
          </div>
        </>
      )}


      {!synthesisSupported && <p>Your browser does not support Speech Synthesis.</p>}
    </div>

  );
};

export default SpeechRecognitionComponent;

