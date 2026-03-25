import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CMSNavbarMenus() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Navbar</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage navigation links and mega menus
                    </p>
                </div>
                <Button
                // onClick={() => setIsAddDrawerOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Nav Link
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {/* <NavbarTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
            onManageMegaMenu={openMegaMenuManager}
          /> */}
                </CardContent>
            </Card>
        </div>
    );
}