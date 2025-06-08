import React from 'react';
import { DollarSign, Gift, Clock, Star, Calendar } from 'lucide-react';

const PricingAndOffers: React.FC = () => {
  const bundleOffers = [
    {
      title: 'Complete Home Bundle',
      discount: 'Bundle Discount',
      savings: '$8 Saved'
    },
    {
      title: 'Complete Home Bundle',
      discount: 'Bundle Discount', 
      savings: '$8 Saved'
    },
    {
      title: 'Complete Home Bundle',
      discount: 'Bundle Discount',
      savings: '$8 Saved'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Pricing Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Project Investment</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Base Proposal Subtotal</span>
            <span className="text-lg font-semibold text-gray-900">$2,095.00</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Discounts</span>
            <span className="text-lg font-semibold text-red-600">-$1,000.00</span>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Project Investment</span>
              <span className="text-2xl font-bold text-green-600">$1,095.00</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-blue-600 font-medium">Estimated Monthly Payment</span>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-600">$9.64/mo*</span>
              <p className="text-xs text-gray-500">*Based on Momentum PACE - 9.99% APR 25 years. Terms and conditions apply.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Savings */}
      <div className="bg-green-50 rounded-xl border-2 border-green-200 p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-600 p-2 rounded-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-green-800">Bundle Savings Applied!</h2>
        </div>
        <p className="text-green-700 mb-6">You're already saving money by combining multiple services.</p>
        
        <div className="space-y-3">
          {bundleOffers.map((bundle, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-green-200 flex justify-between items-center">
              <span className="font-medium text-gray-900">{bundle.title}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-green-600">{bundle.discount}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {bundle.savings}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limited Time Offers */}
      <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-amber-800">Limited Time Offers</h2>
        </div>
        <p className="text-amber-700 mb-6">Act fast! These exclusive offers won't last long.</p>
        
        <div className="space-y-6">
          {/* Free Gutters & Downspouts */}
          <div className="bg-white rounded-lg p-6 border border-amber-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Gutters & Downspouts</h3>
                <p className="text-gray-600">Book your roof this week and we'll include free gutters & downspouts</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-600 mb-1">Expires in:</div>
                <div className="text-lg font-bold text-amber-800">7h 55m 22s</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">Roofing</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">FREE: Gutters & Downspouts</span>
            </div>
          </div>

          {/* 3 Free Monthly Payments */}
          <div className="bg-white rounded-lg p-6 border border-amber-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3 Free Monthly Payments</h3>
                <p className="text-gray-600">Bundle 2 services today and we'll cover your first 3 monthly payments — delivered as a rebate check once the project is complete.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-600 mb-1">Expires in:</div>
                <div className="text-lg font-bold text-amber-800">7h 55m 12s</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">Bundle</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">FREE: 3 Monthly Payments Rebate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAndOffers;