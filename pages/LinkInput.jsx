import React, { useState } from 'react';
import axios from 'axios';
import styles from './LinkInput.module.css';
import { jsPDF } from "jspdf";
import languages from '../languages';
import ProcessingTypes from '../processingTypes';

const TESTURL = "http://localhost:3001/submit"
const PRODURL = 'https://transcription-youtube-ai-8dbe03372f2a.herokuapp.com/submit/'

const LinkInput = () => {
    const [link, setLink] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isValidYoutubeLink = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    };

    const createPdf = (text, title) => {
        const doc = new jsPDF();
        const titleSize = 18;
        const lineHeight = 10;
        const margin = 10;
    
        // Title
        doc.setFontSize(titleSize);
        const trimmedTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
        title ? doc.text(`${trimmedTitle} --Transcript`, 10, margin) : ""
    
        // Text
        let yPosition = margin + titleSize;
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(text, 180);
        lines.forEach(line => {
            if (yPosition + lineHeight > 297 - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, 10, yPosition);
            yPosition += lineHeight;
        });
    
        return doc.output("blob");
    };

    const submitLink = () => {
        setDownloadUrl(null)
        if (!isValidYoutubeLink(link)) {
            alert("Error: Not a valid YouTube link. Please enter a valid YouTube URL.");
            setLink('');
            return;
        }
    
        setIsLoading(true);
        const options = {
            method: 'POST',
            url: TESTURL,
            headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/8.4.0'},
            data: { link }
        };
    
        axios.request(options).then(function (response) {
            const { text, title } = response.data;
            const pdfBlob = createPdf(text, title);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setDownloadUrl(pdfUrl);
            setIsLoading(false);
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
                <p className={styles.warningText}>
                    <span style={{ fontWeight: '600'}}>Warning</span>: cannot process regionally restricted, private, or videos longer than thirty minutes. 
                </p>
            <div>
                {isLoading ? <div className={styles.response}>Loading... (Processing may take 1-5 minutes)</div> : (
                    downloadUrl && <a href={downloadUrl} download="transcript.pdf" className={styles.downloadLink}>Download Transcript!</a>
                )}
            </div>
        </>
   );
}

export default LinkInput
