import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// GET - Fetch offers based on type and category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'special', 'bundle', 'lifestyle', 'all'
    const category = searchParams.get('category')
    const services = searchParams.get('services') // comma-separated list for bundle detection

    if (type === 'bundle' && services) {
      // Return applicable bundle rules for the given services
      const serviceArray = services.split(',').map(s => s.trim())
      
      const bundleQuery = `
        SELECT br.*, 
               ARRAY_LENGTH(br.required_services, 1) as required_count
        FROM bundle_rules br
        WHERE br.is_active = true
          AND br.required_services <@ $1::text[]
          AND ARRAY_LENGTH(br.required_services, 1) <= $2
        ORDER BY br.priority DESC, required_count DESC
      `
      
      const bundles = await executeQuery(bundleQuery, [serviceArray, serviceArray.length])
      return NextResponse.json(bundles)
    }

    if (type === 'lifestyle') {
      // Return lifestyle upsells for the given category
      const lifestyleQuery = category 
        ? `SELECT * FROM lifestyle_upsells WHERE category = $1 AND is_active = true ORDER BY display_order`
        : `SELECT * FROM lifestyle_upsells WHERE is_active = true ORDER BY display_order`
      
      const params = category ? [category] : []
      const lifestyle = await executeQuery(lifestyleQuery, params)
      return NextResponse.json(lifestyle)
    }

    if (type === 'special') {
      // Return special offers
      const specialQuery = category
        ? `SELECT * FROM special_offers WHERE category = $1 AND is_active = true ORDER BY created_at DESC`
        : `SELECT * FROM special_offers WHERE is_active = true ORDER BY created_at DESC`
      
      const params = category ? [category] : []
      const special = await executeQuery(specialQuery, params)
      return NextResponse.json(special)
    }

    // Return all offers
    const [special, bundles, lifestyle] = await Promise.all([
      executeQuery(`SELECT *, 'special' as type FROM special_offers WHERE is_active = true`),
      executeQuery(`SELECT *, 'bundle' as type FROM bundle_rules WHERE is_active = true`),
      executeQuery(`SELECT *, 'lifestyle' as type FROM lifestyle_upsells WHERE is_active = true`)
    ])

    return NextResponse.json({
      special,
      bundles,
      lifestyle
    })

  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

// POST - Create new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'special') {
      const query = `
        INSERT INTO special_offers (
          name, description, category, discount_amount, discount_percentage,
          free_product_service, expiration_type, expiration_value, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.name,
        data.description,
        data.category,
        data.discount_amount || null,
        data.discount_percentage || null,
        data.free_product_service || null,
        data.expiration_type,
        data.expiration_value || null,
        data.is_active ?? true
      ])

      return NextResponse.json(result[0])
    }

    if (type === 'bundle') {
      const query = `
        INSERT INTO bundle_rules (
          name, description, required_services, min_services, discount_type,
          discount_value, free_service, bonus_message, priority, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.name,
        data.description,
        data.required_services,
        data.min_services || 2,
        data.discount_type,
        data.discount_value || null,
        data.free_service || null,
        data.bonus_message,
        data.priority || 0,
        data.is_active ?? true
      ])

      return NextResponse.json(result[0])
    }

    if (type === 'lifestyle') {
      const query = `
        INSERT INTO lifestyle_upsells (
          trigger_phrase, product_suggestion, category, base_price,
          monthly_impact, description, display_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.trigger_phrase,
        data.product_suggestion,
        data.category,
        data.base_price,
        data.monthly_impact,
        data.description || null,
        data.display_order || 0,
        data.is_active ?? true
      ])

      return NextResponse.json(result[0])
    }

    return NextResponse.json(
      { error: 'Invalid offer type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

// PUT - Update offer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    if (type === 'special') {
      const query = `
        UPDATE special_offers 
        SET name = $1, description = $2, category = $3, discount_amount = $4,
            discount_percentage = $5, free_product_service = $6, expiration_type = $7,
            expiration_value = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.name || '',
        data.description || '',
        data.category || 'Roofing',
        data.discount_amount || null,
        data.discount_percentage || null,
        data.free_product_service || null,
        data.expiration_type || 'days',
        data.expiration_value || null,
        data.is_active ?? true,
        id
      ])

      return NextResponse.json(result[0])
    }

    if (type === 'bundle') {
      const query = `
        UPDATE bundle_rules 
        SET name = $1, description = $2, required_services = $3, min_services = $4,
            discount_type = $5, discount_value = $6, free_service = $7, bonus_message = $8,
            priority = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.name || '',
        data.description || '',
        data.required_services || [],
        data.min_services || 2,
        data.discount_type || 'percentage',
        data.discount_value || null,
        data.free_service || null,
        data.bonus_message || '',
        data.priority || 0,
        data.is_active ?? true,
        id
      ])

      return NextResponse.json(result[0])
    }

    if (type === 'lifestyle') {
      const query = `
        UPDATE lifestyle_upsells 
        SET trigger_phrase = $1, product_suggestion = $2, category = $3, base_price = $4,
            monthly_impact = $5, description = $6, display_order = $7, is_active = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `
      
      const result = await executeQuery(query, [
        data.trigger_phrase || '',
        data.product_suggestion || '',
        data.category || 'comfort',
        data.base_price || 0,
        data.monthly_impact || 0,
        data.description || null,
        data.display_order || 0,
        data.is_active ?? true,
        id
      ])

      return NextResponse.json(result[0])
    }

    return NextResponse.json(
      { error: 'Invalid offer type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete offer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    let table = ''
    switch (type) {
      case 'special':
        table = 'special_offers'
        break
      case 'bundle':
        table = 'bundle_rules'
        break
      case 'lifestyle':
        table = 'lifestyle_upsells'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid offer type' },
          { status: 400 }
        )
    }

    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
} 