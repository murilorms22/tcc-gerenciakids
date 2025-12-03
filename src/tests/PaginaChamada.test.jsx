import React from "react";
import { render, screen, waitFor } from '@testing-library/react'; // MUDOU AQUI
import { test, expect, vi } from "vitest";
import PaginaChamada from "../pages/PaginaChamada/PaginaChamada";
import RouterStub from "./RouterStub";
import { AuthProvider } from "../contexts/AuthContext";

vi.mock('../utils/axios-client', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ 
            data: { users: [], todos: [] } 
        })),
        put: vi.fn(),
    }
}));

test("PaginaChamada: Deve renderizar o título da chamada", async () => {
    render(
        <AuthProvider>
            <RouterStub component={<PaginaChamada />} />
        </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.getByText('Registro de Chamada')).toBeInTheDocument();
    });
});