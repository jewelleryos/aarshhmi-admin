import { CouponEdit } from "@/components/coupons/coupon-edit"

interface Props {
  params: Promise<{ id: string }>
}

export default async function CouponEditPage({ params }: Props) {
  const { id } = await params
  return <CouponEdit id={id} />
}
