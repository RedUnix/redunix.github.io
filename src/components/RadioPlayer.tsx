import { useEffect, useRef, useState } from 'react';
import { useMinimized } from '../utils/useMinimized';

interface RadioStation {
  name: string;
  url: string;
}

const RADIO_STATIONS: RadioStation[] = [
  { name: 'Electro House', url: 'https://stream.technolovers.fm/electro-house?ref=radiobrowser' },
  { name: 'BBC World Service', url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
  { name: 'Radio Stream', url: 'http://198.15.94.34:8006/stream' },
  { name: 'Radio Paradise Rock', url: 'http://stream.radioparadise.com/rock-320' },
  { name: 'Hits1 HD', url: 'https://radio7.pro-fhi.net/radio/9006/hits1hd' },
];

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const { isMinimized } = useMinimized('radio');

  // Listen for YouTube video playback events
  useEffect(() => {
    const handleYouTubePlay = () => {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    // Listen for custom events dispatched by YouTube monitoring script
    window.addEventListener('youtube-video-playing', handleYouTubePlay);

    return () => {
      window.removeEventListener('youtube-video-playing', handleYouTubePlay);
    };
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      let stationToPlay = currentStation;
      if (!stationToPlay) {
        // Auto-select first station if none selected
        stationToPlay = RADIO_STATIONS[0];
        setCurrentStation(stationToPlay);
        if (audioRef.current) {
          audioRef.current.src = stationToPlay.url;
          audioRef.current.volume = volume;
        }
      }
      
      // Wait a moment for the source to be set if it was just changed
      if (!currentStation) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing radio:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleStationSelect = (station: RadioStation) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Set flag to auto-play after source loads
    shouldAutoPlayRef.current = wasPlaying;
    setCurrentStation(station);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Update audio source when station changes
  useEffect(() => {
    if (!audioRef.current || !currentStation) return;

    const audio = audioRef.current;
    
    // Set up one-time event listeners for when the new source is ready
    const handleCanPlay = () => {
      if (shouldAutoPlayRef.current) {
        audio.play().catch((error) => {
          console.error('Error playing radio:', error);
          setIsPlaying(false);
        });
        shouldAutoPlayRef.current = false;
      }
    };

    const handleError = () => {
      shouldAutoPlayRef.current = false;
      setIsPlaying(false);
    };

    // Set the new source
    audio.src = currentStation.url;
    audio.volume = volume;
    
    // Wait for the audio to be ready before playing
    audio.addEventListener('canplay', handleCanPlay, { once: true });
    audio.addEventListener('error', handleError, { once: true });
    
    // Load the new source
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentStation, volume]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Radio playback error');
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Minimized view - show only play/pause and station name
  if (isMinimized) {
    return (
      <div className="h-6 flex items-center gap-2 px-2 font-mono text-xs opacity-70">
        <audio ref={audioRef} preload="none" />
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center border border-dim rounded-sm hover:border-accent transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l12 6-12 6V4z" />
            </svg>
          )}
        </button>
        <span className="text-accent font-bold">RADIO:</span>
        <span className="text-dim truncate max-w-[150px]">
          {currentStation?.name || 'None'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative bg-surface border-t border-dim">
      <audio ref={audioRef} preload="none" />
      
      <div className="flex items-center h-12 px-4 gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-dim rounded-sm hover:border-accent transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l12 6-12 6V4z" />
            </svg>
          )}
        </button>

        {/* Station Selector */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-surface scrollbar-track-transparent">
          <span className="text-xs font-mono text-dim flex-shrink-0">RADIO:</span>
          <div className="flex gap-1">
            {RADIO_STATIONS.map((station) => (
              <button
                key={station.url}
                onClick={() => handleStationSelect(station)}
                className={[
                  'px-2 py-1 rounded-sm text-xs font-mono whitespace-nowrap transition-colors border',
                  currentStation?.url === station.url
                    ? 'bg-accent text-bg border-accent'
                    : 'border-surface hover:border-accent text-dim',
                ].join(' ')}
                type="button"
              >
                {station.name}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-dim" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.97 9.97 0 0119 10a9.97 9.97 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-dim rounded-lg appearance-none cursor-pointer accent-accent"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

