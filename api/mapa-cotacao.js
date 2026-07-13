const ExcelJS = require('exceljs');

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

    // ── Unique suppliers, winners first
    const seen = new Set();
    const suppliers = [];
    [...cotacoes]
        .sort((a, b) => (b.vencedor ? 1 : 0) - (a.vencedor ? 1 : 0))
        .forEach(c => {
            if (!seen.has(c.fornecedorCod)) {
                seen.add(c.fornecedorCod);
                suppliers.push(c);
            }
        });

    const N   = Math.max(suppliers.length, 1); // dynamic supplier column count
    const SC  = 5;           // supplier columns start at column 5 (E)
    const MC  = SC + N;      // Maior Valor column index
    const MnC = SC + N + 1;  // Menor Valor column index

    // ── Style helpers
    const RED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } };
    const BRL      = '"R$"#,##0.00';

    const wFont = (bold = true,  size = 9) => ({ name: 'Calibri', size, bold, color: { argb: 'FFFFFFFF' } });
    const bFont = (bold = false, size = 9) => ({ name: 'Calibri', size, bold, color: { argb: 'FF000000' } });

    const CENTER = { horizontal: 'center', vertical: 'middle', wrapText: true };
    const LEFT   = { horizontal: 'left',   vertical: 'middle', wrapText: true };

    const THIN   = (color = 'FFB0B0B0') => ({ style: 'thin',   color: { argb: color } });
    const MEDIUM = (color = 'FF7B0000') => ({ style: 'medium', color: { argb: color } });
    const dataBorder  = { top: THIN(), bottom: THIN(), left: THIN(), right: THIN() };
    const hdrBorder   = { top: MEDIUM(), bottom: MEDIUM(), left: MEDIUM(), right: MEDIUM() };

    function cell(ws, r, c) { return ws.getCell(r, c); }

    function hdr(ws, r, c, value, bold = true, align = CENTER, size = 9) {
        const cl = cell(ws, r, c);
        cl.value     = value ?? null;
        cl.fill      = RED_FILL;
        cl.font      = wFont(bold, size);
        cl.alignment = align;
        cl.border    = hdrBorder;
    }

    function dat(ws, r, c, value, numFmt, bold = false, align = CENTER) {
        const cl = cell(ws, r, c);
        cl.value     = value ?? null;
        cl.font      = bFont(bold);
        cl.alignment = align;
        cl.border    = dataBorder;
        if (numFmt) cl.numFmt = numFmt;
    }

    // ── Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ADESIAP';
    const ws = wb.addWorksheet('MAPA DE COTAÇÃO');

    // Column widths
    ws.getColumn(1).width = 40;
    ws.getColumn(2).width = 7;
    ws.getColumn(3).width = 13;
    ws.getColumn(4).width = 14;
    for (let i = 0; i < N; i++) ws.getColumn(SC + i).width = 20;
    ws.getColumn(MC).width  = 13;
    ws.getColumn(MnC).width = 13;

    // ── Rows 1-3: project name (merged)
    ws.getRow(1).height = 14;
    ws.getRow(2).height = 14;
    ws.getRow(3).height = 14;
    ws.mergeCells(1, 1, 3, MnC);
    hdr(ws, 1, 1, `${projeto.codigo} — ${projeto.descricao}`, true, CENTER, 12);

    // ── Row 4: title
    ws.getRow(4).height = 22;
    ws.mergeCells(4, 1, 4, MnC);
    hdr(ws, 4, 1, 'MAPA DO COMPARATIVO DE COTAÇÕES', true, CENTER, 12);

    // ── Row 5: address
    ws.getRow(5).height = 32;
    ws.mergeCells(5, 1, 5, MnC);
    hdr(ws, 5, 1,
        'ADESIAP - Agência de Desenvolvimento Econômico e Social dos Inconfidentes e Alto Paraopeba' +
        ' - CNPJ: 05.685.572/0001-75\nR. Doutor Guilherme - 44 - Centro - Itabirito MG',
        false, CENTER, 8);

    // ── Rows 6-8: column headers (A:D merged across 3 rows each)
    ws.getRow(6).height = 22;
    ws.getRow(7).height = 30;
    ws.getRow(8).height = 20;

    ws.mergeCells(6, 1, 8, 1); hdr(ws, 6, 1, 'DESCRIÇÃO DO PRODUTO OU SERVIÇO');
    ws.mergeCells(6, 2, 8, 2); hdr(ws, 6, 2, 'QTD.');
    ws.mergeCells(6, 3, 8, 3); hdr(ws, 6, 3, 'UNIDADE DE MEDIDA');
    ws.mergeCells(6, 4, 8, 4); hdr(ws, 6, 4, 'VALOR APROVADO DA RUBRICA');

    // "FORNECEDORES" spanning all supplier cols in row 6
    if (N > 1) ws.mergeCells(6, SC, 6, SC + N - 1);
    hdr(ws, 6, SC, 'FORNECEDORES');

    // "RESULTADO" spanning Maior+Menor in row 6
    ws.mergeCells(6, MC, 6, MnC);
    hdr(ws, 6, MC, 'RESULTADO');

    // Supplier names in row 7, CNPJ in row 8
    suppliers.forEach((sup, i) => {
        hdr(ws, 7, SC + i, sup.fornecedor, false);
        hdr(ws, 8, SC + i, sup.cnpj || '', false);
    });
    // Fill unused supplier slots if N was padded
    for (let i = suppliers.length; i < N; i++) {
        hdr(ws, 7, SC + i, '');
        hdr(ws, 8, SC + i, '');
    }

    // Maior / Menor headers (merged rows 7-8)
    ws.mergeCells(7, MC,  8, MC);  hdr(ws, 7, MC,  'MAIOR\nVALOR');
    ws.mergeCells(7, MnC, 8, MnC); hdr(ws, 7, MnC, 'MENOR\nVALOR');

    // ── Data rows
    const itemMap = new Map();
    cotacoes.forEach(c => {
        const key = c.codigo || 'default';
        if (!itemMap.has(key)) {
            itemMap.set(key, {
                descricao: [trf.nome, trf.pedido?.detalhamento].filter(Boolean).join(' - '),
                qtd:    trf.qtd,
                unidade: trf.unidade,
                rubrica: trf.valorTotal,
                quotes: {},
            });
        }
        itemMap.get(key).quotes[c.fornecedorCod] = c;
    });

    const DATA_START = 9;
    let   rowIdx    = 0;
    const colTotals = new Array(N).fill(0);

    itemMap.forEach(item => {
        const r = DATA_START + rowIdx;
        ws.getRow(r).height = 28;

        dat(ws, r, 1, item.descricao, null, false, LEFT);
        dat(ws, r, 2, item.qtd);
        dat(ws, r, 3, item.unidade);
        dat(ws, r, 4, item.rubrica,  BRL);

        const prices = [];
        suppliers.forEach((sup, i) => {
            const q     = item.quotes[sup.fornecedorCod];
            const price = q ? (Number(q.vlrUnitNeg || q.vlrUnit) || 0) : 0;
            dat(ws, r, SC + i, price || null, BRL);
            if (price > 0) { prices.push(price); colTotals[i] += price; }
        });

        // MAX / MIN computed directly
        hdr(ws, r, MC,  prices.length ? Math.max(...prices) : null);
        hdr(ws, r, MnC, prices.length ? Math.min(...prices) : null);
        cell(ws, r, MC).numFmt  = BRL;
        cell(ws, r, MnC).numFmt = BRL;

        rowIdx++;
    });

    // ── Frete / Prazo proposta / Prazo entrega
    let nextRow = DATA_START + rowIdx;
    ['Frete', 'Prazo da Proposta Recebida', 'Prazo de entrega'].forEach(label => {
        ws.getRow(nextRow).height = 25;
        ws.mergeCells(nextRow, 1, nextRow, 4);
        dat(ws, nextRow, 1, label, null, true, LEFT);
        for (let i = 0; i < N; i++) dat(ws, nextRow, SC + i, null, BRL);
        hdr(ws, nextRow, MC,  null); cell(ws, nextRow, MC).numFmt  = BRL;
        hdr(ws, nextRow, MnC, null); cell(ws, nextRow, MnC).numFmt = BRL;
        nextRow++;
    });

    // ── VALOR TOTAL row
    ws.getRow(nextRow).height = 20;
    ws.mergeCells(nextRow, 1, nextRow, 4);
    hdr(ws, nextRow, 1, 'VALOR TOTAL DA PROPOSTA');
    const validTotals = colTotals.filter(t => t > 0);
    suppliers.forEach((_, i) => {
        hdr(ws, nextRow, SC + i, colTotals[i] || null);
        cell(ws, nextRow, SC + i).numFmt = BRL;
    });
    hdr(ws, nextRow, MC,  validTotals.length ? Math.max(...validTotals) : null);
    hdr(ws, nextRow, MnC, validTotals.length ? Math.min(...validTotals) : null);
    cell(ws, nextRow, MC).numFmt  = BRL;
    cell(ws, nextRow, MnC).numFmt = BRL;
    nextRow += 2;

    // ── OBS
    cell(ws, nextRow, 1).value     = 'OBS: OS FORNECEDORES GANHADORES DEVERÃO ESTAR DESTACADOS EM AMARELO';
    cell(ws, nextRow, 1).font      = { name: 'Calibri', size: 9, italic: true };
    cell(ws, nextRow, 1).alignment = LEFT;

    // ── Output
    const buffer   = await wb.xlsx.writeBuffer();
    const safeName = `Mapa_Cotacao_${projeto.codigo}_${trf.codigo}`
        .replace(/[^a-zA-Z0-9_\-]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(buffer);
};
