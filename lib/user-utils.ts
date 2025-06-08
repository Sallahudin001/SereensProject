import { clerkClient } from '@clerk/nextjs/server'

/**
 * Fetch user name from Clerk using clerk_id
 */
export async function getUserNameFromClerk(clerkId: string): Promise<string> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(clerkId)
    
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ')
    
    return fullName || 'Unknown User'
  } catch (error) {
    console.error(`Error fetching user name for clerk_id ${clerkId}:`, error)
    return 'Unknown User'
  }
}

/**
 * Fetch user email from Clerk using clerk_id
 */
export async function getUserEmailFromClerk(clerkId: string): Promise<string> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(clerkId)
    
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)
    return primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || 'no-email@example.com'
  } catch (error) {
    console.error(`Error fetching user email for clerk_id ${clerkId}:`, error)
    return 'no-email@example.com'
  }
}

/**
 * Fetch multiple user names from Clerk using clerk_ids
 */
export async function getUserNamesFromClerk(clerkIds: string[]): Promise<Record<string, string>> {
  const userNames: Record<string, string> = {}
  
  try {
    const clerk = await clerkClient()
    
    // Fetch all users in parallel
    const userPromises = clerkIds.map(async (clerkId) => {
      try {
        const user = await clerk.users.getUser(clerkId)
        const firstName = user.firstName || ''
        const lastName = user.lastName || ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        
        return { clerkId, name: fullName || 'Unknown User' }
      } catch (error: any) {
        // Only log non-404 errors (404 means user was deleted from Clerk)
        if (error?.status !== 404) {
          console.error(`Error fetching user name for clerk_id ${clerkId}:`, error)
        } else {
          console.warn(`User not found in Clerk: ${clerkId} (likely deleted)`)
        }
        return { clerkId, name: 'Unknown User' }
      }
    })
    
    const userResults = await Promise.all(userPromises)
    
    userResults.forEach(({ clerkId, name }) => {
      userNames[clerkId] = name
    })
    
    return userNames
  } catch (error) {
    console.error('Error fetching user names from Clerk:', error)
    // Return empty object with fallback names
    const fallbackNames: Record<string, string> = {}
    clerkIds.forEach(clerkId => {
      fallbackNames[clerkId] = 'Unknown User'
    })
    return fallbackNames
  }
}

/**
 * Fetch user details (name and email) from Clerk using clerk_ids
 */
export async function getUserDetailsFromClerk(clerkIds: string[]): Promise<Record<string, { name: string; email: string }>> {
  const userDetails: Record<string, { name: string; email: string }> = {}
  
  try {
    const clerk = await clerkClient()
    
    // Fetch all users in parallel
    const userPromises = clerkIds.map(async (clerkId) => {
      try {
        const user = await clerk.users.getUser(clerkId)
        const firstName = user.firstName || ''
        const lastName = user.lastName || ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)
        const email = primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || 'no-email@example.com'
        
        return { 
          clerkId, 
          details: { 
            name: fullName || 'Unknown User',
            email
          }
        }
      } catch (error: any) {
        // Only log non-404 errors (404 means user was deleted from Clerk)
        if (error?.status !== 404) {
          console.error(`Error fetching user details for clerk_id ${clerkId}:`, error)
        } else {
          console.warn(`User not found in Clerk: ${clerkId} (likely deleted)`)
        }
        return { 
          clerkId, 
          details: { 
            name: 'Unknown User',
            email: 'no-email@example.com'
          }
        }
      }
    })
    
    const userResults = await Promise.all(userPromises)
    
    userResults.forEach(({ clerkId, details }) => {
      userDetails[clerkId] = details
    })
    
    return userDetails
  } catch (error) {
    console.error('Error fetching user details from Clerk:', error)
    // Return empty object with fallback details
    const fallbackDetails: Record<string, { name: string; email: string }> = {}
    clerkIds.forEach(clerkId => {
      fallbackDetails[clerkId] = {
        name: 'Unknown User',
        email: 'no-email@example.com'
      }
    })
    return fallbackDetails
  }
}

/**
 * Format user role for display
 */
export function formatUserRole(role?: string): string {
  if (!role) return 'User'
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrator'
    case 'manager':
      return 'Manager'
    case 'sales_rep':
    case 'rep':
      return 'Sales Representative'
    case 'support':
      return 'Support'
    default:
      return role.charAt(0).toUpperCase() + role.slice(1)
  }
}

/**
 * Get user role from Clerk metadata
 */
export async function getUserRoleFromClerk(clerkId: string): Promise<string> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(clerkId)
    
    return user.publicMetadata?.role as string || 'user'
  } catch (error) {
    console.error(`Error fetching user role for clerk_id ${clerkId}:`, error)
    return 'user'
  }
} 