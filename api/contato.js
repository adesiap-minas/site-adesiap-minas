import { supabase, mailer, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
    const headers = corsHeaders();
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { nome, email, telefone, assunto, mensagem } = req.body;

    if (!nome || !email || !mensagem) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, email, mensagem' });
    }

    const { error } = await supabase()
        .from('contatos')
        .insert([{ nome, email, telefone, assunto, mensagem }]);

    if (error) return res.status(500).json({ error: 'Erro ao salvar mensagem' });

    try {
        const transport = mailer();
        await transport.sendMail({
            from: `"Site ADESIAP" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_DESTINO,
            subject: `[Fale Conosco] ${assunto || 'Nova mensagem'} — ${nome}`,
            html: `
                <h2>Nova mensagem — Fale Conosco</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || '—'}</p>
                <p><strong>Assunto:</strong> ${assunto || '—'}</p>
                <hr>
                <p><strong>Mensagem:</strong></p>
                <p>${mensagem.replace(/\n/g, '<br>')}</p>
            `,
        });
    } catch (mailErr) {
        console.error('Erro e-mail contato:', mailErr.message);
    }

    return res.status(200).json({ ok: true, message: 'Mensagem enviada com sucesso' });
}
