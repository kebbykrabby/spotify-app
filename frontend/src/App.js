import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Search from './search';
import Registration from './Registration';
import Playlist from './playlist';
import TopTracks from './topTracks';  // ✅ Now matches your filename
import PlayerProvider from './PlayerContext';
import Player from './Player';
import SongUpload from './SongUpload';
import SpotifySearch from './spotifySearch';

function App() {
    return (
        <Router>
            <PlayerProvider>
                <div>
                   
                    {/* ✅ Keep the navigation bar */}
                    <nav className="nav">
                        <Link to="/search">Search</Link>
                        <Link to="/spotify-search">Spotify search</Link>
                        <Link to="/">Playlist</Link>
                        <Link to="/top-tracks">Top Tracks</Link> {/* ✅ New link */}
                        <Link to="/song-upload">Upload songs</Link>
                    </nav>

                    {/* ✅ Ensure Registration component appears on every page */}
                    <Registration />

                    <div className="container">
                        <Routes>
                            <Route path="/search" element={<Search />} />
                            <Route path="/spotify-search" element={<SpotifySearch />} />
                            <Route path="/" element={<Playlist />} />
                            <Route path="/top-tracks" element={<TopTracks />} /> {/* ✅ New Route */}
                            <Route path="/song-upload" element={<SongUpload />} />
                        </Routes>
                    </div>
                    <Player />
                </div>
            </PlayerProvider>
        </Router>
    );
}

export default App;
