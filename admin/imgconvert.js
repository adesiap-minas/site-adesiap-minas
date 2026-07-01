// Converte qualquer imagem para WebP (ou outro formato) antes do upload.
// Retorna Promise<Blob>.
function convertImage(file, format = 'image/webp', quality = 0.82, maxWidth = 1920) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.onload = e => {
            const img = new Image();
            img.onerror = () => reject(new Error('Imagem inválida'));
            img.onload = () => {
                let w = img.naturalWidth, h = img.naturalHeight;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    blob => blob ? resolve(blob) : reject(new Error('Conversão não suportada pelo navegador')),
                    format,
                    quality
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Atalho para WebP com padrões razoáveis para o site.
function toWebP(file, quality = 0.82, maxWidth = 1920) {
    return convertImage(file, 'image/webp', quality, maxWidth);
}
