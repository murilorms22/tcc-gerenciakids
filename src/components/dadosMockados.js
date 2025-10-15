const dadosMockados = {
  "escola": {
    "id_escola": 1,
    "nome": "EMEI Sonho de Criança"
  },
  "turma": {
    "id_turma": 202,
    "id_escola": 1,
    "nome_turma": "Maternal II - Estrelinhas",
    "ano_letivo": 2025,
    "id_professor_principal": 102
  },
  "professor": {
    "nome": "João Silva"
  },
  "responsaveis": [
    { "id_responsavel": 301, "nome_completo": "Fernanda Souza", "parentesco": "Mãe" },
    { "id_responsavel": 302, "nome_completo": "Lucas Martins", "parentesco": "Pai" },
    { "id_responsavel": 303, "nome_completo": "Amanda Costa", "parentesco": "Mãe" },
    { "id_responsavel": 304, "nome_completo": "Rodrigo Lima", "parentesco": "Pai" },
    { "id_responsavel": 305, "nome_completo": "Beatriz Almeida", "parentesco": "Mãe" },
    { "id_responsavel": 306, "nome_completo": "Tiago Pereira", "parentesco": "Pai" },
    { "id_responsavel": 307, "nome_completo": "Camila Oliveira", "parentesco": "Mãe" },
    { "id_responsavel": 308, "nome_completo": "Gustavo Ferreira", "parentesco": "Pai" },
    { "id_responsavel": 309, "nome_completo": "Larissa Santos", "parentesco": "Mãe" },
    { "id_responsavel": 310, "nome_completo": "Rafael Gomes", "parentesco": "Pai" },
    { "id_responsavel": 311, "nome_completo": "Júlia Carvalho", "parentesco": "Mãe" },
    { "id_responsavel": 312, "nome_completo": "Felipe Barros", "parentesco": "Pai" },
    { "id_responsavel": 313, "nome_completo": "Mariana Rocha", "parentesco": "Mãe" },
    { "id_responsavel": 314, "nome_completo": "Vinícius Castro", "parentesco": "Pai" },
    { "id_responsavel": 315, "nome_completo": "Patrícia Ribeiro", "parentesco": "Avó" },
    { "id_responsavel": 316, "nome_completo": "Cláudia Azevedo", "parentesco": "Mãe" },
    { "id_responsavel": 317, "nome_completo": "Leonardo Dias", "parentesco": "Pai" },
    { "id_responsavel": 318, "nome_completo": "Vanessa Nunes", "parentesco": "Mãe" },
    { "id_responsavel": 319, "nome_completo": "Alexandre Mendes", "parentesco": "Pai" },
    { "id_responsavel": 320, "nome_completo": "Sandra Pinto", "parentesco": "Mãe" }
  ],
  "alunos": [
    {
      "id_aluno": 401,
      "id_turma": 202,
      "nome_completo": "Arthur Costa Lima",
      "data_nascimento": "2022-05-15",
      "foto_perfil_url": "/path/to/fotos/arthur.jpg",
      "alergias": "Nenhuma",
      "observacoes": "Muito ativo e curioso. Adora brincar no pátio.",
      "responsaveis_ids": [303, 304]
    },
    {
      "id_aluno": 402,
      "id_turma": 202,
      "nome_completo": "Helena Souza Martins",
      "data_nascimento": "2022-02-20",
      "foto_perfil_url": "/path/to/fotos/helena.jpg",
      "alergias": "Proteína do leite de vaca (APLV). Dieta restrita.",
      "observacoes": "Precisa de ajuda para dormir, gosta de música de ninar.",
      "responsaveis_ids": [301, 302]
    },
    {
      "id_aluno": 403,
      "id_turma": 202,
      "nome_completo": "Miguel Almeida Pereira",
      "data_nascimento": "2022-07-01",
      "foto_perfil_url": "/path/to/fotos/miguel.jpg",
      "alergias": "Alergia a picada de insetos.",
      "observacoes": "Comunicativo, gosta de conversar com os colegas e professores.",
      "responsaveis_ids": [305, 306]
    },
    {
      "id_aluno": 404,
      "id_turma": 202,
      "nome_completo": "Alice Oliveira Ferreira",
      "data_nascimento": "2022-04-18",
      "foto_perfil_url": "/path/to/fotos/alice.jpg",
      "alergias": "Glúten (sensibilidade).",
      "observacoes": "É um pouco tímida no início, mas se solta nas brincadeiras em grupo.",
      "responsaveis_ids": [307, 308]
    },
    {
      "id_aluno": 405,
      "id_turma": 202,
      "nome_completo": "Bernardo Santos Gomes",
      "data_nascimento": "2022-09-30",
      "foto_perfil_url": "/path/to/fotos/bernardo.jpg",
      "alergias": "Nenhuma",
      "observacoes": "Adora desenhar e montar blocos lógicos. Concentrado.",
      "responsaveis_ids": [309, 310]
    },
    {
      "id_aluno": 406,
      "id_turma": 202,
      "nome_completo": "Laura Carvalho Barros",
      "data_nascimento": "2022-01-25",
      "foto_perfil_url": "/path/to/fotos/laura.jpg",
      "alergias": "Amendoim.",
      "observacoes": "Muito carinhosa com os colegas. Gosta de cuidar dos bonecos.",
      "responsaveis_ids": [311, 312]
    },
    {
      "id_aluno": 407,
      "id_turma": 202,
      "nome_completo": "Davi Rocha Castro",
      "data_nascimento": "2022-03-11",
      "foto_perfil_url": "/path/to/fotos/davi.jpg",
      "alergias": "Corantes artificiais.",
      "observacoes": "Extremamente energético. Gosta de correr e brincar ao ar livre.",
      "responsaveis_ids": [313, 314]
    },
    {
      "id_aluno": 408,
      "id_turma": 202,
      "nome_completo": "Sophia Ribeiro",
      "data_nascimento": "2022-06-05",
      "foto_perfil_url": "/path/to/fotos/sophia.jpg",
      "alergias": "Nenhuma",
      "observacoes": "Muito observadora e tranquila. Gosta de ouvir histórias.",
      "responsaveis_ids": [315]
    },
    {
      "id_aluno": 409,
      "id_turma": 202,
      "nome_completo": "Theo Azevedo Dias",
      "data_nascimento": "2022-08-14",
      "foto_perfil_url": "/path/to/fotos/theo.jpg",
      "alergias": "Lactose (intolerância).",
      "observacoes": "Gosta de explorar os brinquedos sozinho. Começou a formar frases completas.",
      "responsaveis_ids": [316, 317]
    },
    {
      "id_aluno": 410,
      "id_turma": 202,
      "nome_completo": "Isabella Nunes Mendes",
      "data_nascimento": "2022-10-02",
      "foto_perfil_url": "/path/to/fotos/isabella.jpg",
      "alergias": "Nenhuma",
      "observacoes": "Adora dançar e cantar nas rodinhas de música.",
      "responsaveis_ids": [318, 319]
    },
    {
      "id_aluno": 411,
      "id_turma": 202,
      "nome_completo": "Mateus Pinto",
      "data_nascimento": "2022-05-28",
      "foto_perfil_url": "/path/to/fotos/mateus.jpg",
      "alergias": "Poeira (rinite alérgica).",
      "observacoes": "Pode precisar de ajuda para limpar o nariz durante o dia.",
      "responsaveis_ids": [320]
    },
    {
      "id_aluno": 412,
      "id_turma": 202,
      "nome_completo": "Lívia Gomes Santos",
      "data_nascimento": "2022-11-11",
      "foto_perfil_url": "/path/to/fotos/livia.jpg",
      "alergias": "Nenhuma",
      "observacoes": "Está em processo de desfralde.",
      "responsaveis_ids": [309, 310]
    },
    {
      "id_aluno": 413,
      "id_turma": 202,
      "nome_completo": "Enzo Ferreira Oliveira",
      "data_nascimento": "2022-01-09",
      "foto_perfil_url": "/path/to/fotos/enzo.jpg",
      "alergias": "Ovo.",
      "observacoes": "Se frustra facilmente quando não consegue montar um brinquedo. Precisa de incentivo.",
      "responsaveis_ids": [307, 308]
    },
    {
      "id_aluno": 414,
      "id_turma": 202,
      "nome_completo": "Maria Júlia Dias Azevedo",
      "data_nascimento": "2022-12-01",
      "foto_perfil_url": "/path/to/fotos/maria_julia.jpg",
      "alergias": "Nenhuma",
      "observacoes": "A mais nova da turma. Ainda se adaptando à rotina.",
      "responsaveis_ids": [316, 317]
    }
  ]
}

export default dadosMockados;