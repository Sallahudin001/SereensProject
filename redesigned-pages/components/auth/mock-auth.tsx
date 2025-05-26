"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

// Mock authentication state
let mockIsSignedIn = false

// Mock hook for auth state
export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(mockIsSignedIn)

  return {
    isSignedIn,
    setIsSignedIn: (value: boolean) => {
      mockIsSignedIn = value
      setIsSignedIn(value)
    },
  }
}

// Mock SignInButton component
export function SignInButton({ children, mode }: { children: React.ReactNode; mode?: string }) {
  const [open, setOpen] = useState(false)
  const { setIsSignedIn } = useAuth()

  const handleSignIn = () => {
    setIsSignedIn(true)
    setOpen(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>Enter your credentials to access your account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSignIn} className="w-full">
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Mock SignUpButton component
export function SignUpButton({ children, mode }: { children: React.ReactNode; mode?: string }) {
  const [open, setOpen] = useState(false)
  const { setIsSignedIn } = useAuth()

  const handleSignUp = () => {
    setIsSignedIn(true)
    setOpen(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>Fill in your details to create a new account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Smith" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSignUp} className="w-full">
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Mock SignOutButton component
export function SignOutButton({ children }: { children: React.ReactNode }) {
  const { setIsSignedIn } = useAuth()

  const handleSignOut = () => {
    setIsSignedIn(false)
  }

  return <div onClick={handleSignOut}>{children}</div>
}

// Mock UserButton component
export function UserButton({ afterSignOutUrl }: { afterSignOutUrl?: string }) {
  const { setIsSignedIn } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    setIsSignedIn(false)
    if (afterSignOutUrl) {
      router.push(afterSignOutUrl)
    }
  }

  return (
    <Avatar>
      <AvatarImage src="https://avatar.vercel.sh/user" />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  )
}

// Mock SignedIn component
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return null

  return <>{children}</>
}

// Mock SignedOut component
export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  if (isSignedIn) return null

  return <>{children}</>
}
