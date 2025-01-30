import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";

function SongHistory(){
    const [loggedInUser, setLoggedInUser] = useState({ username: '' });
    const [songHistory, setSongHistory] = useState([]);
    const [token] = useState(localStorage.getItem('token'));
    const username = loggedInUser?.username;
    const location = useLocation();

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user)); 
        }
    }, []);

    useEffect(() => {
            
            if (token && username) {
                fetchSongHistory();
            }
        }, [])
        
    const fetchSongHistory = async () => { 
            try {
                
                const response = await axios.get('http://localhost:5000/userHistory', {
                    params: { username }, 
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSongHistory(response.data); 
                console.log('history:',response.data );
            } catch (error) {
                console.error(`Error fetching ${username} history:`, error);
            }
        };
    return(
        <div className="history-container">
            <h3>Your history</h3>
          <ul>
            {songHistory.map((song, index) => (
              <li key={index}>
                <strong>{song.songHistory.songId}</strong>
                <span> {song.songHistory.lastListen}</span>
              </li>
            ))}
            {console.log(songHistory)}
          </ul>
        </div>
    );
} 

export default SongHistory;