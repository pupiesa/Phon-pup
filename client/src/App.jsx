import { Routes, Route, NavLink } from "react-router-dom"; 
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import HomePage from "./page-all/HomePage.jsx";
function App() {
  return (
    <>
      <nav>
        <NavLink to="/">App</NavLink>
        <NavLink to="/home">Home</NavLink>
      </nav>
      
      <h1>HELLO</h1>

      <Routes>
        <Route path="/" element={<div>HIHI</div>} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
