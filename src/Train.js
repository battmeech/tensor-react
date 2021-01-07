import { useState, useRef, useReducer, useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from "@tensorflow/tfjs";
import "./App.css";

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
  };

  const actionButton = {
    loadingModel: { action: () => {}, text: "Loading Model..." },
    modelReady: { action: (number) => upload(number), text: "Upload Image" },
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div>
          <h2>DOGS</h2>

          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={(event) => handleUpload(event, 1)}
            multiple
            ref={inputARef}
          />

          <button
            onClick={() => actionButton[appState].action(1) || (() => {})}
          >
            {actionButton[appState].text}
          </button>
        </div>
        <div>
          <h2>CATS</h2>

          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={(event) => handleUpload(event, 2)}
            multiple
            ref={inputBRef}
          />

          <button
            onClick={() => actionButton[appState].action(2) || (() => {})}
          >
            {actionButton[appState].text}
          </button>
        </div>
      </div>

      <button onClick={saveModel}>Save</button>
    </>
  );
}

export default Train;
