/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Enable CORS for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ==========================================
// DATA TYPES & MODELS
// ==========================================

export interface User {
  id: string;
  phone: string;
  name: string;
  username: string;
  avatar: string;
  balance: number; // in Tomans
  spinsLeft: number;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    totalWon: number;
    lineWins: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'card_purchase' | 'game_prize' | 'wheel_prize';
  amount: number;
  status: 'successful' | 'pending' | 'failed';
  title: string;
  description: string;
  date: string;
  trackingCode: string;
  sheba?: string;
}

export type TicketMatrix = number[][]; // 3 rows x 9 columns. 0 represents blank cell.

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  matrix: TicketMatrix; // 3x9
  marked: boolean[][]; // 3x9 booleans
  hasWonLine1?: boolean;
  hasWonLine2?: boolean;
  hasWonTombola?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  cardsCount: number;
}

export interface GameRoom {
  id: string;
  name: string;
  cardPrice: number;
  maxCards: number; // 30 cards capacity
  line1Prize: number;
  line2Prize: number;
  tombolaPrize: number;
  status: 'waiting' | 'playing' | 'ended';
  countdown: number;
  drawnNumbers: number[];
  currentDrawnNumber: number | null;
  tickets: Ticket[];
  connectedPlayers: { id: string; name: string; avatar: string }[];
  participants: Participant[];
  winners: {
    line1?: { userId: string; name: string; prize: number; ticketId: string; atNumber: number };
    line2?: { userId: string; name: string; prize: number; ticketId: string; atNumber: number };
    tombola?: { userId: string; name: string; prize: number; ticketId: string; atNumber: number };
  };
}

// In-Memory Database
const users: Map<string, User> = new Map();
const otpStore: Map<string, { code: string; expiresAt: number }> = new Map();
const transactions: Transaction[] = [];

// Seed an initial demo user matching the screenshot (امیرعلی یوسفی / sosis)
const seedUserId = 'user_demo_1';
users.set(seedUserId, {
  id: seedUserId,
  phone: '09012310393',
  name: 'امیرعلی یوسفی',
  username: 'sosis',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  balance: 50000,
  spinsLeft: 1,
  createdAt: 'جمعه ۱۵ آبان ۱۴۰۵',
  stats: {
    gamesPlayed: 14,
    wins: 3,
    totalWon: 150000,
    lineWins: 5,
  },
});

// Seed some initial transactions
transactions.push(
  {
    id: 'tx_101',
    userId: seedUserId,
    type: 'deposit',
    amount: 50000,
    status: 'successful',
    title: 'شارژ آنلاین کیف پول',
    description: 'درگاه پرداخت زیبال / شتاب',
    date: 'امروز ۱۱:۴۵',
    trackingCode: 'ZBL-894210',
  }
);

// ==========================================
// TOMBOLA TICKET GENERATOR (Standard 3x9, 1-90)
// ==========================================

