# Bunny.net Storage API Research

## Overview

Bunny.net Edge Storage provides hot object storage with global replication. It integrates with Bunny CDN for fast content delivery.

## Authentication

- **Header**: `AccessKey`
- **Credential**: Storage zone password (NOT the global bunny.net API key)
- **Location**: Found in FTP & API Access page of your storage zone

## Regional Endpoints

| Region | Endpoint |
|--------|----------|
| Frankfurt, DE | storage.bunnycdn.com |
| London, UK | uk.storage.bunnycdn.com |
| New York, US | ny.storage.bunnycdn.com |
| Los Angeles, US | la.storage.bunnycdn.com |
| Singapore, SG | sg.storage.bunnycdn.com |
| Stockholm, SE | se.storage.bunnycdn.com |
| São Paulo, BR | br.storage.bunnycdn.com |
| Johannesburg, SA | jh.storage.bunnycdn.com |
| Sydney, AU | syd.storage.bunnycdn.com |

---

## Feature Analysis

### 1. Rename Folder/File

| Feature | Supported | Notes |
|---------|-----------|-------|
| Native Rename | **NO** | Not supported due to file synchronization limitations |
| Workaround | **YES** | Copy to new name + Delete old file |

**Implementation**: Must download file, re-upload with new name, then delete original.

---

### 2. Move Files

| Feature | Supported | Notes |
|---------|-----------|-------|
| Native Move | **NO** | No direct API endpoint |
| Workaround | **YES** | Copy to destination + Delete from source |

**Implementation**: Download from source, upload to destination, delete source file.

---

### 3. Copy Files

| Feature | Supported | Notes |
|---------|-----------|-------|
| Native Copy | **NO** | No direct API endpoint |
| Workaround | **YES** | Download + Upload to new location |

**Implementation**: Download file content, upload to new path.

---

### 4. Download Folder (as ZIP)

| Feature | Supported | Notes |
|---------|-----------|-------|
| DownloadZip | **YES** | Undocumented but functional endpoint |

**Endpoint**: `POST /{storageZoneName}/`

**Request Body**:
```json
{
  "RootPath": "/storage-zone-name/",
  "Paths": [
    "/storage-zone-name/folder-to-download/"
  ]
}
```

**Important**:
- RootPath and Paths MUST have leading AND trailing slashes
- Missing slashes in RootPath = 400 error
- Missing slashes in Paths = 200 with empty ZIP
- May timeout for large directories

---

### 5. Create New Folder

| Feature | Supported | Notes |
|---------|-----------|-------|
| Create Folder | **YES** | Upload a file with folder path auto-creates folders |

**Implementation**: Upload any file to `/storage-zone/new-folder/file.txt` - folders are created automatically.

**Alternative**: Some libraries have `createFolder()` method.

---

### 6. Delete Folder

| Feature | Supported | Notes |
|---------|-----------|-------|
| Delete Folder | **YES** | Deletes folder and ALL contents recursively |

**Endpoint**: `DELETE /{storageZoneName}/{path}/`

**Warning**: This is recursive - all files and subfolders will be deleted!

---

### 7. Search Files

| Feature | Supported | Notes |
|---------|-----------|-------|
| Server-side Search | **NO** | No search API endpoint |
| Client-side Search | **YES** | List all files, filter locally |

**Implementation**:
1. Use List Files API to get all files in directory
2. Filter results on frontend/backend based on filename

---

### 8. Multi-Select Operations

| Feature | Supported | Notes |
|---------|-----------|-------|
| Bulk Select API | **NO** | No native bulk operation support |
| Client-side Multi-select | **YES** | UI feature, process individually |

**Implementation**:
- UI tracks selected items
- Operations are performed one-by-one via API
- Can use Promise.all() for parallel execution

---

### 9. Multi-Select Delete

| Feature | Supported | Notes |
|---------|-----------|-------|
| Bulk Delete API | **NO** | No single endpoint for multiple deletes |
| Sequential Delete | **YES** | Loop through selected items |

**Implementation**:
```typescript
// Delete multiple files
const deleteMultiple = async (files: string[]) => {
  await Promise.all(files.map(file => deleteFile(file)))
}
```

