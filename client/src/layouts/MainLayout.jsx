import { Outlet, NavLink } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <nav className="p-4 bg-white dark:bg-gray-800 shadow-sm flex gap-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "text-primary font-bold" : "text-gray-600 dark:text-gray-300 hover:text-primary"}
        >
          App
        </NavLink>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "text-primary font-bold" : "text-gray-600 dark:text-gray-300 hover:text-primary"}
        >
          Home
        </NavLink>
      </nav>
      
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
