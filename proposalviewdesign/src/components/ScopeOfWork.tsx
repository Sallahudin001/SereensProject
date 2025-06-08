import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Home, Wrench, Wind, Palette } from 'lucide-react';

const ScopeOfWork: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    roofing: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const workSections = [
    {
      key: 'roofing',
      title: 'Roofing',
      icon: Home,
      color: 'red',
      items: [
        'Complete roof replacement with top inclusions:',
        '- Removal of existing roofing material down to the deck',
        '- Inspection and replacement of damaged decking (if necessary)',
        '- Installation of synthetic underlayment',
        '- Installation of ice and water shield in valleys and around penetrations',
        '- Installation of new ISO',
        '- Installation of ridge vents for proper attic ventilation',
        '- Complete cleanup and haul away of all debris',
        '- Please note that if you can see your roof sheathing under your eaves and it is not 3/4" thick or more, you will see the nail points penetrating your deck after the new roof installation is complete.',
        '',
        'Plywood Replacement',
        '- Standard includes 20% plywood replacement',
        '- Additional 30% plywood replacement included in this quote',
        '',
        'Additional gutter work:',
        '- Remove existing gutters and downspouts',
        '- Install new seamless gutters and downspouts',
        '- Ensure proper drainage away from foundation'
      ]
    },
    {
      key: 'hvac',
      title: 'HVAC System',
      icon: Wind,
      color: 'blue',
      items: [
        'Complete HVAC system installation including:',
        '- High-efficiency central air conditioning unit',
        '- Energy-efficient heating system',
        '- Ductwork inspection and sealing',
        '- Thermostat upgrade to programmable model',
        '- Air filtration system installation',
        '- Complete system testing and commissioning'
      ]
    },
    {
      key: 'windows',
      title: 'Windows & Doors',
      icon: Wrench,
      color: 'green',
      items: [
        'Window and door upgrades:',
        '- Energy-efficient double-pane windows',
        '- Professional installation with proper sealing',
        '- Trim and casing work as needed',
        '- Hardware upgrades for enhanced security',
        '- Weather stripping installation',
        '- Final inspection and quality assurance'
      ]
    },
    {
      key: 'paint',
      title: 'Interior & Exterior Paint',
      icon: Palette,
      color: 'purple',
      items: [
        'Complete painting services:',
        '- Surface preparation and priming',
        '- High-quality paint application',
        '- Interior wall and ceiling painting',
        '- Exterior siding and trim painting',
        '- Protection of landscaping and property',
        '- Final touch-ups and cleanup'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Detailed Scope of Work</h2>
        </div>
        
        <div className="space-y-4">
          {workSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.key];
            
            return (
              <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getColorClasses(section.color)}`}>
                      Included
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <div className="space-y-2">
                      {section.items.map((item, index) => (
                        <div key={index} className={`${item === '' ? 'h-2' : ''}`}>
                          {item && (
                            <p className={`text-gray-700 ${item.startsWith('-') ? 'ml-4 text-sm' : ''}`}>
                              {item}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScopeOfWork;