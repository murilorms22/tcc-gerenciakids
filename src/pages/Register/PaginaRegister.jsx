import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import BotaoLaranja from '../../components/BotaoLaranja/BotaoLaranja';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';  
import imgRegister from '../../assets/register-illustration.svg';
import logo from '../../assets/logo.png';

export function PaginaRegister() {
    const navigate = useNavigate();

  return (
    <>
    <div className='body'>
        <img src={logo} alt="" className='logo'/>
      <div className='containers'>
        <div className='containerDireita'>
          <img src={imgRegister} alt="" />
        </div>
        <div className='containerEsquerda'>
            <h1 className='tituloConta'>Crie uma conta</h1>
            <div className='inputs'>
              <div>
                <label htmlFor="usuario">Usuário</label>
                <input type="text" id='usuario'/>
              </div>
              <div>
                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha"/>
                <p className='forgotPassword'>Esqueceu a senha?</p>
              </div>
              <BotaoLaranja mensagem="Entrar" icone={faSignInAlt}/>
              <p className='semConta'>Já tem uma conta? <span onClick={() => navigate('/login')}>Entrar com uma conta!</span></p>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PaginaRegister;