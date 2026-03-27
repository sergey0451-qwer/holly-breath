import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useGlobalPulse(userId) {
  const [globalState, setGlobalState] = useState({ active: false, startTime: 0, leaderId: null });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'global', 'pulse'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalState(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const toggleGlobalPulse = (currentState) => {
    // Toggle global pulse (Firebase broadcast)
    const newState = !currentState;
    setDoc(doc(db, 'global', 'pulse'), {
      active: newState,
      startTime: newState ? Date.now() : 0,
      leaderId: userId
    }, { merge: true }).catch(err => console.error("Global Pulse Sync Error:", err));
  };

  return { globalState, toggleGlobalPulse };
}
