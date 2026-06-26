import { supabase, mailer, gerarProtocolo, corsHeaders, getEmailDestino } from './_lib.js';

export default async function handler(req, res) {
    const headers = corsHeaders();
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { identificado, nome, email, categoria, descricao } = req.body;

    if (!descricao) {
        return res.status(400).json({ error: 'Descrição da denúncia é obrigatória' });
    }

    const protocolo = gerarProtocolo('PRT');

    const { error } = await supabase()
        .from('denuncias')
        .insert([{ protocolo, identificado: !!identificado, nome, email, categoria, descricao }]);

    if (error) return res.status(500).json({ error: 'Erro ao registrar denúncia' });

    const emailDestino = await getEmailDestino('email_denuncias');

    try {
        const transport = mailer();
        await transport.sendMail({
            from: `"Site ADESIAP" <${process.env.SMTP_USER}>`,
            to: emailDestino,
            subject: `[Canal de Denúncias] Nova denúncia — Protocolo ${protocolo}`,
            html: `
                <h2>Nova Denúncia — Canal de Denúncias</h2>
                <p><strong>Protocolo:</strong> ${protocolo}</p>
                <p><strong>Identificado:</strong> ${identificado ? 'Sim' : 'Não'}</p>
                ${identificado ? `
                <p><strong>Nome:</strong> ${nome || '—'}</p>
                <p><strong>E-mail:</strong> ${email || '—'}</p>
                ` : ''}
                <p><strong>Categoria:</strong> ${categoria || '—'}</p>
                <hr>
                <p><strong>Descrição:</strong></p>
                <p>${descricao.replace(/\n/g, '<br>')}</p>
            `,
        });

        if (identificado && email) {
            await transport.sendMail({
                from: `"ADESIAP Minas" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Protocolo ${protocolo} — Canal de Denúncias ADESIAP Minas`,
                html: `
                    <h2>Sua denúncia foi registrada</h2>
                    <p>Recebemos sua denúncia com sigilo e responsabilidade. Guarde o protocolo:</p>
                    <h3 style="background:#12395D;color:#fff;padding:12px 20px;border-radius:6px;display:inline-block;">${protocolo}</h3>
                    <p>Nossa equipe irá apurar os fatos com confidencialidade.</p>
                    <br>
                    <p>Atenciosamente,<br><strong>Canal de Denúncias ADESIAP Minas</strong></p>
                `,
            });
        }
    } catch (mailErr) {
        console.error('Erro e-mail denúncia:', mailErr.message);
    }

    return res.status(200).json({ ok: true, protocolo, message: 'Denúncia registrada com sucesso' });
}
