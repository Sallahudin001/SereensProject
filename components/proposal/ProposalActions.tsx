'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { 
  Download, 
  FileText, 
  ExternalLink, 
  MoreVertical, 
  Eye, 
  Send,
  Signature,
  Copy,
  Loader2
} from 'lucide-react'

interface ProposalActionsProps {
  proposalId: string
  proposalNumber?: string
  status?: string
  onStatusUpdate?: (newStatus: string) => void
  showSignatureButton?: boolean
  isCustomerView?: boolean
  selectedAddons?: Record<string, any[]>
}

export default function ProposalActions({ 
  proposalId, 
  proposalNumber,
  status,
  onStatusUpdate,
  showSignatureButton = false,
  isCustomerView = false,
  selectedAddons = {}
}: ProposalActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePDFDownload = async (includeSigningLink = false) => {
    setLoading('pdf')
    try {
      const params = new URLSearchParams({
        download: 'true',
        ...(includeSigningLink && { signature: 'true' })
      })

      // Add selected addons if any exist
      if (Object.keys(selectedAddons).length > 0) {
        const hasSelectedAddons = Object.values(selectedAddons).some(serviceAddons => 
          serviceAddons.some(addon => addon.selected)
        )
        if (hasSelectedAddons) {
          params.set('addons', encodeURIComponent(JSON.stringify(selectedAddons)))
        }
      }
      
      const response = await fetch(`/api/proposals/${proposalId}/pdf?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `proposal-${proposalNumber || proposalId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    } finally {
      setLoading(null)
    }
  }

  const handlePDFPreview = async (includeSigningLink = false) => {
    setLoading('preview')
    try {
      const params = new URLSearchParams({
        ...(includeSigningLink && { signature: 'true' })
      })

      // Add selected addons if any exist
      if (Object.keys(selectedAddons).length > 0) {
        const hasSelectedAddons = Object.values(selectedAddons).some(serviceAddons => 
          serviceAddons.some(addon => addon.selected)
        )
        if (hasSelectedAddons) {
          params.set('addons', encodeURIComponent(JSON.stringify(selectedAddons)))
        }
      }
      
      const url = `/api/proposals/${proposalId}/pdf?${params}`
      window.open(url, '_blank')
      
      toast.success('PDF opened in new tab')
    } catch (error) {
      console.error('Error opening PDF:', error)
      toast.error('Failed to open PDF')
    } finally {
      setLoading(null)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/proposals/view/${proposalId}`
      await navigator.clipboard.writeText(url)
      toast.success('Proposal link copied to clipboard')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleSendProposal = async () => {
    setLoading('send')
    try {
      const response = await fetch(`/api/proposals/${proposalId}/send`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to send proposal')
      }

      toast.success('Proposal sent successfully')
      onStatusUpdate?.('sent')
    } catch (error) {
      console.error('Error sending proposal:', error)
      toast.error('Failed to send proposal')
    } finally {
      setLoading(null)
    }
  }

  const handleSignature = () => {
    // This would integrate with DocuSign or similar e-signature service
    toast.info('Signature functionality coming soon')
  }

  // Customer view - simplified actions
  if (isCustomerView) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => handlePDFDownload()}
          disabled={loading === 'pdf'}
          className="bg-green-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          {loading === 'pdf' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
        
        <Button
          onClick={() => handlePDFPreview()}
          disabled={loading === 'preview'}
          className="bg-green-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          {loading === 'preview' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview PDF
        </Button>

        {showSignatureButton && (
          <Button
            onClick={handleSignature}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Signature className="h-4 w-4 mr-2" />
            Sign Proposal
          </Button>
        )}
      </div>
    )
  }

  // Admin/sales view - full actions
  return (
    <div className="flex gap-2">
      {/* Primary actions */}
      <Button
        onClick={() => handlePDFDownload()}
        disabled={loading === 'pdf'}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        size="sm"
      >
        {loading === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download PDF
      </Button>

      {status === 'draft' || status === 'ready_to_send' ? (
        <Button
          onClick={handleSendProposal}
          disabled={loading === 'send'}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {loading === 'send' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Proposal
        </Button>
      ) : null}

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Proposal Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handlePDFPreview()}>
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handlePDFDownload(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Download with Signature Link
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handlePDFPreview(true)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview with Signature Link
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Proposal Link
          </DropdownMenuItem>
          
          {showSignatureButton && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignature}>
                <Signature className="h-4 w-4 mr-2" />
                Request Signature
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 