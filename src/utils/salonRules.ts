/**
 * Pure salon business logic for word limits, voucher visibility,
 * group booking validation, and pricing rules.
 */

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateDescriptionWordCount(text: string, maxWords: number = 50): {
  valid: boolean;
  wordCount: number;
  remainingWords: number;
  error?: string;
} {
  const count = countWords(text);
  const valid = count <= maxWords;
  return {
    valid,
    wordCount: count,
    remainingWords: Math.max(0, maxWords - count),
    error: valid ? undefined : `Deskripsi melebihi batas maksimal 50 kata (${count}/50 kata). Harap dipersingkat!`
  };
}

export interface VoucherVisibilityInput {
  isActive: boolean;
  displayStartDate?: string; // YYYY-MM-DD
  displayEndDate?: string; // YYYY-MM-DD
  maxClaimsQuota?: number;
  totalClaimedCount?: number;
}

export function isVoucherDisplayable(
  voucher: VoucherVisibilityInput,
  currentDateStr: string = new Date().toISOString().slice(0, 10)
): boolean {
  if (!voucher.isActive) return false;

  // Check scheduled start date
  if (voucher.displayStartDate && currentDateStr < voucher.displayStartDate) {
    return false;
  }

  // Check scheduled end date
  if (voucher.displayEndDate && currentDateStr > voucher.displayEndDate) {
    return false;
  }

  // Check quota claim limit
  if (typeof voucher.maxClaimsQuota === 'number' && voucher.maxClaimsQuota > 0) {
    if ((voucher.totalClaimedCount || 0) >= voucher.maxClaimsQuota) {
      return false;
    }
  }

  return true;
}

export interface GroupMemberCheck {
  id: string;
  fullName: string;
  isEditing?: boolean;
  services: any[];
}

export function canSubmitGroupBooking(members: GroupMemberCheck[]): {
  canSubmit: boolean;
  reason?: string;
} {
  if (!members || members.length < 3) {
    return {
      canSubmit: false,
      reason: 'Pemesanan Gabungan wajib minimal 3 orang anggota.'
    };
  }

  // Constraint: Cannot submit if any member is still editing
  const editingMember = members.find(m => m.isEditing);
  if (editingMember) {
    return {
      canSubmit: false,
      reason: `Tidak dapat mengirim reservasi! Anggota "${editingMember.fullName || 'Salah satu anggota'}" masih dalam status sedang mengedit/memilih layanan.`
    };
  }

  // Check that every member has selected at least 1 service
  const emptyServiceMember = members.find(m => !m.services || m.services.length === 0);
  if (emptyServiceMember) {
    return {
      canSubmit: false,
      reason: `Anggota "${emptyServiceMember.fullName || 'Salah satu anggota'}" belum memilih layanan treatment!`
    };
  }

  return { canSubmit: true };
}

export function calculateMemberCoins(subtotal: number, rewardPercentage: number): number {
  if (!subtotal || subtotal <= 0 || !rewardPercentage || rewardPercentage <= 0) return 0;
  return Math.round(subtotal * (rewardPercentage / 100));
}

export function calculateExtensionPrice(
  basePrice: number,
  selectedLengthMm: number,
  minMm: number,
  pricePerMm: number
): number {
  const safeBase = Math.max(0, basePrice || 0);
  const deltaMm = Math.max(0, (selectedLengthMm || minMm) - minMm);
  const extra = deltaMm * Math.max(0, pricePerMm || 0);
  return safeBase + extra;
}
