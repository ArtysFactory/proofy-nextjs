'use client';

// ============================================
// PROOFY V3 - Main Wizard Component
// Orchestrates all wizard steps
// ============================================

import { AnimatePresence } from 'framer-motion';
import { WizardProvider, useWizard } from './WizardContext';
import WizardProgress from './WizardProgress';
import Step1Upload from './Step1Upload';
import Step2WorkParties from './Step2WorkParties';
import Step3Masters from './Step3Masters';
import Step4Review from './Step4Review';

// ===== WIZARD CONTENT =====

function WizardContent() {
  const { state } = useWizard();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Nouveau dépôt
          </h1>
          <p className="text-gray-400">
            Enregistrez votre création sur la blockchain Polygon
          </p>
        </div>

        {/* Progress */}
        <WizardProgress />

        {/* Step Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {state.currentStep === 1 && <Step1Upload key="step1" />}
            {state.currentStep === 2 && <Step2WorkParties key="step2" />}
            {state.currentStep === 3 && <Step3Masters key="step3" />}
            {state.currentStep === 4 && <Step4Review key="step4" />}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Vos données sont traitées de manière sécurisée et conforme au RGPD.
          </p>
          <p className="mt-1">
            Le hash SHA-256 de votre fichier est calculé localement — votre fichier n'est jamais uploadé.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function WizardV3() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

// ===== EXPORTS FOR INDIVIDUAL STEPS =====

export { WizardProvider, useWizard } from './WizardContext';
export { default as WizardProgress } from './WizardProgress';
export { default as Step1Upload } from './Step1Upload';
export { default as Step2WorkParties } from './Step2WorkParties';
export { default as Step3Masters } from './Step3Masters';
export { default as Step4Review } from './Step4Review';
