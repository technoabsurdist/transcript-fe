import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './LinkInput.module.css';
import { jsPDF } from "jspdf";
import Progress from './ProgressBar';

// const TESTURL = "http://127.0.0.1:5000"
const PRODURL = 'https://transcript-ai-py-5715a6893b2c.herokuapp.com/'
const SUBMIT_URL = `${PRODURL}/submit`

const LinkInput = () => {
    const [link, setLink] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setProgress(oldProgress => {
                    const newProgress = Math.min(oldProgress + (Math.random() < 0.5 ? 2 : 5), 95); 
                    return newProgress;
                });
            }, 2000); 
        }

        return () => clearInterval(interval);
    }, [isLoading, progress]);

    const isValidYoutubeLink = (url) => {
        const regex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|m\.youtube\.com)\/.+/;
        return regex.test(url);
    }

    function addTitle(doc, title, margin) {
        title ? doc.text(`${title} -- Transcript`, 10, margin) : doc.text("Transcript", 10, margin)
    }

    function addAuthor(doc, author, margin) {
        author ? doc.text(`${author}`, 8, margin) : ""
    }
 
    
    function addContentSection(doc, contentLines, lineHeight, yPosition, bottomMargin, sectionTitle) {
        let maxY = 297 - bottomMargin; 
    
        if (contentLines.length > 0) {
            yPosition += 5;
            doc.setFontSize(14);
            doc.text(sectionTitle, 10, yPosition);
            yPosition += lineHeight;
    
            doc.setFontSize(12);
            contentLines.forEach(line => {
                if (yPosition + lineHeight > maxY) {
                    doc.addPage();
                    yPosition = bottomMargin;
                    if (sectionTitle) {
                        doc.setFontSize(14);
                        doc.text(sectionTitle, 10, yPosition);
                        yPosition += lineHeight;
                    }
                    doc.setFontSize(12);
                }
                doc.text(line, 10, yPosition);
                yPosition += lineHeight;
            });
        }
        return yPosition;
    }
    
    function createPdf(text, title, author, summary) {
        const doc = new jsPDF();
        const titleSize = 18;
        const lineHeight = 10;
        const margin = 10;
    
        // Title and Author
        if (title) addTitle(doc, title, margin);
        if (author) addAuthor(doc, author, margin + titleSize);
    
        let currentY = margin + titleSize + 5;
    
        // Summary and Transcription
        currentY = addContentSection(doc, doc.splitTextToSize(summary, 180), lineHeight, currentY, margin, 'Summary');
        currentY += lineHeight; // Add extra space between sections
        addContentSection(doc, doc.splitTextToSize(text, 180), lineHeight, currentY, margin, 'Transcription');
    
        return doc.output("blob");
    }
    
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
            url: SUBMIT_URL,
            headers: {'Content-Type': 'application/json'},
            data: { url: link }
        };
    
        axios.request(options).then(function (response) {
            if (response.status === 200) { 
                console.log("Creating PDF...");     
                const pdfBlob = createPdf(response.data.text, response.data.title, response.data.author, response.data.summary);
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setDownloadUrl(pdfUrl);
                setProgress(100);
                setIsLoading(false);
            }
        }).catch(function (error) {
            console.log(error);
        });
        
        setLink('');
    };

    const handleDownloadUrl = () => {
        setDownloadUrl(null)
        setProgress(0)
    }

    const submitHelper = async () => {
        submitLink();
    };

    return (
        <>
            <div className={styles.container}>
                <input 
                    type="text" 
                    className={styles.inputBar} 
                    placeholder="Enter YouTube link..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                /> 
                <button 
                    type="button" 
                    onClick={submitHelper} 
                    className={styles.submitButton}
                >
                    Submit
                </button>
            </div>
                <div>
                    {isLoading ? 
                        <div className={styles.progressBar}>
                            <Progress bgcolor={"#FF0000"} completed={progress} />
                        </div>
                   :
                        (downloadUrl && <a onClick={handleDownloadUrl} href={downloadUrl} download="transcript.pdf" className={styles.downloadLink}>Download Transcript!</a>)
                    }
                </div>
        </>
   );
}

export default LinkInput
