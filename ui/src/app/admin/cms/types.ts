export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  content: string;
  is_published: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteLead {
  id: string;
  name: string;
  full_name?: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  enquiry_type: string | null;
  message: string | null;
  event_date: string | null;
  guest_count: number | null;
  notes: string | null;
  created_at: string;
}

export interface Analytics {
  total_leads: number;
  converted_leads: number;
  conversion_rate: string;
  leads_by_status: Array<{ status: string; count: number }>;
  leads_by_source: Array<{ source: string; count: number }>;
}

export const API_BASE = "http://localhost:3001";

export const PAGE_TYPES = ["HOMEPAGE", "ABOUT", "MENU", "CONTACT", "CUSTOM"] as const;
export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;
export const LEAD_SOURCES = ["LANDING_PAGE", "CATERING_ENQUIRY", "EVENT_BOOKING", "RESERVATION", "SOCIAL_MEDIA", "REFERRAL", "OTHER"] as const;
