import React, { useState, useEffect } from 'react';
import { Bell, X, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CompletedMatch } from '../types';
import { cn } from '../lib/utils';

interface NotificationCenterProps {
  onSelectMatch: (match: CompletedMatch) => void;
}

export function NotificationCenter({ onSelectMatch }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CompletedMatch[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // We'll listen for the 10 most recent matches
    const q = query(collection(db, "completedMatches"), orderBy("createdAt", "desc"), limit(10));
    
    // Check last read timestamp from local storage
    const lastReadTime = parseInt(localStorage.getItem('notification-last-read') || '0');

    const unsub = onSnapshot(q, (snapshot) => {
      const items: CompletedMatch[] = [];
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as CompletedMatch;
        items.push({ ...data, id: doc.id });
        
        // Count as unread if created after our last read time
        if (data.createdAt && (data.createdAt as any).toMillis() > lastReadTime) {
          unread++;
        }
      });
      
      setNotifications(items);
      setUnreadCount(unread);
    });

    return () => unsub();
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen) {
      setUnreadCount(0);
      localStorage.setItem('notification-last-read', Date.now().toString());
    }
    setIsOpen(!isOpen);
  };

  const handleMatchClick = (match: CompletedMatch) => {
    onSelectMatch(match);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className={cn(
          "p-2.5 rounded-2xl transition-all relative group",
          isOpen ? "bg-primary text-white" : "glass hover:bg-foreground/5"
        )}
      >
        <Bell className={cn("w-5 h-5", isOpen ? "animate-none" : "group-hover:animate-ring")} />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[320px] sm:w-[380px] glass rounded-[32px] shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Notifications</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Recent Match Updates</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-foreground/5 opacity-40 hover:opacity-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {notifications.map((match) => (
                      <button
                        key={match.id}
                        onClick={() => handleMatchClick(match)}
                        className="w-full p-4 flex gap-4 hover:bg-primary/5 transition-colors text-left group"
                      >
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-foreground/5 shrink-0">
                          <img 
                            src={match.thumbnail} 
                            alt={match.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {match.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 opacity-40">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">
                              New Highlight Available
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                      <Bell className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm opacity-40 font-medium">No notifications yet</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-foreground/5 text-center">
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none">
                  Elite Cricket TV • Real-time Updates
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
