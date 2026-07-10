const ExcelJS = require('exceljs');
const path    = require('path');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).end();

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido' }); }
    }

    const { projeto, trf, cotacoes = [] } = body || {};
    if (!projeto || !trf) return res.status(400).json({ error: 'Dados insuficientes' });

    const templatePath = path.join(process.cwd(), 'api', 'templates', 'mapa-cotacao-template.xlsx');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    const ws = wb.getWorksheet('MAPA DE COTAÇÃO');

    // ── Row 1 (A1:I3 merged): project name
    ws.getCell('A1').value = `${projeto.codigo} — ${projeto.descricao}`;

    // ── Unique suppliers (up to 3), winners first
    const seen = new Set();
    const suppliers = [];
    // winners first
    [...cotacoes].sort((a, b) => (b.vencedor ? 1 : 0) - (a.vencedor ? 1 : 0))
        .forEach(c => {
            if (!seen.has(c.fornecedorCod)) {
                seen.add(c.fornecedorCod);
                suppliers.push(c);
            }
        });

    const cols = ['E', 'F', 'G'];

    // ── Fill supplier names/CNPJ in rows 7-8 (increase height for readability)
    ws.getRow(7).height = 28;
    ws.getRow(8).height = 22;
    suppliers.forEach((sup, i) => {
        if (i >= 3) return;
        ws.getCell(`${cols[i]}7`).value = sup.fornecedor;
        ws.getCell(`${cols[i]}8`).value = sup.cnpj || '';
    });

    // ── Data rows (9–15 in template)
    const itemMap = new Map();
    cotacoes.forEach(c => {
        const key = c.codigo || 'default';
        if (!itemMap.has(key)) {
            itemMap.set(key, {
                descricao: trf.pedido?.produto || trf.nome,
                qtd:       trf.qtd,
                unidade:   trf.unidade,
                rubrica:   trf.valorTotal,
                quotes:    {},
            });
        }
        itemMap.get(key).quotes[c.fornecedorCod] = c;
    });

    const DATA_START = 9;
    let rowIdx = 0;
    itemMap.forEach(item => {
        if (rowIdx >= 7) return; // template has 7 item rows (9-15)
        const rowNum = DATA_START + rowIdx;
        const row = ws.getRow(rowNum);
        row.getCell(1).value = item.descricao; // A
        row.getCell(2).value = item.qtd;        // B
        row.getCell(3).value = item.unidade;    // C
        row.getCell(4).value = item.rubrica;    // D
        suppliers.forEach((sup, i) => {
            if (i >= 3) return;
            const q = item.quotes[sup.fornecedorCod];
            if (q) {
                const cell = row.getCell(5 + i);
                cell.value = q.vlrUnitNeg || q.vlrUnit || null;
                cell.numFmt = '"R$"#,##0.00';
            }
        });
        rowIdx++;
    });


    // ── Format D column (rubrica) as currency
    for (let r = DATA_START; r <= DATA_START + 6; r++) {
        ws.getRow(r).getCell(4).numFmt = '"R$"#,##0.00';
    }

    // ── Footer rows formatting
    ['E', 'F', 'G'].forEach(col => {
        ws.getCell(`${col}19`).numFmt = '"R$"#,##0.00';
    });

    const buffer = await wb.xlsx.writeBuffer();

    const safeName = `Mapa_Cotacao_${projeto.codigo}_${trf.codigo}`
        .replace(/[^a-zA-Z0-9_\-]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(buffer);
};
