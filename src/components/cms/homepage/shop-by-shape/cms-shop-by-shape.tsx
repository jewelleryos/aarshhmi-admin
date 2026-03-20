import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CMSShopByShape() {
    return (
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shop by Shape</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage shop by shape section
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Shape
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
        </CardContent>
      </Card>
    </div>
    )
}
