import apiService from '@/configs/axios'

export type BlogStatus = 'draft' | 'published'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  status: boolean
  created_at: string
  updated_at: string
}

export interface BlogAuthor {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  status: boolean
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  feature_image_url: string | null
  feature_image_alt: string | null
  category_id: string | null
  author_id: string | null
  status: BlogStatus
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  category_name: string | null
  category_slug: string | null
  author_name: string | null
  author_avatar_url: string | null
}

export interface CreateBlogRequest {
  title: string
  slug: string
  excerpt?: string
  content?: string
  feature_image_url?: string
  feature_image_alt?: string
  category_id?: string | null
  author_id?: string | null
  status?: BlogStatus
  published_at?: string | null
  meta_title?: string
  meta_description?: string
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {}

const blogService = {
  // Blog Posts
  async listBlogs() {
    return apiService.get<{ success: boolean; data: { items: Blog[]; total: number } }>('/api/blogs')
  },
  async getBlog(id: string) {
    return apiService.get<{ success: boolean; data: Blog }>(`/api/blogs/${id}`)
  },
  async createBlog(data: CreateBlogRequest) {
    return apiService.post<{ success: boolean; message: string; data: Blog }>('/api/blogs', data)
  },
  async updateBlog(id: string, data: UpdateBlogRequest) {
    return apiService.put<{ success: boolean; message: string; data: Blog }>(`/api/blogs/${id}`, data)
  },
  async deleteBlog(id: string) {
    return apiService.delete<{ success: boolean; message: string }>(`/api/blogs/${id}`)
  },

  // Blog Categories
  async listCategories() {
    return apiService.get<{ success: boolean; data: { items: BlogCategory[] } }>('/api/blog-categories')
  },
  async createCategory(data: { name: string; slug: string; description?: string; status?: boolean }) {
    return apiService.post<{ success: boolean; message: string; data: BlogCategory }>('/api/blog-categories', data)
  },
  async updateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; status: boolean }>) {
    return apiService.put<{ success: boolean; message: string; data: BlogCategory }>(`/api/blog-categories/${id}`, data)
  },
  async deleteCategory(id: string) {
    return apiService.delete<{ success: boolean; message: string }>(`/api/blog-categories/${id}`)
  },

  // Blog Authors
  async listAuthors() {
    return apiService.get<{ success: boolean; data: { items: BlogAuthor[] } }>('/api/blog-authors')
  },
  async createAuthor(data: { name: string; bio?: string; avatar_url?: string; status?: boolean }) {
    return apiService.post<{ success: boolean; message: string; data: BlogAuthor }>('/api/blog-authors', data)
  },
  async updateAuthor(id: string, data: Partial<{ name: string; bio: string; avatar_url: string; status: boolean }>) {
    return apiService.put<{ success: boolean; message: string; data: BlogAuthor }>(`/api/blog-authors/${id}`, data)
  },
  async deleteAuthor(id: string) {
    return apiService.delete<{ success: boolean; message: string }>(`/api/blog-authors/${id}`)
  },
}

export default blogService
