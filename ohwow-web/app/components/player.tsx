"use client"
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import styles from '../styles/player.module.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import Replay5Icon from '@mui/icons-material/Replay5'
import Forward5Icon from '@mui/icons-material/Forward5'
import DirectionsIcon from '@mui/icons-material/Directions'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { authenticateAnonymously } from '../firebase'

export default function Player(props: { shortId: string }) {
  // Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State
  const [currentSong, setCurrentSong] = useState({
    name: "",
    cover: "",
    details: "",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
  });
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
  const [currentAudioSrc, setCurrentAudioSrc] = useState("");
  const [firstPlay, setFirstPlay] = useState(true);
  const [placeNid, setPlaceNid] = useState(0);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);

  const fetchAudioBlobURL = async (audio_api: string) => {
    const response = await axios.get(audio_api, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  }

  useEffect(() => {
    const fetchData = async (short_id: string) => {
      const token = await authenticateAnonymously();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      try {
        const response = await axios.post(`https://ohwow-backend-gmviuexllq-uc.a.run.app/v2/placeinfo`, {
          "short_id": [short_id]
        });
        const data = response.data[0];
        setCurrentSong({
          name: data.name,
          cover: data.image_url,
          details: `${data.city}, ${data.state}, ${data.country}`,
        });
        setPlaceNid(data.place_nid);
        const currentAudioSrc = await fetchAudioBlobURL(`https://ohwow-audio-gmviuexllq-uc.a.run.app/v2/tts/synthesize/${data.place_nid}`);
        setCurrentAudioSrc(currentAudioSrc);
      } catch (error) {
        console.log("Error fetching data");
      }
    };
    // Fetching the data from the API for short_id
    fetchData(props.shortId);
  }, [props.shortId]);

  const updateTimeHandler = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;
    setSongInfo({ ...songInfo, currentTime, duration });
  };

  const playSongHandler = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
    if (firstPlay) {
      setFirstPlay(false);
      try {
        const response = await axios.post(`https://ohwow-backend-gmviuexllq-uc.a.run.app/v2/places/count`, {
          place_nid: placeNid,
          audio_type: "story",
          device_type: "web"
        });
        if (response.status !== 200) {
          throw new Error("Failed to update playback count.");
        }
      } catch (error) {
        console.log(error);
      }
    }
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

  const handleDirections = () => {
    setIsDirectionsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDirectionsModalOpen(false);
  };

  const handleDirectionsSelection = async (isGoogleMaps: boolean) => {
    try {
      const response = await axios.get(`https://ohwow-backend-gmviuexllq-uc.a.run.app/v2/places/${placeNid}`);
      const data = response.data;
      const directionsLink = isGoogleMaps
        ? `https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lon}`
        : `http://maps.apple.com/maps?saddr=&daddr=${data.lat},${data.lon}`;
      window.location.href = directionsLink;
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  };

  const redirectAppStore = () => {
    window.location.href = "https://apps.apple.com/us/app/oh-wow/id6469464202";
  }

  return (
    <main className={styles.main}>
      {currentAudioSrc !== "" &&
        <audio
          onLoadedMetadata={updateTimeHandler}
          onTimeUpdate={updateTimeHandler}
          onEnded={songEndHandler}
          ref={audioRef}
          src={currentAudioSrc}
        />
      }
      {currentSong.name !== "" &&
        <div>
          <Image
            src={currentSong.cover}
            alt="Picture of the place"
            className={styles.albumimage}
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
                (currentAudioSrc !== "" ?
                  <PlayArrowIcon className={styles.controlplaypause} />
                  :
                  <Image src="/loadingIcon.gif" alt="load icon" width={40} height={40} className={styles.controlplaypause} />)
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
          <div>
            <div className={styles.speedshare}>
              <Tooltip title="Tap to Change Speed">
                <Typography className={styles.speedchange} onClick={togglePlaybackSpeed}>{playbackSpeed}x</Typography>
              </Tooltip>
              <Tooltip title="Tap for Directions">
                <DirectionsIcon onClick={handleDirections} className={styles.directionsicon} />
              </Tooltip>
              {/* Directions Modal */}
              <Dialog open={isDirectionsModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Choose a Map for Directions:</DialogTitle>
                <DialogContent>
                  <Button onClick={() => handleDirectionsSelection(true)}>Google Maps</Button>
                  <Button onClick={() => handleDirectionsSelection(false)}>Apple Maps</Button>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseModal}>Close</Button>
                </DialogActions>
              </Dialog>
            </div>
            <br />
            <Image className={styles.appstorebutton} onClick={redirectAppStore} src="/icon.png" alt="app store download icon" width={50} height={50} />
            <Image className={styles.appstorebutton} onClick={redirectAppStore} src="/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="app store download icon" width={150} height={50} />
          </div>
        </div>
      }
    </main>
  )
}
