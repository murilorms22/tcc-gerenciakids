import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BotaoLaranja from '../components/BotaoLaranja';
import {
  faUserPlus,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import imgRegister from '../assets/register-illustration.svg';
import logo from '../assets/logo.png';

export function PaginaRegister() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Regras de validação visual de senha (LGPD / Segurança)
  const temMinimo8 = formData.senha.length >= 8;
  const temLetra = /[A-Za-z]/.test(formData.senha);
  const temNumero = /\d/.test(formData.senha);
  const senhaValida = temMinimo8 && temLetra && temNumero;

  const aplicarMascaraCPF = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6)
      return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    if (digitos.length <= 9)
      return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  };

  const aplicarMascaraTelefone = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6)
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10)
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha) {
      setErro('Preencha nome completo, e-mail e senha.');
      return;
    }

    if (!senhaValida) {
      setErro(
        'A senha deve possuir no mínimo 8 caracteres, contendo letras e números.',
      );
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }

    try {
      await register({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        ...(formData.cpf ? { cpf: formData.cpf } : {}),
        ...(formData.telefone ? { telefone: formData.telefone } : {}),
      });

      setSucesso(
        'Conta de Responsável criada com sucesso! Redirecionando para o login...',
      );
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setErro(error.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <div className="flex flex-col m-auto min-h-screen items-center justify-center p-4 w-full">
      <img src={logo} alt="GerenciaKids" className="w-56 mb-4" />

      <div className="flex flex-col md:flex-row border-2 border-(--orange) rounded-[10px] shadow-[10px_10px_30px_rgba(0,0,0,0.2)] bg-white overflow-hidden max-w-4xl w-full">
        <div className="hidden md:flex p-[30px] text-(--azul-escuro) bg-white items-center justify-center flex-1 border-r border-(--border-light)">
          <img
            src={imgRegister}
            alt="Ilustração de Cadastro"
            className="max-h-[420px] w-auto"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 md:p-[40px] text-(--azul-escuro) bg-white flex-1 flex flex-col justify-center"
        >
          <h1 className="text-2xl font-bold text-center mb-1">
            Crie sua conta de Responsável
          </h1>
          <p className="text-xs text-(--text-gray) text-center mb-4">
            Por segurança (LGPD), novos cadastros recebem perfil{' '}
            <strong>RESPONSÁVEL</strong>.
          </p>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 font-semibold text-center">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-3 font-semibold text-center">
              {sucesso}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="nome"
                className="text-sm font-semibold text-(--azul-escuro)"
              >
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Fernanda Souza Martins"
                className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-(--azul-escuro)"
              >
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Ex: familia@email.com"
                className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="cpf"
                  className="text-sm font-semibold text-(--azul-escuro)"
                >
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: aplicarMascaraCPF(e.target.value),
                    })
                  }
                  placeholder="000.000.000-00"
                  className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="telefone"
                  className="text-sm font-semibold text-(--azul-escuro)"
                >
                  Telefone (opcional)
                </label>
                <input
                  type="text"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone: aplicarMascaraTelefone(e.target.value),
                    })
                  }
                  placeholder="(11) 98765-4321"
                  className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="senha"
                  className="text-sm font-semibold text-(--azul-escuro)"
                >
                  Senha *
                </label>
                <input
                  type="password"
                  id="senha"
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData({ ...formData, senha: e.target.value })
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirmarSenha"
                  className="text-sm font-semibold text-(--azul-escuro)"
                >
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  id="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmarSenha: e.target.value,
                    })
                  }
                  placeholder="Repita a senha"
                  className="p-2.5 text-sm border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                />
              </div>
            </div>

            {/* Checklist visual de requisitos de senha */}
            <div className="bg-(--bg-gray-light) p-3 rounded-lg border border-(--border-gray) text-xs space-y-1">
              <p className="font-bold text-(--azul-escuro) mb-1">
                Requisitos de segurança da senha:
              </p>
              <div
                className={`flex items-center gap-2 ${
                  temMinimo8 ? 'text-green-700 font-semibold' : 'text-(--text-gray)'
                }`}
              >
                <FontAwesomeIcon
                  icon={temMinimo8 ? faCheckCircle : faTimesCircle}
                />
                <span>Mínimo de 8 caracteres</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  temLetra ? 'text-green-700 font-semibold' : 'text-(--text-gray)'
                }`}
              >
                <FontAwesomeIcon
                  icon={temLetra ? faCheckCircle : faTimesCircle}
                />
                <span>Contém pelo menos uma letra (A-Z / a-z)</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  temNumero ? 'text-green-700 font-semibold' : 'text-(--text-gray)'
                }`}
              >
                <FontAwesomeIcon
                  icon={temNumero ? faCheckCircle : faTimesCircle}
                />
                <span>Contém pelo menos um número (0-9)</span>
              </div>
            </div>

            <BotaoLaranja
              type="submit"
              mensagem={loading ? 'Registrando...' : 'Registrar'}
              icone={faUserPlus}
              disabled={loading}
            />

            <p className="mt-2 text-center text-sm">
              Já tem uma conta?{' '}
              <span
                className="text-(--orange) font-bold cursor-pointer hover:underline"
                onClick={() => navigate('/login')}
              >
                Entrar com uma conta!
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaginaRegister;
