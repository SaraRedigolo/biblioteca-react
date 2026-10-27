import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

function Layout({ darkMode, setDarkMode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Sidebar
        open={open}
        setOpen={setOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className={`flex-1 p-8 ${open ? "ml-64" : "ml-16"}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;