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
