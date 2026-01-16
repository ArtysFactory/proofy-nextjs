'use client';

// ============================================
// PROOFY V3 - Wizard Context
// Global state management for the wizard
// ============================================

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  MusicWork,
  MusicMaster,
  MusicRelease,
  MusicParty,
  MusicMandate,
  AudioMetadata,
} from '@/types/music';
import {
  generateWorkId,
  generateMasterId,
  generateReleaseId,
  generatePartyId,
  generateMandateId,
} from '@/lib/music-rights';

// ===== WIZARD STATE =====

export interface WizardState {
  // Navigation
  currentStep: number;
  totalSteps: number;
  
  // Step 1: Upload
  file: File | null;
  fileHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  
  // Step 2: Work & Parties
  work: MusicWork;
  parties: MusicParty[];
  
  // Step 3: Masters & Releases
  masters: MusicMaster[];
  releases: MusicRelease[];
  audioMetadata: AudioMetadata | null;
  
  // Step 4: Mandates
  mandates: MusicMandate[];
  
  // Meta
  isSubmitting: boolean;
  errors: string[];
  creationId: number | null;
  publicId: string | null;
}

// ===== INITIAL STATE =====

const initialWork: MusicWork = {
  work_id: '',
  title: '',
  language: 'fr',
  genre: '',
  authors: [],
  composers: [],
  publishers: [],
};

const initialState: WizardState = {
  currentStep: 1,
  totalSteps: 4,
  file: null,
  fileHash: '',
  fileName: '',
  fileSize: 0,
  fileType: '',
  work: initialWork,
  parties: [],
  masters: [],
  releases: [],
  audioMetadata: null,
  mandates: [],
  isSubmitting: false,
  errors: [],
  creationId: null,
  publicId: null,
};

// ===== ACTION TYPES =====

type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_FILE'; file: File; hash: string }
  | { type: 'SET_WORK'; work: Partial<MusicWork> }
  | { type: 'ADD_PARTY'; party: MusicParty }
  | { type: 'UPDATE_PARTY'; partyId: string; party: Partial<MusicParty> }
  | { type: 'REMOVE_PARTY'; partyId: string }
  | { type: 'ADD_MASTER'; master: MusicMaster }
  | { type: 'UPDATE_MASTER'; masterId: string; master: Partial<MusicMaster> }
  | { type: 'REMOVE_MASTER'; masterId: string }
  | { type: 'ADD_RELEASE'; release: MusicRelease }
  | { type: 'UPDATE_RELEASE'; releaseId: string; release: Partial<MusicRelease> }
  | { type: 'REMOVE_RELEASE'; releaseId: string }
  | { type: 'SET_AUDIO_METADATA'; metadata: AudioMetadata }
  | { type: 'ADD_MANDATE'; mandate: MusicMandate }
  | { type: 'UPDATE_MANDATE'; mandateId: string; mandate: Partial<MusicMandate> }
  | { type: 'REMOVE_MANDATE'; mandateId: string }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERRORS'; errors: string[] }
  | { type: 'SET_CREATION_RESULT'; creationId: number; publicId: string }
  | { type: 'RESET' };

