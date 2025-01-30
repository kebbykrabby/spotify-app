import React, { createContext, useState, useContext, useRef } from 'react';
import axios from 'axios';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);
  const user = localStorage.getItem('loggedInUser');
  const username = JSON.parse(user);

  const playNextSong = () => {
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      addToHistory(playlist[currentSongIndex + 1].id);
    }
  };

  const playPreviousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      addToHistory(playlist[currentSongIndex - 1].id);
    }
  };

  const handleSongEnd = () => {
    playNextSong();
  };
  
  const handlePlay = () => {
    audioRef.current.play();
  };

  const handlePause = () => {
    audioRef.current.pause();
  ;}

  const addToHistory = async (  songId) => {
    try{
      await axios.post('http://localhost:5000/addSongToHistory', {
                    username: username.username,  songId, 
          });
    } catch(error) {
        console.error('Error adding song to historyyy: ', error);
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
        handlePlay,
        handleSongEnd,
        handlePause,
        addToHistory,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
export default PlayerProvider;

