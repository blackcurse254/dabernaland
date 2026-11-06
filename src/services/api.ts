/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Transaction, GameRoom } from '../types';

const API_BASE = '/api';

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; previewCode?: string; provider?: string }> {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در ارسال کد تایید');
  return data;
}

export async function verifyOtp(phone: string, code: string): Promise<{ success: boolean; token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'کد تایید نادرست است');
  return data;
}

export async function fetchMe(token?: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در دریافت اطلاعات کاربر');
  return data;
}

export async function updateProfile(payload: { userId?: string; name?: string; username?: string; avatar?: string }): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${API_BASE}/auth/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در ویرایش پروفایل');
  return data;
}

export async function fetchTransactions(userId?: string): Promise<{ transactions: Transaction[] }> {
  const res = await fetch(`${API_BASE}/wallet/transactions?userId=${userId || ''}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در دریافت تراکنش‌ها');
  return data;
}

export async function requestDeposit(payload: { userId: string; amount: number; gateway: string }): Promise<{ success: boolean; paymentUrl: string; trackingCode: string; amount: number }> {
  const res = await fetch(`${API_BASE}/wallet/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در ثبت درخواست شارژ');
  return data;
}

export async function verifyDeposit(payload: { userId: string; amount: number; trackingCode: string; status: 'successful' | 'failed' }): Promise<{ success: boolean; balance?: number; transaction?: Transaction; error?: string }> {
  const res = await fetch(`${API_BASE}/wallet/deposit/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در تایید تراکنش');
  return data;
}

export async function requestWithdraw(payload: { userId: string; amount: number; sheba: string; cardHolder: string }): Promise<{ success: boolean; message: string; balance: number; transaction: Transaction }> {
  const res = await fetch(`${API_BASE}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در ثبت درخواست برداشت');
  return data;
}

export async function spinWheel(userId: string): Promise<{ success: boolean; prize: { index: number; type: string; value: number; label: string }; user: { balance: number; spinsLeft: number } }> {
  const res = await fetch(`${API_BASE}/wheel/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در چرخاندن گردونه');
  return data;
}

export async function fetchRooms(): Promise<{ rooms: GameRoom[] }> {
  const res = await fetch(`${API_BASE}/rooms`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطا در دریافت لیست اتاق‌ها');
  return data;
}
