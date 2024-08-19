"use client"
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import styles from '../styles/player.module.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import Replay5Icon from '@mui/icons-material/Replay5'
import Forward5Icon from '@mui/icons-material/Forward5'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { SelectChangeEvent } from '@mui/material/Select'

// Define a type for your song including the structure of storyURLs
type Song = {
  name: string;
  cover: string;
  details: string;
  storyURLs: Record<string, string>;
};

// Define the type for the language full names object with an index signature
type LanguageFullNames = {
  [key: string]: string;
};

// Define the type for the language flags object with an index signature
type LanguageFlags = {
  [key: string]: string;
};
const languageFullNames: Record<string, string> = {
  "en-US": "English",
  "zh-CN": "Chinese",
  "ja-JP": "Japanese",
  "fr-FR": "French",
  "it-IT": "Italian",
  "es-ES": "Spanish",
  "de-DE": "German",
  "ru-RU": "Russian",
  "ko-KR": "Korean",
  "pt-BR": "Portuguese",
};

const languageFlags: LanguageFlags = {
  "en-US": "🇺🇸",
  "fr-FR": "🇫🇷",
  "ru-RU": "🇷🇺",
  "pt-BR": "🇧🇷",
  "ko-KR": "🇰🇷",
  "zh-CN": "🇨🇳",
  "es-ES": "🇪🇸",
  "it-IT": "🇮🇹",
  "ja-JP": "🇯🇵",
  "de-DE": "🇩🇪",
};

export default function AdminPlayer(props: { placeId: string }) {
  // Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State
  const [currentSong, setCurrentSong] = useState<Song>({
    name: "",
    cover: "",
    details: "",
    storyURLs: {},
  });
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isPlaying, setIsPlaying] = useState(false);
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
  });
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");

  useEffect(() => {
    const fetchData = async (place_id: string) => {
      try {
        const data = (await axios.get(`https://ohwow-audio-gmviuexllq-uc.a.run.app/admin/get/${place_id}`)).data;
        setCurrentSong({
          name: data.name,
          cover: data.cover,
          details: data.details,
          storyURLs: data.story_urls,
        });
      } catch (error) {
        console.log("Error fetching data");
      }
    };
    // Fetching the data from the API for place_id
    fetchData(props.placeId);
  }, [props.placeId]);

  // Update the audio source based on the selected language
  useEffect(() => {
    if (currentSong.storyURLs[selectedLanguage]) {
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.src = currentSong.storyURLs[selectedLanguage];
        if (isPlaying) {
          audioEl.play();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);


  // Event handlers
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setSelectedLanguage(event.target.value);
  };

  const updateTimeHandler = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;
    setSongInfo({ ...songInfo, currentTime, duration });
  };

  const playSongHandler = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };


  const getTime = (time: number) => {
    let minute = Math.floor(time / 60);
    let second = ("0" + Math.floor(time % 60)).slice(-2);
    return `${minute}:${second}`;
  };

  const dragHandler = (event: Event, value: number | number[], activeThumb: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value as number;
    }
    setSongInfo({ ...songInfo, currentTime: value as number });
  };

  const songEndHandler = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(!isPlaying);
    }
  };

  const forwardSkip = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 5;
    }
  }

  const backwardSkip = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 5;
    }
  }

  const togglePlaybackSpeed = () => {
    let pbSpeed = "1.0";
    if (playbackSpeed === "1.0") {
      pbSpeed = "1.25";
    } else if (playbackSpeed === "1.25") {
      pbSpeed = "0.75";
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = Number(pbSpeed);
    }
    setPlaybackSpeed(pbSpeed);
  }


  return (
    <main className={styles.main}>
      <audio
        onLoadedMetadata={updateTimeHandler}
        onTimeUpdate={updateTimeHandler}
        onEnded={songEndHandler}
        ref={audioRef}
        src={currentSong.storyURLs[selectedLanguage]}
      />
      {currentSong.name !== "" &&
        <div>
          <Image
            src={currentSong.cover}
            alt="Picture of the place"
            className={styles.b2bimage}
            width={300}
            height={300}
          />
          <br /><br />
          <div className={styles.likeinfo}>
            <div>
              <div className={styles.audioname}>{currentSong.name}</div>
              <div className={styles.audiodetails}>{currentSong.details}</div>
            </div>
          </div>
          <br />
          <div className={styles.controls}>
            <Replay5Icon onClick={backwardSkip} className={styles.controlskip} />
            <div onClick={playSongHandler} className={styles.controlppcircle}>
              {isPlaying ?
                <PauseIcon className={styles.controlplaypause} />
                :
                <PlayArrowIcon className={styles.controlplaypause} />
              }
            </div>
            <Forward5Icon onClick={forwardSkip} className={styles.controlskip} />
          </div>
          <br />
          <div>
            <Slider
              aria-label="time-indicator"
              onChange={dragHandler}
              min={0}
              max={songInfo.duration || 0}
              value={songInfo.currentTime}
              size="small"
              className={styles.timeslider}
              sx={{
                color: 'rgba(0,0,0,0.87)',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 8,
                  height: 8,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgb(0 0 0 / 16%)',
                  },
                  '&.Mui-active': {
                    width: 20,
                    height: 20,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.1,
                },
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                className={styles.timeslider}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: -2,
                }}
              >
                <Typography>{getTime(songInfo.currentTime || 0)}</Typography>
                <Typography>{getTime(songInfo.duration || 0)}</Typography>
              </Box>
            </div>
          </div>
          <br />
          <div className={styles.speedshare}>
            <Tooltip title="Tap to Change Speed">
              <Typography className={styles.speedchange} onClick={togglePlaybackSpeed}>{playbackSpeed}x</Typography>
            </Tooltip>
            {/* Language selection dropdown */}
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              {Object.keys(languageFullNames)
                .filter((lang) => lang in currentSong.storyURLs)
                .map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {languageFullNames[lang as keyof LanguageFullNames]} {languageFlags[lang as keyof LanguageFlags]}
                  </MenuItem>
                ))}
            </Select>
          </div>
        </div>
      }
    </main>
  )
}
