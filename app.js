const $ = (id) => document.getElementById(id);
const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
const configKey = 'bootstrap-ai-config';
let codeEditor = null;
let editorUpdating = false;

function getEditorCode() {
    return codeEditor ? codeEditor.getValue() : $('codigoGerado').value;
}
function setEditorCode(value) {
    const code = String(value || '');
    if (codeEditor) {
        editorUpdating = true;
        codeEditor.setValue(code);
        editorUpdating = false;
        codeEditor.refresh();
    } else {
        $('codigoGerado').value = code;
    }
}
function initializeCodeEditor() {
    if (!window.CodeMirror) {
        showToast('O editor avançado não carregou. Você ainda pode editar o código no campo padrão.', 'warning');
        return;
    }
    codeEditor = window.CodeMirror.fromTextArea($('codigoGerado'), {
        mode: 'htmlmixed',
        theme: 'material-darker',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        indentUnit: 2,
        autofocus: false,
        extraKeys: {
            'Ctrl-S': (editor) => { editor.save(); saveSession(); showToast('Código salvo na sessão.'); },
            'Cmd-S': (editor) => { editor.save(); saveSession(); showToast('Código salvo na sessão.'); }
        }
    });
    codeEditor.getWrapperElement().classList.add('code-editor-shell');
    codeEditor.on('change', () => {
        if (editorUpdating) return;
        const code = getEditorCode();
        setButtons(!!code.trim());
        scheduleSave();
    });
}

