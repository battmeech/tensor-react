import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import Head from "next/head";
import { useEffect, useReducer, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

const machine = {
  initial: "loadingModel",
  states: {
    loadingModel: { on: { next: "modelReady" } },
    modelReady: { on: { next: "modelReady" } },
  },
};

function Train() {
  const reducer = (state, event) =>
    machine.states[state].on[event] || machine.initial;
  const [appState, dispatch] = useReducer(reducer, machine.initial);
  // const [dogUrls, setDogUrls] = useState([]);
  // const [catUrls, setCatUrls] = useState([]);
  const [knn, setKnn] = useState(null);
  const [model, setModel] = useState(null);

  const inputARef = useRef();
  const inputBRef = useRef();

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
    dispatch("next");
  };

  useEffect(() => {
    loadModel();
  }, []);

  const upload = (number) => {
    switch (number) {
      case 1:
        inputARef.current.click();
        break;
      case 2:
      default:
        inputBRef.current.click();
        break;
    }
  };

  const handleUpload = (event, number) => {
    const { files } = event.target;

    if (files.length > 0) {
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);

        const img = new Image();
        img.src = url;

        img.onload = () => {
          const image = tf.browser.fromPixels(img);
          const infer = () => model.infer(image, "conv_preds");
          const logits = infer();
          switch (number) {
            case 1:
              knn.addExample(logits, "DOG");
              // setDogUrls((urls) => [...urls, url]);
              break;
            case 2:
            default:
              knn.addExample(logits, "CAT");
              // setCatUrls((urls) => [...urls, url]);
              break;
          }
        };
      });
    }
  };

  const saveModel = () => {
    const modelAsString = JSON.stringify(
      Object.entries(knn.getClassifierDataset()).map(([label, data]) => [
        label,
        Array.from(data.dataSync()),
        data.shape,
      ])
    );
    localStorage.setItem("myData", modelAsString);

    alert("Saved");
  };

  const exportModel = () => {
    const modelAsString = JSON.stringify(
      Object.entries(knn.getClassifierDataset()).map(([label, data]) => [
        label,
        Array.from(data.dataSync()),
        data.shape,
      ])
    );

    const link = document.createElement("a");
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(modelAsString)
    )}`;
    link.download = "model.json";
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const actionButton = {
    loadingModel: { action: () => {}, text: "Loading Model..." },
    modelReady: { action: (number) => upload(number), text: "Upload Image" },
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Model trainer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Train</h1>
        <div className={styles.grid}>
          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={(event) => handleUpload(event, 1)}
            multiple
            ref={inputARef}
          />

          <button
            className={styles.card}
            onClick={() => actionButton[appState].action(1) || (() => {})}
          >
            <h3>Dog Images &uarr;</h3>
            <p>Upload an image of a dog to help us determine what a dog is!</p>
          </button>

          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={(event) => handleUpload(event, 2)}
            multiple
            ref={inputBRef}
          />

          <button
            className={styles.card}
            onClick={() => actionButton[appState].action(2) || (() => {})}
          >
            <h3>Cat Images &uarr;</h3>
            <p>Upload an image of a cat to help us determine what a cat is!</p>
          </button>

          <button className={styles.card} onClick={saveModel}>
            <h3>Save &darr;</h3>
            <p>Save this model so it can be used on the classify page.</p>
          </button>

          <button className={styles.card} onClick={exportModel}>
            <h3>Export &darr;</h3>
            <p>Save this model to your file system.</p>
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

export default Train;
