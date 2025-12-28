import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./SettingsForm"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          businesses: true,
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  // Get stats
  const campaignsCount = await prisma.campaign.count({
    where: {
      business: {
        userId: session.user.id
      }
    }
  })

  const testimonialsCount = await prisma.testimonial.count({
    where: {
      campaign: {
        business: {
          userId: session.user.id
        }
      }
    }
  })

  const stats = {
    businesses: user._count.businesses,
    campaigns: campaignsCount,
    testimonials: testimonialsCount
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>
      
      <SettingsForm 
        user={{
          id: user.id,
          name: user.name || "",
          email: user.email,
          avatar: user.avatar || "",
          createdAt: user.createdAt.toISOString()
        }}
        stats={stats}
      />
    </div>
  )
}