function showToast(message, type = 'success') {
    const toast = $('toast');
    toast.className = `toast text-bg-${type}`;
    toast.querySelector('.toast-body').textContent = message;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3500 }).show();
}
function setStatus(state, message) {
    $('statusDot').className = `status-dot ${state}`;
    $('statusText').textContent = message;
}
function setButtons(enabled) {
    $('btnCopiar').disabled = !enabled;
    $('btnBaixar').disabled = !enabled;
}
function currentProvider() {
    return $('provedor').value;
}
function syncProviderUI() {
    const gemini = currentProvider() === 'gemini';
    const model = $('modelo');
    const selected = model.value;
    model.innerHTML = gemini
        ? '<option value="gemini-2.5-flash">Gemini 2.5 Flash (recomendado)</option><option value="gemini-2.5-pro">Gemini 2.5 Pro</option>'
        : '<option value="openai/gpt-oss-120b">GPT OSS 120B (recomendado)</option><option value="llama-3.3-70b-versatile">Llama 3.3 70B</option><option value="llama-3.1-8b-instant">Llama 3.1 8B (rápido)</option>';
    if ([...model.options].some((option) => option.value === selected)) model.value = selected;
    $('apiKey').placeholder = gemini ? 'AIza...' : 'gsk_...';
    $('provedorInfo').innerHTML = gemini
        ? 'Gemini usa uma chave do <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.'
        : 'Groq usa chaves que começam normalmente com <code>gsk_</code>.';
}
const improvementSuggestions = [
    { id: 'functional-audit', icon: 'bi-wrench-adjustable-circle', title: 'Corrigir funcionalidades', text: 'Faça a navegação, botões, formulários e componentes interativos funcionarem de verdade, com feedback visível e sem backend falso.' },
    { id: 'js-interacoes', icon: 'bi-mouse', title: 'Adicionar interações JavaScript', text: 'Adicione JavaScript útil aos elementos que já existem (menu mobile, abas, botões com feedback) usando addEventListener, sem criar seções novas nem mudar o layout.' },
    { id: 'form-validation', icon: 'bi-check2-square', title: 'Adicionar validação de formulários', text: 'Inclua validação com checkValidity, a classe was-validated do Bootstrap, mensagens de erro acessíveis e estado de sucesso.' },
    { id: 'dark-mode', icon: 'bi-moon-stars', title: 'Adicionar modo escuro', text: 'Inclua alternância de tema claro/escuro usando o atributo data-bs-theme do Bootstrap 5.3 no elemento html, um botão alternador e a preferência salva no localStorage.' },
    { id: 'accessibility', icon: 'bi-universal-access', title: 'Melhorar acessibilidade', text: 'Garanta lang no html, um elemento main, alt em todas as imagens, aria-label em botões e links que só têm ícone, e foco de teclado visível.' },
    { id: 'performance', icon: 'bi-speedometer2', title: 'Otimizar desempenho', text: 'Otimize imagens, carregamento de scripts e use lazy loading onde fizer sentido.' },
    { id: 'visual-polish', icon: 'bi-stars', title: 'Dar acabamento premium', text: 'Aprimore a hierarquia visual, tipografia, espaçamento, bordas, sombras e estados de hover sem mudar a estrutura ou o conteúdo principal.' },
    { id: 'microinteractions', icon: 'bi-lightning-charge', title: 'Adicionar microinterações', text: 'Inclua transições discretas, feedback em botões, animações de entrada respeitosas e estados de foco, sem exagerar nem prejudicar acessibilidade.' },
    { id: 'social-proof', icon: 'bi-chat-quote', title: 'Reforçar confiança', text: 'Adicione uma seção contextual de prova social com depoimentos, números, logos ou avaliações, mantendo o estilo visual existente.' },
    { id: 'conversion-cta', icon: 'bi-bullseye', title: 'Melhorar conversão', text: 'Torne a chamada para ação mais clara com copy objetiva, contraste, hierarquia e feedback de clique, sem criar um layout agressivo.' },
    { id: 'responsive-review', icon: 'bi-phone', title: 'Refinar versão mobile', text: 'Revise breakpoints, espaçamentos, tamanhos de texto, navegação e componentes para garantir uma experiência excelente em telas pequenas.' },
    { id: 'content-hierarchy', icon: 'bi-layout-text-window-reverse', title: 'Organizar narrativa', text: 'Melhore a ordem e a leitura das seções para conduzir o usuário do problema ao valor e à ação, sem remover conteúdo útil.' }
];
// ===== Auditoria real do código: diz se cada melhoria JÁ está de fato no HTML =====
function isMissing(id, code) {
    const doc = new DOMParser().parseFromString(code, 'text/html');
    const inline = [...doc.querySelectorAll('script:not([src])')].map((el) => el.textContent).join('\n');
    const hasInteractiveElements = !!doc.querySelector('button, form, input, select, textarea, [data-bs-toggle], [role="tab"], [role="button"]');
    const hasBrokenOrEmptyLinks = [...doc.querySelectorAll('a[href]')].some((link) => {
        const href = (link.getAttribute('href') || '').trim();
        return href === '#' || (href.startsWith('#') && href.length > 1 && !doc.getElementById(href.slice(1)));
    });
    const hasBootstrapScript = [...doc.querySelectorAll('script[src]')].some((script) => /bootstrap(?:\.bundle)?(?:\.min)?\.js/i.test(script.src));
    const hasActionableForm = !!doc.querySelector('form');
    const hasButtons = !!doc.querySelector('button, [role="button"]');
    const hasBootstrapControls = !!doc.querySelector('[data-bs-toggle], [data-bs-dismiss]');
    const hasInteractiveCode = /addEventListener\s*\(|\bon(?:click|submit|change|input)\s*=|classList\.(?:add|remove|toggle)\s*\(/i.test(inline);
    if (id === 'functional-audit') {
        if (!hasInteractiveElements && !hasBrokenOrEmptyLinks) return false;
        const hasButtonHandlers = /addEventListener\s*\(\s*['"](?:click|submit|change|input|keydown)['"]|onclick\s*=/i.test(inline);
        const hasFormHandlers = !hasActionableForm || /addEventListener\s*\(\s*['"]submit['"]|onsubmit\s*=/i.test(inline);
        const bootstrapTargetsAreValid = [...doc.querySelectorAll('[data-bs-target]')].every((element) => {
            const target = element.getAttribute('data-bs-target');
            if (!target || !target.startsWith('#')) return true;
            try { return !!doc.querySelector(target.replace(/([:.])/g, '\\$1')); } catch (error) { return false; }
        });
        const controlsHaveFramework = hasBootstrapControls && hasBootstrapScript;
        return hasBrokenOrEmptyLinks || !hasButtonHandlers && hasButtons && !controlsHaveFramework || !hasFormHandlers || !bootstrapTargetsAreValid || hasBootstrapControls && !hasBootstrapScript;
    }
    if (id === 'js-interacoes') {
        if (!hasInteractiveElements) return false;
        return !hasInteractiveCode && (hasButtons || hasActionableForm) && !(hasBootstrapControls && hasBootstrapScript && !hasActionableForm);
    }
    if (id === 'form-validation') return !!doc.querySelector('form, input, select, textarea') && !/checkValidity|reportValidity|setCustomValidity|was-validated/i.test(inline);
    if (id === 'dark-mode') return !!doc.body && !/data-bs-theme|prefers-color-scheme|classList\.(?:toggle|add)\(\s*['"][^'"]*dark/i.test(code);
    if (id === 'accessibility') {
        const semAlt = [...doc.images].some((img) => !img.hasAttribute('alt'));
        const soIcone = [...doc.querySelectorAll('button, a')].some((el) => !el.textContent.trim() && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !el.getAttribute('title') && !el.querySelector('img[alt]:not([alt=""])'));
        return semAlt || soIcone || !doc.querySelector('main, [role="main"]') || !doc.documentElement.getAttribute('lang');
    }
    if (id === 'performance') return [...doc.images].slice(1).some((img) => !img.hasAttribute('loading')) || [...doc.querySelectorAll('iframe')].some((frame) => !frame.hasAttribute('loading'));
    if (id === 'visual-polish') return !!doc.querySelector('main, header, section, article, .card') && !/--(?:brand|primary|surface|text|shadow|radius)\s*:|transition\s*:/i.test(code);
    if (id === 'microinteractions') return hasInteractiveElements && !/transition\s*:|@keyframes|classList\.(?:add|toggle)\(/i.test(code);
    if (id === 'social-proof') return doc.querySelectorAll('section, article, .card').length >= 2 && !/testimonial|depoimento|avalia[cç][aã]o|trusted|clientes|parceiros/i.test(code);
    if (id === 'conversion-cta') return !!doc.querySelector('main, header, section') && !/(call.to.action|cta|comece agora|saiba mais|fale conosco|solicite|assinar|comprar)/i.test(code);
    if (id === 'responsive-review') return !!doc.querySelector('main, .container, .row, [class*="col-"]') && !/@media\s*\(|col-(?:sm|md|lg)|container-fluid/i.test(code);
    if (id === 'content-hierarchy') return !!doc.querySelector('main, header, section') && doc.querySelectorAll('h1, h2, h3').length < 3;
    return false;
}
// Desempenho é aplicado direto pelo app (sem IA): a 1ª imagem, normalmente a principal, continua sem lazy
function applyPerformance(html) {
    let total = 0, seen = 0;
    let out = html.replace(/<img\b[^>]*>/gi, (tag) => {
        seen++;
        if (seen === 1 || /\sloading\s*=/i.test(tag)) return tag;
        total++;
        return tag.replace(/<img\b/i, `<img loading="lazy"${/\sdecoding\s*=/i.test(tag) ? '' : ' decoding="async"'}`);
    });
    out = out.replace(/<iframe\b[^>]*>/gi, (tag) => {
        if (/\sloading\s*=/i.test(tag)) return tag;
        total++;
        return tag.replace(/<iframe\b/i, '<iframe loading="lazy"');
    });
    return { html: out, changed: total > 0, notes: [], summary: [`lazy loading em ${total} imagem(ns)/iframe(s)`] };
}
function showImprovementSuggestions(code) {
    const missing = improvementSuggestions.filter((suggestion) => isMissing(suggestion.id, code));
    $('melhoriasCount').textContent = missing.length;
    $('melhoriasLista').innerHTML = missing.length ? missing.map((suggestion) => `<button type="button" class="btn btn-light border suggestion-btn" data-improvement="${suggestion.id}"><i class="bi ${suggestion.icon} text-primary me-2"></i><strong>${suggestion.title}</strong><small class="d-block text-muted ms-4">${suggestion.text}</small></button>`).join('') : '<div class="text-success small"><i class="bi bi-check-circle me-1"></i>Seu código já cobre as melhorias básicas.</div>';
    $('melhoriasPanel').classList.remove('d-none');
    document.querySelectorAll('[data-improvement]').forEach((button) => { button.disabled = busy; button.addEventListener('click', () => applyImprovement(button.dataset.improvement)); });
}
// ===== Melhorias incrementais: a IA devolve só o que ADICIONAR; o app aplica no código existente =====
let patchHistory = [];
let codeImported = false;
const PATCH_SYSTEM = `Você é um engenheiro front-end sênior, designer de produto e especialista em Bootstrap 5. Vai receber o HTML ATUAL de uma página e UMA melhoria. Faça uma alteração cirúrgica que deixe a página mais profissional, sofisticada e útil sem destruir o que já funciona. NÃO reescreva a página inteira.

Antes de responder, identifique a estrutura, a paleta, a tipografia, os ids/classes reais e os componentes já existentes. Preserve a identidade visual e reutilize tokens CSS, componentes Bootstrap e padrões de espaçamento que já existirem. Não duplique listeners, estilos ou seções. Se a melhoria não fizer sentido para a página, faça a interpretação mais simples e segura.

Responda SOMENTE com blocos de patch neste formato exato, usando apenas os blocos necessários:

@@CSS
(CSS novo para ADICIONAR; não repita o que já existe)
@@JS
(JavaScript novo; deve funcionar sozinho, selecionando com document.querySelector os elementos que JÁ existem no HTML atual, usando seus ids e classes reais)
@@HEAD
(tags link ou meta extras, só se indispensável)
@@BODY_END
(HTML novo a inserir antes do fim do body, por exemplo um modal ou botão; só se indispensável)
@@FIND
(trecho EXATO, curto e único, copiado do HTML atual)
@@REPLACE
(trecho que substitui o FIND, mantendo tudo que já existia nele)
@@END

Regras: nunca remova nem reordene elementos existentes; não altere o conteúdo principal sem necessidade; não troque a paleta sem motivo; não crie excesso de gradientes, sombras ou animações; sem markdown, sem crases de bloco, sem explicações; sem atributos integrity ou crossorigin; JavaScript puro sem erros de sintaxe; Bootstrap 5 já está carregado. Para comportamento e estilo, prefira CSS e JS. Respeite prefers-reduced-motion, foco de teclado, contraste e responsividade. Quando o pedido exigir NOVOS elementos, crie o HTML no bloco BODY_END ou use FIND/REPLACE para inserir no ponto certo, mantendo tudo que já existia no trecho. Toda alteração deve ser funcional, visualmente integrada e pequena o bastante para ser revisada.`;

function currentCode() {
    const value = getEditorCode().trim();
    return /<html[\s>]/i.test(value) ? value : '';
}
function updateUndo() { $('btnDesfazer').disabled = busy || patchHistory.length === 0; }
// ===== Chamadas à Groq: uma operação por vez, cancelamento, tentativas e erros claros =====
let busy = false, abortController = null, checkController = null, REQUEST_TIMEOUT_MS = 90000;
class CancelError extends Error { constructor() { super('Operação cancelada.'); this.name = 'CancelError'; } }
function restoreStatus() {
    const configured = !!$('apiKey').value.trim();
    setStatus(configured ? 'online' : '', configured ? 'IA configurada' : 'IA não configurada');
}
function setBusyUI(on) {
    $('btnCancelar').classList.toggle('d-none', !on);
    document.querySelector('.loading').style.display = on ? 'inline-block' : 'none';
    ['btnGerar', 'btnImportar', 'btnVerificar', 'btnCorrigir', 'btnLimpar', 'btnAplicarPedido', 'pedidoExtra'].forEach((id) => { $(id).disabled = on; });
    document.querySelectorAll('[data-improvement]').forEach((button) => { button.disabled = on; });
    updateUndo();
}
async function withBusy(label, work) {
    if (busy) { showToast('Aguarde: há outra operação em andamento (ou clique em Cancelar).', 'warning'); return false; }
    if (checkController) { checkController.abort(); checkController = null; renderCheck(); }
    busy = true; abortController = new AbortController(); setBusyUI(true); setStatus('', label);
    try { return await work(abortController.signal); }
    finally { busy = false; abortController = null; setBusyUI(false); }
}
const sleep = (ms, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new CancelError()); return; }
    const onAbort = () => { clearTimeout(timer); reject(new CancelError()); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
});
function friendlyHttpError(status, detail = '', wait = 0) {
    const when = wait >= 3600 ? `${Math.ceil(wait / 3600)} h` : wait >= 60 ? `${Math.ceil(wait / 60)} min` : `${Math.ceil(wait)} s`;
    const waitText = wait ? ` Tente novamente em ${when}.` : ' Tente novamente em instantes.';
    if (status === 401) return 'Chave API inválida ou expirada. Confira a chave no console da Groq e salve de novo.';
    if (status === 403) return 'A Groq negou o acesso com essa chave (permissão ou região).';
    if (status === 404) return 'Modelo indisponível para a sua conta. Escolha outro modelo em Preferências.';
    if (status === 413) return 'O pedido é grande demais para o limite do seu plano na Groq. Use um código menor ou o modelo Llama 3.1 8B.';
    if (status === 429) return `Limite de uso da Groq atingido.${waitText} Trocar de modelo também ajuda, pois cada um tem limite próprio.`;
    if (status >= 500) return `A Groq está instável no momento (erro ${status}).${waitText}`;
    return detail || `Erro da API (${status}).`;
}
function parseWaitSeconds(headers, detail) {
    const header = Number(headers.get('retry-after'));
    if (header > 0) return header;
    const section = /try again in\s+([0-9a-z.\s]+)/i.exec(detail || '');
    if (!section) return 0;
    let total = 0;
    for (const [, amount, unit] of section[1].matchAll(/(\d+(?:\.\d+)?)\s*(ms|h|m|s)/gi)) {
        const value = Number(amount), u = unit.toLowerCase();
        total += u === 'ms' ? value / 1000 : u === 'h' ? value * 3600 : u === 'm' ? value * 60 : value;
    }
    return total;
}
async function groqFetch(body, signal) {
    const maxAttempts = 4;
    for (let attempt = 1; ; attempt++) {
        if (signal.aborted) throw new CancelError();
        const local = new AbortController();
        let timedOut = false, status = 0, headers = null, raw = '';
        const onAbort = () => local.abort();
        signal.addEventListener('abort', onAbort, { once: true });
        const timer = setTimeout(() => { timedOut = true; local.abort(); }, REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { Authorization: `Bearer ${$('apiKey').value.trim()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: local.signal });
            status = response.status; headers = response.headers; raw = await response.text();
        } catch (error) {
            if (signal.aborted) throw new CancelError();
            if (attempt >= maxAttempts) throw new Error(timedOut ? `A Groq demorou mais de ${Math.round(REQUEST_TIMEOUT_MS / 1000)} s para responder. Tente de novo ou use um modelo mais rápido.` : 'Sem conexão com a Groq. Verifique sua internet e tente de novo.');
            setStatus('', `${timedOut ? 'Groq lenta' : 'Sem conexão'}. Nova tentativa ${attempt + 1}/${maxAttempts}...`);
            await sleep(1000 * 2 ** (attempt - 1), signal);
            continue;
        } finally { clearTimeout(timer); signal.removeEventListener('abort', onAbort); }

        let data = null;
        try { data = JSON.parse(raw); } catch (error) { data = null; }
        if (status >= 200 && status < 300) {
            if (!data) throw new Error('A Groq devolveu uma resposta inválida. Tente novamente.');
            return data;
        }
        const detail = data?.error?.message || '';
        const wait = parseWaitSeconds(headers, detail);
        const retryable = status === 429 || status >= 500;
        if (!retryable || attempt >= maxAttempts || wait > 30) throw new Error(friendlyHttpError(status, detail, wait));
        for (let left = Math.ceil(Math.max(wait, 2 ** (attempt - 1))); left > 0; left--) {
            setStatus('', `Groq ocupada (erro ${status}). Nova tentativa em ${left}s...`);
            await sleep(1000, signal);
        }
    }
}
async function callGemini(system, user, temperature, signal) {
    const model = encodeURIComponent($('modelo').value);
    const response = await fetch(`${geminiApiUrl}/${model}:generateContent?key=${encodeURIComponent($('apiKey').value.trim())}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature, maxOutputTokens: 32768 }
        }),
        signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `Erro da API Gemini (${response.status}).`);
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.map((part) => part.text || '').join('') || '';
    if (!content) throw new Error(candidate?.finishReason === 'SAFETY' ? 'O Gemini bloqueou a resposta pelos filtros de segurança. Reformule o pedido.' : 'O Gemini não devolveu conteúdo. Tente novamente.');
    return { message: { content }, finish_reason: candidate.finishReason === 'MAX_TOKENS' ? 'length' : 'stop' };
}
async function callAI(system, user, temperature = 0.2, signal = new AbortController().signal) {
    if (currentProvider() === 'gemini') return callGemini(system, user, temperature, signal);
    const data = await groqFetch({ model: $('modelo').value, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature, ...($('modelo').value.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}) }, signal);
    const choice = data.choices?.[0];
    if (!choice?.message?.content) throw new Error('O provedor não devolveu conteúdo. Tente novamente.');
    return choice;
}
const FIX_SYSTEM = `${PATCH_SYSTEM}

Você está CORRIGINDO problemas detectados ao executar a página (desktop 1280px e celular 390px). Corrija somente a causa dos problemas listados. Para erro dentro de um script existente, use FIND/REPLACE com o trecho exato e único. Para link interno quebrado, crie ou corrija o id do destino. Para botão sem interação, implemente a ação adequada com addEventListener ou transforme-o em link. Para componente Bootstrap, corrija data-bs-target, ids e dependências. Para formulário sem comportamento, implemente submit com validação e feedback acessível, sem backend falso. Para falha ao carregar CDN, troque a URL por outra que funcione (mesma biblioteca, versão fixa, sem integrity). Para rolagem horizontal ou elemento largo demais, corrija com CSS (max-width:100%, overflow-x, flex-wrap, min-width:0). Para gráfico gigante, coloque o canvas em uma div com position:relative e altura fixa e use maintainAspectRatio:false. Não remova funcionalidades.`;
function buildFixRequest(problems) {
    return `Corrija os problemas abaixo, detectados ao executar a página. Corrija apenas as causas, sem remover funcionalidades nem mudar textos, cores e layout que já funcionam.\n${problems.map((problem, index) => `${index + 1}. ${problem}`).join('\n')}`;
}

// ===== Sessão: salva e restaura o trabalho =====
const sessionKey = 'bootstrap-ai-session';
let saveTimer = null, sessionWarned = false;
function readSession() { try { return JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch (error) { return null; } }
function saveSession() {
    clearTimeout(saveTimer);
    const code = currentCode() || readSession()?.code || '';
    const prompt = $('promptUsuario').value;
    if (!code && !prompt.trim()) return;
    let history = patchHistory.slice(-10);
    for (;;) {
        try {
            localStorage.setItem(sessionKey, JSON.stringify({ v: 1, code, history, imported: codeImported, prompt, savedAt: Date.now() }));
            return;
        } catch (error) {
            if (!history.length) {
                if (!sessionWarned) { sessionWarned = true; showToast('Não consegui salvar a sessão: o armazenamento do navegador está cheio.', 'warning'); }
                return;
            }
            history = history.slice(1);
        }
    }
}
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveSession, 400); }
function restoreSession() {
    const session = readSession();
    if (!session) return;
    if (session.prompt) { $('promptUsuario').value = session.prompt; $('contador').textContent = `${session.prompt.length} caracteres`; }
    if (session.code && /<html[\s>]/i.test(session.code)) {
        setEditorCode(session.code);
        patchHistory = (Array.isArray(session.history) ? session.history : []).filter((item) => item && typeof item.code === 'string');
        codeImported = !!session.imported;
        setButtons(true); updateUndo(); showImprovementSuggestions(session.code);
        showToast('Sessão anterior restaurada.', 'info');
    }
}
function clearSession() {
    if (busy) return;
    if (currentCode() && !window.confirm('Limpar o código atual e o histórico salvo? Isso não pode ser desfeito.')) return;
    localStorage.removeItem(sessionKey);
    setEditorCode(''); patchHistory = []; codeImported = false;
    setButtons(false); updateUndo(); $('melhoriasPanel').classList.add('d-none'); renderCheck();
    showToast('Sessão limpa.', 'info');
}

// ===== Verificação por execução: roda a página escondida e coleta erros =====
function pageMonitor(T) {
    var sent = {};
    var ignore = /ResizeObserver loop|Failed to fetch|NetworkError|Load failed|Script error/i;
    var registered = new WeakMap();
    var originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type) {
        var types = registered.get(this) || {};
        types[type] = true;
        registered.set(this, types);
        return originalAddEventListener.apply(this, arguments);
    };
    function send(type, text) { try { parent.postMessage({ token: T, type: type, text: text }, '*'); } catch (e) {} }
    function problem(text) { text = String(text).slice(0, 300); if (sent[text]) return; sent[text] = 1; send('problem', text); }
    function describe(el) {
        var cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls;
    }
    function hasListener(el, type) {
        var types = registered.get(el);
        return !!(types && types[type]) || typeof el['on' + type] === 'function';
    }
    function auditInteractions() {
        var anchors = document.querySelectorAll('a[href]');
        for (var i = 0; i < anchors.length; i++) {
            var href = anchors[i].getAttribute('href') || '';
            if (href.charAt(0) === '#' && href !== '#') {
                var target = null;
                try { target = document.querySelector(href.replace(/([:.])/g, '\\$1')); } catch (e) { problem('Navegação inválida: o link ' + describe(anchors[i]) + ' usa o seletor "' + href + '".'); }
                if (!target) problem('Navegação quebrada: o link ' + describe(anchors[i]) + ' aponta para "' + href + '", mas o destino não existe.');
            } else if (href === '#' && !hasListener(anchors[i], 'click')) {
                problem('Link sem destino ou ação: ' + describe(anchors[i]) + '. Use um href válido ou implemente o clique.');
            }
        }
        var toggles = document.querySelectorAll('[data-bs-toggle]');
        for (var j = 0; j < toggles.length; j++) {
            var selector = toggles[j].getAttribute('data-bs-target') || toggles[j].getAttribute('href');
            if (selector && selector.charAt(0) === '#') {
                var toggleTarget = null;
                try { toggleTarget = document.querySelector(selector.replace(/([:.])/g, '\\$1')); } catch (e) { problem('Componente Bootstrap inválido: ' + describe(toggles[j]) + ' usa o seletor "' + selector + '".'); }
                if (!toggleTarget) problem('Componente Bootstrap quebrado: ' + describe(toggles[j]) + ' aponta para "' + selector + '", mas o alvo não existe.');
            }
        }
        var buttons = document.querySelectorAll('button');
        for (var k = 0; k < buttons.length; k++) {
            var button = buttons[k];
            var isBootstrapControl = button.hasAttribute('data-bs-toggle') || button.hasAttribute('data-bs-dismiss');
            var isSubmit = button.type === 'submit' && button.form;
            if (!isBootstrapControl && !isSubmit && !hasListener(button, 'click')) problem('Botão sem interação: ' + describe(button) + '. Adicione uma ação de clique ou torne-o um link.');
        }
        var forms = document.querySelectorAll('form');
        for (var n = 0; n < forms.length; n++) {
            var form = forms[n];
            if (!form.getAttribute('action') && !hasListener(form, 'submit')) problem('Formulário sem comportamento: ' + describe(form) + ' não possui action nem tratamento de submit.');
        }
    }
    function diag(label) {
        var w = window.innerWidth, root = document.documentElement;
        if (root.scrollWidth > w + 2) {
            var wide = [], all = document.querySelectorAll('body *');
            for (var i = 0; i < all.length && wide.length < 3; i++) {
                var r = all[i].getBoundingClientRect();
                if (r.width > w + 2 && getComputedStyle(all[i]).position !== 'fixed') wide.push(describe(all[i]) + ' (' + Math.round(r.width) + 'px)');
            }
            problem('Rolagem horizontal no ' + label + ': a página mede ' + root.scrollWidth + 'px para uma tela de ' + w + 'px.' + (wide.length ? ' Elementos largos: ' + wide.join(', ') + '.' : ''));
        }
        var canvases = document.querySelectorAll('canvas');
        for (var j = 0; j < canvases.length; j++) {
            var h = canvases[j].getBoundingClientRect().height;
            if (h > 1400) problem('Gráfico (canvas) com altura exagerada no ' + label + ': ' + Math.round(h) + 'px.');
        }
    }
    window.addEventListener('error', function (e) {
        var t = e.target;
        if (t && t !== window && t.tagName) {
            if ((t.tagName === 'LINK' && /stylesheet/i.test(t.rel)) || t.tagName === 'SCRIPT') problem('Falha ao carregar ' + (t.tagName === 'LINK' ? 'CSS' : 'script') + ': ' + (t.href || t.src));
            return;
        }
        if (ignore.test(e.message || '')) return;
        problem('Erro de JavaScript: ' + e.message + (e.lineno ? ' (linha ' + e.lineno + ')' : ''));
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
        var m = (e.reason && e.reason.message) || e.reason;
        if (!ignore.test(String(m))) problem('Promessa rejeitada: ' + m);
    });
    var originalError = console.error;
    console.error = function () {
        try { var m = Array.prototype.slice.call(arguments).map(String).join(' '); if (!ignore.test(m)) problem('console.error: ' + m); } catch (x) {}
        return originalError.apply(console, arguments);
    };
    window.addEventListener('load', function () { setTimeout(function () { diag('desktop'); auditInteractions(); send('desktopDone'); }, 1200); });
    window.addEventListener('message', function (e) {
        if ((e.source && e.source !== parent) || !e.data || e.data.token !== T || e.data.cmd !== 'mobile') return;
        setTimeout(function () { diag('celular'); send('done'); }, 500);
    });
}
function instrumentPage(code, token) {
    const tag = `<script>(${pageMonitor.toString()})(${JSON.stringify(token)});${SCRIPT_CLOSE}`;
    const prepared = preparePreview(code);
    return /<head[\s>]/i.test(prepared) ? prepared.replace(/<head[^>]*>/i, (match) => `${match}${tag}`) : `${tag}${prepared}`;
}
function inspectPage(code, signal) {
    return new Promise((resolve) => {
        if (signal?.aborted) { resolve([]); return; }
        const token = Math.random().toString(36).slice(2);
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.setAttribute('aria-hidden', 'true');
        frame.tabIndex = -1;
        frame.style.cssText = 'position:fixed;left:0;top:0;width:1280px;height:800px;border:0;opacity:0;pointer-events:none;z-index:-1';
        const problems = [];
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            window.removeEventListener('message', onMessage);
            if (signal) signal.removeEventListener('abort', finish);
            frame.remove();
            resolve([...new Set(problems)].slice(0, 8));
        };
        const onMessage = (event) => {
            const data = event.data;
            if ((event.source && event.source !== frame.contentWindow) || !data || data.token !== token) return;
            if (data.type === 'problem') problems.push(String(data.text));
            else if (data.type === 'desktopDone') { frame.style.width = '390px'; frame.contentWindow.postMessage({ token, cmd: 'mobile' }, '*'); }
            else if (data.type === 'done') finish();
        };
        const timer = setTimeout(() => { problems.push('A página não terminou de carregar em 10 segundos (recurso travado ou loop infinito).'); finish(); }, 10000);
        window.addEventListener('message', onMessage);
        if (signal) signal.addEventListener('abort', finish, { once: true });
        frame.srcdoc = instrumentPage(code, token);
        document.body.appendChild(frame);
    });
}
function renderCheck(state) {
    const box = $('checkStatus');
    const line = document.createElement('span');
    const hasProblems = Array.isArray(state) && state.length > 0;
    if (state === 'running') { line.className = 'text-muted'; line.textContent = 'Verificação: executando a página e auditando interações em desktop e celular...'; }
    else if (!Array.isArray(state)) { line.className = 'text-muted'; line.textContent = 'Verificação: ainda não executada.'; }
    else if (!hasProblems) { line.className = 'text-success'; line.textContent = 'Verificação: layout, scripts e interações básicas sem erros detectados.'; }
    else { line.className = 'text-danger fw-semibold'; line.textContent = `Verificação: ${state.length} problema(s) detectado(s)`; }
    box.replaceChildren(line);
    if (hasProblems) {
        const list = document.createElement('ul');
        list.className = 'mb-0 mt-1 ps-3 text-muted fw-normal';
        state.slice(0, 5).forEach((text) => { const item = document.createElement('li'); item.textContent = text; list.appendChild(item); });
        box.appendChild(list);
    }
    $('btnCorrigir').classList.toggle('d-none', !hasProblems);
}
// Verificação simples roda em segundo plano (não trava a tela e é cancelada se outra ação começar)
async function inspectInBackground() {
    checkController?.abort();
    const controller = new AbortController();
    checkController = controller;
    const code = currentCode();
    renderCheck('running');
    const problems = await inspectPage(code, controller.signal);
    if (checkController === controller) checkController = null;
    else if (checkController) return;
    if (controller.signal.aborted || currentCode() !== code) { if (!busy) renderCheck(); return; }
    renderCheck(problems);
}
async function runCheck({ fix = false } = {}) {
    if (!currentCode() || busy) return;
    if (!fix) { await inspectInBackground(); return; }
    await withBusy('Verificando a página...', async (signal) => {
        renderCheck('running');
        let problems = await inspectPage(currentCode(), signal);
        if (signal.aborted) { renderCheck(); restoreStatus(); return; }
        renderCheck(problems);
        if (problems.length) {
            for (let round = 1; round <= 2 && problems.length; round++) {
                setStatus('', `Corrigindo automaticamente (tentativa ${round}/2)...`);
                const ok = await runPatch(`autocorrecao-${round}`, 'correção automática', buildFixRequest(problems), null, { inside: true, signal, system: FIX_SYSTEM, silent: true });
                if (!ok) break;
                renderCheck('running');
                const after = await inspectPage(currentCode(), signal);
                if (signal.aborted) break;
                if (after.length >= problems.length) {
                    undoImprovement({ silent: true });
                    renderCheck(problems);
                    showToast('A correção automática não reduziu os problemas; mantive a versão anterior.', 'warning');
                    break;
                }
                problems = after;
                renderCheck(problems);
            }
            if (!problems.length) showToast('Página corrigida: nenhum erro detectado ao executar.', 'success');
            else if (!signal.aborted) showToast(`Ainda restam ${problems.length} problema(s). Veja a lista abaixo do código ou use "Pedir algo específico".`, 'warning');
        }
        restoreStatus();
    });
}
function parsePatch(text) {
    const clean = String(text).replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^```[\w-]*[ \t]*$/gm, '');
    const parts = clean.split(/^@@(CSS|JS|HEAD|BODY_END|FIND|REPLACE|END)[ \t]*$/m);
    const patch = { css: '', js: '', head: '', bodyEnd: '', edits: [] };
    let find = null;
    for (let i = 1; i < parts.length; i += 2) {
        const name = parts[i], body = (parts[i + 1] || '').trim();
        if (name === 'CSS') patch.css += `${body}\n`;
        else if (name === 'JS') patch.js += `${body}\n`;
        else if (name === 'HEAD') patch.head += `${body}\n`;
        else if (name === 'BODY_END') patch.bodyEnd += `${body}\n`;
        else if (name === 'FIND') find = body;
        else if (name === 'REPLACE' && find) { patch.edits.push({ find, replace: body }); find = null; }
    }
    return patch;
}
function structureOf(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return { ids: new Set([...doc.querySelectorAll('[id]')].map((el) => el.id)), count: doc.body ? doc.body.querySelectorAll('*').length : 0 };
}
function applyPatch(html, patch, id) {
    const notes = [], summary = [];
    const noSri = (t) => t.replace(/\s+integrity\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, '');
    let out = html.replace(new RegExp('<(style|script)[^>]*data-patch="' + id + '"[^>]*>[\\s\\S]*?<\\/\\1>', 'gi'), '');
    let changed = false;

    // a) edições pontuais (só se o trecho existir UMA vez) e validadas contra perda de estrutura
    let edited = out, appliedEdits = 0;
    patch.edits.forEach(({ find, replace }) => {
        const first = edited.indexOf(find);
        if (!find || first === -1 || edited.indexOf(find, first + 1) !== -1) { notes.push('uma edição pontual foi ignorada'); return; }
        edited = edited.slice(0, first) + noSri(replace) + edited.slice(first + find.length); appliedEdits++;
    });
    if (appliedEdits) {
        const before = structureOf(out), after = structureOf(edited);
        const lostId = [...before.ids].some((x) => !after.ids.has(x));
        if (lostId || after.count < before.count * 0.95) notes.push('edições pontuais descartadas por risco de quebrar a página');
        else { out = edited; changed = true; summary.push(`${appliedEdits} edição(ões) no HTML`); }
    }
    // b) CSS novo: no fim do <head>, para vencer o CSS existente
    if (patch.css.trim() && /<\/head>/i.test(out)) {
        out = out.replace(/<\/head>/i, () => `<style data-patch="${id}">\n${patch.css.trim()}\n</style>\n</head>`); changed = true; summary.push('CSS');
    }
    if (patch.head.trim() && /<\/head>/i.test(out)) {
        out = out.replace(/<\/head>/i, () => `${noSri(patch.head.trim())}\n</head>`); changed = true; summary.push('tags no head');
    }
    // c) HTML novo + JS novo: antes do fim do <body>. O JS é checado (compilado, sem executar) antes de entrar
    let js = patch.js.trim();
    if (js) {
        try { new Function(js); } catch (error) { notes.push(`o JavaScript foi descartado por erro de sintaxe (${error.message})`); js = ''; }
    }
    const tail = (patch.bodyEnd.trim() ? `${noSri(patch.bodyEnd.trim())}\n` : '') + (js ? `<script data-patch="${id}">\ntry {\n${js}\n} catch (error) { console.error('Melhoria ${id}:', error); }\n${SCRIPT_CLOSE}\n` : '');
    if (tail) {
        out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, () => `${tail}</body>`) : `${out}\n${tail}`; changed = true;
        if (patch.bodyEnd.trim()) summary.push('HTML novo');
        if (js) summary.push(`JavaScript (${js.split("\n").length} linha(s))`);
    }
    return { html: out, changed, notes, summary };
}
let customCounter = 0;
async function runPatch(id, title, request, checkId = null, options = {}) {
    const base = currentCode();
    if (!base) { showToast('Gere uma página antes de aplicar melhorias.', 'warning'); return false; }
    const local = id === 'performance';
    if (!local && !$('apiKey').value.trim()) { showToast('Salve uma chave API antes de aplicar melhorias.', 'warning'); return false; }
    const work = async (signal) => {
        try {
            let result;
            if (local) result = applyPerformance(base);
            else {
                const choice = await callAI(options.system || PATCH_SYSTEM, `HTML ATUAL:\n<<<HTML\n${base}\nHTML>>>\n\nPEDIDO: ${request}`, 0.1, signal);
                if (choice.finish_reason === 'length') throw new Error('A resposta da IA foi cortada. Tente novamente ou simplifique o pedido.');
                result = applyPatch(base, parsePatch(choice.message.content), id);
            }
            if (!result.changed) throw new Error(local ? 'Não há imagens ou iframes para otimizar.' : (result.notes[0] ? `Nada foi aplicado: ${result.notes[0]}.` : 'A IA não retornou alterações aplicáveis. Tente reformular o pedido.'));
            patchHistory.push({ code: base, id });
            setEditorCode(result.html);
            updateUndo();
            showImprovementSuggestions(result.html);
            saveSession();
            // Só conta como aplicada se o código realmente passa na auditoria dessa melhoria
            const done = !checkId || !isMissing(checkId, result.html);
            const what = result.summary.length ? ` (${result.summary.join(', ')})` : '';
            if (!options.inside) setStatus('online', 'IA funcionando');
            if (!done) showToast(`Aplicado parcialmente${what}: a IA não completou "${title}". A sugestão continua na lista; tente de novo.`, 'warning');
            else if (!options.silent) showToast(result.notes.length ? `Aplicado com ressalvas${what}: ${result.notes.join('; ')}.` : `Aplicado: ${title}${what}.`, result.notes.length ? 'warning' : 'success');
            return true;
        } catch (error) {
            if (error instanceof CancelError) { restoreStatus(); showToast('Operação cancelada.', 'secondary'); }
            else { setStatus('offline', 'Falha ao aplicar melhoria'); showToast(error.message, 'danger'); }
            return false;
        }
    };
    return options.inside ? work(options.signal) : withBusy(`Aplicando: ${title}...`, work);
}
async function applyImprovement(id) {
    const suggestion = improvementSuggestions.find((item) => item.id === id);
    if (suggestion && await runPatch(suggestion.id, suggestion.title, `${suggestion.title}. ${suggestion.text}`, suggestion.id)) runCheck();
}
async function applyCustomRequest() {
    const text = $('pedidoExtra').value.trim();
    if (!text) { showToast('Descreva o que você quer adicionar ou melhorar.', 'warning'); return; }
    if (await runPatch(`pedido-${++customCounter}`, 'seu pedido', text)) { $('pedidoExtra').value = ''; runCheck(); }
}
// ===== Importar código existente =====
function prepareImportedCode(raw) {
    let code = String(raw || '').trim();
    const fence = code.match(/^```[\w-]*[ \t]*\r?\n([\s\S]*?)\r?\n?```\s*$/);
    if (fence) code = fence[1].trim();
    if (!/<html[\s>]/i.test(code)) {
        return `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Página importada</title>\n</head>\n<body>\n${code}\n</body>\n</html>`;
    }
    return /<!doctype/i.test(code) ? code : `<!DOCTYPE html>\n${code}`;
}
function inlineLocalAssets(html, assets) {
    const usedNames = new Set();
    const nameOf = (path) => path.split(/[?#]/)[0].split('/').pop().toLowerCase();
    const isRemote = (url) => /^(?:https?:)?\/\//i.test(url);
    let out = html.replace(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi, (tag, href) => {
        const name = nameOf(href);
        if (!/stylesheet/i.test(tag) || isRemote(href) || !assets.has(name)) return tag;
        usedNames.add(name);
        return `<style>\n${assets.get(name)}\n</style>`;
    });
    out = out.replace(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi, (tag, src) => {
        const name = nameOf(src);
        if (isRemote(src) || !assets.has(name)) return tag;
        usedNames.add(name);
        return `<script>\n${assets.get(name).replace(/<\/script/gi, '<\\/script')}\n${SCRIPT_CLOSE}`;
    });
    return { html: out, usedNames };
}
async function readImportFiles(files) {
    const assets = new Map();
    let main = '', mainName = '';
    for (const file of files) {
        const name = file.name.toLowerCase(), text = await file.text();
        if (/\.(?:html?|txt)$/.test(name) && !main) { main = text; mainName = file.name; }
        else if (/\.(?:css|js)$/.test(name)) assets.set(name, text);
    }
    if (!main) throw new Error('Escolha pelo menos um arquivo .html.');
    const { html, usedNames } = inlineLocalAssets(main, assets);
    return { html, mainName, used: usedNames.size, ignored: assets.size - usedNames.size };
}
function loadImportedCode() {
    const raw = $('codigoImport').value;
    if (!raw.trim()) { showToast('Cole um código ou escolha um arquivo antes de carregar.', 'warning'); return; }
    const code = prepareImportedCode(raw);
    const previous = currentCode();
    if (previous) patchHistory.push({ code: previous, id: 'importação' });
    setEditorCode(code);
    codeImported = true;
    setButtons(true);
    updateUndo();
    showImprovementSuggestions(code);
    bootstrap.Modal.getOrCreateInstance($('importModal')).hide();
    const big = code.length > 60000 ? ' Código grande: a Groq pode recusar por limite de tokens.' : '';
    showToast(`Código carregado (${code.length.toLocaleString('pt-BR')} caracteres). Use as sugestões ou peça algo específico.${big}`, big ? 'warning' : 'success');
    const panel = $('melhoriasPanel');
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    saveSession();
    runCheck();
}
function undoImprovement(options = {}) {
    const last = patchHistory.pop();
    if (!last) return;
    setEditorCode(last.code);
    updateUndo();
    showImprovementSuggestions(last.code);
    saveSession();
    if (!options.silent) { showToast('Última melhoria desfeita.', 'info'); runCheck(); }
}
function updatePreview() {
    const code = getEditorCode().trim();
    if (!code || code.startsWith('Erro:')) {
        showToast('Gere uma página antes de abrir o Go Live.', 'warning');
        return false;
    }
    $('previewFrame').srcdoc = preparePreview(code);
    return true;
}
// Montado em partes de propósito: a tag de fechamento do script escrita por inteiro aqui dentro encerraria o bloco da página.
const SCRIPT_CLOSE = '<' + '/script>';
const REPEAT_LOOP = /(.{1,12}?)\1{25,}/gs;
function hasStyling(code) {
    return /<style[\s>]/i.test(code) || /<link[^>]+stylesheet/i.test(code) || /cdn\.tailwindcss\.com/i.test(code);
}
function normalizeGeneratedCode(content) {
    let raw = String(content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    raw = raw.replace(REPEAT_LOOP, '$1'); // loop de repetição da IA (ex.: "5e5e5e5e...")
    let html = '';
    const css = [], js = [];

    // 1) Separa blocos ```html / ```css / ```js (a IA às vezes devolve o CSS num bloco à parte)
    const blocks = [...raw.matchAll(/```([\w+-]*)[^\S\r\n]*\r?\n([\s\S]*?)(?:```|$)/g)]
        .map((m) => ({ lang: m[1].toLowerCase(), body: m[2].trim() }))
        .filter((b) => b.body);
    if (blocks.length) {
        blocks.forEach((b) => {
            if (b.lang === 'css') css.push(b.body);
            else if (b.lang === 'js' || b.lang === 'javascript') js.push(b.body);
            else if (['', 'html', 'htm', 'xml'].includes(b.lang) && b.body.length > html.length) html = b.body;
        });
    } else {
        html = raw.replace(/^```[\w-]*\s*/, '').replace(/\s*```$/, '').trim();
    }

    // 2) Remove texto solto antes/depois do documento
    const first = html.search(/<!doctype|<html[\s>]/i);
    if (first > 0) html = html.slice(first);
    const last = html.search(/<\/html\s*>/i);
    if (last !== -1) html = html.slice(0, last) + '</html>';

    // 2b) Remove SRI inventado pela IA: um hash falso em integrity faz o navegador BLOQUEAR o CSS/JS
    html = html.replace(/\s+integrity\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
               .replace(/\s+integrity\s*=\s*["'][^"']*$/i, '')
               .replace(/\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, '');
    // Resposta cortada no meio de uma tag: descarta a tag incompleta e fecha o documento
    if (html.lastIndexOf('<') > html.lastIndexOf('>')) html = html.slice(0, html.lastIndexOf('<'));
    if (/<html[\s>]/i.test(html) && !/<\/html>/i.test(html)) html += (/<\/body>/i.test(html) ? '' : '\n</body>') + '\n</html>';

    // 3) Garante a estrutura completa (html > head + body)
    const metas = '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    if (!/<html[\s>]/i.test(html)) {
        html = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n${metas}\n<title>Página gerada</title>\n</head>\n<body>\n${html.replace(/<!doctype[^>]*>/i, '')}\n</body>\n</html>`;
    } else {
        if (!/<!doctype/i.test(html)) html = `<!DOCTYPE html>\n${html}`;
        if (!/<head[\s>]/i.test(html)) html = html.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${metas}</head>`);
    }

    // Obs.: usar função no replace evita que "$&", "$'" etc. do CSS/JS sejam interpretados
    const intoHead = (tag, atStart) => {
        html = atStart ? html.replace(/<head[^>]*>/i, (m) => `${m}\n${tag}`) : html.replace(/<\/head>/i, () => `${tag}\n</head>`);
    };
    const intoBodyEnd = (tag) => {
        html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => `${tag}\n</body>`) : html.replace(/<\/html>/i, () => `${tag}\n</html>`);
    };

    // 4) Reaplica o CSS que veio separado (no fim do <head>, para sobrescrever o Bootstrap)
    if (css.length) intoHead(`<style>\n${css.join('\n\n')}\n</style>`, false);

    // 5) Reaplica o JS que veio separado
    if (js.length) intoBodyEnd(`<script>\n${js.join('\n\n')}\n${SCRIPT_CLOSE}`);

    // 6) Injeta bibliotecas que a página usa mas esqueceu de carregar
    const usesBootstrap = /class(?:Name)?\s*=\s*["'][^"']*\b(?:container(?:-fluid)?|row|col(?:-[a-z0-9]+)*|navbar|btn|card|d-flex|d-grid|form-control|form-select|table|alert|badge|modal|carousel|accordion|list-group|nav-link|hero|bg-(?:primary|dark|light|secondary|success)|text-(?:center|muted|white)|[mp][btxy]?-\d)\b/i.test(html);
    if (/\bbi bi-[a-z]/i.test(html) && !/bootstrap-icons/i.test(html)) {
        intoHead('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">', true);
    }
    if (usesBootstrap && !/bootstrap(?!-icons)[^"'>\s]*\.css/i.test(html) && !/cdn\.tailwindcss\.com/i.test(html)) {
        intoHead('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">', true);
    }
    if (/data-bs-/i.test(html) && !/bootstrap[^"'>\s]*\.js/i.test(html)) {
        intoBodyEnd('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js">' + SCRIPT_CLOSE);
    }
    return html;
}
function preparePreview(code) {
    // O iframe é sandbox (sem allow-same-origin) e bloqueia localStorage/sessionStorage:
    // este shim evita que o JS da página gerada quebre por causa disso.
    const shim = '<script>(function(){["localStorage","sessionStorage"].forEach(function(n){try{window[n].getItem("x")}catch(e){var m={};try{Object.defineProperty(window,n,{configurable:true,value:{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}}}})}catch(_){}}})})();' + SCRIPT_CLOSE;
    // Sem <base href>: ele fazia links "#secao" navegarem para o próprio app dentro do iframe.
    return /<head[\s>]/i.test(code) ? code.replace(/<head[^>]*>/i, (m) => `${m}${shim}`) : `${shim}${code}`;
}
function saveConfig(showMessage = true) {
    localStorage.setItem(configKey, JSON.stringify({ apiKey: $('apiKey').value.trim(), provedor: currentProvider(), modelo: $('modelo').value, detalhado: $('modoDetalhado').checked, autoCorrigir: $('autoCorrigir').checked }));
    if (showMessage) {
        $('configFeedback').innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Configuração salva agora.</span>';
        showToast('Configuração salva com sucesso.');
    }
}
function loadConfig() {
    try {
        const config = JSON.parse(localStorage.getItem(configKey) || '{}');
        $('apiKey').value = config.apiKey || '';
        if (config.provedor === 'gemini' || config.provedor === 'groq') $('provedor').value = config.provedor;
        syncProviderUI();
        if (config.modelo && [...$('modelo').options].some((option) => option.value === config.modelo)) $('modelo').value = config.modelo;
        if (typeof config.detalhado === 'boolean') $('modoDetalhado').checked = config.detalhado;
        if (typeof config.autoCorrigir === 'boolean') $('autoCorrigir').checked = config.autoCorrigir;
        setStatus(config.apiKey ? 'online' : '', config.apiKey ? 'IA configurada' : 'IA não configurada');
    } catch (error) {
        $('configFeedback').innerHTML = '<span class="text-danger">Não foi possível carregar a configuração salva.</span>';
    }
}
async function testConnection() {
    const key = $('apiKey').value.trim();
    if (!key) { setStatus('offline', 'Informe sua chave API'); $('configFeedback').innerHTML = '<span class="text-danger">Informe a chave antes de testar.</span>'; return; }
    $('btnTestar').disabled = true;
    setStatus('', 'Testando conexao...');
    try {
        const response = currentProvider() === 'gemini'
            ? await fetch(`${geminiApiUrl}?key=${encodeURIComponent(key)}`)
            : await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            throw new Error(currentProvider() === 'gemini' ? (details.error?.message || `Erro da API Gemini (${response.status}).`) : friendlyHttpError(response.status));
        }
        setStatus('online', `${currentProvider() === 'gemini' ? 'Gemini' : 'Groq'} funcionando`);
        $('configFeedback').innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Conexao verificada com sucesso.</span>';
        showToast('A IA esta funcionando e pronta para gerar.');
    } catch (error) {
        setStatus('offline', 'IA indisponivel');
        $('configFeedback').replaceChildren(Object.assign(document.createElement('span'), { className: 'text-danger', textContent: error.message }));
        showToast(error.message, 'danger');
    } finally { $('btnTestar').disabled = false; }
}
async function generate() {
    const apiKey = $('apiKey').value.trim();
    const userText = $('promptUsuario').value.trim();
    const prompt = `${userText}

Entregue uma interface com nível de acabamento de produto real, não um wireframe genérico. Tome decisões visuais coerentes com o negócio: crie uma hierarquia clara, uma seção inicial forte, espaçamento consistente, contraste adequado, conteúdo verossímil e estados de interação úteis. Varie a composição entre seções e use cards, métricas, badges, filtros, depoimentos, etapas, tabelas ou chamadas para ação somente quando fizerem sentido para o pedido. Evite lorem ipsum, excesso de gradientes, blocos repetitivos, estilos genéricos e elementos decorativos sem função.

Direção visual obrigatória: crie um design system pequeno usando variáveis CSS para cores, superfícies, texto, bordas, sombras, raios e espaçamento. Prefira uma paleta sofisticada e contida, com uma cor de marca, um acento e neutros bem definidos; use bastante espaço em branco, tipografia com escala clara e no máximo dois estilos de destaque. Cada seção deve ter uma função e uma hierarquia evidente. O resultado deve parecer uma página profissional de portfólio, produto, empresa ou loja — nunca um template genérico.

Requisitos técnicos obrigatórios: entregue UM ÚNICO documento HTML completo (<!DOCTYPE html>), com Bootstrap 5 por CDN, CSS personalizado em <style> dentro do <head> e JavaScript funcional em <script> antes de </body>. Use o sistema de grid, containers, breakpoints, utilities e componentes do Bootstrap 5 de forma consistente, sem depender apenas de divs com estilos improvisados. Use imagens reais de fontes públicas estáveis, sempre com alt descritivo; inclua estados de hover, foco, vazio, carregamento ou validação quando aplicável; faça o layout funcionar bem em celular, tablet e desktop; use apenas componentes e interações que possam funcionar sem backend. Tudo deve estar no mesmo arquivo, sem Markdown, crases ou explicações fora do HTML.

Funcionalidade obrigatória: implemente de verdade a navegação entre seções, menu mobile, botões, links, formulários, filtros, busca, tabs, accordions, modais, carousels e demais controles solicitados. Todo link deve ter destino válido ou ação; todo botão deve produzir uma mudança visível ou abrir um componente; formulários devem validar e mostrar feedback; recursos que exigiriam backend devem usar dados locais de demonstração e deixar claro o estado resultante. Teste mentalmente cada interação e não entregue controles decorativos.`;
    if (!apiKey || !userText) { showToast(!apiKey ? 'Salve uma chave API antes de gerar.' : 'Descreva o que deseja criar.', 'warning'); return; }
    if (currentCode() && (codeImported || patchHistory.length) && !window.confirm('Gerar uma página nova vai substituir o código atual (importado ou já melhorado). Continuar?')) return;
    const previous = currentCode();
    const accessibility = `Use HTML semântico com landmarks, títulos em ordem, labels associados, foco de teclado visível, aria apenas quando necessário, alt descritivo e contraste legível. Inclua links externos necessários, responsividade, imagens e JavaScript funcional. Não retorne CSS separado, Markdown ou crases. ${$('modoDetalhado').checked ? 'Escreva textos naturais em português, use dados de exemplo convincentes e implemente microinterações acessíveis com addEventListener.' : ''}`;
    let created = false;
    await withBusy('Gerando código...', async (signal) => {
        if (!previous) { setEditorCode('A inteligência artificial está escrevendo seu código...'); setButtons(false); }
        try {
            const system = `Você é um designer de produto e engenheiro front-end sênior, especialista em Bootstrap 5. Sua prioridade é entregar uma página sofisticada, minimalista, específica para o pedido e pronta para apresentação, com aparência intencional e acabamento visual consistente — não apenas uma coleção de componentes.

Retorne APENAS um único documento HTML completo. Antes de escrever, interprete o negócio, o público e o objetivo descritos pelo usuário e escolha uma linguagem visual própria para esse contexto. O documento deve ter uma direção visual clara: escolha uma paleta premium com cor primária, cor de destaque e superfícies coerentes; combine tipografia, escala, espaçamento, bordas, sombras e estados de interação; crie uma composição com ritmo visual e boa hierarquia; use conteúdo realista relacionado ao contexto. Prefira CSS customizado bem organizado com variáveis de design em vez de depender somente das classes padrão do Bootstrap. Inclua microinterações discretas e JavaScript funcional para os controles que existirem, sem inventar backend.

Estrutura: use uma navbar adequada, uma primeira seção que comunique valor rapidamente, seções com propósito claro e uma chamada para ação coerente. A quantidade e o tipo de seções devem ser decididos pelo pedido; não force o mesmo template em todos os casos. Use o grid do Bootstrap com containers responsivos, colunas que colapsem nos breakpoints corretos, utilities de espaçamento e componentes como navbar, buttons, cards, badges, alerts, forms, modal, accordion, tabs ou carousel somente quando agregarem valor. Combine componentes com CSS próprio para não produzir o visual padrão do Bootstrap. Sidebar deve ser coluna do layout ou position-sticky, nunca position-fixed sobreposta à navbar. Não use larguras fixas em px, não crie rolagem horizontal e não use texto de preenchimento.

Funcionalidade é obrigatória, não opcional: todo link deve ter destino real ou uma ação implementada; links de navegação interna devem apontar para ids existentes; o menu mobile deve abrir e fechar; dropdowns, modais, tabs, accordions e carousels devem usar alvos válidos e funcionar; botões devem executar uma ação visível ou ser links; formulários devem validar, impedir envio inválido e mostrar feedback de sucesso/erro acessível; filtros, busca, ordenação, contadores, favoritos, adicionar ao carrinho, copiar, newsletter e outros controles pedidos devem atualizar a interface com dados de demonstração locais, sem simular uma API inexistente. Não crie elementos interativos apenas decorativos. Use addEventListener e inicialização segura após o DOM carregar, evitando erros quando um elemento opcional não existir.

Qualidade e compatibilidade: use HTML semântico, acessibilidade, imagens com alt, layout responsivo e estados de hover/foco. Garanta que botões, links, formulários, menus e componentes interativos tenham estados visuais completos e funcionem no teclado. Use atributos data-bs-* e a API do Bootstrap para componentes interativos quando apropriado, com JavaScript complementar apenas onde necessário. Gráficos (Chart.js) devem ficar dentro de uma div com style=\"position:relative;height:320px;max-width:100%\", com responsive:true e maintainAspectRatio:false. Use versões fixas nos CDNs. Nunca use os atributos integrity ou crossorigin nos links e scripts de CDN. Não use dependências além das necessárias.

Checklist antes de responder: confirme que existe um objetivo claro acima da dobra; que a ordem das seções conta uma narrativa; que há uma ação principal evidente; que os textos não são genéricos; que a paleta tem contraste; que o mobile não quebra; que os componentes interativos funcionam; que não há CSS ou JavaScript separado; e que o documento pode ser salvo como .html e aberto diretamente no navegador. Não retorne Markdown, crases, explicações, CSS separado ou JavaScript separado. ${accessibility}`;
            const broken = (r) => r.finish_reason === 'length' || new RegExp(REPEAT_LOOP.source, 's').test(r.message.content);
            let choice = await callAI(system, prompt, 0.35, signal);
            if (broken(choice)) {
                setStatus('', 'Resposta com defeito, tentando de novo...');
                choice = await callAI(`${system} NÃO use os atributos integrity nem crossorigin em nenhuma tag. Seja conciso (até ~250 linhas) e nunca repita texto.`, prompt, 0.5, signal);
            }
            const code = normalizeGeneratedCode(choice.message.content);
            setEditorCode(code); patchHistory = []; codeImported = false; updateUndo(); setButtons(true); showImprovementSuggestions(code); setStatus('online', 'IA funcionando'); saveSession(); created = true;
            if (broken(choice)) showToast('A resposta veio incompleta. Tente um pedido mais simples ou outro modelo.', 'warning');
            else if (!hasStyling(code)) showToast('A IA não retornou CSS. Clique em Gerar código novamente.', 'warning');
            else showToast('Código gerado com CSS e JavaScript incluídos.');
        } catch (error) {
            const cancelled = error instanceof CancelError;
            if (!previous) setEditorCode(cancelled ? '' : `Erro: ${error.message}`);
            if (cancelled) { restoreStatus(); showToast('Geração cancelada.', 'secondary'); }
            else { setStatus('offline', 'Falha na geração'); showToast(error.message, 'danger'); }
        }
    });
    if (created) runCheck({ fix: $('autoCorrigir').checked });
}
$('btnSalvar').addEventListener('click', () => { saveConfig(); setStatus($('apiKey').value.trim() ? 'online' : 'offline', $('apiKey').value.trim() ? 'IA configurada' : 'IA não configurada'); });
$('provedor').addEventListener('change', () => { syncProviderUI(); saveConfig(false); });
$('btnTestar').addEventListener('click', testConnection);
$('btnGerar').addEventListener('click', generate);
$('btnMostrarChave').addEventListener('click', () => { const input = $('apiKey'); input.type = input.type === 'password' ? 'text' : 'password'; $('btnMostrarChave').querySelector('i').className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'; });
$('promptUsuario').addEventListener('input', () => $('contador').textContent = `${$('promptUsuario').value.length} caracteres`);
$('promptUsuario').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') generate(); });
document.querySelectorAll('.prompt-example').forEach((button) => button.addEventListener('click', () => { $('promptUsuario').value = button.dataset.prompt; $('promptUsuario').dispatchEvent(new Event('input')); $('promptUsuario').focus(); }));
$('btnCopiar').addEventListener('click', async () => { await navigator.clipboard.writeText(getEditorCode()); showToast('Código copiado para a área de transferência.'); });
function openLivePreview() {
    if (updatePreview()) bootstrap.Modal.getOrCreateInstance($('liveModal')).show();
}
$('btnGoLive').addEventListener('click', openLivePreview);
$('btnGoLiveTopo').addEventListener('click', openLivePreview);
$('btnAtualizarPreview').addEventListener('click', () => { if (updatePreview()) showToast('Pré-visualização atualizada.'); });
$('btnAbrirPreview').addEventListener('click', () => {
    const code = getEditorCode().trim();
    if (!code || code.startsWith('Erro:')) { showToast('Gere uma página antes de abrir o Go Live.', 'warning'); return; }
    const previewWindow = window.open();
    if (!previewWindow) { showToast('Permita pop-ups para abrir a pré-visualização.', 'warning'); return; }
    previewWindow.document.open();
    previewWindow.document.write(preparePreview(code));
    previewWindow.document.close();
});
$('btnBaixar').addEventListener('click', () => { const blob = new Blob([getEditorCode()], { type: 'text/html;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'pagina-gerada.html'; link.click(); URL.revokeObjectURL(link.href); showToast('Arquivo HTML baixado.'); });
$('btnDesfazer').addEventListener('click', () => undoImprovement());
$('btnCancelar').addEventListener('click', () => abortController?.abort());
$('btnVerificar').addEventListener('click', () => { if (!currentCode()) { showToast('Gere ou importe uma página antes de verificar.', 'warning'); return; } runCheck(); });
$('btnCorrigir').addEventListener('click', () => runCheck({ fix: true }));
$('btnLimpar').addEventListener('click', clearSession);
$('autoCorrigir').addEventListener('change', () => saveConfig(false));
$('promptUsuario').addEventListener('input', scheduleSave);
window.addEventListener('pagehide', saveSession);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSession(); });
$('btnImportar').addEventListener('click', () => bootstrap.Modal.getOrCreateInstance($('importModal')).show());
$('btnCarregarImport').addEventListener('click', loadImportedCode);
$('codigoImport').addEventListener('input', () => { $('importContador').textContent = `${$('codigoImport').value.length.toLocaleString('pt-BR')} caracteres`; });
$('arquivoImport').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    try {
        const result = await readImportFiles(files);
        $('codigoImport').value = result.html;
        $('codigoImport').dispatchEvent(new Event('input'));
        $('importInfo').textContent = `${result.mainName}${result.used ? ` + ${result.used} arquivo(s) CSS/JS embutido(s)` : ''}${result.ignored ? ` (${result.ignored} CSS/JS não referenciado(s) no HTML foi(ram) ignorado(s))` : ''}.`;
    } catch (error) { $('importInfo').textContent = error.message; showToast(error.message, 'warning'); }
});
$('btnAplicarPedido').addEventListener('click', applyCustomRequest);
$('pedidoExtra').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') applyCustomRequest(); });
$('btnTema').addEventListener('click', () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('bootstrap-ai-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); });
if (localStorage.getItem('bootstrap-ai-theme') === 'dark') document.body.classList.add('dark-mode');
initializeCodeEditor();
syncProviderUI();
loadConfig();
restoreSession();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
