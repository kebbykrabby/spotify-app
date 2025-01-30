import React, { useState, useEffect } from 'react';
import './playlist.css';
import axios from 'axios';
import { createRoot } from "react-dom/client";
import PlaylistContent from './PlaylistContent';
import { usePlayer} from './PlayerContext'

function Playlist() {
    const [playlists, setPlaylists] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState({ username: '' });  // ודא שאתה מקבל את המשתמש בהצלחה
    const [playlistName, setPlaylistName] = useState('');
    const [songName, setSongName] = useState('');
    const [songLink, setSongLink] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [token] = useState(localStorage.getItem('token'));
    const [popupWindow, setPopupWindow] = useState(null);
    const {
            playlist: currentPlaylist,
            currentSongIndex,
            setPlaylist,
            playNextSong,
            playPreviousSong,
            setCurrentSongIndex,
            addToHistory,
          } = usePlayer();
    
    useEffect(() => {
      // טעינת המשתמש מ-localStorage או דרך חיבור לאותו המשתמש
      const user = localStorage.getItem('loggedInUser');
      if (user) {
          setLoggedInUser(JSON.parse(user)); // מטעין את המשתמש המקומי
      }
  }, []);

    
    // Fetch Playlists
    useEffect(() => {
        // אם יש לך token ו-loggeinUser אז תבצע fetchPlaylists
        if (token && loggedInUser?.username) {
            fetchPlaylists();
        }
    }, [token, loggedInUser]); // תלות ב-loggedInUser ו-token

    // Display playlist's songs component in a popup window
    useEffect(() => {
        displayInWindow();
      }, [popupWindow]);
    
    const displayInWindow = async () => {

        if (popupWindow?.window) {
            const { window: newWindow, params } = popupWindow;
            // Render the component into the popup window
            const container = document.createElement("div");
            newWindow.document.body.appendChild(container);
            const root = createRoot(container);
            root.render(<PlaylistContent {...params} />);
            // Clean up when the popup window is closed
            const interval = setInterval(() => {
              if (newWindow.closed) {
                clearInterval(interval);
                setPopupWindow(null);
              }
            }, 500);
      
            // Close the popup window on unmount
            return () => {
              clearInterval(interval);
              newWindow.close();
            };
          }
    }

    // פוקנציה להורדת פלייליסטים
    const fetchPlaylists = async () => {
        try {
            const username = loggedInUser?.username; // השתמש ב-loggedInUser למשתמש
            console.log('Received username:', username);  // בודק אם שם המשתמש מוגדר
            const response = await axios.get('http://localhost:5000/api/playlists', {
                params: { username }, // שלח את שם המשתמש בבקשה
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlaylists(response.data); // עדכן את הפלייליסטים
            console.log('playlist:',response.data );
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    // פוקנציה ליצירת פלייליסט
    const handleCreatePlaylist = async () => {
      console.log('LoggedInUser:', loggedInUser);
      if (!playlistName) {
          alert("Please enter a playlist name.");
          return;
      }
      try {
          const response = await axios.post('http://localhost:5000/createPlaylist', {
              username: loggedInUser.username, // השתמש בשם המשתמש
              playlistName,
          });
          console.log('Playlist created:', response.data); // הדפסת תוצאות יצירת הפלייליסט
          fetchPlaylists(); // עדכון הפלייליסטים
          setPlaylistName(''); // ניקוי השדה
      } catch (error) {
          console.error('Error creating playlist:', error);
      }
    };

    // פוקנציה להוספת שיר לפלייליסט
    const handleAddSong = async () => {
        if (selectedPlaylist && songName && songLink) {
            try {
                const response = await axios.post('http://localhost:5000/addSongToPlaylist', {
                    username: loggedInUser?.username, // השתמש בשם המשתמש
                    playlistName: selectedPlaylist,
                    songName,
                    songLink,
                });
                console.log('Song added:', response.data); // הדפסת תוצאות הוספת השיר
                setSongName(''); // ניקוי השדה של השיר
                setSongLink(''); // ניקוי השדה של הקישור
            } catch (error) {
                console.error('Error adding song:', error);
            }
        } else {
            alert('Please fill all the fields.');
        }
    };

    // פוקנציה למחיקת פלייליסט
    const handleDeletePlaylist = async (playlistName) => {
        try {
            const response = await axios.post('http://localhost:5000/deletePlaylist', {
                username: loggedInUser?.username, // השתמש בשם המשתמש
                playlistName,
            });
            console.log('Playlist deleted:', response.data); // הדפסת תוצאות מחיקת הפלייליסט
            fetchPlaylists(); // עדכון הפלייליסטים
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    };


    // Create new window to display the songs
    const handleDisplayContent = (params) => {
        const newWindow = window.open(
          "",
          "_blank",
          "width=600,height=400,left=200,top=200"
        );
    
        setPopupWindow({ window: newWindow, params });
      };

    // הדפסת התוכן של הפלייליסטים
    return (
        <div className="playlist-container">
            <h3>Your Playlists</h3>
            <div className="create-playlist">
                <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                />
                <button onClick={handleCreatePlaylist}>Create Playlist</button>
            </div>

            <div className="playlist-list">
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <div key={playlist.id} className="playlist-item">
                            <h4 onClick = {() => handleDisplayContent({username: loggedInUser.username, playlistName: playlist.name, setPlaylist, setCurrentSongIndex, addToHistory, currentPlaylist, })}>{playlist.name}</h4>
                            <button onClick={() => handleDeletePlaylist(playlist.name)}>Delete</button>
                        </div>
                    ))
                ) : (
                    <p>No playlists found.</p>
                )}
            </div>

            
        </div>
    );
}

export default Playlist;
