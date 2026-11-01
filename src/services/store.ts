import {
  Category,
  ColorItem,
  CodeItem,
  TypeItem,
  Voucher,
  StaffAccount,
  StoreSettings,
  MemberAccount,
  Reservation,
  StaffAttendance,
  AuditLog
} from '../types/salon';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_COLORS,
  INITIAL_CODES,
  INITIAL_TYPES,
  INITIAL_VOUCHERS,
  INITIAL_STAFF,
  INITIAL_MEMBERS,
  INITIAL_RESERVATIONS,
  INITIAL_ATTENDANCE,
  CUTE_QUOTES
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'lyras_settings_v2',
  CATEGORIES: 'lyras_categories_v2',
  COLORS: 'lyras_colors_v2',
  CODES: 'lyras_codes_v2',
  TYPES: 'lyras_types_v2',
  RESERVATIONS: 'lyras_reservations_v2',
  MEMBERS: 'lyras_members_v2',
  VOUCHERS: 'lyras_vouchers_v2',
  STAFF: 'lyras_staff_v2',
  ATTENDANCE: 'lyras_attendance_v2',
  AUDIT_LOGS: 'lyras_audit_logs_v2'
};

// Cross-tab real-time sync channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('lyras_sync_channel')
  : null;

class SalonStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          this.notify();
        }
      };
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('lyras_')) {
          this.notify();
        }
      });
      window.addEventListener('lyras_store_updated', () => {
        this.notify();
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private broadcast() {
    this.notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lyras_store_updated', { detail: { timestamp: Date.now() } }));
    }
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      } catch (e) {
        console.error('Failed to post to BroadcastChannel:', e);
      }
    }
  }

  // Generic getter & setter with localStorage
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.broadcast();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    const raw = this.getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    let updated = { ...raw };
    let changed = false;

    if (!updated.operationalSchedule || !updated.operationalSchedule.regularWeeklySchedule) {
      updated.operationalSchedule = INITIAL_SETTINGS.operationalSchedule;
      changed = true;
    }

    // Auto-update to new store address & Google Maps URL if holding initial placeholder
    if (
      !updated.storeAddress ||
      updated.storeAddress.includes('Senopati') ||
      !updated.storeCoordinate ||
      updated.googleMapsUrl?.includes('maps.google.com/?q=Lyras')
    ) {
      updated.storeAddress = INITIAL_SETTINGS.storeAddress;
      updated.storeCoordinate = INITIAL_SETTINGS.storeCoordinate;
      updated.googleMapsUrl = INITIAL_SETTINGS.googleMapsUrl;
      changed = true;
    }

    if (changed) {
      this.setItem(STORAGE_KEYS.SETTINGS, updated);
    }
    return updated;
  }

  public updateSettings(partial: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog('OWNER', 'Owner Lyra', 'SETTINGS_UPDATE', 'Pengaturan toko / jam operasional diperbarui');
    return updated;
  }

  // --- CATALOG (Categories, SubCategories, SubSubCategories) ---
  public getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public setCategories(categories: Category[]): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  public updateCategory(categoryId: string, updater: (cat: Category) => Category): void {
    const cats = this.getCategories();
    const updated = cats.map(c => c.id === categoryId ? updater(c) : c);
    this.setCategories(updated);
  }

  // --- ASSET MANAGERS (Colors, Codes, Types) ---
  public getColors(): ColorItem[] {
    return this.getItem<ColorItem[]>(STORAGE_KEYS.COLORS, INITIAL_COLORS);
  }

  public addColor(color: Omit<ColorItem, 'id'>): ColorItem {
    const colors = this.getColors();
    const newColor: ColorItem = { ...color, id: `col-${Date.now()}` };
    this.setItem(STORAGE_KEYS.COLORS, [newColor, ...colors]);
    return newColor;
  }

  public deleteColor(id: string): void {
    const colors = this.getColors().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.COLORS, colors);
  }

  public getCodes(): CodeItem[] {
    return this.getItem<CodeItem[]>(STORAGE_KEYS.CODES, INITIAL_CODES);
  }

  public addCode(code: Omit<CodeItem, 'id'>): CodeItem {
    const codes = this.getCodes();
    const newCode: CodeItem = { ...code, id: `code-${Date.now()}` };
    this.setItem(STORAGE_KEYS.CODES, [newCode, ...codes]);
    return newCode;
  }

  public deleteCode(id: string): void {
    const codes = this.getCodes().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CODES, codes);
  }

  public getTypes(): TypeItem[] {
    return this.getItem<TypeItem[]>(STORAGE_KEYS.TYPES, INITIAL_TYPES);
  }

  public addType(typeItem: Omit<TypeItem, 'id'>): TypeItem {
    const types = this.getTypes();
    const newType: TypeItem = { ...typeItem, id: `type-${Date.now()}` };
    this.setItem(STORAGE_KEYS.TYPES, [newType, ...types]);
    return newType;
  }

  public deleteType(id: string): void {
    const types = this.getTypes().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TYPES, types);
  }

  // --- RESERVATIONS ---
  public getReservations(): Reservation[] {
    return this.getItem<Reservation[]>(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  }

  public addReservation(reservation: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'randomCuteQuote'>): Reservation {
    const reservations = this.getReservations();
    const randomQuote = CUTE_QUOTES[Math.floor(Math.random() * CUTE_QUOTES.length)];
    const dateStr = (reservation.appointmentDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const bookingCode = `LNL-${dateStr}-${randNum}`;

    const newRes: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      bookingCode,
      createdAt: new Date().toISOString(),
      randomCuteQuote: randomQuote,
      status: 'PENDING'
    };

    this.setItem(STORAGE_KEYS.RESERVATIONS, [newRes, ...reservations]);
    return newRes;
  }

  public updateReservation(id: string, partial: Partial<Reservation>): Reservation | null {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updated = { ...reservations[index], ...partial };
    reservations[index] = updated;
    this.setItem(STORAGE_KEYS.RESERVATIONS, [...reservations]);
    return updated;
  }

  /**
   * Complete a reservation:
   * 1. Marks status as FINISHED
   * 2. Calculates coin reward (% from settings) and awards to member if phone matches
   * 3. Sets cute thank you note
   */
  public completeReservation(id: string): Reservation | null {
    const res = this.getReservations().find(r => r.id === id);
    if (!res) return null;

    const settings = this.getSettings();
    const percentage = typeof settings.coinRewardPercentage === 'number' && settings.coinRewardPercentage > 0
      ? settings.coinRewardPercentage
      : 2;
    const coinsAwarded = Math.round((res.servicesSubtotal * percentage) / 100);

    // If customer is a registered member, add coins
    const members = this.getMembers();
    const memberIndex = members.findIndex(m => m.whatsapp === res.whatsapp);
    if (memberIndex !== -1) {
      members[memberIndex].coins += coinsAwarded;
      members[memberIndex].totalCompletedTreatments = (members[memberIndex].totalCompletedTreatments || 0) + 1;
      this.setItem(STORAGE_KEYS.MEMBERS, [...members]);
    }

    const updated = this.updateReservation(id, {
      status: 'FINISHED',
      coinAwarded: coinsAwarded,
      ownerNotes: res.ownerNotes || 'Treatment telah selesai dilakukan dengan sempurna. Terima kasih!'
    });

    this.addAuditLog('OWNER', 'Owner Lyra', 'STATUS_CHANGE', `Menyelesaikan reservasi ${res.bookingCode} (${res.fullName}) + Koin ${coinsAwarded}`);
    return updated;
  }

  // Customer marks that they gave a 5-star Google Maps review
  public markGoogleMapsRated(reservationId: string, whatsappNumber: string): void {
    this.updateReservation(reservationId, { hasRatedGoogleMaps: true });
    const members = this.getMembers();
    const memIndex = members.findIndex(m => m.whatsapp === whatsappNumber);
    if (memIndex !== -1) {
      members[memIndex].hasRatedGoogleMaps = true;
      this.setItem(STORAGE_KEYS.MEMBERS, [...members]);
    }
  }

  // --- MEMBERS ---
  public getMembers(): MemberAccount[] {
    return this.getItem<MemberAccount[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  }

  public registerMember(fullName: string, whatsapp: string, passwordHash: string): { success: boolean; message: string; member?: MemberAccount } {
    const members = this.getMembers();
    const existing = members.find(m => m.whatsapp.replace(/\D/g, '') === whatsapp.replace(/\D/g, ''));
    if (existing) {
      return { success: false, message: 'Nomor WhatsApp sudah terdaftar sebagai Member. Silakan langsung login!' };
    }

    const newMember: MemberAccount = {
      id: `mem-${Date.now()}`,
      fullName,
      whatsapp,
      passwordHash,
      coins: 50, // Welcome bonus 50 coins
      joinDate: new Date().toISOString().slice(0, 10),
      claimedVoucherIds: [],
      totalCompletedTreatments: 0
    };

    this.setItem(STORAGE_KEYS.MEMBERS, [newMember, ...members]);
    return { success: true, message: 'Selamat! Akun Member Anda berhasil dibuat + Bonus 50 Koin!', member: newMember };
  }

  public loginMember(whatsapp: string, password: string): { success: boolean; message: string; member?: MemberAccount } {
    const cleanWa = whatsapp.replace(/\D/g, '');
    const members = this.getMembers();
    const member = members.find(m => m.whatsapp.replace(/\D/g, '') === cleanWa);
    if (!member) {
      return { success: false, message: 'Nomor WhatsApp belum terdaftar. Silakan daftar member baru terlebih dahulu!' };
    }
    if (member.passwordHash !== password) {
      return { success: false, message: 'Kata sandi salah. Gunakan fitur Lupa Kata Sandi jika tidak ingat.' };
    }
    return { success: true, message: `Selamat datang kembali, ${member.fullName}!`, member };
  }

  public resetMemberPassword(whatsapp: string, newPassword: string): boolean {
    const cleanWa = whatsapp.replace(/\D/g, '');
    const members = this.getMembers();
    const index = members.findIndex(m => m.whatsapp.replace(/\D/g, '') === cleanWa);
    if (index === -1) return false;

    members[index].passwordHash = newPassword;
    this.setItem(STORAGE_KEYS.MEMBERS, [...members]);
    return true;
  }

  public claimVoucher(memberId: string, voucherId: string): { success: boolean; message: string } {
    const members = this.getMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'Member tidak ditemukan.' };

    const vouchers = this.getVouchers();
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher || !voucher.isActive) return { success: false, message: 'Voucher tidak aktif atau tidak ditemukan.' };

    if (member.coins < voucher.coinsRequired) {
      return { success: false, message: `Koin tidak mencukupi. Butuh ${voucher.coinsRequired} koin, koin Anda saat ini ${member.coins}.` };
    }

    // Deduct coins & record claimed voucher
    member.coins -= voucher.coinsRequired;
    member.claimedVoucherIds.push(voucherId);
    this.setItem(STORAGE_KEYS.MEMBERS, [...members]);

    // Increment voucher stats
    voucher.totalClaimedCount += 1;
    this.setItem(STORAGE_KEYS.VOUCHERS, [...vouchers]);

    return { success: true, message: `Berhasil menukar voucher "${voucher.title}"!` };
  }

  // --- VOUCHERS ---
  public getVouchers(): Voucher[] {
    return this.getItem<Voucher[]>(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS);
  }

  public saveVouchers(vouchers: Voucher[]): void {
    this.setItem(STORAGE_KEYS.VOUCHERS, vouchers);
  }

  public addVoucher(voucher: Omit<Voucher, 'id' | 'totalClaimedCount' | 'totalUsedCount'>): Voucher {
    const vouchers = this.getVouchers();
    const newV: Voucher = {
      ...voucher,
      id: `vouch-${Date.now()}`,
      totalClaimedCount: 0,
      totalUsedCount: 0
    };
    this.setItem(STORAGE_KEYS.VOUCHERS, [newV, ...vouchers]);
    return newV;
  }

  public updateVoucher(id: string, partial: Partial<Voucher>): void {
    const vouchers = this.getVouchers().map(v => v.id === id ? { ...v, ...partial } : v);
    this.setItem(STORAGE_KEYS.VOUCHERS, vouchers);
  }

  public deleteVoucher(id: string): void {
    const vouchers = this.getVouchers().filter(v => v.id !== id);
    this.setItem(STORAGE_KEYS.VOUCHERS, vouchers);
  }

  // --- STAFF & ATTENDANCE ---
  public getStaff(): StaffAccount[] {
    return this.getItem<StaffAccount[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }

  public saveStaff(staff: StaffAccount[]): void {
    this.setItem(STORAGE_KEYS.STAFF, staff);
  }

  public addStaff(staffMember: Omit<StaffAccount, 'id'>): StaffAccount {
    const list = this.getStaff();
    const newStaff: StaffAccount = { ...staffMember, id: `st-${Date.now()}` };
    this.setItem(STORAGE_KEYS.STAFF, [...list, newStaff]);
    return newStaff;
  }

  public updateStaff(id: string, partial: Partial<StaffAccount>): void {
    const list = this.getStaff().map(s => s.id === id ? { ...s, ...partial } : s);
    this.setItem(STORAGE_KEYS.STAFF, list);
  }

  public deleteStaff(id: string): void {
    const list = this.getStaff().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.STAFF, list);
  }

  public getAttendance(): StaffAttendance[] {
    return this.getItem<StaffAttendance[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  }

  public recordAttendance(att: Omit<StaffAttendance, 'id'>): StaffAttendance {
    const list = this.getAttendance();
    const newAtt: StaffAttendance = { ...att, id: `att-${Date.now()}` };
    this.setItem(STORAGE_KEYS.ATTENDANCE, [newAtt, ...list]);
    return newAtt;
  }

  public updateAttendance(id: string, partial: Partial<StaffAttendance>): void {
    const list = this.getAttendance().map(a => a.id === id ? { ...a, ...partial } : a);
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);
  }

  // --- AUDIT LOGS (Login/Logout track) ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        timestamp: '2026-10-31T08:00:00Z',
        userType: 'OWNER',
        userName: 'Owner Lyra',
        action: 'LOGIN',
        details: 'Login sistem POS utama berhasil'
      }
    ]);
  }

  public addAuditLog(userType: 'OWNER' | 'STAFF', userName: string, action: AuditLog['action'], details?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userType,
      userName,
      action,
      details
    };
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs.slice(0, 99)]); // Keep last 100 logs
  }
}

export const salonStore = new SalonStore();
