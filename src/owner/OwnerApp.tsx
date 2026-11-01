import React, { useState, useEffect } from 'react';
import { salonStore } from '../services/store';
import { 
  StoreSettings, 
  StaffAccount, 
  Reservation, 
  Category, 
  ColorItem, 
  CodeItem, 
  TypeItem, 
  Voucher, 
  MemberAccount, 
  StaffAttendance, 
  AuditLog 
} from '../types/salon';
import { OwnerHeader } from './OwnerHeader';
import { OwnerAuth } from './OwnerAuth';
import { OwnerReservations } from './OwnerReservations';
import { OwnerCatalogManager } from './OwnerCatalogManager';
import { OwnerAssetManagers } from './OwnerAssetManagers';
import { OwnerFinance } from './OwnerFinance';
import { OwnerMemberManager } from './OwnerMemberManager';
import { OwnerStaffAttendance } from './OwnerStaffAttendance';
import { OwnerSettings } from './OwnerSettings';
import { OwnerScheduleManager } from './OwnerScheduleManager';

export default function OwnerApp() {
  // Session states
  const [currentRole, setCurrentRole] = useState<'OWNER' | 'STAFF' | null>(null);
  const [activeUserName, setActiveUserName] = useState('');
  const [activeStaffData, setActiveStaffData] = useState<StaffAccount | undefined>(undefined);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('reservations');

  // Store data states
  const [settings, setSettings] = useState<StoreSettings>(() => salonStore.getSettings());
  const [staffList, setStaffList] = useState<StaffAccount[]>(() => salonStore.getStaff());
  const [reservations, setReservations] = useState<Reservation[]>(() => salonStore.getReservations());
  const [categories, setCategories] = useState<Category[]>(() => salonStore.getCategories());
  const [colors, setColors] = useState<ColorItem[]>(() => salonStore.getColors());
  const [codes, setCodes] = useState<CodeItem[]>(() => salonStore.getCodes());
  const [types, setTypes] = useState<TypeItem[]>(() => salonStore.getTypes());
  const [vouchers, setVouchers] = useState<Voucher[]>(() => salonStore.getVouchers());
  const [members, setMembers] = useState<MemberAccount[]>(() => salonStore.getMembers());
  const [attendance, setAttendance] = useState<StaffAttendance[]>(() => salonStore.getAttendance());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => salonStore.getAuditLogs());

  // Function to refresh all local state from salonStore
  const refreshState = () => {
    setSettings(salonStore.getSettings());
    setStaffList(salonStore.getStaff());
    setReservations(salonStore.getReservations());
    setCategories(salonStore.getCategories());
    setColors(salonStore.getColors());
    setCodes(salonStore.getCodes());
    setTypes(salonStore.getTypes());
    setVouchers(salonStore.getVouchers());
    setMembers(salonStore.getMembers());
    setAttendance(salonStore.getAttendance());
    setAuditLogs(salonStore.getAuditLogs());
  };

  // Subscribe to store updates across tabs/windows
  useEffect(() => {
    const unsubscribe = salonStore.subscribe(refreshState);
    return unsubscribe;
  }, []);

  const handleLoginSuccess = (
    role: 'OWNER' | 'STAFF',
    userName: string,
    staffData?: StaffAccount
  ) => {
    setCurrentRole(role);
    setActiveUserName(userName);
    setActiveStaffData(staffData);
    setActiveTab('reservations');
  };

  const handleLogout = () => {
    if (currentRole) {
      salonStore.addAuditLog(currentRole, activeUserName, 'LOGOUT', 'Pengguna keluar sistem');
    }
    setCurrentRole(null);
    setActiveUserName('');
    setActiveStaffData(undefined);
  };

  // If not logged in, render Auth screen
  if (!currentRole) {
    return (
      <OwnerAuth
        settings={settings}
        staffList={staffList}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isOwner = currentRole === 'OWNER';

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3B40] flex flex-col font-sans">
      <OwnerHeader
        settings={settings}
        currentRole={currentRole}
        activeUserName={activeUserName}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'reservations' && (
          <OwnerReservations
            reservations={reservations}
            isOwner={isOwner}
            settings={settings}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'catalog' && (
          <OwnerCatalogManager
            categories={categories}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'assets' && (
          <OwnerAssetManagers
            colors={colors}
            codes={codes}
            types={types}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'finance' && (
          <OwnerFinance
            reservations={reservations}
          />
        )}

        {isOwner && activeTab === 'members' && (
          <OwnerMemberManager
            members={members}
            vouchers={vouchers}
            settings={settings}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'attendance' && (
          <OwnerStaffAttendance
            staffList={staffList}
            attendanceList={attendance}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'schedule' && (
          <OwnerScheduleManager
            operationalSchedule={settings.operationalSchedule}
            onRefresh={refreshState}
          />
        )}

        {isOwner && activeTab === 'settings' && (
          <OwnerSettings
            settings={settings}
            staffList={staffList}
            auditLogs={auditLogs}
            onRefresh={refreshState}
          />
        )}
      </main>

      <footer className="bg-white border-t border-[#F8BBD0]/50 py-4 px-4 text-center text-xs text-[#8C7A82]">
        <p className="font-medium">
          {settings.storeName} Management POS • Hak Akses: {currentRole} ({activeUserName})
        </p>
      </footer>
    </div>
  );
}
