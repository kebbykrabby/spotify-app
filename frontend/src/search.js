import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';

function Search() {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState({});
    const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(null);
    const [token, setToken] = useState(null);

    // ✅ Load logged-in user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setLoggedInUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    // ✅ Fetch user's playlists when the component mounts
    useEffect(() => {
        if (token && loggedInUser?.username) {
            fetchPlaylists();
        }
    }, [token, loggedInUser]);

    // ✅ Fetch user's playlists from backend
    const fetchPlaylists = async () => {
        try {

            const response = await axios.get('http://localhost:5000/api/playlists', {
                params: { username: loggedInUser.username },
                headers: { Authorization: `Bearer ${token}` },
            });

            setPlaylists(response.data);
        } catch (error) {
        }
    };

    const searchSongs = async () => {
        try {

            const searchResponse = await axios.get(`http://localhost:5000/search`, {
                    params: { query },
                }
            );
            setSongs(searchResponse.data);
        } catch (error) {
        }
    };

    // ✅ Handle adding a song to a playlist
    const handleAddToPlaylist = async (song) => {
        const playlistName = selectedPlaylist[song.idx];

        if (!playlistName) {
            alert("❌ Please select a playlist before confirming.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/addSongToPlaylist", {
                username: loggedInUser.username,
                playlistName: playlistName,
                songId: song.id,
            });

            alert(`🎵 Song '${song.name}' added to playlist '${playlistName}'`);

            // Reset selection
            setShowPlaylistDropdown(null);
            setSelectedPlaylist({});
        } catch (error) {
            console.error("❌ Error adding song to playlist:", error.response?.data || error.message);
            alert("Failed to add song to playlist.");
        }
    };

    const handleDeleteSong = async (song) => {
        try {
                const response = await axios.post("http://localhost:5000/deleteSong", {
                    username: loggedInUser.username,
                    songId: song.id,
            });
            if (response.status === 200)
                alert(`🎵 Song '${song.name}' has been deleted'`);
            else if (response.status === 403)
                alert(`You are not allowed to delete this song...`);
            searchSongs();
        } catch (error) {
            console.error("❌ Error deleting song to playlist:", error.response?.data || error.message);
            alert("You are not allowed to delete this song...");
        }
    }
    return (
        <div className="search-container">
            <h1>Song Search</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={searchSongs}>Search</button>
            </div>

            {/* Search Results */}
            <div className="results-container">
                {songs.length === 0 ? 'No results have been found...': ' '}
                {songs.map((song) => (
                    <div className="song-card" key={song.idx}>
                        <h3>{song.name}</h3>
                        <img
                            src= 'https://via.placeholder.com/150'
                            alt="Album Art"
                            className="album-art"
                        />
                        
                        {/* Add to Playlist Button */}
                        <button onClick={() => setShowPlaylistDropdown(song.idx)}>Add to Playlist</button>
                        <button onClick={() => handleDeleteSong(song)}>Delete</button>
                        {/* Playlist Selection Dropdown */}
                        {showPlaylistDropdown === song.idx && (
                            <div className="playlist-dropdown">
                                <select 
                                    onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, [song.idx]: e.target.value })}
                                >
                                    <option value="">-- Select Playlist --</option>
                                    {playlists.length > 0 ? (
                                        playlists.map((playlist) => (
                                            <option key={playlist.id} value={playlist.name}>
                                                {playlist.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>❌ No Playlists Found</option>
                                    )}
                                </select>
                                <button 
                                    onClick={() => handleAddToPlaylist(song)}
                                    disabled={!selectedPlaylist[song.idx]}
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Search;
