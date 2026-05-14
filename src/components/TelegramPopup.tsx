import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export function TelegramPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the popup in this session
    const hasSeenPopup = sessionStorage.getItem('telegram-popup-dismissed');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Show popup after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('telegram-popup-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm glass rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="relative p-8 text-center space-y-6">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/5 transition-colors opacity-40 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-20 h-20 rounded-3xl bg-[#0088cc]/20 flex items-center justify-center animate-bounce shadow-lg shadow-[#0088cc]/20">
                <Send className="w-10 h-10 text-[#0088cc]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Join Our Community</h2>
                <p className="text-sm opacity-60 font-medium leading-relaxed px-4">
                  Stay updated with latest matches, live links, and premium cricket updates instantly.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <a 
                  href="https://t.me/Elite_Cricket"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="w-full py-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0088cc]/30 group"
                >
                  JOIN TELEGRAM
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <button 
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl font-bold opacity-40 hover:opacity-100 transition-opacity text-xs uppercase tracking-widest"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1.5 w-full bg-[#0088cc]/50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
