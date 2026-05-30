import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TenantContextProps {
  tenantId: string;
  userId: string;
  userRole: string;
  tenantName: string;
  updateSimSettings: (tenantId: string, userId: string, userRole: string, tenantName: string) => void;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState(localStorage.getItem('sim_tenant_id') || 'tenant-starter-123');
  const [userId, setUserId] = useState(localStorage.getItem('sim_user_id') || 'user-admin-456');
  const [userRole, setUserRole] = useState(localStorage.getItem('sim_user_role') || 'ADMIN');
  const [tenantName, setTenantName] = useState(localStorage.getItem('sim_tenant_name') || 'InnovateAI Labs');

  useEffect(() => {
    localStorage.setItem('sim_tenant_id', tenantId);
    localStorage.setItem('sim_user_id', userId);
    localStorage.setItem('sim_user_role', userRole);
    localStorage.setItem('sim_tenant_name', tenantName);
  }, [tenantId, userId, userRole, tenantName]);

  const updateSimSettings = (tId: string, uId: string, uRole: string, tName: string) => {
    setTenantId(tId);
    setUserId(uId);
    setUserRole(uRole);
    setTenantName(tName);
  };

  return (
    <TenantContext.Provider value={{ tenantId, userId, userRole, tenantName, updateSimSettings }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
