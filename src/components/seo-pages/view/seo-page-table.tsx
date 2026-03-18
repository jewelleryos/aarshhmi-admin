"use client";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PERMISSIONS } from "@/configs";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { toast } from "sonner";
import { SeoPageEditDrawer } from "../edit/seo-page-drawer";
import { SEOListItem } from "@/redux/services/seoService";
import { fetchSeoPages } from "@/redux/slices/seoSlice";

interface ActionHandlers {
    onUpdate: (seoPage: SEOListItem) => void
    canUpdate: boolean
}

function createColumns({
    onUpdate,
    canUpdate,
}: ActionHandlers): ColumnDef<SEOListItem>[] {
    return [
        {
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <DataTableColumnHeader column={column} title="Page Name" />
            ),
            size: 120,
        },
        {
            accessorKey: "slug",
            header: ({ column }: { column: any }) => (
                <DataTableColumnHeader column={column} title="Page Slug" />
            ),
            cell: ({ row }: { row: any }) => (
                <div className="font-medium">{String(row.getValue("slug"))}</div>
            ),
            size: 250,
        },
        canUpdate ? {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: any }) => {
                const seoPage = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onUpdate(seoPage)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 80,
        } : null,
    ].filter(Boolean) as any
}

export default function SeoPageTable() {
    const { has } = usePermissions()
    const canUpdate = has(PERMISSIONS.SEO_PAGES.UPDATE)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [selectedPage, setSelectedPage] = useState<SEOListItem | null>(null)

    const dispatch = useAppDispatch()
    const { pages } = useAppSelector((state) => state.seo)

    const loadPages = async () => {
        try {
            await dispatch(fetchSeoPages()).unwrap()
        } catch (err: any) {
            toast.error(err || "Failed to fetch SEO pages")
        }
    }

    useEffect(() => {
        loadPages()
    }, [])

    const handleUpdate = (seoPage: SEOListItem) => {
        setSelectedPage(seoPage)
        setIsEditDrawerOpen(true)
    }

    const columns = useMemo(
        () =>
            createColumns({
                onUpdate: handleUpdate,
                canUpdate
            }),
        [canUpdate]
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={pages}
                        searchKey="name"
                        searchPlaceholder="Search pages..."
                        showPagination={true}
                        maxHeight="400px"
                    />
                </CardContent>
            </Card>
            {canUpdate && (
                <SeoPageEditDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    data={selectedPage as any}
                    onSuccess={loadPages}
                />
            )}
        </div>
    )
}