import React, { useState } from 'react';
import { Shield, Sparkles, Menu, X, ArrowRight, Activity } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glassy Top Navigation Container */}
      <nav className="relative bg-[#050806]/75 backdrop-blur-xl border-b border-emerald-500/15 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.7),0_1px_12px_rgba(16,185,129,0.08)]">
        {/* Restrained subtle emerald accent glow strip at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Tagline */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-3.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500/40 rounded-xl p-1 transition-all"
              aria-label="KnowYourLoan Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950/90 via-[#071a11] to-[#040d08] border border-emerald-500/35 flex items-center justify-center shadow-lg shadow-emerald-950/60 group-hover:border-emerald-400/70 group-hover:shadow-emerald-500/20 transition-all">
                <Shield className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-['Cinzel',serif]">
                  KnowYourLoan
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </span>
                <span className="block text-[10px] tracking-wider uppercase font-mono text-emerald-400/80 font-medium">
                  Predict • Explain
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2 bg-emerald-950/20 border border-emerald-500/10 px-2 py-1.5 rounded-xl backdrop-blur-md">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activePage === item.id
                      ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-emerald-950/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Primary CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleNavClick('assessment')}
                className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-emerald-950 transition-all bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-md shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-emerald-300/40"
              >
                <span>Assess Loan</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-zinc-300 hover:text-white bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-500/15 bg-[#060b08]/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between transition-all ${
                  activePage === item.id
                    ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>{item.label}</span>
                {activePage === item.id && <Activity className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
            <div className="pt-3 border-t border-emerald-950/40">
              <button
                onClick={() => handleNavClick('assessment')}
                className="w-full flex items-center justify-center px-5 py-3 text-sm font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-md shadow-emerald-500/20"
              >
                <span>Assess Loan</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
