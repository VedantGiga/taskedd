import React, { createContext, useContext } from 'react';

interface AuthContextType {
  userId: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: "default_user",
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For local development, we always provide a default user
  const authValue = {
    userId: "default_user",
    isLoading: false
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);