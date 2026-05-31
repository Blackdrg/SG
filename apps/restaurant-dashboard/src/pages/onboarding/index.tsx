import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

const STEPS = [
  { id: 1, title: 'Business Info', href: '/onboarding/business' },
  { id: 2, title: 'Documents', href: '/onboarding/documents' },
  { id: 3, title: 'GST Config', href: '/onboarding/gst' },
  { id: 4, title: 'Menu Setup', href: '/onboarding/menu' },
  { id: 5, title: 'Pricing', href: '/onboarding/pricing' },
  { id: 6, title: 'Payout', href: '/onboarding/payout' },
];

export default function OnboardingIndex() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: 48 }}>
      <Head><title>Restaurant Onboarding - SpiceGarden</title></Head>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Restaurant Onboarding</h1>
        <p style={{ color: '#a1a1aa', fontSize: 16, marginBottom: 48 }}>Complete all steps to get your restaurant live on SpiceGarden</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          {STEPS.map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: step.id <= currentStep ? '#f97316' : '#27272a',
                  color: step.id <= currentStep ? '#fff' : '#71717a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 14, marginBottom: 8,
                }}>
                  {step.id}
                </div>
                <span style={{
                  color: step.id <= currentStep ? '#fff' : '#71717a',
                  fontSize: 12, textAlign: 'center',
                }}>{step.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 8px', marginBottom: 24,
                  background: step.id < currentStep ? '#f97316' : '#27272a',
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ background: '#171717', borderRadius: 12, padding: 32, border: '1px solid #27272a' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: 24 }}>
            Complete this step to continue with your onboarding.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep < 6) {
                  setCurrentStep((s) => s + 1);
                  window.location.href = STEPS[currentStep].href;
                } else {
                  alert('Onboarding complete! Your restaurant will be reviewed shortly.');
                }
              }}
            >
              {currentStep === 6 ? 'Submit for Review' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
