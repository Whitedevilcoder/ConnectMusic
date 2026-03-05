import React, { createContext, useState, useContext } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    // 1. We now store an entire array of tracks and track the current index
    const [playlist, setPlaylist] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    // 2. The current track is derived from the playlist array dynamically
    const currentTrack = playlist[currentIndex] || null;

    // 3. Keep existing playTrack for backwards compatibility (loads a 1-song playlist)
    const playTrack = (url) => {
        setPlaylist([url]); 
        setCurrentIndex(0);
        setIsPlaying(true);
    };

    // 4. NEW: Load an entire playlist array and start playing
    const playPlaylist = (tracksArray, startIndex = 0) => {
        setPlaylist(tracksArray);
        setCurrentIndex(startIndex);
        setIsPlaying(true);
    };

    // 5. NEW: Next and Previous logic
    const playNext = () => {
        if (playlist.length > 0 && currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const playPrev = () => {
        if (playlist.length > 0 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <MusicContext.Provider value={{ 
            currentTrack, 
            isPlaying, 
            playlist,
            playTrack, 
            playPlaylist,
            playNext,
            playPrev,
            togglePlay 
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);