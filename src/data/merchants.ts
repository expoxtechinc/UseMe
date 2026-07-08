/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Merchant } from '../types';

export const SIMULATED_MERCHANTS: Merchant[] = [
  {
    id: 'netflix',
    name: 'Netflix Subscription',
    category: 'subscription',
    price: 15.49,
    description: 'Monthly streaming service renewal - Premium 4K Plan.',
    iconName: 'Tv',
  },
  {
    id: 'amazon',
    name: 'Amazon Prime Cart',
    category: 'shopping',
    price: 84.99,
    description: 'Checkout for modern gadgets and high-end accessories.',
    iconName: 'ShoppingBag',
  },
  {
    id: 'steam',
    name: 'Steam Deluxe Game Key',
    category: 'gaming',
    price: 59.99,
    description: 'Direct download key for a premium open-world gaming experience.',
    iconName: 'Gamepad2',
  },
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT Plus',
    category: 'subscription',
    price: 20.00,
    description: 'Monthly subscription for advanced intelligence, reasoning, and agents.',
    iconName: 'Sparkles',
  },
  {
    id: 'ubereats',
    name: 'Uber Eats Dinner Order',
    category: 'food',
    price: 34.50,
    description: 'Gourmet meal delivery including delivery fee and service charge.',
    iconName: 'Utensils',
  },
  {
    id: 'airbnb',
    name: 'Airbnb Weekend Booking',
    category: 'travel',
    price: 145.00,
    description: 'One-night security deposit fee for a cozy lakeside cabin getaway.',
    iconName: 'Plane',
  },
  {
    id: 'spotify',
    name: 'Spotify Premium Duo',
    category: 'subscription',
    price: 14.99,
    description: 'Ad-free high-fidelity music streaming for two active accounts.',
    iconName: 'Music',
  },
  {
    id: 'apple',
    name: 'App Store Pro Tools',
    category: 'shopping',
    price: 4.99,
    description: 'Visual vector design app for compiling high-end sketches.',
    iconName: 'Smartphone',
  },
];
