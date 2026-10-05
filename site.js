document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll('[data-reveal]');
  const root = document.documentElement;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  root.classList.add('has-motion');

  const progressBar = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const form = document.querySelector('#prompt-form');
  if (!form) return;

  const taskField = document.querySelector('#task');
  const contextField = document.querySelector('#context');
  const audienceField = document.querySelector('#audience');
  const toneField = document.querySelector('#tone');
  const output = document.querySelector('#prompt-output');
  const outputTitle = document.querySelector('#output-title');
  const outputState = document.querySelector('#output-state');
  const outputMeta = document.querySelector('#output-meta');
  const copyButton = document.querySelector('#copy-prompt');
  const copyStatus = document.querySelector('#copy-status');
  let generatedPrompt = '';

  const buildPrompt = () => {
    const task = taskField.value.trim();
    if (!task) {
      taskField.focus();
      return;
    }

    const audience = audienceField.value;
    const tone = toneField.value;
    const context = contextField.value.trim();
    const promptParts = [
      `Sən Azərbaycan dilində cavab verən, diqqətli və faydalı köməkçisən. ${task}.`,
      `Cavab ${audience} üçün nəzərdə tutulub. Üslub ${tone} olsun.`,
    ];

    if (context) promptParts.push(`Nəzərə alınmalı əlavə məlumat: ${context}.`);
    promptParts.push('Məlumat çatışmırsa, fərziyyə irəli sürmək əvəzinə əvvəlcə dəqiqləşdirici sual ver. Cavabı aydın və istifadəyə hazır formatda təqdim et.');

    generatedPrompt = promptParts.join('\n\n');
    output.textContent = generatedPrompt;
    outputTitle.textContent = 'Köçürməyə hazırdır';
    outputState.textContent = 'HAZIR';
    outputState.classList.add('is-ready');
    outputMeta.textContent = `AZƏRBAYCAN DİLİ · ${tone.toLocaleUpperCase('az')}`;
    copyButton.disabled = false;
    copyStatus.textContent = '';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    buildPrompt();
  });

  document.querySelectorAll('[data-template]').forEach((button) => {
    button.addEventListener('click', () => {
      taskField.value = button.dataset.template;
      taskField.focus();
      document.querySelector('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  copyButton.addEventListener('click', async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      copyStatus.textContent = 'Prompt kopyalandı. İstifadə etdiyin AI alətinə yapışdır.';
    } catch {
      const temporaryField = document.createElement('textarea');
      temporaryField.value = generatedPrompt;
      temporaryField.setAttribute('readonly', '');
      temporaryField.style.position = 'fixed';
      temporaryField.style.opacity = '0';
      document.body.append(temporaryField);
      temporaryField.select();
      const copied = document.execCommand('copy');
      temporaryField.remove();
      copyStatus.textContent = copied ? 'Prompt kopyalandı. İstifadə etdiyin AI alətinə yapışdır.' : 'Kopyalama alınmadı. Mətni seçib əl ilə kopyala.';
    }
  });
});
