"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import productService, { type ProductDetail } from "@/redux/services/productService"
import { JewelleryDefaultView } from "./views/jewellery-default-view"

interface ProductViewProps {
  productId: string
}

export function ProductView({ productId }: ProductViewProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await productService.getById(productId)
      setProduct(response.data)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to fetch product"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground text-lg">Product not found</p>
      </div>
    )
  }

  // Load view component based on product type
  switch (product.product_type) {
    case "JEWELLERY_DEFAULT":
      return <JewelleryDefaultView product={product} onProductUpdate={fetchProduct} />
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-muted-foreground text-lg">
            Unknown product type: {product.product_type}
          </p>
        </div>
      )
  }
}
