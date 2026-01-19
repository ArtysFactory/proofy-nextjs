'use client';

// ============================================
// PricingSimulator - Interactive pricing calculator
// Inspired by Brevo's pricing slider
// ============================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Calculator, Building2, Sparkles, TrendingDown } from 'lucide-react';
import { fadeInUpItem } from '@/lib/motionConfig';
import LocaleLink from '@/components/LocaleLink';

// Pricing tiers based on pack prices
const PRICING_TIERS = [
  { min: 1, max: 1, pricePerDeposit: 3.00, packName: 'unitaire' },
  { min: 2, max: 10, pricePerDeposit: 1.50, packName: 'Starter', packPrice: 15, packDeposits: 10 },
  { min: 11, max: 50, pricePerDeposit: 1.20, packName: 'Creator', packPrice: 60, packDeposits: 50 },
  { min: 51, max: 100, pricePerDeposit: 1.00, packName: 'Pro', packPrice: 100, packDeposits: 100 },
  { min: 101, max: 500, pricePerDeposit: 0.50, packName: 'Studio', packPrice: 250, packDeposits: 500 },
  { min: 501, max: 1999, pricePerDeposit: 0.50, packName: 'Studio x4', packPrice: 1000, packDeposits: 2000 },
  { min: 2000, max: 10000, pricePerDeposit: 0.30, packName: 'Enterprise', packPrice: null, packDeposits: null },
];

// Slider stops for better UX
const SLIDER_STOPS = [1, 10, 50, 100, 250, 500, 1000, 2000, 3000, 5000, 10000];

function calculateBestPricing(deposits: number) {
  // For enterprise (2000+), use 0.30€/deposit
  if (deposits >= 2000) {
    return {
      totalPrice: deposits * 0.30,
      pricePerDeposit: 0.30,
      packName: 'Enterprise',
      isEnterprise: true,
      savings: deposits * 3 - deposits * 0.30, // vs single deposits
      savingsPercent: Math.round((1 - 0.30 / 3) * 100),
    };
  }

  // For smaller quantities, calculate optimal pack combination
  let remainingDeposits = deposits;
  let totalPrice = 0;
  const packsUsed: { name: string; count: number; price: number }[] = [];

  // Work backwards from largest pack
  const packOptions = [
    { name: 'Studio', deposits: 500, price: 250 },
    { name: 'Pro', deposits: 100, price: 100 },
    { name: 'Creator', deposits: 50, price: 60 },
    { name: 'Starter', deposits: 10, price: 15 },
  ];

  for (const pack of packOptions) {
    if (remainingDeposits >= pack.deposits) {
      const packCount = Math.floor(remainingDeposits / pack.deposits);
      packsUsed.push({ name: pack.name, count: packCount, price: pack.price * packCount });
      totalPrice += pack.price * packCount;
      remainingDeposits -= packCount * pack.deposits;
    }
  }

  // Handle remaining with single deposits or smaller pack
  if (remainingDeposits > 0) {
    // Check if buying smallest pack is cheaper than single deposits
    const singlePrice = remainingDeposits * 3;
    const starterPack = { name: 'Starter', deposits: 10, price: 15 };
    
    if (remainingDeposits <= 5 && singlePrice <= starterPack.price) {
      // Single deposits are cheaper for very small amounts
      packsUsed.push({ name: 'Unitaire', count: remainingDeposits, price: singlePrice });
      totalPrice += singlePrice;
    } else {
      // Buy the smallest pack that covers remaining
      const smallestPack = packOptions.reverse().find(p => p.deposits >= remainingDeposits) || packOptions[0];
      packsUsed.push({ name: smallestPack.name, count: 1, price: smallestPack.price });
      totalPrice += smallestPack.price;
    }
  }

  const pricePerDeposit = totalPrice / deposits;
  const singleDepositTotal = deposits * 3;

  return {
    totalPrice,
    pricePerDeposit,
    packsUsed,
    isEnterprise: false,
    savings: singleDepositTotal - totalPrice,
    savingsPercent: Math.round((1 - pricePerDeposit / 3) * 100),
  };
}

