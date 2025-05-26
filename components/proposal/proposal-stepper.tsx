import React from 'react'

export interface Step {
  id: string
  label: string
}

interface ProposalStepperProps {
  steps: Step[]
  currentStep: number
}

export default function ProposalStepper({ steps, currentStep }: ProposalStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  index <= currentStep ? "border-rose-600 bg-rose-50 text-rose-600" : "border-gray-300 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-xs text-center ${
                  index === currentStep ? "font-medium text-rose-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? "bg-rose-600" : "bg-gray-300"
                }`}
                style={{ minWidth: 24 }}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
