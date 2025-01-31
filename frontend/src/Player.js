import React, { useState, useRef } from 'react';
import { usePlayer } from './PlayerContext';

const Player = () => {
    const {
        playlist,
        currentSongIndex,
        setPlaylist,
        playNextSong,
        playPreviousSong,
        audioRef,
      } = usePlayer();
      
      
  const handleSongEnd = () => {
    playNextSong();
  };
  
  const handlePlay = () => {
    audioRef.current.play()
  };
  return (
    playlist && (
    <div>
      <h2>Player</h2>
      <audio
        ref={audioRef}
        src = {playlist && playlist[currentSongIndex] && `http://localhost:5000/stream/${playlist[currentSongIndex].id}`}
        controls
        autoPlay
        onEnded={handleSongEnd}
      />
      <button onClick={playPreviousSong}>Previous</button>
      <button onClick={handlePlay}>Play</button>
      <button onClick={playNextSong}>Next</button>
      <h6>Now playing {playlist && playlist[currentSongIndex] && playlist[currentSongIndex].name}</h6>
    </div> ) 

  );
};

export default Player;
