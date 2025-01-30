import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlaylistContent(params) {
    const { username, playlistName, setPlaylist, setCurrentSongIndex, addToHistory, playlist} = params
    const [token] = useState(localStorage.getItem('token'));
    const [content, setContent] = useState([]);
    useEffect(() => {
        
        if (token && username && playlistName) {
            fetchPlaylistContent();
        }
    }, [])
    //Fetch content of playlist
    const fetchPlaylistContent = async () => { 
            try {
                const response = await axios.get('http://localhost:5000/playlistContent', {
                    params: { username, playlistName }, 
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContent(response.data); 
                console.log('content:',response.data );
            } catch (error) {
                console.error(`Error fetching ${playlistName} content:`, error);
            }
        };

    const handleRemoveFromPlaylist = async (songId) => {
        try {
          await axios.post('http://localhost:5000/removeFromPlaylist', {
               username, playlistName , songId, 
          });
          fetchPlaylistContent();
      } catch (error) {
          console.error('Error removing song from playlist: ', error);
      }
    };
    
    const handlePlay = async (index) =>{
      setPlaylist(content);
      setCurrentSongIndex(index);
      console.log('adding to history')
      addToHistory(content[index]?.id);
    }
    return (
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h1>{playlistName}</h1>
          <button 
            onClick = {() =>handlePlay(0)}
            >Play playlist</button> 
          <ul>
            {content.map((song, index) => (
              <li key={index}>
                <strong>{song.name}</strong>
                <button 
                  onClick = {() => handlePlay(index)}
                  >Play</button> 
                <button 
                  onClick = {() => handleRemoveFromPlaylist(song.id)}
                  >Remove</button>  
              </li>
            ))}
          </ul>
        </div>
      );
}

export default PlaylistContent;
