import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Livros from "./pages/Livros";
import Usuarios from "./pages/Usuarios";
import Emprestimos from "./pages/Emprestimos";
import Estoque from "./pages/Estoque";
import Acervo from "./pages/Acervo";
import UsuariosLista from "./pages/UsuariosLista";
import Configuracoes from "./pages/Configuracoes";
import Funcionarios from "./pages/Funcionarios";
import Login from "./pages/Login";
import AreaCliente from "./pages/AreaCliente";
import AcervoCliente from "./pages/AcervoCliente";
import Relatorios from "./pages/Relatorios";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        {/* Cliente */}
        <Route
          path="/area-cliente"
          element={
            <PrivateRoute>
              <AreaCliente />
            </PrivateRoute>
          }
        />

        <Route
          path="/acervo-cliente"
          element={
            <PrivateRoute>
              <AcervoCliente />
            </PrivateRoute>
          }
        />

        {/* Funcionários */}
        <Route
          element={
            <PrivateRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/livros" element={<Livros />} />
          <Route path="/acervo" element={<Acervo />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/lista-usuarios" element={<UsuariosLista />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/emprestimos" element={<Emprestimos />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route
            path="/configuracoes"
            element={
              <Configuracoes
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;