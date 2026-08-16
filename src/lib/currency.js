export const CURRENCIES = [
  { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
  { code: "AED", symbol: "د.إ", locale: "ar-AE", name: "UAE Dirham" },
  { code: "SAR", symbol: "ر.س", locale: "ar-SA", name: "Saudi Riyal" },
];

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatNumber(value, code = "INR") {
  const num = Number(value);
  const amount = Number.isFinite(num) ? num : 0;
  const locale = getCurrency(code).locale;
  try {
    return new Intl.NumberFormat(locale, {
      numberingSystem: "latn",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

export function formatAmount(value, code = "INR") {
  return `${getCurrency(code).symbol}${formatNumber(value, code)}`;
}