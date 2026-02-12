import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Media item interface - matches backend response
export interface MediaItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size: number
  contentType?: string
  url?: string
  lastModified: string
}

// List response
interface MediaListResponse {
  success: boolean
  message: string
  data: {
    path: string
    items: MediaItem[]
  }
}

// Upload response
interface MediaUploadResponse {
  success: boolean
  message: string
  data: {
    uploaded: Array<{ name: string; path: string; url: string; size: number }>
    failed: Array<{ name: string; error: string }>
  }
}

// Delete response
interface MediaDeleteResponse {
  success: boolean
  message: string
  data: {
    deleted: string[]
    failed: Array<{ path: string; error: string }>
  }
}

// Create folder response
interface MediaCreateFolderResponse {
  success: boolean
  message: string
  data: {
    path: string
  }
}

// Media service
const mediaService = {
  // List files and folders
  list: async (path: string = ''): Promise<MediaListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.MEDIA.LIST, {
      params: { path },
    })
    return response.data
  },

  // Upload files
  upload: async (path: string, files: File[]): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('path', path)
    files.forEach((file) => formData.append('files', file))

    const response = await apiService.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Create folder
  createFolder: async (path: string, name: string): Promise<MediaCreateFolderResponse> => {
    const response = await apiService.post(API_ENDPOINTS.MEDIA.CREATE_FOLDER, { path, name })
    return response.data
  },

  // Delete files
  deleteFiles: async (paths: string[]): Promise<MediaDeleteResponse> => {
    const response = await apiService.post(API_ENDPOINTS.MEDIA.DELETE_FILES, { paths })
    return response.data
  },

  // Delete folder
  deleteFolder: async (path: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.MEDIA.DELETE_FOLDER, {
      params: { path },
    })
    return response.data
  },

  // Download file - returns blob URL
  downloadFile: async (path: string, filename: string): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.MEDIA.DOWNLOAD_FILE, {
      params: { path },
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // Download folder as ZIP
  downloadFolder: async (path: string, folderName: string): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.MEDIA.DOWNLOAD_FOLDER, {
      params: { path },
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${folderName}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export default mediaService
