import { Routes, Route } from "react-router-dom"; 
import MainLayout from "./layouts/MainLayout.jsx";
import HomePage from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
// Example of another page component inline, normally this would be in src/pages/Dashboard.jsx
// const Dashboard = () => <div><h1 className="">Dashboard Page</h1></div>;

function App() {
  return (
    <Routes>
      {/* Wrap routes in a Layout to share Navbar/Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      
      {/* You can add more layouts here (e.g. AuthLayout for login pages without navbars) */}
    </Routes>
  );
}

export default App;
