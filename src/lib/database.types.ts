export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface DetailImageRow {
  columns: 1 | 2 | 3 | 4 | 5;
  images: string[];
}

export interface CvItem {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface AboutContentRow {
  id: number;
  name: string;
  title: string;
  bio_paragraph_1: string;
  bio_paragraph_2: string;
  graduation_text: string;
  phone: string;
  address: string;
  birthday: string;
  linkedin_url: string;
  profile_image_url: string;
  cv_file_url: string;
  profile_image_width: number;
  logo_url: string;
  logo_height: number;
  projects_columns: number;
  favicon_url: string;
  updated_at: string;
}

export interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  category: string;
  description: string;
  detail_images: DetailImageRow[];
  order_index: number;
  created_at: string;
}

export interface CvSectionRow {
  id: number;
  section_title: string;
  items: CvItem[];
  order_index: number;
}

export interface Database {
  public: {
    Tables: {
      about_content: {
        Row: AboutContentRow;
        Insert: Omit<AboutContentRow, "id" | "updated_at">;
        Update: Partial<Omit<AboutContentRow, "id">>;
      };
      projects: {
        Row: ProjectRow;
        Insert: Omit<ProjectRow, "id" | "created_at">;
        Update: Partial<Omit<ProjectRow, "id" | "created_at">>;
      };
      cv_sections: {
        Row: CvSectionRow;
        Insert: Omit<CvSectionRow, "id">;
        Update: Partial<Omit<CvSectionRow, "id">>;
      };
    };
  };
}

// Convenience aliases
export type AboutContent = AboutContentRow;
export type Project = ProjectRow;
export type CvSection = CvSectionRow;
