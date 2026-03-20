import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CMSMuse() {
    return (
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Muse</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage muse section
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Muse
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
