import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function PaginaLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const clickLogin = () => {
    login();
    navigate('/alunos');
  };

  return (
    <div>
      <button onClick={clickLogin}>simulação de login</button>
      <button onClick={() => navigate('/alunos')}>ir para login</button>
    </div>
  );
}

export default PaginaLogin;