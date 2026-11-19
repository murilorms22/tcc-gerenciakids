import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import PaginaAlunos from '../pages/PaginaAlunos';
import RouterStub from './RouterStub';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../services/alunoService', () => ({
  default: {
    listar: vi.fn(() =>
      Promise.resolve([
        {
          id: 1,
          nome: 'Helena Souza Martins',
          data_nascimento: '2022-02-20',
          alergias: 'APLV',
        },
      ]),
    ),
  },
}));

vi.mock('../services/turmaService', () => ({
  default: {
    listar: vi.fn(() =>
      Promise.resolve([
        { id: 1, nome: 'Maternal II - Estrelinhas', turno: 'Manhã' },
      ]),
    ),
  },
}));

test('PaginaAlunos: Deve renderizar o título da página e o aluno listado', async () => {
  render(
    <AuthProvider>
      <RouterStub component={<PaginaAlunos />} />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('Gerenciamento de Alunos')).toBeInTheDocument();
    expect(screen.getByText('Helena Souza Martins')).toBeInTheDocument();
  });
});
