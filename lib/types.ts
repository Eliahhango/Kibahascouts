export interface NewsArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: "Announcements" | "Training" | "Community Service" | "Awards"
  image: string
  author: string
  date: string
  readingTime: string
  tags: string[]
  featured?: boolean
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
  mapUrl?: string
  image: string
  registrationOpen: boolean
  category: string
}

export interface Resource {
  id: string
  title: string
  summary: string
  category: "Forms" | "Training" | "Policies" | "Badges" | "Reports"
  fileType: "PDF" | "DOCX" | "XLSX" | "ZIP"
  fileSize: string
  publishDate: string
  downloadUrl: string
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
}

export interface LeaderProfile {
  id: string
  name: string
  role: string
  image: string
  bio: string
  since: string
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
