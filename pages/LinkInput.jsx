import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './LinkInput.module.css';
import { jsPDF } from "jspdf";
import Progress from './ProgressBar';

const TESTURL = "http://localhost:3001/submit"
const PRODURL = 'https://transcription-ai2-45d1977a4b48.herokuapp.com/submit/'

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
    
    function addContentSection(doc, contentLines, lineHeight, yPosition, bottomMargin, sectionTitle) {
        if (contentLines.length > 0) {
            yPosition += 5; // Extra spacing before new section
            doc.setFontSize(14);
            doc.text(sectionTitle, 10, yPosition);
            yPosition += lineHeight;
    
            doc.setFontSize(12);
            contentLines.forEach(line => {
                if (yPosition + lineHeight > 297 - bottomMargin) {
                    doc.addPage();
                    yPosition = bottomMargin; // Reset Y position after page break
                    doc.setFontSize(14);
                    doc.text(sectionTitle, 10, yPosition);
                    yPosition += lineHeight;
                    doc.setFontSize(12);
                }
                doc.text(line, 10, yPosition);
                yPosition += lineHeight;
            });
        }
        return yPosition;
    }
    
    function formatChapters(chapters) {
        return chapters.map(chapter => `${chapter.title} (Starts at: ${chapter.timecode})`);
    }
    
    function createPdf(text, summary, title, tags, chapters) {
        const doc = new jsPDF();
        const titleSize = 18;
        const lineHeight = 10;
        const margin = 10;
    
        title ? addTitle(doc, title, margin) : ""
    
        let currentY = margin + titleSize + 5;
        currentY = chapters ? addContentSection(doc, formatChapters(chapters), lineHeight, currentY, margin, 'Chapters') : currentY;
        currentY = tags ? addContentSection(doc, tags.length > 0 ? ['Tags ' + tags.join(', ')] : [], lineHeight, currentY, margin, '') : currentY;
        currentY = summary ? addContentSection(doc, doc.splitTextToSize(summary, 180), lineHeight, currentY, margin, 'Summary') : currentY;
        addContentSection(doc, doc.splitTextToSize(text, 180), lineHeight, currentY, margin, 'Text');
    
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
            url: PRODURL,
            headers: {'Content-Type': 'application/json'},
            data: { link }
        };
    
        axios.request(options).then(function (response) {
            const res = response.data
            const pdfBlob = createPdf(...res);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            console.log(pdfUrl)
            setIsLoading(false);
        }) 
    
        setLink('');
    };
    
    const handleDownloadUrl = () => {
        setDownloadUrl(null)
        setProgress(0)
    }

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
                    onClick={submitLink} 
                    className={styles.submitButton}
                >
                    Submit
                </button>
            </div>
                <p className={styles.warningText}>
                    <span style={{ fontWeight: '800'}}>Important</span>: Premium and restricted videos are not supported. 
                     Currently only stable for videos &lt; 10m.   
                </p>
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
