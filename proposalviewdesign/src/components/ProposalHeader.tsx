import React from 'react';
import { Home, Calendar, MapPin } from 'lucide-react';

interface ProposalHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({ currentStep, totalSteps }) => {
  const steps = ['Overview', 'Enhancements', 'Scope', 'Pricing', 'Review'];
  
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Home Improvement Proposal</h1>
              <p className="text-green-100">Prepared for: CrewBuddy</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100">Proposal #PRO-55558</p>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Date: June 6, 2025</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-green-100">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-green-100">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-green-800 bg-opacity-50 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center transition-all duration-300 ${
                index + 1 <= currentStep ? 'text-white' : 'text-green-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index + 1 <= currentStep 
                  ? 'bg-white text-green-600' 
                  : 'bg-green-800 bg-opacity-50 text-green-300'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;