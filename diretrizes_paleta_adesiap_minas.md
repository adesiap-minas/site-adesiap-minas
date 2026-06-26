# Diretrizes de Paleta de Cores — Site ADESIAP Minas

## 1. Contexto da decisão

A ADESIAP Minas possui hoje uma presença visual fortemente associada ao vermelho. No processo de reformulação do site, surgiu a necessidade de deixar a interface mais viva, forte e institucional, porém evitando o uso direto do vermelho como cor de destaque.

A principal preocupação levantada foi que o vermelho pode gerar associações indesejadas, como:

- sangue;
- alerta;
- urgência;
- conflito;
- partido político;
- leitura visual agressiva.

Por isso, a estratégia recomendada não é abandonar totalmente a memória visual do vermelho de forma brusca, mas sim conduzir uma transição cromática mais sofisticada.

A proposta é evoluir do vermelho para tons próximos, mais maduros e institucionais, como terracota, cobre, âmbar e dourado quente.

---

## 2. Posicionamento estratégico

A melhor estratégia para a ADESIAP Minas é trabalhar uma paleta que transmita:

- governança;
- confiança;
- desenvolvimento econômico;
- impacto social;
- sustentabilidade;
- maturidade institucional;
- articulação entre setor público, iniciativa privada e sociedade civil;
- energia e movimento, sem agressividade visual.

A recomendação é evitar uma virada radical para verde como cor principal, pois isso poderia afastar demais a identidade atual da marca. O verde continua importante, mas deve funcionar como cor de apoio para temas de sustentabilidade, meio ambiente e impacto social.

A direção recomendada é:

> O vermelho deixa de ser protagonista e evolui para o terracota/cobre. O azul entra como base institucional. O âmbar traz vida e impacto. O verde fica reservado para sustentabilidade e desenvolvimento social.

---

## 3. Paleta principal recomendada

| Função | Cor | Hexadecimal | Uso principal |
|---|---:|---:|---|
| Azul Institucional | Azul profundo | `#12395D` | Governança, confiança, títulos, rodapé e seções institucionais |
| Azul Profundo | Azul escuro | `#0B1F33` | Fundos escuros, overlays, rodapé e áreas premium |
| Terracota Institucional | Terracota/cobre | `#B85C38` | Cor de transição do vermelho, botões, detalhes e destaques |
| Âmbar de Impacto | Âmbar/dourado quente | `#D9902F` | Indicadores, selos, números de impacto e elementos de prosperidade |
| Verde Sustentabilidade | Verde institucional | `#3B8C6E` | Sustentabilidade, meio ambiente, ODS e impacto social |
| Areia Institucional | Off-white quente | `#F4EFE7` | Fundos claros, seções alternadas e áreas de leitura |
| Branco | Branco puro | `#FFFFFF` | Cards, áreas limpas e contraste |
| Texto Principal | Grafite | `#1F2933` | Textos principais |
| Texto Secundário | Cinza azulado | `#5F6B76` | Parágrafos, descrições e textos de apoio |

---

## 4. CSS base recomendado

```css
:root {
    --azul-institucional: #12395D;
    --azul-profundo: #0B1F33;

    --terracota-institucional: #B85C38;
    --ambar-impacto: #D9902F;

    --verde-sustentabilidade: #3B8C6E;

    --areia-fundo: #F4EFE7;
    --branco: #FFFFFF;

    --texto-principal: #1F2933;
    --texto-secundario: #5F6B76;

    --header-height: 90px;
}
```

---

## 5. Papel de cada cor na identidade

### 5.1 Azul Institucional — `#12395D`

Representa:

- confiança;
- seriedade;
- gestão;
- governança;
- estabilidade;
- inteligência técnica.

Uso recomendado:

- títulos principais;
- menu;
- rodapé;
- fundos institucionais;
- seção de governança;
- overlays em imagens;
- elementos de autoridade.

Evitar:

- usar em excesso com outros tons muito escuros sem respiro visual.

---

### 5.2 Azul Profundo — `#0B1F33`

Representa:

- solidez;
- sofisticação;
- profundidade institucional;
- presença premium.

Uso recomendado:

