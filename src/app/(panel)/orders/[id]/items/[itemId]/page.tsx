import { SuborderDetailView } from "@/components/orders/suborder-detail-view"

interface SuborderDetailPageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default async function SuborderDetailPage({ params }: SuborderDetailPageProps) {
  const { id, itemId } = await params
  return <SuborderDetailView orderId={id} itemId={itemId} />
}
