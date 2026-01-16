// ============================================
// PROOFY V3 - Wizard Components Index
// ============================================

// Context & Types
export { 
  WizardProvider, 
  useWizard,
  type WizardState,
  type CopyrightHolder,
  type NeighboringRightsHolder,
  type CopyrightRights,
  type NeighboringRights,
} from './WizardContext';

// Progress Bar
export { default as WizardProgress } from './WizardProgress';

// Steps
export { default as Step1Upload } from './Step1Upload';
export { default as Step2CopyrightRights } from './Step2CopyrightRights';
export { default as Step3NeighboringRights } from './Step3NeighboringRights';
export { default as Step4Masters } from './Step4Masters';
export { default as Step5Review } from './Step5Review';

// Main Wizard Component
export { default as WizardV3 } from './WizardV3';
export { default } from './WizardV3';