- rodapé;
- hero com imagem;
- seções escuras;
- cards de governança;
- áreas de maior autoridade visual.

Evitar:

- usar como fundo em muitas seções consecutivas, para não deixar o site pesado.

---

### 5.3 Terracota Institucional — `#B85C38`

Representa:

- continuidade visual com o vermelho;
- energia;
- presença;
- ação;
- calor humano;
- força sem agressividade.

Uso recomendado:

- botões principais;
- hover do menu;
- tags de seção;
- bordas de cards;
- detalhes gráficos;
- chamadas de ação;
- ícones em fundo claro.

Evitar:

- usar terracota em excesso, pois o site pode ficar pesado ou com aparência muito rústica;
- usar como texto pequeno sobre fundo azul escuro;
- combinar diretamente com verde em grandes áreas.

---

### 5.4 Âmbar de Impacto — `#D9902F`

Representa:

- prosperidade;
- desenvolvimento econômico;
- valor;
- impacto;
- Minas;
- energia positiva.

Uso recomendado:

- números de impacto;
- indicadores;
- selos;
- pequenos elementos gráficos;
- detalhes em seções escuras;
- destaques pontuais.

Evitar:

- usar como fundo dominante;
- usar em excesso, para não parecer artificial ou comercial demais.

---

### 5.5 Verde Sustentabilidade — `#3B8C6E`

Representa:

- sustentabilidade;
- meio ambiente;
- impacto social;
- crescimento;
- responsabilidade territorial.

Uso recomendado:

- projetos ambientais;
- ODS;
- sustentabilidade;
- ícones de impacto social;
- indicadores ambientais;
- elementos pontuais em seções temáticas.

Evitar:

- transformar o verde na cor principal do site;
- usar diretamente junto com terracota em grandes áreas;
- usar como elemento fino sobre azul profundo.

---

### 5.6 Areia Institucional — `#F4EFE7`

Representa:

- acolhimento;
- leveza;
- sofisticação;
- calor visual;
- leitura confortável.

Uso recomendado:

- fundo de seções claras;
- blocos alternados;
- áreas de leitura;
- cards suaves;
- seções institucionais menos densas.

Evitar:

- usar com textos muito claros;
- usar sem contraste suficiente nos cards.

---

## 6. Combinações aprovadas

| Fundo | Elemento acima | Avaliação |
|---|---|---|
| `#FFFFFF` | `#12395D` | Excelente |
| `#FFFFFF` | `#B85C38` | Excelente |
| `#FFFFFF` | `#1F2933` | Excelente |
| `#F4EFE7` | `#12395D` | Excelente |
| `#F4EFE7` | `#B85C38` | Muito boa |
| `#F4EFE7` | `#1F2933` | Excelente |
| `#12395D` | `#FFFFFF` | Excelente |
| `#12395D` | `#D9902F` | Muito boa para detalhes |
| `#12395D` | `#F4EFE7` | Excelente |
| `#0B1F33` | `#FFFFFF` | Excelente |
| `#0B1F33` | `#D9902F` | Muito boa |
| `#B85C38` | `#FFFFFF` | Boa para botões |
| `#D9902F` | `#12395D` | Excelente para selos e tags |
| `#3B8C6E` | `#FFFFFF` | Boa para botões e elementos maiores |

---

## 7. Combinações que devem ser evitadas

| Combinação | Motivo |
|---|---|
| Fundo azul escuro + terracota em texto pequeno | Pode perder contraste e sofisticação |
| Fundo azul escuro + verde fechado | Pode parecer apagado ou sem força |
| Terracota + verde em grandes blocos | Pode parecer rústico e pouco institucional |
| Laranja puro + azul | Pode parecer campanha política, evento promocional ou varejo |
| Âmbar em excesso | Pode parecer dourado artificial ou comercial demais |
| Terracota em excesso | Pode deixar o site pesado e marrom |
| Verde como cor principal | Pode deslocar demais a identidade atual da marca |

---

## 8. Distribuição recomendada no site

