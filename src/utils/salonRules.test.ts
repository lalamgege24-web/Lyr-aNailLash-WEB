import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countWords,
  validateDescriptionWordCount,
  isVoucherDisplayable,
  canSubmitGroupBooking,
  calculateMemberCoins,
  calculateExtensionPrice
} from './salonRules';

test('countWords accurately counts Indonesian and English words', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('Kutek gel premium dengan kilau 3D memukau'), 7);
});

test('validateDescriptionWordCount enforces maximum 50 words', () => {
  const shortText = 'Perawatan kuku estetik dengan kutek gel premium dan hiasan custom.';
  const resValid = validateDescriptionWordCount(shortText);
  assert.equal(resValid.valid, true);
  assert.equal(resValid.error, undefined);

  // Generate 55 words
  const longText = Array(55).fill('kata').join(' ');
  const resInvalid = validateDescriptionWordCount(longText);
  assert.equal(resInvalid.valid, false);
  assert.ok(resInvalid.error?.includes('Deskripsi melebihi batas'));
});

test('isVoucherDisplayable respects scheduled dates and quota limits', () => {
  const activeVoucher = {
    isActive: true,
    displayStartDate: '2026-11-01',
    displayEndDate: '2026-11-30',
    maxClaimsQuota: 10,
    totalClaimedCount: 4
  };
  assert.equal(isVoucherDisplayable(activeVoucher, '2026-11-05'), true);

  // Before start date
  assert.equal(isVoucherDisplayable(activeVoucher, '2026-10-31'), false);

  // After end date
  assert.equal(isVoucherDisplayable(activeVoucher, '2026-12-01'), false);

  // Quota reached
  const quotaReachedVoucher = { ...activeVoucher, totalClaimedCount: 10 };
  assert.equal(isVoucherDisplayable(quotaReachedVoucher, '2026-11-05'), false);
});

test('canSubmitGroupBooking requires min 3 members and no active editing', () => {
  // Less than 3 members
  const twoMembers = [
    { id: '1', fullName: 'Alice', isEditing: false, services: [{ id: 's1' }] },
    { id: '2', fullName: 'Bella', isEditing: false, services: [{ id: 's2' }] }
  ];
  assert.equal(canSubmitGroupBooking(twoMembers).canSubmit, false);

  // 3 members, but member 3 is still editing
  const threeMembersWithEditing = [
    { id: '1', fullName: 'Alice', isEditing: false, services: [{ id: 's1' }] },
    { id: '2', fullName: 'Bella', isEditing: false, services: [{ id: 's2' }] },
    { id: '3', fullName: 'Clara', isEditing: true, services: [{ id: 's3' }] }
  ];
  const resEditing = canSubmitGroupBooking(threeMembersWithEditing);
  assert.equal(resEditing.canSubmit, false);
  assert.ok(resEditing.reason?.includes('sedang mengedit'));

  // 3 members, all ready and have selected services
  const readyGroup = [
    { id: '1', fullName: 'Alice', isEditing: false, services: [{ id: 's1' }] },
    { id: '2', fullName: 'Bella', isEditing: false, services: [{ id: 's2' }] },
    { id: '3', fullName: 'Clara', isEditing: false, services: [{ id: 's3' }] }
  ];
  assert.equal(canSubmitGroupBooking(readyGroup).canSubmit, true);
});

test('calculateMemberCoins awards correct loyalty coins based on percentage', () => {
  assert.equal(calculateMemberCoins(150000, 2), 3000);
  assert.equal(calculateMemberCoins(100000, 0.001), 1);
  assert.equal(calculateMemberCoins(250000, 10), 25000);
});

test('calculateExtensionPrice computes millimeter increment surcharges', () => {
  // base 50.000 for 6mm, min 6mm, step 1mm, surcharge 3.000 per mm
  // 10mm -> 4mm extra -> 50.000 + 4 * 3.000 = 62.000
  assert.equal(calculateExtensionPrice(50000, 10, 6, 3000), 62000);
  assert.equal(calculateExtensionPrice(50000, 6, 6, 3000), 50000);
});
