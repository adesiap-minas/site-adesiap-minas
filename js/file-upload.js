// Componente de upload de arquivos: múltiplos, validação, progress, drag-and-drop
(function () {
    if (!document.getElementById('fu-css')) {
        const s = document.createElement('style');
        s.id = 'fu-css';
        s.textContent = `
.fu-zone{display:flex;align-items:center;gap:14px;padding:16px 18px;border:2px dashed #d1d5db;border-radius:10px;cursor:pointer;background:#f9fafb;transition:border-color .2s,background .2s;user-select:none}
.fu-zone:hover,.fu-zone.fu-drag{border-color:var(--terracota-institucional,#8B3A2F);background:#fff}
.fu-zone-icon{font-size:1.4rem;color:var(--terracota-institucional,#8B3A2F);flex-shrink:0}
.fu-zone-texts{display:flex;flex-direction:column;gap:2px;min-width:0}
.fu-zone-label{font-size:.9rem;font-weight:600;color:var(--azul-institucional,#12395D)}
.fu-zone-sub{font-size:.76rem;color:var(--texto-secundario,#6b7280)}
.fu-progress{height:5px;background:#e5e7eb;border-radius:4px;margin-top:8px;overflow:hidden;display:none}
.fu-bar{height:100%;background:var(--terracota-institucional,#8B3A2F);border-radius:4px;transition:width .12s;width:0}
.fu-reading{font-size:.78rem;color:var(--texto-secundario,#6b7280);margin-top:4px;display:none}
.fu-list{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.fu-item{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0}
.fu-item-icon{color:#22c55e;font-size:.85rem;flex-shrink:0}
.fu-item-name{font-size:.84rem;font-weight:500;color:#1f2937;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.fu-item-sz{font-size:.74rem;color:#9ca3af;flex-shrink:0;white-space:nowrap;margin-left:4px}
.fu-item-rm{background:none;border:none;color:#f87171;font-size:1.2rem;line-height:1;cursor:pointer;padding:0 4px;flex-shrink:0;font-weight:700}
.fu-item-rm:hover{color:#ef4444}
.fu-err{font-size:.79rem;color:#ef4444;margin-top:6px;min-height:1rem}
`;
        document.head.appendChild(s);
    }

    window._fuReg = window._fuReg || {};

    window.fuRemove = function (id, i) {
        const u = window._fuReg[id];
        if (!u) return;
        u.files.splice(i, 1);
        u._render();
    };

    window.initUpload = function (inputId, opts) {
        const input = document.getElementById(inputId);
        if (!input) return null;
        const {
            maxArquivos = 5,
            maxMB = 10,
            label = 'Clique para selecionar ou arraste aqui',
            sublabel = null,
            required = false,
        } = opts || {};
        const maxBytes = maxMB * 1024 * 1024;

        const wrap = document.createElement('div');
        wrap.innerHTML = `
<div class="fu-zone" tabindex="0" role="button">
  <i class="fas fa-paperclip fu-zone-icon"></i>
  <div class="fu-zone-texts">
    <span class="fu-zone-label">${label}</span>
    ${sublabel ? `<span class="fu-zone-sub">${sublabel}</span>` : ''}
  </div>
</div>
<div class="fu-progress"><div class="fu-bar"></div></div>
<div class="fu-reading">Lendo arquivo...</div>
<div class="fu-list"></div>
<div class="fu-err"></div>`;

        input.setAttribute('multiple', '');
        input.style.display = 'none';
        input.removeAttribute('required');
        input.parentNode.insertBefore(wrap, input.nextSibling);

        const zone     = wrap.querySelector('.fu-zone');
        const prog     = wrap.querySelector('.fu-progress');
        const bar      = wrap.querySelector('.fu-bar');
        const readEl   = wrap.querySelector('.fu-reading');
        const listEl   = wrap.querySelector('.fu-list');
        const errEl    = wrap.querySelector('.fu-err');

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') input.click(); });
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('fu-drag'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('fu-drag'));
        zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('fu-drag'); handle(Array.from(e.dataTransfer.files)); });
        input.addEventListener('change', () => { handle(Array.from(input.files)); input.value = ''; });

        const u = { files: [], _render };

        function exts() { return (input.accept || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean); }

        async function handle(files) {
            errEl.textContent = '';
            const allowed = exts();
            for (const f of files) {
                if (u.files.length >= maxArquivos) { errEl.textContent = `Máximo de ${maxArquivos} arquivo(s) permitido(s).`; break; }
                const ext = '.' + f.name.split('.').pop().toLowerCase();
                if (allowed.length && !allowed.includes(ext)) { errEl.textContent = `Formato inválido: "${f.name}". Permitidos: ${allowed.join(' ')}`; continue; }
                if (f.size > maxBytes) { errEl.textContent = `"${f.name}" excede ${maxMB}MB.`; continue; }
                if (u.files.find(x => x.nome === f.name)) continue;
                await read(f);
                _render();
            }
        }

        function read(file) {
            return new Promise(res => {
                prog.style.display = 'block';
                readEl.style.display = 'block';
                bar.style.width = '0%';
                const r = new FileReader();
                r.onprogress = e => { if (e.lengthComputable) bar.style.width = (e.loaded / e.total * 85) + '%'; };
                r.onload = () => {
                    bar.style.width = '100%';
                    u.files.push({ nome: file.name, base64: r.result.split(',')[1], tipo: file.type, tamanho: file.size });
                    setTimeout(() => { prog.style.display = 'none'; readEl.style.display = 'none'; bar.style.width = '0%'; }, 600);
                    res();
                };
                r.onerror = res;
                r.readAsDataURL(file);
            });
        }

        function _render() {
            listEl.innerHTML = u.files.map((f, i) => `
<div class="fu-item">
  <i class="fas fa-check-circle fu-item-icon"></i>
  <span class="fu-item-name" title="${f.nome}">${f.nome}</span>
  <span class="fu-item-sz">${fmt(f.tamanho)}</span>
  <button type="button" class="fu-item-rm" onclick="fuRemove('${inputId}',${i})" title="Remover">×</button>
</div>`).join('');
        }

        function fmt(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.round(b / 1024) + 'KB'; }

        u.validar = () => {
            if (required && u.files.length === 0) { errEl.textContent = 'Anexe pelo menos um arquivo.'; return false; }
            return true;
        };
        u.getArquivos = () => u.files.map(f => ({ nome: f.nome, base64: f.base64 }));

        window._fuReg[inputId] = u;
        return u;
    };
})();
