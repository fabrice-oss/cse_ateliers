import type { Metadata } from 'next';
import Link from 'next/link';
import '../quiz-1/quiz.css';
export const metadata: Metadata = { title: 'Quiz 2 — Les ateliers du CSE', description: '30 questions de formation SSCT. Rejoignez la session de votre formateur sur votre appareil.', openGraph: { title: 'Quiz 2', images: [] }, twitter: { title: 'Quiz 2', images: [] }, robots: { index: false, follow: false } };
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <main className="quiz-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></Link><Link className="header-link" href="/ateliers/quiz-2">Quiz 2</Link></header>{children}<footer className="quiz-footer"><p>Formation SSCT · Support initial, diapositives 101 à 226</p><p>Sans nom ni classement. Les réponses sont partagées avec le formateur sous forme de résultats collectifs. Une session reste accessible 24 h ; le formateur peut la supprimer avant ce délai.</p></footer></main>;
}
