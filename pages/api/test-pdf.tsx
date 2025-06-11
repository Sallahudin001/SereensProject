import { NextApiRequest, NextApiResponse } from 'next'
import { renderToBuffer } from '@react-pdf/renderer'
import ProposalPDF from '@/components/pdf/ProposalPDF'

// Mock data for testing PDF generation
const mockProposal = {
  id: 'test-123',
  proposalNumber: 'TEST-001',
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '555-123-4567',
    address: '123 Test Street, Test City, TS 12345'
  },
  services: ['windows-doors', 'hvac', 'roofing', 'paint'],
  serviceNames: ['Windows & Doors', 'HVAC', 'Roofing', 'Paint'],
  products: {
    'windows-doors': {
      windowType: 'double-hung',
      windowColor: 'white',
      windowCount: '10',
      windowPrice: '5000',
      scopeNotes: 'Premium energy efficient windows'
    },
    'hvac': {
      systemType: 'central-air',
      seerRating: '16',
      tonnage: '3',
      systemCost: '8000',
      addons: ['uv-filter', 'humidifier'],
      addonPrices: {
        'uv-filter': '500',
        'humidifier': '700'
      },
      scopeNotes: 'High efficiency AC system'
    },
    'roofing': {
      material: 'asphalt-shingles',
      squareCount: '25',
      totalPrice: '10000',
      scopeNotes: 'Complete roof replacement'
    },
    'paint': {
      totalPrice: '3500',
      scopeNotes: 'Exterior painting with premium paint'
    }
  },
  pricing: {
    subtotal: 27700,
    discount: 2000,
    total: 25700,
    monthlyPayment: 428.33,
    showLineItems: true,
    financingTerm: 60,
    interestRate: 5.99,
    financingPlanId: 'plan-123',
    financingPlanName: 'EcoSmart Financing',
    paymentFactor: 1.667
  },
  appliedDiscounts: [
    {
      type: 'special_offer',
      name: 'Summer Special',
      description: 'Limited time summer discount',
      amount: 1000,
      category: 'seasonal'
    }
  ],
  customAdders: [
    {
      id: 1,
      description: 'Premium Installation Package',
      product_category: 'windows-doors',
      cost: 1200
    }
  ],
  customerDiscounts: [
    {
      type: 'senior',
      name: 'Senior Discount',
      amount: 1000,
      category: 'Customer'
    }
  ],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Mock bundle rules for testing
const mockBundleRules = [
  {
    id: 1,
    name: 'Complete Home Bundle',
    description: 'Complete home upgrade! 8% off when you bundle four services.',
    discount_type: 'fixed_amount',
    discount_value: 2000,
    bonus_message: 'You saved $2,000 by bundling services!'
  }
]

// Mock selected addons for testing
const mockSelectedAddons = {
  'hvac': [
    {
      id: 'premium-thermostat',
      name: 'Smart Thermostat',
      description: 'Control your temperature and save energy with a smart thermostat.',
      price: 350,
      monthly_impact: 5.83,
      selected: true
    }
  ],
  'paint': [
    {
      id: 'premium-paint',
      name: 'Premium Paint Upgrade',
      description: 'Higher quality paint with vibrant colors and longer warranty.',
      price: 800,
      monthly_impact: 13.33,
      selected: true
    }
  ]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Generate the PDF with mock data
    const pdfBuffer = await renderToBuffer(
      <ProposalPDF 
        proposal={mockProposal} 
        includeSigningLink={req.query.signature === 'true'}
        selectedAddons={mockSelectedAddons}
        bundleRules={mockBundleRules}
      />
    )

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length)
    
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="test-proposal.pdf"`)
    } else {
      res.setHeader('Content-Disposition', 'inline')
    }

    res.status(200).send(pdfBuffer)
  } catch (error) {
    console.error('Error generating test PDF:', error)
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message })
  }
} 