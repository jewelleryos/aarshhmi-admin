"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Loader2, MoreVertical, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import usersService, { type UserData } from "@/redux/services/usersService"
import { UserViewDrawer } from "./user-view-drawer"
import { UserAddDrawer } from "./user-add-drawer"
import { UserEditDrawer } from "./user-edit-drawer"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { toast } from "sonner"

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Action handlers interface
interface ActionHandlers {
  onView: (user: UserData) => void
  onEdit: (user: UserData) => void
  onDelete: (user: UserData) => void
  canEdit: boolean
  canDelete: boolean
}

// Create columns with action handlers
function createColumns({ onView, onEdit, onDelete, canEdit, canDelete }: ActionHandlers): ColumnDef<UserData>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" sortable />
      ),
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div>
            <p className="font-medium text-sm">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )
      },
      size: 280,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phone = row.original.phone
        return <span className="text-sm">{phone || "-"}</span>
      },
      size: 150,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.original.is_active
        return (
          <Badge
            variant="outline"
            className={isActive ? statusColors.active : statusColors.inactive}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: "last_login_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Login" sortable />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.last_login_at)}
          </span>
        )
      },
      size: 130,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" sortable />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        )
      },
      size: 130,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ]
}

export function UsersContent() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Drawer state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.USER.CREATE)
  const canEdit = has(PERMISSIONS.USER.UPDATE)
  const canDelete = has(PERMISSIONS.USER.DELETE)

  // Handle view action
  const handleView = (user: UserData) => {
    setSelectedUser(user)
    setIsViewDrawerOpen(true)
  }

  // Handle edit action (only if user has permission)
  const handleEdit = (user: UserData) => {
    if (!canEdit) return
    setSelectedUser(user)
    setIsEditDrawerOpen(true)
  }

  // Handle delete action (only if user has permission)
  const handleDelete = (user: UserData) => {
    if (!canDelete) return
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      const response = await usersService.delete(selectedUser.id)
      toast.success(response.message)
      fetchUsers()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
      throw err // Re-throw to keep dialog open on error
    }
  }

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => createColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete, canEdit, canDelete }),
    [canEdit, canDelete]
  )

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await usersService.getList()
      setUsers(response.data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage admin users and their permissions
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={users}
                searchKey="name"
                searchPlaceholder="Search users..."
                showPagination={false}
                maxHeight="500px"
              />
              {/* <div className="mt-4 ml-3 text-sm text-muted-foreground">
                {users.length} user{users.length !== 1 ? "s" : ""} total
              </div> */}
            </>
          )}
        </CardContent>
      </Card>

      {/* User View Drawer */}
      <UserViewDrawer
        user={selectedUser}
        open={isViewDrawerOpen}
        onOpenChange={setIsViewDrawerOpen}
      />

      {/* User Add Drawer */}
      <UserAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSuccess={fetchUsers}
      />

      {/* User Edit Drawer */}
      {canEdit && (
        <UserEditDrawer
          user={selectedUser}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          onSuccess={fetchUsers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && selectedUser && (
        <DeleteDialogWithDelay
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete User"
          description={`Are you sure you want to delete ${selectedUser.first_name} ${selectedUser.last_name}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
