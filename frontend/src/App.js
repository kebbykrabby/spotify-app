import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Search from './search';
import Registration from './Registration';
import Playlist from './playlist';

function App() {
    return (
        <Router>
            <div>
                <h1>Spotify Song Search</h1>
                <nav className="nav">
                    <Link to="/">Home</Link>
                    <Link to="/playlist">Playlist</Link>
                </nav>
                <div className="container">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Search />
                                <Registration />
                            </>
                        } />
                        <Route path="/playlist" element={<Playlist />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
