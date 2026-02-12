"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  MoreHorizontal,
  Eye,
  ShoppingCart,
  Edit,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Checkbox } from "@/components/ui/checkbox"

const stats = [
  {
    title: "Total Revenue",
    value: "$245,890",
    change: "+18.2%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Products",
    value: "128",
    change: "+12",
    trend: "up",
    icon: Package,
  },
  {
    title: "Total Customers",
    value: "3,847",
    change: "+342",
    trend: "up",
    icon: Users,
  },
  {
    title: "Orders",
    value: "98",
    change: "+15",
    trend: "up",
    icon: ShoppingCart,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    product: "Diamond Necklace",
    customer: "Rajesh Patel",
    email: "rajesh@example.com",
    amount: "$2,450",
    status: "completed",
  },
  {
    id: "ORD-002",
    product: "Gold Bracelet",
    customer: "Priya Sharma",
    email: "priya@example.com",
    amount: "$890",
    status: "processing",
  },
  {
    id: "ORD-003",
    product: "Pearl Earrings",
    customer: "Amit Kumar",
    email: "amit@example.com",
    amount: "$340",
    status: "pending",
  },
  {
    id: "ORD-004",
    product: "Silver Ring Set",
    customer: "Neha Singh",
    email: "neha@example.com",
    amount: "$450",
    status: "completed",
  },
  {
    id: "ORD-005",
    product: "Emerald Pendant",
    customer: "Vikram Mehta",
    email: "vikram@example.com",
    amount: "$1,890",
    status: "processing",
  },
]

const topProducts = [
  {
    name: "Diamond Necklace",
    orders: 47,
    revenue: "$89,400",
  },
  {
    name: "Gold Bracelet",
    orders: 86,
    revenue: "$67,200",
  },
  {
    name: "Pearl Earrings",
    orders: 124,
    revenue: "$52,100",
  },
  {
    name: "Silver Ring Set",
    orders: 93,
    revenue: "$41,800",
  },
]

const statusColors = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

// Dummy users data for table demo
interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: "active" | "inactive" | "pending"
  joinedAt: string
  lastLogin: string
}

const dummyUsers: User[] = [
  {
    id: "usr_001",
    name: "Rajesh Patel",
    email: "rajesh.patel@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    role: "Admin",
    status: "active",
    joinedAt: "2024-01-15",
    lastLogin: "2025-01-21",
  },
  {
    id: "usr_002",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    role: "Manager",
    status: "active",
    joinedAt: "2024-02-20",
    lastLogin: "2025-01-20",
  },
  {
    id: "usr_003",
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    role: "Editor",
    status: "inactive",
    joinedAt: "2024-03-10",
    lastLogin: "2025-01-15",
  },
  {
    id: "usr_004",
    name: "Neha Singh",
    email: "neha.singh@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    role: "Viewer",
    status: "pending",
    joinedAt: "2024-04-05",
    lastLogin: "2025-01-18",
  },
  {
    id: "usr_005",
    name: "Vikram Mehta",
    email: "vikram.mehta@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    role: "Admin",
    status: "active",
    joinedAt: "2024-05-12",
    lastLogin: "2025-01-21",
  },
  {
    id: "usr_006",
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    role: "Manager",
    status: "active",
    joinedAt: "2024-06-18",
    lastLogin: "2025-01-19",
  },
  {
    id: "usr_007",
    name: "Rohit Gupta",
    email: "rohit.gupta@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
    role: "Editor",
    status: "active",
    joinedAt: "2024-07-22",
    lastLogin: "2025-01-20",
  },
  {
    id: "usr_008",
    name: "Kavita Joshi",
    email: "kavita.joshi@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    role: "Viewer",
    status: "inactive",
    joinedAt: "2024-08-30",
    lastLogin: "2025-01-10",
  },
  {
    id: "usr_009",
    name: "Sanjay Verma",
    email: "sanjay.verma@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay",
    role: "Manager",
    status: "active",
    joinedAt: "2024-09-05",
    lastLogin: "2025-01-21",
  },
  {
    id: "usr_010",
    name: "Deepika Nair",
    email: "deepika.nair@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepika",
    role: "Admin",
    status: "active",
    joinedAt: "2024-10-12",
    lastLogin: "2025-01-20",
  },
  {
    id: "usr_011",
    name: "Arjun Iyer",
    email: "arjun.iyer@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    role: "Editor",
    status: "pending",
    joinedAt: "2024-11-08",
    lastLogin: "2025-01-17",
  },
  {
    id: "usr_012",
    name: "Meera Kapoor",
    email: "meera.kapoor@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    role: "Viewer",
    status: "active",
    joinedAt: "2024-12-01",
    lastLogin: "2025-01-19",
  },
]

const userStatusColors = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

// Table columns definition
const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" sortable />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    size: 280,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" sortable />
    ),
    cell: ({ row }) => <span>{row.getValue("role")}</span>,
    size: 120,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof userStatusColors
      return (
        <Badge variant="outline" className={userStatusColors[status]}>
          {status}
        </Badge>
      )
    },
    size: 100,
  },
  {
    accessorKey: "joinedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" sortable />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("joinedAt"))
      return <span>{date.toLocaleDateString()}</span>
    },
    size: 120,
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"))
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
    },
    size: 120,
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 80,
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here{"'"}s an overview of your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Download Report</Button>
          <Button className="bg-primary text-primary-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-emerald-500 text-sm" : "text-red-500 text-sm"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-sm">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={order.product} />
                      <AvatarFallback>
                        {order.product
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{order.product}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-flex font-medium text-sm">
                      {order.amount}
                    </span>
                    <Badge variant="outline" className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>By revenue this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-6 text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {product.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.orders} orders</p>
                  </div>
                  <div className="text-sm font-semibold text-primary">{product.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Package className="h-5 w-5" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Users className="h-5 w-5" />
              <span>View Customers</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <ShoppingCart className="h-5 w-5" />
              <span>Manage Orders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-5 w-5" />
              <span>Run Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table Demo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users Management</CardTitle>
            <CardDescription>
              Manage your team members and their permissions
            </CardDescription>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Users className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={dummyUsers}
            searchKey="name"
            searchPlaceholder="Search users..."
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
