import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlaylistContent(params) {
    const { username, playlistName } = params
    const [token] = useState(localStorage.getItem('token'));
    const [content, setContent] = useState([]);
    console.log("something wrong");
    useEffect(() => {
        
        if (token && username && playlistName) {
            console.log("trying to fetch content");
            fetchPlaylistContent();
            console.log("content fetched");
        }
    }, [token])
    const fetchPlaylistContent = async () => { 
            try {
                console.log('Received username::', username);  
                const response = await axios.get('http://localhost:5000/api/playlistContent', {
                    params: { username, playlistName }, 
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContent(response.data); 
                console.log('content:',response.data );
            } catch (error) {
                console.error(`Error fetching ${playlistName} content:`, error);
            }
        };
        return (
            <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <h1>{playlistName}</h1>
              <ul>
                {content.map((song, index) => (
                  <li key={index}>
                    <strong>{song.name}</strong>
                    {song.link && <span> by {song.link}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
}

export default PlaylistContent;
