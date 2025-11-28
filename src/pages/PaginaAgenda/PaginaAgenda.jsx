import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSave, faCheckCircle, faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axiosClient from '../../utils/axios-client';
import { Link } from 'react-router-dom';

function PaginaAgenda() {
  // --- ESTADOS ---
  const [atividades, setAtividades] = useState([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const buscarAtividades = async () => {
      try {
        const response = await axiosClient.get('/todos');
        
        const dadosFormatados = response.data.todos.map(tarefa => ({
          id: tarefa.id,
          descricao: tarefa.todo,
          concluida: tarefa.completed,
          userId: tarefa.userId
        }));

        setAtividades(dadosFormatados);
        setAtividadesFiltradas(dadosFormatados);
      } catch (err) {
        setErro('Falha ao carregar as atividades da API.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };
    buscarAtividades();
  }, []);

  useEffect(() => {
    let processados = [...atividades];
    if (termoPesquisa) {
      processados = processados.filter(item =>
        item.descricao.toLowerCase().includes(termoPesquisa.toLowerCase())
      );
    }
    setAtividadesFiltradas(processados);
  }, [atividades, termoPesquisa]);

  const handleToggleConcluida = (id) => {
    const novaLista = atividades.map(item => {
      if (item.id === id) {
        return { ...item, concluida: !item.concluida };
      }
      return item;
    });
    setAtividades(novaLista);
  };

  const handleSubmitChecklist = async () => {
    setSalvando(true);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        alert('Checklist de atividades atualizado com sucesso!');
        setTermoPesquisa('');
    } catch (err) {
        alert('Erro ao salvar.');
    } finally {
        setSalvando(false);
    }
  };

  if (carregando) return <h1 className="p-8 text-center text-gray-500">Carregando atividades...</h1>;
  if (erro) return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-8">
      <header className="mb-6">
        <div className='flex flex-row gap-4'>
            <Link 
                    to="/" 
                    className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
                    title="Voltar para lista"
                >
                <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div className='flex flex-col'>
                <h1 className="text-(--azul-escuro) text-4xl font-bold">Agenda de Atividades</h1>
                <p className="text-lg text-(--text-gray) mt-1">
                    Controle de tarefas diárias da escola (Limpeza, Pedagógico, Administrativo).
                </p>
            </div>
        </div>
      </header>
      
      <div className="mb-6 relative">
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)" />
        <input
          type="text"
          placeholder="Pesquisar atividade..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) text-base"
        />
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[3fr_1fr] items-center py-5 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div>Descrição da Atividade</div>
          <div className="text-center">Status</div>
        </div>

        <div>
          {atividadesFiltradas.length > 0 ? (
            atividadesFiltradas.map(atividade => (
              <div 
                className={`grid grid-cols-[3fr_1fr] items-center py-4 px-6 gap-4 border-b border-(--border-light) transition-colors hover:bg-gray-50`} 
                key={atividade.id}
              >
                <div className={`font-medium text-lg ${atividade.concluida ? 'text-gray-400 line-through' : 'text-(--azul-escuro)'}`}>
                  {atividade.descricao}
                </div>

                <div className="text-center flex justify-center cursor-pointer" onClick={() => handleToggleConcluida(atividade.id)}>
                   {atividade.concluida ? (
                       <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                   ) : (
                       <FontAwesomeIcon icon={faTimesCircle} className="text-gray-300 text-2xl hover:text-gray-400" />
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-(--text-gray)">Nenhuma atividade encontrada.</div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          className="bg-(--success-green) text-white border-none py-3 px-6 rounded-lg text-lg font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--success-green-hover) disabled:bg-gray-400 disabled:cursor-not-allowed" 
          onClick={handleSubmitChecklist}
          disabled={salvando}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{salvando ? 'Salvando...' : 'Atualizar Agenda'}</span>
        </button>
      </div>
    </div>
  );
}

export default PaginaAgenda;