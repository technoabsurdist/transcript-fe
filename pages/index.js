import Head from 'next/head';
import styles from '../styles/Home.module.css';
import LinkInput from './LinkInput';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Youtube Transcript AI</title>
        <link rel="icon" href="/yb.png" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </Head>

      <main>
        <img src="/yb.png" height="150" width="170" alt="YouTube Logo" className={styles.youtubeLogo} />
        <h1 className={styles.title}>
          <a href="https://github.com/technoabsurdist/transcript.ai" target='_blank'>YouTube Transcript</a>
        </h1>

        <p className={styles.description}>
          Develop detailed transcripts in over 50 languages, <br /> with titles and concise AI-generated summaries.
        </p>
        <LinkInput /> 
      </main>
        <footer style={{ fontFamily: 'VT323', fontSize: '25px' }}>
          Powered by 
          <a href="https://www.sievedata.com/" target='_blank'>
            <img src="/sieve.png" height="25" width="25" alt="Sieve Logo" /> 
          </a>
          &nbsp;
          | 
          &nbsp;
          <a href="https://github.com/technoabsurdist/transcript.ai" target='_blank'>
          Contribute 
            <img src="/githublogo.png" height="25" width="25" alt="Sieve Logo" /> 
          </a>
        </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            VT323,
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
