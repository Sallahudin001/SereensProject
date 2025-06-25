const { executeQuery } = require('../lib/db');

async function seedProductPricing() {
  try {
    console.log('Starting product pricing seed...');

    // Clear existing product pricing data
    await executeQuery('DELETE FROM product_pricing');
    console.log('Cleared existing product pricing data');

    // Roofing products - based on actual roofing form
    const roofingProducts = [
      // Roofing Materials
      ['Architectural Shingles', 'square', 450.00, 400.00, 550.00, 350.00, 'roofing', 'active'],
      ['Tile Roofing', 'square', 850.00, 750.00, 1000.00, 650.00, 'roofing', 'active'],
      ['TPO Membrane', 'square', 650.00, 550.00, 750.00, 500.00, 'roofing', 'active'],
      ['Tar & Gravel', 'square', 550.00, 475.00, 650.00, 425.00, 'roofing', 'active'],
      ['Metal Roofing - Standing Seam', 'square', 1200.00, 1000.00, 1400.00, 900.00, 'roofing', 'active'],
      
      // Roofing Components
      ['Synthetic Underlayment', 'square', 85.00, 75.00, 100.00, 65.00, 'roofing', 'active'],
      ['Ice & Water Shield', 'linear_foot', 12.00, 10.00, 15.00, 8.50, 'roofing', 'active'],
      ['Ridge Vents', 'linear_foot', 18.00, 15.00, 22.00, 13.00, 'roofing', 'active'],
      ['Seamless Gutters', 'linear_foot', 25.00, 22.00, 30.00, 18.00, 'roofing', 'active'],
      ['Downspouts', 'linear_foot', 15.00, 12.00, 18.00, 10.00, 'roofing', 'active'],
      ['Plywood Decking Replacement', 'square_foot', 8.50, 7.50, 10.00, 6.50, 'roofing', 'active']
    ];

    // HVAC products - based on actual HVAC form
    const hvacProducts = [
      // Complete Systems
      ['AC Only System - 2 Ton', 'unit', 3200.00, 2800.00, 3800.00, 2400.00, 'hvac', 'active'],
      ['AC Only System - 3 Ton', 'unit', 3800.00, 3400.00, 4500.00, 2900.00, 'hvac', 'active'],
      ['AC Only System - 4 Ton', 'unit', 4500.00, 4000.00, 5200.00, 3400.00, 'hvac', 'active'],
      ['Furnace Only - 80% Efficiency', 'unit', 2800.00, 2400.00, 3200.00, 2100.00, 'hvac', 'active'],
      ['Furnace Only - 90% Efficiency', 'unit', 3500.00, 3100.00, 4000.00, 2600.00, 'hvac', 'active'],
      ['Complete HVAC System - 2.5 Ton', 'unit', 5800.00, 5200.00, 6800.00, 4400.00, 'hvac', 'active'],
      ['Complete HVAC System - 3 Ton', 'unit', 6500.00, 5800.00, 7500.00, 4900.00, 'hvac', 'active'],
      ['Complete HVAC System - 4 Ton', 'unit', 7800.00, 7000.00, 9000.00, 5900.00, 'hvac', 'active'],
      ['Heat Pump System - 2.5 Ton', 'unit', 6200.00, 5500.00, 7200.00, 4700.00, 'hvac', 'active'],
      ['Heat Pump System - 3 Ton', 'unit', 6800.00, 6100.00, 7800.00, 5100.00, 'hvac', 'active'],
      
      // HVAC Add-ons
      ['Attic Installation Labor', 'unit', 850.00, 750.00, 1000.00, 650.00, 'hvac', 'active'],
      ['New Power Line Installation', 'unit', 1200.00, 1000.00, 1500.00, 900.00, 'hvac', 'active'],
      ['New Copper Lines', 'linear_foot', 18.00, 15.00, 22.00, 13.50, 'hvac', 'active'],
      ['Return Air Ducts', 'unit', 450.00, 400.00, 550.00, 325.00, 'hvac', 'active'],
      ['Complete Ductwork Replacement', 'square_foot', 12.00, 10.00, 15.00, 8.50, 'hvac', 'active']
    ];

    // Windows & Doors products - based on actual windows/doors form
    const windowsProducts = [
      // Windows
      ['Vinyl Retrofit Dual Pane - White', 'window', 650.00, 580.00, 750.00, 480.00, 'windows', 'active'],
      ['Vinyl Retrofit Dual Pane - Bronze', 'window', 750.00, 675.00, 850.00, 550.00, 'windows', 'active'],
      ['Vinyl Retrofit Dual Pane - Black', 'window', 750.00, 675.00, 850.00, 550.00, 'windows', 'active'],
      ['Vinyl Retrofit Dual Pane - Tan', 'window', 750.00, 675.00, 850.00, 550.00, 'windows', 'active'],
      
      // Doors
      ['Slider Door', 'door', 1200.00, 1050.00, 1400.00, 900.00, 'windows', 'active'],
      ['Patio Door - Hinged', 'door', 1400.00, 1200.00, 1650.00, 1050.00, 'windows', 'active'],
      ['French Door', 'door', 1800.00, 1600.00, 2100.00, 1350.00, 'windows', 'active'],
      ['Entry Door', 'door', 950.00, 850.00, 1150.00, 700.00, 'windows', 'active'],
      ['Interior Door', 'door', 450.00, 400.00, 550.00, 325.00, 'windows', 'active']
    ];

    // Garage Door products - based on actual garage door form
    const garageProducts = [
      // Garage Door Models
      ['T50L Standard - 8x7', 'door', 750.00, 675.00, 900.00, 575.00, 'garage', 'active'],
      ['T50L Standard - 16x7', 'door', 950.00, 850.00, 1150.00, 725.00, 'garage', 'active'],
      ['T50S with Windows - 8x7', 'door', 850.00, 765.00, 1000.00, 650.00, 'garage', 'active'],
      ['T50S with Windows - 16x7', 'door', 1100.00, 990.00, 1300.00, 850.00, 'garage', 'active'],
      ['4050 Insulated - 8x7', 'door', 1200.00, 1080.00, 1450.00, 925.00, 'garage', 'active'],
      ['4050 Insulated - 16x7', 'door', 1550.00, 1400.00, 1850.00, 1200.00, 'garage', 'active'],
      ['4053 Insulated with Windows - 8x7', 'door', 1350.00, 1215.00, 1600.00, 1050.00, 'garage', 'active'],
      ['4053 Insulated with Windows - 16x7', 'door', 1750.00, 1575.00, 2100.00, 1350.00, 'garage', 'active'],
      
      // Garage Door Add-ons
      ['Clear Glass Window Upgrade', 'unit', 150.00, 135.00, 180.00, 115.00, 'garage', 'active'],
      ['Obscure Glass Window Upgrade', 'unit', 175.00, 157.50, 210.00, 135.00, 'garage', 'active'],
      ['LiftMaster Opener with Remotes', 'unit', 450.00, 405.00, 540.00, 345.00, 'garage', 'active']
    ];

    // Paint products - based on actual paint form
    const paintProducts = [
      // Exterior Painting
      ['Exterior Paint - Standard Grade', 'gallon', 55.00, 50.00, 65.00, 42.00, 'paint', 'active'],
      ['Exterior Paint - Premium Grade', 'gallon', 75.00, 67.50, 90.00, 58.00, 'paint', 'active'],
      ['Exterior Primer', 'gallon', 45.00, 40.50, 55.00, 34.00, 'paint', 'active'],
      ['Exterior Labor - Surface Prep', 'square_foot', 1.25, 1.10, 1.50, 0.95, 'paint', 'active'],
      ['Exterior Labor - Painting', 'square_foot', 2.75, 2.50, 3.25, 2.10, 'paint', 'active'],
      ['Pressure Washing', 'square_foot', 0.85, 0.75, 1.00, 0.65, 'paint', 'active'],
      
      // Interior Painting  
      ['Interior Paint - Standard Grade', 'gallon', 45.00, 40.50, 55.00, 34.00, 'paint', 'active'],
      ['Interior Paint - Premium Grade', 'gallon', 65.00, 58.50, 78.00, 50.00, 'paint', 'active'],
      ['Interior Primer', 'gallon', 38.00, 34.00, 45.00, 29.00, 'paint', 'active'],
      ['Interior Labor - Surface Prep', 'square_foot', 0.95, 0.85, 1.15, 0.72, 'paint', 'active'],
      ['Interior Labor - Painting', 'square_foot', 2.25, 2.00, 2.65, 1.70, 'paint', 'active']
    ];

    // Insert all products
    const allProducts = [
      ...roofingProducts,
      ...hvacProducts,
      ...windowsProducts,
      ...garageProducts,
      ...paintProducts
    ];

    for (const product of allProducts) {
      const [name, unit, base_price, min_price, max_price, cost, category, status] = product;
      await executeQuery(
        `INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [name, unit, base_price, min_price, max_price, cost, category, status]
      );
    }

    console.log(`Successfully seeded ${allProducts.length} products`);

    // Verify the data
    const counts = await executeQuery(`
      SELECT category, COUNT(*) as count 
      FROM product_pricing 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('Product counts by category:');
    counts.forEach(row => {
      console.log(`- ${row.category}: ${row.count} products`);
    });

    console.log('Product pricing seed completed successfully!');

  } catch (error) {
    console.error('Error seeding product pricing:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedProductPricing()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProductPricing }; 