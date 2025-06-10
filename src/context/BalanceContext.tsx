import React, { createContext, useContext, useState, ReactNode } from "react";

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(100000);

  const updateBalance = (amount: number) => {
    setBalance((prev) => prev - amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
