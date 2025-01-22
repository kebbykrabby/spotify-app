import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './topTracks.css';

function TopTracks() {
    const [topTracks, setTopTracks] = useState([]);
    const [recommendedTracks, setRecommendedTracks] = useState([]);
    const [artist, setArtist] = useState('');
    const [track, setTrack] = useState('');

    // Fetch top tracks from Last.fm API
    useEffect(() => {
        const fetchTopTracks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/top-tracks');
                setTopTracks(response.data);
            } catch (error) {
                console.error("Error fetching top tracks:", error);
            }
        };

        fetchTopTracks();
    }, []);

    // Fetch similar tracks based on user input
    const getRecommendations = async () => {
        if (!artist || !track) {
            alert("Please enter both artist and track name.");
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/similar-tracks', {
                params: { artist, track }
            });
            setRecommendedTracks(response.data);
        } catch (error) {
            console.error("Error fetching similar tracks:", error);
        }
    };

    return (
        <div className="top-tracks-container">
            {/* 🔥 Top Tracks Section (Left Side) */}
            <div className="top-tracks">
                <h2>🔥 Popular Tracks</h2>
                {topTracks.slice(0, 10).map((track, index) => (
                    <div key={index} className="track-card">
                        <img src={track.image[2]['#text'] || 'https://via.placeholder.com/50'} alt={track.name} />
                        <div className="track-info">
                            <h3>{track.name}</h3>
                            <p>{track.artist.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🎯 Music Recommendation Section (Right Side) */}
            <div className="music-recommendations">
                <h2>🔍 Find Similar Songs</h2>
                <div className="recommendation-form">
                    <input
                        type="text"
                        placeholder="Artist Name"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Song Name"
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                    />
                    <button onClick={getRecommendations}>Get Recommendations</button>
                </div>

                {/* Display Recommended Songs */}
                <div className="recommended-tracks">
                    {recommendedTracks.slice(0, 5).map((track, index) => (
                        <div key={index} className="recommended-card">
                            <img src={track.image[2]['#text'] || 'https://via.placeholder.com/50'} alt={track.name} />
                            <div className="track-info">
                                <h3>{track.name}</h3>
                                <p>{track.artist.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TopTracks;
