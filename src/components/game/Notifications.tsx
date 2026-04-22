import { useGame } from '@/game/GameContext';
import { useEffect } from 'react';

export default function Notifications() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', id: state.notifications[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  if (state.notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {state.notifications.map(n => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-coin cursor-pointer ${
            n.type === 'success' ? 'bg-primary text-primary-foreground' :
            n.type === 'warning' ? 'bg-secondary text-secondary-foreground' :
            'bg-accent text-accent-foreground'
          }`}
          onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', id: n.id })}
        >
          {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'} {n.text}
        </div>
      ))}
    </div>
  );
}
