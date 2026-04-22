import { useGame } from '@/game/GameContext';
import { CHOICE_EVENTS } from '@/game/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ChoiceEventDialog() {
  const { state, dispatch } = useGame();

  if (!state.choiceEvent) return null;

  const evt = CHOICE_EVENTS.find(e => e.id === state.choiceEvent!.eventId);
  if (!evt) return null;

  return (
    <Dialog open={true} onOpenChange={() => dispatch({ type: 'DISMISS_CHOICE_EVENT' })}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg flex items-center gap-2">
            <span className="text-2xl">{evt.emoji}</span>
            {evt.title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">{evt.description}</p>
        <div className="space-y-2">
          {evt.options.map((opt, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full text-left justify-start h-auto py-3 px-4"
              onClick={() => dispatch({ type: 'ANSWER_CHOICE_EVENT', optionIndex: idx })}
            >
              <div>
                <div className="font-medium text-sm">{idx + 1}. {opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
              </div>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          💡 Pilih dengan bijak! Setiap pilihan punya konsekuensi berbeda.
        </p>
      </DialogContent>
    </Dialog>
  );
}
