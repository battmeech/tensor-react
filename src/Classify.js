import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState, useRef } from "react";
import "./App.css";

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

        knn
          .predictClass(model.infer(image, "conv_preds"), 10)
          .then((result) => {
            setResult(result);
          });
      };
    }
  };

  return (
    <div>
      <h2>CLASSIFY</h2>

      <input
        type="file"
        accept="image/*"
        capture="camera"
        onChange={handleUpload}
        ref={inputRef}
      />

      <button onClick={upload}>Upload</button>

      {result && (
        <p>
          {result.label} - Confidence {result.confidences[result.label] * 100}%
        </p>
      )}
      {classification && (
        <p>
          Most likely a {classification[0].className} - Confidence{" "}
          {classification[0].probability * 100}%
        </p>
      )}
    </div>
  );
}

export default Classify;
