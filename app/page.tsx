"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, FileText, Home, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  SignOutButton, 
  UserButton,
  ClerkProvider,
  useAuth,
} from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  const heroSection = useScrollAnimation({ threshold: 0.1 })
  const featuresSection = useScrollAnimation()
  const featuresList = useScrollAnimation()
  const streamlineSection = useScrollAnimation()
  const listItems = useScrollAnimation()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-10 bg-green-600 shadow-sm">
        <div className="flex justify-between items-center px-4 py-2">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <div className="p-1 rounded-lg">
                  <Image 
                    src="/newlogo.png" 
                    alt="Evergreen Energy Upgrades Logo" 
                    width={100}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <span className="text-xl font-semibold text-white ml-3 hidden sm:inline-block">EverGreen Energy Proposals</span>
              </div>
            </Link>
          </motion.div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-white hover:bg-white/20 hover:text-white transition-colors">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="text-sm font-medium bg-white text-emerald-600 hover:bg-white/90 hover:text-emerald-700 transition-colors whitespace-nowrap">
                  Register
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2 hidden sm:flex items-center gap-2 border-white/30 text-white hover:bg-white/20 hover:text-white"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9 overflow-hidden">
                    <UserButton afterSignOutUrl="/" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="flex items-center gap-3 p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">My Account</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <SignOutButton>
                    <DropdownMenuItem>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-100 to-slate-200">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center max-w-full">
            <motion.div
              ref={heroSection.ref}
              initial="hidden"
              animate={heroSection.isInView ? "visible" : "hidden"}
              variants={fadeIn}
              className="max-w-5xl mx-auto space-y-6 md:space-y-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-gray-800">Proposals Made Easy</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto px-4">
                Generate detailed sales quotes for roofing, HVAC, windows & doors, garage doors, and paint services with
                our all-in-one proposal tool.
              </p>
              <div className="mt-8 md:mt-10">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="text-base md:text-lg px-6 py-4 md:px-8 md:py-5 bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 transition-all duration-300 shadow-md">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="text-base md:text-lg px-6 py-4 md:px-8 md:py-5 bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 transition-all duration-300 shadow-md">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              ref={featuresSection.ref}
              initial="hidden"
              animate={featuresSection.isInView ? "visible" : "hidden"}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-800">Key Features</h2>
            </motion.div>

            <motion.div
              ref={featuresList.ref}
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
                },
                {
                  icon: BarChart3,
                  title: "Payment Calculator",
                  description: "Real-time monthly payment estimates that update as products are added to the proposal.",
                },
                {
                  icon: Users,
                  title: "Client Management",
                  description:
                    "Easily manage customer information and access proposal history from a central dashboard.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={featureVariants}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 transition-all"
                >
                  <div className="bg-emerald-100 p-3 rounded-full w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-gray-100 to-slate-200">
          <div className="container mx-auto px-4 max-w-7xl">
            <Card className="shadow-xl rounded-xl overflow-hidden bg-white">
              <div className="flex flex-col md:flex-row items-center">
                <motion.div
                  ref={streamlineSection.ref}
                  initial="hidden"
                  animate={streamlineSection.isInView ? "visible" : "hidden"}
                  variants={fadeIn}
                  className="md:w-1/2 p-6 md:p-8"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-3xl font-bold mb-6 text-gray-800">Streamline Your Sales Process</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-600 mb-6">
                      Our proposal generator helps your sales team create professional, detailed quotes in minutes instead
                      of hours. With built-in upsell prompts and combo discounts, you'll close more deals and increase your
                      average sale value.
                    </p>
                    <motion.ul
                      ref={listItems.ref}
                      initial="hidden"
                      animate={listItems.isInView ? "visible" : "hidden"}
                      variants={staggerContainer}
                      className="space-y-3"
                    >
                      {[
                        "Multi-service proposals with smart bundling",
                        "E-signature and deposit collection",
                        "Mobile-friendly customer view",
                        "Automated scope descriptions",
                        "Real-time payment calculations",
                      ].map((item, i) => (
                        <motion.li key={i} variants={featureVariants} className="flex items-start">
                          <div className="bg-emerald-600 p-1 rounded-full mr-3 mt-1">
                            <ArrowRight className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </CardContent>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={streamlineSection.isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="md:w-1/2 p-6 md:p-8"
                >
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">Proposal Preview</span>
                  </div>
                  <div className="space-y-3">
                    <motion.div
                      className="h-6 bg-gray-100 rounded w-3/4"
                      initial={{ width: "0%" }}
                      animate={streamlineSection.isInView ? { width: "75%" } : { width: "0%" }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    ></motion.div>
                    <motion.div
                      className="h-4 bg-gray-100 rounded w-full"
                      initial={{ width: "0%" }}
                      animate={streamlineSection.isInView ? { width: "100%" } : { width: "0%" }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    ></motion.div>
                    <motion.div
                      className="h-4 bg-gray-100 rounded w-5/6"
                      initial={{ width: "0%" }}
                      animate={streamlineSection.isInView ? { width: "83.333%" } : { width: "0%" }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                    ></motion.div>
                    <motion.div
                      className="h-10 bg-emerald-100 rounded w-1/3 mt-4"
                      initial={{ width: "0%" }}
                      animate={streamlineSection.isInView ? { width: "33.333%" } : { width: "0%" }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    ></motion.div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-300 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
            <div className="mb-6 sm:mb-0">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm p-2 w-[120px]">
                <Image 
                  src="/newlogo.png" 
                  alt="Evergreen Energy Upgrades Logo" 
                  width={120}
                  height={48}
                  className="h-auto w-full"
                />
              </div>
            </div>
            <div className="text-sm text-center sm:text-right">
              <p className="font-semibold text-lg text-white mb-1">Evergreen Energy Upgrades</p>
              <p>C: (408) 826-7377 | O: (408)333-9831</p>
              <p>sereen@evergreenenergy.io | info@evergreenenergy.io</p>
              <p>www.evergreenenergy.io</p>
              <p className="mt-3 text-xs text-gray-400">&copy; {new Date().getFullYear()} Evergreen Energy Upgrades. All Rights Reserved.</p>
              <div className="flex justify-center sm:justify-end gap-4 mt-2">
                <a href="#" className="hover:text-white transition-colors text-sm">Privacy</a>
                <a href="#" className="hover:text-white transition-colors text-sm">Terms</a>
                <a href="#" className="hover:text-white transition-colors text-sm">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
