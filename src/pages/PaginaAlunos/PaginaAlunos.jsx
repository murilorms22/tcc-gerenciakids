import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faExclamationTriangle, faPlus, faSearch, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import './PaginaAlunos.css';

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--;
  }
  return anos;
}

function PaginaAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [mostrarApenasAlergicos, setMostrarApenasAlergicos] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome_completo', direction: 'ascending' });

  useEffect(() => {
    const buscarAlunos = async () => {
      try {
        const response = await fetch('https://my-json-server.typicode.com/murilorms22/tcc-gerenciakids/alunos?id_turma=202');
        if (!response.ok) throw new Error('Falha ao buscar a lista de alunos.');
        const data = await response.json();
        setAlunos(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarAlunos();
  }, []);

  useEffect(() => {
    let alunosProcessados = [...alunos];

    if (termoPesquisa) {
      alunosProcessados = alunosProcessados.filter(aluno =>
        aluno.nome_completo.toLowerCase().includes(termoPesquisa.toLowerCase())
      );
    }
    if (mostrarApenasAlergicos) {
      alunosProcessados = alunosProcessados.filter(aluno =>
        aluno.alergias && aluno.alergias.toLowerCase() !== 'nenhuma'
      );
    }

    if (sortConfig.key !== null) {
      alunosProcessados.sort((a, b) => {
        let valA, valB;

        switch (sortConfig.key) {
          case 'nome_completo':
            valA = a.nome_completo.toLowerCase();
            valB = b.nome_completo.toLowerCase();
            break;
          
          case 'data_nascimento':
            valA = new Date(a.data_nascimento);
            valB = new Date(b.data_nascimento);
            break;

          case 'alergias':
            valA = (a.alergias && a.alergias.toLowerCase() !== 'nenhuma') ? 1 : 0;
            valB = (b.alergias && b.alergias.toLowerCase() !== 'nenhuma') ? 1 : 0;
            break;
          
          default:
            valA = a[sortConfig.key];
            valB = b[sortConfig.key];
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        if (sortConfig.key !== 'nome_completo') {
            const nomeA = a.nome_completo.toLowerCase();
            const nomeB = b.nome_completo.toLowerCase();
            if (nomeA < nomeB) return -1;
            if (nomeA > nomeB) return 1;
        }

        return 0;
      });
    }

    setAlunosFiltrados(alunosProcessados);

  }, [alunos, termoPesquisa, mostrarApenasAlergicos, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    } 
    else if (key === 'alergias' || key === 'data_nascimento') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    if (sortConfig.direction === 'ascending') return faSortUp;
    return faSortDown;
  }

  if (carregando) return <h1>Carregando lista de alunos...</h1>;
  if (erro) return <h1>Erro: {erro}</h1>;

  return (
    <div className="pagina-alunos-container">
      <header className="pagina-alunos-cabecalho">
        <h1>Gerenciamento de Alunos</h1>
        <NavLink to="/chamada" className="navlink">
          <button className="fazer-chamada">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </NavLink>
      </header>
      
      <div className="controles-container">
        <div className="campo-pesquisa">
          <FontAwesomeIcon icon={faSearch} className="icone-pesquisa" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
          />
        </div>
        <div className="filtro-alergia">
          <input
            type="checkbox"
            id="filtroAlergia"
            checked={mostrarApenasAlergicos}
            onChange={(e) => setMostrarApenasAlergicos(e.target.checked)}
          />
          <label htmlFor="filtroAlergia">Mostrar apenas alunos com alergia</label>
        </div>
      </div>

      <div className="tabela-alunos-card">
        <div className="tabela-cabecalho">
          <div className="coluna-nome cabecalho-ordenavel" onClick={() => handleSort('nome_completo')}>
            Nome Completo <FontAwesomeIcon icon={getSortIcon('nome_completo')} />
          </div>
          <div className="coluna-idade cabecalho-ordenavel" onClick={() => handleSort('data_nascimento')}>
            Idade <FontAwesomeIcon icon={getSortIcon('data_nascimento')} />
          </div>
          <div className="coluna-alertas cabecalho-ordenavel" onClick={() => handleSort('alergias')}>
            Alertas <FontAwesomeIcon icon={getSortIcon('alergias')} />
          </div>
          <div className="coluna-acoes">Ações</div>
        </div>

        <div className="tabela-corpo">
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div className="aluno-linha" key={aluno.id}>
                <div className="coluna-nome">{aluno.nome_completo}</div>
                <div className="coluna-idade">{calcularIdade(aluno.data_nascimento)} anos</div>
                <div className="coluna-alertas">
                  {aluno.alergias && aluno.alergias.toLowerCase() !== 'nenhuma' && (
                    <span className="alerta-alergia" title={aluno.alergias}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span> {aluno.alergias}</span>
                    </span>
                  )}
                </div>
                <div className="coluna-acoes">
                  <Link to={`/alunos/${aluno.id}`} className="acao-btn ver-detalhes" title="Ver detalhes">
                    <FontAwesomeIcon icon={faEye} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="linha-sem-resultados">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaginaAlunos;