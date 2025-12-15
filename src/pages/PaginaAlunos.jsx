import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faExclamationTriangle, faPlus, faSearch, faSort, faSortUp, faSortDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import dataService from '../services/dataService';

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
        const response = await dataService.getAlunos();
        
        const dadosAdaptados = response.data.users.map(user => ({
          id: user.id,
          nome_completo: user.nome_completo,
          data_nascimento: user.data_nascimento,
          alergias: user.alergias,
          foto: user.image
        }));

        setAlunos(dadosAdaptados);
      } catch (err) {
        console.error(err);
        setErro('Falha ao buscar a lista de alunos.');
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

  if (carregando) return <h1 className="p-8 text-center text-(--text-gray)">Carregando lista de alunos...</h1>;
  if (erro) return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-8">
      <header className="flex justify-between items-center mb-6">
        <div className='flex flex-row gap-4'>
          <Link 
            to="/" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar para lista"
          >
          <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-4xl font-bold text-(--azul-escuro)">Gerenciamento de Alunos</h1>
        </div>
        <NavLink to="/chamada" className="no-underline">
          <button className="flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 ml-10 hover:bg-(--light-orange)">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </NavLink>
      </header>
      
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="relative grow min-w-[250px]">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) text-base"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-(--not-black)">
          <input
            type="checkbox"
            id="filtroAlergia"
            className="custom-checkbox mr-2"
            checked={mostrarApenasAlergicos}
            onChange={(e) => setMostrarApenasAlergicos(e.target.checked)}
          />
          <label htmlFor="filtroAlergia">Mostrar apenas alunos com alergia</label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[3fr_1fr_2fr_1fr] items-center p-4 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)" onClick={() => handleSort('nome_completo')}>
            Nome Completo <FontAwesomeIcon icon={getSortIcon('nome_completo')} />
          </div>
          <div className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)" onClick={() => handleSort('data_nascimento')}>
            Idade <FontAwesomeIcon icon={getSortIcon('data_nascimento')} />
          </div>
          <div className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)" onClick={() => handleSort('alergias')}>
            Alertas <FontAwesomeIcon icon={getSortIcon('alergias')} />
          </div>
          <div>Ações</div>
        </div>

        <div>
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div className="grid grid-cols-[3fr_1fr_2fr_1fr] items-center p-4 px-6 gap-4 border-b border-(--border-light) last:border-b-0" key={aluno.id}>
                <div className="font-bold text-(--azul-escuro) flex items-center gap-3">
                    <img src={aluno.foto} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    {aluno.nome_completo}
                </div>
                <div>{calcularIdade(aluno.data_nascimento)} anos</div>
                <div>
                  {aluno.alergias && aluno.alergias.toLowerCase() !== 'nenhuma' && (
                    <span className="text-(--orange) font-bold flex items-center gap-2" title={aluno.alergias}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span> {aluno.alergias}</span>
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Link to={`/alunos/${aluno.id}`} className="bg-transparent border-none cursor-pointer text-lg p-2 rounded-full w-[35px] h-[35px] flex items-center justify-center transition-colors duration-200 text-(--azul-escuro) hover:bg-(--border-light)" title="Ver detalhes">
                    <FontAwesomeIcon icon={faEye} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-(--text-gray)">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaginaAlunos;