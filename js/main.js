/**
 * BORRACHARIA MÓVEL 24 HORAS BODOQUE — JAVASCRIPT PRINCIPAL
 * Otimizado para Rastreamento de Conversão (Google Ads / GA4),
 * Envio de Geolocalização Instantânea para WhatsApp e Interatividade.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhoneTracking();
  initWhatsAppTracking();
  initGpsEmergencyButton();
  initFaqAccordion();
  initLiveStatusIndicator();
  initStickyBarDismiss();
  initPanicMode();
  initWizard();
  initTransparency();
});

// Número oficial do Bodoque
const BODOQUE_PHONE = '5534991032716';
const BODOQUE_DISPLAY_PHONE = '(34) 99103-2716';

/**
 * Disparador unificado de conversão para Google Ads e Google Analytics 4 (DataLayer)
 */
function trackConversion(action, label) {
  // Push para Google Tag Manager / GA4 dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'conversion_event',
    conversion_action: action,
    conversion_label: label,
    timestamp: new Date().toISOString()
  });

  // Disparo direto via gtag (caso configurado)
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      'event_category': 'Emergencia_Borracharia',
      'event_label': label,
      'value': 1.0
    });
  }

  console.log(`[Google Ads Tracking] Conversão registrada: ${action} (${label})`);
}

/**
 * Rastreia cliques nos links de chamada telefônica (tel:)
 */
function initPhoneTracking() {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const position = link.getAttribute('data-tracking-pos') || 'geral';
      trackConversion('ads_call_click', `Ligacao_${position}`);
    });
  });
}

/**
 * Rastreia cliques nos links de WhatsApp
 */
function initWhatsAppTracking() {
  const waLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
  waLinks.forEach(link => {
    link.addEventListener('click', () => {
      const position = link.getAttribute('data-tracking-pos') || 'geral';
      trackConversion('ads_whatsapp_click', `WhatsApp_${position}`);
    });
  });
}

/**
 * Funcionalidade Exclusiva: Envio de Localização GPS em Tempo Real para o WhatsApp
 * Agiliza o socorro do motorista sem que ele precise tentar explicar o local exato.
 */
function initGpsEmergencyButton() {
  const gpsBtn = document.getElementById('btn-gps-share');
  if (!gpsBtn) return;

  gpsBtn.addEventListener('click', () => {
    const originalText = gpsBtn.innerHTML;
    gpsBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
      </svg>
      Obtendo seu GPS... Aguarde
    `;
    gpsBtn.disabled = true;

    if (!navigator.geolocation) {
      fallbackGpsRedirect("Geolocalização não suportada no aparelho");
      gpsBtn.innerHTML = originalText;
      gpsBtn.disabled = false;
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 9000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        
        trackConversion('ads_gps_share', 'GPS_Sucesso');

        const message = encodeURIComponent(
          `🚨 *PEDIDO DE SOCORRO URGENTE — BORRACHARIA MÓVEL BODOQUE*\n\n` +
          `Olá Bodoque! Meu pneu furou e preciso de atendimento rápido.\n` +
          `📍 *Minha localização exata no mapa:* ${mapsLink}\n\n` +
          `(Mensagem enviada pelo botão de GPS da sua página de socorro)`
        );

        const waUrl = `https://wa.me/${BODOQUE_PHONE}?text=${message}`;
        window.open(waUrl, '_blank');

        gpsBtn.innerHTML = originalText;
        gpsBtn.disabled = false;
      },
      (error) => {
        console.warn('GPS Error or Denied:', error.message);
        trackConversion('ads_gps_share', 'GPS_Negado_Ou_Timeout');
        fallbackGpsRedirect("Permissão negada ou timeout de GPS");
        gpsBtn.innerHTML = originalText;
        gpsBtn.disabled = false;
      },
      options
    );
  });
}

/**
 * Fallback caso o usuário negue a permissão de GPS ou o aparelho não tenha sinal
 */
function fallbackGpsRedirect(reason) {
  const message = encodeURIComponent(
    `🚨 *PEDIDO DE SOCORRO URGENTE — BORRACHARIA BODOQUE*\n\n` +
    `Olá Bodoque! Meu pneu furou e preciso de atendimento 24h em Uberlândia.\n` +
    `Vou compartilhar minha localização em tempo real nesta conversa a seguir!`
  );
  const waUrl = `https://wa.me/${BODOQUE_PHONE}?text=${message}`;
  window.open(waUrl, '_blank');
}

/**
 * Accordion Interativo da Seção de Dúvidas Frequentes (FAQ)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fecha outros abertos para manter visual limpo
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * Barra mobile fixa pode ser dispensada pelo usuário
 */
function initStickyBarDismiss() {
  const bar = document.getElementById('mobile-sticky-bar');
  const closeBtn = document.getElementById('mobile-sticky-close');
  if (!bar || !closeBtn) return;
  try {
    if (sessionStorage.getItem('stickyDismissed') === '1') {
      bar.classList.add('is-hidden');
      document.body.classList.add('sticky-dismissed');
      return;
    }
  } catch (e) { /* sessionStorage indisponível, segue normal */ }
  closeBtn.addEventListener('click', () => {
    bar.classList.add('is-hidden');
    document.body.classList.add('sticky-dismissed');
    try { sessionStorage.setItem('stickyDismissed', '1'); } catch (e) {}
    trackConversion('ui_interaction', 'StickyBar_Fechada');
  });
}

/**
 * MODO PÂNICO — overlay de emergência com Wake Lock (tela sempre ligada)
 */
let panicWakeLock = null;
async function requestPanicWakeLock() {
  try {
    if ('wakeLock' in navigator && navigator.wakeLock.request) {
      panicWakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (e) { /* Wake Lock indisponível, segue normal */ }
}
async function releasePanicWakeLock() {
  try {
    if (panicWakeLock) { await panicWakeLock.release(); panicWakeLock = null; }
  } catch (e) { /* ignora */ }
}
function initPanicMode() {
  const openBtn = document.getElementById('panic-open');
  const overlay = document.getElementById('panic-overlay');
  const closeBtn = document.getElementById('panic-close');
  const gpsBtn = document.getElementById('panic-gps');
  const gpsStatus = document.getElementById('panic-gps-status');
  if (!openBtn || !overlay || !closeBtn) return;

  const open = () => {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestPanicWakeLock();
    trackConversion('panic_mode', 'Panico_Aberto');
    closeBtn.focus();
  };
  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    releasePanicWakeLock();
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => {
    close();
    trackConversion('panic_mode', 'Panico_Fechado');
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !overlay.hidden) requestPanicWakeLock();
  });

  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      trackConversion('panic_mode', 'Panico_GPS_Clique');
      if (gpsStatus) gpsStatus.textContent = 'Obtendo seu GPS...';
      gpsBtn.disabled = true;
      if (!navigator.geolocation) {
        fallbackGpsRedirect('GPS indisponível no aparelho');
        if (gpsStatus) gpsStatus.textContent = '1 toque, sem digitar nada';
        gpsBtn.disabled = false;
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
          trackConversion('ads_gps_share', 'GPS_Panico_Sucesso');
          const message = encodeURIComponent(
            `🚨 *SOCORRO URGENTE — MODO PÂNICO*\n\n` +
            `Estou em possível perigo no acostamento e preciso de atendimento IMEDIATO.\n` +
            `📍 *Minha localização exata:* ${mapsLink}\n\n` +
            `(Enviado pelo botão SOS da página)`
          );
          window.open(`https://wa.me/${BODOQUE_PHONE}?text=${message}`, '_blank');
          if (gpsStatus) gpsStatus.textContent = 'Localização enviada! Fale no WhatsApp.';
          gpsBtn.disabled = false;
        },
        () => {
          trackConversion('ads_gps_share', 'GPS_Panico_Negado');
          fallbackGpsRedirect('Permissão de GPS negada no modo pânico');
          if (gpsStatus) gpsStatus.textContent = '1 toque, sem digitar nada';
          gpsBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
      );
    });
  }
}

/**
 * WIZARD DE DIAGNÓSTICO — 3 toques geram a mensagem WhatsApp perfeita
 */
const WIZARD_DATA = {
  problema: [
    { id: 'furou', label: 'Furou (prego, parafuso)', icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>' },
    { id: 'murchou', label: 'Murchou / esvaziou', icon: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2"/>' },
    { id: 'rasgou', label: 'Rasgou / estourou', icon: '<path d="M12 2L2 20h20L12 2zm0 6l6 11H6l6-11z"/>' },
    { id: 'nao-sei', label: 'Não sei dizer', icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"/>' }
  ],
  veiculo: [
    { id: 'carro', label: 'Carro / SUV', icon: '<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14a2 2 0 0 1 2 2v4h-2.2M5 11a2 2 0 0 0-2 2v4h2.2"/>' },
    { id: 'moto', label: 'Moto', icon: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M5.5 14V9l-2-3h4l3 5h6l3 5"/>' },
    { id: 'caminhonete', label: 'Caminhonete / Van', icon: '<path d="M1 8h14v8H1zM15 11h4l3 3v2h-7z"/>' },
    { id: 'caminhao', label: 'Caminhão / Carreta', icon: '<path d="M1 8h14v8H1zM15 11h4l3 3v2h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>' }
  ],
  local: [
    { id: 'cidade', label: 'Na cidade (bairro/rua)', icon: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/>' },
    { id: 'rodovia', label: 'Na rodovia (BR + km)', icon: '<path d="M4 21L10 3M20 21L14 3M12 6v2m0 4v2m0 4v2"/>' },
    { id: 'nao-sei-local', label: 'Não sei explicar (uso GPS)', icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' }
  ]
};
const WIZARD_QUESTIONS = {
  problema: 'O que aconteceu com o pneu?',
  veiculo: 'Qual é o seu veículo?',
  local: 'Onde você está parado?'
};
function initWizard() {
  const body = document.getElementById('wizard-body');
  const progress = document.getElementById('wizard-progress');
  if (!body) return;
  const state = { problema: null, veiculo: null, local: null };
  const steps = ['problema', 'veiculo', 'local'];

  function setProgress(current) {
    if (!progress) return;
    progress.querySelectorAll('li').forEach((li) => {
      const s = Number(li.getAttribute('data-step'));
      li.classList.toggle('is-active', s === current);
      li.classList.toggle('is-done', s < current);
    });
  }
  function iconSvg(path) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${path}</svg>`;
  }
  function renderStep(stepKey) {
    const idx = steps.indexOf(stepKey);
    setProgress(idx + 1);
    const opts = WIZARD_DATA[stepKey].map((o) =>
      `<button type="button" class="wizard-option" data-step="${stepKey}" data-value="${o.id}" data-label="${o.label}">${iconSvg(o.icon)}${o.label}</button>`
    ).join('');
    body.innerHTML = `
      <h3 class="wizard-question">${WIZARD_QUESTIONS[stepKey]}</h3>
      <div class="wizard-options">${opts}</div>
      ${idx > 0 ? '<button type="button" class="wizard-back" id="wizard-back">← Voltar</button>' : ''}
    `;
    body.querySelectorAll('.wizard-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        state[stepKey] = { id: btn.getAttribute('data-value'), label: btn.getAttribute('data-label') };
        trackConversion('wizard', `Wizard_${stepKey}_${state[stepKey].id}`);
        if (idx < steps.length - 1) renderStep(steps[idx + 1]);
        else renderResult();
      });
    });
    const back = document.getElementById('wizard-back');
    if (back) back.addEventListener('click', () => renderStep(steps[idx - 1]));
  }
  function renderResult() {
    setProgress(4);
    const msg = encodeURIComponent(
      `🔧 *PEDIDO PRONTO — DIAGNÓSTICO DO SITE*\n\n` +
      `• Problema: ${state.problema.label}\n` +
      `• Veículo: ${state.veiculo.label}\n` +
      `• Local: ${state.local.label}\n\n` +
      `Preciso de socorro agora. Vou mandar minha localização e uma foto do pneu em seguida!`
    );
    body.innerHTML = `
      <h3 class="wizard-question">Pedido pronto! É só enviar 👇</h3>
      <div class="wizard-summary">
        <strong>Problema:</strong> ${state.problema.label}<br>
        <strong>Veículo:</strong> ${state.veiculo.label}<br>
        <strong>Local:</strong> ${state.local.label}
      </div>
      <div class="wizard-result-actions">
        <a href="https://wa.me/${BODOQUE_PHONE}?text=${msg}" target="_blank" rel="noopener" class="btn-cta btn-cta-wa" data-tracking-pos="wizard_result_wa">Enviar no WhatsApp</a>
        <a href="tel:+${BODOQUE_PHONE}" class="btn-cta btn-cta-call" data-tracking-pos="wizard_result_call">Ligar agora</a>
      </div>
      <p class="wizard-tip">Dica: tire uma foto do pneu e do painel e mande na conversa — o Bodoque já sai com o equipamento certo.</p>
      <button type="button" class="wizard-back" id="wizard-restart">↺ Recomeçar diagnóstico</button>
    `;
    trackConversion('wizard', 'Wizard_Concluido');
    initPhoneTracking();
    initWhatsAppTracking();
    document.getElementById('wizard-restart').addEventListener('click', () => {
      state.problema = state.veiculo = state.local = null;
      renderStep('problema');
    });
  }
  renderStep('problema');
}

/**
 * TRANSPARÊNCIA RADICAL — ETA vivo (Haversine), preço estimado e ticker
 */
const BODOQUE_BASE = { lat: -18.93285, lng: -48.31422 };
function haversineKm(a, b, c, d) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(c - a);
  const dLng = rad(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const PRICE_BASE = { troca: 90, conserto: 80, ar: 50, rodovia: 150 };
const PRICE_VEHICLE = { carro: 1.0, moto: 0.8, caminhonete: 1.25, caminhao: 2.2 };
const PRICE_PERIOD = { dia: 1.0, noite: 1.3, madrugada: 1.55 };
const LIVE_FEED = [
  'há 24 min — troca de estepe no Santa Mônica',
  'há 47 min — conserto de furo no Tubalina',
  'há 1h12 — socorro de caminhão na BR-050',
  'há 2h05 — calibragem no Centro',
  'há 3h40 — socorro de moto no Planalto',
  'há 5h10 — furo de madrugada no Anel Viário'
];
function initTransparency() {
  initEta();
  initPriceCalc();
  initLiveTicker();
}
function initEta() {
  const btn = document.getElementById('eta-btn');
  const out = document.getElementById('eta-result');
  if (!btn || !out) return;
  btn.addEventListener('click', () => {
    trackConversion('eta', 'ETA_Clique');
    if (!navigator.geolocation) {
      out.innerHTML = 'Seu aparelho não tem GPS. <strong><a href="tel:+5534991032716">Ligue (34) 99103-2716</a></strong> e informe o bairro ou km da rodovia.';
      return;
    }
    out.textContent = 'Calculando sua distância até a base...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = haversineKm(BODOQUE_BASE.lat, BODOQUE_BASE.lng, pos.coords.latitude, pos.coords.longitude);
        const lo = Math.max(12, Math.round(10 + km * 2));
        const hi = Math.round(lo * 1.5);
        out.innerHTML = `Você está a <strong>~${km.toFixed(1)} km</strong> da base. Chegada estimada: <strong>${lo}–${hi} min</strong> (varia com trânsito).`;
        trackConversion('eta', 'ETA_Sucesso');
        btn.disabled = false;
      },
      () => {
        out.innerHTML = 'GPS negado — sem problema. <strong><a href="tel:+5534991032716">Ligue (34) 99103-2716</a></strong> e diga o bairro ou km da BR.';
        trackConversion('eta', 'ETA_Negado');
        btn.disabled = false;
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
}
function initPriceCalc() {
  const v = document.getElementById('price-veiculo');
  const s = document.getElementById('price-servico');
  const p = document.getElementById('price-periodo');
  const out = document.getElementById('price-result');
  if (!v || !s || !p || !out) return;
  const calc = () => {
    const mid = PRICE_BASE[s.value] * PRICE_VEHICLE[v.value] * PRICE_PERIOD[p.value];
    const lo = Math.round((mid * 0.85) / 5) * 5;
    const hi = Math.round((mid * 1.15) / 5) * 5;
    out.innerHTML = `Estimativa: <strong>R$ ${lo} – R$ ${hi}</strong>`;
  };
  [v, s, p].forEach((el) => el.addEventListener('change', () => {
    calc();
    trackConversion('price_calc', `Preco_${v.value}_${s.value}_${p.value}`);
  }));
  calc();
}
function initLiveTicker() {
  const el = document.getElementById('live-ticker');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % LIVE_FEED.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = LIVE_FEED[i];
      el.style.opacity = '1';
    }, 300);
  }, 5000);
}

/**
 * Indicador de Status 24h em Tempo Real
 */
function initLiveStatusIndicator() {
  const statusEl = document.getElementById('live-operating-status');
  if (!statusEl) return;

  // Como o Bodoque atende 24h ininterruptas todos os dias:
  const now = new Date();
  const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' };
  const timeString = now.toLocaleTimeString('pt-BR', options);

  statusEl.innerHTML = `
    <span class="live-pulse"></span>
    Plantão Ativo Agora (${timeString}) — 24 Horas
  `;
}
