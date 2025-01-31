import React, { createContext, useState, useContext, useRef } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);

  const playNextSong = () => {
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const playPreviousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentSongIndex,
        setCurrentSongIndex,
        playNextSong,
        playPreviousSong,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
export default PlayerProvider;

