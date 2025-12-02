import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSave } from '@fortawesome/free-solid-svg-icons';
import axiosClient from '../../utils/axios-client';

function PaginaChamada() {
  // --- ESTADOS ---
  const [alunos, setAlunos] = useState([]); 
  const [alunosFiltrados, setAlunosFiltrados] = useState([]); 
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [sortConfig] = useState({ key: 'nome_completo', direction: 'ascending' });

  const [listaDeAusentes, setListaDeAusentes] = useState(new Set());
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const buscarAlunos = async () => {
      try {
        const response = await axiosClient.get('/users');
        
        const dadosAdaptados = response.data.users.map(user => ({
          id: user.id,
          nome_completo: `${user.firstName} ${user.lastName}`,
          foto_perfil_url: user.image,
          faltas: Math.floor(user.age / 10) 
        }));

        setAlunos(dadosAdaptados);
      } catch (err) {
        setErro('Falha ao buscar a lista de alunos da API.');
        console.error(err);
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

    alunosProcessados.sort((a, b) => {
      let valA = a.nome_completo.toLowerCase();
      let valB = b.nome_completo.toLowerCase();
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setAlunosFiltrados(alunosProcessados);
  }, [alunos, termoPesquisa, sortConfig]);

  // --- EVENTOS ---
  
  const handleAusenciaToggle = (alunoId) => {
    setListaDeAusentes(prevAusentes => {
      const novosAusentes = new Set(prevAusentes);
      if (novosAusentes.has(alunoId)) {
        novosAusentes.delete(alunoId);
      } else {
        novosAusentes.add(alunoId);
      }
      return novosAusentes;
    });
  };

  const handleSubmitChamada = async () => {
    setSalvando(true);
    
    const alunosAusentes = alunos.filter(aluno => listaDeAusentes.has(aluno.id));
    
    const promises = alunosAusentes.map(aluno => {
      return axiosClient.put(`/users/${aluno.id}`, {
         maidenName: 'Faltou' 
      });
    });

    try {
      await Promise.all(promises);
      
      const novaListaAlunos = alunos.map(aluno => {
          if (listaDeAusentes.has(aluno.id)) {
              return { ...aluno, faltas: aluno.faltas + 1 };
          }
          return aluno;
      });
      
      setAlunos(novaListaAlunos);
      alert(`${promises.length} faltas registradas com sucesso!`);
      setListaDeAusentes(new Set());
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao registrar chamada.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <h1 className="p-8 text-center text-(--text-gray)">Carregando lista de chamada...</h1>;
  if (erro) return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-8">
      <header className="mb-6">
        <h1 className="text-(--azul-escuro) text-4xl font-bold">Registro de Chamada</h1>
        <p className="text-lg text-(--text-gray) mt-1">Marque os alunos que FALTARAM hoje.</p>
      </header>
      
      <div className="mb-6 relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) text-base"
          />
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-5 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div>Nome Completo</div>
          <div className="text-center">Faltas Acumuladas</div>
          <div className="text-center">Ausente Hoje?</div>
        </div>

        <div>
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-5 px-6 gap-4 border-b border-(--border-light) last:border-b-0" key={aluno.id}>
                <div className="font-bold text-(--azul-escuro) flex items-center gap-4">
                  <img src={aluno.foto_perfil_url} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <span>{aluno.nome_completo}</span>
                </div>
                <div className='text-center'>
                  <span className="bg-(--bg-gray-light) text-(--azul-escuro) py-1 px-3 rounded-lg font-bold">{aluno.faltas}</span>
                </div>
                <div className="text-center flex justify-center">
                  <input
                    type="checkbox"
                    className="w-6 h-6 cursor-pointer accent-(--orange)"
                    checked={listaDeAusentes.has(aluno.id)}
                    onChange={() => handleAusenciaToggle(aluno.id)} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-(--text-gray)">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          className="bg-(--success-green) text-white border-none py-3 px-6 rounded-lg text-lg font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--success-green-hover) disabled:bg-gray-400 disabled:cursor-not-allowed" 
          onClick={handleSubmitChamada}
          disabled={salvando}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{salvando ? 'Salvando...' : 'Salvar Chamada'}</span>
        </button>
      </div>
    </div>
  );
}

export default PaginaChamada;