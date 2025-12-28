"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function ContentSection() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* First Text Block */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black">
            Why Video Testimonials Matter for Your Business
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            In marketing theory, video testimonials are a powerful form of social proof. 
            Unlike static text reviews, video brings authenticity, emotion, and human connection. 
            Modern consumers don&apos;t just want product features—they want real stories. Research shows 
            that testimonials can increase conversion credibility, win even personal trust, and shift skeptical 
            viewers into believers. Video testimonials are the digital equivalent of word-of-mouth marketing 
            on steroids—they turn satisfied customers into powerful advocates and help position your brand 
            beyond what traditional PR can accomplish while simultaneously building trust that no amount of 
            advertising can create alone. The visual storytelling allows viewers to see genuine emotion and 
            conviction, making the testimonials far more persuasive in influencing purchase decisions and 
            strengthening brand trust effortlessly.
          </p>
        </motion.div>

        {/* Logo Divider */}
        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Image 
            src="/logo.svg" 
            alt="vidiofficial logo" 
            width={96}
            height={96}
            className="w-20 h-20 md:w-24 md:h-24 object-contain opacity-50"
          />
        </motion.div>

        {/* Second Text Block */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-black">
            How vidiofficialid Helps Grow Your Business
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Vidiofficialid makes it easy for small businesses to collect authentic video testimonials 
            from happy customers via a link. Whether you need a compelling credibility asset, want to 
            engage buyers using a &quot;customer first&quot; narrative, or aim to present genuine human 
            testimonials that marketing materials cannot replicate, our platform is designed for you. 
            Just set a link, let your customers share their experiences powerfully, and watch as 
            those powerful clips turn into loyal customers. Even if customers can record their 
            testimonials easily directly through their device, businesses receive those invaluable 
            messages instantly. What vidiofficialid solves: It eliminates the technical complexity and 
            cost of traditional video production, allowing even businesses without any video skills, 
            designers, or extensive budgets to harness viral storytelling. You save time and resources 
            while building lasting assets that fuel growth beyond the typical reach of ordinary 
            advertising, delivering a competitive edge effortlessly without the cost and effort of 
            traditional video production.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
