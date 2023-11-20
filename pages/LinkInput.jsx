import React, { useState } from 'react';
import styles from './LinkInput.module.css';

export const LinkInput = () => {
    const [link, setLink] = useState('');
    const [response, setResponse] = useState('');

    const submitLink = () => {
        setTimeout(() => {
            const dummyResponse = `Processed link: ${link}`;
            setResponse(dummyResponse);
        }, 1000); 
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
            {response && <div className={styles.response}>{response}</div>}
        </div>
        
        </>
   );
}
