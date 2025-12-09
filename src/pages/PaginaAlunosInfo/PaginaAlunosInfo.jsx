import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import dataService from '../../services/dataService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faPhone, faMapMarkerAlt, faHeartbeat, faRulerVertical, faWeight, faIdCard } from '@fortawesome/free-solid-svg-icons';

function PaginaAlunosInfo() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchAluno = async () => {
        try {
            const response = await dataService.getAlunoById(id);
            setAluno(response.data);
        } catch (error) {
            console.error(error);
            setErro("Não foi possível carregar as informações do aluno.");
        } finally {
            setCarregando(false);
        }
    };
    fetchAluno();
  }, [id]);

  if (carregando) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black)"><h1>Carregando ficha do aluno...</h1></div>;
  }

  if (erro || !aluno) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-red-500"><h1>{erro || "Aluno não encontrado"}</h1></div>;
  }

  return (
    <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto h-full">
      
      <header className="mb-8 flex items-center gap-4">
        <Link 
            to="/alunos" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar para lista"
        >
            <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-(--azul-escuro)">Ficha do Aluno</h1>
            <p className="text-(--text-gray)">Detalhes cadastrais e médicos.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        
        <div className="flex flex-col gap-6">
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center text-center border-t-[5px] border-t-(--orange)">
                <div className="relative mb-4">
                    <img 
                        src={aluno.image} 
                        alt={`${aluno.firstName} ${aluno.lastName}`} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-(--bg-page)"
                    />
                    <span className="absolute bottom-0 right-0 bg-(--success-green) text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                        Ativo
                    </span>
                </div>
                
                <h2 className="text-2xl font-bold text-(--azul-escuro) mb-1">
                    {aluno.firstName} {aluno.lastName}
                </h2>
                <p className="text-(--text-gray) mb-6">Matrícula: {aluno.id}0023</p>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-(--border-light) pt-6">
                    <div>
                        <p className="text-sm text-(--text-gray)">Idade</p>
                        <p className="text-xl font-bold text-(--azul-escuro)">{aluno.age} anos</p>
                    </div>
                    <div>
                        <p className="text-sm text-(--text-gray)">Gênero</p>
                        <p className="text-xl font-bold text-(--azul-escuro)">
                            {aluno.gender === 'male' ? 'Masc.' : 'Fem.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-bold text-(--azul-escuro) mb-6 flex items-center gap-3">
                    <FontAwesomeIcon icon={faIdCard} className="text-(--orange)" />
                    Dados de Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                        <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} /> Email do Responsável
                        </p>
                        <p className="font-semibold text-(--not-black)">{aluno.email}</p>
                    </div>
                    <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                        <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} /> Telefone
                        </p>
                        <p className="font-semibold text-(--not-black)">{aluno.phone}</p>
                    </div>
                    <div className="p-4 bg-(--bg-gray-light) rounded-lg md:col-span-2">
                        <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> Endereço Residencial
                        </p>
                        <p className="font-semibold text-(--not-black)">
                            {aluno.address.address}, {aluno.address.city} - {aluno.address.state}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-bold text-(--azul-escuro) mb-6 flex items-center gap-3">
                    <FontAwesomeIcon icon={faHeartbeat} className="text-red-500" />
                    Informações de Saúde
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold">
                            {aluno.bloodGroup}
                        </div>
                        <div>
                            <p className="text-xs text-(--text-gray)">Tipo Sanguíneo</p>
                            <p className="font-bold text-(--azul-escuro)">{aluno.bloodGroup}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <FontAwesomeIcon icon={faRulerVertical} />
                        </div>
                        <div>
                            <p className="text-xs text-(--text-gray)">Altura</p>
                            <p className="font-bold text-(--azul-escuro)">{aluno.height} cm</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                            <FontAwesomeIcon icon={faWeight} />
                        </div>
                        <div>
                            <p className="text-xs text-(--text-gray)">Peso</p>
                            <p className="font-bold text-(--azul-escuro)">{aluno.weight} kg</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default PaginaAlunosInfo;