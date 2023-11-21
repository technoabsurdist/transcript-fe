import React, { useState } from 'react';
import axios from 'axios';
import styles from './LinkInput.module.css';
import { jsPDF } from "jspdf";
import { BarLoader } from 'react-spinners';

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

    function addTitle(doc, title, titleSize, margin) {
        const trimmedTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
        title && doc.text(`${trimmedTitle} -- Transcript`, 10, margin);
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
    
        addTitle(doc, title, titleSize, margin);
    
        let currentY = margin + titleSize + 5;
        currentY = addContentSection(doc, formatChapters(chapters), lineHeight, currentY, margin, 'Chapters:');
        currentY = addContentSection(doc, tags.length > 0 ? ['Tags: ' + tags.join(', ')] : [], lineHeight, currentY, margin, '');
        currentY = addContentSection(doc, doc.splitTextToSize(summary, 180), lineHeight, currentY, margin, 'Summary:');
        addContentSection(doc, doc.splitTextToSize(text, 180), lineHeight, currentY, margin, 'Text:');
    
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
            headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/8.4.0'},
            data: { link }
        };
    
        axios.request(options).then(function (response) {
            const { text, summary, title, tags, chapters } = response.data
            const pdfBlob = createPdf(text, summary, title, tags, chapters);
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
    
    const handleDownloadUrl = () => {
        setDownloadUrl(null)
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
                    Transcription time varies, typically up to 5 minutes, based on file size. Transcription should always take &lt; 10 minutes.   
                </p>
                <div>
                    {isLoading ? 
                        <div style={{ marginTop: '20px'}}>
                            <BarLoader color="#FF0000" height="8" width="150" />
                        </div>
                    :
                        (downloadUrl && <a onClick={handleDownloadUrl} href={downloadUrl} download="transcript.pdf" className={styles.downloadLink}>Download Transcript!</a>)
                    }
                </div>
        </>
   );
}

export default LinkInput
