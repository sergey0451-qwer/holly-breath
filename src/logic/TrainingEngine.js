import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { MARATHON_90 } from '../data/academy_content';

export const TRAINING_CURRICULUM = MARATHON_90;

class TrainingEngine {
  constructor(userId = 'default') {
    this.userId = userId;
    this.storageKey = `hb_training_progress_${userId}`;
    this.state = this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    const defaultTasks = { morning: false, session: false, evening: false, date: new Date().toDateString() };
    const state = saved ? JSON.parse(saved) : {
      currentDay: 1, // Start at day 1
      completedDays: [], // Array of completed days [1, 2, 3...]
      dailyTasks: defaultTasks,
      stats: { endurance: [45, 52] }
    };
    
    // Reset daily checkboxes if a new day has arrived
    if (state.dailyTasks && state.dailyTasks.date !== new Date().toDateString()) {
      state.dailyTasks = defaultTasks;
    }
    return state;
  }

  // CORE RULE: User cannot access day N unless day N-1 is in completedDays!
  isDayUnlocked(dayNumber) {
    if (dayNumber === 1) return true;
    return this.state.completedDays.includes(dayNumber - 1);
  }

  completeDay(day) {
    if (!this.state.completedDays.includes(day)) {
      // Only complete if it was actually unlocked
      if (this.isDayUnlocked(day)) {
        this.state.completedDays.push(day);
        
        // Auto-advance current pointer to the next incomplete day, capping at 90
        const nextDay = day + 1;
        if (nextDay > this.state.currentDay && nextDay <= 90) {
          this.state.currentDay = nextDay;
        }
        this.saveState();
      }
    }
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    // Sync to Firebase Cloud
    try {
      setDoc(doc(db, "users", this.userId), {
        state: this.state,
        lastActive: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Cloud sync failed:", e);
    }
  }

  getCurrentDaySettings() {
    return TRAINING_CURRICULUM[this.state.currentDay - 1] || TRAINING_CURRICULUM[0];
  }
}

export default TrainingEngine;
