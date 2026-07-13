const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

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
    const RED_FILL   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } };
    const WHITE_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    const BRL        = '"R$"#,##0.00';

    const wFont = (bold = true,  size = 9) => ({ name: 'Calibri', size, bold, color: { argb: 'FFFFFFFF' } });
    const bFont = (bold = false, size = 9) => ({ name: 'Calibri', size, bold, color: { argb: 'FF000000' } });

    const CENTER = { horizontal: 'center', vertical: 'middle', wrapText: true };
    const LEFT   = { horizontal: 'left',   vertical: 'middle', wrapText: true };

    const THIN   = (color = 'FFB0B0B0') => ({ style: 'thin',   color: { argb: color } });
    const MEDIUM = (color = 'FF7B0000') => ({ style: 'medium', color: { argb: color } });
    const dataBorder = { top: THIN(), bottom: THIN(), left: THIN(), right: THIN() };
    const hdrBorder  = { top: MEDIUM(), bottom: MEDIUM(), left: MEDIUM(), right: MEDIUM() };

    // hdr: red fill, white font — numFmt param avoids secondary style-reset bug
    function hdr(ws, r, c, value, bold = true, align = CENTER, size = 9, numFmt = null) {
        const cl   = ws.getCell(r, c);
        cl.value   = value ?? null;
        cl.fill    = RED_FILL;
        cl.font    = wFont(bold, size);
        cl.alignment = align;
        cl.border  = hdrBorder;
        if (numFmt !== null) cl.numFmt = numFmt;
    }

    function dat(ws, r, c, value, numFmt = null, bold = false, align = CENTER) {
        const cl   = ws.getCell(r, c);
        cl.value   = value ?? null;
        cl.font    = bFont(bold);
        cl.alignment = align;
        cl.border  = dataBorder;
        if (numFmt !== null) cl.numFmt = numFmt;
    }

    // Safe numeric parse (handles string decimals)
    function parsePrice(v) {
        if (v == null) return 0;
        const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
        return isNaN(n) ? 0 : n;
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

    // ── Row 1: Logo
    ws.getRow(1).height = 52;
    for (let c = 1; c <= MnC; c++) {
        const cl   = ws.getCell(1, c);
        cl.fill    = WHITE_FILL;
        cl.border  = {};
    }
    try {
        const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'LOGO ADESIAP MINAS PRETA.png'));
        const imageId    = wb.addImage({ buffer: logoBuffer, extension: 'png' });
        ws.addImage(imageId, {
            tl:     { col: 0, row: 0 },
            ext:    { width: 175, height: 48 },
            editAs: 'oneCell',
        });
    } catch (_) { /* logo file not found — continue without it */ }

    // ── Rows 2-4: project name (merged)
    ws.getRow(2).height = 14;
    ws.getRow(3).height = 14;
    ws.getRow(4).height = 14;
    ws.mergeCells(2, 1, 4, MnC);
    hdr(ws, 2, 1, `${projeto.codigo} — ${projeto.descricao}`, true, CENTER, 12);

    // ── Row 5: title
    ws.getRow(5).height = 22;
    ws.mergeCells(5, 1, 5, MnC);
    hdr(ws, 5, 1, 'MAPA DO COMPARATIVO DE COTAÇÕES', true, CENTER, 12);

    // ── Row 6: address
    ws.getRow(6).height = 32;
    ws.mergeCells(6, 1, 6, MnC);
    hdr(ws, 6, 1,
        'ADESIAP - Agência de Desenvolvimento Econômico e Social dos Inconfidentes e Alto Paraopeba' +
        ' - CNPJ: 05.685.572/0001-75\nR. Doutor Guilherme - 44 - Centro - Itabirito MG',
        false, CENTER, 8);

    // ── Rows 7-9: column headers (A:D merged across 3 rows each)
    ws.getRow(7).height = 22;
    ws.getRow(8).height = 30;
    ws.getRow(9).height = 20;

    ws.mergeCells(7, 1, 9, 1); hdr(ws, 7, 1, 'DESCRIÇÃO DO PRODUTO OU SERVIÇO');
    ws.mergeCells(7, 2, 9, 2); hdr(ws, 7, 2, 'QTD.');
    ws.mergeCells(7, 3, 9, 3); hdr(ws, 7, 3, 'UNIDADE DE MEDIDA');
    ws.mergeCells(7, 4, 9, 4); hdr(ws, 7, 4, 'VALOR APROVADO DA RUBRICA');

    // "FORNECEDORES" spanning all supplier cols in row 7
    if (N > 1) ws.mergeCells(7, SC, 7, SC + N - 1);
    hdr(ws, 7, SC, 'FORNECEDORES');

    // "RESULTADO" spanning Maior+Menor in row 7
    ws.mergeCells(7, MC, 7, MnC);
    hdr(ws, 7, MC, 'RESULTADO');

    // Supplier names in row 8, CNPJ in row 9
    suppliers.forEach((sup, i) => {
        hdr(ws, 8, SC + i, sup.fornecedor, false);
        hdr(ws, 9, SC + i, sup.cnpj || '', false);
    });
    for (let i = suppliers.length; i < N; i++) {
        hdr(ws, 8, SC + i, '');
        hdr(ws, 9, SC + i, '');
    }

    // Maior / Menor headers (merged rows 8-9)
    ws.mergeCells(8, MC,  9, MC);  hdr(ws, 8, MC,  'MAIOR\nVALOR');
    ws.mergeCells(8, MnC, 9, MnC); hdr(ws, 8, MnC, 'MENOR\nVALOR');

    // ── Data rows
    const itemMap = new Map();
    cotacoes.forEach(c => {
        const key = c.codigo || 'default';
        if (!itemMap.has(key)) {
            itemMap.set(key, {
                descricao: [trf.nome, trf.pedido?.detalhamento].filter(Boolean).join(' - '),
                qtd:      trf.qtd,
                unidade:  trf.unidade,
                rubrica:  trf.valorTotal,
                quotes:   {},
            });
        }
        itemMap.get(key).quotes[c.fornecedorCod] = c;
    });

    const DATA_START = 10;
    let   rowIdx     = 0;
    const colTotals  = new Array(N).fill(0);

    itemMap.forEach(item => {
        const r = DATA_START + rowIdx;
        ws.getRow(r).height = 28;

        dat(ws, r, 1, item.descricao, null, false, LEFT);
        dat(ws, r, 2, item.qtd);
        dat(ws, r, 3, item.unidade);
        dat(ws, r, 4, item.rubrica, BRL);

        let maxV = null, minV = null;
        suppliers.forEach((sup, i) => {
            const q     = item.quotes[sup.fornecedorCod];
            const price = q ? (parsePrice(q.vlrUnitNeg) || parsePrice(q.vlrUnit)) : 0;
            dat(ws, r, SC + i, price > 0 ? price : null, BRL);
            if (price > 0) {
                colTotals[i] += price;
                if (maxV === null || price > maxV) maxV = price;
                if (minV === null || price < minV) minV = price;
            }
        });

        // MAX / MIN set inside hdr() call to avoid style-reset bug
        hdr(ws, r, MC,  maxV, true, CENTER, 9, BRL);
        hdr(ws, r, MnC, minV, true, CENTER, 9, BRL);

        rowIdx++;
    });

    // ── Frete / Prazo proposta / Prazo entrega
    let nextRow = DATA_START + rowIdx;
    ['Frete', 'Prazo da Proposta Recebida', 'Prazo de entrega'].forEach(label => {
        ws.getRow(nextRow).height = 25;
        ws.mergeCells(nextRow, 1, nextRow, 4);
        dat(ws, nextRow, 1, label, null, true, LEFT);
        for (let i = 0; i < N; i++) dat(ws, nextRow, SC + i, null, BRL);
        hdr(ws, nextRow, MC,  null, true, CENTER, 9, BRL);
        hdr(ws, nextRow, MnC, null, true, CENTER, 9, BRL);
        nextRow++;
    });

    // ── VALOR TOTAL row
    ws.getRow(nextRow).height = 20;
    ws.mergeCells(nextRow, 1, nextRow, 4);
    hdr(ws, nextRow, 1, 'VALOR TOTAL DA PROPOSTA');

    let totMax = null, totMin = null;
    suppliers.forEach((_, i) => {
        const t = colTotals[i];
        hdr(ws, nextRow, SC + i, t > 0 ? t : null, true, CENTER, 9, BRL);
        if (t > 0) {
            if (totMax === null || t > totMax) totMax = t;
            if (totMin === null || t < totMin) totMin = t;
        }
    });
    hdr(ws, nextRow, MC,  totMax, true, CENTER, 9, BRL);
    hdr(ws, nextRow, MnC, totMin, true, CENTER, 9, BRL);
    nextRow += 2;

    // ── OBS
    const obsCell   = ws.getCell(nextRow, 1);
    obsCell.value   = 'OBS: OS FORNECEDORES GANHADORES DEVERÃO ESTAR DESTACADOS EM AMARELO';
    obsCell.font    = { name: 'Calibri', size: 9, italic: true };
    obsCell.alignment = LEFT;

    // ── Output
    const buffer   = await wb.xlsx.writeBuffer();
    const safeName = `Mapa_Cotacao_${projeto.codigo}_${trf.codigo}`
        .replace(/[^a-zA-Z0-9_\-]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(buffer);
};
