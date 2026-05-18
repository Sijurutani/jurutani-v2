export interface HeroSection {
  title: string
  subtitle: string
  badge?: {
    text: string
    icon: string
  }
}

export interface IconCard {
  icon: string
  title: string
  description: string
}

export type FeatureCard = IconCard
export type InstitutionHighlight = IconCard

export interface GalleryItem {
  src: string
  title: string
  description: string
  alt: string
}

export interface TeamCategory {
  icon: string
  title: string
  items: string[]
}

export type FaqCategoryId =
  | 'general'
  | 'account'
  | 'farming'
  | 'marketplace'
  | 'technical'

export interface FaqCategory {
  id: FaqCategoryId
  name: string
  icon: string
}

export interface FaqItem {
  question: string
  answer: string
}

export type FaqData = Record<FaqCategoryId, FaqItem[]>

export type LegalPageType = 'privacy' | 'terms'
export type LegalSectionType = 'list' | 'nested' | 'text'

export interface LegalSection {
  id: string
  title: string
  icon: string
  type: LegalSectionType
  content: string | string[]
}

export interface LegalPageData {
  pageType: LegalPageType
  icon: string
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}
