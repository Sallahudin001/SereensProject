import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isLastStep?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isLastStep = false
}) => {
  return (
    <div className="flex justify-between items-center pt-8 border-t border-gray-200">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          currentStep === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </button>
      
      <div className="text-sm text-gray-500">
        Page {currentStep} of {totalSteps}
      </div>
      
      {!isLastStep && (
        <button
          onClick={onNext}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      
      {isLastStep && (
        <div className="w-20"></div>
      )}
    </div>
  );
};

export default NavigationButtons;