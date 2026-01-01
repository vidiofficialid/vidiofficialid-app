export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'editor' | 'admin'
export type AuthProvider = 'email' | 'google'
export type CampaignStatus = 'DRAFT' | 'INVITED' | 'RECORDED' | 'COMPLETED'
export type InviteMethod = 'EMAIL' | 'WHATSAPP' | 'BOTH'
export type TestimonialStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ProductCategory = 'JASA' | 'PRODUK'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          whatsapp: string | null
          address: string | null
          role: UserRole
          auth_provider: AuthProvider
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          whatsapp?: string | null
          address?: string | null
          role?: UserRole
          auth_provider?: AuthProvider
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          whatsapp?: string | null
          address?: string | null
          role?: UserRole
          auth_provider?: AuthProvider
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          company_name: string | null
          owner_name: string
          nib: string | null
          kbli: string | null
          product_category: ProductCategory | null
          product_type: string | null
          product_type_other: string | null
          email: string | null
          whatsapp: string | null
          logo: string | null
          description: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          company_name?: string | null
          owner_name: string
          nib?: string | null
          kbli?: string | null
          product_category?: ProductCategory | null
          product_type?: string | null
          product_type_other?: string | null
          email?: string | null
          whatsapp?: string | null
          logo?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          company_name?: string | null
          owner_name?: string
          nib?: string | null
          kbli?: string | null
          product_category?: ProductCategory | null
          product_type?: string | null
          product_type_other?: string | null
          email?: string | null
          whatsapp?: string | null
          logo?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          title: string
          brand_name: string
          product_image: string | null
          testimonial_script: string | null
          gesture_guide: string | null
          customer_name: string
          customer_email: string | null
          customer_whatsapp: string | null
          status: CampaignStatus
          invite_sent_at: string | null
          invite_method: InviteMethod | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          brand_name: string
          product_image?: string | null
          testimonial_script?: string | null
          gesture_guide?: string | null
          customer_name: string
          customer_email?: string | null
          customer_whatsapp?: string | null
          status?: CampaignStatus
          invite_sent_at?: string | null
          invite_method?: InviteMethod | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          brand_name?: string
          product_image?: string | null
          testimonial_script?: string | null
          gesture_guide?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_whatsapp?: string | null
          status?: CampaignStatus
          invite_sent_at?: string | null
          invite_method?: InviteMethod | null
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          campaign_id: string
          video_url: string
          thumbnail_url: string | null
          duration: number | null
          file_size: number | null
          cloudinary_id: string | null
          recorded_at: string
          device_info: string | null
          status: TestimonialStatus
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          video_url: string
          thumbnail_url?: string | null
          duration?: number | null
          file_size?: number | null
          cloudinary_id?: string | null
          recorded_at?: string
          device_info?: string | null
          status?: TestimonialStatus
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          video_url?: string
          thumbnail_url?: string | null
          duration?: number | null
          file_size?: number | null
          cloudinary_id?: string | null
          recorded_at?: string
          device_info?: string | null
          status?: TestimonialStatus
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          image: string | null
          published: boolean
          published_at: string | null
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          image?: string | null
          published?: boolean
          published_at?: string | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          image?: string | null
          published?: boolean
          published_at?: string | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      seo_settings: {
        Row: {
          id: string
          page_name: string
          title: string | null
          description: string | null
          keywords: string | null
          og_image: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          page_name: string
          title?: string | null
          description?: string | null
          keywords?: string | null
          og_image?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          page_name?: string
          title?: string | null
          description?: string | null
          keywords?: string | null
          og_image?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      landing_content: {
        Row: {
          id: string
          section_name: string
          content: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          section_name: string
          content?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          section_name?: string
          content?: Json
          updated_by?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type SeoSettings = Database['public']['Tables']['seo_settings']['Row']
export type LandingContent = Database['public']['Tables']['landing_content']['Row']