| Elemento do site | Cor recomendada |
|---|---|
| Header | Branco |
| Menu | Azul institucional |
| Hover do menu | Terracota |
| Hero | Overlay azul profundo |
| Título do Hero | Branco |
| Palavra de destaque no Hero | Âmbar ou terracota |
| Botão principal | Terracota |
| Hover do botão principal | Azul institucional |
| Botão secundário | Transparente com borda branca ou azul |
| Títulos de seção | Azul institucional |
| Subtítulos | Texto secundário |
| Tags de seção | Terracota ou âmbar |
| Ícones gerais | Terracota |
| Ícones de sustentabilidade | Verde |
| Números de impacto | Âmbar |
| Cards | Branco |
| Hover de cards | Borda terracota |
| Fundo alternado de seção | Areia |
| Seção de governança | Azul profundo |
| Rodapé | Azul profundo |
| Projetos ambientais | Verde como detalhe |
| Projetos econômicos | Âmbar como detalhe |
| Projetos sociais | Terracota como detalhe |
| Projetos de tecnologia, pesquisa e diagnóstico | Azul institucional ou azul de apoio |

---

## 9. Aplicação prática no CSS do site

### 9.1 Substituição da variável antiga

Se o site usa algo como:

```css
--accent-red: #d32f2f;
```

Não é recomendado substituir tudo por uma única nova cor.

Em vez disso, criar variáveis por função:

```css
--cor-acao: #B85C38;
--cor-destaque: #D9902F;
--cor-sustentabilidade: #3B8C6E;
--cor-institucional: #12395D;
```

---

### 9.2 Menu

```css
.main-menu li a {
    color: var(--azul-institucional);
}

.main-menu li a:hover {
    color: var(--terracota-institucional);
}

.main-menu li a::after {
    background-color: var(--terracota-institucional);
}
```

---

### 9.3 Botão principal

```css
.btn-primary {
    background-color: var(--terracota-institucional);
    color: var(--branco);
    border: 2px solid var(--terracota-institucional);
}

.btn-primary:hover {
    background-color: var(--azul-institucional);
    border-color: var(--azul-institucional);
    color: var(--branco);
}
```

---

### 9.4 Botão secundário

```css
.btn-outline {
    background-color: transparent;
    color: var(--azul-institucional);
    border: 2px solid var(--azul-institucional);
}

.btn-outline:hover {
    color: var(--terracota-institucional);
    border-color: var(--terracota-institucional);
}
```

---

### 9.5 Hero com overlay institucional

```css
.hero {
    background-image: linear-gradient(
        rgba(11, 31, 51, 0.82),
        rgba(18, 57, 93, 0.68)
    ), url('sua-imagem.jpg');
}
```

---

### 9.6 Tags de seção

```css
.section-tag {
    color: var(--terracota-institucional);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
}
```

Alternativa mais sofisticada:

```css
.section-tag {
    color: var(--ambar-impacto);
}
```

---

### 9.7 Títulos

```css
.section-title {
    color: var(--azul-institucional);
}

.section-title .accent-text {
    color: var(--terracota-institucional);
}
```

---

### 9.8 Cards

```css
.service-card {
    background: var(--branco);
    border: 1px solid rgba(18, 57, 93, 0.10);
}

.service-card:hover {
    border-color: var(--terracota-institucional);
    box-shadow: 0 15px 40px rgba(18, 57, 93, 0.10);
}
```

---

### 9.9 Ícones

```css
.service-icon {
    color: var(--terracota-institucional);
}

.sustainability-icon {
    color: var(--verde-sustentabilidade);
}
```

---

### 9.10 Seção escura de governança

```css
.governance-section {
    background-color: var(--azul-profundo);
    color: var(--branco);
}

.governance-section .section-title {
    color: var(--branco);
}

.governance-section .section-tag {
    color: var(--ambar-impacto);
}

.gov-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.gov-card:hover {
    border-color: var(--ambar-impacto);
}

.gov-icon {
    color: var(--ambar-impacto);
}
```

---

### 9.11 Projetos

```css
.project-tag {
    background: var(--terracota-institucional);
    color: var(--branco);
}

.project-link {
    color: var(--terracota-institucional);
}

.project-card:hover {
    border-color: var(--terracota-institucional);
}
```

Para projetos de sustentabilidade:

