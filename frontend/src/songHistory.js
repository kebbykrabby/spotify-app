import React, { useState, useEffect } from 'react';
import axios from 'axios';

function songHistory(){
    const [loggedInUser, setLoggedInUser] = useState({ username: '' });
    const [songHistory, setSongHistory] = useState([]);
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user)); 
        }
    }, []);

    useEffect(() => {
            
            if (token && loggedInUser?.username) {
                fetchSongHistory();
            }
        }, [token, songHistory])
        
    const fetchSongHistory = async () => { 
            try {
                const username = loggedInUser?.username;
                const response = await axios.get('http://localhost:5000/api/userHistory', {
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
                <strong>{song.songLink}</strong>
                <span> {song.lastListen}</span>
              </li>
            ))}
          </ul>
        </div>
    );
} 

export default songHistory;