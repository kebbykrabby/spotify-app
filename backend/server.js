const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
    signIn, usernameExists, login, getUserHistory, addSongToHistory, 
    getPlaylistsOfUser, getPlaylist, createPlaylist, getUserId, 
    deletePlaylist, addSongToPlaylist, removeSongToPlaylist 
} = require('./src/index.ts');

dotenv.config();
const SECRET_KEY = 'Ben_Gurion_University_of_the_Negev';

const LAST_FM_API_KEY = '55903d07123f77a67a62957192f07496';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

// Spotify Token Endpoint
app.get('/api/token', async (req, res) => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'client_credentials',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Spotify token:', error.message);
        res.status(500).send('Error fetching Spotify token');
    }
});

// Genius Lyrics Endpoint
app.get('/api/lyrics', async (req, res) => {
    const { song, artist } = req.query;

    try {
        const response = await axios.get('https://api.genius.com/search', {
            headers: {
                Authorization: `Bearer ${process.env.GENIUS_API_KEY}`,
            },
            params: {
                q: `${song} ${artist}`,
            },
        });

        const hits = response.data.response.hits;

        // Filter for the best match
        const match = hits.find(
            (hit) =>
                hit.result.title.toLowerCase().includes(song.toLowerCase()) &&
                hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
        );

        if (match) {
            const lyricsUrl = match.result.url;
            res.json({ lyricsUrl });
        } else {
            res.status(404).send('Lyrics not found');
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        res.status(500).send('Error fetching lyrics');
    }
});

//Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    //console.log('Received username in API:', username);  // בדוק אם יש ערך כאן
    const isExists = usernameExists(username);
    if (!username || username == '' )
        res.status(400).send('Username not exists');
    else if (!password || password == '')
        res.status(400).send('Password is required');
    else{
        if (isExists) {
            const isValidCradentials = await login(username, password)
            console.log(`isValid: ${isValidCradentials}`);
            if (isValidCradentials){
                console.log('valid');
                const userId = getUserId(username);
                const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
                res.status(200).json({ token });
            } else {
                console.log('not valid');
                res.status(401).send('Username or password is incorrect');
            }
        } else {
            res.status(404).send('Username does not exist');
        }
    }
  });

// ✅ Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || username == '') {
        return res.status(400).send('Username is required');
    }
    if (!password || password == '') {
        return res.status(400).send('Password is required');
    }

    const isAlreadyExists = await usernameExists(username);
    if (isAlreadyExists) {
        return res.status(409).send('Username already exists');
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        signIn(username, hashedPassword);
        res.status(201).send('Successfully registered');
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error hashing password');
    }
});

// ✅ Fetch Top Tracks from Last.fm
app.get('/api/top-tracks', async (req, res) => {
    try {
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LAST_FM_API_KEY}&format=json`);
        res.json(response.data.tracks.track);
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        res.status(500).send("Error fetching top tracks");
    }
});

// ✅ Fetch Similar Tracks (Music Recommendations)
app.get('/api/similar-tracks', async (req, res) => {
    const { artist, track } = req.query;

    if (!artist || !track) {
        return res.status(400).send("Artist and track name are required.");
    }

    try {
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${artist}&track=${track}&api_key=${LAST_FM_API_KEY}&format=json`);
        res.json(response.data.similartracks.track);
    } catch (error) {
        console.error("Error fetching similar tracks:", error);
        res.status(500).send("Error fetching similar tracks");
    }
});


// ✅ Create Playlist Endpoint (Restored)
app.post('/createPlaylist', async (req, res) => {
    const { username, playlistName } = req.body;
    console.log('Received playlist creation request:', req.body);

    try {
      await createPlaylist(username, playlistName);
      res.status(201).send('Playlist created successfully');
    } catch (error) {
      res.status(500).send(`Error creating playlist: ${error.message}`);
    }
  });
  
// ✅ Add Song to Playlist Endpoint
app.post('/addSongToPlaylist', async (req, res) => {
    const { username, playlistName, songName, songLink } = req.body;

    try {
        await addSongToPlaylist(username, playlistName, songName, songLink);
        res.status(200).send("Song added successfully");
    } catch (error) {
        console.error("❌ Error adding song to playlist:", error);
        res.status(500).send(`Error adding song: ${error.message}`);
    }
});

// ✅ Get User Playlists Endpoint
app.get('/api/playlists', async (req, res) => {
    const { username } = req.query;
    if (!username || username === '') {
        return res.status(400).send('Username is required');
    }
    try {
        const playlists = await getPlaylistsOfUser(username);
        res.status(200).json(playlists);
    } catch (error) {
        console.error('❌ Error fetching playlists:', error);
        res.status(500).send(`Error fetching playlists: ${error.message}`);
    }
});

app.post('/deletePlaylist', async (req, res) => {
    const { username, playlistName } = req.body;

    if (!username || !playlistName) {
        return res.status(400).send('Username and playlistName are required.');
    }

    try {
        const result = await deletePlaylist(username, playlistName); 
        if (result) {
            res.status(200).send('Playlist deleted successfully');
        } else {
            res.status(404).send('Playlist not found');
        }
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).send('Error deleting playlist');
    }
});

// Endpoint to get playlist's content
app.get('/api/playlistContent', async (req, res) => {
    const { username, playlistName } = req.query;

    if (!username || username === '') {
        return res.status(400).send('Missing username');
    }
    try {

        const content = await getPlaylist(username, playlistName);
        res.status(200).json(content);
    } catch (error) {
        console.error(`Error fetching ${playlistName} content:`, error); // הדפסת השגיאה
        res.status(500).send(`Error fetching content: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});