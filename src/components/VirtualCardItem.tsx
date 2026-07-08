/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { VirtualCard } from '../types';
import { formatCardNumber } from '../utils/cardGenerator';

interface VirtualCardItemProps {
  card: VirtualCard;
  isInteractive?: boolean;
}

export function VirtualCardItem({ card, isInteractive = true }: VirtualCardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNumber, setShowNumber] = useState(true);

  // Define background gradients based on CardStyle
  const getStyleGradient = () => {
    switch (card.style) {
      case 'cosmic':
        return 'from-slate-950 via-indigo-950 to-purple-950 border-purple-500/20';
      case 'emerald':
        return 'from-emerald-950 via-teal-950 to-slate-950 border-emerald-500/20';
      case 'sunset':
        return 'from-stone-950 via-amber-950 to-rose-950 border-orange-500/20';
      case 'royal':
        return 'from-blue-950 via-indigo-950 to-slate-950 border-blue-500/20';
      case 'neon-cyan':
        return 'from-cyan-950 via-slate-900 to-zinc-950 border-cyan-500/20';
      default:
        return 'from-slate-900 via-indigo-950 to-purple-900 border-indigo-500/20';
    }
  };

  // Glow class based on tier
  const getTierGlow = () => {
    switch (card.tier) {
      case 'gold':
        return 'glow-gold';
      case 'platinum':
        return 'glow-platinum';
      case 'infinite':
        return 'glow-infinite';
      default:
        return 'glow-blue';
    }
  };

  // Tier color styling
  const getTierBadgeText = () => {
    switch (card.tier) {
      case 'gold':
        return 'text-amber-400 bg-amber-950/40 border border-amber-500/30';
      case 'platinum':
        return 'text-purple-300 bg-purple-950/40 border border-purple-500/30';
      case 'infinite':
        return 'text-rose-400 bg-rose-950/40 border border-rose-500/30 font-semibold tracking-wider';
      default:
        return 'text-blue-300 bg-blue-950/40 border border-blue-500/30';
    }
  };

  const getChipStyle = () => {
    switch (card.tier) {
      case 'gold':
        return 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_8px_rgba(234,179,8,0.3)]';
      case 'platinum':
        return 'bg-gradient-to-br from-purple-200 via-slate-400 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]';
      case 'infinite':
        return 'bg-gradient-to-br from-rose-400 via-stone-800 to-zinc-950 shadow-[0_0_10px_rgba(244,63,94,0.4)] border border-rose-500/40';
      default:
        return 'bg-gradient-to-br from-slate-200 via-zinc-400 to-slate-500 shadow-[0_0_6px_rgba(255,255,255,0.2)]';
    }
  };

  const maskCardNumber = (num: string) => {
    if (!showNumber) {
      return `••••  ••••  ••••  ${num.slice(-4)}`;
    }
    return formatCardNumber(num);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[230px] perspective-1000 group">
      {/* Dynamic Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-15 transition-all duration-700 blur-xl ${getTierGlow()}`} />

      {/* Main Flippable Card */}
      <motion.div
        className="w-full h-full relative cursor-pointer preserve-3d transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT OF THE CARD */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl border glass-card p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${getStyleGradient()}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top Row: Chip, Tier, and Visa Brand */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {/* Metallic Chip */}
              <div className={`w-11 h-8 rounded-md relative overflow-hidden ${getChipStyle()}`}>
                {/* Chip circuit lines */}
                <div className="absolute inset-x-1.5 inset-y-1 border-t border-black/10 opacity-60" />
                <div className="absolute inset-x-3 inset-y-1.5 border-r border-l border-black/15 opacity-60" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/10 -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/10 -translate-x-1/2" />
              </div>
              
              {/* Card Type Tag */}
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider bg-slate-900/60 px-2 py-0.5 rounded border border-gray-800/80">
                {card.cardType}
              </span>
            </div>

            {/* Visa Logo and Tier */}
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold tracking-tight italic text-white flex items-center gap-0.5 select-none">
                VISA
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 ${getTierBadgeText()}`}>
                {card.tier}
              </span>
            </div>
          </div>

          {/* Middle Row: Holographic Accent / Signal Icon & Masked Number */}
          <div className="mt-4">
            {/* Contactless Signal Icon */}
            <div className="flex justify-end pr-1 opacity-70 mb-1">
              <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12a10 10 0 0 1 14 0" />
                <path d="M8.5 12a5 5 0 0 1 7 0" />
                <path d="M12 12h.01" />
              </svg>
            </div>

            {/* 16-Digit Card Number */}
            <p className="text-xl md:text-2xl font-mono tracking-widest font-semibold text-gray-100 select-all transition-all duration-300">
              {maskCardNumber(card.cardNumber)}
            </p>
          </div>

          {/* Bottom Row: Cardholder, Expiry, Security Check */}
          <div className="flex justify-between items-end mt-auto pt-2">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 select-none">Card Holder</p>
              <p className="text-sm font-medium tracking-wide text-gray-100 truncate max-w-[180px] font-display">
                {card.cardholderName || 'SANDBOX USER'}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 select-none">Expires</p>
                <p className="text-sm font-mono text-gray-100">{card.expiry}</p>
              </div>
            </div>
          </div>

          {/* Security holographic sticker for infinite / premium cards */}
          {card.tier === 'infinite' && (
            <div className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-20 blur-md pointer-events-none" />
          )}
        </div>

        {/* BACK OF THE CARD */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl border glass-card flex flex-col justify-between overflow-hidden bg-gradient-to-br ${getStyleGradient()}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Magnetic Strip */}
          <div className="w-full h-11 bg-slate-900 mt-5 shadow-inner" />

          {/* Signature Panel and CVV */}
          <div className="px-6 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-[9px] uppercase tracking-wider text-gray-400 select-none">Authorized Signature</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 select-none">Security Code</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Signature area (styled white/grey zebra stripes) */}
              <div className="flex-1 h-9 bg-slate-100 rounded flex items-center justify-start pl-3 overflow-hidden select-none border border-slate-300">
                <span className="font-serif italic text-slate-500 text-sm tracking-widest opacity-60 select-none">
                  {card.cardholderName || 'Sandbox User'}
                </span>
              </div>
              
              {/* CVV Display */}
              <div className="w-14 h-9 bg-amber-100 rounded flex items-center justify-center font-mono font-bold text-slate-900 text-sm shadow-inner select-all border border-amber-200">
                {card.cvv}
              </div>
            </div>
          </div>

          {/* Bottom regulatory note */}
          <div className="px-6 pb-4 pt-2 flex justify-between items-end">
            <div>
              <p className="text-[7px] text-gray-400 leading-none select-none max-w-[200px]">
                This virtual test visa card is a sandbox development utility. Strictly for mock transaction simulations. UseMe inc.
              </p>
            </div>
            <div className="flex flex-col items-end opacity-80">
              <span className="text-sm font-bold tracking-tight italic text-white leading-none select-none">
                VISA
              </span>
              <span className="text-[6px] font-mono text-gray-400 uppercase tracking-widest leading-none mt-1">
                Sandbox Network
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Overlays (Toggle Flip & Visibility) */}
      {isInteractive && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full shadow-lg z-10 transition-transform hover:scale-105">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-300 hover:text-blue-400 transition"
            title="Flip Card"
          >
            <RefreshCw className="w-3 h-3 animate-pulse" />
            Flip Card
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <button
            onClick={() => setShowNumber(!showNumber)}
            className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-300 hover:text-blue-400 transition"
            title={showNumber ? 'Hide Details' : 'Show Details'}
          >
            {showNumber ? (
              <>
                <EyeOff className="w-3 h-3" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Reveal
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
