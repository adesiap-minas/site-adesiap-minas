# Documentação de Identidade Visual: Quem Somos

Este documento detalha o padrão visual premium estabelecido na página `quem-somos.html` da ADESIAP Minas, servindo como guia de estilo para futuras expansões do site.

---

## 1. Paleta de Cores

A identidade visual utiliza uma combinação de tons sóbrios e terrosos para transmitir autoridade técnica e conexão territorial.

| Cor | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| **Azul Institucional** | `#12395D` | Títulos principais, elementos de destaque e botões. |
| **Azul Profundo** | `#0B1F33` | Fundos de seções (Background Dark) e rodapé. |
| **Terracota** | `#B85C38` | Blocos de destaque (Essência), botões secundários e hover. |
| **Areia (Fundo)** | `#F4EFE7` | Fundos de seções claras e bordas decorativas. |
| **Branco** | `#FFFFFF` | Textos sobre fundos escuros e fundos de cards. |
| **Texto Principal** | `#1F2933` | Parágrafos e leitura longa sobre fundos claros. |
| **Texto Secundário** | `#5F6B76` | Descrições e subtextos com menor hierarquia. |

---

## 2. Tipografia

O sistema utiliza duas famílias tipográficas complementares da Google Fonts.

*   **Títulos (Headers):** `Inter` - Escolhida pela sua clareza geométrica e peso variável.
*   **Corpo de Texto (Body):** `Roboto` - Escolhida pela legibilidade em dispositivos móveis e desktops.

---

## 3. Padrão de Títulos (Display Titles)

O grande diferencial visual da página é o uso de **Display Titles** de alto impacto.

### Estrutura HTML
```html
<h2 class="display-title [light]">
    <span>PREFIXO</span>
    TÍTULO PRINCIPAL
</h2>
```

### Especificações Técnicas (CSS)
*   **Tamanho (Font Size):** `5rem` (80px aprox.).
*   **Peso (Font Weight):** `900` (Black/Extra Bold).
*   **Transformação:** `text-transform: uppercase;` (Tudo em caixa alta).
*   **Espaçamento entre Linhas:** `line-height: 0.85;` (Texto "esmagado" para impacto).
*   **Espaçamento entre Letras:** `letter-spacing: -2px;`.

### Detalhamento do Prefixo (`span`)
O prefixo dentro do título tem um comportamento específico para criar profundidade visual:
*   **Disposição:** `display: block;` (Fica sempre na linha de cima).
*   **Opacidade:** `opacity: 0.4;` (Gera um efeito de "fundo" ou "etiqueta fantasma").
*   **Proporção:** `font-size: 0.8em;` (Ligeiramente menor que o título principal).

---

## 4. Disposição de Textos e Blocos

A página é construída seguindo um **"Ritmo de Blocos"** que evita a monotonia visual.

1.  **Alternância de Cores:** As seções nunca repetem a mesma cor de fundo consecutivamente. O fluxo padrão é:
    *   *Hero* (Imagem Escura) → *Evolução* (Azul Profundo) → *Trajetória* (Branco/Areia) → *Essência* (Terracota) → *Governança* (Azul Profundo).
2.  **Respiros (Padding):** Todas as seções utilizam `padding: 100px 0;`, garantindo que o conteúdo não pareça "apertado".
3.  **Hierarquia de Parágrafos:**
    *   Parágrafos de introdução usam `font-size: 1.1rem` e `line-height: 1.6`.
    *   Sobre fundos escuros, os parágrafos usam a cor branca com opacidade de `0.7` (`rgba(255,255,255,0.7)`).

---

## 5. Responsividade (Breakpoints)

Para dispositivos móveis (abaixo de 768px):
*   **Display Title:** Reduz para `3.2rem`.
*   **Span Prefixo:** Reduz para `0.7em`.
*   **Padding Global:** Reduz para `60px 0`.
