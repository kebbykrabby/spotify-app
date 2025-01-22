import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Search from './search';
import Registration from './Registration';
import Playlist from './playlist';
import TopTracks from './topTracks';  // ✅ Now matches your filename

function App() {
    return (
        <Router>
            <div>
                <h1>Spotify Song Search</h1>
                
                {/* ✅ Keep the navigation bar */}
                <nav className="nav">
                    <Link to="/">Home</Link>
                    <Link to="/playlist">Playlist</Link>
                    <Link to="/top-tracks">Top Tracks</Link> {/* ✅ New link */}
                </nav>

                {/* ✅ Ensure Registration component appears on every page */}
                <Registration />

                <div className="container">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Search />
                            </>
                        } />
                        <Route path="/playlist" element={<Playlist />} />
                        <Route path="/top-tracks" element={<TopTracks />} /> {/* ✅ New Route */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
