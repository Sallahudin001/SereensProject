import React from 'react';
import { CheckCircle, FileCheck, Phone, Mail, Globe } from 'lucide-react';

interface FinalReviewProps {
  onContinueToSign: () => void;
  onRejectProposal: () => void;
}

const FinalReview: React.FC<FinalReviewProps> = ({ onContinueToSign, onRejectProposal }) => {
  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-600 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ready to Transform Your Home?</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Complete Roofing System</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>HVAC Installation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Windows & Doors Upgrade</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Premium Paint Service</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment:</span>
                <span className="text-2xl font-bold text-green-600">$1,095.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="text-lg font-semibold text-blue-600">$9.64/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">You Save:</span>
                <span className="text-lg font-semibold text-red-600">$1,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onContinueToSign}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <FileCheck className="w-5 h-5" />
          <span>Continue to Sign</span>
        </button>
        
        <button
          onClick={onRejectProposal}
          className="flex-1 bg-white hover:bg-red-50 text-red-600 font-semibold py-4 px-8 rounded-xl border-2 border-red-600 transition-colors duration-200"
        >
          Reject Proposal
        </button>
      </div>

      {/* Company Footer */}
      <div className="bg-gray-800 rounded-xl p-8 text-white">
        <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Evergreen Home Upgrades</h3>
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm">C: (408) 826-7377</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm">O: (408)333-9831</span>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">sereen@evergreengreenergy.io</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">info@evergreengreenergy.io</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-4 h-4" />
            <span className="text-sm">www.evergreengreenergy.io</span>
          </div>
                      <p className="text-xs text-gray-300">© 2025 Evergreen Home Upgrades. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;