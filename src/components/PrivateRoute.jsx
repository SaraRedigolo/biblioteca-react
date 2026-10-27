import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const logado = localStorage.getItem("logado");
  const cargo = localStorage.getItem("cargo");

  if (logado !== "true") {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(cargo)) {
    if (cargo === "cliente") {
      return <Navigate to="/area-cliente" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;