---

## Official API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List Files | GET | `/{storageZoneName}/{path}/` |
| Download File | GET | `/{storageZoneName}/{path}/{fileName}` |
| Upload File | PUT | `/{storageZoneName}/{path}/{fileName}` |
| Delete File/Folder | DELETE | `/{storageZoneName}/{path}/{fileName}` |
| Download ZIP | POST | `/{storageZoneName}/` (undocumented) |

---

## Summary Table

| Feature | Native Support | Workaround Available |
|---------|----------------|---------------------|
| Rename | NO | YES (copy + delete) |
| Move | NO | YES (copy + delete) |
| Copy | NO | YES (download + upload) |
| Download Folder (ZIP) | YES | - |
| Create Folder | YES | - |
| Delete Folder | YES | - |
| Search | NO | YES (client-side filter) |
| Multi-select | NO | YES (UI-based) |
| Bulk Delete | NO | YES (loop delete) |

---

## Sources

- [Storage API Documentation](https://docs.bunny.net/reference/storage-api)
- [BunnyCDN PHP API](https://github.com/cp6/BunnyCDN-API)
- [BunnyNet-PHP Library](https://toshy.github.io/BunnyNet-PHP/edge-storage-api/)
- [Bunny.net Support Hub](https://support.bunny.net/)

---

## UI Planning (Based on Screenshots)

### Page Layout

**Header Section:**
- Title: "Media Manager"
- Subtitle: "Manage your media files and folders"
- Action Buttons (right side):
  - Refresh (outline)
  - New Folder (outline)
  - Upload Files (primary/filled)

**Breadcrumb Navigation:**
- Shows current path: `Root > Products > Rings`
- Each segment is clickable for navigation
- Home icon for Root

---

### Content Area

**Toolbar:**
- Search input: "Search files..."
- View toggle: Grid | List (icon buttons)

---

### Grid View

**Folder Card:**
- Folder icon with background
- Folder name below
- 3-dot menu on hover (top-right corner)

**File Card:**
- Thumbnail preview (image files show actual preview)
- Video files show video icon
- Document files show document icon
- File name below (truncated if long)
- File size below name (e.g., "43.9 KB", "2.4 MB")

---

### List View

**Table Columns:**
| Column | Description |
|--------|-------------|
| Name | Icon/thumbnail + filename |
| Type | Badge (folder, image, video) |
| Size | File size (folders show "-") |
| Modified | Date (YYYY-MM-DD format) |
| Actions | 3-dot menu |

---

### Multi-Select Mode

**When items are selected, toolbar shows:**
- Selection count: "1 item(s) selected"
- Bulk actions:
  - Download
  - Move
  - Copy
  - Delete (destructive)
  - Clear Selection

**Selection indicator:**
- Checkmark icon appears on selected items (left side in list view)

---

### Individual File Actions (3-dot menu)

| Action | Icon | Description |
|--------|------|-------------|
| Preview | Eye | Open file preview |
| Rename | Edit/Pencil | Rename file |
| Copy URL | Copy | Copy CDN URL to clipboard |
| Download | Download | Download file |
| Delete | Trash | Delete file |

---

### File Type Icons

| Type | Icon/Display |
|------|--------------|
| Folder | Folder icon |
| Image | Thumbnail preview |
| Video | Video camera icon |
| Document | Document/file icon |

---

### States to Handle

1. **Loading state** - Show skeleton/spinner
2. **Empty folder** - Show empty state message
3. **Error state** - Show error message with retry
4. **Upload progress** - Show upload progress indicator
5. **Multi-select mode** - Show bulk action toolbar

---

### Folder Structure Example

```
Root/
├── Products/
│   ├── Rings/
│   │   ├── diamond-ring-1.jpg
│   │   ├── diamond-ring-2.jpg
│   │   ├── gold-ring-1.jpg
│   │   └── product-video.mp4
│   ├── Necklaces/
│   │   ├── pearl-necklace-1.jpg
│   │   └── gold-chain.jpg
│   ├── Earrings/
│   └── Bracelets/
├── Collections/
├── Banners/
├── Documents/
├── logo.png
└── brand-guidelines.pdf
```
