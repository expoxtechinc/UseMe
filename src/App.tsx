/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Sparkles, Plus, Trash2, Copy, Check, Pause, Play,
  History, Wallet, DollarSign, HelpCircle, ArrowRightLeft, Landmark, Info
} from 'lucide-react';
import { CardTier, CardStyle, VirtualCard, Transaction } from './types';
import { generateVisaNumber, generateExpiry, generateCVV } from './utils/cardGenerator';
import { VirtualCardItem } from './components/VirtualCardItem';
import { CheckoutSandbox } from './components/CheckoutSandbox';

// Pre-fill name from metadata or defaults
const DEFAULT_CARDHOLDER_NAME = 'SANDBOX USER';

export default function App() {
  // --- Persistent State ---
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // --- Card Form Config State ---
  const [formName, setFormName] = useState(DEFAULT_CARDHOLDER_NAME);
  const [formTier, setFormTier] = useState<CardTier>('infinite');
  const [formStyle, setFormStyle] = useState<CardStyle>('cosmic');
  const [formType, setFormType] = useState<'debit' | 'credit'>('debit');
  const [formStartingBalance, setFormStartingBalance] = useState<number>(500);

  // --- Copy indicators ---
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // --- Load and Save persistent storage ---
  useEffect(() => {
    try {
      const savedCards = localStorage.getItem('useme_cards');
      const savedTxs = localStorage.getItem('useme_txs');
      
      if (savedCards) {
        const parsed = JSON.parse(savedCards) as VirtualCard[];
        setCards(parsed);
        if (parsed.length > 0) {
          setSelectedCardId(parsed[0].id);
        }
      } else {
        // Create an initial default card so the app is populated beautifully on first launch!
        const initialCard: VirtualCard = {
          id: 'card-default',
          cardNumber: generateVisaNumber('infinite'),
          cardholderName: DEFAULT_CARDHOLDER_NAME,
          expiry: generateExpiry().formatted,
          cvv: generateCVV(),
          tier: 'infinite',
          style: 'cosmic',
          balance: 750.00,
          startingBalance: 750.00,
          cardType: 'debit',
          createdAt: new Date().toLocaleDateString(),
          isPaused: false,
        };
        setCards([initialCard]);
        setSelectedCardId(initialCard.id);
        localStorage.setItem('useme_cards', JSON.stringify([initialCard]));
      }

      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      }
    } catch (e) {
      console.error('Failed to load local UseMe storage: ', e);
    }
  }, []);

  const saveCardsToStorage = (updatedCards: VirtualCard[]) => {
    setCards(updatedCards);
    localStorage.setItem('useme_cards', JSON.stringify(updatedCards));
  };

  const saveTxsToStorage = (updatedTxs: Transaction[]) => {
    setTransactions(updatedTxs);
    localStorage.setItem('useme_txs', JSON.stringify(updatedTxs));
  };

  // --- Actions ---

  // Handle new card generation
  const handleGenerateCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedName = formName.trim().toUpperCase() || 'SANDBOX USER';
    const cardNum = generateVisaNumber(formTier);
    const { formatted: expiryFormatted } = generateExpiry();
    const securityCode = generateCVV();

    const newCard: VirtualCard = {
      id: `card-${Math.random().toString(36).substring(2, 11)}`,
      cardNumber: cardNum,
      cardholderName: formattedName,
      expiry: expiryFormatted,
      cvv: securityCode,
      tier: formTier,
      style: formStyle,
      balance: formStartingBalance,
      startingBalance: formStartingBalance,
      cardType: formType,
      createdAt: new Date().toLocaleDateString(),
      isPaused: false,
    };

    const updated = [newCard, ...cards];
    saveCardsToStorage(updated);
    setSelectedCardId(newCard.id);

    // Trigger visual notification of card creation
    triggerCopyNotification('generate');
  };

  // Toggle card active/paused state
  const handleTogglePause = (id: string) => {
    const updated = cards.map(c => {
      if (c.id === id) {
        return { ...c, isPaused: !c.isPaused };
      }
      return c;
    });
    saveCardsToStorage(updated);
  };

  // Delete virtual card
  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to terminate this virtual Visa card? Any remaining virtual balance will be cleared.')) {
      const updated = cards.filter(c => c.id !== id);
      saveCardsToStorage(updated);
      
      if (selectedCardId === id) {
        setSelectedCardId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Simulated balance loading / "Adding free sandbox money"
  const handleAddFunds = (id: string) => {
    const updated = cards.map(c => {
      if (c.id === id) {
        return { ...c, balance: Number((c.balance + 100).toFixed(2)) };
      }
      return c;
    });
    saveCardsToStorage(updated);
    triggerCopyNotification('funds');
  };

  // Clipboard copy handler
  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Custom trigger messages
  const triggerCopyNotification = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle transactions processed inside CheckoutSandbox
  const handleTransactionComplete = (newTx: Transaction, updatedCard: VirtualCard) => {
    // Add transaction
    const updatedTxs = [newTx, ...transactions];
    saveTxsToStorage(updatedTxs);

    // Update the relevant card's balance
    const updatedCards = cards.map(c => (c.id === updatedCard.id ? updatedCard : c));
    saveCardsToStorage(updatedCards);
  };

  // Clear simulated transaction logs
  const handleClearTransactions = () => {
    if (confirm('Are you sure you want to purge all simulated sandbox transaction records?')) {
      saveTxsToStorage([]);
    }
  };

  // Find active selected card object
  const selectedCard = cards.find(c => c.id === selectedCardId) || null;

  return (
    <div className="min-h-screen pb-16 bg-[#080b11] text-gray-100 font-sans antialiased selection:bg-indigo-500 selection:text-white" id="useme-root">
      
      {/* Dynamic Notification Bubble */}
      <AnimatePresence>
        {copiedField && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-indigo-600/90 backdrop-blur-md border border-indigo-400/40 px-6 py-3 rounded-full text-xs font-semibold font-mono tracking-wider text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] z-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            {copiedField === 'generate' && 'VIRTUAL VISA GENERATED SUCCESSFULLY! 🎉'}
            {copiedField === 'funds' && 'SIMULATED +$100 FUNDS INSTANTLY ADDED! 💸'}
            {copiedField === 'number' && 'VISA 16-DIGIT NUMBER COPIED TO CLIPBOARD! 📋'}
            {copiedField === 'expiry' && 'CARD EXPIRY DATE COPIED! 📋'}
            {copiedField === 'cvv' && 'CVV SECURITY PIN COPIED! 📋'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative top ambient neon glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none select-none" />

      {/* Primary Header */}
      <header className="max-w-7xl mx-auto px-4 pt-8 pb-4" id="useme-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
                UseMe
                <span className="text-[10px] tracking-widest font-mono uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Visa Sandbox
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Generate virtual mock Visa cards and test transactions in a safe simulated checkout network.
              </p>
            </div>
          </div>

          {/* Quick Stats Block */}
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">My Active Cards</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{cards.length} Generated</p>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Mock Cash Balance</p>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                ${cards.reduce((sum, c) => sum + c.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* LEFT COLUMN: Designer & Config (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="left-workspace-column">
          
          {/* Card Generator Form */}
          <section className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col gap-5">
            <div>
              <h2 className="text-md font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                Visa Card Customizer
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Customize structural card parameters. Instantly generates valid Luhn check digit properties.
              </p>
            </div>

            <form onSubmit={handleGenerateCard} className="flex flex-col gap-4">
              
              {/* Cardholder Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  maxLength={22}
                  required
                  placeholder="e.g. Jane Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 transition"
                />
              </div>

              {/* Grid: Tier & Type */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card Tier Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Visa Premium Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as CardTier)}
                    className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white transition font-mono"
                  >
                    <option value="classic">Visa Classic</option>
                    <option value="gold">Visa Gold</option>
                    <option value="platinum">Visa Platinum</option>
                    <option value="infinite">Visa Infinite</option>
                  </select>
                </div>

                {/* Account Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Routing Type
                  </label>
                  <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormType('debit')}
                      className={`py-1 text-[10px] font-bold uppercase rounded-lg transition ${
                        formType === 'debit' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('credit')}
                      className={`py-1 text-[10px] font-bold uppercase rounded-lg transition ${
                        formType === 'credit' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Credit
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Style Gradient Preset & Initial Simulated Balance */}
              <div className="grid grid-cols-2 gap-4">
                {/* Aesthetic Theme Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Aesthetic Skin
                  </label>
                  <select
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value as CardStyle)}
                    className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white transition font-mono"
                  >
                    <option value="cosmic">Cosmic Nebula</option>
                    <option value="emerald">Emerald Luxury</option>
                    <option value="sunset">Sunset Radiance</option>
                    <option value="royal">Royal Indigo</option>
                    <option value="neon-cyan">Neon Matrix</option>
                  </select>
                </div>

                {/* Starting balance slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      Mock Balance
                    </label>
                    <span className="text-[11px] font-mono font-bold text-indigo-400">${formStartingBalance}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={formStartingBalance}
                    onChange={(e) => setFormStartingBalance(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-xl text-xs mt-2 transition shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Generate Free Virtual Visa Card
              </button>
            </form>
          </section>

          {/* Quick Informational Notice */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex gap-3 items-start text-xs text-gray-400">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-300">How do I use this card online?</p>
              <p className="mt-1 leading-relaxed text-[11px]">
                Copy the generated card credentials. Choose a simulated merchant in the <strong>Online Checkout Simulator</strong> on the right, fill the form, and run the simulator. You will see a real-time gateway trace.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visualizer, Registry, and Merchant Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8" id="right-workspace-column">
          
          {/* Visual Display Screen */}
          <section className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center relative min-h-[360px]">
            {selectedCard ? (
              <div className="w-full flex flex-col gap-8">
                {/* Flip Instructions Overlay */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">UseMe Virtual Visa® Vault</span>
                  <span className="text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded-md font-mono">
                    STATUS: ACTIVE
                  </span>
                </div>

                {/* 3D Visual Card Item */}
                <VirtualCardItem card={selectedCard} />

                {/* Card Quick-Copy Panel */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
                  <button
                    onClick={() => handleCopyToClipboard(selectedCard.cardNumber, 'number')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 text-gray-300 hover:text-white transition gap-1 group cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 transition" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Copy Number</span>
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(selectedCard.expiry, 'expiry')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 text-gray-300 hover:text-white transition gap-1 group cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 transition" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Copy Expiry</span>
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(selectedCard.cvv, 'cvv')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 text-gray-300 hover:text-white transition gap-1 group cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 transition" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Copy CVV</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <CreditCard className="w-12 h-12 text-slate-700 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-gray-300">No Virtual Cards Registered</p>
                  <p className="text-xs text-gray-500 mt-1">Please use the customizer on the left to generate your first Visa.</p>
                </div>
              </div>
            )}
          </section>

          {/* Saved Wallet Registry */}
          <section className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  My Sandbox Wallet Registry
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select, freeze, delete, or load virtual funds on your cards.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                {cards.length} Total
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar bg-slate-950/20 border border-slate-900 rounded-xl p-2">
              {cards.map((c) => {
                const isSelected = selectedCardId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border text-left cursor-pointer transition-all gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/5 border-indigo-500/40 text-white shadow-sm'
                        : 'border-slate-800/80 hover:bg-slate-900/40 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mini Card Aesthetic preview */}
                      <div className={`w-10 h-6.5 rounded-md bg-gradient-to-br flex items-center justify-center font-mono text-[8px] font-bold text-white shrink-0 shadow border ${
                        c.style === 'cosmic' ? 'from-slate-950 to-purple-950 border-purple-500/20' :
                        c.style === 'emerald' ? 'from-emerald-950 to-slate-950 border-emerald-500/20' :
                        c.style === 'sunset' ? 'from-stone-950 to-rose-950 border-orange-500/20' :
                        c.style === 'royal' ? 'from-blue-950 to-indigo-950 border-blue-500/20' :
                        'from-cyan-950 to-zinc-950 border-cyan-500/20'
                      }`}>
                        VISA
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {c.cardholderName}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 mt-0.5 truncate">
                          {c.cardType.toUpperCase()} •••• {c.cardNumber.slice(-4)} • Exp: {c.expiry}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {/* Live virtual balance */}
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${c.balance.toFixed(2)}
                      </span>

                      {/* Controls Area */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Pause button */}
                        <button
                          onClick={() => handleTogglePause(c.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            c.isPaused
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-gray-200'
                          }`}
                          title={c.isPaused ? 'Activate Card' : 'Freeze Card'}
                        >
                          {c.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>

                        {/* Top-Up Simulated Cash balance */}
                        <button
                          onClick={() => handleAddFunds(c.id)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 transition"
                          title="Add $100 Sandbox cash"
                        >
                          <span className="text-[10px] font-bold font-mono px-0.5">+$100</span>
                        </button>

                        {/* Terminate card */}
                        <button
                          onClick={() => handleDeleteCard(c.id)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-500 hover:text-rose-400 transition"
                          title="Terminate Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </main>

      {/* FULL WIDTH MERCHANT CHECKOUT SIMULATOR GATEWAY */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <CheckoutSandbox
          activeCards={cards}
          selectedCard={selectedCard}
          onTransactionComplete={handleTransactionComplete}
        />
      </section>

      {/* BOTTOM AREA: HISTORICAL TRANSACTION AUDIT LEDGER */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-4 gap-3">
            <div>
              <h3 className="text-md font-bold text-white font-display flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Simulated Sandbox Transaction History
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Audit ledger of virtual authorization logs cleared on the simulated Visa terminal.
              </p>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={handleClearTransactions}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-950 bg-rose-950/10 hover:bg-rose-950/20 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                Clear Transaction Logs
              </button>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-left text-xs font-mono text-gray-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Merchant Name</th>
                    <th className="py-3 px-4">Cardholder</th>
                    <th className="py-3 px-4">Card Number</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/20 text-gray-300">
                      <td className="py-3.5 px-4 font-bold text-indigo-400 text-[11px]">{tx.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{tx.merchantName}</td>
                      <td className="py-3.5 px-4 font-display">{tx.cardholderName}</td>
                      <td className="py-3.5 px-4 text-gray-400">{tx.cardNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-slate-900 text-gray-500 border border-slate-800">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">{tx.timestamp}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        -${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <ArrowRightLeft className="w-8 h-8 text-slate-700" />
                <div>
                  <p className="text-xs font-semibold text-gray-400">No Transaction Records Yet</p>
                  <p className="text-[11px] text-gray-600 mt-1">Submit simulated purchases using your cards in the checkout module above.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