```css
.project-tag.sustentabilidade {
    background: var(--verde-sustentabilidade);
    color: var(--branco);
}
```

Para projetos econômicos:

```css
.project-tag.economico {
    background: var(--ambar-impacto);
    color: var(--azul-profundo);
}
```

---

## 10. Direção visual recomendada por seção

### Hero

Recomendação:

- imagem institucional forte;
- overlay azul profundo;
- título em branco;
- detalhe em âmbar ou terracota;
- botão principal terracota.

Objetivo:

- transmitir força, seriedade e impacto logo na primeira dobra.

---

### Quem Somos

Recomendação:

- fundo branco;
- título azul;
- tag terracota;
- texto grafite;
- pequenos detalhes em âmbar.

Objetivo:

- leitura institucional e acolhedora.

---

### Parceiros

Recomendação:

- fundo areia;
- logos com boa presença visual;
- detalhes sutis em azul e terracota.

Objetivo:

- valorizar rede, credibilidade e articulação.

---

### Onde Estamos

Recomendação:

- fundo areia ou branco;
- mapa em azul institucional;
- estados ativos em terracota ou âmbar;
- ícones em terracota.

Objetivo:

- mostrar presença territorial com força e clareza.

---

### Governança

Recomendação:

- fundo azul profundo;
- textos em branco;
- detalhes em âmbar;
- cards com bordas suaves.

Objetivo:

- transmitir autoridade, transparência e segurança.

---

### Projetos

Recomendação:

- cards brancos;
- tags por categoria;
- destaque geral em terracota;
- sustentabilidade em verde;
- desenvolvimento econômico em âmbar.

Objetivo:

- organizar a diversidade do portfólio sem poluir a marca.

---

## 11. Sistema de cores por categoria de projeto

| Categoria | Cor sugerida | Hexadecimal |
|---|---:|---:|
| Desenvolvimento Econômico | Âmbar de Impacto | `#D9902F` |
| Sustentabilidade e Meio Ambiente | Verde Sustentabilidade | `#3B8C6E` |
| Infraestrutura | Azul Institucional | `#12395D` |
| Educação e Cultura | Terracota Institucional | `#B85C38` |
| Desenvolvimento Social | Terracota + Areia | `#B85C38` / `#F4EFE7` |
| Esporte e Lazer | Verde Sustentabilidade | `#3B8C6E` |
| Mobilidade Urbana | Azul Profundo | `#0B1F33` |
| Governança e Transparência | Azul Institucional + Âmbar | `#12395D` / `#D9902F` |

---

## 12. Recomendação final

A paleta mais segura e estratégica para a ADESIAP Minas é:

```css
--azul-institucional: #12395D;
--azul-profundo: #0B1F33;
--terracota-institucional: #B85C38;
--ambar-impacto: #D9902F;
--verde-sustentabilidade: #3B8C6E;
--areia-fundo: #F4EFE7;
```

Essa paleta permite:

- manter continuidade com o vermelho atual;
- evitar associações negativas do vermelho;
- dar mais vida ao site;
- preservar seriedade institucional;
- diferenciar áreas de atuação;
- melhorar a percepção de marca;
- tornar o site mais sofisticado e menos apagado.

---

## 13. Frase de defesa para apresentar à cliente

> A proposta não abandona completamente a memória visual da ADESIAP, mas faz uma evolução estratégica do vermelho para uma paleta mais madura, institucional e segura. O terracota preserva energia e presença, o azul fortalece governança e confiança, o âmbar comunica desenvolvimento e impacto, enquanto o verde entra como apoio para sustentabilidade e responsabilidade social. Com isso, a marca ganha vida sem cair em associações políticas, agressivas ou excessivamente promocionais.

---

## 14. Observação importante

A recomendação não é apenas trocar uma cor por outra. O ideal é criar um sistema visual com função clara para cada cor. Assim, a marca ganha consistência, hierarquia e sofisticação.

A troca direta de todo vermelho por terracota já melhoraria o visual, mas a aplicação mais profissional é distribuir as cores por função:

- azul para autoridade;
- terracota para ação;
- âmbar para impacto;
- verde para sustentabilidade;
- areia para acolhimento e respiro visual.