// ===== REDUCER =====

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: Math.max(1, Math.min(action.step, state.totalSteps)) };
    
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, state.totalSteps) };
    
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    
    case 'SET_FILE':
      return {
        ...state,
        file: action.file,
        fileHash: action.hash,
        fileName: action.file.name,
        fileSize: action.file.size,
        fileType: action.file.type,
        // Auto-fill work title from filename
        work: {
          ...state.work,
          work_id: state.work.work_id || generateWorkId(),
          title: state.work.title || action.file.name.replace(/\.[^/.]+$/, ''),
        },
      };
    
    case 'SET_WORK':
      return {
        ...state,
        work: {
          ...state.work,
          ...action.work,
          work_id: state.work.work_id || generateWorkId(),
        },
      };
    
    case 'ADD_PARTY':
      return {
        ...state,
        parties: [...state.parties, { ...action.party, party_id: action.party.party_id || generatePartyId() }],
      };
    
    case 'UPDATE_PARTY':
      return {
        ...state,
        parties: state.parties.map((p) =>
          p.party_id === action.partyId ? { ...p, ...action.party } : p
        ),
      };
    
    case 'REMOVE_PARTY':
      return {
        ...state,
        parties: state.parties.filter((p) => p.party_id !== action.partyId),
      };
    
    case 'ADD_MASTER':
      return {
        ...state,
        masters: [...state.masters, { ...action.master, master_id: action.master.master_id || generateMasterId() }],
      };
    
    case 'UPDATE_MASTER':
      return {
        ...state,
        masters: state.masters.map((m) =>
          m.master_id === action.masterId ? { ...m, ...action.master } : m
        ),
      };
    
    case 'REMOVE_MASTER':
      return {
        ...state,
        masters: state.masters.filter((m) => m.master_id !== action.masterId),
      };
    
    case 'ADD_RELEASE':
      return {
        ...state,
        releases: [...state.releases, { ...action.release, release_id: action.release.release_id || generateReleaseId() }],
      };
    
    case 'UPDATE_RELEASE':
      return {
        ...state,
        releases: state.releases.map((r) =>
          r.release_id === action.releaseId ? { ...r, ...action.release } : r
        ),
      };
    
    case 'REMOVE_RELEASE':
      return {
        ...state,
        releases: state.releases.filter((r) => r.release_id !== action.releaseId),
      };
    
    case 'SET_AUDIO_METADATA':
      return { ...state, audioMetadata: action.metadata };
    
    case 'ADD_MANDATE':
      return {
        ...state,
        mandates: [...state.mandates, { ...action.mandate, mandate_id: action.mandate.mandate_id || generateMandateId() }],
      };
    
    case 'UPDATE_MANDATE':
      return {
        ...state,
        mandates: state.mandates.map((m) =>
          m.mandate_id === action.mandateId ? { ...m, ...action.mandate } : m
        ),
      };
    
    case 'REMOVE_MANDATE':
      return {
        ...state,
        mandates: state.mandates.filter((m) => m.mandate_id !== action.mandateId),
      };
    
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    
    case 'SET_CREATION_RESULT':
      return { ...state, creationId: action.creationId, publicId: action.publicId };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

// ===== CONTEXT =====

interface WizardContextType {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  // Helper functions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setFile: (file: File, hash: string) => void;
  updateWork: (work: Partial<MusicWork>) => void;
  addParty: (party: Omit<MusicParty, 'party_id'> & { party_id?: string }) => void;
  updateParty: (partyId: string, party: Partial<MusicParty>) => void;
  removeParty: (partyId: string) => void;
  addMaster: (master: Omit<MusicMaster, 'master_id'> & { master_id?: string }) => void;
  updateMaster: (masterId: string, master: Partial<MusicMaster>) => void;
  removeMaster: (masterId: string) => void;
  addRelease: (release: Omit<MusicRelease, 'release_id'> & { release_id?: string }) => void;
  updateRelease: (releaseId: string, release: Partial<MusicRelease>) => void;
  removeRelease: (releaseId: string) => void;
  setAudioMetadata: (metadata: AudioMetadata) => void;
  addMandate: (mandate: Omit<MusicMandate, 'mandate_id'> & { mandate_id?: string }) => void;
  updateMandate: (mandateId: string, mandate: Partial<MusicMandate>) => void;
  removeMandate: (mandateId: string) => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

// ===== PROVIDER =====

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const value: WizardContextType = {
    state,
    dispatch,
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    goToStep: (step) => dispatch({ type: 'SET_STEP', step }),
    setFile: (file, hash) => dispatch({ type: 'SET_FILE', file, hash }),
    updateWork: (work) => dispatch({ type: 'SET_WORK', work }),
    addParty: (party) => dispatch({ type: 'ADD_PARTY', party: party as MusicParty }),
    updateParty: (partyId, party) => dispatch({ type: 'UPDATE_PARTY', partyId, party }),
    removeParty: (partyId) => dispatch({ type: 'REMOVE_PARTY', partyId }),
    addMaster: (master) => dispatch({ type: 'ADD_MASTER', master: master as MusicMaster }),
    updateMaster: (masterId, master) => dispatch({ type: 'UPDATE_MASTER', masterId, master }),
    removeMaster: (masterId) => dispatch({ type: 'REMOVE_MASTER', masterId }),
    addRelease: (release) => dispatch({ type: 'ADD_RELEASE', release: release as MusicRelease }),
    updateRelease: (releaseId, release) => dispatch({ type: 'UPDATE_RELEASE', releaseId, release }),
    removeRelease: (releaseId) => dispatch({ type: 'REMOVE_RELEASE', releaseId }),
    setAudioMetadata: (metadata) => dispatch({ type: 'SET_AUDIO_METADATA', metadata }),
    addMandate: (mandate) => dispatch({ type: 'ADD_MANDATE', mandate: mandate as MusicMandate }),
    updateMandate: (mandateId, mandate) => dispatch({ type: 'UPDATE_MANDATE', mandateId, mandate }),
    removeMandate: (mandateId) => dispatch({ type: 'REMOVE_MANDATE', mandateId }),
    reset: () => dispatch({ type: 'RESET' }),
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// ===== HOOK =====

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
