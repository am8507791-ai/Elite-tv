import React from 'react';
import { Channel } from '../types';
import { Tv, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveSectionProps {
  channels: Channel[];
  loading: boolean;
  onSelect: (channel: Channel) => void;
  searchTerm: string;
}

export function LiveSection({ channels, loading, onSelect, searchTerm }: LiveSectionProps) {
  const filtered = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Searching for live streams...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Tv className="w-12 h-12 mb-4" />
        <p>{searchTerm ? "No matching channels" : "No live channels at the moment"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filtered.map((channel, index) => (
        <motion.button
          key={channel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(channel)}
          className="group relative flex flex-col items-center p-4 glass rounded-3xl hover:bg-primary/5 hover:border-primary/50 transition-all border-2 border-transparent"
        >
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            Live
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/5 mb-3 p-2 flex items-center justify-center">
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="w-full h-full object-contain transition-transform group-hover:scale-110"
                onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?background=f97316&color=fff&bold=true&name=${channel.name}`)}
              />
            ) : (
              <Tv className="w-8 h-8 opacity-40" />
            )}
          </div>
          <span className="text-sm font-semibold truncate w-full text-center">{channel.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
