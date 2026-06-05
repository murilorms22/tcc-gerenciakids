import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BotaoLaranja from '../components/BotaoLaranja';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';  
import imgLogin from '../assets/login-illustration.svg';
import logo from '../assets/logo.png';

export function PaginaLogin() {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const clickLogin = async () => {
    if (!emailInput || !senhaInput) {
      setErro('Preencha todos os campos.');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      await login(emailInput, senhaInput);
      console.log('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      setErro(error.message || 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className='flex flex-col m-auto h-screen items-center'>
      <img src={logo} alt="" className='fixed top-1/2 -translate-y-[450%] w-64' />
      <div className='flex m-auto border-2 border-(--orange) rounded-[10px] shadow-[10px_10px_30px_rgba(0,0,0,0.2)]'>
        <div className='p-[70px] text-(--azul-escuro) h-[500px] bg-white rounded-l-[10px] flex flex-col justify-center'>
            <h1>Entre com sua conta</h1>
            
            {erro && <p className="text-red-500 text-sm mt-2 text-center font-bold">{erro}</p>}

            <div className='flex flex-col gap-[15px] mt-5'>
              <div className='flex flex-col gap-[5px]'>
                <label htmlFor="email" className='text-xl text-(--azul-escuro)'>Email</label>
                <input 
                  type="email" 
                  id='email' 
                  className='p-2.5 text-base border border-(--azul-escuro) rounded-[5px]'
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Ex: professor@escola.com"
                />
              </div>
              <div className='flex flex-col gap-[5px]'>
                <label htmlFor="senha" className='text-xl text-(--azul-escuro)'>Senha</label>
                <input 
                  type="password" 
                  id="senha" 
                  className='p-2.5 text-base border border-(--azul-escuro) rounded-[5px]'
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="Digite sua senha"
                />
                <p className='text-(--orange) text-right mt-2.5 cursor-pointer font-medium'>Esqueceu a senha?</p>
              </div>
              
              <BotaoLaranja 
                onClick={clickLogin} 
                mensagem={loading || authLoading ? "Entrando..." : "Entrar"} 
                icone={faSignInAlt}
                disabled={loading || authLoading}
              />
              
              <p className='mt-5 text-center'>Não tem uma conta? <span className='text-(--orange) cursor-pointer' onClick={() => navigate('/register')}>Registre-se!</span></p>
            </div>
        </div>
        <div className='p-[30px] text-(--azul-escuro) h-[500px] bg-white rounded-r-[10px]'>
          <img src={imgLogin} alt="" className='h-full w-auto' />
        </div>
      </div>
    </div>
    </>
  );
}

export default PaginaLogin;