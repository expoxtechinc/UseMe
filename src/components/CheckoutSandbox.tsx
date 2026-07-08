/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ShieldCheck, CreditCard, Sparkles, Terminal, AlertCircle, CheckCircle2, ArrowRight, Loader2, Landmark, RefreshCw } from 'lucide-react';
import { VirtualCard, Merchant, Transaction } from '../types';
import { SIMULATED_MERCHANTS } from '../data/merchants';
import { validateLuhn, formatCardNumber } from '../utils/cardGenerator';

interface CheckoutSandboxProps {
  activeCards: VirtualCard[];
  onTransactionComplete: (transaction: Transaction, updatedCard: VirtualCard) => void;
  selectedCard: VirtualCard | null;
}

export function CheckoutSandbox({ activeCards, onTransactionComplete, selectedCard }: CheckoutSandboxProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant>(SIMULATED_MERCHANTS[0]);
  
  // Checkout form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Processing simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  // Sync with selected card if user clicks "Autofill" or when selected card changes
  const handleAutofill = () => {
    if (selectedCard) {
      setCardNumber(formatCardNumber(selectedCard.cardNumber));
      setCardholderName(selectedCard.cardholderName);
      setExpiry(selectedCard.expiry);
      setCvv(selectedCard.cvv);
    }
  };

  // Auto-fill on mount or when selectedCard changes
  useEffect(() => {
    if (selectedCard) {
      handleAutofill();
    }
  }, [selectedCard]);

  // Handle formatted card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= 16) {
      setCardNumber(formatCardNumber(rawVal));
    }
  };

  // Handle expiry date input (MM/YY format)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 4) raw = raw.slice(0, 4);
    
    if (raw.length > 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Handle CVV input (3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 3) {
      setCvv(raw);
    }
  };

  // Run mock processing flow
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    // Reset simulator states
    setIsProcessing(true);
    setProcessingStep(0);
    setCheckoutStatus('idle');
    setErrorMessage('');
    setReceipt(null);
    setProcessingLogs([]);

    const cleanCardNum = cardNumber.replace(/\D/g, '');

    const runSimulation = async () => {
      // Step 1: Initiate network tunnel
      setProcessingStep(1);
      setProcessingLogs(prev => [...prev, `[INIT] Secure connection initialized with ${selectedMerchant.name}...`]);
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Validate Luhn syntax and Visa BIN
      setProcessingStep(2);
      setProcessingLogs(prev => [...prev, `[VALIDATE] Inspecting Luhn compliance and Visa Routing BIN...`]);
      await new Promise(r => setTimeout(r, 900));

      if (!validateLuhn(cleanCardNum)) {
        setProcessingLogs(prev => [...prev, `[ERROR] CRITICAL: Card number failed Luhn 16 checksum validation.`]);
        setCheckoutStatus('failed');
        setErrorMessage('Invalid Card Number (Luhn algorithm check failed). Visa card must start with 4 and have a valid check digit.');
        setIsProcessing(false);
        return;
      }
      setProcessingLogs(prev => [...prev, `[SUCCESS] Luhn algorithm checksum matches 16-digit standard.`]);

      // Step 3: Match against active generated card database
      setProcessingStep(3);
      setProcessingLogs(prev => [...prev, `[DATABASE] Contacting UseMe Virtual Ledger database...`]);
      await new Promise(r => setTimeout(r, 1000));

      const matchedCard = activeCards.find(c => c.cardNumber === cleanCardNum);
      if (!matchedCard) {
        setProcessingLogs(prev => [...prev, `[ERROR] DECLINED: Card token does not exist in local active wallet registry.`]);
        setCheckoutStatus('failed');
        setErrorMessage('Declined: Card details not recognized in your virtual UseMe wallet database.');
        setIsProcessing(false);
        return;
      }

      // Check security codes and other parameters
      if (matchedCard.expiry !== expiry || matchedCard.cvv !== cvv) {
        setProcessingLogs(prev => [...prev, `[ERROR] DECLINED: Expiry Date (${expiry}) or CVV verification failed.`]);
        setCheckoutStatus('failed');
        setErrorMessage('Declined: Security mismatch. Incorrect Expiry Date or CVV.');
        setIsProcessing(false);
        return;
      }

      if (matchedCard.isPaused) {
        setProcessingLogs(prev => [...prev, `[ERROR] DECLINED: Card is set to PAUSED status by the cardholder.`]);
        setCheckoutStatus('failed');
        setErrorMessage('Declined: This card has been PAUSED. Please activate it in your UseMe wallet before using.');
        setIsProcessing(false);
        return;
      }

      setProcessingLogs(prev => [...prev, `[SUCCESS] Authorized credentials matching token: ${matchedCard.id.slice(0,8)}...`]);

      // Step 4: Verify virtual balance ledger
      setProcessingStep(4);
      setProcessingLogs(prev => [...prev, `[BALANCE] Checking virtual wallet liquidity. Required: $${selectedMerchant.price.toFixed(2)}`]);
      await new Promise(r => setTimeout(r, 900));

      if (matchedCard.balance < selectedMerchant.price) {
        setProcessingLogs(prev => [...prev, `[ERROR] DECLINED: Insufficient sandbox funds. Current balance: $${matchedCard.balance.toFixed(2)}`]);
        setCheckoutStatus('failed');
        setErrorMessage(`Declined: Insufficient Sandbox Funds. Card balance is $${matchedCard.balance.toFixed(2)}, but purchase is $${selectedMerchant.price.toFixed(2)}.`);
        setIsProcessing(false);
        return;
      }

      // Success! Deduct balance and construct transaction record
      setProcessingStep(5);
      setProcessingLogs(prev => [...prev, `[APPROVED] Virtual balance reserved. Updating ledger records...`]);
      await new Promise(r => setTimeout(r, 1000));

      const updatedCard: VirtualCard = {
        ...matchedCard,
        balance: Number((matchedCard.balance - selectedMerchant.price).toFixed(2)),
      };

      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        cardId: matchedCard.id,
        cardholderName: matchedCard.cardholderName,
        cardNumber: `••••  ••••  ••••  ${matchedCard.cardNumber.slice(-4)}`,
        merchantName: selectedMerchant.name,
        amount: selectedMerchant.price,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'success',
        category: selectedMerchant.category,
      };

      setReceipt(newTx);
      setCheckoutStatus('success');
      onTransactionComplete(newTx, updatedCard);
      setProcessingLogs(prev => [...prev, `[COMPLETE] Transaction cleared. Receipt issued: ${newTx.id}`]);
      setIsProcessing(false);
    };

    runSimulation();
  };

  const resetSandbox = () => {
    setCheckoutStatus('idle');
    setErrorMessage('');
    setReceipt(null);
    setProcessingLogs([]);
    setIsProcessing(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col gap-6 relative overflow-hidden" id="checkout-sandbox-container">
      {/* Visual background decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] tracking-widest font-mono uppercase text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            Simulator Sandbox
          </span>
        </div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          Online Merchant Checkout
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Simulate a real-world checkout gateway to verify your generated Visa details. No real money is spent.
        </p>
      </div>

      {/* Grid Layout: Left Column (Merchant Selector) / Right Column (Payment form) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Merchant Selector (4 columns) */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
            1. Select Demo Item
          </label>
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar border border-slate-800/80 rounded-xl p-2 bg-slate-950/40">
            {SIMULATED_MERCHANTS.map((m) => {
              const isSelected = selectedMerchant.id === m.id;
              return (
                <button
                  key={m.id}
                  disabled={isProcessing}
                  onClick={() => {
                    setSelectedMerchant(m);
                    if (checkoutStatus !== 'idle') resetSandbox();
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                      : 'border-slate-800/60 hover:bg-slate-900/60 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-gray-500'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <p className="text-xs font-semibold truncate">{m.name}</p>
                      <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">
                        ${m.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] leading-tight text-gray-500 mt-1 truncate">
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Checkout Simulator (7 columns) */}
        <div className="md:col-span-7 border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/60 relative">
          
          {/* Mock Browser Title bar */}
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] font-mono text-gray-500 ml-2 truncate max-w-[150px] md:max-w-[200px]">
                https://checkout.sandbox.visa
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-400 border border-slate-800">
              <ShieldCheck className="w-3 h-3" /> SECURE
            </div>
          </div>

          <div className="p-5">
            <AnimatePresence mode="wait">
              {checkoutStatus === 'idle' && !isProcessing && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleCheckoutSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center bg-indigo-950/30 border border-indigo-900/40 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-[11px] text-indigo-300 font-medium leading-none">Simulating Payment</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedMerchant.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">
                      ${selectedMerchant.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Card Number Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                        Visa Card Number
                      </label>
                      {selectedCard && (
                        <button
                          type="button"
                          onClick={handleAutofill}
                          className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Autofill Selected Card
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-sm font-mono text-white tracking-widest placeholder-gray-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold italic tracking-tighter text-gray-500 select-none">
                        VISA
                      </span>
                    </div>
                  </div>

                  {/* Holder Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="NAME ON CARD"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-display"
                    />
                  </div>

                  {/* Expiry & CVV Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-sm font-mono text-white text-center placeholder-gray-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                        Security Code (CVV)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        maxLength={3}
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-sm font-mono text-white text-center placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={activeCards.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm mt-2 transition shadow-md hover:shadow-indigo-500/20 active:translate-y-px flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay ${selectedMerchant.price.toFixed(2)} Securely
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {activeCards.length === 0 && (
                    <p className="text-[10px] text-center text-amber-400 mt-1">
                      ⚠️ Please generate a virtual Visa card first to complete transactions!
                    </p>
                  )}
                </motion.form>
              )}

              {/* Simulation Logging View */}
              {isProcessing && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4 py-4"
                >
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-white">Simulating Card Authorization</p>
                      <p className="text-xs text-gray-400">Verifying security token and balance liquidity...</p>
                    </div>
                  </div>

                  {/* Terminal Logger Loglines */}
                  <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] text-gray-300 h-32 overflow-y-auto flex flex-col gap-1">
                    {processingLogs.map((log, index) => {
                      let color = 'text-gray-400';
                      if (log.includes('[SUCCESS]')) color = 'text-emerald-400';
                      if (log.includes('[ERROR]')) color = 'text-rose-400 font-semibold';
                      if (log.includes('[APPROVED]')) color = 'text-emerald-300 font-bold';
                      return (
                        <p key={index} className={color}>
                          {log}
                        </p>
                      );
                    })}
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="flex gap-1.5 h-1 bg-slate-900 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 transition-all duration-300 ${
                          processingStep >= step ? 'bg-indigo-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SUCCESS STATE */}
              {checkoutStatus === 'success' && receipt && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-2"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-md font-bold text-white tracking-tight">Payment Approved!</h3>
                  <p className="text-xs text-emerald-400 mt-1 font-mono font-medium">UseMe Sandbox Auth: SUCCESS</p>

                  {/* Minimal Receipts */}
                  <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mt-4 text-xs font-mono flex flex-col gap-2.5 relative">
                    <div className="flex justify-between border-b border-dashed border-slate-800 pb-2">
                      <span className="text-gray-500">Merchant</span>
                      <span className="text-gray-100 font-bold">{receipt.merchantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cardholder</span>
                      <span className="text-gray-100">{receipt.cardholderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Card Number</span>
                      <span className="text-gray-100">{receipt.cardNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-gray-100 text-[10px] font-bold">{receipt.id}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-800 pt-2 text-sm font-bold">
                      <span className="text-gray-400">Total Deducted</span>
                      <span className="text-emerald-400">${receipt.amount.toFixed(2)}</span>
                    </div>

                    {/* Fun decorative notches */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-950 rounded-full border-r border-slate-800" />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-950 rounded-full border-l border-slate-800" />
                  </div>

                  <button
                    onClick={resetSandbox}
                    className="mt-5 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Execute Another Simulator Payment
                  </button>
                </motion.div>
              )}

              {/* FAILED STATE */}
              {checkoutStatus === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-2"
                >
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mb-3 animate-bounce">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-md font-bold text-white tracking-tight">Transaction Declined</h3>
                  <p className="text-xs text-rose-400 mt-1 font-mono font-medium">Gateway Code: DECLINED</p>

                  <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 mt-4 w-full text-xs text-gray-300 leading-relaxed text-center">
                    {errorMessage}
                  </div>

                  <div className="flex gap-4 mt-5">
                    <button
                      onClick={resetSandbox}
                      className="text-xs bg-slate-900 border border-slate-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition font-medium cursor-pointer"
                    >
                      Modify Form Details
                    </button>
                    {selectedCard && (
                      <button
                        onClick={() => {
                          handleAutofill();
                          resetSandbox();
                        }}
                        className="text-xs bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition font-medium cursor-pointer"
                      >
                        Autofill & Retry
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
