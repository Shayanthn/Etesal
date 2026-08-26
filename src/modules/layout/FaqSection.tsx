import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles,
  Search
} from 'lucide-react';
import { FaqItem } from '../../types';

interface FaqSectionProps {
  faqs: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="py-12 border-t border-slate-800/80">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>پاسخ به ابهامات متداول</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">سوالات متداول کاربران</h2>
          <p className="text-xs text-slate-400">راهنمای رفع ابهام در مورد پروتکل‌ها، سابسکریپشن و اپلیکیشن‌ها</p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 pt-4">
          {faqs.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-xl'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 md:p-5 flex items-center justify-between text-right gap-4 cursor-pointer"
                >
                  <span className="text-xs md:text-sm font-bold text-slate-100">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-lg bg-slate-800 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-300' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 md:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
