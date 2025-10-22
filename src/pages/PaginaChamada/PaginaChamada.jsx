import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSort, faSortUp, faSortDown, faSave } from '@fortawesome/free-solid-svg-icons';
import './PaginaChamada.css'; // Usaremos um novo CSS

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
      return fetch(`http://my-json-server.typicode.com/murilorms22/tcc-gerenciakids/alunos/${aluno.id}`, {
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
      const response = await fetch('http://my-json-server.typicode.com/murilorms22/tcc-gerenciakids/alunos?id_turma=202');
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
    <div className="pagina-chamada-container">
      <header className="pagina-chamada-cabecalho">
        <h1>Registro de Chamada</h1>
        <p>Marque os alunos que FALTARAM hoje. Todos os outros serão considerados presentes.</p>
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
      </div>

      <div className="tabela-chamada-card">
        <div className="tabela-cabecalho">
          <div className="coluna-nome">Nome Completo</div>
          <div className="coluna-numFaltas">Número de faltas</div>
          <div className="coluna-status">Faltou?</div>
        </div>

        <div className="tabela-corpo">
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map(aluno => (
              <div className="aluno-linha" key={aluno.id}>
                <div className="coluna-nome">
                  <img src={aluno.foto_perfil_url} alt="" className="aluno-avatar" />
                  <span>{aluno.nome_completo}</span>
                </div>
                <div className='coluna-numFaltas'>
                  <span>{aluno.faltas || 0}</span>
                </div>
                <div className="coluna-status">
                  <input
                    type="checkbox"
                    className="checkbox-falta"
                    // O checkbox é marcado SE o ID do aluno ESTIVER no Set 'listaDeAusentes'
                    checked={listaDeAusentes.has(aluno.id)}
                    // Ao clicar, chama a função de toggle
                    onChange={() => handleAusenciaToggle(aluno.id)} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="linha-sem-resultados">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>

      <div className="rodape-chamada">
        <button 
          className="botao-salvar-chamada" 
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