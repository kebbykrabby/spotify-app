const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const { 
    signIn, usernameExists, login, getUserHistory, addSongToHistory, 
    getPlaylistsOfUser, getPlaylist, createPlaylist, getUserId, 
    deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, 
    addSong, searchSongs, getSongById,
} = require('./src/index.ts');

dotenv.config();
const SECRET_KEY = 'Ben_Gurion_University_of_the_Negev';

const LAST_FM_API_KEY = '55903d07123f77a67a62957192f07496';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

// Upload endpoint
app.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm();
    const mediaPath = path.join(__dirname, 'media');
    form.uploadDir = mediaPath;
    form.keepExtensions = true; 
    form.on('fileBegin', (name, file) => {
        if (!file.mimetype === 'audio/mpeg' || !path.extname(file.originalFilename) === '.mp3') {
            throw new Error('Invalid file type. Only MP3 files are allowed.');
          }
        file.filepath = path.join(mediaPath, file.originalFilename); 
      });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to upload file' });
      }
      const path = files.song[0].filepath;
      const songName = files.song[0].originalFilename;
      const username = fields.username[0];
      addSong( songName, username, path );
      res.status(200).json('File uploaded successfully');
    });

  });

//Streaming Endpoint
app.get('/stream/:songId', async (req, res) => {
    
    const { songId } = req.params; 
    const song = await getSongById(songId); 
    const filePath = song[0].filePath;
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
  
      if (range) {
        // Parse Range header
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        };
  
        res.writeHead(206, head); // Partial Content
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        };
        res.writeHead(200, head); // Full Content
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      res.status(404).send('File not found');
    }
  });

app.get('/search', async (req, res) => {
    const { query } = req.query;
    try{
        const results = await searchSongs(query);
        res.status(200).json(results);
    } catch{
        res.status(500).send('Error fetching search results ')
    }
    

})

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
            if (isValidCradentials){
                const userId = getUserId(username);
                const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
                res.status(200).json({ token });
            } else {
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
    const { username, playlistName, songId } = req.body;

    try {
        await addSongToPlaylist(username, playlistName, songId);
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
        await deletePlaylist(username, playlistName); 
        res.status(200).send('Playlist deleted successfully');
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).send('Error deleting playlist');
    }
});

// Endpoint to get playlist's content
app.get('/playlistContent', async (req, res) => {
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

app.post('/removeFromPlaylist', async (req, res) => {
    const { username, playlistName, songLink } = req.body;
    if (!username || !playlistName || !songLink) {
        return res.status(400).send('Something is  missing.');
    }
    try {
        await removeSongFromPlaylist(username, playlistName, songLink); 
        res.status(200).send('song removed successfully');  
    } catch (error) {
        console.error('Error removing song:', error);
        res.status(500).send('Error removing song');
    }
});

app.post('/addSongToHistory', async (req, res) => {
    const { username,  songId } = req.body;
    if (!username || !songId) {
        return res.status(400).send('Something is  missing.');
    }

    try {
        await addSongToHistory(username,  songId); 
        res.status(200).send('Song added to history');
    } catch (error) {
        console.error('Error adding song to history:', error);
        res.status(500).send('Error adding song to history');
    }
});

app.get('/userHistory', async (req, res) => {
    const { username } = req.query;
    if (!username || username === '') {
        return res.status(400).send('Missing username');
    }
    try {
        const userHistory = await getUserHistory(username);
        res.status(200).json(userHistory);
    } catch (error) {
        console.error(`Error fetching ${username} history:`, error); // הדפסת השגיאה
        res.status(500).send(`Error fetching history: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});