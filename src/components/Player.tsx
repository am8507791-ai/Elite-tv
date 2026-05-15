import React, { useEffect, useRef } from 'react';
import { Channel, CompletedMatch, Recommendation } from '../types';
import { ChevronLeft, Maximize2, Tv, Film, Radio, Play, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './ToastProvider';
import Hls from 'hls.js';

interface PlayerProps {
  key?: React.Key;
  item: {
    title: string;
    streamUrl?: string;
    iframeUrl?: string;
    id?: string;
    type?: 'live' | 'completed';
  };
  recommendations: Recommendation[];
  onSelect: (rec: Recommendation) => void;
  onBack: () => void;
}

export function Player({ item, recommendations, onSelect, onBack }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { title, streamUrl, iframeUrl, id, type } = item;
  const isLive = !!streamUrl;
  const { showToast } = useToast();

  const handleShare = async () => {
    if (!id) return showToast("Unable to share this item", "error");
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?${type === 'live' ? 'channel' : 'match'}=${id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Elite Cricket - ${title}`,
          text: `Watch ${title} on Elite Cricket TV!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard!", "success");
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay prevented', e));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error encountered, trying to recover...', data);
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error encountered, trying to recover...', data);
              hls?.recoverMediaError();
              break;
            default:
              // Cannot recover
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari and Native HLS support on iOS Devices
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay prevented', e));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <header className="h-16 flex items-center px-4 glass shrink-0 justify-between">
        <div className="flex items-center min-w-0">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors mr-2 shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold truncate">{title}</h1>
        </div>
        <button 
          onClick={handleShare}
          className="p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary transition-all flex items-center gap-2 font-bold text-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>SHARE</span>
        </button>
      </header>

      <div className="w-full bg-black aspect-video relative group border-b border-border shrink-0">
        {streamUrl ? (
          <video 
            ref={videoRef} 
            className="w-full h-full object-contain" 
            controls 
            playsInline
            autoPlay
            poster="https://i.postimg.cc/yYwqPn4L/In-Shot-20260430-203251896.jpg"
          />
        ) : iframeUrl ? (
          <iframe 
            src={iframeUrl} 
            className="w-full h-full border-none"
            allow="fullscreen; autoplay; encryption-media" 
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/40">Loading stream...</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">{title}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-primary animate-pulse' : 'bg-blue-500'}`} />
                <span className="text-sm font-medium opacity-70">
                  {isLive ? 'Live Now' : 'Replay Playback'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {isLive ? <Tv className="w-5 h-5 text-primary" /> : <Film className="w-5 h-5 text-primary" />}
                {isLive ? 'Other Channels' : 'More Replays'}
              </h3>
              <span className="text-xs font-bold bg-foreground/5 px-2 py-1 rounded-md opacity-60 uppercase tracking-widest">
                Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 10).map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => onSelect(rec)}
                  className="flex items-center gap-4 p-3 rounded-2xl glass hover:bg-primary/5 transition-all text-left group overflow-hidden border border-transparent hover:border-primary/20"
                >
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-foreground/5 shrink-0 relative shadow-sm flex items-center justify-center">
                    <img 
                      src={rec.type === 'live' ? rec.logo : rec.thumbnail} 
                      alt={rec.title} 
                      className={`w-full h-full transition-transform group-hover:scale-110 ${
                        rec.type === 'live' ? 'object-contain p-1.5' : 'object-cover'
                      }`}
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                    />
                    {rec.type === 'live' && (
                      <div className="absolute top-1 right-1 bg-red-600 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-sm uppercase">Live</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{rec.title}</h4>
                    <p className="text-xs opacity-50 capitalize flex items-center gap-1 mt-1">
                      {rec.type === 'live' ? <Radio className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {rec.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
