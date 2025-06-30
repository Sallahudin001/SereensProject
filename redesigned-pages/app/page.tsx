"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  FileText,
  Users,
  CheckCircle,
  Zap,
  Shield,
  ChevronDown,
  Star,
  ArrowUpRight,
  Play,
} from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
  useAuth,
} from "@/components/auth/mock-auth"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const testimonials = [
  {
    quote:
      "This tool has completely transformed how we create proposals. We've seen a 40% increase in our close rate since implementing it.",
    author: "Sarah Johnson",
    role: "Sales Director, Apex Roofing",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
  },
  {
    quote:
      "The automated scope descriptions and payment calculator have saved us countless hours. Our customers love the professional look of our proposals.",
    author: "Michael Chen",
    role: "Owner, Chen Home Improvements",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
  },
  {
    quote:
      "The multi-service bundling feature has helped us increase our average sale value by 25%. This tool pays for itself many times over.",
    author: "Jessica Williams",
    role: "Sales Manager, Williams HVAC",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 4,
  },
]

export default function LandingPage() {
  const heroSection = useScrollAnimation({ threshold: 0.1 })
  const featuresSection = useScrollAnimation()
  const featuresList = useScrollAnimation()
  const streamlineSection = useScrollAnimation()
  const listItems = useScrollAnimation()
  const testimonialsSection = useScrollAnimation()
  const ctaSection = useScrollAnimation()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  
  // Parallax effect for hero section
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard")
    }
    
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSignedIn, router])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isHeaderScrolled && "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/20 dark:border-slate-700/20 shadow-sm"
      )}>
        <div className="container mx-auto px-4 sm:px-6 py-4 md:py-5 flex justify-between items-center">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-lg overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-40 sm:w-48">
                  <Image 
                    src="/evergreenlogo.svg" 
                    alt="Evergreen Energy Upgrades" 
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            <motion.a 
              href="#features" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#testimonials" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Testimonials
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Pricing
            </motion.a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button 
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Resources <ChevronDown className="h-4 w-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  <span>Video Tutorials</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Community</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-white/50 hover:text-gray-900 transition-colors px-3 md:px-4"
                >
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="text-sm font-medium bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-sm transition-all px-3 md:px-4 whitespace-nowrap"
                >
                  Register
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 md:h-10 w-8 md:w-10 rounded-full p-0">
                    <UserButton afterSignOutUrl="/" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem>
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24">
        <section ref={heroRef as any} className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[70%] bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
          </div>
          
          <motion.div 
            className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.div
              ref={heroSection.ref as any}
              initial="hidden"
              animate={heroSection.isInView ? "visible" : "hidden"}
              variants={fadeIn}
              className="max-w-4xl mx-auto space-y-6 md:space-y-8 text-center"
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-sm font-medium mb-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Streamline your sales process
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                  Proposals Made{" "}
                </span>
                <span className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-500">Easy</span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-green-500/30 dark:text-green-500/50"
                    viewBox="0 0 100 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                  >
                    <path
                      d="M0,3 C30,9 70,0 100,5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              </h1>
              
              <motion.p 
                className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Generate detailed sales quotes for roofing, HVAC, windows & doors, garage doors, and paint services with
                our all-in-one proposal tool.
              </motion.p>
              
              <motion.div 
                className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="text-base md:text-lg px-6 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto group"
                    >
                      Get Started{" "}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base md:text-lg px-6 py-6 border-slate-300 hover:bg-slate-100 transition-all duration-300 rounded-xl w-full sm:w-auto"
                    >
                      See Demo
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="text-base md:text-lg px-6 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto group"
                    >
                      Go to Dashboard{" "}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </SignedIn>
              </motion.div>
              
              <motion.div
                className="flex items-center justify-center gap-2 mt-8 text-sm text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt={`User ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span>Trusted by 2,000+ contractors</span>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={heroSection.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16 md:mt-24 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                <img
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Proposal Tool Dashboard"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                  <Button className="bg-white/90 hover:bg-white text-slate-900 shadow-lg">
                    <Play className="mr-2 h-4 w-4" /> Watch Demo
                  </Button>
                </div>
              </div>
              
              {/* Browser UI elements */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-sm flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="ml-4 h-5 w-64 bg-white/50 dark:bg-slate-800/50 rounded-full text-xs flex items-center justify-center text-slate-500 dark:text-slate-400">
                  evergreen-energy.app/dashboard
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 left-[5%] w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-sm animate-float-slow" />
          <div className="absolute bottom-1/3 right-[10%] w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-sm animate-float" />
          <div className="absolute top-1/2 right-[5%] w-8 h-8 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-sm animate-float-slow" />
        </section>

        <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-blue-200/10 dark:bg-blue-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-emerald-200/10 dark:bg-emerald-900/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <motion.div
              ref={featuresSection.ref as any}
              initial="hidden"
              animate={featuresSection.isInView ? "visible" : "hidden"}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Powerful Features
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                Everything You Need
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Our comprehensive toolkit helps you create professional proposals, track customer engagement, and close
                more deals.
              </p>
            </motion.div>

            <motion.div
              ref={featuresList.ref as any}
              initial="hidden"
              animate={featuresList.isInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: FileText,
                  title: "Smart Proposals",
                  description:
                    "Create comprehensive proposals with auto-generated scope notes and smart upsell prompts.",
                  color: "from-blue-500 to-indigo-600",
                  iconBg: "bg-blue-100 dark:bg-blue-900/30",
                  iconColor: "text-blue-600 dark:text-blue-400",
                },
                {
                  icon: BarChart3,
                  title: "Payment Calculator",
                  description: "Real-time monthly payment estimates that update as products are added to the proposal.",
                  color: "from-emerald-500 to-teal-600",
                  iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
                  iconColor: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  icon: Users,
                  title: "Client Management",
                  description:
                    "Easily manage customer information and access proposal history from a central dashboard.",
                  color: "from-amber-500 to-orange-600",
                  iconBg: "bg-amber-100 dark:bg-amber-900/30",
                  iconColor: "text-amber-600 dark:text-amber-400",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={featureVariants}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-2 w-full bg-gradient-to-r" style={{ 
                    backgroundImage: `linear-gradient(to right, var(--${feature.color.split(' ')[0].replace('from-', '')}) , var(--${feature.color.split(' ')[1].replace('to-', '')}))` 
                  }}></div>
                  
                  <div className="p-6 md:p-8">
                    <div className={`${feature.iconBg} p-3 rounded-xl w-fit mb-6 ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ 
                      backgroundImage: `linear-gradient(to right, var(--${feature.color.split(' ')[0].replace('from-', '')}) , var(--${feature.color.split(' ')[1].replace('to-', '')}))` 
                    }}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                    
                    <div className="mt-6 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ 
                      color: `var(--${feature.color.split(' ')[0].replace('from-', '')})` 
                    }}>
                      <span>Learn more</span>
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-emerald-200/10 dark:bg-emerald-900/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <motion.div
                ref={streamlineSection.ref as any}
                initial="hidden"
                animate={streamlineSection.isInView ? "visible" : "hidden"}
                variants={fadeIn}
                className="md:w-1/2"
              >
                <motion.div 
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 text-sm font-medium mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Boost Your Sales
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                  Streamline Your Sales Process
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                  Our proposal generator helps your sales team create professional, detailed quotes in minutes instead
                  of hours. With built-in upsell prompts and combo discounts, you'll close more deals and increase your
                  average sale value.
                </p>
                
                <motion.ul
                  ref={listItems.ref as any}
                  initial="hidden"
                  animate={listItems.isInView ? "visible" : "hidden"}
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {[
                    "Multi-service proposals with smart bundling",
                    "E-signature and deposit collection",
                    "Mobile-friendly customer view",
                    "Automated scope descriptions",
                    "Real-time payment calculations",
                  ].map((item, i) => (
                    <motion.li key={i} variants={featureVariants} className="flex items-start">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1 rounded-full mr-3 mt-1 text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="mt-10">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 group">
                        Start Free Trial <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 group">
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={streamlineSection.isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="md:w-1/2"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div className="h-8 flex-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-400 dark:text-slate-500 flex items-center px-3">
                      evergreen-energy.app
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg?height=360&width=640"
                        alt="Proposal Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <motion.div
                        className="h-8 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4 overflow-hidden"
                        initial={{ width: "0%" }}
                        animate={streamlineSection.isInView ? { width: "75%" } : { width: "0%" }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 animate-pulse-slow" />
                      </motion.div>
                      <motion.div
                        className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full overflow-hidden"
                        initial={{ width: "0%" }}
                        animate={streamlineSection.isInView ? { width: "100%" } : { width: "0%" }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-emerald-500/5 to-teal-500/5 animate-pulse-slow" />
                      </motion.div>
                      <motion.div
                        className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-5/6 overflow-hidden"
                        initial={{ width: "0%" }}
                        animate={streamlineSection.isInView ? { width: "83.333%" } : { width: "0%" }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-emerald-500/5 to-teal-500/5 animate-pulse-slow" />
                      </motion.div>
                      <motion.div
                        className="h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-md w-1/3 mt-4"
                        initial={{ width: "0%" }}
                        animate={streamlineSection.isInView ? { width: "33.333%" } : { width: "0%" }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-green-200/10 dark:bg-green-900/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <motion.div
              ref={testimonialsSection.ref as any}
              initial="hidden"
              animate={testimonialsSection.isInView ? "visible" : "hidden"}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Customer Success Stories
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                What Our Customers Say
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Don't just take our word for it. See how Evergreen Energy Upgrades has helped contractors across the country grow their businesses.
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900/80 p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                          <img 
                            src={testimonials[activeTestimonial].avatar || "/placeholder.svg"} 
                            alt={testimonials[activeTestimonial].author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white p-1 rounded-full">
                            <Star className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonials[activeTestimonial].rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} 
                            fill={i < testimonials[activeTestimonial].rating ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                      
                      <blockquote className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 mb-6 relative">
                        <span className="absolute -top-6 -left-2 text-6xl text-green-200 dark:text-green-800 opacity-50">"</span>
                        {testimonials[activeTestimonial].quote}
                        <span className="absolute -bottom-10 -right-2 text-6xl text-green-200 dark:text-green-800 opacity-50">"</span>
                      </blockquote>
                      
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{testimonials[activeTestimonial].author}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{testimonials[activeTestimonial].role}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex justify-center mt-8 gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeTestimonial 
                          ? 'bg-green-500 w-8' 
                          : 'bg-slate-300 dark:bg-slate-600 hover:bg-green-300 dark:hover:bg-green-700'
                      }`}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-green-200/10 dark:bg-green-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-blue-200/10 dark:bg-blue-900/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
            <motion.div
              ref={ctaSection.ref as any}
              initial="hidden"
              animate={ctaSection.isInView ? "visible" : "hidden"}
              variants={scaleUp}
              className="max-w-3xl mx-auto"
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Ready to Get Started?
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                Join thousands of contractors growing their business
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
                Start creating professional proposals today and see how our tool can transform your sales process.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="text-base px-8 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto group"
                    >
                      Start Free Trial <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base px-8 py-6 border-slate-300 hover:bg-slate-100 transition-all duration-300 rounded-xl w-full sm:w-auto"
                    >
                      Learn More
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="text-base px-8 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto group"
                    >
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
              
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-emerald-500 opacity-30" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center md:items-start">
              <div className="mb-4 relative h-12 w-48">
                <Image 
                  src="/evergreenlogo.svg" 
                  alt="Evergreen Energy Upgrades" 
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-slate-400 text-sm max-w-md text-center md:text-left">
                Professional proposal generation tool for home improvement contractors.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
              <div>
                <h3 className="font-medium text-lg mb-4 text-white">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Features</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Pricing</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Testimonials</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>FAQ</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4 text-white">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>About</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Blog</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Careers</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Contact</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1">
                <h3 className="font-medium text-lg mb-4 text-white">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Privacy Policy</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Terms of Service</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group">
                      <span>Cookie Policy</span>
                      <ArrowRight className="ml-1 h-3 w-0 transition-all duration-300 group-hover:w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors group">
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors group">
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </div>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors group">
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
