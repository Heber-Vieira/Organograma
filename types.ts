
export interface Employee {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  photoUrl?: string;
  description?: string;
  department?: string;
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
  isActive?: boolean;
  birthDate?: string; // Format: YYYY-MM-DD
  vacationStart?: string; // Format: YYYY-MM-DD
  vacationDays?: 10 | 15 | 20 | 30;
  childOrientation?: 'horizontal' | 'vertical';
}

export enum LayoutType {
  MODERN_PILL = 'MODERN_PILL',
  TECH_CIRCULAR = 'TECH_CIRCULAR',
  CLASSIC_MINIMAL = 'CLASSIC_MINIMAL',
  FUTURISTIC_GLASS = 'FUTURISTIC_GLASS'
}

export interface ChartNode extends Employee {
  children: ChartNode[];
}

export type Language = 'pt' | 'en' | 'es';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
  view_headcount_permission?: boolean;
  visual_style?: LayoutType;
  company_logo?: string;
}

export interface HeadcountPlanning {
  id: string;
  role: string;
  department?: string;
  required_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectData {
  version: string;
  timestamp: string;
  companyName: string;
  companyLogo: string;
  employees: Employee[];
  layout: LayoutType;
}