function generateTombolaTicket(): TicketMatrix {
  const matrix: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const getRandomNumbersInRange = (min: number, max: number, count: number): number[] => {
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    const result: number[] = [];
    for (let c = 0; c < count; c++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return result.sort((a, b) => a - b);
  };

  const colCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  let extraNeeded = 6;
  while (extraNeeded > 0) {
    const col = Math.floor(Math.random() * 9);
    if (colCounts[col] < 3) {
      colCounts[col]++;
      extraNeeded--;
    }
  }

  const columnNumbers: number[][] = [];
  for (let c = 0; c < 9; c++) {
    const min = c === 0 ? 1 : c * 10;
    const max = c === 8 ? 90 : c * 10 + 9;
    columnNumbers.push(getRandomNumbersInRange(min, max, colCounts[c]));
  }

  const rowCounts = [0, 0, 0];

  for (let c = 0; c < 9; c++) {
    if (colCounts[c] === 3) {
      matrix[0][c] = columnNumbers[c][0];
      matrix[1][c] = columnNumbers[c][1];
      matrix[2][c] = columnNumbers[c][2];
      rowCounts[0]++;
      rowCounts[1]++;
      rowCounts[2]++;
    }
  }

  for (let c = 0; c < 9; c++) {
    if (colCounts[c] === 2) {
      const rows = [0, 1, 2].sort((a, b) => rowCounts[a] - rowCounts[b]);
      const r1 = rows[0];
      const r2 = rows[1];
      matrix[r1][c] = columnNumbers[c][0];
      matrix[r2][c] = columnNumbers[c][1];
      rowCounts[r1]++;
      rowCounts[r2]++;
    }
  }

  for (let c = 0; c < 9; c++) {
    if (colCounts[c] === 1) {
      const rows = [0, 1, 2].sort((a, b) => rowCounts[a] - rowCounts[b]);
      const r = rows[0];
      matrix[r][c] = columnNumbers[c][0];
      rowCounts[r]++;
    }
  }

  for (let c = 0; c < 9; c++) {
    const present: { r: number; val: number }[] = [];
    for (let r = 0; r < 3; r++) {
      if (matrix[r][c] > 0) {
        present.push({ r, val: matrix[r][c] });
      }
    }
    present.sort((a, b) => a.val - b.val);
    for (let i = 0; i < present.length; i++) {
      matrix[present[i].r][c] = present[i].val;
    }
  }

  return matrix;
}

// ==========================================
// GAME ROOMS STATE & ENGINE
// ==========================================

function createDefaultParticipants(): Participant[] {
  // Matches image_a0dd3853.png: 14 participants, total 29 cards sold out of 30!
  return [
    { id: 'p_melina', name: 'ملینا', avatar: 'م', cardsCount: 2 },
    { id: 'p_sananaz', name: 'ساناناز', avatar: 'س', cardsCount: 3 },
    { id: 'p_eshghi', name: 'عشقی عشق', avatar: 'ع', cardsCount: 2 },
    { id: 'p_seydi', name: 'سیدی m+m', avatar: 'س', cardsCount: 3 },
    { id: 'p_amirreza', name: 'امیرارسلان', avatar: 'ا', cardsCount: 2 },
    { id: 'p_raha', name: 'رها بانو', avatar: 'ر', cardsCount: 2 },
    { id: 'p_parham', name: 'پرهام ۷', avatar: 'پ', cardsCount: 2 },
    { id: 'p_sara', name: 'سارا_۹۹', avatar: 'س', cardsCount: 2 },
    { id: 'p_kourosh', name: 'کوروش کبیر', avatar: 'ک', cardsCount: 2 },
    { id: 'p_armin', name: 'آرمین_vip', avatar: 'آ', cardsCount: 2 },
    { id: 'p_niloofar', name: 'نیلوفر آبی', avatar: 'ن', cardsCount: 2 },
    { id: 'p_shahab', name: 'شهاب سنگ', avatar: 'ش', cardsCount: 2 },
    { id: 'p_maryam', name: 'مریم بانو', avatar: 'م', cardsCount: 2 },
    { id: 'p_fariborz', name: 'فریبرز_تهران', avatar: 'ف', cardsCount: 1 },
  ];
}

const rooms: Map<string, GameRoom> = new Map();

const initialRoomConfigs: Partial<GameRoom>[] = [
  {
    id: 'room_5k',
    name: 'اتاق ۵،۰۰۰ تومانی',
    cardPrice: 5000,
    maxCards: 30,
    line1Prize: 12750, // جایزه دبرنا خطی (from image_5a30d6d0.png)
    line2Prize: 0,
    tombolaPrize: 114750, // جایزه دبرنا پر (from image_5a30d6d0.png)
  },
  {
    id: 'gold_vip',
    name: 'اتاق دبرنا طلایی',
    cardPrice: 50000,
    maxCards: 30,
    line1Prize: 127500,
    line2Prize: 0,
    tombolaPrize: 1147500,
  },
  {
    id: 'room_10k',
    name: 'اتاق ۱۰،۰۰۰ تومانی',
    cardPrice: 10000,
    maxCards: 30,
    line1Prize: 25500,
    line2Prize: 0,
    tombolaPrize: 229500,
  },
  {
    id: 'room_20k',
    name: 'اتاق ۲۰،۰۰۰ تومانی',
    cardPrice: 20000,
    maxCards: 30,
    line1Prize: 51000,
    line2Prize: 0,
    tombolaPrize: 459000,
  },
  {
    id: 'room_50k',
    name: 'اتاق ۵۰،۰۰۰ تومانی',
    cardPrice: 50000,
    maxCards: 30,
    line1Prize: 127500,
    line2Prize: 0,
    tombolaPrize: 1147500,
  },
];

initialRoomConfigs.forEach((cfg) => {
  const parts = createDefaultParticipants();
  rooms.set(cfg.id!, {
    id: cfg.id!,
    name: cfg.name!,
    cardPrice: cfg.cardPrice!,
    maxCards: 30,
    line1Prize: cfg.line1Prize!,
    line2Prize: cfg.line2Prize!,
    tombolaPrize: cfg.tombolaPrize!,
    status: 'waiting',
    countdown: 172, // 02:52 countdown as in image_a0dd3853.png
    drawnNumbers: [],
    currentDrawnNumber: null,
    tickets: [],
    connectedPlayers: [],
    participants: parts,
    winners: {},
  });
});

// Shuffled bag of 1..90
function createShuffledBag(): number[] {
  const bag: number[] = [];
  for (let i = 1; i <= 90; i++) bag.push(i);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Room game interval management
const roomBags: Map<string, number[]> = new Map();

function startGameForRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status === 'playing') return;

  room.status = 'playing';
  room.countdown = 0;
  room.drawnNumbers = [];
  room.currentDrawnNumber = null;
  room.winners = {};
  roomBags.set(roomId, createShuffledBag());

  // Ensure participants have tickets generated up to 30 cards total
  const existingTickets = [...room.tickets];
  const existingUserIds = new Set(existingTickets.map((t) => t.userId));

  // If room tickets are fewer than 30, generate tickets for the remaining participants
  room.participants.forEach((p) => {
    // If participant already has tickets (e.g. human user), keep them
    const pCurrentCount = existingTickets.filter((t) => t.userId === p.id).length;
    const needed = Math.max(0, p.cardsCount - pCurrentCount);
    for (let i = 0; i < needed; i++) {
      existingTickets.push({
        id: `tkt_${p.id}_${i + 1}`,
        userId: p.id,
        userName: p.name,
        roomId: room.id,
        matrix: generateTombolaTicket(),
        marked: [
          [false, false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false, false],
        ],
      });
    }
  });

  room.tickets = existingTickets.slice(0, 30);

  io.to(roomId).emit('room:state', room);
  io.emit('lobby:rooms_update', Array.from(rooms.values()));
}

