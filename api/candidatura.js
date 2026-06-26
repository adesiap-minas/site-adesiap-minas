import { supabase, mailer, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
    const headers = corsHeaders();
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const {
        nome, email, telefone, linkedin,
        area_interesse, nivel, escolaridade, disponibilidade,
        curriculo_url, carta_apresentacao
    } = req.body;

    if (!nome || !email || !area_interesse || !nivel || !escolaridade) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    const { error } = await supabase()
        .from('candidaturas')
        .insert([{
            nome, email, telefone, linkedin,
            area_interesse, nivel, escolaridade, disponibilidade,
            curriculo_url, carta_apresentacao
        }]);

    if (error) return res.status(500).json({ error: 'Erro ao registrar candidatura' });

    try {
        const transport = mailer();
        await transport.sendMail({
            from: `"Site ADESIAP" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_DESTINO,
            subject: `[Trabalhe Conosco] Nova candidatura — ${nome} | ${area_interesse}`,
            html: `
                <h2>Nova Candidatura — Trabalhe Conosco</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || '—'}</p>
                <p><strong>LinkedIn:</strong> ${linkedin || '—'}</p>
                <hr>
                <p><strong>Área de interesse:</strong> ${area_interesse}</p>
                <p><strong>Nível:</strong> ${nivel}</p>
                <p><strong>Escolaridade:</strong> ${escolaridade}</p>
                <p><strong>Disponibilidade:</strong> ${disponibilidade || '—'}</p>
                <p><strong>Currículo:</strong> ${curriculo_url ? `<a href="${curriculo_url}">Ver currículo</a>` : 'Não anexado'}</p>
                ${carta_apresentacao ? `<hr><p><strong>Carta de Apresentação:</strong></p><p>${carta_apresentacao.replace(/\n/g, '<br>')}</p>` : ''}
            `,
        });
        await transport.sendMail({
            from: `"ADESIAP Minas" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Recebemos sua candidatura — ADESIAP Minas`,
            html: `
                <h2>Olá, ${nome}!</h2>
                <p>Recebemos sua candidatura para a área de <strong>${area_interesse}</strong>.</p>
                <p>Nossa equipe irá analisar o seu perfil e entrará em contato caso haja uma oportunidade compatível.</p>
                <p>Obrigado pelo interesse em fazer parte da ADESIAP Minas!</p>
                <br>
                <p>Atenciosamente,<br><strong>Equipe ADESIAP Minas</strong></p>
            `,
        });
    } catch (mailErr) {
        console.error('Erro e-mail candidatura:', mailErr.message);
    }

    return res.status(200).json({ ok: true, message: 'Candidatura registrada com sucesso' });
}
