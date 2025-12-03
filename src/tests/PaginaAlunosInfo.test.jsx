import React from "react";
import { render, screen, waitFor } from '@testing-library/react'; // MUDOU AQUI
import { test, expect, vi } from "vitest";
import PaginaAlunosInfo from "../pages/PaginaAlunosInfo/PaginaAlunosInfo";
import RouterStub from "./RouterStub";
import { AuthProvider } from "../contexts/AuthContext";

vi.mock('../utils/axios-client', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: null })),
    }
}));

test("PaginaAlunosInfo: Deve renderizar estado inicial", async () => {
    render(
        <AuthProvider>
            <RouterStub component={<PaginaAlunosInfo />} />
        </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.getByText(/Carregando|Erro/i)).toBeInTheDocument();
    });
});