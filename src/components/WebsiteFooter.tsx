import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Activity,
  Heart,
  FileText,
  Lock,
  Sparkles,
  Award,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useOwner } from '../context/OwnerContext';

interface WebsiteFooterProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({ onNavigate }) => {
  const { ownerSettings, isOwnerMode } = useOwner();

  return (
    <footer className="mt-16 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                NS
              </div>
              <h4 className="text-sm font-black text-white">{ownerSettings.portalTitle}</h4>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Advanced clinical education platform designed for B.Sc & M.Sc Nursing students.
              Features INC competency-based syllabus, interactive textbooks, Virtual Reality OT/LR suite,
              and AI-driven multimodal document learning.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>INC 2026 Curriculum Compliant</span>
            </div>
          </div>

          {/* Col 2: Academic Modules */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Academic Modules
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate('syllabus')}
                  className="hover:text-teal-400 transition"
                >
                  Curriculum & Syllabus
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('textbook')}
                  className="hover:text-teal-400 transition"
                >
                  Clinical Textbook & Pearls
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('virtual-ot')}
                  className="hover:text-teal-400 transition"
                >
                  Virtual OT & Labor Room Simulation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pdf-notes')}
                  className="hover:text-teal-400 transition text-teal-300 font-semibold"
                >
                  PDF Notes & Solved Q&A Generator ★
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="hover:text-teal-400 transition"
                >
                  Dynamic NCLEX Quiz Arena
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Practical Tools & Simulations */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Clinical Tools & Suites
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate('diagrams-excel')}
                  className="hover:text-teal-400 transition"
                >
                  Excel Syllabus Parser & Clinical Flowcharts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('presentation')}
                  className="hover:text-teal-400 transition"
                >
                  Clinical Slide Deck Presentation Maker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('games')}
                  className="hover:text-teal-400 transition"
                >
                  Simulation Game Arena (BMW & NRP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('owner')}
                  className="hover:text-amber-400 transition font-semibold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Owner Administration Studio</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Preceptors & Reference Standards */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Authoritative Reference Standards
            </h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Grounded in D.C. Dutta (Obstetrics), Ghai (Pediatrics), K. Park (PSM), Polit & Beck (Research),
              and WHO / Ministry of Health & Family Welfare (MoHFW) clinical protocols.
            </p>
            <div className="pt-1 text-[11px] text-slate-500">
              <span>Support Contact: </span>
              <span className="text-teal-400">{ownerSettings.contactEmail}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {ownerSettings.portalTitle} • {ownerSettings.instituteName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built for Nursing Excellence</span>
            <span>•</span>
            <button onClick={() => onNavigate('owner')} className="hover:text-teal-400 transition flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>{isOwnerMode ? 'Owner Studio (Unlocked)' : 'Owner Portal'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
