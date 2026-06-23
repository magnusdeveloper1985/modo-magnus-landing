/**
 * MODO MAGNUS — main.js
 * Funcionalidades: Navbar scroll, mobile menu, AOS, counter animation
 */

'use strict';

/* ── 1. NAVBAR SCROLL ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();

/* ── 2. MOBILE MENU ── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const toggle = () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) toggle();
  });
})();

/* ── 3. AOS (Animate On Scroll) ── */
(function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  // Apply delay from data-aos-delay attribute
  elements.forEach(el => {
    const delay = el.getAttribute('data-aos-delay');
    if (delay) el.style.transitionDelay = `${parseInt(delay, 10) / 1000}s`;
  });

  const triggerElement = (el) => {
    el.classList.add('aos-animate');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
  );

  elements.forEach(el => observer.observe(el));

  // Trigger for elements already in viewport on load
  const checkVisible = () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50) {
        triggerElement(el);
        observer.unobserve(el);
      }
    });
  };

  // Run immediately and after a short delay
  checkVisible();
  setTimeout(checkVisible, 200);
  setTimeout(checkVisible, 500);
})();

/* ── 4. COUNTER ANIMATION ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ── 5. FOOTER YEAR ── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── 6. SMOOTH SCROLL OFFSET (navbar compensation) ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navbarH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '72',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── 7. ANAMNESE FORM ── */
(function initAnamneseForm() {
  const form = document.getElementById('anamneseForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitAnamnese');
  const WA_NUMBER = '5562991889779';

  /* ── Helpers ── */
  const getVal = (name) => {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : '';
  };

  const getRadio = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '—';
  };

  const getCheckboxes = (name) => {
    const checked = [...form.querySelectorAll(`input[name="${name}"]:checked`)];
    return checked.length ? checked.map(c => c.value).join(', ') : '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const age = Math.floor((Date.now() - new Date(dateStr)) / (365.25 * 24 * 3600 * 1000));
    return `${d}/${m}/${y} (${age} anos)`;
  };

  /* ── Conditional fields visibility ── */
  const setupConditional = (radioName, triggerValues, targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const update = () => {
      const val = getRadio(radioName);
      const show = triggerValues.includes(val);
      target.style.display = show ? 'block' : 'none';
      if (!show) target.value = '';
    };

    form.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
      r.addEventListener('change', update);
    });
    update();
  };

  setupConditional('doenca_cronica', ['Hipertensão', 'Diabetes', 'Asma', 'Outra'], 'doenca_detalhe');
  setupConditional('cirurgia', ['Sim'], 'cirurgia_detalhe');

  /* ── Validation ── */
  const showError = (input, msg) => {
    input.classList.add('is-invalid');
    let err = input.nextElementSibling;
    if (!err || !err.classList.contains('form-error')) {
      err = document.createElement('span');
      err.className = 'form-error';
      input.parentNode.insertBefore(err, input.nextSibling);
    }
    err.textContent = msg;
    err.classList.add('visible');
  };

  const clearError = (input) => {
    input.classList.remove('is-invalid');
    const err = input.nextElementSibling;
    if (err && err.classList.contains('form-error')) {
      err.classList.remove('visible');
    }
  };

  const validateRequired = () => {
    let valid = true;

    // Text/number/date inputs
    form.querySelectorAll('.form-input[required]').forEach(input => {
      if (!input.value.trim()) {
        showError(input, 'Este campo é obrigatório.');
        valid = false;
      } else {
        clearError(input);
      }
    });

    // Required radio groups
    const requiredRadios = ['rotina_trabalho', 'doenca_cronica', 'cirurgia', 'liberacao_medica', 'nivel', 'objetivo', 'dias_treino', 'tempo_treino', 'local_treino'];
    requiredRadios.forEach(name => {
      const group = form.querySelector(`.chip-group [name="${name}"]`);
      if (!group) return;
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      const container = group.closest('.form-group');
      let err = container ? container.querySelector('.form-error') : null;
      if (!err) {
        err = document.createElement('span');
        err.className = 'form-error';
        if (container) container.appendChild(err);
      }
      if (!checked) {
        err.textContent = 'Por favor, selecione uma opção.';
        err.classList.add('visible');
        valid = false;
      } else {
        err.classList.remove('visible');
      }
    });

    // Pontos fracos (at least one)
    const pontoFraco = form.querySelectorAll('input[name="ponto_fraco"]:checked');
    const pfContainer = form.querySelector('[name="ponto_fraco"]')?.closest('.form-group');
    let pfErr = pfContainer?.querySelector('.form-error');
    if (!pfErr && pfContainer) {
      pfErr = document.createElement('span');
      pfErr.className = 'form-error';
      pfContainer.appendChild(pfErr);
    }
    if (pontoFraco.length === 0) {
      if (pfErr) { pfErr.textContent = 'Selecione pelo menos um grupo muscular.'; pfErr.classList.add('visible'); }
      valid = false;
    } else {
      if (pfErr) pfErr.classList.remove('visible');
    }

    return valid;
  };

  /* ── Build WhatsApp message ── */
  const buildMessage = () => {
    const nome       = getVal('nome');
    const nascimento = formatDate(getVal('nascimento'));
    const peso       = getVal('peso') ? `${getVal('peso')} kg` : '—';
    const altura     = getVal('altura') ? `${getVal('altura')} cm` : '—';
    const email      = getVal('email') || '—';
    const whatsapp   = getVal('whatsapp') || '—';
    const profissao  = getVal('profissao') || '—';
    const rotina     = getRadio('rotina_trabalho');

    const doenca        = getRadio('doenca_cronica');
    const doencaDetalhe = getVal('doenca_detalhe');
    const cirurgia      = getRadio('cirurgia');
    const cirurgiaDetalhe = getVal('cirurgia_detalhe');
    const lesoes        = getCheckboxes('lesao');
    const lesaoDetalhe  = getVal('lesao_detalhe');
    const dores         = getCheckboxes('dor');
    const dorDetalhe    = getVal('dor_detalhe');
    const liberacao     = getRadio('liberacao_medica');

    const nivel         = getRadio('nivel');
    const tecnica       = getRadio('tecnica');
    const outraAtividade = getCheckboxes('outra_atividade');
    const atividadeDetalhe = getVal('outra_atividade_detalhe');

    const objetivo      = getRadio('objetivo');
    const pontoFraco    = getCheckboxes('ponto_fraco');
    const pontoForte    = getCheckboxes('ponto_forte');

    const diasTreino    = getRadio('dias_treino');
    const tempoTreino   = getRadio('tempo_treino');
    const localTreino   = getRadio('local_treino');
    const localDetalhe  = getVal('local_detalhe');

    const observacoes   = getVal('observacoes');

    const lines = [
      `📋 *ANAMNESE — MODO MAGNUS*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `👤 *1. DADOS PESSOAIS*`,
      `• Nome: ${nome}`,
      `• Nascimento: ${nascimento}`,
      `• Peso: ${peso} | Altura: ${altura}`,
      `• E-mail: ${email}`,
      `• WhatsApp: ${whatsapp}`,
      `• Profissão: ${profissao}`,
      `• Rotina de trabalho: ${rotina}`,
      ``,
      `🏥 *2. SAÚDE E ORTOPÉDICO*`,
      `• Doença crônica: ${doenca}${doencaDetalhe ? ` → ${doencaDetalhe}` : ''}`,
      `• Cirurgia: ${cirurgia}${cirurgiaDetalhe ? ` → ${cirurgiaDetalhe}` : ''}`,
      `• Lesões/Hérnias: ${lesoes}${lesaoDetalhe ? `\n  Detalhe: ${lesaoDetalhe}` : ''}`,
      `• Dores em movimentos: ${dores}${dorDetalhe ? `\n  Detalhe: ${dorDetalhe}` : ''}`,
      `• Liberação médica: ${liberacao}`,
      ``,
      `🏋️ *3. HISTÓRICO DE TREINO*`,
      `• Nível: ${nivel}`,
      `• Técnica/Consciência corporal: ${tecnica}`,
      `• Outras atividades: ${outraAtividade}${atividadeDetalhe ? ` → ${atividadeDetalhe}` : ''}`,
      ``,
      `🎯 *4. OBJETIVOS E FOCO ESTÉTICO*`,
      `• Objetivo principal: ${objetivo}`,
      `• Pontos fracos (prioridade): ${pontoFraco}`,
      `• Pontos fortes: ${pontoForte}`,
      ``,
      `⏰ *5. DISPONIBILIDADE E ESTRUTURA*`,
      `• Dias de treino/semana: ${diasTreino}`,
      `• Tempo por sessão: ${tempoTreino}`,
      `• Local de treino: ${localTreino}${localDetalhe ? ` → ${localDetalhe}` : ''}`,
      ``,
      observacoes ? `💬 *OBSERVAÇÕES FINAIS*\n${observacoes}\n` : '',
      `📸 *FOTOS DE AVALIAÇÃO*`,
      `Vou enviar as fotos em seguida (frente, costas, perfil direito e perfil esquerdo).`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Enviado via modomagnus.com.br`,
    ];

    return lines.filter(l => l !== '').join('\n');
  };

  /* ── Submit handler ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateRequired()) {
      // Scroll to first error
      const firstInvalid = form.querySelector('.is-invalid, .form-error.visible');
      if (firstInvalid) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '72', 10);
        const top = firstInvalid.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    // Loading state
    submitBtn.classList.add('btn--loading');
    submitBtn.textContent = 'Preparando mensagem...';

    setTimeout(() => {
      const msg = buildMessage();
      const encoded = encodeURIComponent(msg);
      const url = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

      // Open WhatsApp
      window.open(url, '_blank', 'noopener,noreferrer');

      // Show success state
      submitBtn.classList.remove('btn--loading');

      // Replace form with success message
      const successHtml = `
        <div class="form-success visible" role="alert" aria-live="polite">
          <div class="form-success__icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="form-success__title">Anamnese Enviada!</h3>
          <p class="form-success__text">
            Suas respostas foram formatadas e o WhatsApp foi aberto automaticamente. Caso não tenha aberto, verifique se o pop-up foi bloqueado.<br /><br />
            <strong>Lembre-se:</strong> envie também as 4 fotos de avaliação (frente, costas, perfil direito e esquerdo) pelo WhatsApp.
          </p>
          <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
            Abrir WhatsApp novamente
          </a>
        </div>
      `;

      form.innerHTML = successHtml;

      // Scroll to success message
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '72', 10);
      const top = form.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 600);
  });

  /* ── Live clear errors on input ── */
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const container = input.closest('.form-group');
      const err = container?.querySelector('.form-error');
      if (err) err.classList.remove('visible');
    });
  });

})();