export function PricingSimulator() {
  const t = useTranslations('home.pricing');
  const [deposits, setDeposits] = useState(100);

  const pricing = useMemo(() => calculateBestPricing(deposits), [deposits]);

  // Find nearest slider stop for display
  const sliderValue = useMemo(() => {
    const index = SLIDER_STOPS.findIndex(stop => stop >= deposits);
    if (index === -1) return SLIDER_STOPS.length - 1;
    if (index === 0) return 0;
    
    // Find which stop is closer
    const lower = SLIDER_STOPS[index - 1];
    const upper = SLIDER_STOPS[index];
    return deposits - lower < upper - deposits ? index - 1 : index;
  }, [deposits]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setDeposits(SLIDER_STOPS[index]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setDeposits(Math.min(Math.max(value, 1), 10000));
  };

  return (
    <motion.div
      variants={fadeInUpItem}
      className="glass-card rounded-3xl p-8 mb-12 border border-white/10 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#bff227]/20 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-[#bff227]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{t('simulator.title')}</h3>
          <p className="text-gray-400 text-sm">{t('simulator.subtitle')}</p>
        </div>
      </div>

      {/* Slider Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-gray-300 font-medium">{t('simulator.depositsLabel')}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={deposits}
              onChange={handleInputChange}
              min={1}
              max={10000}
              className="w-24 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[#bff227] font-bold text-right focus:outline-none focus:border-[#bff227]/50"
            />
            <span className="text-gray-400">{t('simulator.depositsUnit')}</span>
          </div>
        </div>

        {/* Custom Slider */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={SLIDER_STOPS.length - 1}
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #bff227 0%, #bff227 ${(sliderValue / (SLIDER_STOPS.length - 1)) * 100}%, rgba(255,255,255,0.1) ${(sliderValue / (SLIDER_STOPS.length - 1)) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          
          {/* Slider Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1</span>
            <span>100</span>
            <span>500</span>
            <span>2 000</span>
            <span>10 000</span>
          </div>
        </div>

        {/* Enterprise threshold indicator */}
        {deposits >= 2000 && (
          <div className="mt-4 flex items-center gap-2 text-[#bff227] text-sm">
            <Building2 className="w-4 h-4" />
            <span>{t('simulator.enterpriseUnlocked')}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Price Summary */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">{t('simulator.totalPrice')}</div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-white">
              {pricing.totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€
            </span>
            {pricing.isEnterprise && (
              <span className="text-gray-400 text-sm">{t('simulator.onQuote')}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-400">{t('simulator.pricePerDeposit')}: </span>
              <span className="text-[#bff227] font-semibold">
                {pricing.pricePerDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </span>
            </div>
          </div>

          {/* Savings Badge */}
          {pricing.savings > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-[#bff227]/10 rounded-xl px-4 py-2">
              <TrendingDown className="w-4 h-4 text-[#bff227]" />
              <span className="text-[#bff227] text-sm font-medium">
                {t('simulator.savings', { 
                  amount: pricing.savings.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                  percent: pricing.savingsPercent 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Right: Recommendation */}
        <div className="bg-gradient-to-br from-[#bff227]/10 to-transparent rounded-2xl p-6 border border-[#bff227]/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#bff227]" />
            <span className="text-white font-semibold">{t('simulator.recommendation')}</span>
          </div>

          {pricing.isEnterprise ? (
            <div>
              <p className="text-gray-300 text-sm mb-4">
                {t('simulator.enterpriseDesc')}
              </p>
              <LocaleLink
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#bff227] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#d4ff4d] transition-colors"
              >
                {t('simulator.contactUs')}
              </LocaleLink>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 text-sm mb-4">
                {t('simulator.packRecommendation', { deposits })}
              </p>
              <LocaleLink
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#bff227] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#d4ff4d] transition-colors"
              >
                {t('simulator.getStarted')}
              </LocaleLink>
            </div>
          )}
        </div>
      </div>

      {/* INPI Comparison for large volumes */}
      {deposits >= 100 && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-sm">
            <span className="text-gray-400">{t('simulator.inpiComparison')}: </span>
            <span className="text-white font-medium">
              {(deposits * 65).toLocaleString('fr-FR')}€
            </span>
            <span className="text-gray-400"> → </span>
            <span className="text-[#bff227] font-bold">
              {t('simulator.youSave', { 
                amount: ((deposits * 65) - pricing.totalPrice).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) 
              })}
            </span>
          </div>
        </div>
      )}

      {/* Custom CSS for slider thumb */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #bff227;
          cursor: pointer;
          border: 4px solid #0a0a0a;
          box-shadow: 0 0 10px rgba(191, 242, 39, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #bff227;
          cursor: pointer;
          border: 4px solid #0a0a0a;
          box-shadow: 0 0 10px rgba(191, 242, 39, 0.5);
        }
      `}</style>
    </motion.div>
  );
}

export default PricingSimulator;
