/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardTier = 'classic' | 'gold' | 'platinum' | 'infinite';

export type CardStyle = 'cosmic' | 'emerald' | 'sunset' | 'royal' | 'neon-cyan';

export interface VirtualCard {
  id: string;
  cardNumber: string; // 16-digit string
  cardholderName: string;
  expiry: string; // MM/YY
  cvv: string; // 3 digits
  tier: CardTier;
  style: CardStyle;
  balance: number;
  startingBalance: number;
  cardType: 'debit' | 'credit';
  createdAt: string;
  isPaused: boolean;
}

export interface Transaction {
  id: string;
  cardId: string;
  cardholderName: string;
  cardNumber: string; // masked
  merchantName: string;
  amount: number;
  timestamp: string;
  status: 'success' | 'failed';
  reason?: string;
  category: 'subscription' | 'shopping' | 'gaming' | 'travel' | 'food';
}

export interface Merchant {
  id: string;
  name: string;
  category: 'subscription' | 'shopping' | 'gaming' | 'travel' | 'food';
  price: number;
  description: string;
  iconName: string;
}
