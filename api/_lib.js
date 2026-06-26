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

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };
}
