export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone?: string;
    avatar_path?: string;
    role: 'admin' | 'photographer' | 'editor' | 'client';
    bio?: string;
    is_active: boolean;
    studio_id?: number;
}

export interface Testimonial {
    id: number;
    client_name: string;
    client_role?: string;
    content: string;
    rating: number;
    photo_path?: string;
    is_featured: boolean;
}

export interface Studio {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo_path?: string;
    photographer_photo_path?: string;
    website?: string;
    email?: string;
    phone?: string;
    branding?: {
        primary_color?: string;
        secondary_color?: string;
        font?: string;
    };
    watermark_settings?: {
        path?: string;
        position?: string;
        opacity?: number;
    };
    hero_images?: string[];
    social_links?: {
        instagram?: string;
        facebook?: string;
    };
    availability_hours?: {
        [day: string]: { start: string; end: string; enabled: boolean };
    };
    timezone: string;
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: string;
    shoot_date?: string;
    location?: string;
    client?: User;
    galleries_count?: number;
}

export interface Gallery {
    id: number;
    project_id: number;
    studio_id: number;
    name: string;
    slug: string;
    description?: string;
    cover_photo_path?: string;
    status: 'draft' | 'published' | 'review' | 'approved' | 'archived';
    is_public: boolean;
    allow_downloads: boolean;
    allow_favorites: boolean;
    allow_comments: boolean;
    selection_limit?: number;
    photo_count: number;
    expires_at?: string;
    published_at?: string;
    project?: {
        id: number;
        name: string;
        type: string;
        client?: { id: number; name: string };
    };
    created_at: string;
    updated_at: string;
}

export interface Photo {
    id: number;
    gallery_id: number;
    filename: string;
    preview_url: string;
    thumb_url: string;
    original_url?: string;
    mime_type: string;
    file_size: number;
    width?: number;
    height?: number;
    exif_data?: {
        camera?: string;
        lens?: string;
        aperture?: number;
        shutter_speed?: string;
        iso?: number;
        focal_length?: number;
        date_taken?: string;
    };
    sort_order: number;
    rating?: number;
    color_label?: string;
    tags: string[];
    is_featured: boolean;
    favorites_count: number;
    comments_count: number;
    is_favorited: boolean;
    created_at: string;
}

export interface Comment {
    id: number;
    photo_id: number;
    user: {
        id: number;
        name: string;
        avatar_path?: string;
        role: string;
    };
    parent_id?: number;
    body: string;
    is_internal: boolean;
    is_resolved: boolean;
    resolved_at?: string;
    resolved_by?: { id: number; name: string };
    pin_position?: { x: number; y: number };
    replies?: Comment[];
    replies_count?: number;
    created_at: string;
    updated_at: string;
}

export interface GalleryProgress {
    total_photos: number;
    total_comments: number;
    resolved_comments: number;
    unresolved_comments: number;
    percent_resolved: number;
    total_favorites: number;
}

export interface SelectionProgress {
    selected: number;
    limit: number | null;
    percent: number;
    status: string;
    is_locked: boolean;
}

export interface FilterState {
    search: string;
    favorited: boolean;
    has_comments: boolean;
    unresolved_only: boolean;
    rating?: number;
    color_label?: string;
}

export interface Portfolio {
    id: number;
    title: string;
    slug: string;
    description?: string;
    cover_photo_path?: string;
    category: string;
    is_published: boolean;
    sort_order: number;
    portfolio_photos_count?: number;
    portfolio_photos?: PortfolioPhoto[];
}

export interface PortfolioPhoto {
    id: number;
    photo_path: string;
    display_path?: string;
    thumb_path?: string;
    caption?: string;
    sort_order: number;
}

export interface ClientProfile {
    id: number;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
    referral_source?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
