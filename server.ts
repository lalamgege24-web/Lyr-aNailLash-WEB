import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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
  INITIAL_ATTENDANCE
} from './src/data/initialData';
import { Reservation, StoreSettings, AuditLog, GroupRoom, GroupMemberSession, MemberAccount } from './src/types/salon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Ensure persistent data directory
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'db.json');

interface AppDb {
  settings: StoreSettings;
  categories: any[];
  colors: any[];
  codes: any[];
  types: any[];
  accessories: any[];
  extensions: any[];
  vouchers: any[];
  staff: any[];
  members: MemberAccount[];
  reservations: Reservation[];
  attendance: any[];
  auditLogs: AuditLog[];
  groups: Record<string, GroupRoom>;
}

function loadDb(): AppDb {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        settings: parsed.settings || INITIAL_SETTINGS,
        categories: parsed.categories || INITIAL_CATEGORIES,
        colors: parsed.colors || INITIAL_COLORS,
        codes: parsed.codes || INITIAL_CODES,
        types: parsed.types || INITIAL_TYPES,
        accessories: parsed.accessories || INITIAL_ACCESSORIES,
        extensions: parsed.extensions || INITIAL_EXTENSIONS,
        vouchers: parsed.vouchers || INITIAL_VOUCHERS,
        staff: parsed.staff || INITIAL_STAFF,
        members: parsed.members || INITIAL_MEMBERS,
        reservations: parsed.reservations || INITIAL_RESERVATIONS,
        attendance: parsed.attendance || INITIAL_ATTENDANCE,
        auditLogs: parsed.auditLogs || [],
        groups: parsed.groups || {}
      };
    }
  } catch (err) {
    console.error('Error loading db.json, fallback to defaults:', err);
  }

  const initialDb: AppDb = {
    settings: INITIAL_SETTINGS,
    categories: INITIAL_CATEGORIES,
    colors: INITIAL_COLORS,
    codes: INITIAL_CODES,
    types: INITIAL_TYPES,
    accessories: INITIAL_ACCESSORIES,
    extensions: INITIAL_EXTENSIONS,
    vouchers: INITIAL_VOUCHERS,
    staff: INITIAL_STAFF,
    members: INITIAL_MEMBERS,
    reservations: INITIAL_RESERVATIONS,
    attendance: INITIAL_ATTENDANCE,
    auditLogs: [],
    groups: {}
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: AppDb): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// In-memory working copy
let db: AppDb = loadDb();

