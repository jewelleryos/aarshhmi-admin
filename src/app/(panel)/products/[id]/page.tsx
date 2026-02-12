import { ProductView } from "@/components/products/product-view"

interface ProductViewPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductViewPage({ params }: ProductViewPageProps) {
  const { id } = await params
  return <ProductView productId={id} />
}
