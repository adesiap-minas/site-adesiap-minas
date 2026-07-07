// Modal de Política de Privacidade — ADESIAP Minas
// Abre via window.abrirPoliticaPrivacidade()
// Texto padrão embutido; pode ser sobrescrito pela chave
// "politica_privacidade" na tabela configuracoes do Supabase.
(function () {
    const SUPABASE_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

    const TEXTO_PADRAO = `<h2>Política de Privacidade</h2>
<p>A <strong>AGÊNCIA DE DESENVOLVIMENTO ECONÔMICO E SOCIAL DOS INCONFIDENTES E ALTO PARAOPEBA – ADESIAP</strong> é uma entidade de direito privado, sem fins econômicos, qualificada como Organização da Sociedade Civil de Interesse Público (OSCIP). Consolidada em Itabirito e região, a ADESIAP possui vasta experiência em consultoria e assessoria a empreendedores e empresários, diagnóstico e pesquisas, organização de eventos, gestão de termos de compromisso e ambiental, elaboração de projetos, captação de recursos e gerenciamento de programas e projetos.</p>
<p>Preza pela excelência no atendimento de seus clientes, preocupa-se com a sua privacidade e com a proteção de seus dados pessoais. Por esta razão, é muito importante para nós que você saiba como tratamos seus dados pessoais e, quando necessário de acordo com a Lei, garanta seu consentimento para o tratamento dos dados pessoais.</p>
<p>Estamos em constante atualização de nossos serviços para melhor lhe atender e, por tal motivo, sempre que necessário ou houver modificações em nossa Política de Privacidade, nos reservamos no direito de atualizá-la, sempre em conformidade com a Lei.</p>

<h3>Como seus dados são coletados</h3>
<p>Seus dados são coletados por meios físicos e digitais.</p>
<p><strong>Meios físicos:</strong> Em documentos impressos ou em procedimentos realizados em feiras, congressos, atendimentos, eventos e workshops promovidos pela ADESIAP. Independentemente de quais dados o titular fornecer, nós apenas faremos uso daqueles efetivamente relevantes e necessários para o cumprimento das finalidades declaradas.</p>
<p><strong>Meios digitais:</strong> Em consultas realizadas pelos meios eletrônicos disponíveis, nos formulários preenchidos eletronicamente, em e-mails e nos sistemas internos.</p>

<h3>Como seus dados são utilizados</h3>
<p>O tratamento dos dados pode ocorrer: mediante fornecimento de consentimento pelo titular; para cumprimento de obrigação legal ou regulatória; para a execução de contrato ou de procedimentos preliminares relacionados a contrato do qual seja parte o titular; para a proteção da vida ou da incolumidade física do titular ou de terceiro; para a tutela da saúde, exclusivamente em procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária, dentre outros.</p>

<h3>Como seus dados são protegidos</h3>
<p>A metodologia para proteção dos dados utilizada pela ADESIAP é por meio de Firewall, softwares, restrições de acesso aos sistemas, políticas de acesso, dentre outros mecanismos de segurança.</p>

<h3>Compartilhamento de dados</h3>
<p>Os dados são compartilhados somente com as áreas da ADESIAP, parceiros, terceiros, Administração Pública e outros que se fizerem necessários para a realização do atendimento aos titulares de dados.</p>

<h3>Lei Geral de Proteção de Dados (LGPD)</h3>
<p>A Lei Geral de Proteção de Dados nº 13.709/2018 estabelece diretrizes importantes para o tratamento de dados pessoais, tendo como objetivo proteger os direitos fundamentais de liberdade e de privacidade da pessoa natural.</p>

<h3>Direitos dos Titulares de Dados</h3>
<p>A LGPD garante que você tenha os seguintes direitos relacionados aos seus dados:</p>
<ul>
<li>Revogação do consentimento;</li>
<li>Acesso aos dados;</li>
<li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
<li>Confirmação da existência de tratamento;</li>
<li>Correção de dados incompletos, inexatos ou desatualizados;</li>
<li>Eliminação dos dados tratados;</li>
<li>Informação sobre a possibilidade de não fornecer consentimento;</li>
<li>Obtenção de informações sobre entidades com as quais a ADESIAP compartilhou seus dados;</li>
<li>Requisição da portabilidade de seus dados a outro fornecedor.</li>
</ul>

<h3>Órgão Regulador</h3>
<p>A <strong>ANPD (Agência Nacional de Proteção de Dados)</strong> é o órgão responsável por zelar pela proteção de dados pessoais e por fiscalizar o cumprimento da LGPD no Brasil.</p>

<h3>Encarregado de Dados (DPO)</h3>
<p>O encarregado de proteção de dados é responsável por: aceitar reclamações e comunicações dos titulares; receber comunicações da autoridade nacional; orientar os funcionários e contratados sobre práticas de proteção de dados; e executar as demais atribuições determinadas pelo controlador.</p>
<p>Tais atribuições são exercidas pela colaboradora <strong>Ana Luisa Lopes Carmo</strong>.</p>

<h3>Canais de Atendimento</h3>
<p>O titular de dados poderá entrar em contato por: <strong>E-mail:</strong> <a href="mailto:sac@adesiap.org.br">sac@adesiap.org.br</a></p>
<p style="font-size:0.82rem;color:#9ca3af;margin-top:16px;">Atualizada em 10 de dezembro de 2024.</p>`;

    window._politicaPrivacidadePadrao = TEXTO_PADRAO;

    let textoCarregado = null;

    async function carregarTexto() {
        if (textoCarregado !== null) return textoCarregado;
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/configuracoes?chave=eq.politica_privacidade&select=valor&limit=1`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const rows = await res.json();
            if (Array.isArray(rows) && rows[0]?.valor) {
                textoCarregado = rows[0].valor;
            } else {
                textoCarregado = TEXTO_PADRAO;
            }
        } catch {
            textoCarregado = TEXTO_PADRAO;
        }
        return textoCarregado;
    }

    function injetarCSS() {
        if (document.getElementById('mp-css')) return;
        const s = document.createElement('style');
        s.id = 'mp-css';
        s.textContent = `
#mp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:mp-fade .2s ease}
@keyframes mp-fade{from{opacity:0}to{opacity:1}}
#mp-dialog{background:#fff;border-radius:14px;width:100%;max-width:700px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:mp-slide .22s ease}
@keyframes mp-slide{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
#mp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:1px solid #e5e7eb;flex-shrink:0}
#mp-header h2{margin:0;font-size:1.05rem;font-weight:700;color:var(--azul-institucional,#12395D)}
#mp-close{background:none;border:none;font-size:1.5rem;line-height:1;cursor:pointer;color:#6b7280;padding:0 4px}
#mp-close:hover{color:#1f2937}
#mp-body{padding:24px;overflow-y:auto;font-size:.9rem;line-height:1.7;color:#374151}
#mp-body h2{font-size:1.1rem;color:var(--azul-institucional,#12395D);margin:0 0 14px}
#mp-body h3{font-size:.95rem;font-weight:700;color:var(--azul-institucional,#12395D);margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #f3f4f6}
#mp-body p{margin:0 0 10px}
#mp-body ul{margin:0 0 10px;padding-left:20px}
#mp-body li{margin-bottom:4px}
#mp-body a{color:var(--terracota-institucional,#B85C38)}
#mp-footer{padding:16px 24px;border-top:1px solid #e5e7eb;text-align:right;flex-shrink:0}
#mp-footer button{background:var(--terracota-institucional,#B85C38);color:#fff;border:none;border-radius:6px;padding:10px 24px;font-size:.9rem;font-weight:600;cursor:pointer}
#mp-footer button:hover{background:var(--azul-institucional,#12395D)}
`;
        document.head.appendChild(s);
    }

    window.abrirPoliticaPrivacidade = async function () {
        injetarCSS();
        const texto = await carregarTexto();

        const overlay = document.createElement('div');
        overlay.id = 'mp-overlay';
        overlay.innerHTML = `
<div id="mp-dialog" role="dialog" aria-modal="true" aria-labelledby="mp-titulo">
  <div id="mp-header">
    <h2 id="mp-titulo"><i class="fas fa-shield-alt" style="margin-right:8px;color:var(--terracota-institucional,#B85C38)"></i>Política de Privacidade</h2>
    <button id="mp-close" onclick="fecharPoliticaPrivacidade()" title="Fechar">×</button>
  </div>
  <div id="mp-body">${texto}</div>
  <div id="mp-footer">
    <button onclick="fecharPoliticaPrivacidade()">Entendi</button>
  </div>
</div>`;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        overlay.addEventListener('click', e => { if (e.target === overlay) fecharPoliticaPrivacidade(); });
        document.addEventListener('keydown', _mpEscHandler);
    };

    function _mpEscHandler(e) { if (e.key === 'Escape') fecharPoliticaPrivacidade(); }

    window.fecharPoliticaPrivacidade = function () {
        const el = document.getElementById('mp-overlay');
        if (el) el.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', _mpEscHandler);
    };
})();
