let currentStep = 1;

const steps = document.querySelectorAll('.form-step');
const sidebarIndicators = document.querySelectorAll('.step');

const btnNextList = document.querySelectorAll('.btn-next');
const btnBackList = document.querySelectorAll('.btn-back');
const btnConfirm = document.getElementById('btn-confirm');
const btnChangePlan = document.getElementById('btn-change');

// Seletores do Passo 1 (Validação)
const inputName = document.getElementById('name');
const inputEmail = document.getElementById('email');
const inputPhone = document.getElementById('phone');

// Seletores do Passo 2 (Toggle Mensal/Anual)
const toggleBilling = document.getElementById('billing-frequency');
const labelMonthly = document.querySelector('.toggle-label.monthly');
const labelYearly = document.querySelector('.toggle-label.yearly');
const planPrices = document.querySelectorAll('.plan-price');
const planPromos = document.querySelectorAll('.plan-promo');
const addonPrices = document.querySelectorAll('.addon-price');

function updateUI() {
  // Esconde todos os passos e remove a classe 'active' da sidebar
  steps.forEach(step => step.classList.add('hidden'));
  sidebarIndicators.forEach(indicator => indicator.classList.remove('active'));

  // Exibe o passo atual
  document.querySelector(`.step-${currentStep}`).classList.remove('hidden');

  // Atualiza o indicador da sidebar (na etapa 5 o círculo 4 continua ativo)
  const activeIndicator = sidebarIndicators[Math.min(currentStep, 4) - 1];
  activeIndicator.classList.add('active');
  sidebarIndicators.forEach(indicator => indicator.removeAttribute('aria-current'));
  activeIndicator.setAttribute('aria-current', 'step');
}

function validateStep1() {
  let isValid = true;

  const showError = (input, message) => {
    const group = input.closest('.input-group');
    group.classList.add('error');
    group.querySelector('.error-msg').innerText = message;
    input.setAttribute('aria-invalid', 'true');
    isValid = false;
  };

  const clearError = (input) => {
    input.closest('.input-group').classList.remove('error');
    input.removeAttribute('aria-invalid');
  };

  // Nome: obrigatório e com pelo menos 2 caracteres
  const nameValue = inputName.value.trim();
  if (nameValue === '') {
    showError(inputName, 'This field is required');
  } else if (nameValue.length < 2) {
    showError(inputName, 'Valid name required');
  } else {
    clearError(inputName);
  }

  // E-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (inputEmail.value.trim() === '') {
    showError(inputEmail, 'This field is required');
  } else if (!emailRegex.test(inputEmail.value.trim())) {
    showError(inputEmail, 'Valid email required');
  } else {
    clearError(inputEmail);
  }

  // Telefone: só dígitos, espaços, + - ( ) . e de 7 a 15 dígitos
  const phoneRegex = /^\+?[\d\s\-().]+$/;
  const phoneDigits = inputPhone.value.replace(/\D/g, '');
  if (inputPhone.value.trim() === '') {
    showError(inputPhone, 'This field is required');
  } else if (
    !phoneRegex.test(inputPhone.value.trim()) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    showError(inputPhone, 'Valid phone required');
  } else {
    clearError(inputPhone);
  }

  return isValid;
}

toggleBilling.addEventListener('change', () => {
  const isYearly = toggleBilling.checked;
  
  if (isYearly) {
    labelYearly.classList.add('active');
    labelMonthly.classList.remove('active');
  } else {
    labelMonthly.classList.add('active');
    labelYearly.classList.remove('active');
  }
  
  planPrices.forEach(price => {
    price.innerText = isYearly ? price.dataset.yearly : price.dataset.monthly;
  });

  planPromos.forEach(promo => {
    isYearly ? promo.classList.remove('hidden') : promo.classList.add('hidden');
  });
  
  addonPrices.forEach(price => {
    price.innerText = isYearly ? price.dataset.yearly : price.dataset.monthly;
  });
});

function updateSummary() {
  const isYearly = toggleBilling.checked;
  const periodText = isYearly ? 'Yearly' : 'Monthly';
  const periodAbbr = isYearly ? 'yr' : 'mo';
  
  const selectedPlanInput = document.querySelector('input[name="plan"]:checked');
  const planCard = selectedPlanInput.closest('.plan-card');
  const planName = planCard.querySelector('.plan-name').innerText;
  const planPriceString = isYearly 
    ? planCard.querySelector('.plan-price').dataset.yearly 
    : planCard.querySelector('.plan-price').dataset.monthly;
  
  const planPriceNumber = parseInt(planPriceString.replace(/\D/g, ''));
  
  document.getElementById('summary-plan-name').innerText = `${planName} (${periodText})`;
  document.getElementById('summary-plan-price').innerText = planPriceString;
  
  const summaryAddonsList = document.getElementById('summary-addons-list');
  summaryAddonsList.innerHTML = ''; // Limpar lista anterior
  let addonsTotalNumber = 0;

  const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
  
  selectedAddons.forEach(addonInput => {
    const addonCard = addonInput.closest('.addon-card');
    const addonName = addonCard.querySelector('.addon-name').innerText;
    const addonPriceString = isYearly 
      ? addonCard.querySelector('.addon-price').dataset.yearly 
      : addonCard.querySelector('.addon-price').dataset.monthly;

    const addonPriceNumber = parseInt(addonPriceString.replace(/\D/g, ''));
    addonsTotalNumber += addonPriceNumber;
  
  const li = document.createElement('li');
    li.classList.add('summary-addon-item');
    li.innerHTML = `
      <span class="summary-addon-name">${addonName}</span>
      <span class="summary-addon-price">${addonPriceString}</span>
    `;
    summaryAddonsList.appendChild(li);
  });
  
  const total = planPriceNumber + addonsTotalNumber;
  document.getElementById('summary-total-period').innerText = isYearly ? 'year' : 'month';
  document.getElementById('summary-total-price').innerText = `${isYearly ? '' : '+'}$${total}/${periodAbbr}`;
}

btnNextList.forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
  
  if (currentStep === 3) {
      updateSummary();
    }

    currentStep++;
    updateUI();
  });
});

btnBackList.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep--;
    updateUI();
  });
});

btnChangePlan.addEventListener('click', () => {
  currentStep = 2;
  updateUI();
});

btnConfirm.addEventListener('click', (e) => {
  e.preventDefault();
  currentStep = 5;
  updateUI();
});

// Remove o aviso de erro assim que o utilizador começar a digitar
[inputName, inputEmail, inputPhone].forEach(input => {
  input.addEventListener('input', () => {
    input.closest('.input-group').classList.remove('error');
    input.removeAttribute('aria-invalid');
  });
});