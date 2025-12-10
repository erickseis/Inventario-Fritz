import { BrowserRouter as Router } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import MainApp from "./components/MainApp";

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
