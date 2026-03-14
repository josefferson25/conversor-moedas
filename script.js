// API Frankfurter (base USD)
const API_URL = "https://api.frankfurter.app/latest?from=USD";

// Elementos do DOM
const fromSelect = document.getElementById("currency-from");
const toSelect = document.getElementById("currency-to");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convert-btn");
const resultArea = document.getElementById("result-area");
const fromValueSpan = document.getElementById("from-value");
const toValueSpan = document.getElementById("to-value");
const fromCodeSpan = document.getElementById("from-code");
const toCodeSpan = document.getElementById("to-code");

// Formatação de moedas
const currencyFormat = {
  BRL: { locale: "pt-BR", currency: "BRL", symbol: "R$" },
  USD: { locale: "en-US", currency: "USD", symbol: "US$" },
  EUR: { locale: "de-DE", currency: "EUR", symbol: "€" },
  GBP: { locale: "en-GB", currency: "GBP", symbol: "£" },
  BTC: { locale: "en-US", currency: "BTC", symbol: "₿", isCrypto: true },
};

function formatCurrency(value, currencyCode) {
  const format = currencyFormat[currencyCode];
  if (!format) return value;
  if (currencyCode === "BTC") return `₿ ${value.toFixed(8)}`;
  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
  }).format(value);
}

// Busca as taxas em relação ao USD
async function getRatesInUsd() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
  const data = await response.json();
  if (!data.rates) throw new Error("Resposta inválida da API");
  return data.rates;
}

// Conversão principal
async function convertCurrency() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  if (amount <= 0) {
    alert("Digite um valor válido");
    return;
  }

  fromCodeSpan.textContent = from;
  toCodeSpan.textContent = to;
  fromValueSpan.textContent = formatCurrency(amount, from);

  try {
    convertBtn.disabled = true;
    convertBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Convertendo...';

    let rate;

    // ---- Bitcoin (simulação com taxas fixas) ----
    if (from === "BTC" || to === "BTC") {
      const btcUsd = 50000; // 1 BTC = 50.000 USD
      const btcBRL = 250000; // 1 BTC = 250.000 BRL (exemplo)

      if (from === "BTC" && to === "USD") rate = btcUsd;
      else if (from === "USD" && to === "BTC") rate = 1 / btcUsd;
      else if (from === "BTC" && to === "BRL") rate = btcBRL;
      else if (from === "BRL" && to === "BTC") rate = 1 / btcBRL;
      else {
        // Para outras combinações, usa USD como intermediário
        const rates = await getRatesInUsd();
        if (from === "BTC") {
          // BTC -> USD -> to
          rate = btcUsd * rates[to];
        } else {
          // from -> USD -> BTC
          rate = 1 / (btcUsd * rates[from]);
        }
      }
    } else {
      // Moedas fiduciárias
      const rates = await getRatesInUsd();

      if (from === "USD") {
        rate = rates[to];
      } else if (to === "USD") {
        rate = 1 / rates[from];
      } else {
        rate = rates[to] / rates[from];
      }
    }

    if (rate === undefined || isNaN(rate)) {
      throw new Error("Taxa não disponível para este par");
    }

    const converted = amount * rate;
    toValueSpan.textContent = formatCurrency(converted, to);
    resultArea.style.display = "flex";
  } catch (error) {
    console.error(error);
    alert(`Erro: ${error.message}`);
  } finally {
    convertBtn.disabled = false;
    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Converter';
  }
}

// Eventos
convertBtn.addEventListener("click", convertCurrency);
//amountInput.addEventListener("input", convertCurrency);
//fromSelect.addEventListener("change", convertCurrency);
//toSelect.addEventListener("change", convertCurrency);
// Permite pressionar Enter para converter automaticamente se eu descomentar.

// Executa ao carregar a página
window.addEventListener("DOMContentLoaded", convertCurrency);
