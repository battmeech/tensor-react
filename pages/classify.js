import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

function Classify() {
  const [knn, setKnn] = useState(null);
  const [model, setModel] = useState(null);
  const [classification, setClassification] = useState(null);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const loadModel = async () => {
    const dataSet = localStorage.getItem("myData");
    const knnClass = knnClassifier.create();

    if (dataSet) {
      knnClass.setClassifierDataset(
        Object.fromEntries(
          JSON.parse(dataSet).map(([label, data, shape]) => [
            label,
            tf.tensor(data, shape),
          ])
        )
      );
    }

    setKnn(knnClass);
    const model = await mobilenet.load();
    setModel(model);
  };

  useEffect(() => {
    loadModel();
  }, []);

  const upload = () => {
    inputRef.current.click();
  };

  const handleUpload = (event) => {
    const { files } = event.target;

    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);

      const img = new Image();
      img.src = url;

      img.onload = () => {
        const image = tf.browser.fromPixels(img);
        model.classify(image).then((result) => {
          setClassification(result);
        });

        if (knn.getNumClasses() !== 0) {
          knn
            .predictClass(model.infer(image, "conv_preds"), 10)
            .then((result) => {
              setResult(result);
            });
        }
      };
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Image classifier</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Classify</h1>

        <input
          type="file"
          accept="image/*"
          capture="camera"
          onChange={handleUpload}
          ref={inputRef}
        />

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Nearest Neighbour</h3>
            {result ? (
              <p>
                {result.label} - Confidence{" "}
                {result.confidences[result.label] * 100}%
              </p>
            ) : (
              <p>No results, please upload an image</p>
            )}
          </div>

          <div className={styles.card}>
            <h3>Classification</h3>
            {classification ? (
              <p>
                Most likely a {classification[0].className} - Confidence{" "}
                {classification[0].probability * 100}%
              </p>
            ) : (
              <p>No results, please upload an image</p>
            )}
          </div>
          <button onClick={upload} className={styles.card}>
            <h3>Upload &uarr;</h3>
            <p>Upload an image to allow us to classify it.</p>
          </button>
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

export default Classify;
