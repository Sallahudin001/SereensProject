import React, { useState } from 'react';
import ProposalHeader from './components/ProposalHeader';
import ProjectOverview from './components/ProjectOverview';
import EnhancementOptions from './components/EnhancementOptions';
import ScopeOfWork from './components/ScopeOfWork';
import PricingAndOffers from './components/PricingAndOffers';
import FinalReview from './components/FinalReview';
import NavigationButtons from './components/NavigationButtons';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinueToSign = () => {
    alert('Redirecting to signature page...');
  };

  const handleRejectProposal = () => {
    alert('Proposal rejected. Thank you for your time.');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectOverview />;
      case 2:
        return <EnhancementOptions />;
      case 3:
        return <ScopeOfWork />;
      case 4:
        return <PricingAndOffers />;
      case 5:
        return <FinalReview onContinueToSign={handleContinueToSign} onRejectProposal={handleRejectProposal} />;
      default:
        return <ProjectOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalHeader currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            {renderCurrentStep()}
            
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              onPrevious={previousStep}
              onNext={nextStep}
              isLastStep={currentStep === totalSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;