// SSE Broadcast Manager
interface SSEClient {
  id: number;
  res: Response;
}
let sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcast(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  const message = `event: ${eventType}\ndata: ${data}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.res.write(message);
    } catch {
      // client failed
    }
  });
}

// Heartbeat every 15s to keep connections alive
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.res.write(': ping\n\n');
    } catch {
      // ignored
    }
  });
}, 15000);

// --- REST API ROUTES ---

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full state
app.get('/api/state', (_req: Request, res: Response) => {
  res.json(db);
});

// SSE Events endpoint for instantaneous multi-browser sync
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(': connected\n\n');

  const clientId = nextClientId++;
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Reservations endpoints
app.get('/api/reservations', (_req: Request, res: Response) => {
  res.json(db.reservations);
});

app.post('/api/reservations', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || (!body.fullName && !body.id && !body.bookingCode)) {
      return res.status(400).json({ error: 'Data reservasi tidak valid' });
    }

    const newRes: Reservation = {
      ...body,
      id: body.id || `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      status: body.status || 'PENDING'
    };

    // Add to top of list
    const existingIndex = db.reservations.findIndex((r) => r.id === newRes.id);
    if (existingIndex >= 0) {
      db.reservations[existingIndex] = newRes;
    } else {
      db.reservations = [newRes, ...db.reservations];
    }

    saveDb(db);
    broadcast('RESERVATION_CREATED', newRes);
    return res.status(201).json(newRes);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/reservations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partial = req.body;
    const index = db.reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan' });
    }

    const updated = { ...db.reservations[index], ...partial };
    db.reservations[index] = updated;

    saveDb(db);
    broadcast('RESERVATION_UPDATED', updated);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reservations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.reservations.length;
    const deletedRes = db.reservations.find(r => r.id === id);
    db.reservations = db.reservations.filter((r) => r.id !== id);

    if (db.reservations.length === initialLen) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan' });
    }

    saveDb(db);
    broadcast('RESERVATION_DELETED', { id, bookingCode: deletedRes?.bookingCode });
    return res.json({ success: true, id, message: 'Riwayat reservasi berhasil dihapus' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Staff endpoints
app.get('/api/staff', (_req: Request, res: Response) => {
  res.json(db.staff);
});

app.post('/api/staff', (req: Request, res: Response) => {
  try {
    const staffList = req.body;
    if (Array.isArray(staffList)) {
      db.staff = staffList;
      saveDb(db);
      broadcast('STAFF_UPDATED', db.staff);
      return res.json(db.staff);
    }
    return res.status(400).json({ error: 'Data staf tidak valid' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Attendance endpoints
app.get('/api/attendance', (_req: Request, res: Response) => {
  res.json(db.attendance);
});

app.post('/api/attendance', (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record || !record.id) {
      return res.status(400).json({ error: 'Data absensi tidak valid' });
    }

    const existingIndex = db.attendance.findIndex(a => a.id === record.id);
    if (existingIndex >= 0) {
      db.attendance[existingIndex] = { ...db.attendance[existingIndex], ...record };
    } else {
      db.attendance = [record, ...db.attendance];
    }

    saveDb(db);
    broadcast('ATTENDANCE_RECORDED', record);
    return res.status(201).json(record);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete attendance record (Owner feature)
app.delete('/api/attendance/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.attendance.length;
    db.attendance = db.attendance.filter(a => a.id !== id);

    if (db.attendance.length === initialLen) {
      return res.status(404).json({ error: 'Data absensi tidak ditemukan' });
    }

    // Add audit log
    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userType: 'OWNER',
      userName: 'Owner',
      action: 'ATTENDANCE_DELETE',
      details: `Menghapus catatan absensi ID: ${id}`
    };
    db.auditLogs.unshift(audit);

    saveDb(db);
    broadcast('ATTENDANCE_DELETED', { id });
    return res.json({ success: true, id, message: 'Status kehadiran berhasil dihapus' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- GROUP ROOMS (MULTI-BROWSER REAL-TIME PEMESANAN GABUNGAN) ---

// Get group room by code
app.get('/api/groups/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const room = db.groups[code];
  if (!room) {
    return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
  }
  return res.json(room);
});

// Create new group room
app.post('/api/groups', (req: Request, res: Response) => {
  try {
    const { 
      groupName, 
      leaderName, 
      leaderWhatsapp, 
      appointmentDate, 
      appointmentTime, 
      location,
      isRegisteredMember,
      memberId
    } = req.body;

    if (!groupName || !leaderName || !leaderWhatsapp) {
      return res.status(400).json({ error: 'Nama Kelompok, Nama Ketua, dan WhatsApp Ketua wajib diisi' });
    }

    // Generate readable code e.g. GRP-4A8F
    const randCode = 'LYRA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const leaderMemberId = `gm-${Date.now()}-lead`;

    const leaderMember: GroupMemberSession = {
      id: leaderMemberId,
      fullName: leaderName.trim(),
      whatsapp: leaderWhatsapp.trim(),
      isLeader: true,
      isRegisteredMember: !!isRegisteredMember,
      memberId: memberId || undefined,
      services: [],
      subtotalServices: 0,
      isEditing: false,
      lastUpdated: Date.now()
    };

    const newRoom: GroupRoom = {
      roomCode: randCode,
      groupName: groupName.trim(),
      leaderId: leaderMemberId,
      leaderName: leaderName.trim(),
      leaderWhatsapp: leaderWhatsapp.trim(),
      appointmentDate: appointmentDate || new Date().toISOString().slice(0, 10),
      appointmentTime: appointmentTime || '14:00',
      location: location || {
        isHomeService: false,
        province: 'DKI Jakarta',
        regency: 'Jakarta Barat',
        district: 'Cengkareng',
        village: 'Cengkareng Timur',
        streetAddress: 'Mall Taman Palem Lt G Blok A 30B, Cengkareng Timur, Jakarta Barat',
        calculatedDistanceKm: 0,
        baseDeliveryFee: 0,
        additional5KmFee: 0,
        coinDiscountAmount: 0,
        totalDeliveryFee: 0
      },
      members: [leaderMember],
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.groups[randCode] = newRoom;
    saveDb(db);
    broadcast('GROUP_UPDATED', newRoom);
    return res.status(201).json(newRoom);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Join group room
app.post('/api/groups/:code/join', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = db.groups[code];
    if (!room) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan dengan kode ini' });
    }
    if (room.status === 'SUBMITTED') {
      return res.status(400).json({ error: 'Kelompok ini sudah menyelesaikan reservasi dan terkunci.' });
    }

    const { fullName, whatsapp, isRegisteredMember, memberId } = req.body;
    if (!fullName || !whatsapp) {
      return res.status(400).json({ error: 'Nama dan Nomor WhatsApp wajib diisi' });
    }

    // Check if member already in room with same phone
    let member = room.members.find(m => m.whatsapp === whatsapp.trim());
    if (!member) {
      const newMemberId = `gm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      member = {
        id: newMemberId,
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        isLeader: false,
        isRegisteredMember: !!isRegisteredMember,
        memberId: memberId || undefined,
        services: [],
        subtotalServices: 0,
        isEditing: true, // starts in editing mode so they pick their treatments
        lastUpdated: Date.now()
      };
      room.members.push(member);
    } else {
      member.fullName = fullName.trim();
      member.isRegisteredMember = !!isRegisteredMember;
      member.memberId = memberId || member.memberId;
    }

    room.updatedAt = new Date().toISOString();
    saveDb(db);
    broadcast('GROUP_UPDATED', room);
    return res.json({ room, member });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Member updates their services or toggles editing status
app.patch('/api/groups/:code/member/:memberId', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const { memberId } = req.params;
    const room = db.groups[code];
    if (!room) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    const memberIndex = room.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan dalam kelompok' });
    }

    const { services, isEditing, fullName, whatsapp, isRegisteredMember, memberId: accMemberId } = req.body;
    const current = room.members[memberIndex];

    if (services !== undefined) {
      current.services = services;
      current.subtotalServices = services.reduce((acc: number, s: any) => acc + (s.finalPrice || 0), 0);
    }
    if (isEditing !== undefined) {
      current.isEditing = isEditing;
    }
    if (fullName) current.fullName = fullName.trim();
    if (whatsapp) current.whatsapp = whatsapp.trim();
    if (isRegisteredMember !== undefined) current.isRegisteredMember = isRegisteredMember;
    if (accMemberId !== undefined) current.memberId = accMemberId;
    current.lastUpdated = Date.now();

    room.members[memberIndex] = current;
    room.updatedAt = new Date().toISOString();
    saveDb(db);
    broadcast('GROUP_UPDATED', room);
    return res.json(room);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Leader updates schedule / location
app.patch('/api/groups/:code/schedule', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = db.groups[code];
    if (!room) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    const { appointmentDate, appointmentTime, location, customerNotes } = req.body;
    if (appointmentDate) room.appointmentDate = appointmentDate;
    if (appointmentTime) room.appointmentTime = appointmentTime;
    if (location) room.location = location;
    if (customerNotes !== undefined) room.customerNotes = customerNotes;

    room.updatedAt = new Date().toISOString();
    saveDb(db);
    broadcast('GROUP_UPDATED', room);
    return res.json(room);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Remove member from group
app.delete('/api/groups/:code/member/:memberId', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const { memberId } = req.params;
    const room = db.groups[code];
    if (!room) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    room.members = room.members.filter(m => m.id !== memberId);
    room.updatedAt = new Date().toISOString();
    saveDb(db);
    broadcast('GROUP_UPDATED', room);
    return res.json(room);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Leader submits final group reservation
app.post('/api/groups/:code/submit', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = db.groups[code];
    if (!room) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }
    if (room.status === 'SUBMITTED') {
      return res.status(400).json({ error: 'Reservasi kelompok ini sudah pernah dikirimkan.' });
    }

    // Must have at least 3 members
    if (room.members.length < 3) {
      return res.status(400).json({ error: 'Pemesanan Gabungan wajib minimal 3 orang anggota.' });
    }

    // Constraint: Leader CANNOT submit if any member is still editing!
    const editingMember = room.members.find(m => m.isEditing);
    if (editingMember) {
      return res.status(400).json({ 
        error: `Tidak dapat mengirim reservasi! Anggota "${editingMember.fullName}" masih dalam status sedang mengedit/memilih layanan.` 
      });
    }

    // Calculate totals
    const servicesSubtotal = room.members.reduce((acc, m) => acc + (m.subtotalServices || 0), 0);
    const deliveryFee = room.location.isHomeService ? room.location.totalDeliveryFee : 0;
    const totalPrice = servicesSubtotal + deliveryFee;

    // Convert members to GroupCustomerItem and award coins if member registered
    const coinPercentage = db.settings.coinRewardPercentage || 2;
    const groupCustomerItems = room.members.map(m => {
      const earnedCoins = m.isRegisteredMember 
        ? Math.round(m.subtotalServices * (coinPercentage / 100))
        : 0;

      // Update member account coins in db if member registered
      if (m.isRegisteredMember && m.memberId) {
        const memIndex = db.members.findIndex(acc => acc.id === m.memberId || acc.whatsapp === m.whatsapp);
        if (memIndex >= 0) {
          db.members[memIndex].coins += earnedCoins;
          db.members[memIndex].totalCompletedTreatments = (db.members[memIndex].totalCompletedTreatments || 0) + 1;
        }
      }

      return {
        id: m.id,
        fullName: m.fullName,
        whatsapp: m.whatsapp,
        isRegisteredMember: m.isRegisteredMember,
        memberId: m.memberId,
        coinsEarned: earnedCoins,
        services: m.services,
        subtotalServices: m.subtotalServices
      };
    });

    const reservationId = `res-${Date.now()}`;
    const bookingCode = `GRP-${Date.now().toString().slice(-4)}`;

    const newReservation: Reservation = {
      id: reservationId,
      bookingCode,
      type: 'GABUNGAN',
      createdAt: new Date().toISOString(),
      appointmentDate: room.appointmentDate,
      appointmentTime: room.appointmentTime,
      fullName: room.groupName ? `${room.groupName} (Ketua: ${room.leaderName})` : `Rombongan ${room.leaderName}`,
      whatsapp: room.leaderWhatsapp,
      groupMembers: groupCustomerItems,
      services: [], // Distributed across group members
      location: room.location,
      servicesSubtotal,
      deliveryFee,
      voucherDiscount: 0,
      coinDiscount: 0,
      customAdjustment: 0,
      totalPrice,
      paymentStatus: 'BELUM_BAYAR',
      status: 'PENDING',
      ownerNotes: room.customerNotes ? `Catatan Kelompok: ${room.customerNotes}` : undefined,
      randomCuteQuote: 'Kecantikan sejati semakin bersinar saat dinikmati bersama sahabat tercinta! 🌸✨'
    };

    db.reservations = [newReservation, ...db.reservations];
    room.status = 'SUBMITTED';
    room.submittedReservationId = reservationId;
    room.updatedAt = new Date().toISOString();

    saveDb(db);
    broadcast('RESERVATION_CREATED', newReservation);
    broadcast('GROUP_UPDATED', room);

    return res.status(201).json({ success: true, reservation: newReservation, room });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Settings endpoints
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.settings);
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const partial: Partial<StoreSettings> = req.body;
    db.settings = { ...db.settings, ...partial };
    saveDb(db);
    broadcast('SETTINGS_UPDATED', db.settings);
    return res.json(db.settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Synchronize all items from client (bulk sync)
app.post('/api/sync', (req: Request, res: Response) => {
  try {
    const { key, data } = req.body;
    if (key && data !== undefined) {
      (db as any)[key] = data;
      saveDb(db);
      broadcast('SYNC_UPDATED', { key, data });
      return res.json({ success: true, key });
    }
    return res.status(400).json({ error: 'Invalid key or data' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- SERVER SETUP & VITE MOUNT ---

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Clean URL rewrites for dedicated role portals
    app.use((req: Request, _res: Response, next) => {
      const urlPath = req.url.split('?')[0];
      const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';

      if (urlPath === '/owner' || urlPath === '/owner/') {
        req.url = '/owner.html' + query;
      } else if (urlPath === '/staff' || urlPath === '/staff/') {
        req.url = '/staff.html' + query;
      } else if (urlPath === '/customer' || urlPath === '/customer/') {
        req.url = '/index.html' + query;
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/owner')) {
        res.sendFile(path.join(distPath, 'owner.html'));
      } else if (req.path.startsWith('/staff')) {
        res.sendFile(path.join(distPath, 'staff.html'));
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Lyra's Nail-Lash server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
