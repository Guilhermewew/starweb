# Starweb — Bootstrap AI Builder

Gerador local de páginas web profissionais usando Bootstrap 5 e modelos de inteligência artificial. O projeto permite descrever uma interface em linguagem natural, gerar um documento HTML completo, editar o código manualmente, visualizar o resultado e aplicar melhorias incrementais sem reescrever a página inteira.

> **Status:** aplicação front-end estática, sem backend próprio.

## Sumário

- [Visão geral](#visão-geral)
- [Recursos](#recursos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Execução local](#execução-local)
- [Configuração da IA](#configuração-da-ia)
- [Como usar](#como-usar)
- [Editor de código](#editor-de-código)
- [Geração de páginas](#geração-de-páginas)
- [Melhorias incrementais](#melhorias-incrementais)
- [Auditoria funcional](#auditoria-funcional)
- [Importação de projetos](#importação-de-projetos)
- [Pré-visualização e download](#pré-visualização-e-download)
- [Persistência e tema](#persistência-e-tema)
- [PWA e funcionamento offline](#pwa-e-funcionamento-offline)
- [Arquitetura técnica](#arquitetura-técnica)
- [Segurança e limitações](#segurança-e-limitações)
- [Troubleshooting](#troubleshooting)
- [Personalização](#personalização)
- [Validação e desenvolvimento](#validação-e-desenvolvimento)

## Visão geral

O Starweb é uma ferramenta para prototipação e criação rápida de interfaces. A aplicação roda diretamente no navegador e combina:

1. Um prompt detalhado para geração de páginas.
2. Integração com Groq e Google Gemini.
3. Editor CodeMirror com realce de sintaxe.
4. Pré-visualização em iframe isolado.
5. Sistema de melhorias incrementais baseado em patches.
6. Auditoria de layout, scripts e interações.
7. Salvamento local da configuração e da sessão de trabalho.

O resultado gerado é um único arquivo HTML com:

- Bootstrap 5 via CDN.
- CSS personalizado dentro de `<style>`.
- JavaScript dentro de `<script>`.
- Conteúdo, estrutura e interações no mesmo documento.

## Recursos

### Geração por descrição

O usuário pode descrever uma landing page, dashboard, loja, portfólio, tela de login, página SaaS ou qualquer outra interface. O prompt interno orienta o modelo a produzir:

- Design sofisticado e minimalista.
- Hierarquia visual clara.
- Paleta de cores coerente.
- Conteúdo realista.
- Layout responsivo.
- Componentes Bootstrap usados com propósito.
- Estados de hover, foco, validação, carregamento e vazio.
- Interações funcionais em vez de controles decorativos.

### Provedores de IA

O projeto oferece dois provedores:

#### Groq

Modelos disponíveis:

- `openai/gpt-oss-120b`
- `llama-3.3-70b-versatile`
- `llama-3.1-8b-instant`

#### Google Gemini

Modelos disponíveis:

- `gemini-2.5-flash`
- `gemini-2.5-pro`

O seletor de modelos é atualizado automaticamente quando o provedor muda.

### Editor de código

O código gerado é carregado no CodeMirror com:

- Realce de HTML, CSS e JavaScript.
- Numeração de linhas.
- Quebra automática de linhas.
- Tema escuro.
- Indentação de dois espaços.
- Salvamento com `Ctrl + S` ou `Cmd + S`.
- Salvamento automático da sessão.

### Sugestões rápidas

A tela possui prompts prontos para:

- Dashboard administrativo.
- Página de produto.
- Tela de login.
- Site institucional.
- Landing page SaaS.
- Portfólio criativo.
- Loja de moda.
- Página de evento.
- Dashboard financeiro.

### Melhorias contextuais

Depois que o código é analisado, o sistema exibe apenas sugestões compatíveis com a estrutura encontrada. Entre as possibilidades:

- Corrigir funcionalidades.
- Adicionar interações JavaScript.
- Adicionar validação de formulários.
- Adicionar modo escuro.
- Melhorar acessibilidade.
- Otimizar desempenho.
- Dar acabamento premium.
- Adicionar microinterações.
- Reforçar prova social.
- Melhorar conversão.
- Refinar versão mobile.
- Organizar a narrativa da página.

Cada melhoria é aplicada sobre o código atual e pode ser desfeita.

## Estrutura do projeto

```text
SISTEMA PAGE/
├── index.html                 # Interface principal da aplicação
├── app.js                    # Lógica da aplicação e integrações com IA
├── styles.css                # Estilos da aplicação
├── manifest.json             # Metadados da aplicação instalável
├── sw.js                     # Service Worker e cache offline
├── html contruindos/
│   └── index.html            # Exemplo de página construída
└── README.md                 # Esta documentação
```

### Responsabilidade dos arquivos

#### [`index.html`](./index.html)

Contém a estrutura da interface:

- Configuração da IA.
- Preferências.
- Campo de prompt.
- Sugestões rápidas.
- Editor de código.
- Área de melhorias.
- Modal de pré-visualização.
- Modal de importação.
- Toasts de feedback.

Também carrega as dependências externas:

- Bootstrap CSS e JavaScript.
- Bootstrap Icons.
- CodeMirror.
- Modos HTML, CSS e JavaScript do CodeMirror.

#### [`app.js`](./app.js)

Contém:

- Configuração de provedores.
- Comunicação com Groq e Gemini.
- Prompt de geração.
- Normalização do HTML recebido.
- Editor CodeMirror.
- Sessão local.
- Importação de arquivos.
- Melhorias incrementais.
- Auditoria funcional.
- Pré-visualização.
- Download e cópia.
- Verificação automática.

#### [`styles.css`](./styles.css)

Contém o estilo visual da aplicação, incluindo:

- Cores da marca.
- Cards.
- Hero.
- Editor.
- Tema escuro.
- Indicadores de status.
- Painéis de melhoria.

#### [`manifest.json`](./manifest.json)

Define o nome, ícone, cores, URL inicial e modo de exibição da aplicação quando instalada como PWA.

#### [`sw.js`](./sw.js)

Implementa:

- Cache do shell principal.
- Estratégia network-first para arquivos locais.
- Estratégia cache-first para recursos do jsDelivr.
- Fallback para `index.html` quando a aplicação estiver offline.

As chamadas de API não são interceptadas pelo Service Worker.

## Requisitos

- Navegador moderno com suporte a:
  - JavaScript moderno.
  - `fetch`.
  - `localStorage`.
  - `DOMParser`.
  - Service Worker.
  - ES modules não são necessários.
- Internet para:
  - Carregar Bootstrap, ícones e CodeMirror via CDN.
  - Enviar solicitações para Groq ou Gemini.
- Uma chave de API de um dos provedores.
- Um servidor HTTP local para testar corretamente o Service Worker.

Não há `package.json` nem etapa de instalação de dependências Node.js.

## Execução local

### Opção 1: servidor Python

Na pasta do projeto, execute:

```powershell
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

### Opção 2: servidor com Node.js

Se você já tiver uma ferramenta de servidor estático instalada:

```powershell
npx serve .
```

### Importante

Abrir o arquivo diretamente com `file://` pode impedir:

- Registro do Service Worker.
- Funcionamento completo do cache offline.
- Alguns comportamentos de segurança do navegador.

Para desenvolvimento, prefira sempre `http://localhost`.

## Configuração da IA

### Groq

1. Selecione **Groq**.
2. Crie ou copie uma chave da Groq.
3. Cole a chave no campo **Chave API**.
4. Escolha um modelo.
5. Clique em **Salvar configuração**.
6. Use o botão de teste para verificar a conexão.

As chaves da Groq normalmente começam com `gsk_`.

### Google Gemini

1. Selecione **Google Gemini**.
2. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey).
3. Cole a chave no campo **Chave API**.
4. Escolha `Gemini 2.5 Flash` ou `Gemini 2.5 Pro`.
5. Clique em **Salvar configuração**.
6. Teste a conexão.

### Seleção de modelo

O modelo selecionado é salvo junto com o provedor. Ao trocar de provedor, a lista é reconstruída para impedir que um modelo Groq seja enviado para a API Gemini ou vice-versa.

## Como usar

### 1. Configurar o provedor

Escolha Groq ou Gemini, informe a chave e teste a conexão.

### 2. Descrever a página

No campo principal, descreva:

- Tipo de página.
- Nome da marca ou produto.
- Público.
- Objetivo.
- Seções necessárias.
- Ações esperadas.
- Estilo visual.
- Cores preferidas.

Exemplo:

```text
Crie uma landing page premium para uma clínica de dermatologia chamada Lumina.
Use uma estética minimalista em branco, azul-petróleo e dourado discreto.
Inclua hero com agendamento, serviços, equipe, depoimentos, perguntas frequentes,
formulário de contato e navegação mobile funcional.
```

Quanto mais específico for o pedido, mais coerente será o resultado.

### 3. Gerar

Clique em **Gerar código**. A aplicação:

1. Envia o prompt ao provedor escolhido.
2. Tenta novamente se a resposta vier cortada ou repetida.
3. Remove Markdown e texto fora do documento.
4. Garante `DOCTYPE`, `html`, `head` e `body`.
5. Remove atributos `integrity` e `crossorigin` adicionados indevidamente.
6. Reinsere CSS ou JavaScript que tenham vindo separados.
7. Injeta Bootstrap quando a página usar componentes sem carregar a biblioteca.
8. Exibe o resultado no editor.
9. Analisa as melhorias aplicáveis.
10. Executa a verificação automática, se essa opção estiver ativa.

## Editor de código

O editor permite alterar manualmente o HTML gerado.

### Salvamento

As alterações são salvas automaticamente na sessão local após uma breve pausa. Também é possível usar:

```text
Ctrl + S
```

ou:

```text
Cmd + S
```

### Cuidados ao editar

Depois de editar manualmente:

1. Clique em **Verificar**.
2. Abra o **Go Live**.
3. Teste menus, links, formulários e botões.
4. Use **Corrigir com IA** se forem encontrados problemas.

O editor é baseado em CodeMirror, mas a validação de HTML não substitui o teste visual e funcional da página.

## Geração de páginas

O prompt de geração exige que as páginas:

- Sejam um único documento HTML.
- Tenham CSS e JavaScript embutidos.
- Usem Bootstrap 5.
- Sejam responsivas.
- Tenham uma direção visual própria.
- Evitem lorem ipsum.
- Tenham conteúdo contextual.
- Tenham navegação real.
- Tenham botões com ações.
- Tenham formulários com validação e feedback.
- Usem dados locais quando não houver backend.
- Evitem controles decorativos.
- Respeitem acessibilidade e teclado.

O gerador também orienta a IA a conferir:

- Objetivo acima da dobra.
- Narrativa entre seções.
- CTA principal.
- Contraste.
- Mobile.
- Interações.
- Independência do arquivo HTML.

## Melhorias incrementais

As melhorias não substituem a página inteira. A IA recebe:

- O HTML atual.
- A sugestão escolhida.
- As regras de preservação.

Ela responde com blocos de patch:

```text
@@CSS
@@JS
@@HEAD
@@BODY_END
@@FIND
@@REPLACE
@@END
```

O sistema então:

1. Analisa os blocos.
2. Valida a sintaxe do JavaScript.
3. Aplica somente edições pontuais seguras.
4. Verifica se IDs importantes não foram removidos.
5. Evita perda significativa de elementos.
6. Registra o estado anterior no histórico.
7. Atualiza o editor.
8. Recalcula as sugestões.

### Desfazer

O botão **Desfazer** restaura a última melhoria aplicada. O histórico é salvo na sessão local e limitado para evitar ocupar armazenamento excessivo.

## Auditoria funcional

Após a geração ou quando o usuário solicita uma verificação, a página é executada em um iframe isolado em dois tamanhos:

- Desktop: aproximadamente `1280px`.
- Celular: aproximadamente `390px`.

A auditoria procura:

- Erros de JavaScript.
- Promessas rejeitadas.
- Falhas de CSS ou JavaScript externo.
- Rolagem horizontal.
- Canvas com altura exagerada.
- Links internos sem destino.
- Links `href="#"` sem ação.
- Alvos Bootstrap inexistentes.
- Botões sem evento ou comportamento.
- Formulários sem `action` ou `submit`.

Quando a correção automática está habilitada, a aplicação pode tentar até duas rodadas de correção. A IA recebe instruções específicas para corrigir:

- Navegação.
- IDs e destinos.
- Botões.
- Formulários.
- Componentes Bootstrap.
- Layout responsivo.
- Gráficos.

### Limitações da auditoria

A auditoria detecta problemas estruturais e executáveis comuns, mas não consegue garantir que a página atende perfeitamente a uma regra de negócio complexa. Sempre revise manualmente:

- Fluxos de compra.
- Regras de autenticação.
- Integrações externas.
- Cálculos financeiros.
- Conteúdo.
- Comportamento esperado pelo cliente.

## Importação de projetos

O botão **Importar código** aceita:

- `.html`
- `.htm`
- `.css`
- `.js`
- `.txt`

É possível:

1. Selecionar um arquivo HTML.
2. Selecionar CSS e JavaScript relacionados.
3. Colar o código diretamente.
4. Embutir CSS e JS locais referenciados no HTML.
5. Carregar o resultado no editor.
6. Aplicar melhorias sobre o projeto importado.

Arquivos CSS e JS locais que não forem referenciados pelo HTML são informados como ignorados.

## Pré-visualização e download

### Go Live

O Go Live abre a página atual em um iframe com sandbox. Isso permite testar o resultado sem substituir a aplicação principal.

É possível:

- Atualizar a pré-visualização.
- Abrir em uma nova aba.
- Testar a página isoladamente.

### Copiar

Copia o conteúdo atual do editor para a área de transferência.

### Baixar

Baixa o código como:

```text
pagina-gerada.html
```

O arquivo baixado é independente da aplicação e pode ser aberto em um navegador.

## Persistência e tema

O projeto usa `localStorage` para guardar:

### Configuração

Chave interna:

```text
bootstrap-ai-config
```

Armazena:

- Chave API.
- Provedor.
- Modelo.
- Preferência de detalhamento.
- Correção automática.

### Sessão

Chave interna:

```text
bootstrap-ai-session
```

Armazena:

- Código atual.
- Prompt.
- Histórico de melhorias.
- Indicação de importação.
- Momento do último salvamento.

### Tema

Chave interna:

```text
bootstrap-ai-theme
```

O tema claro/escuro é aplicado ao documento principal e restaurado quando a aplicação abre novamente.

## PWA e funcionamento offline

O [`sw.js`](./sw.js) registra um Service Worker quando o navegador oferece suporte.

### Cache local

O shell da aplicação inclui:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`

### Estratégias

- Arquivos do próprio projeto: rede primeiro, cache como fallback.
- Recursos do jsDelivr: cache primeiro.
- APIs da Groq e Gemini: passam diretamente pela rede.

O modo offline permite abrir a interface e consultar recursos já armazenados, mas não permite gerar novas páginas sem conexão com o provedor de IA.

## Arquitetura técnica

### Fluxo de geração

```text
Prompt do usuário
        ↓
Provedor selecionado
        ↓
Groq ou Gemini
        ↓
Resposta bruta
        ↓
normalizeGeneratedCode()
        ↓
HTML completo
        ↓
CodeMirror
        ↓
Auditoria funcional
        ↓
Correção opcional
```

### Funções importantes

| Função | Responsabilidade |
|---|---|
| `initializeCodeEditor()` | Inicializa o CodeMirror |
| `getEditorCode()` | Obtém o conteúdo atual do editor |
| `setEditorCode()` | Atualiza o conteúdo do editor |
| `syncProviderUI()` | Atualiza provedor, chave e modelos |
| `callGemini()` | Envia requisições para Gemini |
| `groqFetch()` | Envia requisições para Groq com tentativas |
| `callAI()` | Seleciona o adaptador do provedor |
| `normalizeGeneratedCode()` | Normaliza e completa o HTML recebido |
| `isMissing()` | Decide quais melhorias fazem sentido |
| `applyPatch()` | Aplica patches incrementais |
| `inspectPage()` | Executa a página para inspeção |
| `pageMonitor()` | Detecta erros e problemas funcionais dentro do iframe |
| `saveSession()` | Salva a sessão local |
| `loadImportedCode()` | Processa código importado |
| `updatePreview()` | Atualiza o Go Live |

### Adaptadores de provedor

Groq usa o formato compatível com Chat Completions:

```text
POST https://api.groq.com/openai/v1/chat/completions
```

Gemini usa o formato `generateContent`:

```text
POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent
```

Isso evita enviar o formato da Groq para a API Gemini.

## Segurança e limitações

### Chave API no navegador

As chaves são armazenadas no `localStorage` do navegador. Isso é conveniente para uso local, mas não é adequado para um ambiente público ou multiusuário.

Em produção, o recomendado é:

1. Criar um backend próprio.
2. Guardar as chaves somente no servidor.
3. Criar endpoints protegidos para geração.
4. Aplicar autenticação, limite de uso e auditoria.
5. Nunca enviar a chave diretamente ao navegador do usuário.

### Conteúdo gerado

O código retornado pela IA deve ser revisado antes de publicar. A aplicação remove alguns atributos potencialmente problemáticos, mas não substitui:

- Revisão de segurança.
- Revisão de acessibilidade.
- Testes de negócio.
- Otimização de produção.
- Sanitização específica do contexto.

### Iframe de pré-visualização

A pré-visualização usa sandbox para reduzir o impacto do código executado. Ainda assim:

- O HTML gerado pode carregar recursos externos.
- Scripts externos podem depender de internet.
- A sandbox não torna código de terceiros automaticamente confiável.

## Troubleshooting

### “A API não responde”

Verifique:

- Internet.
- Chave correta.
- Provedor selecionado.
- Modelo compatível com o provedor.
- Limites e permissões da conta.

Use o botão de teste antes de gerar.

### “Modelo indisponível”

Confirme se:

- O modelo pertence ao provedor selecionado.
- A conta possui acesso ao modelo.
- A lista de modelos do projeto está atualizada.

### “A página gerada não tem interação”

1. Clique em **Verificar**.
2. Leia os problemas listados.
3. Se a correção automática estiver habilitada, gere novamente ou use **Corrigir com IA**.
4. Procure a sugestão **Corrigir funcionalidades**.
5. Teste manualmente o menu, links, botões e formulários no Go Live.

### “A página fica cortada”

O projeto tenta gerar novamente quando identifica:

- `finish_reason` de limite.
- Repetição anormal de texto.

Se ainda ocorrer:

- Use um pedido mais curto.
- Reduza a quantidade de seções.
- Escolha um modelo mais rápido.
- Gere primeiro uma versão menor e aplique melhorias depois.

### “O editor não aparece”

Verifique:

- Se o CDN do CodeMirror está acessível.
- Se o navegador permite scripts externos.
- O console do navegador.
- Se a aplicação foi aberta por um servidor HTTP.

Existe um fallback para o textarea original, mas o realce de sintaxe depende do carregamento do CodeMirror.

### “O Service Worker não atualiza”

O navegador pode manter uma versão antiga do cache. Tente:

1. Recarregar a página.
2. Abrir as ferramentas de desenvolvedor.
3. Ir até **Application** ou **Aplicativo**.
4. Remover o Service Worker e o cache do site.
5. Reabrir o servidor local.

Ao alterar o shell da aplicação, incremente `CACHE_NAME` em [`sw.js`](./sw.js).

## Personalização

### Alterar modelos

Os modelos são definidos em `syncProviderUI()` no [`app.js`](./app.js). Ao adicionar um modelo:

1. Coloque-o na lista do provedor correto.
2. Confirme o identificador oficial da API.
3. Verifique o formato de resposta.
4. Teste geração e erro de limite.

### Alterar sugestões rápidas

As sugestões rápidas ficam no [`index.html`](./index.html) em botões com o atributo:

```html
data-prompt="..."
```

O texto visível do botão é independente do prompt enviado.

### Alterar sugestões de melhoria

As melhorias ficam no array `improvementSuggestions` em [`app.js`](./app.js). Cada item deve conter:

```javascript
{
    id: 'identificador-unico',
    icon: 'bi-icone',
    title: 'Título',
    text: 'Descrição do que será feito.'
}
```

Para que a sugestão seja contextual, adicione também uma regra correspondente em `isMissing()`.

### Alterar o prompt de geração

O prompt está dentro de `generate()` em [`app.js`](./app.js). Ao alterá-lo, preserve as regras que garantem:

- HTML único.
- CSS interno.
- JavaScript interno.
- Ausência de Markdown.
- Funcionalidade real.
- Responsividade.
- Acessibilidade.

### Alterar a auditoria

A auditoria executável está em `pageMonitor()`. Ela deve continuar:

- Isolada no iframe.
- Limitada a diagnósticos seguros.
- Sem executar alterações no código gerado.
- Sem bloquear a aplicação principal.

## Validação e desenvolvimento

O projeto não possui uma suíte de testes automatizados configurada. A validação mínima atual é:

```powershell
node --check .\app.js
```

Também é recomendado testar manualmente:

1. Abrir a aplicação por HTTP.
2. Configurar Groq.
3. Configurar Gemini.
4. Testar conexão.
5. Gerar uma página.
6. Editar o código manualmente.
7. Abrir o Go Live.
8. Testar navegação e controles.
9. Executar a verificação.
10. Aplicar e desfazer uma melhoria.
11. Importar um HTML externo.
12. Baixar o resultado.
13. Reabrir a aplicação e confirmar a restauração da sessão.
14. Testar o modo offline após a primeira visita.

## Licença

Não há um arquivo de licença definido no projeto. Antes de distribuir ou publicar a aplicação, defina uma licença adequada e verifique as licenças de:

- Bootstrap.
- Bootstrap Icons.
- CodeMirror.
- Imagens e fontes usadas pelas páginas geradas.
- APIs e modelos de IA utilizados.
