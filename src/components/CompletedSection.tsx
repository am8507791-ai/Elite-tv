import React from 'react';
import { CompletedMatch } from '../types';
import { Film, Play, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CompletedSectionProps {
  matches: CompletedMatch[];
  loading: boolean;
  onSelect: (match: CompletedMatch) => void;
  searchTerm: string;
}

export function CompletedSection({ matches, loading, onSelect, searchTerm }: CompletedSectionProps) {
  const filtered = matches.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading recent highlights...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group glass rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => onSelect(match)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={match.thumbnail || 'https://via.placeholder.com/640x360?text=Match+Replay'} 
                alt={match.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform">
                  <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base truncate mb-1">{match.title}</h3>
              <p className="text-xs opacity-50 flex items-center gap-1">
                <Film className="w-3 h-3" /> Full Highlights
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
