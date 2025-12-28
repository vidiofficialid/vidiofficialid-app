"use client"

import Link from "next/link"
import { Settings, Send, Check } from "lucide-react"
import { motion } from "framer-motion"

const processSteps = [
  {
    icon: Settings,
    title: "Set Up",
    description: "Create your campaign in moments. Customize the message to your customers and set up the video collection page. No technical skills required—vidiofficialid makes the whole process simple, so you're ready to start collecting powerful stories about your business."
  },
  {
    icon: Send,
    title: "Send",
    description: "Send out a link or embed a widget. Whether it's via email, social media, or even your existing website, share the invitation with customers you trust. Customers can quickly record testimonials directly through their smartphone or computer—all without needing to download any special apps."
  },
  {
    icon: Check,
    title: "Get",
    description: "Receive testimonials automatically. As your satisfied customers record their heartfelt messages, those authentic video stories appear in your dashboard instantly. Review, approve, and use them anywhere—on your website, social media channels, or in marketing materials—to build trust and drive growth."
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function ProcessSection() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Process Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {processSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div 
                key={index}
                className="text-center"
                variants={itemVariants}
              >
                {/* Icon Circle */}
                <div className="flex justify-center mb-6">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FDC435] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-black" strokeWidth={1.5} />
                  </motion.div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold mb-4 text-black">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href="/register">
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-gray-800 transition-colors">
              Start for Free
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
