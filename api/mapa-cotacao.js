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
                descricao: [trf.nome, trf.pedido?.detalhamento].filter(Boolean).join(' - '),
                qtd:       trf.qtd,
                unidade:   trf.unidade,
                rubrica:   trf.valorTotal,
                quotes:    {},
            });
        }
        itemMap.get(key).quotes[c.fornecedorCod] = c;
    });

    const DATA_START = 9;
    const BRL = '"R$"#,##0.00';
    let rowIdx = 0;
    const colTotals = [0, 0, 0]; // per-supplier running totals for row 19

    itemMap.forEach(item => {
        if (rowIdx >= 7) return; // template has 7 item rows (9-15)
        const rowNum = DATA_START + rowIdx;
        const row = ws.getRow(rowNum);
        row.getCell(1).value = item.descricao;
        row.getCell(2).value = item.qtd;
        row.getCell(3).value = item.unidade;
        row.getCell(4).value = item.rubrica;
        row.getCell(4).numFmt = BRL;

        const rowPrices = [];
        suppliers.forEach((sup, i) => {
            if (i >= 3) return;
            const q = item.quotes[sup.fornecedorCod];
            const price = q ? (Number(q.vlrUnitNeg || q.vlrUnit) || 0) : 0;
            if (price > 0) {
                const cell = row.getCell(5 + i);
                cell.value = price;
                cell.numFmt = BRL;
                rowPrices.push(price);
                colTotals[i] += price;
            }
        });

        // Write MAX and MIN as computed values (template formulas aren't recalculated by ExcelJS)
        if (rowPrices.length > 0) {
            row.getCell(8).value   = Math.max(...rowPrices);
            row.getCell(8).numFmt  = BRL;
            row.getCell(9).value   = Math.min(...rowPrices);
            row.getCell(9).numFmt  = BRL;
        }

        rowIdx++;
    });

    // ── Row 19: totals per supplier + overall MAX/MIN
    const validTotals = colTotals.filter(t => t > 0);
    cols.forEach((col, i) => {
        if (colTotals[i] > 0) {
            ws.getCell(`${col}19`).value   = colTotals[i];
            ws.getCell(`${col}19`).numFmt  = BRL;
        }
    });
    if (validTotals.length > 0) {
        ws.getCell('H19').value  = Math.max(...validTotals);
        ws.getCell('H19').numFmt = BRL;
        ws.getCell('I19').value  = Math.min(...validTotals);
        ws.getCell('I19').numFmt = BRL;
    }

    const buffer = await wb.xlsx.writeBuffer();

    const safeName = `Mapa_Cotacao_${projeto.codigo}_${trf.codigo}`
        .replace(/[^a-zA-Z0-9_\-]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(buffer);
};
