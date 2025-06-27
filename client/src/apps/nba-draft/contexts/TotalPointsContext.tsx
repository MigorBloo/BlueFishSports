import React, { createContext, useContext, useState } from 'react';

interface TotalPointsContextType {
  totalPoints: number;
  setTotalPoints: (points: number) => void;
}

const TotalPointsContext = createContext<TotalPointsContextType | undefined>(undefined);

export const TotalPointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalPoints, setTotalPoints] = useState<number>(0);

  return (
    <TotalPointsContext.Provider value={{ totalPoints, setTotalPoints }}>
      {children}
    </TotalPointsContext.Provider>
  );
};

export const useTotalPoints = () => {
  const context = useContext(TotalPointsContext);
  if (context === undefined) {
    throw new Error('useTotalPoints must be used within a TotalPointsProvider');
  }
  return context;
}; 