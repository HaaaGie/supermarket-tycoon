import { useGame } from '@/game/GameContext';
import { SIDE_JOB_DEFS } from '@/game/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function SideJobPanel() {
  const { state, dispatch } = useGame();
  const jobs = state.sideJobs || [];
  const cooldown = state.sideJobCooldown || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold">💼 Side Jobs</h2>
        <Button
          onClick={() => dispatch({ type: 'GENERATE_SIDE_JOBS' })}
          disabled={cooldown > 0}
          size="sm"
        >
          {cooldown > 0 ? `⏳ ${cooldown}s` : '🔄 Cari Job Baru'}
        </Button>
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-2xl mb-2">💼</p>
            <p>Belum ada side job. Klik "Cari Job Baru" untuk mulai!</p>
            <p className="text-xs mt-1">Side job memberi uang dan gems tambahan.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {jobs.map(job => {
          const def = SIDE_JOB_DEFS.find(d => d.id === job.jobId);
          if (!def) return null;
          const rawPct = (job.progress / job.target) * 100;
          // Tampilkan persen bulat saja (1% .. 100%), tidak ada desimal
          const progressPct = Math.min(100, Math.max(0, Math.floor(rawPct)));
          const ticksLeft = Math.max(0, job.expiresAt - state.tickCount);
          const minutesLeft = Math.ceil(ticksLeft / 60);
          const isComplete = job.progress >= job.target;
          const isExpired = ticksLeft <= 0;

          return (
            <Card key={job.id} className={`transition-all ${isComplete ? 'ring-2 ring-primary' : ''} ${isExpired ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <span className="text-lg">{def.emoji}</span>
                  <span>{def.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{def.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Progress: {isComplete ? 100 : progressPct}%</span>
                  <span className={ticksLeft < 30 ? 'text-destructive font-bold' : ''}>
                    ⏰ {minutesLeft}m
                  </span>
                </div>
                <Progress value={isComplete ? 100 : progressPct} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">
                    💰 ${job.reward.toLocaleString()}
                    {job.gemReward > 0 && ` + ${job.gemReward}💎`}
                  </span>
                  {isComplete && !isExpired && (
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: 'COMPLETE_SIDE_JOB', sideJobId: job.id })}
                      className="text-xs"
                    >
                      ✅ Selesaikan
                    </Button>
                  )}
                  {isExpired && !isComplete && (
                    <span className="text-xs text-destructive">Kadaluarsa</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            💡 Side job otomatis berjalan seiring waktu. Selesaikan sebelum waktunya habis!
            Job baru bisa di-generate setiap {cooldown > 0 ? `${cooldown} detik lagi` : 'saat ini'}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
