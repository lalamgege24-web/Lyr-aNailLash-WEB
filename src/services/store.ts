import {
  Category,
  ColorItem,
  CodeItem,
  TypeItem,
  AccessoryItem,
  ExtensionConfig,
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
  INITIAL_ACCESSORIES,
  INITIAL_EXTENSIONS,
  INITIAL_VOUCHERS,
  INITIAL_STAFF,
  INITIAL_MEMBERS,
  INITIAL_RESERVATIONS,
  INITIAL_ATTENDANCE,
  CUTE_QUOTES
} from '../data/initialData';
import { PushNotificationService } from '../utils/pushNotification';
import { audioManager } from '../utils/audioNotification';

const STORAGE_KEYS = {
  SETTINGS: 'lyras_settings_v2',
  CATEGORIES: 'lyras_categories_v2',
  COLORS: 'lyras_colors_v2',
  CODES: 'lyras_codes_v2',
  TYPES: 'lyras_types_v2',
  ACCESSORIES: 'lyras_accessories_v2',
  EXTENSIONS: 'lyras_extensions_v2',
  RESERVATIONS: 'lyras_reservations_v2',
  MEMBERS: 'lyras_members_v2',
  VOUCHERS: 'lyras_vouchers_v2',
  STAFF: 'lyras_staff_v2',
  ATTENDANCE: 'lyras_attendance_v2',
  AUDIT_LOGS: 'lyras_audit_logs_v2',
  CUSTOMER_BOOKINGS: 'lyras_customer_bookings_v2'
};

// Cross-tab channel (same browser profile)
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('lyras_sync_channel')
  : null;

class SalonStore {
  private listeners: Set<() => void> = new Set();
  private eventSource: EventSource | null = null;
  private pollIntervalId: any = null;
  private isSyncingWithServer = false;
  private knownReservationIds: Set<string> = new Set();

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

      // Track already known reservation IDs locally so we don't chime on existing ones
      const initialRes = this.getReservations();
      initialRes.forEach(r => this.knownReservationIds.add(r.id));

      // Connect to full-stack Express backend for true cross-browser / multi-device sync
      this.initBackendSync();
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

