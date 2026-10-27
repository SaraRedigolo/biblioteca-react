import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen, FaUser, FaLock, FaEye, FaEyeSlash,
  FaTimes, FaEnvelope, FaCheckCircle,
} from "react-icons/fa";

function ModalEsqueciSenha({ onClose }) {
  const [identificador, setIdentificador] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const simularEnvio = (e) => {
    e.preventDefault();

    if (!identificador.trim()) {
      setErro("Informe seu usuário ou e-mail cadastrado.");
      return;
    }

    const funcionarios = JSON.parse(localStorage.getItem("funcionarios")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const existe =
      funcionarios.some((u) => u.usuario === identificador || u.email === identificador) ||
      usuarios.some((u) => u.usuario === identificador || u.email === identificador);

    if (!existe) {
      setErro("Não encontramos nenhuma conta com esses dados.");
      return;
    }

    setErro("");
    setEnviado(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FaTimes />
        </button>

        {!enviado ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xl">
                <FaLock />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">
              Recuperar senha
            </h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1 mb-5">
              Informe seu usuário ou e-mail cadastrado para localizar sua conta. A redefinição da senha deverá ser solicitada diretamente na biblioteca.
            </p>
            {erro && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
                {erro}
              </div>
            )}

            <form onSubmit={simularEnvio} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Usuário ou e-mail"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 pl-10 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-3 font-medium transition"
              >
                Enviar instruções
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl">
                <FaCheckCircle />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Solicitação registrada
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Caso sua conta esteja cadastrada, procure um funcionário da biblioteca para solicitar a redefinição da sua senha. Por motivos de segurança, a alteração só pode ser realizada pela equipe responsável.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-3 font-medium transition"
            >
              Entendi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  if (!localStorage.getItem("funcionarios")) {
    const funcionariosPadrao = [
      { id: 1, nome: "Administrador", usuario: "admin", senha: "123456", cargo: "admin" },
      { id: 2, nome: "Bibliotecário", usuario: "bibliotecario", senha: "123456", cargo: "bibliotecario" },
    ];
    localStorage.setItem("funcionarios", JSON.stringify(funcionariosPadrao));
  }

  const entrar = (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // pequeno delay só pra dar feedback visual de carregamento
    setTimeout(() => {
      const funcionarios = JSON.parse(localStorage.getItem("funcionarios")) || [];
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const funcionario = funcionarios.find(
        (u) => u.usuario === usuario && u.senha === senha
      );

      if (funcionario) {
        localStorage.setItem("logado", "true");
        localStorage.setItem("tipo", "funcionario");
        localStorage.setItem("usuario", funcionario.nome);
        localStorage.setItem("cargo", funcionario.cargo);
        navigate("/");
        return;
      }

      const cliente = usuarios.find(
        (u) => u.usuario === usuario && u.senha === senha
      );

      if (cliente) {
        localStorage.setItem("logado", "true");
        localStorage.setItem("tipo", "cliente");
        localStorage.setItem("usuario", cliente.nome);
        localStorage.setItem("cargo", "cliente");
        localStorage.setItem("clienteId", cliente.id);
        navigate("/area-cliente");
        return;
      }

      setCarregando(false);
      setErro("Usuário ou senha inválidos.");
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl shadow-md">
            <FaBookOpen />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          BookHub
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Faça login para continuar
        </p>

        {erro && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={entrar} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 pl-10 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 pl-10 pr-10 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                tabIndex={-1}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl p-3 font-medium transition"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {modalAberto && <ModalEsqueciSenha onClose={() => setModalAberto(false)} />}
    </div>
  );
}

export default Login;