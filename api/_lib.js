import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export function supabase() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
}

export function mailer() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { ciphers: 'SSLv3' }
    });
}

export function gerarProtocolo(prefixo) {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `${prefixo}-${ano}${mes}${dia}-${rand}`;
}

export function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Rate limiting via Upstash REST (sem pacotes extras — usa fetch nativo do Node 18+).
// Se as variáveis UPSTASH_* não estiverem configuradas, a função falha aberta (não bloqueia).
// max = requisições permitidas por janela; windowSec = tamanho da janela em segundos.
export async function rateLimit(req, prefix, max = 10, windowSec = 60) {
    const rlUrl   = process.env.UPSTASH_REDIS_REST_URL;
    const rlToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!rlUrl || !rlToken) return { ok: true }; // fail open se não configurado

    const ip = (
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
    const window = Math.floor(Date.now() / (windowSec * 1000));
    const key    = `rl:${prefix}:${ip}:${window}`;

    try {
        const r = await fetch(`${rlUrl}/pipeline`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${rlToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([
                ['INCR', key],
                ['EXPIRE', key, windowSec * 2],
            ]),
        });
        const data  = await r.json();
        const count = data?.[0]?.result ?? 0;
        return { ok: count <= max, count, limit: max, ip };
    } catch {
        return { ok: true }; // falha silenciosa — não bloqueia o usuário
    }
}

// Verifica honeypot: o campo _hp deve chegar vazio (humano) ou ausente.
// Bots tendem a preencher todos os campos visíveis e ocultos.
export function checkHoneypot(body) {
    return !body?._hp; // true = passou; false = bot detectado
}

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };
}

export async function getConfig(chave) {
    const sb = supabase();
    const { data } = await sb
        .from('configuracoes')
        .select('valor')
        .eq('chave', chave)
        .single();
    return data?.valor || null;
}

export async function getEmailDestino(chave_routing) {
    const especifico = await getConfig(chave_routing);
    if (especifico) return especifico;
    return process.env.EMAIL_DESTINO || 'comercial@adesiap.org.br';
}
