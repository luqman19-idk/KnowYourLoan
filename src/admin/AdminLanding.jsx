import React from 'react';
import { ArrowRight, ShieldCheck, ClipboardList, Cpu, FileCheck } from 'lucide-react';

export default function AdminLanding({ onGoToLogin }) {
  return (
    <div className="relative min-h-screen w-full bg-[#070B09] text-[#F2F5F3] flex flex-col justify-between select-none overflow-hidden font-['Inter',sans-serif] selection:bg-[#16A875]/30 selection:text-emerald-200">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 motion-reduce:hidden"
        src="/videos/admin_web.mp4"
      />

      {/* Dark overlay: Balanced opacity to keep video atmosphere visible while guaranteeing high text contrast */}
      <div
        className="absolute inset-0 bg-[#070B09]/75 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Top subtle vignette for added depth and clean contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#070B09]/80 via-transparent to-[#070B09]/90 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* ==============================================================
          A. MINIMAL HEADER
          ============================================================== */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-6 sm:py-8 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Refined Brand Mark */}
          <div className="w-8 h-8 rounded-md bg-[#0F1612] border border-[#1E2A23] flex items-center justify-center text-[#16A875] shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#16A875]" strokeWidth={2.2} />
          </div>
          <div className="flex items-baseline space-x-2.5">
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#F2F5F3] font-['Space_Grotesk',sans-serif]">
              KnowYourLoan
            </span>
            <span className="text-[10px] font-['Inter',sans-serif] font-semibold tracking-wider text-[#16A875] uppercase px-2 py-0.5 rounded bg-[#16A875]/10 border border-[#16A875]/25">
              ADMIN CONSOLE
            </span>
          </div>
        </div>

        {/* Security / Restricted Access Badge */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-['Inter',sans-serif] font-medium text-[#8B9891] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A875] animate-pulse" />
          <span>Restricted Portal</span>
        </div>
      </header>

      {/* ==============================================================
          B. MAIN HERO SECTION (Positioned slightly above vertical center)
          ============================================================== */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center max-w-4xl mx-auto -mt-6 sm:-mt-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F1612]/90 border border-[#1E2A23] text-[11px] font-['Inter',sans-serif] font-medium tracking-widest text-[#16A875] uppercase mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A875]" />
          <span>ADMINISTRATIVE ACCESS</span>
        </div>

        {/* Main Heading: Space Grotesk, weights 650-700, editorial tracking */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-[#F2F5F3] leading-[1.08] sm:leading-[1.08] max-w-3xl font-['Space_Grotesk',sans-serif]">
          Loan Intelligence.<br />
          <span className="text-[#E6EBE8] font-semibold tracking-[-0.03em]">Human Oversight.</span>
        </h1>

        {/* Subtitle: Inter, soft grey-green, balanced line-height */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[#9EA9A2] max-w-xl mx-auto leading-relaxed font-normal font-['Inter',sans-serif]">
          Review applications, examine AI predictions, and manage lending decisions.
        </p>

        {/* C. Administrator Login Button */}
        <div className="mt-8 sm:mt-10">
          <button
            onClick={onGoToLogin}
            type="button"
            className="group relative inline-flex items-center justify-center space-x-3 px-8 sm:px-9 py-3.5 sm:py-4 rounded-lg bg-[#16A875] hover:bg-[#139266] active:bg-[#107d57] text-[#070B09] font-['Inter',sans-serif] font-semibold text-sm sm:text-base tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-[#16A875]/20 focus:outline-none focus:ring-2 focus:ring-[#16A875] focus:ring-offset-2 focus:ring-offset-[#070B09]"
          >
            <span>Administrator Login</span>
            <ArrowRight className="w-4 h-4 text-[#070B09] transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
          </button>
        </div>
      </main>

      {/* ==============================================================
          D. THREE ADMINISTRATIVE CAPABILITY INDICATORS
          ============================================================== */}
      <footer className="relative z-20 w-full px-6 sm:px-10 pb-8 sm:pb-12 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 pt-4 border-t border-[#1A231E]/80">
            {/* Capability 1: Applications */}
            <div className="flex items-center space-x-2.5 text-[#A3AEA7]">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[#16A875] bg-[#16A875]/10 border border-[#16A875]/20">
                <ClipboardList className="w-3.5 h-3.5 text-[#16A875]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#CCD4CF] font-['Inter',sans-serif]">
                Applications
              </span>
            </div>

            {/* Subtle Divider (Desktop) */}
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#2A372F]" />

            {/* Capability 2: AI Analysis */}
            <div className="flex items-center space-x-2.5 text-[#A3AEA7]">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[#16A875] bg-[#16A875]/10 border border-[#16A875]/20">
                <Cpu className="w-3.5 h-3.5 text-[#16A875]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#CCD4CF] font-['Inter',sans-serif]">
                AI Analysis
              </span>
            </div>

            {/* Subtle Divider (Desktop) */}
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#2A372F]" />

            {/* Capability 3: Audit & Reports */}
            <div className="flex items-center space-x-2.5 text-[#A3AEA7]">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[#16A875] bg-[#16A875]/10 border border-[#16A875]/20">
                <FileCheck className="w-3.5 h-3.5 text-[#16A875]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#CCD4CF] font-['Inter',sans-serif]">
                Audit &amp; Reports
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

