/* Feliz aniversário, mãe — carrossel e bolo */
(() => {
  'use strict';

  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------
     Carrossel
     --------------------------------------------------------- */
  const carrossel = document.querySelector('[data-carrossel]');
  if (carrossel) iniciarCarrossel(carrossel);

  function iniciarCarrossel(raiz) {
    const INTERVALO = 5500;
    const palco = raiz.querySelector('.palco');
    const slides = Array.from(raiz.querySelectorAll('.slide'));
    const total = slides.length;
    const pontosBox = raiz.querySelector('[data-pontos]');
    const atualEl = raiz.querySelector('[data-atual]');
    const totalEl = raiz.querySelector('[data-total]');
    const anuncio = raiz.querySelector('[data-anuncio]');
    const botaoPausa = raiz.querySelector('[data-pausa]');
    const rotuloPausa = raiz.querySelector('[data-pausa-rotulo]');

    let atual = 0;
    let tocando = !reduzMovimento.matches;
    let mouseEmCima = false;
    let focoDentro = false;
    let visivel = false;
    let timer = null;

    totalEl.textContent = total;

    const pontos = slides.map((slide, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ponto';
      b.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
      b.addEventListener('click', () => ir(i, true));
      pontosBox.appendChild(b);

      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'foto');
      slide.setAttribute('aria-label', `${i + 1} de ${total}`);
      slide.addEventListener('click', () => {
        if (arrastou) return;
        const pos = slide.dataset.pos;
        if (pos === '-1') anterior(true);
        if (pos === '1') proxima(true);
      });
      return b;
    });

    // distância circular entre a foto i e a atual (-total/2 .. total/2)
    function distancia(i) {
      let d = i - atual;
      if (d > total / 2) d -= total;
      if (d <= -total / 2) d += total;
      return d;
    }

    function desenhar() {
      slides.forEach((slide, i) => {
        const d = distancia(i);
        slide.dataset.pos = d === 0 ? '0' : d === -1 ? '-1' : d === 1 ? '1' : d < 0 ? '-2' : '2';
        slide.setAttribute('aria-hidden', String(d !== 0));
      });
      pontos.forEach((p, i) => {
        if (i === atual) p.setAttribute('aria-current', 'true');
        else p.removeAttribute('aria-current');
      });
      atualEl.textContent = atual + 1;
    }

    function ir(indice, peloUsuario) {
      atual = (indice + total) % total;
      desenhar();
      if (peloUsuario) {
        const legenda = slides[atual].querySelector('figcaption');
        anuncio.textContent = `Foto ${atual + 1} de ${total}: ${legenda ? legenda.textContent : ''}`;
      }
      agendar();
    }
    const proxima = (u) => ir(atual + 1, u);
    const anterior = (u) => ir(atual - 1, u);

    raiz.querySelector('[data-proxima]').addEventListener('click', () => proxima(true));
    raiz.querySelector('[data-anterior]').addEventListener('click', () => anterior(true));

    /* passagem automática */
    function agendar() {
      clearTimeout(timer);
      if (tocando && visivel && !mouseEmCima && !focoDentro && !document.hidden) {
        timer = setTimeout(() => proxima(false), INTERVALO);
      }
    }

    function atualizarBotaoPausa() {
      botaoPausa.dataset.estado = tocando ? 'tocando' : 'pausado';
      rotuloPausa.textContent = tocando ? 'Pausar' : 'Passar sozinho';
      anuncio.setAttribute('aria-live', tocando ? 'off' : 'polite');
    }

    botaoPausa.addEventListener('click', () => {
      tocando = !tocando;
      atualizarBotaoPausa();
      agendar();
    });

    raiz.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { mouseEmCima = true; agendar(); } });
    raiz.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { mouseEmCima = false; agendar(); } });
    // pausa quando o foco chega pelo teclado (clique com o mouse não pausa)
    raiz.addEventListener('focusin', (e) => {
      let peloTeclado = true;
      try { peloTeclado = e.target.matches(':focus-visible'); } catch (_) { /* navegador antigo */ }
      focoDentro = peloTeclado;
      agendar();
    });
    raiz.addEventListener('focusout', (e) => {
      if (!raiz.contains(e.relatedTarget)) { focoDentro = false; agendar(); }
    });
    document.addEventListener('visibilitychange', agendar);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => {
        visivel = entrada.isIntersecting;
        agendar();
      }, { threshold: 0.45 }).observe(palco);
    } else {
      visivel = true;
    }

    /* teclado: setas quando o álbum está na tela */
    document.addEventListener('keydown', (e) => {
      if (!visivel || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); proxima(true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); anterior(true); }
    });

    /* arrastar com o dedo ou o mouse */
    let inicioX = null;
    let inicioY = null;
    let arrastou = false;

    palco.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      inicioX = e.clientX;
      inicioY = e.clientY;
      arrastou = false;
    });
    palco.addEventListener('pointerup', (e) => {
      if (inicioX === null) return;
      const dx = e.clientX - inicioX;
      const dy = e.clientY - inicioY;
      inicioX = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        arrastou = true;
        if (dx < 0) proxima(true); else anterior(true);
        setTimeout(() => { arrastou = false; }, 0);
      }
    });
    palco.addEventListener('pointercancel', () => { inicioX = null; });

    atualizarBotaoPausa();
    desenhar();
  }

  /* pausa as ondas e a jangada quando a abertura sai da tela */
  const ceu = document.querySelector('.ceu');
  if (ceu && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      ceu.classList.toggle('fora-da-tela', !e.isIntersecting);
    }).observe(ceu);
  }

  /* ---------------------------------------------------------
     Bolo: soprar a vela
     --------------------------------------------------------- */
  const bolo = document.querySelector('[data-bolo]');
  if (bolo) {
    const rotulo = bolo.querySelector('[data-bolo-rotulo]');
    const msg = document.querySelector('[data-bolo-msg]');

    bolo.addEventListener('click', () => {
      const apagada = bolo.hasAttribute('data-apagada');
      if (!apagada) {
        bolo.setAttribute('data-apagada', '');
        rotulo.textContent = 'Acender de novo';
        msg.hidden = false;
        if (!reduzMovimento.matches) confete(bolo.querySelector('svg'));
      } else {
        bolo.removeAttribute('data-apagada');
        rotulo.textContent = 'Soprar a vela';
        msg.hidden = true;
      }
    });
  }

  function confete(origem) {
    const r = origem.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.18;
    const cores = ['#F4B9C8', '#E58FA8', '#9FD9D0', '#FBE3D3', '#FFFFFF', '#F7CFD9', '#B4506E'];

    for (let i = 0; i < 70; i++) {
      const p = document.createElement('span');
      p.className = 'petala';
      const w = 6 + Math.random() * 8;
      p.style.width = `${w}px`;
      p.style.height = `${w * (Math.random() < 0.5 ? 1 : 1.6)}px`;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.background = cores[i % cores.length];
      if (Math.random() < 0.35) p.style.borderRadius = '50%';
      document.body.appendChild(p);

      const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
      const forca = 160 + Math.random() * 260;
      const dx = Math.cos(angulo) * forca;
      const dy = Math.sin(angulo) * forca;
      const queda = 280 + Math.random() * 340;
      const giro = (Math.random() - 0.5) * 900;

      const anim = p.animate([
        { transform: 'translate(-50%, -50%) translate(0, 0) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(.15,.75,.35,1)' },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.35, easing: 'cubic-bezier(.45,0,.85,.6)' },
        { transform: `translate(-50%, -50%) translate(${dx * 1.35}px, ${dy + queda}px) rotate(${giro}deg)`, opacity: 0 }
      ], { duration: 1700 + Math.random() * 1300, fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  }
})();
