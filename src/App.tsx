/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { DepositModal } from './components/DepositModal';
import { GatewayCheckoutModal } from './components/GatewayCheckoutModal';
import { DashboardView } from './views/DashboardView';
import { LobbyView } from './views/LobbyView';
import { GameRoomView } from './views/GameRoomView';
import { LuckyWheelView } from './views/LuckyWheelView';
import { WalletView } from './views/WalletView';
import { RulesView } from './views/RulesView';
import { ProfileView } from './views/ProfileView';
import { socket } from './services/socket';
import { fetchMe, fetchRooms } from './services/api';
import { User, GameRoom, TabType, Transaction } from './types';
import { SoundEngine } from './utils/audio';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isInLobby, setIsInLobby] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isMuted, setIsMuted] = useState(SoundEngine.getMuted());

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{ trackingCode: string; amount: number; gateway: string } | null>(null);

  // Initialize user & initial rooms
  useEffect(() => {
    const savedToken = localStorage.getItem('deberna_token');
    if (savedToken) setToken(savedToken);

    fetchMe(savedToken || undefined)
      .then((res) => {
        if (res.user) setUser(res.user);
      })
      .catch((e) => console.log('Initial user load:', e));

    fetchRooms()
      .then((res) => {
        if (res.rooms) setRooms(res.rooms);
      })
      .catch((e) => console.log('Initial rooms load:', e));
  }, []);

  // Setup Socket listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit('join:lobby');
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoomsUpdate(updatedRooms: GameRoom[]) {
      setRooms(updatedRooms);
    }

    function onRoomState(room: GameRoom) {
      setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
    }

    function onCountdown({ roomId, countdown }: { roomId: string; countdown: number }) {
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, countdown } : r))
      );
    }

    function onNumberDrawn({ roomId, number, drawnNumbers, winners }: { roomId: string; number: number; drawnNumbers: number[]; winners: any }) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, currentDrawnNumber: number, drawnNumbers, winners, status: 'playing' }
            : r
        )
      );
    }

    function onGameEnded({ roomId, winners }: { roomId: string; winners: any }) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, status: 'ended', winners }
            : r
        )
      );
    }

    function onTicketBought({ balance }: { tickets: any[]; balance: number }) {
      setUser((prev) => (prev ? { ...prev, balance } : null));
    }

    function onBalanceUpdated({ userId, balance, stats }: { userId: string; balance: number; stats: any }) {
      setUser((prev) => {
        if (!prev || prev.id !== userId) return prev;
        return { ...prev, balance, stats };
      });
    }

    function onErrorMsg({ message }: { message: string }) {
      alert(message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('lobby:rooms_update', onRoomsUpdate);
    socket.on('room:state', onRoomState);
    socket.on('room:countdown', onCountdown);
    socket.on('room:number_drawn', onNumberDrawn);
    socket.on('room:game_ended', onGameEnded);
    socket.on('ticket:bought', onTicketBought);
    socket.on('user:balance_updated', onBalanceUpdated);
    socket.on('error:message', onErrorMsg);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('lobby:rooms_update', onRoomsUpdate);
      socket.off('room:state', onRoomState);
      socket.off('room:countdown', onCountdown);
      socket.off('room:number_drawn', onNumberDrawn);
      socket.off('room:game_ended', onGameEnded);
      socket.off('ticket:bought', onTicketBought);
      socket.off('user:balance_updated', onBalanceUpdated);
      socket.off('error:message', onErrorMsg);
    };
  }, []);

  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    socket.emit('join:room', {
      roomId,
      userId: user?.id || 'guest',
      userName: user?.name || 'مهمان',
      userAvatar: user?.avatar,
    });
  };

  const handleLeaveRoom = () => {
    if (activeRoomId) {
      socket.emit('leave:room', {
        roomId: activeRoomId,
        userId: user?.id || 'guest',
      });
      setActiveRoomId(null);
    }
  };

  const handleBuyTickets = (count: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!activeRoomId) return;
    socket.emit('buy:ticket', {
      roomId: activeRoomId,
      userId: user.id,
      count,
    });
  };

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    SoundEngine.setMuted(nextState);
  };

  const handleAuthSuccess = (authedUser: User, authedToken: string) => {
    setUser(authedUser);
    setToken(authedToken);
    localStorage.setItem('deberna_token', authedToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('deberna_token');
    setUser(null);
    setToken(null);
    setActiveTab('home');
    setIsInLobby(false);
    setActiveRoomId(null);
  };

  const handleUpdateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleProceedToCheckout = (trackingCode: string, amount: number, gateway: string) => {
    setCheckoutData({ trackingCode, amount, gateway });
  };

  const handleCheckoutSuccess = (newBalance: number, tx: Transaction) => {
    setUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
    setCheckoutData(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsInLobby(false);
    setActiveRoomId(null);
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  return (
    <div className="min-h-screen bg-[#030406] text-slate-100 flex flex-col font-['Vazirmatn',sans-serif]">
      {/* Header matching Tombola+ Top Bar */}
      <Header
        user={user}
        isConnected={isConnected}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenDeposit={() => (user ? setIsDepositOpen(true) : setIsAuthOpen(true))}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateTab={(tab) => handleTabChange(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-3 pb-8">
        {/* Priority 1: Inside a live game room table */}
        {activeRoomId && activeRoom ? (
          <GameRoomView
            room={activeRoom}
            user={user}
            onLeaveRoom={handleLeaveRoom}
            onBuyTickets={handleBuyTickets}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : isInLobby ? (
          /* Priority 2: Inside Lobby View (image_5f4c20e9.png) */
          <LobbyView
            rooms={rooms}
            onSelectRoom={handleJoinRoom}
            onBack={() => setIsInLobby(false)}
          />
        ) : (
          /* Priority 3: Bottom Navigation Tabs */
          <>
            {activeTab === 'home' && (
              <DashboardView
                user={user}
                rooms={rooms}
                onOpenDeposit={() => (user ? setIsDepositOpen(true) : setIsAuthOpen(true))}
                onGoToLobby={() => setIsInLobby(true)}
                onNavigateTab={(tab) => handleTabChange(tab)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onSelectRoom={handleJoinRoom}
              />
            )}

            {activeTab === 'wheel' && (
              <LuckyWheelView
                user={user}
                onUpdateUser={handleUpdateUser}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBack={() => handleTabChange('home')}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView
                user={user}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onUpdateUser={handleUpdateUser}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBack={() => handleTabChange('home')}
              />
            )}

            {activeTab === 'rules' && (
              <RulesView onBack={() => handleTabChange('home')} />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onLogout={handleLogout}
                onOpenAuth={() => setIsAuthOpen(true)}
                onUpdateUser={handleUpdateUser}
                onBack={() => handleTabChange('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Hidden when inside live game room for full focus) */}
      {!activeRoomId && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          spinsCount={user?.spinsLeft || 0}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {user && (
        <DepositModal
          isOpen={isDepositOpen}
          userId={user.id}
          onClose={() => setIsDepositOpen(false)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {user && checkoutData && (
        <GatewayCheckoutModal
          isOpen={!!checkoutData}
          trackingCode={checkoutData.trackingCode}
          amount={checkoutData.amount}
          userId={user.id}
          gateway={checkoutData.gateway}
          onSuccess={handleCheckoutSuccess}
          onCancel={() => setCheckoutData(null)}
        />
      )}
    </div>
  );
}
