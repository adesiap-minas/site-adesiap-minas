import { supabase, mailer, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
    const headers = corsHeaders();
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { razao_social, cnpj, nome_contato, email, telefone, segmento, descricao } = req.body;

    if (!razao_social || !nome_contato || !email) {
        return res.status(400).json({ error: 'Campos obrigatórios: razão social, nome do contato, e-mail' });
    }

    const { error } = await supabase()
        .from('fornecedores')
        .insert([{ razao_social, cnpj, nome_contato, email, telefone, segmento, descricao }]);

    if (error) return res.status(500).json({ error: 'Erro ao registrar fornecedor' });

    try {
        const transport = mailer();
        await transport.sendMail({
            from: `"Site ADESIAP" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_DESTINO,
            subject: `[Fornecedores] Novo cadastro — ${razao_social}`,
            html: `
                <h2>Novo Cadastro de Fornecedor</h2>
                <p><strong>Razão Social:</strong> ${razao_social}</p>
                <p><strong>CNPJ:</strong> ${cnpj || '—'}</p>
                <p><strong>Contato:</strong> ${nome_contato}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || '—'}</p>
                <p><strong>Segmento:</strong> ${segmento || '—'}</p>
                ${descricao ? `<hr><p><strong>Descrição:</strong> ${descricao}</p>` : ''}
            `,
        });

        await transport.sendMail({
            from: `"ADESIAP Minas" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Cadastro recebido — ADESIAP Minas`,
            html: `
                <h2>Olá, ${nome_contato}!</h2>
                <p>Recebemos o cadastro de <strong>${razao_social}</strong> em nossa base de fornecedores.</p>
                <p>Nossa equipe irá analisar as informações e entrará em contato em breve.</p>
                <br>
                <p>Atenciosamente,<br><strong>Equipe ADESIAP Minas</strong></p>
            `,
        });
    } catch (mailErr) {
        console.error('Erro e-mail fornecedor:', mailErr.message);
    }

    return res.status(200).json({ ok: true, message: 'Cadastro realizado com sucesso' });
}
