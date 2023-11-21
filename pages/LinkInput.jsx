import React, { useState } from 'react';
import axios from 'axios';
import styles from './LinkInput.module.css';

const LinkInput = () => {
    const [link, setLink] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isValidYoutubeLink = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    };

    const submitLink = () => {
        if (!isValidYoutubeLink(link)) {
            alert("Error: Not a valid YouTube link. Please enter a valid YouTube URL.");
            setLink('')
            return;
        }

        setIsLoading(true);
        const options = {
            method: 'POST',
            url: 'https://transcription-youtube-ai-8dbe03372f2a.herokuapp.com/submit/',
            headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/8.4.0'},
            data: { link }
        };

        axios.request(options).then(function (response) {
            const responseText = response.data.text;
            setIsLoading(false);

            const blob = new Blob([responseText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        }).catch(function (error) {
            console.error(error);
            alert('An error occurred while processing your request');
            setIsLoading(false);
        });

        setLink('');
    };

    return (
        <>
            <div className={styles.container}>
                <input 
                    type="text" 
                    className={styles.inputBar} 
                    placeholder="Enter youtube link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                /> 
                <button 
                    type="button" 
                    onClick={submitLink} 
                    className={styles.submitButton}
                >
                    Submit
                </button>
            </div>
            <div>
                {isLoading ? <div className={styles.response}>Loading... (Processing may take up to 1-3 minutes)</div> : (
                    downloadUrl && <a href={downloadUrl} download="transcript.txt" className={styles.downloadLink}>Download Transcript!</a>
                )}
            </div>
        </>
   );
}

export default LinkInput
