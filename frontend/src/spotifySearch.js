import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';

function SpotifySearch() {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState([]);

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

                    </div>
                ))}
            </div>
        </div>
    );
}

export default SpotifySearch;