function resetRoomToWaiting(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'waiting';
  room.countdown = 172; // Reset to 02:52
  room.drawnNumbers = [];
  room.currentDrawnNumber = null;
  room.tickets = [];
  room.participants = createDefaultParticipants();
  room.winners = {};
  roomBags.delete(roomId);

  io.to(roomId).emit('room:state', room);
  io.emit('lobby:rooms_update', Array.from(rooms.values()));
}

// Global 1-second game tick
setInterval(() => {
  rooms.forEach((room, roomId) => {
    if (room.status === 'waiting') {
      const totalCards = room.participants.reduce((sum, p) => sum + p.cardsCount, 0);

      // Rule: Start game when 30 cards are full OR when countdown timer reaches 0
      if (totalCards >= room.maxCards || room.countdown <= 0) {
        startGameForRoom(roomId);
      } else {
        room.countdown--;
        io.to(roomId).emit('room:countdown', { roomId, countdown: room.countdown });
      }
    } else if (room.status === 'playing') {
      // Draw ball every 3.5 seconds
      const bag = roomBags.get(roomId);
      if (bag && bag.length > 0) {
        room.countdown = (room.countdown || 0) + 1;
        // Draw every 3 ticks
        if (room.countdown % 3 === 0) {
          const nextBall = bag.pop()!;
          room.drawnNumbers.push(nextBall);
          room.currentDrawnNumber = nextBall;

          // Check automatic card markings and wins
          checkTicketWins(room, nextBall);

          io.to(roomId).emit('room:number_drawn', {
            roomId,
            number: nextBall,
            drawnNumbers: room.drawnNumbers,
            winners: room.winners,
          });

          // If tombola won or bag empty, end game
          if (room.winners.tombola || bag.length === 0) {
            room.status = 'ended';
            room.countdown = 12; // 12 seconds review podium
            io.to(roomId).emit('room:game_ended', {
              roomId,
              winners: room.winners,
            });
            io.emit('lobby:rooms_update', Array.from(rooms.values()));
          }
        }
      } else {
        room.status = 'ended';
        room.countdown = 12;
        io.to(roomId).emit('room:game_ended', { roomId, winners: room.winners });
        io.emit('lobby:rooms_update', Array.from(rooms.values()));
      }
    } else if (room.status === 'ended') {
      if (room.countdown > 0) {
        room.countdown--;
      } else {
        resetRoomToWaiting(roomId);
      }
    }
  });
}, 1000);

function checkTicketWins(room: GameRoom, drawnNum: number) {
  const drawnSet = new Set(room.drawnNumbers);

  room.tickets.forEach((ticket) => {
    // Count drawn numbers per row
    const rowMarks: number[] = [0, 0, 0];
    let totalMarks = 0;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        const val = ticket.matrix[r][c];
        if (val > 0 && drawnSet.has(val)) {
          ticket.marked[r][c] = true;
          rowMarks[r]++;
          totalMarks++;
        }
      }
    }

    // Line 1 Check: Any 1 row has 5 marks
    if (!room.winners.line1 && !ticket.hasWonLine1) {
      if (rowMarks.some((m) => m === 5)) {
        ticket.hasWonLine1 = true;
        room.winners.line1 = {
          userId: ticket.userId,
          name: ticket.userName,
          prize: room.line1Prize,
          ticketId: ticket.id,
          atNumber: drawnNum,
        };
        // Award user
        awardUser(ticket.userId, room.line1Prize, `جایزه سطر اول (خط ۱) در ${room.name}`);
      }
    }

    // Line 2 Check: Any 2 rows have 5 marks
    if (!room.winners.line2 && !ticket.hasWonLine2) {
      const fullRows = rowMarks.filter((m) => m === 5).length;
      if (fullRows >= 2) {
        ticket.hasWonLine2 = true;
        room.winners.line2 = {
          userId: ticket.userId,
          name: ticket.userName,
          prize: room.line2Prize,
          ticketId: ticket.id,
          atNumber: drawnNum,
        };
        awardUser(ticket.userId, room.line2Prize, `جایزه دو سطر (خط ۲) در ${room.name}`);
      }
    }

    // Tombola (Full Ticket) Check: All 15 marks
    if (!room.winners.tombola && !ticket.hasWonTombola) {
      if (totalMarks === 15) {
        ticket.hasWonTombola = true;
        room.winners.tombola = {
          userId: ticket.userId,
          name: ticket.userName,
          prize: room.tombolaPrize,
          ticketId: ticket.id,
          atNumber: drawnNum,
        };
        awardUser(ticket.userId, room.tombolaPrize, `جایزه دبرنا کامل (تومبالا) در ${room.name}`);
      }
    }
  });
}

function awardUser(userId: string, amount: number, title: string) {
  const user = users.get(userId);
  if (!user) return;

  user.balance += amount;
  user.stats.wins += 1;
  user.stats.totalWon += amount;

  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    type: 'game_prize',
    amount,
    status: 'successful',
    title,
    description: 'واریز آنی به کیف پول',
    date: 'لحظاتی پیش',
    trackingCode: `PRIZE-${Math.floor(100000 + Math.random() * 900000)}`,
  };
  transactions.unshift(tx);

  io.emit('user:balance_updated', { userId, balance: user.balance, stats: user.stats });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Send OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'شماره موبایل وارد شده معتبر نمی‌باشد. فرمت صحیح: 09xxxxxxxxx' });
  }

  // Generate 5-digit code
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 mins
  });

  // Simulated provider log:
  console.log(`[SMS Provider] Sending OTP ${code} to ${phone} via Kavenegar/SMS.ir API`);

  return res.json({
    success: true,
    message: 'کد تایید ۵ رقمی با موفقیت ارسال شد',
    previewCode: code, // For fast testing in AI Studio
    provider: 'Kavenegar / SMS.ir',
  });
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'شماره موبایل و کد الزامی هستند' });
  }

  const stored = otpStore.get(phone);
  // Allow test master code 12345 or valid generated OTP
  if (!stored && code !== '12345') {
    return res.status(400).json({ error: 'کد تایید منقضی شده یا یافت نشد. لطفاً مجدداً درخواست دهید.' });
  }

  if (stored && stored.code !== code && code !== '12345') {
    return res.status(400).json({ error: 'کد وارد شده صحیح نمی‌باشد' });
  }

  // Find or create user
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.phone === phone) {
      user = u;
      break;
    }
  }

  if (!user) {
    const newId = `user_${Date.now()}`;
    user = {
      id: newId,
      phone,
      name: `کاربر ${phone.slice(-4)}`,
      username: `player_${phone.slice(-4)}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      balance: 100000, // Welcome bonus of 100,000 Tomans
      spinsLeft: 3,
      createdAt: 'امروز',
      stats: {
        gamesPlayed: 0,
        wins: 0,
        totalWon: 0,
        lineWins: 0,
      },
    };
    users.set(newId, user);

    // Welcome transaction
    transactions.unshift({
      id: `tx_${Date.now()}`,
      userId: newId,
      type: 'deposit',
      amount: 100000,
      status: 'successful',
      title: 'هدیه خوش‌آمدگویی',
      description: 'شارژ اولیه حساب کاربری دبرنا لند',
      date: 'هم‌اکنون',
      trackingCode: 'GIFT-100K',
    });
  }

  // Clear OTP
  otpStore.delete(phone);

  const token = `jwt_mock_${user.id}_${Date.now()}`;

  return res.json({
    success: true,
    token,
    user,
  });
});

// 3. Current User Me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ user: null });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token === 'undefined' || token === 'null') {
    return res.json({ user: null });
  }
  let foundUser = users.get(token);
  if (!foundUser) {
    for (const [id, u] of users.entries()) {
      if (token.includes(id)) {
        foundUser = u;
        break;
      }
    }
  }
  return res.json({ user: foundUser || null });
});

// 4. Update Profile
app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const { userId, name, username, avatar } = req.body;
  const user = users.get(userId || seedUserId);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });

  if (name) user.name = name;
  if (username) user.username = username;
  if (avatar) user.avatar = avatar;

  return res.json({ success: true, user });
});

// 5. Wallet Transactions
app.get('/api/wallet/transactions', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || seedUserId;
  const userTxs = transactions.filter((t) => t.userId === userId || t.userId === seedUserId);
  return res.json({ transactions: userTxs });
});

// 6. Deposit Simulation
app.post('/api/wallet/deposit', (req: Request, res: Response) => {
  const { userId, amount, gateway } = req.body;
  if (!amount || amount < 10000) {
    return res.status(400).json({ error: 'حداقل مبلغ شارژ ۱۰،۰۰۰ تومان می‌باشد' });
  }

  const trackingCode = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  return res.json({
    success: true,
    paymentUrl: `/gateway-checkout?tracking=${trackingCode}&amount=${amount}&gateway=${gateway || 'zibal'}`,
    trackingCode,
    amount,
  });
});

// 7. Verify Deposit (Callback)
app.post('/api/wallet/deposit/verify', (req: Request, res: Response) => {
  const { userId, amount, trackingCode, status } = req.body;
  const user = users.get(userId || seedUserId);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });

  if (status === 'successful') {
    user.balance += Number(amount);
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amount: Number(amount),
      status: 'successful',
      title: 'شارژ موفق کیف پول',
      description: 'درگاه آنلاین بانکی شتاب',
      date: 'هم‌اکنون',
      trackingCode: trackingCode || `ZBL-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    transactions.unshift(tx);

    return res.json({ success: true, balance: user.balance, transaction: tx });
  } else {
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amount: Number(amount),
      status: 'failed',
      title: 'تراکنش ناموفق',
      description: 'انصراف کاربر یا خطای بانکی',
      date: 'هم‌اکنون',
      trackingCode: trackingCode || 'ERR-001',
    };
    transactions.unshift(tx);

    return res.json({ success: false, error: 'پرداخت لغو شد یا با خطا مواجه گردید' });
  }
});

// 8. Withdraw Request
app.post('/api/wallet/withdraw', (req: Request, res: Response) => {
  const { userId, amount, sheba, cardHolder } = req.body;
  const user = users.get(userId || seedUserId);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });

  const numAmount = Number(amount);
  if (numAmount < 50000) {
    return res.status(400).json({ error: 'حداقل مبلغ برداشت ۵۰،۰۰۰ تومان است' });
  }
  if (user.balance < numAmount) {
    return res.status(400).json({ error: 'موجودی کیف پول شما کافی نمی‌باشد' });
  }
  if (!sheba || sheba.length < 24) {
    return res.status(400).json({ error: 'شماره شبا نامعتبر است (۲۴ رقم بدون IR)' });
  }

  user.balance -= numAmount;
  const tx: Transaction = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    type: 'withdraw',
    amount: numAmount,
    status: 'pending',
    title: 'درخواست برداشت وجه (پایا)',
    description: `به نام ${cardHolder || user.name} - شبا: IR${sheba}`,
    date: 'هم‌اکنون',
    trackingCode: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
    sheba: `IR${sheba}`,
  };
  transactions.unshift(tx);

  return res.json({
    success: true,
    message: 'درخواست برداشت با موفقیت ثبت شد و در چرخه پایا واریز خواهد شد',
    balance: user.balance,
    transaction: tx,
  });
});

// 9. Wheel Spin
app.post('/api/wheel/spin', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = users.get(userId || seedUserId);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });

  if (user.spinsLeft <= 0 && user.balance < 10000) {
    return res.status(400).json({ error: 'شما شانس رایگان ندارید و موجودی کافی برای خرید شانس (۱۰،۰۰۰ تومان) موجود نیست' });
  }

  let costDeducted = 0;
  if (user.spinsLeft > 0) {
    user.spinsLeft--;
  } else {
    user.balance -= 10000;
    costDeducted = 10000;
  }

  // Wheel sectors:
  // 0: 10,000 T (Cash)
  // 1: پوچ (Empty)
  // 2: 25,000 T (Cash)
  // 3: 1 Free Spin
  // 4: 50,000 T (Cash)
  // 5: پوچ (Empty)
  // 6: 100,000 T (Grand Prize)
  // 7: 2 Free Spins

  const prizePool = [
    { index: 0, type: 'cash', value: 10000, label: '۱۰،۰۰۰ تومان' },
    { index: 1, type: 'empty', value: 0, label: 'پوچ' },
    { index: 2, type: 'cash', value: 25000, label: '۲۵،۰۰۰ تومان' },
    { index: 3, type: 'spin', value: 1, label: '۱ شانس مجدد' },
    { index: 4, type: 'cash', value: 50000, label: '۵۰،۰۰۰ تومان' },
    { index: 5, type: 'empty', value: 0, label: 'پوچ' },
    { index: 6, type: 'cash', value: 100000, label: '۱۰۰،۰۰۰ تومان' },
    { index: 7, type: 'spin', value: 2, label: '۲ شانس مجدد' },
  ];

  // Weighted random pick
  const weights = [25, 20, 20, 15, 10, 5, 2, 3];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;

  let selectedPrize = prizePool[0];
  for (let i = 0; i < prizePool.length; i++) {
    if (randomVal < weights[i]) {
      selectedPrize = prizePool[i];
      break;
    }
    randomVal -= weights[i];
  }

  // Apply prize
  if (selectedPrize.type === 'cash') {
    user.balance += selectedPrize.value;
    transactions.unshift({
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'wheel_prize',
      amount: selectedPrize.value,
      status: 'successful',
      title: 'جایزه گردونه شانس',
      description: `برد ${selectedPrize.label}`,
      date: 'هم‌اکنون',
      trackingCode: `WHL-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  } else if (selectedPrize.type === 'spin') {
    user.spinsLeft += selectedPrize.value;
  }

  return res.json({
    success: true,
    prize: selectedPrize,
    user: {
      balance: user.balance,
      spinsLeft: user.spinsLeft,
    },
  });
});

// 10. List Rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  return res.json({ rooms: Array.from(rooms.values()) });
});

// ==========================================
// SOCKET.IO REAL-TIME LOGIC
// ==========================================

io.on('connection', (socket: Socket) => {
  // Join lobby
  socket.on('join:lobby', () => {
    socket.join('lobby');
    socket.emit('lobby:rooms_update', Array.from(rooms.values()));
  });

  // Join game room
  socket.on('join:room', ({ roomId, userId, userName, userAvatar }: { roomId: string; userId: string; userName: string; userAvatar?: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.join(roomId);

    // Track connected player
    const existingIdx = room.connectedPlayers.findIndex((p) => p.id === userId);
    if (existingIdx === -1) {
      room.connectedPlayers.push({
        id: userId,
        name: userName || 'بازیکن',
        avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      });
    }

    // Send room snapshot
    socket.emit('room:state', room);
    io.to(roomId).emit('room:players_update', room.connectedPlayers);
    io.emit('lobby:rooms_update', Array.from(rooms.values()));
  });

  // Leave room
  socket.on('leave:room', ({ roomId, userId }: { roomId: string; userId: string }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.connectedPlayers = room.connectedPlayers.filter((p) => p.id !== userId);
      socket.leave(roomId);
      io.to(roomId).emit('room:players_update', room.connectedPlayers);
      io.emit('lobby:rooms_update', Array.from(rooms.values()));
    }
  });

  // Buy Ticket
  socket.on('buy:ticket', ({ roomId, userId, count }: { roomId: string; userId: string; count?: number }) => {
    const room = rooms.get(roomId);
    const user = users.get(userId || seedUserId);
    if (!room || !user) return;

    const ticketsToBuy = count || 1;
    const totalCost = room.cardPrice * ticketsToBuy;

    if (user.balance < totalCost) {
      socket.emit('error:message', { message: 'موجودی کیف پول شما برای خرید کارت کافی نیست.' });
      return;
    }

    // Deduct cost
    user.balance -= totalCost;
    user.stats.gamesPlayed += ticketsToBuy;

    const newTickets: Ticket[] = [];
    for (let i = 0; i < ticketsToBuy; i++) {
      const matrix = generateTombolaTicket();
      const ticket: Ticket = {
        id: `tkt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: user.id,
        userName: user.name,
        roomId,
        matrix,
        marked: [
          [false, false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false, false],
        ],
      };
      room.tickets.push(ticket);
      newTickets.push(ticket);
    }

    // Record transaction
    transactions.unshift({
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'card_purchase',
      amount: totalCost,
      status: 'successful',
      title: `خرید ${ticketsToBuy} کارت دبرنا`,
      description: `اتاق ${room.name}`,
      date: 'هم‌اکنون',
      trackingCode: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Update participants list
    const pIndex = room.participants.findIndex((p) => p.id === user.id);
    if (pIndex !== -1) {
      room.participants[pIndex].cardsCount += ticketsToBuy;
    } else {
      room.participants.unshift({
        id: user.id,
        name: user.name,
        avatar: user.name.slice(0, 1),
        cardsCount: ticketsToBuy,
      });
    }

    // Notify user with their new tickets and updated balance
    socket.emit('ticket:bought', { tickets: newTickets, balance: user.balance });

    // Check if 30 cards capacity reached
    const totalCardsSold = room.participants.reduce((sum, p) => sum + p.cardsCount, 0);
    if (totalCardsSold >= room.maxCards) {
      startGameForRoom(roomId);
    } else {
      io.to(roomId).emit('room:state', room);
      io.emit('lobby:rooms_update', Array.from(rooms.values()));
    }
  });

  // Fast start room trigger
  socket.on('start:game_now', ({ roomId }: { roomId: string }) => {
    startGameForRoom(roomId);
  });

  // In-room chat
  socket.on('chat:message', ({ roomId, userId, userName, text }: { roomId: string; userId: string; userName: string; text: string }) => {
    io.to(roomId).emit('chat:broadcast', {
      id: `msg_${Date.now()}`,
      userId,
      userName,
      text,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    });
  });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC PROD SERVING
// ==========================================

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Deberna Land] Server & Socket.io running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
