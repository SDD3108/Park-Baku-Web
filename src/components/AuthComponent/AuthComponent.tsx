"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: string
  name: string;
  password: string
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,setUser] = useState<User | null>(null)
  useEffect(()=>{
    const stored = localStorage.getItem('auth');
    if(stored){
      setUser(JSON.parse(stored));
    }
  },[])
  const login = (userData: User)=>{
    setUser(userData)
    localStorage.setItem('auth', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if(context == undefined){
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context;
};