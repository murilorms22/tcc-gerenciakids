import React from "react";
import { render } from 'vitest-browser-react'
import { test, expect } from "vitest";
import PaginaAlunos from "../pages/PaginaAlunos/PaginaAlunos";
import RouterStub from "./RouterStub";
import { AuthProvider } from "../contexts/AuthContext";

test("PaginaAlunos: Deve renderizar o título da página", async () => {
    // renderiza o componente envolvido nos provedores de autenticação e rotas
    const { getByText } = render(
        <AuthProvider>
            <RouterStub component={<PaginaAlunos />} />
        </AuthProvider>
    )

    // verifica se o texto do título está presente no documento renderizado
    await expect.element(getByText('Gerenciamento de Alunos')).toBeInTheDocument()
});