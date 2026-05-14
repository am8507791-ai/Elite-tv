import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from './ToastProvider';
import { CompletedMatch } from '../types';

export function NotificationHandler() {
  const { showToast } = useToast();

  useEffect(() => {
    // Only set up listener if browser supports notifications
    if (!("Notification" in window)) return;

    let isFirstRun = true;

    // We'll listen to the most recent match
    const qMatches = query(
      collection(db, "completedMatches"), 
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(qMatches, (snapshot) => {
      // First run: just mark as initialized so we don't notify for current top item
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        // We only care about new additions
        if (change.type === "added") {
          const match = { ...change.doc.data(), id: change.doc.id } as CompletedMatch;
          const notificationsEnabled = localStorage.getItem('notifications-enabled') === 'true';
          
          // Native Notification
          if (notificationsEnabled && Notification.permission === "granted") {
            try {
              // Create options with icon
              const options: any = {
                body: match.title,
                icon: "https://i.ibb.co/S800S80/Remove-background-project.png", // Main App Icon
                image: match.thumbnail, // Show match thumbnail in notification body if supported
                badge: "https://i.ibb.co/S800S80/Remove-background-project.png",
                tag: match.id,
                silent: false,
                requireInteraction: true // Keep it visible until user acts
              };

              const n = new Notification("Elite Cricket TV: New Highlights!", options);
              
              n.onclick = (e) => {
                e.preventDefault();
                window.focus();
                // We might need to communicate back to open the match, 
                // but since we are in the same window, it's easier.
                n.close();
              };
            } catch (err) {
              console.error("Failed to show native notification:", err);
            }
          }
          
          // App-level Toast (always show if app is open, maybe?)
          // Actually user said "push notification", so maybe just native if enabled.
          // But toast is nice feedback.
          if (notificationsEnabled) {
            showToast(`New Match: ${match.title}`, "success");
          }
        }
      });
    });

    return () => unsub();
  }, [showToast]);

  return null;
}
