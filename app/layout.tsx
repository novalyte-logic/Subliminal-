import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Novalyte AI • Quantum Leap Affirmation Engine',
  description: 'Transmute affirmations using quantum leap linguistic structures for rapid manifestation, paired with rhythmic, high-frequency spoken audio and Solfeggio carrier tones.',
  openGraph: {
    title: 'Novalyte AI • Quantum Leap Affirmation Engine',
    description: 'Transmute affirmations using quantum leap linguistic structures for rapid manifestation, paired with rhythmic, high-frequency spoken audio and Solfeggio carrier tones.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Novalyte AI • Quantum Leap Affirmation Engine',
    description: 'Transmute affirmations using quantum leap linguistic structures for rapid manifestation, paired with rhythmic, high-frequency spoken audio and Solfeggio carrier tones.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
