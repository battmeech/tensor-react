import { BrowserRouter, Route } from "react-router-dom";
import Classify from "./Classify";
import Train from "./Train";

function App() {
  return (
    <BrowserRouter>
      <Route exact component={Classify} path="/classify" />
      <Route exact component={Train} path="/" />
    </BrowserRouter>
  );
}

export default App;
