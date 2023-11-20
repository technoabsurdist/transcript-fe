import styles from './LinkInput.module.css';

export const LinkInput = () => {
    return (
        <div className={styles.container}>
            <input type="text" className={styles.inputBar} placeholder="Enter youtube link" /> 
            <button type="submit" className={styles.submitButton}>Submit</button>
        </div>
    )
}
