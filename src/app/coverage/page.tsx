import { CoverageForm } from '@/components/CoverageForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coverage Update - CBL Tournament',
  description: 'Report live coverage for CBL matches',
};

export default function CoveragePage() {
  return <CoverageForm />;
}