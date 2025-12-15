import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BotaoLaranja from '../components/BotaoLaranja';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';  
import imgRegister from '../assets/register-illustration.svg';
import logo from '../assets/logo.png';

export function PaginaRegister({register}) {
    const navigate = useNavigate();

  return (
    <>
    <div className='flex flex-col m-auto h-screen items-center'>
        <img src={logo} alt="" className='fixed top-1/2 -translate-y-[320%]'/>
      <div className='flex m-auto border-2 border-(--orange) rounded-[10px] shadow-[10px_10px_30px_rgba(0,0,0,0.2)]'>
        <div className='p-[30px] text-(--azul-escuro) h-[500px] bg-white rounded-l-[10px]'>
          <img src={imgRegister} alt="" className='h-full w-auto' />
        </div>
        <div className='p-[70px] text-(--azul-escuro) h-[500px] bg-white rounded-r-[10px] flex flex-col justify-center'>
            <h1 className='text-center'>Crie uma conta</h1>
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
              <BotaoLaranja onClick={register} mensagem="Registrar" icone={faSignInAlt}/>
              <p className='mt-5 text-center'>Já tem uma conta? <span className='text-(--orange) cursor-pointer' onClick={() => navigate('/login')}>Entrar com uma conta!</span></p>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PaginaRegister;