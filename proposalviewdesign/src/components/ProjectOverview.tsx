import React from 'react';
import { MapPin, User, Calendar, ShoppingCart } from 'lucide-react';

const ProjectOverview: React.FC = () => {
  const services = ['Roofing', 'HVAC', 'Windows & Doors', 'Garage Doors', 'Paint'];
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Homeowner</p>
                <p className="text-lg font-semibold text-gray-900">CrewBuddy</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Proposal Date</p>
                <p className="text-lg font-semibold text-gray-900">June 6, 2025</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-lg font-semibold text-gray-900">
                  Malik Mochti Muhalla Ghouspur District<br />
                  Rashmore
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Services Included</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg px-4 py-2 hover:shadow-md transition-all duration-200"
            >
              <span className="text-green-800 font-medium">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;