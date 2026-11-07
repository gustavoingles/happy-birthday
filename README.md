# Feliz aniversário, mãe

Site estático: só HTML, CSS e JavaScript, sem build e sem dependências externas (as fontes já estão na pasta `fonts/`).

```
index.html   conteúdo (fotos, legendas, carta)
style.css    visual
script.js    carrossel e bolo
fotos/       01.jpg … 10.jpg, em ordem cronológica (sem metadados/GPS)
fonts/       Fraunces e Caveat (licença OFL)
icone.png    ícone quando alguém salva o site na tela de início do iPhone
```

## Publicar

- **Netlify Drop**: arraste a pasta inteira em https://app.netlify.com/drop
- **GitHub Pages**: suba os arquivos num repositório e ative Settings → Pages → branch `main`, pasta `/ (root)`
- **Vercel / Cloudflare Pages**: importe a pasta como projeto estático, sem comando de build

Para testar localmente: `python3 -m http.server` dentro da pasta e abra http://localhost:8000

## Editar

- **Legendas**: cada foto é um `<figure class="slide">` no `index.html`; troque o texto do `<figcaption>`.
- **Trocar ou adicionar fotos**: coloque o arquivo em `fotos/` e copie um bloco `<figure class="slide">`. Os pontinhos e o contador se ajustam sozinhos.
- **Inclinação de cada polaroide**: `--giro` (foto) e `--fita` (fita adesiva) no atributo `style` do `<figure>`.
- **Tempo do carrossel**: `INTERVALO` no `script.js` (em milissegundos).
- **Prévia no WhatsApp**: depois de publicar, descomente a linha `og:image` no `<head>` com o endereço completo de uma foto.
