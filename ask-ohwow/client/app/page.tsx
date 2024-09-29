"use client";
import React from 'react';
import styles from "./page.module.css";
import SpeechRecognitionComponent from "./speechRecognition";


export default function Home() {

  return (
    <div className={styles.page}>
      <SpeechRecognitionComponent
        videoSrc="/avataar_female.webm" // Adjust path accordingly
        bgImage="/hallasan.jpg" // Adjust path accordingly
        gender="female"
      />
    </div>
  );
}
