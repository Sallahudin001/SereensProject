import React, { useState } from 'react';
import { Lightbulb, Home, Eye, Palette, ToggleLeft, ToggleRight } from 'lucide-react';

const EnhancementOptions: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: boolean}>({
    seamlessGutters: true,
    skylightInstallation: false,
    premiumPaint: false
  });

  const toggleOption = (key: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const enhancements = [
    {
      key: 'seamlessGutters',
      title: 'Seamless Gutters',
      description: 'Protect your home with new seamless gutters.',
      category: 'Roofing',
      price: 1500,
      monthlyPayment: 15.00,
      icon: Home
    },
    {
      key: 'skylightInstallation',
      title: 'Skylight Installation', 
      description: 'Bring natural light into your home.',
      category: 'Windows & Doors',
      price: 2500,
      monthlyPayment: 25.00,
      icon: Eye
    },
    {
      key: 'premiumPaint',
      title: 'Premium Paint Upgrade',
      description: 'Longer-lasting and more vibrant colors.',
      category: 'Paint',
      price: 800,
      monthlyPayment: 8.00,
      icon: Palette
    }
  ];

  const getTotalCost = () => {
    return enhancements.reduce((total, enhancement) => {
      return total + (selectedOptions[enhancement.key] ? enhancement.price : 0);
    }, 0);
  };

  const getTotalMonthly = () => {
    return enhancements.reduce((total, enhancement) => {
      return total + (selectedOptions[enhancement.key] ? enhancement.monthlyPayment : 0);
    }, 0);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enhance Your Project</h2>
        </div>
        <p className="text-gray-600">Small additions that make a big difference in your home's comfort and value</p>
      </div>

      <div className="space-y-4">
        {enhancements.map((enhancement) => {
          const Icon = enhancement.icon;
          const isSelected = selectedOptions[enhancement.key];
          
          return (
            <div 
              key={enhancement.key}
              className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleOption(enhancement.key)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${isSelected ? 'bg-green-600' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{enhancement.title}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {enhancement.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{enhancement.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${enhancement.price.toLocaleString()}.00
                    </div>
                    <div className="text-sm text-green-600 font-medium mb-4">
                      +${enhancement.monthlyPayment.toFixed(2)}/month
                    </div>
                    
                    <button 
                      className="flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(enhancement.key);
                      }}
                    >
                      {isSelected ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {getTotalCost() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Enhancements Total</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Additional Project Cost:</span>
            <span className="text-2xl font-bold text-green-600">${getTotalCost().toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Additional Monthly Payment:</span>
            <span className="text-lg font-semibold text-green-600">+${getTotalMonthly().toFixed(2)}/month</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancementOptions;