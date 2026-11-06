/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  phone: string;
  name: string;
  username: string;
  avatar: string;
  balance: number;
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

export type TicketMatrix = number[][]; // 3 rows x 9 cols

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  matrix: TicketMatrix;
  marked: boolean[][];
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
  line1Prize: number; // جایزه دبرنا خطی
  line2Prize: number;
  tombolaPrize: number; // جایزه دبرنا پر
  status: 'waiting' | 'playing' | 'ended';
  countdown: number; // Countdown in seconds (e.g. 172 for 02:52)
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

export type TabType = 'home' | 'wheel' | 'wallet' | 'rules' | 'profile';
