import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BotaoLaranja from '../../components/BotaoLaranja/BotaoLaranja';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';  
import imgLogin from '../../assets/login-illustration.svg';
import logo from '../../assets/logo.png';

export function PaginaLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const clickLogin = () => {
    login();
    navigate('/');
    console.log('clicou no login');
  };

  return (
    <>
    <div className='flex flex-col m-auto h-screen items-center'>
      <img src={logo} alt="" className='fixed top-1/2 -translate-y-[320%]' />
      <div className='flex m-auto border-2 border-(--orange) rounded-[10px] shadow-[10px_10px_30px_rgba(0,0,0,0.2)]'>
        <div className='p-[70px] text-(--azul-escuro) h-[500px] bg-white rounded-l-[10px] flex flex-col justify-center'>
            <h1>Entre com sua conta</h1>
            <div className='flex flex-col gap-[15px] mt-5'>
              <div className='flex flex-col gap-[5px]'>
                <label htmlFor="usuario" className='text-xl text-(--azul-escuro)'>Usuário</label>
                <input type="text" id='usuario' className='p-2.5 text-base border border-(--azul-escuro) rounded-[5px]'/>
              </div>
              <div className='flex flex-col gap-[5px]'>
                <label htmlFor="senha" className='text-xl text-(--azul-escuro)'>Senha</label>
                <input type="password" id="senha" className='p-2.5 text-base border border-(--azul-escuro) rounded-[5px]'/>
                <p className='text-(--orange) text-right mt-2.5 cursor-pointer font-medium'>Esqueceu a senha?</p>
              </div>
              <BotaoLaranja onClick={clickLogin} mensagem="Entrar" icone={faSignInAlt}/>
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