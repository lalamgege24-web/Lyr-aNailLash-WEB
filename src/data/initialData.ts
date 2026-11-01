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
  StaffAttendance
} from '../types/salon';
import { DEFAULT_OPERATIONAL_SCHEDULE } from '../utils/scheduleUtils';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Lyra's Nail-Lash",
  tagline: "Elegance in Every Detail • Premium Nail & Lash Studio",
  logoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&auto=format&fit=crop&q=80",
  ownerEmail: "csimanjuntakgeofany@gmail.com",
  ownerWhatsapp: "082253517860",
  googleMapsUrl: "https://maps.app.goo.gl/T1xS1ZDyDZgAe7uU7?g_st=awb",
  instagramHandle: "@lyras_naillash.id",
  instagramUrl: "https://instagram.com/lyras_naillash.id",
  tiktokHandle: "@lyrasnaillash",
  tiktokUrl: "https://tiktok.com/@lyrasnaillash",
  ownerPin: "560605",
  coinRewardPercentage: 2, // Default 2%, customizable from 0.001% to 100% with 0.001 precision
  storeAddress: "Mall Taman Palem Lt G Blok A 30B, Cengkareng Timur, Jakarta Barat",
  storeCoordinate: { lat: -6.1438, lng: 106.7356 },
  operationalSchedule: DEFAULT_OPERATIONAL_SCHEDULE
};

export const CUTE_QUOTES: string[] = [
  "Kecantikan sejati dimulai saat kamu memutuskan untuk memanjakan dirimu hari ini! ✨💅",
  "Nails before males! Terima kasih sudah mempercayakan pesonamu di Lyra's Nail-Lash 💕",
  "Bulu mata lentik dan senyuman manis adalah kombinasi paling mematikan di dunia! 🌷",
  "Tampil memukau setiap hari bukan pilihan, tapi keharusan seorang ratu! 👑✨",
  "Investasi terbaik seorang wanita adalah senyuman cerah dan kuku yang terawat berkilau! 💖",
  "Hidup itu terlalu singkat untuk memiliki kuku dan bulu mata yang biasa-biasa saja! 🌸💅",
  "Bulu mata cetar, hari-hari pun makin bersinar! Stay fabulous & gorgeous, Lovely! ✨🦋",
  "Self-care bukan pengeluaran, melainkan bentuk apresiasi tertinggi untuk diri sendiri. 🌸",
  "Kuku cantik bikin mood ngetik dan pegang cangkir kopi serasa di runaway Paris! ☕💅"
];

