'use client';

import { ObservationStepper } from '@/components/observation/ObservationStepper';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function ObservationWizardPage() {
  return (
    <DashboardLayout
      left={<div className="space-y-4"></div>}
      center={
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Add Observation
          </h2>
          <ObservationStepper />
        </div>
      }
      right={<div className="space-y-4"></div>}
    />
  );
}
