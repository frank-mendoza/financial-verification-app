/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [verifiedDocs, setVerifiedDocs] = useState([]);

  const handleFileResults = (results) => {
    setVerifiedDocs(results);
  };

  return (
    <AppContext.Provider
      value={{ verifiedDocs, handleFileResults, setVerifiedDocs }}
    >
      {children}
    </AppContext.Provider>
  );
};
