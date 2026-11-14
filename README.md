# Demand Forecast Dashboard

Por favor, refatore esta aplicação para ser uma Single Page Application (SPA) pura baseada em **Vite + React**, removendo completamente a dependência de arquitetura SSR (TanStack Start / server.ts), para que o projeto possa ser hospedado de forma 100% estática no **GitHub Pages**.

### Diretrizes obrigatórias para a refatoração:

1. **Roteamento Estático (HashRouter):**

   - Substitua o sistema de rotas de servidor/TanStack Start por **`HashRouter`** do `react-router-dom`. Isso é fundamental para que as rotas e navegações funcionem perfeitamente em hospedagem estática no GitHub Pages sem gerar erros 404 ou telas brancas.

2. **Configuração de Build do Vite:**

   - Garanta que o ponto de entrada (`index.html` na raiz apontando para o script correto em `src/`) esteja perfeitamente estruturado para gerar a pasta `dist` estática ao executar o comando de build.

3. **Preservação de 100% das Funcionalidades:**

   - **Sistema de Login:** Tela de acesso com senha protetora.

   - **Dashboard de Previsão de Demanda:** Seletor de meses e anos (incluindo anos futuros), com cálculos de tendência e sazonalidade.

   - **Gráficos Interativos (Recharts):** Visualizações de faturamento bruto, gastos, quantidade de vendas e categorias (cerveja, vinho, whisky, etc.).

   - **Upload de Excel:** Funcionalidade para carregar novos arquivos `.xlsx` no painel administrativo, processando os dados localmente no navegador (via SheetJS/xlsx) e atualizando os gráficos e tabelas em tempo real.

4. **Estética e Identidade Visual Intocadas:**

   - Mantenha rigorosamente o mesmo design moderno, ícones (`lucide-react`) e a paleta de cores: **Preto profundo / Cinza escuro** (`#09090b` / `#18181b`), **Verde esmeralda** para destaques/sucesso (`#10b981`), **Laranja vibrante** para alertas/gastos (`#f97316`) e **Cinza claro** para textos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/524264c1-4618-4e00-81ee-2f32884c00d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
