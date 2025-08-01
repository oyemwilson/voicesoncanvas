import { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('NGN');
  const [rates, setRates] = useState({
    NGN: 1,
    USD: 0.00066,
    EUR: 0.00060,
    GBP: 0.00050,
    JPY: 0.095,
  });

  // 🔥 Optional: Fetch live rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Replace with your preferred API
        const res = await fetch(
          'https://api.exchangerate.host/latest?base=NGN&symbols=USD,EUR,GBP,JPY'
        );
        const data = await res.json();
        if (data?.rates) {
          setRates((prev) => ({
            ...prev,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
            GBP: data.rates.GBP,
            JPY: data.rates.JPY,
          }));
        }
      } catch (err) {
        console.error('Error fetching rates:', err);
      }
    };
    fetchRates();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};
