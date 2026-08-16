import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { db, doc, getDoc, setDoc } from "@/lib/firebase";
import { CURRENCIES } from "@/lib/currency";

const CurrencyContext = createContext({ currency: "INR", setCurrency: () => {} });

export function CurrencyProvider({ children }) {
  const { isLoaded, user } = useUser();
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem("spendly-currency") || "INR"
  );

  useEffect(() => {
    if (!isLoaded || !user) return;
    let active = true;
    getDoc(doc(db, "users", user.id))
      .then((snap) => {
        if (!active || !snap.exists()) return;
        const saved = snap.data().currency;
        if (saved && CURRENCIES.some((c) => c.code === saved)) {
          setCurrencyState(saved);
          localStorage.setItem("spendly-currency", saved);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoaded, user]);

  const setCurrency = (code) => {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    setCurrencyState(code);
    localStorage.setItem("spendly-currency", code);
    if (user) {
      setDoc(doc(db, "users", user.id), { currency: code }, { merge: true }).catch(() => {});
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}