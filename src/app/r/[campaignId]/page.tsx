import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RecordingFlow from "./RecordingFlow"

export default async function RecordingPage({ 
  params 
}: { 
  params: Promise<{ campaignId: string }> 
}) {
  const { campaignId } = await params
  
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { business: true }
  })

  if (!campaign) notFound()

  return (
    <RecordingFlow 
      campaign={{
        id: campaign.id,
        title: campaign.title,
        brandName: campaign.brandName,
        testimonialScript: campaign.testimonialScript,
        gestureGuide: campaign.gestureGuide,
        customerName: campaign.customerName,
        productImage: campaign.productImage,
        business: {
          name: campaign.business.name,
          logo: campaign.business.logo
        }
      }}
    />
  )
}
