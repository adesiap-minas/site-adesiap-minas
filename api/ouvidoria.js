import { supabase, mailer, gerarProtocolo, corsHeaders, getEmailDestino } from './_lib.js';

const PREFIXOS   = { reclamacao: 'RCL', sugestao: 'SUG', elogio: 'ELG' };
const LABELS     = { reclamacao: 'Reclamação', sugestao: 'Sugestão', elogio: 'Elogio' };
const EMAIL_KEYS = { reclamacao: 'email_ouvidoria_reclamacao', sugestao: 'email_ouvidoria_sugestao', elogio: 'email_ouvidoria_elogio' };

export default async function handler(req, res) {
    const headers = corsHeaders();
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { tipo, nome, email, telefone, anonimo, mensagem } = req.body;

    if (!tipo || !mensagem) {
        return res.status(400).json({ error: 'Tipo e mensagem são obrigatórios' });
    }

    const protocolo = gerarProtocolo(PREFIXOS[tipo] || 'OUV');

    const { error } = await supabase()
        .from('ouvidoria')
        .insert([{ protocolo, tipo, nome, email, telefone, anonimo: !!anonimo, mensagem }]);

    if (error) return res.status(500).json({ error: 'Erro ao registrar manifestação' });

    const emailDestino = await getEmailDestino(EMAIL_KEYS[tipo] || 'email_ouvidoria_reclamacao');

    try {
        const transport = mailer();
        await transport.sendMail({
            from: `"Site ADESIAP" <${process.env.SMTP_USER}>`,
            to: emailDestino,
            subject: `[Ouvidoria] ${LABELS[tipo]} — Protocolo ${protocolo}`,
            html: `
                <h2>Nova ${LABELS[tipo]} — Ouvidoria</h2>
                <p><strong>Protocolo:</strong> ${protocolo}</p>
                <p><strong>Anônimo:</strong> ${anonimo ? 'Sim' : 'Não'}</p>
                ${!anonimo ? `
                <p><strong>Nome:</strong> ${nome || '—'}</p>
                <p><strong>E-mail:</strong> ${email || '—'}</p>
                <p><strong>Telefone:</strong> ${telefone || '—'}</p>
                ` : ''}
                <hr>
                <p><strong>Mensagem:</strong></p>
                <p>${mensagem.replace(/\n/g, '<br>')}</p>
            `,
        });

        if (!anonimo && email) {
            await transport.sendMail({
                from: `"ADESIAP Minas" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Protocolo ${protocolo} — Ouvidoria ADESIAP Minas`,
                html: `
                    <h2>Sua ${LABELS[tipo]} foi registrada</h2>
                    <p>Olá${nome ? `, ${nome}` : ''}!</p>
                    <p>Recebemos sua manifestação. Guarde o número do protocolo para acompanhamento:</p>
                    <h3 style="background:#12395D;color:#fff;padding:12px 20px;border-radius:6px;display:inline-block;">${protocolo}</h3>
                    <p>Prazo de resposta: até <strong>15 dias úteis</strong>.</p>
                    <br>
                    <p>Atenciosamente,<br><strong>Ouvidoria ADESIAP Minas</strong></p>
                `,
            });
        }
    } catch (mailErr) {
        console.error('Erro e-mail ouvidoria:', mailErr.message);
    }

    return res.status(200).json({ ok: true, protocolo, message: 'Manifestação registrada com sucesso' });
}
