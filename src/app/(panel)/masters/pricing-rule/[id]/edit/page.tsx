import { PricingRuleEdit } from "@/components/pricing-rule/pricing-rule-edit"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PricingRuleEditPage({ params }: Props) {
  const { id } = await params
  return <PricingRuleEdit id={id} />
}
