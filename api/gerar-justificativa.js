const fs          = require('fs');
const path        = require('path');
const PizZip      = require('pizzip');
const Docxtemplater = require('docxtemplater');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).end();

    const {
        nome_projeto,
        titulo_item,
        data,
        responsavel,
        item_solicitado,
        item_adquirido,
        justificativa,
        beneficio,
        trf_codigo = '',
    } = req.body || {};

    try {
        const tplPath = path.join(process.cwd(), 'justificativa-template.docx');
        const content = fs.readFileSync(tplPath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks:    true,
        });

        doc.render({
            nome_projeto:   nome_projeto   || '',
            titulo_item:    titulo_item    || '',
            data:           data           || '',
            responsavel:    responsavel    || '',
            item_solicitado: item_solicitado || '',
            item_adquirido: item_adquirido || '',
            justificativa:  justificativa  || '',
            beneficio:      beneficio      || '',
        });

        const buf     = doc.getZip().generate({ type: 'nodebuffer' });
        const safePrj = (nome_projeto || 'ADESIAP').replace(/[^a-zA-Z0-9À-ú]/g, '_').substring(0, 40);
        const fileName = `Justificativa_${safePrj}${trf_codigo ? '_' + trf_codigo.replace(/\./g,'_') : ''}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buf);
    } catch (err) {
        console.error('[gerar-justificativa]', err.message);
        res.status(500).json({ error: err.message });
    }
};
