import type { LocalFaq } from '@/pages/services/_components/faq-card';
import type { LocalLegalBasis } from '@/pages/services/_components/legal-basis-card';
import type { LocalPackage } from '@/pages/services/_components/package-card';
import type { LocalProcessStep } from '@/pages/services/_components/process-step-card';
import type { LocalRequirementCategory } from '@/pages/services/_components/requirement-card';
import { uid } from './utils';

// ============================================================
// FACTORIES
// ============================================================
export const makePackage = (sort_order: number): LocalPackage => ({
    _key: uid(),
    name: 'Paket Baru',
    price: 0,
    original_price: null,
    duration: '7-14 hari',
    duration_days: null,
    short_description: null,
    is_highlighted: false,
    badge: null,
    sort_order,
    features: [],
});

export const makeFaq = (sort_order: number): LocalFaq => ({
    _key: uid(),
    question: '',
    answer: '',
    sort_order,
});

export const makeLegalBasis = (sort_order: number): LocalLegalBasis => ({
    _key: uid(),
    document_type: 'Undang-Undang (UU)',
    document_number: '',
    title: '',
    issued_date: '',
    url: '',
    description: '',
    sort_order,
});

export const makeRequirementCategory = (sort_order: number): LocalRequirementCategory => ({
    _key: uid(),
    name: '',
    description: '',
    sort_order,
    requirements: [],
});

export const makeProcessStep = (sort_order: number): LocalProcessStep => ({
    _key: uid(),
    title: '',
    description: '',
    duration: '',
    duration_days: null,
    required_documents: [],
    notes: '',
    icon: '',
    sort_order,
});
