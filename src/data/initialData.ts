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
  ownerEmail: "",
  googleMapsUrl: "https://maps.app.goo.gl/T1xS1ZDyDZgAe7uU7?g_st=awb",
  instagramHandle: "@lyras_naillash.id",
  instagramUrl: "https://www.instagram.com/lyras_naillash.id?dlrf=MTZkNGQzZ3Q3ZWRwaQ==",
  tiktokHandle: "@lyrasnaillash",
  tiktokUrl: "https://www.tiktok.com/@lyrasnaillash?_r=1&_t=ZS-9B1xfjpGu9q",
  ownerPin: "560605",
  coinRewardPercentage: 0.001,
  storeAddress: "Mall Taman Palem Lt G Blok A 30B, Cengkareng Timur, Jakarta Barat",
  storeCoordinate: { lat: -6.1435, lng: 106.7382 },
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
        price: 0,
        discountPercentage: 0,
        useColorManager: true,
        useCodeManager: false,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Kutek gel tahan lama hingga 4 minggu dengan kilau maksimal.',
        subSubCategories: [
          { id: 'ssc-gp-polos', name: 'Gel Polis Polos (Satu Warna)', price: 50000, discountPercentage: 0, estimatedMinutes: 45 },
          { id: 'ssc-gp-mix', name: 'Gel Polis Mix 2-3 Warna', price: 65000, discountPercentage: 0, estimatedMinutes: 60 },
          { id: 'ssc-gp-french', name: 'French Gel Polish Classic', price: 75000, discountPercentage: 0, estimatedMinutes: 60 },
          { id: 'ssc-gp-glitter', name: 'Glitter Polish Gradation', price: 70000, discountPercentage: 0, estimatedMinutes: 60 }
        ]
      },
      {
        id: 'sub-cat-eye',
        name: 'Cat Eye',
        price: 75000,
        discountPercentage: 0,
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
        price: 0,
        discountPercentage: 0,
        useColorManager: true,
        useCodeManager: true,
        useTypeManager: true,
        requireDesignUpload: true,
        description: 'Penyambungan kuku instan yang kokoh dan presisi.',
        subSubCategories: [
          { id: 'ssc-ext-polos', name: 'Extension Polos', price: 125000, discountPercentage: 0, estimatedMinutes: 90 },
          { id: 'ssc-ext-mix', name: 'Extension Mix Warna', price: 125000, discountPercentage: 0, estimatedMinutes: 90 },
          { id: 'ssc-ext-cateye', name: 'Cat Eye Extension', price: 150000, discountPercentage: 0, estimatedMinutes: 100 },
          { id: 'ssc-ext-motif', name: 'Extension Motif Request', price: 160000, discountPercentage: 0, estimatedMinutes: 110 },
          { id: 'ssc-ext-ombre', name: 'Ext Motif + Ombre', price: 180000, discountPercentage: 0, estimatedMinutes: 120 }
        ]
      },
      {
        id: 'sub-nail-ext-3d',
        name: 'Nail Extension 3D',
        price: 180000,
        discountPercentage: 0,
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
        price: 20000,
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
        discountPercentage: 0,
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
  price: 150000,
  discountPercentage: 0,
  useColorManager: false,
  useCodeManager: false,
  useTypeManager: false,
  requireDesignUpload: false,
  description: 'Pelentikan bulu mata asli menggunakan keratin alami tanpa bulu mata tambahan',
  estimatedMinutes: 60
}
```
  ]
