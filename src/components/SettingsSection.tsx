import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Send, 
  Moon, 
  Sun, 
  Monitor, 
  Heart, 
  ExternalLink, 
  Info, 
  ShieldCheck,
  Share2,
  Bell,
  BellOff,
  WifiOff,
  Download
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import { useToast } from './ToastProvider';
import { useState, useEffect } from 'react';

const ACCENT_COLORS = [
  { name: 'Orange', value: 'theme-orange', bg: 'bg-[#f06225]' },
  { name: 'Indigo', value: 'theme-indigo', bg: 'bg-[#6366f1]' },
  { name: 'Emerald', value: 'theme-emerald', bg: 'bg-[#10b981]' },
  { name: 'Rose', value: 'theme-rose', bg: 'bg-[#f43f5e]' },
  { name: 'Amber', value: 'theme-amber', bg: 'bg-[#f59e0b]' },
];

export function SettingsSection() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true';
    if (enabled && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        showToast("This browser does not support notifications", "error");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications-enabled', 'true');
        showToast("Notifications enabled!", "success");
        new Notification("Elite Cricket TV", {
          body: "Push notifications are now active!",
          icon: "https://i.ibb.co/S800S80/Remove-background-project.png",
          badge: "https://i.ibb.co/S800S80/Remove-background-project.png"
        });
      } else {
        showToast("Notification permission denied", "error");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications-enabled', 'false');
      showToast("Notifications disabled", "success");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Elite Cricket TV',
          text: 'Watch premium live cricket and highlights on Elite Cricket TV!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!", "success");
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto">
      {/* Theme Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Monitor className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Appearance</h3>
        </div>
        
        <div className="glass rounded-[32px] p-2 flex gap-1">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all",
              theme === 'light' ? "bg-background shadow-md text-primary" : "hover:bg-foreground/5 opacity-60"
            )}
            id="theme-light"
          >
            <Sun className="w-4 h-4" />
            <span className="text-sm font-bold">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all",
              theme === 'dark' ? "bg-background shadow-md text-primary" : "hover:bg-foreground/5 opacity-60"
            )}
            id="theme-dark"
          >
            <Moon className="w-4 h-4" />
            <span className="text-sm font-bold">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all",
              theme === 'system' ? "bg-background shadow-md text-primary" : "hover:bg-foreground/5 opacity-60"
            )}
            id="theme-system"
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-bold">System</span>
          </button>
        </div>

        <div className="glass rounded-[32px] p-6 space-y-4">
          <p className="text-sm font-bold opacity-60 ml-1">Accent Color</p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccent(color.value as any)}
                className={cn(
                  "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2",
                  accent === color.value ? "border-primary scale-110" : "border-transparent opacity-60 hover:opacity-100",
                  color.bg
                )}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Notifications</h3>
        </div>
        
        <button
          onClick={toggleNotifications}
          className="w-full glass rounded-[32px] p-6 flex items-center justify-between group hover:bg-primary/5 transition-all text-left"
          id="notification-toggle"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              notificationsEnabled ? "bg-primary/20 text-primary" : "bg-foreground/5 opacity-40"
            )}>
              {notificationsEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-bold">Push Notifications</p>
              <p className="text-xs opacity-40">
                {notificationsEnabled ? "You are receiving match updates" : "Get notified when new matches are added"}
              </p>
            </div>
          </div>
          <div className={cn(
            "w-12 h-6 rounded-full relative transition-colors duration-300",
            notificationsEnabled ? "bg-primary" : "bg-foreground/10"
          )}>
            <div className={cn(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
              notificationsEnabled ? "left-7" : "left-1"
            )} />
          </div>
        </button>
      </section>
      
      {/* Offline & App Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Offline & App</h3>
        </div>
        
        <div className="glass rounded-[32px] p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
              <WifiOff className="w-6 h-6 opacity-40" />
            </div>
            <div className="space-y-1">
              <p className="font-bold">Offline Mode</p>
              <p className="text-xs opacity-40 leading-relaxed">
                Matches you've recently viewed are automatically cached. You can watch them even without an internet connection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 opacity-40" />
            </div>
            <div className="space-y-1">
              <p className="font-bold">Install as App</p>
              <p className="text-xs opacity-40 leading-relaxed">
                Add Elite Cricket TV to your home screen for a full-screen experience and faster access.
              </p>
              <button 
                onClick={() => {
                  window.alert("Use your browser's 'Add to Home Screen' or 'Install' option to use Elite Cricket TV as an app.");
                }}
                className="text-xs font-bold text-primary mt-2 flex items-center gap-1"
              >
                Learn How <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Developer</h3>
        </div>
        
        <div className="glass rounded-[32px] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src="https://i.ibb.co/S800S80/Remove-background-project.png" 
                alt="Elite Cricket Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-black text-xl tracking-tight leading-none mb-1">MANISH JAISWAL</p>
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest">ELITE CRICKET OWNER</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <a
            href="https://t.me/Elite_Cricket"
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-[32px] p-6 flex items-center justify-between group hover:bg-primary/5 transition-all"
            id="telegram-link"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/20 flex items-center justify-center">
                <Send className="w-6 h-6 text-[#0088cc]" />
              </div>
              <div>
                <p className="font-bold">Join Telegram</p>
                <p className="text-xs opacity-40">Get instant updates & news</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
          </a>

          <button
            onClick={handleShare}
            className="glass rounded-[32px] p-6 flex items-center justify-between group hover:bg-primary/5 transition-all w-full text-left"
            id="share-button"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold">Share App</p>
                <p className="text-xs opacity-40">Invite your friends to watch</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">About</h3>
        </div>
        
        <div className="glass rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3 opacity-60">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Version</span>
            </div>
            <span className="text-sm font-bold opacity-40 italic">2.1.0-stable</span>
          </div>
          <div className="p-6 flex items-center justify-center gap-2 py-8 bg-foreground/5 italic">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-xs font-medium opacity-40">Built with passion for Cricket Fans</span>
          </div>
        </div>
      </section>
    </div>
  );
}
