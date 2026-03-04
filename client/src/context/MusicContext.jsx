import React, { createContext, useState, useContext } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // { url:String, isPlaying:Boolean }
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (url) => {
        setCurrentTrack(url);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <MusicContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlay }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);