/**
 * Lyra's Nail-Lash System Data Types
 * Standard Estetika: Baby Pink (#FFD1DC), Soft Pink (#F8BBD0), Cream (#FFFDF9), Gold (#D4AF37)
 */

export interface ColorItem {
  id: string;
  name: string;
  hex?: string;
  imageUrl?: string;
  isPopular?: boolean;
}

export interface CodeItem {
  id: string;
  name: string;
  code: string;
  imageUrl?: string;
  category?: string;
}

export interface TypeItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface SubSubCategory {
  id: string;
  name: string;
  price: number;
  discountPercent?: number; // Persentase diskon (0 - 100%)
  discountPrice?: number;
  description?: string;
  estimatedMinutes?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  price: number; // If subSubCategories exist, this is 0 and subSubCategories carry the price
  discountPercent?: number; // Persentase diskon (0 - 100%)
  discountPrice?: number;
  description?: string;
  estimatedMinutes?: number;
  // Subbab feature flags
  useColorManager: boolean;
  useCodeManager: boolean;
  useTypeManager: boolean;
  requireDesignUpload: boolean;
  subSubCategories?: SubSubCategory[];
}

export interface Category {
  id: string;
  name: string; // e.g. NAIL ART, EYELASH, LASH LIFT
  description?: string;
  icon?: string;
  subCategories: SubCategory[];
}

export interface LocationDetail {
  isHomeService: boolean;
  province: string;
  regency: string; // Kabupaten/Kota
  district: string; // Kecamatan
  village: string; // Kelurahan
  streetAddress: string;
  rtRw?: string;
  notes?: string;
  calculatedDistanceKm: number;
  baseDeliveryFee: number;
  additional5KmFee: number;
  coinDiscountAmount: number;
  totalDeliveryFee: number;
}

export interface SelectedServiceItem {
  serviceId: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  subSubCategoryId?: string;
  subSubCategoryName?: string;
  selectedColors?: string[]; // IDs or names
  selectedCode?: string;
  selectedType?: string;
  referencePhotoUrl?: string;
  customerNotes?: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
}

export interface GroupCustomerItem {
  id: string;
  fullName: string;
  whatsapp: string;
  services: SelectedServiceItem[];
  subtotalServices: number;
}

export type ReservationStatus = 
  | 'PENDING' // Menunggu Konfirmasi
  | 'APPROVED' // Disetujui
  | 'NEEDS_DISCUSSION' // Memerlukan Diskusi Tambahan
  | 'FINISHED' // Selesai
  | 'REJECTED'; // Tidak Disetujui

export type PaymentStatus = 'BELUM_BAYAR' | 'DP' | 'LUNAS';
export type PaymentMethod = 'TUNAI' | 'QRIS' | 'TRANSFER';

export interface Reservation {
  id: string;
  bookingCode: string;
  type: 'REGULER' | 'MEMBER' | 'GABUNGAN';
  createdAt: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  
  // Primary contact
  fullName: string;
  whatsapp: string;
  email?: string;
  
  // For group reservations
  groupMembers?: GroupCustomerItem[];
  
  // Single services for regular / member
  services: SelectedServiceItem[];
  
  location: LocationDetail;
  
  // Financial calculation
  servicesSubtotal: number;
  deliveryFee: number;
  voucherDiscount: number;
  coinDiscount: number;
  customAdjustment: number; // Owner can adjust up/down
  totalPrice: number;
  
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  
  status: ReservationStatus;
  ownerNotes?: string;
  randomCuteQuote?: string;
  
  // Post-completion & review
  hasRatedGoogleMaps?: boolean;
  coinAwarded?: number;
}

export interface MemberAccount {
  id: string;
  fullName: string;
  whatsapp: string;
  passwordHash: string; // Simple hash / string for authentication
  coins: number;
  joinDate: string;
  claimedVoucherIds: string[];
  totalCompletedTreatments: number;
  hasRatedGoogleMaps?: boolean;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'NOMINAL';
  discountValue: number; // e.g. 20 (percent) or 25000 (IDR)
  coinsRequired: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  isActive: boolean;
  totalClaimedCount: number;
  totalUsedCount: number;
}

export interface StaffAccount {
  id: string;
  name: string;
  role: string; // e.g. Senior Nail Artist, Lash Specialist
  phone: string;
  pin: string; // Secret staff PIN
  isActive: boolean;
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  workHours?: number;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userType: 'OWNER' | 'STAFF';
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE' | 'PRICE_EDIT' | 'SETTINGS_UPDATE';
  details?: string;
}

export interface DaySchedule {
  dayOfWeek: number; // 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
  dayName: string; // 'Minggu' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'
  isOpen: boolean;
  openTime: string; // e.g. '09:00'
  closeTime: string; // e.g. '20:00'
  hasBreak: boolean;
  breakStartTime: string; // e.g. '12:00'
  breakEndTime: string; // e.g. '13:00'
  note?: string;
}

export interface DateOverrideSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. 'Libur Nasional', 'Buka Khusus Weekend'
  isOpen: boolean; // true: buka jam khusus, false: tutup/libur total
  openTime?: string;
  closeTime?: string;
  hasBreak?: boolean;
  breakStartTime?: string;
  breakEndTime?: string;
  note?: string;
}

export interface OperationalScheduleSettings {
  regularWeeklySchedule: DaySchedule[];
  dateOverrides: DateOverrideSchedule[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  ownerEmail: string;
  ownerWhatsapp: string;
  googleMapsUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  ownerPin: string; // Default: 560605
  coinRewardPercentage: number; // Default: 2 (%)
  storeAddress: string;
  storeCoordinate: { lat: number; lng: number };
  operationalSchedule: OperationalScheduleSettings;
}

