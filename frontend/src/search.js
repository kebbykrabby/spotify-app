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

    // ✅ Search songs using Spotify API and fetch lyrics
    const searchSongs = async () => {
        try {

            const tokenResponse = await axios.get('http://localhost:5000/api/token');
            const accessToken = tokenResponse.data.access_token;

            const searchResponse = await axios.get(
                `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const tracks = searchResponse.data.tracks.items;

            // ✅ Fetch lyrics for each song
            const tracksWithLyrics = await Promise.all(
                tracks.map(async (track) => {
                    const songName = track.name;
                    const artistName = track.artists[0].name;

                    try {
                        const lyricsResponse = await axios.get('http://localhost:5000/api/lyrics', {
                            params: {
                                song: songName,
                                artist: artistName,
                            },
                        });

                        return { ...track, lyricsUrl: lyricsResponse.data.lyricsUrl };
                    } catch (error) {
                        return { ...track, lyricsUrl: null };
                    }
                })
            );

            setSongs(tracksWithLyrics);
        } catch (error) {
        }
    };

    // ✅ Handle adding a song to a playlist
    const handleAddToPlaylist = async (song) => {
        const playlistName = selectedPlaylist[song.id];

        if (!playlistName) {
            alert("❌ Please select a playlist before confirming.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/addSongToPlaylist", {
                username: loggedInUser.username,
                playlistName: playlistName,
                songName: song.name,
                songLink: song.external_urls.spotify,
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

    return (
        <div className="search-container">
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
                {songs.map((song) => (
                    <div className="song-card" key={song.id}>
                        <h3>{song.name}</h3>
                        <p><strong>Artists:</strong> {song.artists.map((artist) => artist.name).join(', ')}</p>
                        <p><strong>Album:</strong> {song.album.name}</p>
                        <img
                            src={song.album.images[0]?.url || 'https://via.placeholder.com/150'}
                            alt="Album Art"
                            className="album-art"
                        />
                        <p><strong>Spotify Link:</strong> <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">Open on Spotify</a></p>

                        {/* ✅ Display Lyrics Link */}
                        {song.lyricsUrl ? (
                            <p><strong>Lyrics:</strong> <a href={song.lyricsUrl} target="_blank" rel="noopener noreferrer">View Lyrics</a></p>
                        ) : (
                            <p><strong>Lyrics:</strong> Not available</p>
                        )}

                        {/* Add to Playlist Button */}
                        <button onClick={() => setShowPlaylistDropdown(song.id)}>Add to Playlist</button>

                        {/* Playlist Selection Dropdown */}
                        {showPlaylistDropdown === song.id && (
                            <div className="playlist-dropdown">
                                <select 
                                    onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, [song.id]: e.target.value })}
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
                                    disabled={!selectedPlaylist[song.id]}
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
