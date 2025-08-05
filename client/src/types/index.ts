export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  icon_url?: string;
  category_id?: number;
  user_id: number;
  is_favorite: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  tags?: string[] | Tag[];
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  bookmark_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  bookmark_count?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface SearchFilters {
  category?: string;
  search?: string;
  tag?: string;
  favorite?: boolean;
}

export interface CreateBookmarkData {
  title: string;
  url: string;
  description?: string;
  category_id?: number;
  tags?: string[];
  icon_url?: string;
}