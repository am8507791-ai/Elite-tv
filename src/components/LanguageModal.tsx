import React from 'react';
import { CompletedMatch } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Globe, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LanguageModalProps {
  match: CompletedMatch | null;
  onClose: () => void;
  onSelect: (match: CompletedMatch, lang: 'hindi' | 'english') => void;
}

export function LanguageModal({ match, onClose, onSelect }: LanguageModalProps) {
  return (
    <AnimatePresence>
      {match && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative glass p-8 rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden border border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/5 transition-colors"
              id="close-lang-modal"
            >
              <X className="w-5 h-5 opacity-40" />
            </button>

            <h2 className="text-xl font-bold mb-2 text-center">{match.title}</h2>
            <p className="text-sm opacity-60 text-center mb-8 px-4">Choose your preferred commentary language for this replay.</p>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => onSelect(match, 'hindi')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all h-14",
                  match.hindiLink 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                    : "opacity-50 cursor-not-allowed bg-foreground/5"
                )}
                disabled={!match.hindiLink}
                id="select-hindi"
              >
                <Languages className="w-5 h-5" /> Hindi Commentary
              </button>
              <button
                onClick={() => onSelect(match, 'english')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all border-2 h-14",
                  match.englishLink 
                    ? "border-primary text-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-95" 
                    : "opacity-50 cursor-not-allowed border-foreground/10"
                )}
                disabled={!match.englishLink}
                id="select-english"
              >
                <Globe className="w-5 h-5" /> English Commentary
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
