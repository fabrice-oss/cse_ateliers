import type { Metadata } from 'next';
import Link from 'next/link';
import './quiz.css';
export const metadata: Metadata = { title: 'Quiz 1 — Les ateliers du CSE', description: '25 questions de formation SSCT. Rejoignez la session de votre formateur sur votre appareil.', openGraph: { title: 'Quiz 1', images: [] }, twitter: { title: 'Quiz 1', images: [] }, robots: { index: false, follow: false } };
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <main className="quiz-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></Link><Link className="header-link" href="/ateliers/quiz-1">Quiz 1</Link></header>{children}<footer className="quiz-footer"><p>Formation SSCT · Support initial, diapositives 1 à 99</p><p>Sans nom ni classement. Les réponses sont partagées avec le formateur sous forme de résultats collectifs. Une session reste accessible 24 h ; le formateur peut la supprimer avant ce délai.</p></footer></main>;
}
