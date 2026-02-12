import { EditOptionsContent } from "@/components/products/edit-options"

interface EditOptionsPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOptionsPage({ params }: EditOptionsPageProps) {
  const { id } = await params
  return <EditOptionsContent productId={id} />
}
