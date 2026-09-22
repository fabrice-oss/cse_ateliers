import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findUdaf77Scenario, udaf77Scenarios } from '../../../udaf77-scenarios';
import ConsultationWizard from '../../../udaf77-wizard';

export function generateStaticParams() {
  return udaf77Scenarios.filter((scenario) => scenario.disponible).map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const scenario = findUdaf77Scenario(slug);
  if (!scenario) return { title: 'Consultation UDAF 77' };
  return { title: `Consultation CSE — ${scenario.title}`, description: scenario.metaDescription };
}

export default async function Udaf77ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = findUdaf77Scenario(slug);
  if (!scenario || !scenario.disponible) notFound();
  return <ConsultationWizard scenario={scenario} />;
}
