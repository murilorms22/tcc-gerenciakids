import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import PaginaAlunosInfo from '../pages/PaginaAlunosInfo';
import RouterStub from './RouterStub';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../services/alunoService', () => ({
  default: {
    buscarPorId: vi.fn(() =>
      Promise.resolve({
        id: 1,
        nome: 'Helena Souza Martins',
        data_nascimento: '2022-02-20',
        genero: 'Feminino',
        tipo_sanguineo: 'A+',
        alergias: 'APLV',
        observacoes: 'Dieta restrita',
        peso: 13.5,
        altura: 89,
        faltas: 1,
        turma: { nome: 'Maternal II', turno: 'Manhã' },
        responsavel: {
          nome: 'Fernanda Souza Martins',
          cpf: '123.456.789-01',
          telefone: '(11) 98765-4321',
        },
      }),
    ),
  },
}));

test('PaginaAlunosInfo: Deve renderizar a ficha completa do aluno com alergias e dados médicos', async () => {
  render(
    <AuthProvider>
      <RouterStub component={<PaginaAlunosInfo />} />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('Ficha do Aluno')).toBeInTheDocument();
    expect(screen.getByText('Helena Souza Martins')).toBeInTheDocument();
    expect(screen.getByText('APLV')).toBeInTheDocument();
  });
});
