import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSort, faSortUp, faSortDown, faSave } from '@fortawesome/free-solid-svg-icons';

function PaginaChamada() {
  // --- ESTADOS ---
  const [alunos, setAlunos] = useState([]); // Lista original da API
  const [alunosFiltrados, setAlunosFiltrados] = useState([]); // Lista para exibição
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Estado de pesquisa e ordenação (simplificado)
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nome_completo', direction: 'ascending' });

  // COMENTÁRIO: Este é o novo estado crucial.
  // Vamos usar um 'Set' para armazenar os IDs dos alunos que FALTARAM.
  // Um Set é como um array, mas otimizado para adicionar/remover/verificar itens únicos.
  const [listaDeAusentes, setListaDeAusentes] = useState(new Set());
  const [salvando, setSalvando] = useState(false); // Estado de loading para o botão salvar

  // --- BUSCA DE DADOS (useEffect 1) ---
  useEffect(() => {
    const buscarAlunos = async () => {
      try {
        // Busca os alunos da turma 202, como antes
        const response = await fetch('http://localhost:3001/alunos?id_turma=202');
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

  // --- LÓGICA DE FILTRO E ORDENAÇÃO (useEffect 2) ---
  useEffect(() => {
    let alunosProcessados = [...alunos];

    // 1. Filtro por pesquisa (mantido, é útil)
    if (termoPesquisa) {
      alunosProcessados = alunosProcessados.filter(aluno =>
        aluno.nome_completo.toLowerCase().includes(termoPesquisa.toLowerCase())
      );
    }

    // 2. Filtro de alergia foi REMOVIDO
    
    // 3. Ordenação por nome (mantida)
    alunosProcessados.sort((a, b) => {
      let valA = a.nome_completo.toLowerCase();
      let valB = b.nome_completo.toLowerCase();
      
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setAlunosFiltrados(alunosProcessados);

  }, [alunos, termoPesquisa, sortConfig]); // Dependências atualizadas

  // --- NOVAS FUNÇÕES DE EVENTO ---
  
  // Função para marcar/desmarcar um aluno como ausente
  const handleAusenciaToggle = (alunoId) => {
    // Criamos uma cópia do Set para atualizar o estado de forma imutável
    setListaDeAusentes(prevAusentes => {
      const novosAusentes = new Set(prevAusentes);
      if (novosAusentes.has(alunoId)) {
        novosAusentes.delete(alunoId); // Se já estava na lista, remove (presente)
      } else {
        novosAusentes.add(alunoId); // Se não estava, adiciona (ausente)
      }
      return novosAusentes;
    });
  };

  // Função para salvar a chamada no "banco de dados"
  const handleSubmitChamada = async () => {
    setSalvando(true);
    
    // 1. Filtra a lista de alunos originais para encontrar os objetos dos ausentes
    const alunosParaAtualizar = alunos.filter(aluno => listaDeAusentes.has(aluno.id));
    
    // 2. Cria um array de "promessas" de atualização
    const promises = alunosParaAtualizar.map(aluno => {
      const faltasAtuais = aluno.faltas || 0; // Garante que é um número
      
      // Usamos o método 'PATCH' para atualizar APENAS o campo de faltas
      return fetch(`http://localhost:3001/alunos/${aluno.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faltas: faltasAtuais + 1
        })
      });
    });

    try {
      // 3. Executa todas as atualizações em paralelo e espera terminarem
      await Promise.all(promises);
      
      alert('Chamada salva com sucesso!');
      
      // Opcional: Atualizar a lista de alunos local com as novas contagens de faltas
      const response = await fetch('http://localhost:3001/alunos?id_turma=202');
      const data = await response.json();
      setAlunos(data);
      
      setListaDeAusentes(new Set()); // Limpa a seleção
      
    } catch (err) {
      console.error('Erro ao salvar chamada:', err);
      alert('Houve um erro ao salvar a chamada.');
    } finally {
      setSalvando(false);
    }
  };


  if (carregando) return <h1>Carregando lista de alunos...</h1>;
  if (erro) return <h1>Erro: {erro}</h1>;

  // --- RENDERIZAÇÃO (JSX) ---
  return (
    <div className="w-full p-8">
      <header className="mb-6">
        <h1 className="text-(--azul-escuro) text-4xl font-bold">Registro de Chamada</h1>
        <p className="text-lg text-(--text-gray) mt-1">Marque os alunos que FALTARAM hoje. Todos os outros serão considerados presentes.</p>
      </header>
      
      <div className="mb-6">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) text-base"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-5 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div>Nome Completo</div>
          <div className="text-center">Número de faltas</div>
          <div className="text-center">Faltou?</div>
        </div>

        <div>
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-5 px-6 gap-4 border-b border-(--border-light) last:border-b-0" key={aluno.id}>
                <div className="font-bold text-(--azul-escuro) flex items-center gap-4">
                  <img src={aluno.foto_perfil_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <span>{aluno.nome_completo}</span>
                </div>
                <div className='text-center'>
                  <span className="bg-(--bg-gray-light) text-(--azul-escuro) py-1 px-3 rounded-lg font-bold">{aluno.faltas || 0}</span>
                </div>
                <div className="text-center">
                  <input
                    type="checkbox"
                    className="scale-150 cursor-pointer"
                    // O checkbox é marcado SE o ID do aluno ESTIVER no Set 'listaDeAusentes'
                    checked={listaDeAusentes.has(aluno.id)}
                    // Ao clicar, chama a função de toggle
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
          className="bg-(--success-green) text-white border-none py-3 px-6 rounded-lg text-lg font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--success-green-hover) disabled:bg-(--gray-disabled) disabled:cursor-not-allowed" 
          onClick={handleSubmitChamada}
          disabled={salvando} // Desabilita o botão enquanto salva
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{salvando ? 'Salvando...' : 'Salvar Chamada'}</span>
        </button>
      </div>
    </div>
  );
}

export default PaginaChamada;