export const INITIAL_COLORS: ColorItem[] = [
  { id: 'c1', name: 'Soft Baby Pink', hex: '#FFD1DC', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80', isPopular: true },
  { id: 'c2', name: 'Milky White Cream', hex: '#FFF8E7', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=150&auto=format&fit=crop&q=80', isPopular: true },
  { id: 'c3', name: 'Rose Gold Shimmer', hex: '#E8A598', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=150&auto=format&fit=crop&q=80', isPopular: true },
  { id: 'c4', name: 'Lavender Mist', hex: '#E6E6FA', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=150&auto=format&fit=crop&q=80' },
  { id: 'c5', name: 'Ruby Glam Wine', hex: '#9E2A2B', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=80' },
  { id: 'c6', name: 'Sage Green Pastel', hex: '#B2AC88', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=150&auto=format&fit=crop&q=80' },
  { id: 'c7', name: 'Nude Peach Blossom', hex: '#FAD2E1', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80', isPopular: true },
  { id: 'c8', name: 'Gold Champagne Sparkle', hex: '#D4AF37', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=150&auto=format&fit=crop&q=80', isPopular: true },
  { id: 'c9', name: 'Deep Midnight Blue', hex: '#191970', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=150&auto=format&fit=crop&q=80' },
  { id: 'c10', name: 'Classic Black Noir', hex: '#1A1A1A', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=150&auto=format&fit=crop&q=80' },
];

export const INITIAL_CODES: CodeItem[] = [
  { id: 'cd1', name: 'Foil Emas Premium', code: 'FOIL-GOLD-01', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=150&auto=format&fit=crop&q=80', category: 'Foil' },
  { id: 'cd2', name: 'Swarovski Crystal Aurora', code: 'SW-AURORA-02', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=150&auto=format&fit=crop&q=80', category: 'Crystal' },
  { id: 'cd3', name: 'Mutiara Princess Tear', code: 'PEARL-PT-03', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=150&auto=format&fit=crop&q=80', category: 'Pearl' },
  { id: 'cd4', name: 'Pita 3D Korean Ribbon', code: 'RIB-KOR-04', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=80', category: '3D Charm' },
  { id: 'cd5', name: 'Kupu-kupu Kristal Terbang', code: 'FLY-BUTTER-05', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80', category: '3D Charm' },
];

export const INITIAL_TYPES: TypeItem[] = [
  { id: 'tp1', name: 'Shape: Almond Oval', description: 'Bentuk ramping feminim dan membuat jari terlihat jenjang', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=80' },
  { id: 'tp2', name: 'Shape: Coffin / Ballerina', description: 'Ujung datar elegan ala selebriti internasional', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=150&auto=format&fit=crop&q=80' },
  { id: 'tp3', name: 'Shape: Square Natural', description: 'Bentuk kotak tegas rapi dan modern', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=150&auto=format&fit=crop&q=80' },
  { id: 'tp4', name: 'Curl Lash: C-Curl (Natural Lift)', description: 'Kelengkungan natural cocok untuk mata asia', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80' },
  { id: 'tp5', name: 'Curl Lash: D-Curl (Dramatic Doll)', description: 'Kelengkungan lentik maksimal efek mata boneka', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=150&auto=format&fit=crop&q=80' },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-nail',
    name: 'NAIL ART',
    description: 'Perawatan kuku estetik dengan kutek gel premium, ekstensi kuku, dan hiasan custom mewah.',
    subCategories: [
      {
        id: 'sub-gel-polis',
        name: 'Gel Polis',
        price: 0, // Carried by sub-subcategories
        useColorManager: true,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Kutek gel tahan lama hingga 4 minggu dengan kilau maksimal.',
        subSubCategories: [
          { id: 'ssc-gp-polos', name: 'Gel Polis Polos (Satu Warna)', price: 50000, estimatedMinutes: 45 },
          { id: 'ssc-gp-mix', name: 'Gel Polis Mix 2-3 Warna', price: 65000, estimatedMinutes: 60 },
          { id: 'ssc-gp-french', name: 'French Gel Polish Classic', price: 75000, estimatedMinutes: 60 },
          { id: 'ssc-gp-glitter', name: 'Glitter Polish Gradation', price: 70000, estimatedMinutes: 60 }
        ]
      },
      {
        id: 'sub-cat-eye',
        name: 'Cat Eye',
        price: 75000,
        discountPrice: 0,
        useColorManager: true,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Efek mata kucing magnetik yang berkilau 3D memukau.',
        estimatedMinutes: 60
      },
      {
        id: 'sub-fake-ext',
        name: 'Fake Extension',
        price: 0, // Mutually exclusive: carried by sub-subcategories
        useColorManager: true,
        useCodeManager: true,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Penyambungan kuku instan yang kokoh dan presisi.',
        subSubCategories: [
          { id: 'ssc-ext-polos', name: 'Extension Polos', price: 125000, estimatedMinutes: 90 },
          { id: 'ssc-ext-mix', name: 'Extension Mix Warna', price: 125000, estimatedMinutes: 90 },
          { id: 'ssc-ext-cateye', name: 'Cat Eye Extension', price: 150000, estimatedMinutes: 100 },
          { id: 'ssc-ext-motif', name: 'Extension Motif Request', price: 160000, estimatedMinutes: 110 },
          { id: 'ssc-ext-ombre', name: 'Ext Motif + Ombre', price: 180000, estimatedMinutes: 120 }
        ]
      },
      {
        id: 'sub-nail-ext-3d',
        name: 'Nail Extension 3D',
        price: 180000,
        discountPrice: 0,
        useColorManager: true,
        useCodeManager: true,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Ekstensi kuku eksklusif dengan aksen 3D dan seni kuku bertingkat.',
        estimatedMinutes: 120
      },
      {
        id: 'sub-accessories',
        name: 'Accessories',
        price: 20000, // Custom / starting
        discountPrice: 0,
        useColorManager: false,
        useCodeManager: true,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Tambahan charms, mutiara, foil, batu permata, dan perhiasan kuku.',
        estimatedMinutes: 20
      },
      {
        id: 'sub-embos-3d',
        name: 'Design Embos/3D',
        price: 35000,
        discountPrice: 0,
        useColorManager: true,
        useCodeManager: true,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Karya seni kuku timbul tekstur sweater/embossed yang estetik.',
        estimatedMinutes: 30
      },
      {
        id: 'sub-remover-nail',
        name: 'Remover Nail',
        price: 25000,
        discountPrice: 0,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Pembersihan dan pelepasan kutek gel / extension secara higienis aman tanpa merusak kuku asli.',
        estimatedMinutes: 30
      },
      {
        id: 'sub-manicures',
        name: 'Manicures',
        price: 35000,
        discountPrice: 0,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Perawatan kutikula, pembentukan kuku, pembersihan higienis, dan nutrisi vitamin kuku.',
        estimatedMinutes: 40
      },
      {
        id: 'sub-pedicure',
        name: 'Pedi Cure',
        price: 100000,
        discountPrice: 0,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Perawatan lengkap kuku dan tumit kaki, relaksasi scrub, dan vitamin.',
        estimatedMinutes: 60
      }
    ]
  },
  {
    id: 'cat-eyelash',
    name: 'EYELASH',
    description: 'Pemasangan bulu mata extension helai demi helai menggunakan bahan mink lembut buatan Jepang/Korea.',
    subCategories: [
      {
        id: 'sub-eye-nat',
        name: 'Eyelash Natural',
        price: 130000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Tampilan lentik natural serasa tanpa extension, sangat ringan untuk sehari-hari.',
        estimatedMinutes: 75
      },
      {
        id: 'sub-double-std',
        name: 'Double Standar',
        price: 160000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Volume dobel proporsional yang membuat mata tampak segar dan terbuka lebar.',
        estimatedMinutes: 90
      },
      {
        id: 'sub-yy-lash',
        name: 'YY Lash',
        price: 135000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Bentuk cabang YY yang memberikan efek anyaman penuh namun tetap fluffy dan ringan.',
        estimatedMinutes: 80
      },
      {
        id: 'sub-ww-lash',
        name: 'WW Lash',
        price: 135000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Bentuk cabang 3D WW yang memberikan ketebalan maksimal instan.',
        estimatedMinutes: 80
      },
      {
        id: 'sub-russian-lash',
        name: 'Russian Lash',
        price: 200000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Volume tebal glamor ala ratu Rusia dengan fan 4D-6D yang super halus.',
        estimatedMinutes: 110
      },
      {
        id: 'sub-double-nat-11',
        name: 'Eyelash Double Natural Size 11',
        price: 150000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: false,
        description: 'Formula presisi ukuran 11 untuk efek mata dolly look yang manis alami.',
        estimatedMinutes: 85
      },
      {
        id: 'sub-retouch-lash',
        name: 'Retouch Lash',
        price: 70000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Pengisian kembali helai bulu mata yang gugur (maksimal 2-3 minggu setelah pemasangan).',
        estimatedMinutes: 50
      }
    ]
  },
  {
    id: 'cat-lash-lift',
    name: 'LASH LIFT',
    description: 'Pelentikan bulu mata asli menggunakan keratin alami tanpa bulu mata tambahan.',
    subCategories: [
      {
        id: 'sub-lash-lift',
        name: 'Lash Lift',
        price: 100000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Melentikkan bulu mata asli agar tampak lebih panjang dan bervolume alami hingga 6-8 minggu.',
        estimatedMinutes: 60
      },
      {
        id: 'sub-lash-lift-tin',
        name: 'Lash Lift Tin',
        price: 125000,
        useColorManager: false,
        useCodeManager: false,
        useTypeManager: false,
        requireDesignUpload: false,
        description: 'Lash lift dipadukan dengan pewarnaan tint hitam pekat untuk efek maskara semi-permanen.',
        estimatedMinutes: 70
      }
    ]
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-1',
    title: 'Diskon Manja 20% All Services',
    description: 'Potongan harga 20% untuk semua layanan Nail Art & Eyelash.',
    discountType: 'PERCENT',
    discountValue: 20,
    coinsRequired: 300,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    totalClaimedCount: 14,
    totalUsedCount: 9
  },
  {
    id: 'vouch-2',
    title: 'Free 3 Accessories Mewah',
    description: 'Gratis 3 buah aksesoris kristal/charms kuku cantik.',
    discountType: 'NOMINAL',
    discountValue: 35000,
    coinsRequired: 250,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    totalClaimedCount: 22,
    totalUsedCount: 18
  },
  {
    id: 'vouch-3',
    title: 'Free 2 Desain Embos 3D',
    description: 'Gratis 2 jari desain tekstur timbul/embos 3D kustom.',
    discountType: 'NOMINAL',
    discountValue: 50000,
    coinsRequired: 450,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    totalClaimedCount: 8,
    totalUsedCount: 5
  },
  {
    id: 'vouch-4',
    title: 'Cashback Rp 50.000 Spesial Member',
    description: 'Potongan langsung Rp 50.000 untuk total transaksi di atas Rp 200.000.',
    discountType: 'NOMINAL',
    discountValue: 50000,
    coinsRequired: 500,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    totalClaimedCount: 5,
    totalUsedCount: 4
  }
];

export const INITIAL_STAFF: StaffAccount[] = [
  {
    id: 'st-1',
    name: 'Siti Rahmawati',
    role: 'Senior Nail Artist & Extensionist',
    phone: '081234567891',
    pin: '112233',
    isActive: true
  },
  {
    id: 'st-2',
    name: 'Dewi Lestari',
    role: 'Lash Specialist & Keratin Lift',
    phone: '081298765432',
    pin: '445566',
    isActive: true
  },
  {
    id: 'st-3',
    name: 'Anisa Melati',
    role: 'Nail & Pedicure Artist',
    phone: '081377889900',
    pin: '778899',
    isActive: true
  }
];

export const INITIAL_MEMBERS: MemberAccount[] = [
  {
    id: 'mem-1',
    fullName: 'Clara Simanjuntak',
    whatsapp: '081288990011',
    passwordHash: 'clara123',
    coins: 480,
    joinDate: '2026-02-14',
    claimedVoucherIds: ['vouch-1'],
    totalCompletedTreatments: 6,
    hasRatedGoogleMaps: true
  },
  {
    id: 'mem-2',
    fullName: 'Natasha Wilona',
    whatsapp: '081399887766',
    passwordHash: 'natasha123',
    coins: 320,
    joinDate: '2026-04-10',
    claimedVoucherIds: ['vouch-2'],
    totalCompletedTreatments: 4,
    hasRatedGoogleMaps: false
  },
  {
    id: 'mem-3',
    fullName: 'Amanda Zahra',
    whatsapp: '082211445566',
    passwordHash: 'amanda123',
    coins: 650,
    joinDate: '2026-01-20',
    claimedVoucherIds: ['vouch-3'],
    totalCompletedTreatments: 8,
    hasRatedGoogleMaps: true
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    bookingCode: 'LNL-20261031-01',
    type: 'REGULER',
    createdAt: '2026-10-31T08:30:00Z',
    appointmentDate: '2026-10-31',
    appointmentTime: '10:00',
    fullName: 'Nadia Saphira',
    whatsapp: '081233445566',
    email: 'nadia.saphira@gmail.com',
    services: [
      {
        serviceId: 'srv-1',
        categoryId: 'cat-nail',
        categoryName: 'NAIL ART',
        subCategoryId: 'sub-fake-ext',
        subCategoryName: 'Fake Extension',
        subSubCategoryId: 'ssc-ext-cateye',
        subSubCategoryName: 'Cat Eye Extension',
        selectedColors: ['Soft Baby Pink', 'Rose Gold Shimmer'],
        selectedCode: 'Foil Emas Premium',
        selectedType: 'Shape: Almond Oval',
        price: 150000,
        finalPrice: 150000
      }
    ],
    location: {
      isHomeService: false,
      province: 'DKI Jakarta',
      regency: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      village: 'Senayan',
      streetAddress: 'Studio Lyra’s Nail-Lash (Dine-in / Salon Visit)',
      calculatedDistanceKm: 0,
      baseDeliveryFee: 0,
      additional5KmFee: 0,
      coinDiscountAmount: 0,
      totalDeliveryFee: 0
    },
    servicesSubtotal: 150000,
    deliveryFee: 0,
    voucherDiscount: 0,
    coinDiscount: 0,
    customAdjustment: 0,
    totalPrice: 150000,
    paymentStatus: 'LUNAS',
    paymentMethod: 'QRIS',
    status: 'APPROVED',
    ownerNotes: 'Request bentuk almond panjang sedang, kuku sudah dibersihkan.',
    randomCuteQuote: 'Investasi terbaik seorang wanita adalah senyuman cerah dan kuku yang terawat berkilau! 💖'
  },
  {
    id: 'res-102',
    bookingCode: 'LNL-20261031-02',
    type: 'MEMBER',
    createdAt: '2026-10-31T09:15:00Z',
    appointmentDate: '2026-10-31',
    appointmentTime: '13:30',
    fullName: 'Clara Simanjuntak',
    whatsapp: '081288990011',
    email: 'clara.s@gmail.com',
    services: [
      {
        serviceId: 'srv-2',
        categoryId: 'cat-eyelash',
        categoryName: 'EYELASH',
        subCategoryId: 'sub-russian-lash',
        subCategoryName: 'Russian Lash',
        selectedType: 'Curl Lash: D-Curl (Dramatic Doll)',
        price: 200000,
        finalPrice: 200000
      }
    ],
    location: {
      isHomeService: true,
      province: 'DKI Jakarta',
      regency: 'Jakarta Selatan',
      district: 'Cilandak',
      village: 'Cipete Selatan',
      streetAddress: 'Jl. Abdul Majid Dalam No. 18, RT 04/RW 02',
      calculatedDistanceKm: 4.8,
      baseDeliveryFee: 27370,
      additional5KmFee: 0,
      coinDiscountAmount: 100, // 400 coins spent for delivery discount
      totalDeliveryFee: 27270
    },
    servicesSubtotal: 200000,
    deliveryFee: 27270,
    voucherDiscount: 40000, // 20% voucher used
    coinDiscount: 100,
    customAdjustment: 0,
    totalPrice: 187170,
    paymentStatus: 'DP',
    paymentMethod: 'TRANSFER',
    status: 'APPROVED',
    ownerNotes: 'Home service area Cipete Selatan. Staf membawa portable bed & ring light.',
    randomCuteQuote: 'Bulu mata lentik dan senyuman manis adalah kombinasi paling mematikan di dunia! 🌷'
  },
  {
    id: 'res-103',
    bookingCode: 'LNL-20261031-03',
    type: 'GABUNGAN',
    createdAt: '2026-10-31T10:00:00Z',
    appointmentDate: '2026-11-01',
    appointmentTime: '15:00',
    fullName: 'Rombongan Bridal Cantik (Kak Vira)',
    whatsapp: '081122334455',
    email: 'vira.wedding@gmail.com',
    groupMembers: [
      {
        id: 'gm-1',
        fullName: 'Vira (Bride)',
        whatsapp: '081122334455',
        subtotalServices: 180000,
        services: [
          {
            serviceId: 'srv-g1',
            categoryId: 'cat-nail',
            categoryName: 'NAIL ART',
            subCategoryId: 'sub-nail-ext-3d',
            subCategoryName: 'Nail Extension 3D',
            selectedColors: ['Soft Baby Pink', 'Milky White Cream'],
            price: 180000,
            finalPrice: 180000
          }
        ]
      },
      {
        id: 'gm-2',
        fullName: 'Lia (Bridesmaid 1)',
        whatsapp: '081122334456',
        subtotalServices: 75000,
        services: [
          {
            serviceId: 'srv-g2',
            categoryId: 'cat-nail',
            categoryName: 'NAIL ART',
            subCategoryId: 'sub-cat-eye',
            subCategoryName: 'Cat Eye',
            selectedColors: ['Rose Gold Shimmer'],
            price: 75000,
            finalPrice: 75000
          }
        ]
      },
      {
        id: 'gm-3',
        fullName: 'Tiara (Bridesmaid 2)',
        whatsapp: '081122334457',
        subtotalServices: 130000,
        services: [
          {
            serviceId: 'srv-g3',
            categoryId: 'cat-eyelash',
            categoryName: 'EYELASH',
            subCategoryId: 'sub-eye-nat',
            subCategoryName: 'Eyelash Natural',
            price: 130000,
            finalPrice: 130000
          }
        ]
      }
    ],
    services: [],
    location: {
      isHomeService: true,
      province: 'DKI Jakarta',
      regency: 'Jakarta Selatan',
      district: 'Setiabudi',
      village: 'Kuningan Timur',
      streetAddress: 'Apartemen Bellagio Mansion Tower B Unit 1402',
      calculatedDistanceKm: 6.2,
      baseDeliveryFee: 35352,
      additional5KmFee: 800,
      coinDiscountAmount: 0,
      totalDeliveryFee: 36152
    },
    servicesSubtotal: 385000,
    deliveryFee: 36152,
    voucherDiscount: 0,
    coinDiscount: 0,
    customAdjustment: 0,
    totalPrice: 421152,
    paymentStatus: 'BELUM_BAYAR',
    status: 'NEEDS_DISCUSSION',
    ownerNotes: 'Acara prewedding rombongan 3 orang. Jadwal H-1 telah dikirim.',
    randomCuteQuote: 'Tampil memukau setiap hari bukan pilihan, tapi keharusan seorang ratu! 👑✨'
  }
];

export const INITIAL_ATTENDANCE: StaffAttendance[] = [
  {
    id: 'att-1',
    staffId: 'st-1',
    staffName: 'Siti Rahmawati',
    date: '2026-10-31',
    status: 'HADIR',
    checkInTime: '08:50',
    checkOutTime: '18:00',
    workHours: 9,
    notes: 'Tepat waktu, melayani customer pagi dengan ramah.'
  },
  {
    id: 'att-2',
    staffId: 'st-2',
    staffName: 'Dewi Lestari',
    date: '2026-10-31',
    status: 'HADIR',
    checkInTime: '09:05',
    checkOutTime: '17:30',
    workHours: 8.5,
    notes: 'Pemasangan Russian lash reservasi siang.'
  },
  {
    id: 'att-3',
    staffId: 'st-3',
    staffName: 'Anisa Melati',
    date: '2026-10-31',
    status: 'IZIN',
    workHours: 0,
    notes: 'Izin urusan keluarga mendesak (telah lapor owner).'
  }
];
