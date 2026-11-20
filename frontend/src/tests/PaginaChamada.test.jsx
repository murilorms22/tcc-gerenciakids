import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { test, expect, vi, beforeEach } from 'vitest';
import PaginaChamada from '../pages/PaginaChamada';
import RouterStub from './RouterStub';
import { AuthProvider } from '../contexts/AuthContext';
import alunoService from '../services/alunoService';

vi.mock('../services/alunoService', () => ({
  default: {
    listar: vi.fn(() =>
      Promise.resolve([
        {
          id: 1,
          nome: 'Helena Souza Martins',
          faltas: 1,
          turmaId: 1,
          turma: { nome: 'Maternal II' },
        },
      ]),
    ),
    registrarChamada: vi.fn(() => Promise.resolve({ id: 1, faltas: 2 })),
  },
}));

vi.mock('../services/turmaService', () => ({
  default: {
    listar: vi.fn(() =>
      Promise.resolve([
        { id: 1, nome: 'Maternal II', turno: 'Manhã' },
      ]),
    ),
  },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test('PaginaChamada: Deve realizar chamada uma vez por dia, desativar checkboxes, exibir Editar Chamada e impedir 2 faltas no mesmo dia', async () => {
  render(
    <AuthProvider>
      <RouterStub component={<PaginaChamada />} />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('Registro de Chamada')).toBeInTheDocument();
    expect(screen.getByText('Helena Souza Martins')).toBeInTheDocument();
  });

  const checkbox = screen.getByLabelText(
    'Marcar ausência de Helena Souza Martins',
  );
  expect(checkbox).not.toBeDisabled();

  // Marca falta para Helena e salva a chamada do dia
  fireEvent.click(checkbox);
  const btnSalvar = screen.getByText('Salvar Chamada').closest('button');
  fireEvent.click(btnSalvar);

  await waitFor(() => {
    expect(screen.getByText('Editar Chamada')).toBeInTheDocument();
  });

  // Após salvar, o checkbox deve ficar desativado e Helena deve ter 2 faltas (1 + 1)
  expect(checkbox).toBeDisabled();
  expect(alunoService.registrarChamada).toHaveBeenCalledTimes(1);
  expect(screen.getByText('2')).toBeInTheDocument();

  // Clica em Editar Chamada -> reativa o checkbox
  const btnEditar = screen.getByText('Editar Chamada').closest('button');
  fireEvent.click(btnEditar);
  expect(checkbox).not.toBeDisabled();

  // Salva novamente mantendo Helena marcada -> NÃO pode adicionar 2ª falta no mesmo dia
  const btnSalvarNovamente = screen
    .getByText('Salvar Chamada')
    .closest('button');
  fireEvent.click(btnSalvarNovamente);

  await waitFor(() => {
    expect(screen.getByText('Editar Chamada')).toBeInTheDocument();
  });

  expect(alunoService.registrarChamada).toHaveBeenCalledTimes(1);
  expect(screen.getByText('2')).toBeInTheDocument();
});
