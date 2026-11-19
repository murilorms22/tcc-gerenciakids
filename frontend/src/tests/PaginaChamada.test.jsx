import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import PaginaChamada from '../pages/PaginaChamada';
import RouterStub from './RouterStub';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../services/alunoService', () => ({
  default: {
    listar: vi.fn(() => Promise.resolve([])),
    registrarChamada: vi.fn(),
  },
}));

vi.mock('../services/turmaService', () => ({
  default: {
    listar: vi.fn(() => Promise.resolve([])),
  },
}));

test('PaginaChamada: Deve renderizar o título da chamada', async () => {
  render(
    <AuthProvider>
      <RouterStub component={<PaginaChamada />} />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('Registro de Chamada')).toBeInTheDocument();
  });
});
