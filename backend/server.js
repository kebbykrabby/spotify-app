const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signIn, usernameExists, login, getUserHistory, addSongToHistory, getPlaylistsOfUser, getPlaylist, createPlaylist, getUserId, deletePlaylist, addSongToPlaylist, removeSongToPlaylist } = require('./src/index.ts');

dotenv.config();
const SECRET_KEY = 'Ben_Gurion_University_of_the_Negev';
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

//Register Endpoint  
app.post('/register',async (req, res) => {
    const { username, password } = req.body;
    console.log('password: ', password)
    if (!username || username == '' )
        res.status(400).send('Username is required');
    else if (!password || password == '')
        res.status(400).send('Password is required');
    else{
        const isAlreadyExists = await usernameExists(username);
        if (isAlreadyExists)
            res.status(409).send('Username already exists');
        else{           
            try{
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                signIn(username  , hashedPassword);
                res.status(201).send('successfully registered');
            } catch (err) {
                console.error('Error hashing password:', err);
                res.status(500).send('Error hashing password' );
            }
        }
    }
        
});

app.post('/createPlaylist', async (req, res) => {
    const { username, playlistName } = req.body;
    console.log('Received playlist creation request:', req.body);

    try {
    console.log('Attempting to create playlist');  // הדפסה לבדוק אם הפונקציה הגיעה לשלב זה
      await createPlaylist(username, playlistName);
      console.log('Playlist created, sending response');
      res.status(201).send('Playlist created successfully');
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).send(`Error creating playlist: ${error.message}`);
    }
  });
  

// Endpoint to get playlists for a user
app.get('/api/playlists', async (req, res) => {
    const { username } = req.query;
    console.log('Received username in API:', username);

    if (!username || username === '') {
        return res.status(400).send('Username is required');
    }
    console.log('Checking user ID for username:', username);

    try {
        // // חפש את ה-userId של המשתמש
        // const userIdResult = await getUserId(username);

        // // הוספת Console.log כדי לבדוק את המידע שהתקבל
        // console.log('UserID:', userIdResult);

        // if (userIdResult.length === 0) {
        //     return res.status(404).send('User not found');
        // }

        // const userId = userIdResult[0].id;

        // קבל את הפלייליסטים של המשתמש
        const playlists = await getPlaylistsOfUser(username);

        // החזר תשובה עם הפלייליסטים
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error); // הדפסת השגיאה
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
        console.log("Playlist was delete");
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

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});