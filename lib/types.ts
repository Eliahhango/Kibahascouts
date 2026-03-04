export interface NewsArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: "Announcements" | "Training" | "Community Service" | "Awards" | "General"
  image: string
  author: string
  date: string
  readingTime: string
  tags: string[]
  featured?: boolean
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ScoutEvent {
  id: string
  slug: string
  title: string
  description: string
  date: string
  endDate?: string
  time: string
  location: string
  latitude?: number
  longitude?: number
  mapZoom?: number
  mapUrl?: string
  image: string
  registrationOpen: boolean
  registrationUrl?: string
  category: string
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Resource {
  id: string
  slug?: string
  title: string
  summary: string
  category: "Forms" | "Training" | "Policies" | "Badges" | "Reports" | "General"
  fileType: "PDF" | "DOCX" | "XLSX" | "ZIP" | "UNKNOWN"
  fileSize: string
  publishDate: string
  downloadUrl: string
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ScoutUnit {
  id: string
  slug: string
  name: string
  type: "Pack" | "Troop" | "Crew"
  section: "Cub Scouts" | "Scouts" | "Rovers"
  ward: string
  meetingDay: string
  meetingTime: string
  meetingLocation: string
  leaders: { name: string; role: string }[]
  memberCount: number
  established: string
  contactEmail: string
  image: string
  published?: boolean
}

export interface LeaderProfile {
  id: string
  name: string
  role: string
  image: string
  bio: string
  since: string
}

export interface MediaItem {
  id: string
  title: string
  kind: "video" | "gallery"
  thumbnail: string
  href: string
  embedUrl?: string
  sourceProvider?: string
  description: string
  displayOrder: number
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DistrictSnapshotItem {
  label: string
  value: string
}

export interface PriorityInitiative {
  title: string
  description: string
  href: string
}

export interface HomepageSettings {
  districtSnapshot: DistrictSnapshotItem[]
  priorityInitiatives: PriorityInitiative[]
  updatedAt?: string
  updatedBy?: string
}

export interface NavigationChildItem {
  label: string
  href: string
}

export interface NavigationItem {
  label: string
  href: string
  description?: string
  children?: NavigationChildItem[]
}

export interface NavigationSettings {
  mainNavItems: NavigationItem[]
  updatedAt?: string
  updatedBy?: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  image: string
  status: "Active" | "Upcoming" | "Completed"
  link: string
}

export interface Programme {
  slug: string
  title: string
  ageRange: string
  description: string
  objectives: string[]
  activities: string[]
  badges: string[]
  progression: string[]
  uniformGuidance: string
  image: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface TimelineEntry {
  year: string
  title: string
  description: string
}

export type SearchResult = {
  type: "news" | "event" | "resource" | "unit"
  title: string
  url: string
  description: string
}

export type SearchFilter = "all" | "news" | "event" | "resource" | "unit"
