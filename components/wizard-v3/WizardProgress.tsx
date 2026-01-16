'use client';

// ============================================
// PROOFY V3 - Wizard Progress Bar
// ============================================

import { motion } from 'framer-motion';
import { useWizard } from './WizardContext';
import { Check, Upload, PenLine, Mic2, Music, FileCheck } from 'lucide-react';

const steps = [
  { id: 1, name: 'Upload', icon: Upload, description: 'Fichier & Hash' },
  { id: 2, name: 'Auteurs', icon: PenLine, description: 'Droits d\'auteur' },
  { id: 3, name: 'Voisins', icon: Mic2, description: 'Droits voisins' },
  { id: 4, name: 'Masters', icon: Music, description: 'Enregistrements' },
  { id: 5, name: 'Validation', icon: FileCheck, description: 'Mandats & Dépôt' },
];

export default function WizardProgress() {
  const { state, goToStep } = useWizard();
  const { currentStep } = state;

  return (
    <div className="w-full mb-8">
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" />
        
        {/* Progress Line Active */}
        <motion.div
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-[#bff227] to-[#9dd11e]"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => {
                // Allow going back, or to completed steps
                if (step.id <= currentStep) {
                  goToStep(step.id);
                }
              }}
              disabled={step.id > currentStep}
              className={`relative z-10 flex flex-col items-center group ${
                step.id > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Step Circle */}
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#bff227] border-[#bff227] text-[#0a0a0a]'
                    : isCurrent
                    ? 'bg-[#0a0a0a] border-[#bff227] text-[#bff227]'
                    : 'bg-[#0a0a0a] border-white/20 text-white/40'
                } ${step.id <= currentStep ? 'group-hover:scale-110' : ''}`}
                whileHover={step.id <= currentStep ? { scale: 1.1 } : {}}
                whileTap={step.id <= currentStep ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-[#bff227]'
                      : isCompleted
                      ? 'text-white'
                      : 'text-white/40'
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="text-sm font-medium text-[#bff227]">
            {steps[currentStep - 1]?.name}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#bff227] to-[#9dd11e] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
