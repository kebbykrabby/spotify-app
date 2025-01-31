import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Search from './search';
import Registration from './Registration';
import Playlist from './playlist';
import TopTracks from './topTracks';  // ✅ Now matches your filename
import Login from './registration/login';

function App() {
    return (
        <Router>
            <div class="page">
                <aside className="nav">
                        <Link to="/">
                            <div class="nav-line">Home</div>
                        </Link>
                        <Link to="/login" component={Login} exact>
                            <div class="nav-line">login/signup</div>
                        </Link>
                        <Link to="/playlist">
                            <div class="nav-line">Playlists</div>
                        </Link>
                        <Link to="/top-tracks">
                            <div class="nav-line">Top Tracks</div>
                        </Link> {/* ✅ New link */}
                    </aside>
                
                {/* ✅ Keep the navigation bar */}
                <div class="page-content">

                <h1 class="title">Song Search</h1>
   

                {/* ✅ Ensure Registration component appears on every page */}
                {/* <Registration /> */}

                    <div className="container">
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <Search />
                                </>
                            } />
                            <Route path="/login" element={<Login />} />
                            <Route path="/playlist" element={<Playlist />} />
                            <Route path="/top-tracks" element={<TopTracks />} /> {/* ✅ New Route */}
                        </Routes>
                    </div>
                    <footer class="song-played">
                         this is where songs played go
                    </footer>
                </div>
            </div>
        </Router>
    );
}

export default App;
