import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Dog Cat Detector</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a>Dog or Cat Detector</a>
        </h1>

        <div className={styles.grid}>
          <a href="/train" className={styles.card}>
            <h3>Train &rarr;</h3>
            <p>Help train our nearest neighbour model.</p>
          </a>

          <a href="/classify" className={styles.card}>
            <h3>Classify &rarr;</h3>
            <p>
              Classify an image to see what a pretrained model thinks it is!
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/">Home</a>
        &nbsp;|&nbsp;
        <a href="/train">Train</a>
        &nbsp;|&nbsp;
        <a href="/classify">Classify</a>
        &nbsp;|&nbsp;
        <a
          href="https://www.tensorflow.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by TensorFlow
        </a>
      </footer>
    </div>
  );
}