  private setItem<T>(key: string, value: T, notify: boolean = true): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (notify) {
        this.broadcast();
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- MULTI-BROWSER BACKEND SYNCHRONIZATION ---

  private initBackendSync(): void {
    // 1. Initial State Fetch from backend
    this.fetchInitialState();

    // 2. Setup Server-Sent Events (SSE) for instantaneous push
    this.setupSSE();

    // 3. Fallback polling every 3.5 seconds to guarantee 100% reliability across proxies/devices
    if (typeof window !== 'undefined' && !this.pollIntervalId) {
      this.pollIntervalId = setInterval(() => {
        this.syncWithBackend();
      }, 3500);
    }
  }

  private async fetchInitialState(): Promise<void> {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.reservations && Array.isArray(data.reservations)) {
          this.mergeReservationsFromServer(data.reservations);
        }
        if (data.settings) {
          this.mergeSettingsFromServer(data.settings);
        }
      }
    } catch {
      // Backend might be booting up, will retry in polling
    }
  }

  private setupSSE(): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/events');

      this.eventSource.addEventListener('RESERVATION_CREATED', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const newRes: Reservation = parsed.data;
          this.handleIncomingNewReservation(newRes);
        } catch (err) {
          console.error('Error handling RESERVATION_CREATED SSE:', err);
        }
      });

      this.eventSource.addEventListener('RESERVATION_UPDATED', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const updatedRes: Reservation = parsed.data;
          this.handleIncomingUpdatedReservation(updatedRes);
        } catch (err) {
          console.error('Error handling RESERVATION_UPDATED SSE:', err);
        }
      });

      this.eventSource.addEventListener('RESERVATION_DELETED', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const { id } = parsed.data;
          this.handleIncomingDeletedReservation(id);
        } catch (err) {
          console.error('Error handling RESERVATION_DELETED SSE:', err);
        }
      });

      this.eventSource.addEventListener('ATTENDANCE_DELETED', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const { id } = parsed.data;
          const current = this.getAttendance();
          this.setItem(STORAGE_KEYS.ATTENDANCE, current.filter(a => a.id !== id), true);
        } catch (err) {
          console.error('Error handling ATTENDANCE_DELETED SSE:', err);
        }
      });

      this.eventSource.addEventListener('SETTINGS_UPDATED', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const newSettings: StoreSettings = parsed.data;
          this.mergeSettingsFromServer(newSettings);
        } catch (err) {
          console.error('Error handling SETTINGS_UPDATED SSE:', err);
        }
      });

      this.eventSource.addEventListener('GROUP_UPDATED', () => {
        this.broadcast();
      });

      this.eventSource.onerror = () => {
        // SSE disconnected, will automatically reconnect or fallback to periodic poll
        if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
          setTimeout(() => this.setupSSE(), 5000);
        }
      };
    } catch (err) {
      console.warn('Failed to setup SSE, falling back to polling:', err);
    }
  }

  private async syncWithBackend(): Promise<void> {
    if (this.isSyncingWithServer || typeof window === 'undefined') return;
    this.isSyncingWithServer = true;

    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const serverReservations: Reservation[] = await res.json();
        this.mergeReservationsFromServer(serverReservations);
      }
    } catch {
      // Ignore network errors in background
    } finally {
      this.isSyncingWithServer = false;
    }
  }

  private mergeReservationsFromServer(serverReservations: Reservation[]): void {
    const local = this.getReservations();
    const serverMap = new Map<string, Reservation>();
    serverReservations.forEach(r => serverMap.set(r.id, r));

    // Check if new reservations arrived that we haven't seen yet
    for (const sRes of serverReservations) {
      if (!this.knownReservationIds.has(sRes.id)) {
        this.knownReservationIds.add(sRes.id);
        // If this is a newly arrived reservation from another browser
        this.onNewReservationReceived(sRes);
      }
    }

    // Check status changes on tracked customer bookings (for Customer background approval notification)
    const customerTrackedBookings = this.getCustomerTrackedBookings();
    let updatedCustomerTracked = false;

    serverReservations.forEach(sRes => {
      if (customerTrackedBookings[sRes.id]) {
        const track = customerTrackedBookings[sRes.id];
        if (sRes.status === 'APPROVED' && !track.notifiedApproved) {
          track.notifiedApproved = true;
          updatedCustomerTracked = true;
          // Trigger Customer Background Notification & Chime!
          PushNotificationService.notifyCustomerReservationApproved(sRes);
        }
      }
    });

    if (updatedCustomerTracked) {
      this.setItem(STORAGE_KEYS.CUSTOMER_BOOKINGS, customerTrackedBookings, false);
    }

    // Overwrite local reservations if different
    const isDifferent = JSON.stringify(local) !== JSON.stringify(serverReservations);
    if (isDifferent) {
      this.setItem(STORAGE_KEYS.RESERVATIONS, serverReservations, true);
    }
  }

  private mergeSettingsFromServer(serverSettings: StoreSettings): void {
    const current = this.getSettings();
    if (JSON.stringify(current) !== JSON.stringify(serverSettings)) {
      this.setItem(STORAGE_KEYS.SETTINGS, serverSettings, true);
    }
  }

  private handleIncomingNewReservation(newRes: Reservation): void {
    const current = this.getReservations();
    if (!this.knownReservationIds.has(newRes.id)) {
      this.knownReservationIds.add(newRes.id);
      this.setItem(STORAGE_KEYS.RESERVATIONS, [newRes, ...current.filter(r => r.id !== newRes.id)], true);
      this.onNewReservationReceived(newRes);
    }
  }

  private handleIncomingUpdatedReservation(updatedRes: Reservation): void {
    const current = this.getReservations();
    const next = current.map(r => r.id === updatedRes.id ? updatedRes : r);
    this.setItem(STORAGE_KEYS.RESERVATIONS, next, true);

    // Check if this belongs to current customer and was approved
    const customerTrackedBookings = this.getCustomerTrackedBookings();
    if (customerTrackedBookings[updatedRes.id]) {
      const track = customerTrackedBookings[updatedRes.id];
      if (updatedRes.status === 'APPROVED' && !track.notifiedApproved) {
        track.notifiedApproved = true;
        this.setItem(STORAGE_KEYS.CUSTOMER_BOOKINGS, customerTrackedBookings, false);
        PushNotificationService.notifyCustomerReservationApproved(updatedRes);
      }
    }
  }

  private handleIncomingDeletedReservation(deletedId: string): void {
    const current = this.getReservations();
    const next = current.filter(r => r.id !== deletedId);
    this.setItem(STORAGE_KEYS.RESERVATIONS, next, true);
  }

  private onNewReservationReceived(res: Reservation): void {
    // If Owner is viewing (either on owner.html or has active owner session)
    const isOwnerContext = typeof window !== 'undefined' && (
      window.location.pathname.includes('owner') ||
      sessionStorage.getItem('lyras_owner_session') === 'true'
    );

    if (isOwnerContext) {
      // Play audio chime and trigger OS native push notification
      audioManager.playNewReservationChime();
      PushNotificationService.notifyOwnerNewReservation(res);
    }
  }

  // Customer booking tracker in localStorage to notify customer when reservation is approved
  public getCustomerTrackedBookings(): Record<string, { bookingCode: string; notifiedApproved: boolean; date: string }> {
    return this.getItem(STORAGE_KEYS.CUSTOMER_BOOKINGS, {});
  }

  public trackCustomerBooking(resId: string, bookingCode: string, date: string): void {
    const tracked = this.getCustomerTrackedBookings();
    tracked[resId] = {
      bookingCode,
      notifiedApproved: false,
      date
    };
    this.setItem(STORAGE_KEYS.CUSTOMER_BOOKINGS, tracked, false);
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

    // Sync to backend for cross-browser propagation
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn('Failed to sync settings to server:', err));

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

  // --- ACCESSORIES MANAGER ---
  public getAccessories(): AccessoryItem[] {
    return this.getItem<AccessoryItem[]>(STORAGE_KEYS.ACCESSORIES, INITIAL_ACCESSORIES);
  }

  public addAccessory(item: Omit<AccessoryItem, 'id'>): AccessoryItem {
    const list = this.getAccessories();
    const newAcc: AccessoryItem = { ...item, id: `acc-${Date.now()}` };
    this.setItem(STORAGE_KEYS.ACCESSORIES, [newAcc, ...list]);
    return newAcc;
  }

  public updateAccessory(id: string, partial: Partial<AccessoryItem>): void {
    const list = this.getAccessories().map(a => a.id === id ? { ...a, ...partial } : a);
    this.setItem(STORAGE_KEYS.ACCESSORIES, list);
  }

  public deleteAccessory(id: string): void {
    const list = this.getAccessories().filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.ACCESSORIES, list);
  }

  // --- EXTENSION MANAGER (Kenaikan setiap 1 milimeter) ---
  public getExtensions(): ExtensionConfig[] {
    return this.getItem<ExtensionConfig[]>(STORAGE_KEYS.EXTENSIONS, INITIAL_EXTENSIONS);
  }

  public addExtension(item: Omit<ExtensionConfig, 'id'>): ExtensionConfig {
    const list = this.getExtensions();
    const newExt: ExtensionConfig = { ...item, id: `ext-${Date.now()}` };
    this.setItem(STORAGE_KEYS.EXTENSIONS, [newExt, ...list]);
    return newExt;
  }

  public updateExtension(id: string, partial: Partial<ExtensionConfig>): void {
    const list = this.getExtensions().map(e => e.id === id ? { ...e, ...partial } : e);
    this.setItem(STORAGE_KEYS.EXTENSIONS, list);
  }

  public deleteExtension(id: string): void {
    const list = this.getExtensions().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EXTENSIONS, list);
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

    this.knownReservationIds.add(newRes.id);
    this.setItem(STORAGE_KEYS.RESERVATIONS, [newRes, ...reservations]);

    // Track for this customer so when owner approves, customer gets push notification
    this.trackCustomerBooking(newRes.id, bookingCode, newRes.appointmentDate);

    // Send to backend so owner in any other browser receives it immediately
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRes)
    }).catch(err => console.warn('Failed to sync new reservation to server:', err));

    return newRes;
  }

  public updateReservation(id: string, partial: Partial<Reservation>): Reservation | null {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updated = { ...reservations[index], ...partial };
    reservations[index] = updated;
    this.setItem(STORAGE_KEYS.RESERVATIONS, [...reservations]);

    // Send update to server for multi-browser broadcast
    fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial)
    }).catch(err => console.warn('Failed to sync updated reservation to server:', err));

    return updated;
  }

  /**
   * Delete customer reservation history (Owner feature)
   */
  public deleteReservation(id: string): boolean {
    const reservations = this.getReservations();
    const target = reservations.find(r => r.id === id);
    if (!target) return false;

    const next = reservations.filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.RESERVATIONS, next);
    this.knownReservationIds.delete(id);

    this.addAuditLog(
      'OWNER',
      'Owner Lyra',
      'RESERVATION_DELETE',
      `Menghapus riwayat reservasi ${target.bookingCode} (${target.fullName})`
    );

    // Call server DELETE
    fetch(`/api/reservations/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Failed to delete reservation on server:', err));

    return true;
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
    const memberIndex = members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return { success: false, message: 'Member tidak ditemukan' };

    const vouchers = this.getVouchers();
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return { success: false, message: 'Voucher tidak ditemukan' };

    const member = members[memberIndex];
    if (member.claimedVoucherIds.includes(voucherId)) {
      return { success: false, message: 'Anda sudah mengklaim voucher ini sebelumnya!' };
    }

    member.claimedVoucherIds.push(voucherId);
    voucher.totalClaimedCount = (voucher.totalClaimedCount || 0) + 1;

    this.setItem(STORAGE_KEYS.MEMBERS, [...members]);
    this.setItem(STORAGE_KEYS.VOUCHERS, [...vouchers]);
    return { success: true, message: `Voucher "${voucher.title}" berhasil diklaim!` };
  }

  // --- VOUCHERS ---
  public getVouchers(): Voucher[] {
    return this.getItem<Voucher[]>(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS);
  }

  public addVoucher(voucher: Omit<Voucher, 'id' | 'totalClaimedCount' | 'totalUsedCount'>): Voucher {
    const vouchers = this.getVouchers();
    const newVoucher: Voucher = { 
      ...voucher, 
      id: `vouch-${Date.now()}`, 
      totalClaimedCount: 0,
      totalUsedCount: 0
    };
    this.setItem(STORAGE_KEYS.VOUCHERS, [newVoucher, ...vouchers]);
    return newVoucher;
  }

  public updateVoucher(id: string, partial: Partial<Voucher>): void {
    const vouchers = this.getVouchers().map(v => v.id === id ? { ...v, ...partial } : v);
    this.setItem(STORAGE_KEYS.VOUCHERS, vouchers);
  }

  public deleteVoucher(id: string): void {
    const vouchers = this.getVouchers().filter(v => v.id !== id);
    this.setItem(STORAGE_KEYS.VOUCHERS, vouchers);
  }

  // Filter vouchers visible to customers according to scheduled display dates and quota
  public isVoucherVisibleToCustomer(v: Voucher): boolean {
    if (!v.isActive) return false;

    // Check display scheduled window
    const nowStr = new Date().toISOString().slice(0, 10);
    if (v.displayStartDate && nowStr < v.displayStartDate) {
      return false; // Belum waktunya muncul di dashboard customer
    }
    if (v.displayEndDate && nowStr > v.displayEndDate) {
      return false; // Sudah lewat batas tampil di customer dashboard
    }

    // Check quota limit
    if (typeof v.maxClaimsQuota === 'number' && v.maxClaimsQuota > 0) {
      if ((v.totalClaimedCount || 0) >= v.maxClaimsQuota) {
        return false; // Kuota klaim sudah habis
      }
    }

    return true;
  }

  // --- STAFF & ATTENDANCE ---
  public getStaff(): StaffAccount[] {
    return this.getItem<StaffAccount[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }

  public addStaff(staff: Omit<StaffAccount, 'id'>): StaffAccount {
    const staffList = this.getStaff();
    const newStaff: StaffAccount = { ...staff, id: `stf-${Date.now()}` };
    this.setItem(STORAGE_KEYS.STAFF, [newStaff, ...staffList]);
    return newStaff;
  }

  public updateStaff(id: string, partial: Partial<StaffAccount>): void {
    const staffList = this.getStaff().map(s => s.id === id ? { ...s, ...partial } : s);
    this.setItem(STORAGE_KEYS.STAFF, staffList);
  }

  public deleteStaff(id: string): void {
    const staffList = this.getStaff().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.STAFF, staffList);
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

  public deleteAttendance(id: string): boolean {
    const list = this.getAttendance();
    const target = list.find(a => a.id === id);
    if (!target) return false;

    const next = list.filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.ATTENDANCE, next);

    this.addAuditLog(
      'OWNER',
      'Owner Lyra',
      'ATTENDANCE_DELETE',
      `Menghapus data absensi staf: ${target.staffName} (${target.date})`
    );

    // Call server DELETE
    fetch(`/api/attendance/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Failed to delete attendance on server:', err));

    return true;
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
