'use client'
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    window.location.replace('https://ohwowapp.com/');
  }, []);
}
