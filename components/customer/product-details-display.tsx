import React from 'react';
import { formatCurrency } from '@/lib/financial-utils';

interface ProductDetailsDisplayProps {
  proposal: any;
  showLineItemPricing: boolean;
}

const ProductDetailsDisplay: React.FC<ProductDetailsDisplayProps> = ({ 
  proposal, 
  showLineItemPricing 
}) => {
  // Helper to get formatted product name from service key
  const getFormattedProductName = (serviceKey: string) => {
    return serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1).replace(/-/g, ' & ');
  };

  // Helper to render details for roofing products
  const renderRoofingDetails = (productData: any) => {
    if (!productData) return null;
    
    return (
      <div className="space-y-2">
        {productData.roofingType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Roofing Type:</div>
            <div>{productData.roofingType}</div>
          </div>
        )}
        {productData.roofingMaterial && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Material:</div>
            <div>{productData.roofingMaterial}</div>
          </div>
        )}
        {productData.roofingColor && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Color:</div>
            <div>{productData.roofingColor}</div>
          </div>
        )}
        {productData.roofingArea && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Area:</div>
            <div>{productData.roofingArea} sq ft</div>
          </div>
        )}
        {showLineItemPricing && productData.totalPrice && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div className="font-medium text-gray-700">Roofing Price:</div>
            <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.totalPrice))}</div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render details for HVAC products
  const renderHVACDetails = (productData: any) => {
    if (!productData) return null;
    
    return (
      <div className="space-y-2">
        {productData.systemType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">System Type:</div>
            <div>{productData.systemType}</div>
          </div>
        )}
        {productData.BTUs && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Capacity:</div>
            <div>{productData.BTUs} BTUs</div>
          </div>
        )}
        {productData.SEER && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">SEER Rating:</div>
            <div>{productData.SEER}</div>
          </div>
        )}
        {productData.ductwork && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Ductwork:</div>
            <div>{productData.ductwork}</div>
          </div>
        )}
        {showLineItemPricing && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {productData.systemCost && (
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium text-gray-700">System Cost:</div>
                <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.systemCost))}</div>
              </div>
            )}
            {productData.ductworkCost && (
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium text-gray-700">Ductwork Cost:</div>
                <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.ductworkCost))}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper to render details for windows and doors products
  const renderWindowsDoorsDetails = (productData: any) => {
    if (!productData) return null;
    
    return (
      <div className="space-y-2">
        {productData.windowType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Window Type:</div>
            <div>{productData.windowType}</div>
          </div>
        )}
        {productData.windowCount && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Window Count:</div>
            <div>{productData.windowCount}</div>
          </div>
        )}
        {productData.doorCount && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Door Count:</div>
            <div>{productData.doorCount}</div>
          </div>
        )}
        {showLineItemPricing && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {productData.windowPrice && (
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium text-gray-700">Windows Cost:</div>
                <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.windowPrice))}</div>
              </div>
            )}
            {productData.doorPrices && Object.entries(productData.doorPrices).length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium text-gray-700">Doors Cost:</div>
                <div className="font-semibold text-emerald-700">
                  {formatCurrency(
                    Object.values(productData.doorPrices).reduce(
                      (sum: number, price: any) => sum + parseFloat(price || 0), 
                      0
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper to render details for garage door products
  const renderGarageDoorsDetails = (productData: any) => {
    if (!productData) return null;
    
    return (
      <div className="space-y-2">
        {productData.garageType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Garage Door Type:</div>
            <div>{productData.garageType}</div>
          </div>
        )}
        {productData.garageMaterial && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Material:</div>
            <div>{productData.garageMaterial}</div>
          </div>
        )}
        {productData.garageColor && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Color:</div>
            <div>{productData.garageColor}</div>
          </div>
        )}
        {showLineItemPricing && productData.totalPrice && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div className="font-medium text-gray-700">Total Price:</div>
            <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.totalPrice))}</div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render details for paint products
  const renderPaintDetails = (productData: any) => {
    if (!productData) return null;
    
    return (
      <div className="space-y-2">
        {productData.paintType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Paint Type:</div>
            <div>{productData.paintType}</div>
          </div>
        )}
        {productData.exteriorColor && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Exterior Color:</div>
            <div>{productData.exteriorColor}</div>
          </div>
        )}
        {productData.interiorColors && (
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-gray-700">Interior Colors:</div>
            <div>{Array.isArray(productData.interiorColors) ? productData.interiorColors.join(', ') : productData.interiorColors}</div>
          </div>
        )}
        {showLineItemPricing && productData.totalPrice && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div className="font-medium text-gray-700">Paint Price:</div>
            <div className="font-semibold text-emerald-700">{formatCurrency(parseFloat(productData.totalPrice))}</div>
          </div>
        )}
      </div>
    );
  };

  // Render the appropriate product details based on service type
  const renderProductDetails = (service: string, productData: any) => {
    switch (service) {
      case 'roofing':
        return renderRoofingDetails(productData);
      case 'hvac':
        return renderHVACDetails(productData);
      case 'windows-doors':
        return renderWindowsDoorsDetails(productData);
      case 'garage-doors':
        return renderGarageDoorsDetails(productData);
      case 'paint':
        return renderPaintDetails(productData);
      default:
        return (
          <div className="text-gray-500 italic">
            Product details not available for this service type.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {proposal?.services?.map((service: string, index: number) => {
        const productData = proposal.products[service];
        if (!productData) return null;
        
        return (
          <div key={index} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">
                {getFormattedProductName(service)} Details
              </h3>
            </div>
            <div className="p-4">
              {renderProductDetails(service, productData)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductDetailsDisplay; 