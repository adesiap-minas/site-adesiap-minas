const SUPABASE_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

const TIPO_LABELS = {
    contato:              'Fale Conosco',
    fornecedores:         'Cadastro de Fornecedor',
    ouvidoria_reclamacao: 'Ouvidoria — Reclamação',
    ouvidoria_sugestao:   'Ouvidoria — Sugestão',
    ouvidoria_elogio:     'Ouvidoria — Elogio',
    denuncias:            'Canal de Denúncias',
    candidaturas:         'Trabalhe Conosco',
};

const FIELD_LABELS = {
    nome: 'Nome', email: 'E-mail', telefone: 'Telefone', empresa: 'Empresa',
    assunto: 'Assunto', mensagem: 'Mensagem', area: 'Área', nivel: 'Nível',
    escolaridade: 'Escolaridade', disponibilidade: 'Disponibilidade',
    linkedin: 'LinkedIn', carta: 'Carta de Apresentação',
    identificacao: 'Identificação', natureza: 'Natureza', descricao: 'Descrição',
    referencia: 'Referência', razaoSocial: 'Razão Social', nomeFantasia: 'Nome Fantasia',
    cnpj: 'CNPJ', inscricaoEstadual: 'Inscrição Estadual',
    tipoFornecimento: 'Tipo de Fornecimento', categoria: 'Categoria',
    cep: 'CEP', cidade: 'Cidade', uf: 'UF', logradouro: 'Logradouro',
    bairro: 'Bairro', contatoNome: 'Contato — Nome', contatoCargo: 'Contato — Cargo',
    contatoEmail: 'Contato — E-mail', contatoTelefone: 'Contato — Telefone',
    website: 'Website',
};

function labelFor(key) {
    return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
}

function buildEmail(tipo, dados, protocolo) {
    const label = TIPO_LABELS[tipo] || tipo;
    const subject = `[${label}] ${protocolo} — ADESIAP Minas`;

    const rows = Object.entries(dados)
        .filter(([k, v]) => !k.startsWith('_') && v && String(v).trim())
        .map(([k, v]) => `
            <tr>
                <td style="padding:9px 14px;background:#f8fafc;font-weight:600;font-size:13px;color:#374151;width:36%;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${labelFor(k)}</td>
                <td style="padding:9px 14px;font-size:13px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${String(v).replace(/\n/g, '<br>')}</td>
            </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f0f4f8;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);">
    <div style="background:#12395D;padding:28px 32px 24px;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,.6);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">ADESIAP Minas — Formulário do Site</p>
      <h1 style="margin:0 0 8px;color:#fff;font-size:21px;font-weight:700;">${label}</h1>
      <p style="margin:0;color:rgba(255,255,255,.55);font-size:12px;">Protocolo: <strong style="color:#fff;font-family:monospace;">${protocolo}</strong></p>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        ${rows || '<tr><td style="padding:12px;color:#9ca3af;">Nenhum dado informado</td></tr>'}
      </table>
      <p style="margin:22px 0 0;font-size:11px;color:#9ca3af;text-align:right;">
        Enviado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      </p>
    </div>
  </div>
</body>
</html>`;

    return { subject, html };
}

// Desativa o body parser automático do Vercel para garantir acesso ao stream
// Necessário para corpos grandes (CVs em base64)
const handlerConfig = { api: { bodyParser: false } };

// Lê body como Buffer para suportar payloads grandes com segurança
async function parseBody(req) {
    return new Promise((resolve) => {
        const chunks = [];
        req.on('data', chunk => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                console.error('JSON parse error:', e.message);
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY não definida');
        return res.status(500).json({ error: 'RESEND_API_KEY não configurada no servidor' });
    }

    try {
        const body = await parseBody(req);
        const { tipo, dados = {}, protocolo = '' } = body;

        console.log('Recebido tipo:', tipo, '| protocolo:', protocolo);
        console.log('CV presente:', !!dados._curriculo, '| tamanho base64:', dados._curriculo?.length || 0);

        // Lê roteamento do Supabase
        const cfgRes = await fetch(
            `${SUPABASE_URL}/rest/v1/configuracoes?grupo=in.(email,routing)&select=chave,valor`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const cfgRows = await cfgRes.json();
        const cfg = {};
        if (Array.isArray(cfgRows)) cfgRows.forEach(r => { cfg[r.chave] = r.valor; });

        const destMap = {
            contato:              cfg.email_contato,
            fornecedores:         cfg.email_fornecedores,
            ouvidoria_reclamacao: cfg.email_ouvidoria_reclamacao,
            ouvidoria_sugestao:   cfg.email_ouvidoria_sugestao,
            ouvidoria_elogio:     cfg.email_ouvidoria_elogio,
            denuncias:            cfg.email_denuncias,
            candidaturas:         cfg.email_candidaturas,
        };

        const to = destMap[tipo] || cfg.email_destino || 'comercial@adesiap.org.br';
        const fromName = cfg.email_remetente || 'ADESIAP Minas';
        const from = process.env.RESEND_FROM || `${fromName} <onboarding@resend.dev>`;

        console.log('Enviando de:', from, '| para:', to);

        const { subject, html } = buildEmail(tipo, dados, protocolo);

        const payload = { from, to: [to], subject, html };
        if (dados._curriculo) {
            payload.attachments = [{
                filename: dados._curriculoNome || 'curriculo.pdf',
                content: dados._curriculo,
            }];
        }

        const sendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const sendBody = await sendRes.json();

        if (!sendRes.ok) {
            console.error('Resend HTTP', sendRes.status, JSON.stringify(sendBody));
            return res.status(500).json({
                error: 'Falha no envio do e-mail',
                detalhe: sendBody?.message || sendBody?.name || JSON.stringify(sendBody),
            });
        }

        console.log('E-mail enviado. ID Resend:', sendBody.id);
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Handler error:', err);
        res.status(500).json({ error: 'Erro interno no servidor', detalhe: err.message });
    }
}

module.exports = handler;
handler.config = handlerConfig;
