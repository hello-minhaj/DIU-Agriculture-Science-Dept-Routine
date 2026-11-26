import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
} from 'lucide-react';

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
  </svg>
);

import { ThemeToggle } from './ThemeToggle';

interface ContactViewProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  isDark,
  onToggleDark,
}) => {
  const [imgError, setImgError] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'error' | 'feature'>('error');
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);

  const formattedFeedback = `[AGS Routine - ${
    feedbackType === 'error' ? 'Routine Error Report' : 'Feature Suggestion'
  }]\n\n${reportText.trim()}`;

  const handleCopy = async () => {
    if (!reportText.trim()) return;
    try {
      await navigator.clipboard.writeText(formattedFeedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleSendEmail = () => {
    const su =
      feedbackType === 'error'
        ? encodeURIComponent('[Agri Routine] Routine Error Report')
        : encodeURIComponent('[Agri Routine] Feature Suggestion');
    const body = encodeURIComponent(reportText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=islam2305101257@diu.edu.bd&su=${su}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const socials = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/hellominhaj/',
      icon: LinkedInIcon,
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/hellominhaj10',
      icon: FacebookIcon,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@hellominhajDIU',
      icon: YouTubeIcon,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F3F4F6]">
          Contact &amp; Feedback
        </h1>
        <ThemeToggle isDark={isDark} onToggleDark={onToggleDark} />
      </div>

      {/* Developer Profile Card */}
      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-6 text-center space-y-4">
        <div className="flex justify-center">
          {!imgError ? (
            <img
              src="/images/profile.jpg"
              alt="Md Minhajul Islam"
              onError={() => setImgError(true)}
              className="w-28 h-28 rounded-full object-cover border-2 border-emerald-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-3xl font-extrabold text-[#15803D] dark:text-[#10B981]">
              MM
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F3F4F6]">
            Md Minhajul Islam
          </h1>
          <p className="text-base font-semibold text-[#15803D] dark:text-[#10B981]">
            AI Engineer, Full Stack Developer, TA at Dept. of AGS
          </p>
          <p className="text-base text-[#64748B] dark:text-[#9CA3AF]">
            B.Sc. in CSE, DIU
          </p>
        </div>

        {/* Social & Connect Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] hover:border-[#16A34A] px-3.5 py-2.5 text-base font-bold text-[#0F172A] dark:text-[#F3F4F6] transition"
            >
              <Icon className="w-5 h-5 text-[#15803D] dark:text-[#10B981]" />
              <span>{label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
            </a>
          ))}
        </div>
      </section>

      {/* Feedback Box */}
      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#15803D] dark:text-[#10B981]" />
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F3F4F6]">
            Report an Issue or Suggest a Feature
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1012] p-1 border border-[#E2E8F0] dark:border-[#23282E]">
          <button
            type="button"
            onClick={() => setFeedbackType('error')}
            className={`rounded-lg py-2 text-base font-semibold transition ${
              feedbackType === 'error'
                ? 'bg-[#15803D] dark:bg-[#16A34A] text-white'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            Routine Error
          </button>
          <button
            type="button"
            onClick={() => setFeedbackType('feature')}
            className={`rounded-lg py-2 text-base font-semibold transition ${
              feedbackType === 'feature'
                ? 'bg-[#15803D] dark:bg-[#16A34A] text-white'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            Feature Suggestion
          </button>
        </div>

        <textarea
          rows={4}
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder={
            feedbackType === 'error'
              ? 'Describe the batch, day, time slot, or room discrepancy...'
              : 'Share an idea to improve Agri Routine...'
          }
          className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-slate-50 dark:bg-[#0E1012] p-3.5 text-base text-[#0F172A] dark:text-[#F3F4F6] placeholder:text-[#94A3B8] dark:placeholder:text-[#9CA3AF]/60 focus:outline-none focus:border-[#16A34A]"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={!reportText.trim()}
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-slate-50 dark:bg-[#0E1012] py-3 text-base font-bold text-[#0F172A] dark:text-[#F3F4F6] hover:border-[#16A34A] disabled:opacity-40 transition"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-[#10B981]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-[#15803D] dark:text-[#10B981]" />
                Copy Report
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#15803D] dark:bg-[#16A34A] text-white py-3 text-base font-bold hover:opacity-95 transition"
          >
            <Mail className="w-5 h-5" />
            Send Email
          </button>
        </div>
      </section>
    </div>
  );
};
