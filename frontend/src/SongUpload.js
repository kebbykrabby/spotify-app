import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SongUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loggedInUser, setLoggedInUser] = useState({ username: '' });
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
            const user = localStorage.getItem('loggedInUser');
            if (token && user) {
                setLoggedInUser(JSON.parse(user)); 
            }
        }, []);
    

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'audio/mpeg') {
              alert('Please upload a valid MP3 file.');
              return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (token && loggedInUser?.username){
            if (!file) {
            setMessage('Please select a file to upload');
            return;
            }

            const formData = new FormData();
            formData.append('song', file);
            formData.append('username', loggedInUser?.username);

            try {
                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                setFile(null);
                setMessage(`File uploaded successfully `);
                
            } catch (error) {
            setMessage('An error occurred while uploading the file');
            }
        }
        else if (!token)
            alert('Must be logged in to upload songs');
    };

    return (
        <div>
        <h2>Upload a Song</h2>
        <input type="file" accept=".mp3" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {message && <p>{message}</p>}
        </div>
    );
};

export default SongUpload;
