import React, { createContext, useState } from "react";

export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  const [opex, setOpex] = useState(0); // valor único de OPEX

  return (
    <FinancialContext.Provider value={{ opex, setOpex }}>
      {children}
    </FinancialContext.Provider>
  );
};
