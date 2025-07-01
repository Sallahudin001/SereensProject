"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  FileText,
  Home,
  Users,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  Play,
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function LandingPage() {
  const heroSection = useScrollAnimation({ threshold: 0.1 })
  const featuresSection = useScrollAnimation()
  const statsSection = useScrollAnimation()
  const streamlineSection = useScrollAnimation()
  const ctaSection = useScrollAnimation()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])
  
  useEffect(() => {
    if (isSignedIn) {
      // Use replace instead of push for faster navigation
      router.replace("/dashboard")
    }
  }, [isSignedIn, router])

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen overflow-hidden">
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="border-b border-green-200/50 sticky top-0 z-50 bg-gradient-to-r from-green-100/95 to-emerald-100/95 backdrop-blur-xl shadow-lg shadow-emerald-500/5"
      >
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
              <div className="flex items-center">
          <div
                className="p-3 rounded-xl bg-transparent shadow-lg"
              >
                  <Image 
                    src="/sereenh-04.png" 
                    alt="Evergreen Home Upgrades Logo" 
                    width={200}
                    height={150}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="ml-4 hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Evergreen Home Proposals
                </span>
                <div className="text-xs text-emerald-600 font-medium">Professional Sales Tools</div>
                </div>
              </div>
            </Link>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
                >
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hidden sm:flex items-center gap-2 transition-all duration-300 bg-transparent"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
                    <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Animated Background */}
          <motion.div
            style={{ y: backgroundY }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30"
          />

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-20 blur-xl"
            />
            <motion.div
              animate={{
                y: [0, 30, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full opacity-15 blur-2xl"
            />
            <motion.div
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 4,
              }}
              className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-10 blur-xl"
            />
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="text-center max-w-6xl mx-auto">
            <motion.div
              ref={heroSection.ref}
              initial="hidden"
              animate={heroSection.isInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="space-y-12"
              >
                <motion.div variants={fadeInUp} className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >

                  </motion.div>

                  <motion.h1
                    variants={fadeInUp}
                    className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] text-gray-900"
                  >
                    Proposals Made{" "}
                    <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text text-transparent relative">
                      Easy
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full opacity-30"
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={fadeInUp}
                    className="text-xl md:text-2xl lg:text-3xl text-gray-600 leading-relaxed max-w-5xl mx-auto font-light"
                  >
                    Transform your sales process with AI-powered proposals for{" "}
                    <span className="font-semibold text-emerald-600">roofing, HVAC, windows & doors</span>, and more.
                    Close deals faster with professional quotes that convert.
                  </motion.p>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <SignedOut>
                  <SignUpButton mode="modal">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          className="text-xl px-12 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 rounded-xl font-semibold"
                        >
                          Get Started
                          <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                      </motion.div>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          className="text-xl px-12 py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 rounded-xl font-semibold"
                        >
                          Go to Dashboard
                          <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                      </motion.div>
                  </Link>
                </SignedIn>
                </motion.div>

                <motion.div variants={fadeInUp} className="pt-12 flex flex-col items-center space-y-6">
                  <p className="text-lg text-gray-500 font-medium">
                    Trusted by home improvement professionals nationwide
                  </p>

                  {/* Stats Row */}
                
            </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              ref={featuresSection.ref}
              initial="hidden"
              animate={featuresSection.isInView ? "visible" : "hidden"}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-6 py-3 mb-8 text-sm font-semibold border-0 shadow-lg">
                <Target className="w-4 h-4 mr-2" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  Close More Deals
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Streamline your sales process with AI-powered tools designed specifically for home improvement
                professionals.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={featuresSection.isInView ? "visible" : "hidden"}
              className="grid lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: FileText,
                  title: "AI-Powered Proposals",
                  description:
                    "Generate comprehensive proposals with intelligent scope notes, smart upsell suggestions, and professional formatting.",
                  features: ["Auto-generated content", "Smart bundling", "Custom branding", "Professional templates"],
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-50 to-blue-100",
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Calculator",
                  description:
                    "Dynamic payment estimates that update instantly as products are added, with multiple financing options.",
                  features: ["Live calculations", "Multiple financing", "Tax calculations", "Discount management"],
                  gradient: "from-emerald-500 to-emerald-600",
                  bgGradient: "from-emerald-50 to-emerald-100",
                },
                {
                  icon: Users,
                  title: "Customer Hub",
                  description:
                    "Centralized customer management with proposal history, communication logs, and automated follow-ups.",
                  features: ["Customer database", "Proposal history", "Communication logs", "Follow-up automation"],
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInScale}
                  whileHover={{
                    y: -10,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-8 relative">
                      {/* Background Gradient */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.bgGradient} rounded-full opacity-10 transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700`}
                      />

                      <div
                        className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl w-fit mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                        {feature.title}
                      </h3>

                      <p className="text-gray-600 mb-8 leading-relaxed text-lg">{feature.description}</p>

                      <ul className="space-y-4">
                        {feature.features.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                            className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                          >
                            <div className="bg-emerald-100 p-1 rounded-full mr-4">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                            <span className="font-medium">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Sample Proposal Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23059669' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div initial="hidden" animate="visible" variants={slideInLeft} className="space-y-10">
                <div className="space-y-8">
                  

                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                    See It In{" "}
                    <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      Action
                    </span>
                  </h2>

                  <p className="text-xl text-gray-600 leading-relaxed">
                    Experience how our AI-powered proposal tool creates professional, detailed quotes that convert
                    prospects into customers. This interactive preview shows exactly what your customers will see.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: FileText, text: "Professional formatting with your branding", color: "bg-blue-500" },
                    { icon: BarChart3, text: "Real-time pricing with payment options", color: "bg-emerald-500" },
                    { icon: CheckCircle, text: "One-click acceptance and e-signatures", color: "bg-green-500" },
                    { icon: Shield, text: "Secure payment processing integration", color: "bg-purple-500" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="flex items-center gap-6 group"
                    >
                      <div
                        className={`${item.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-lg text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                 
                </motion.div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={slideInRight} className="relative">
                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-20 blur-xl z-0"
                />

                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />

                  <CardContent className="p-10">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Sample Proposal</h3>
                        <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-4 py-2 font-semibold">
                          Live Preview
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">Premium Roofing Package</p>
                              <p className="text-emerald-700 font-medium">Architectural shingles + gutters</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 text-xl">$18,500</p>
                            <p className="text-sm text-emerald-600">25-year warranty</p>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">HVAC System Upgrade</p>
                              <p className="text-blue-700 font-medium">High-efficiency unit + installation</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-xl">$12,300</p>
                            <p className="text-sm text-blue-600">10-year warranty</p>
                          </div>
                        </motion.div>

                        <div className="border-t-2 border-gray-100 pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-lg">Subtotal:</span>
                              <span className="text-2xl font-bold text-gray-800">$30,800</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-lg">Tax (8.5%):</span>
                              <span className="text-xl font-semibold text-gray-700">$2,618</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-4">
                              <span className="text-gray-800 text-xl font-semibold">Total Project:</span>
                              <span className="text-3xl font-bold text-gray-900">$33,418</span>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl">
                              <div className="flex justify-between items-center">
                                <span className="text-emerald-700 font-semibold">Monthly Payment:</span>
                                <span className="text-2xl font-bold text-emerald-600">$289/mo</span>
                              </div>
                              <p className="text-sm text-emerald-600 mt-1">120 months @ 6.99% APR</p>
                            </div>
                          </div>
                        </div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Accept Proposal
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enhanced Streamline Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                ref={streamlineSection.ref}
                initial="hidden"
                animate={streamlineSection.isInView ? "visible" : "hidden"}
                variants={slideInLeft}
                className="space-y-10"
              >
                <div className="space-y-8">
                  <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-6 py-3 text-sm font-semibold border-0 shadow-lg">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Sales Process
                  </Badge>

                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Streamline Your{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                      Sales Process
                    </span>
                  </h2>

                  <p className="text-xl text-gray-600 leading-relaxed">
                    Transform your sales workflow with intelligent automation. Create professional proposals in minutes,
                    not hours, and watch your close rate soar with data-driven insights.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: Zap, text: "Multi-service proposals with smart bundling", color: "bg-yellow-500" },
                    { icon: Shield, text: "E-signature and secure deposit collection", color: "bg-green-500" },
                    { icon: Globe, text: "Mobile-optimized customer portal", color: "bg-blue-500" },
                    { icon: Clock, text: "Automated scope descriptions and pricing", color: "bg-purple-500" },
                    { icon: TrendingUp, text: "Real-time analytics and performance tracking", color: "bg-emerald-500" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={streamlineSection.isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="flex items-center gap-6 group"
                    >
                      <div
                        className={`${item.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-lg text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                        {item.text}
                      </span>
                </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={streamlineSection.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="pt-4"
                >
                  <SignedOut>
                    
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="text-lg px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl font-semibold group"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </SignedIn>
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate={streamlineSection.isInView ? "visible" : "hidden"}
                variants={slideInRight}
                className="relative"
              >
                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full opacity-20 blur-xl z-0"
                />

                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />

                  <CardContent className="p-10">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Dashboard Overview</h3>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                  </div>

                      <div className="grid grid-cols-2 gap-6">
                    <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center border border-emerald-200"
                        >
                          <div className="text-3xl font-bold text-emerald-600 mb-2">47</div>
                          <div className="text-sm text-emerald-700 font-semibold">Active Proposals</div>
                          <div className="text-xs text-emerald-600 mt-1">+12% this month</div>
                        </motion.div>

                    <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border border-purple-200"
                        >
                          <div className="text-3xl font-bold text-purple-600 mb-2">$2.1M</div>
                          <div className="text-sm text-purple-700 font-semibold">Pipeline Value</div>
                          <div className="text-xs text-purple-600 mt-1">+28% this month</div>
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-lg">Recent Activity</h4>

                        {[
                          {
                            name: "Johnson Residence",
                            service: "Roofing + HVAC",
                            status: "Pending",
                            value: "$33,400",
                            color: "emerald",
                            bgColor: "bg-emerald-500",
                          },
                          {
                            name: "Smith Property",
                            service: "Windows + Doors",
                            status: "Approved",
                            value: "$18,200",
                            color: "green",
                            bgColor: "bg-green-500",
                          },
                          {
                            name: "Davis Home",
                            service: "Paint + Siding",
                            status: "In Review",
                            value: "$12,800",
                            color: "blue",
                            bgColor: "bg-blue-500",
                          },
                        ].map((item, i) => (
                    <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border hover:shadow-md transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center shadow-md`}
                              >
                                <Home className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.service}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`bg-${item.color}-100 text-${item.color}-700 mb-1`}>
                                {item.status}
                              </Badge>
                              <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                  </div>
                </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              ref={ctaSection.ref}
              initial="hidden"
              animate={ctaSection.isInView ? "visible" : "hidden"}
              variants={fadeInUp}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Ready to Transform Your Sales Process?
              </h2>
              <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
                Join hundreds of contractors who've revolutionized their proposal process.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="text-lg px-8 py-4 bg-white text-emerald-600 hover:bg-gray-50">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-4 bg-white text-emerald-600 hover:bg-gray-50">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl bg-white shadow-lg"
                >
                <Image 
                  src="/sereenh-04.png" 
                  alt="Evergreen Home Upgrades Logo" 
                    width={100}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Evergreen Home Upgrades</h3>
                  <p className="text-emerald-400 text-sm font-medium">Powering home improvement sales</p>
                </div>
              </div>

              <p className="text-gray-400 max-w-md leading-relaxed">
                Empowering home improvement professionals with cutting-edge proposal tool..
                Transform your sales process and close more deals.
              </p>


            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h4 className="text-xl font-bold text-white">Get In Touch</h4>

              <div className="space-y-4">
                {[
                  { icon: Phone, text: "(408) 333-9831", href: "tel:+14083339831" },
                  { icon: Mail, text: "info@evergreenenergy.io", href: "mailto:info@evergreenenergy.io" },
                  { icon: Globe, text: "www.evergreenenergy.io", href: "https://www.evergreenenergy.io" },
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href={item.href}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 text-gray-300 hover:text-emerald-400 transition-all duration-300 group"
                  >
                    <div className="bg-emerald-600/20 p-3 rounded-xl group-hover:bg-emerald-600/30 transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-gray-800 mt-12 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 ">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Evergreen Home Upgrades. All Rights Reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
