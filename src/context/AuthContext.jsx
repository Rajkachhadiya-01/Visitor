// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [isRestoring, setIsRestoring] = useState(true);

  // ✅ Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("authSession");
    
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session?.user && session?.view) {
          console.log("✅ Restoring session:", session);
          setUser(session.user);
          setView(session.view);
        }
      } catch (err) {
        console.error("❌ Failed to restore auth:", err);
        localStorage.removeItem("authSession");
      }
    }
    
    setIsRestoring(false);
  }, []);

  // ✅ Save session whenever user or view changes
  useEffect(() => {
    if (!isRestoring && user !== null) {
      const session = { user, view };
      localStorage.setItem("authSession", JSON.stringify(session));
      console.log("💾 Session saved:", session);
    }
  }, [user, view, isRestoring]);

  // ✅ Login method
  const login = (role, identifier, data) => {
    const userData = {
      role,
      identifier,
      data,
    };

    setUser(userData);

    // Set correct dashboard
    if (role === "resident") setView("resident-dash");
    else if (role === "security") setView("security-dash");
    else if (role === "admin") setView("admin-dash");
    
    console.log("✅ Login successful:", userData);
  };

  // ✅ Logout method
  const logout = () => {
    console.log("🚪 Logging out...");
    setUser(null);
    setView("login");
    localStorage.removeItem("authSession");
  };

  // Don't render children until restoration is complete
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, view, login, logout, setView }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}