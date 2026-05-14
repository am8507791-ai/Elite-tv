import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider, useToast } from './components/ToastProvider';
import { LiveSection } from './components/LiveSection';
import { CompletedSection } from './components/CompletedSection';
import { SettingsSection } from './components/SettingsSection';
import { TelegramPopup } from './components/TelegramPopup';
import { NotificationHandler } from './components/NotificationHandler';
import { NotificationCenter } from './components/NotificationCenter';
import { Player } from './components/Player';
import { LanguageModal } from './components/LanguageModal';
import { Channel, CompletedMatch, Recommendation } from './types';
import { Search, Radio, PlayCircle, Trophy, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';

function AppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'live' | 'completed' | 'settings'>('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('cached-channels');
    return saved ? JSON.parse(saved) : [];
  });
  const [matches, setMatches] = useState<CompletedMatch[]>(() => {
    const saved = localStorage.getItem('cached-matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [selectedMatchForLang, setSelectedMatchForLang] = useState<CompletedMatch | null>(null);

  const [playingItem, setPlayingItem] = useState<{
    id?: string;
    title: string;
    streamUrl?: string;
    iframeUrl?: string;
    type?: 'live' | 'completed';
  } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const qChannels = query(collection(db, "channels"), orderBy("createdAt", "asc"));
    const unsubChannels = onSnapshot(qChannels, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel));
        setChannels(data);
        localStorage.setItem('cached-channels', JSON.stringify(data));
      },
      (error) => {
        if (!navigator.onLine) return; // Ignore if offline
        showToast("Failed to load channels: " + error.message);
      }
    );

    const qMatches = query(collection(db, "completedMatches"), orderBy("createdAt", "desc"));
    const unsubMatches = onSnapshot(qMatches, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedMatch));
        setMatches(data);
        localStorage.setItem('cached-matches', JSON.stringify(data));
        setLoading(false);
      },
      (error) => {
        if (!navigator.onLine) return; // Ignore if offline
        showToast("Failed to load replays: " + error.message);
      }
    );

    return () => {
      unsubChannels();
      unsubMatches();
    };
  }, [showToast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('channel');
    const matchId = params.get('match');

    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        handleChannelSelect(channel);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } else if (matchId && matches.length > 0) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        handleMatchRequest(match);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [channels, matches]);

  const handleChannelSelect = (channel: Channel) => {
    if (!channel.streamUrl) return showToast("Stream unavailable right now");
    setPlayingItem({
      id: channel.id,
      title: channel.name,
      streamUrl: channel.streamUrl,
      type: 'live'
    });
  };

  const handleMatchRequest = (match: CompletedMatch) => {
    setSelectedMatchForLang(match);
  };

  const handleMatchSelect = (match: CompletedMatch, language: 'hindi' | 'english') => {
    const url = language === 'hindi' ? match.hindiLink : match.englishLink;
    if (!url) return showToast(`${language} playback is not available`);
    
    setPlayingItem({
      id: match.id,
      title: match.title,
      iframeUrl: url,
      type: 'completed'
    });
    setSelectedMatchForLang(null);
  };

  const isPlayingLive = !!playingItem?.streamUrl;
  const isPlayingReplay = !!playingItem?.iframeUrl;

  const handleRecommendationSelect = (rec: Recommendation) => {
    if (rec.type === 'live') {
      const channel = channels.find(c => c.id === rec.id);
      if (channel) handleChannelSelect(channel);
    } else {
      const match = matches.find(m => m.id === rec.id);
      if (match) handleMatchRequest(match);
    }
  };

  const recommendations: Recommendation[] = (isPlayingLive 
    ? channels.map(c => ({ id: c.id, title: c.name, logo: c.logo, type: 'live' as const }))
    : isPlayingReplay 
      ? matches.map(m => ({ id: m.id, title: m.title, thumbnail: m.thumbnail, type: 'completed' as const }))
      : []
  ).filter(item => item.id !== playingItem?.id);

  return (
    <div className="min-h-screen pb-24 bg-background transition-colors duration-300">
      <TelegramPopup />
      <NotificationHandler />
      
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white text-[10px] font-bold py-1 px-4 text-center sticky top-0 z-[60] uppercase tracking-widest overflow-hidden"
          >
            Offline Mode • Viewing Cached Content Only
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 transition-transform hover:scale-110 active:scale-95 duration-300">
              <img 
                src="https://i.ibb.co/S800S80/Remove-background-project.png" 
                alt="Elite Cricket Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter pt-1">ELITE CRICKET</h1>
          </div>
          
          <div className="flex-1 max-w-md relative hidden sm:block">
            {activeTab !== 'settings' && (
              <>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'live' ? "Search channels..." : "Search highlights..."}
                  className="w-full h-11 pl-12 pr-4 rounded-2xl glass focus:ring-2 ring-primary/20 outline-none transition-all placeholder:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="search-desktop"
                />
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationCenter onSelectMatch={handleMatchRequest} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-8">
        {/* Mobile Search */}
        {activeTab !== 'settings' && (
          <div className="mb-6 relative sm:hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl glass outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-mobile"
            />
          </div>
        )}

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
              "w-1 h-8 rounded-full transition-colors",
              activeTab === 'live' ? "bg-primary" : activeTab === 'completed' ? "bg-primary/20" : "bg-primary/40"
            )} />
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab === 'live' ? "Premium Live Streams" : 
               activeTab === 'completed' ? "Recent Match Replays" : "Application Settings"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'live' ? (
                <LiveSection 
                  channels={channels}
                  loading={loading}
                  onSelect={handleChannelSelect} 
                  searchTerm={searchTerm} 
                />
              ) : activeTab === 'completed' ? (
                <CompletedSection 
                  matches={matches}
                  loading={loading}
                  onSelect={handleMatchRequest} 
                  searchTerm={searchTerm} 
                />
              ) : (
                <SettingsSection />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
        <div className="flex items-center gap-2 p-2 rounded-[32px] glass shadow-2xl border border-white/5">
          <button
            onClick={() => { setActiveTab('live'); setSearchTerm(''); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[24px] font-bold transition-all",
              activeTab === 'live' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-foreground/5 opacity-60"
            )}
            id="nav-live"
          >
            <Radio className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">LIVE</span>
          </button>
          <button
            onClick={() => { setActiveTab('completed'); setSearchTerm(''); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[24px] font-bold transition-all",
              activeTab === 'completed' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-foreground/5 opacity-60"
            )}
            id="nav-replays"
          >
            <PlayCircle className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">REPLAYS</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setSearchTerm(''); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[24px] font-bold transition-all",
              activeTab === 'settings' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-foreground/5 opacity-60"
            )}
            id="nav-settings"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
        </div>
      </nav>

      <LanguageModal 
        match={selectedMatchForLang} 
        onClose={() => setSelectedMatchForLang(null)}
        onSelect={handleMatchSelect}
      />

      {/* Player */}
      <AnimatePresence mode="wait">
        {playingItem && (
          <Player 
            key={`${playingItem.id}-${playingItem.title}`}
            item={playingItem}
            recommendations={recommendations}
            onSelect={handleRecommendationSelect}
            onBack={() => setPlayingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
