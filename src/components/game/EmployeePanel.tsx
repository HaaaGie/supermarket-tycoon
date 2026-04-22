import { useGame } from '@/game/GameContext';
import { EMPLOYEE_TYPES, formatMoney, getEmployeeLevelXP, getEmployeeLevelBonus } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function EmployeePanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="space-y-6">
      {/* Hire */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>🤝</span> Rekrut Pegawai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMPLOYEE_TYPES.map(emp => {
              const hiringCost = emp.baseSalary * 10;
              const count = state.employees.filter(e => e.typeId === emp.id).length;

              return (
                <div key={emp.id} className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{emp.emoji}</span>
                    <div>
                      <div className="font-heading font-semibold text-foreground">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.description}</div>
                    </div>
                  </div>
                  <div className="text-xs text-primary font-medium mb-2">✨ {emp.effect}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Gaji: {formatMoney(emp.baseSalary)}/hari</span>
                    <span className="text-xs font-medium text-foreground">Punya: {count}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => dispatch({ type: 'HIRE_EMPLOYEE', typeId: emp.id })}
                    disabled={state.money < hiringCost}
                    className="w-full"
                  >
                    Rekrut ({formatMoney(hiringCost)})
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>👥</span> Pegawai Saat Ini ({state.employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.employees.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 font-heading">Belum ada pegawai. Rekrut sekarang!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.employees.map(emp => {
                const empType = EMPLOYEE_TYPES.find(e => e.id === emp.typeId);
                const xpNeeded = getEmployeeLevelXP(emp.level);
                const xpPercent = Math.min((emp.xp / xpNeeded) * 100, 100);
                const levelBonus = getEmployeeLevelBonus(emp.level);
                const moodEmoji = emp.mood >= 70 ? '😊' : emp.mood >= 40 ? '😐' : emp.mood >= 15 ? '😟' : '😡';
                const moodColor = emp.mood >= 70 ? 'bg-primary' : emp.mood >= 40 ? 'bg-secondary' : 'bg-destructive';

                return (
                  <div key={emp.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{empType?.emoji}</span>
                        <div>
                          <div className="font-heading font-medium text-sm text-foreground">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">{empType?.name} • Lv.{emp.level}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        +{Math.round((levelBonus - 1) * 100)}% buff
                      </span>
                    </div>

                    {/* XP Bar */}
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>⭐ XP</span>
                        <span>{Math.floor(emp.xp)}/{xpNeeded}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
                      </div>
                    </div>

                    {/* Mood Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{moodEmoji} Mood</span>
                        <span>{Math.floor(emp.mood)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${moodColor}`} style={{ width: `${emp.mood}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: 'BOOST_EMPLOYEE_MOOD', employeeId: emp.id })}
                        disabled={state.money < 100}
                        className="flex-1 text-xs"
                      >
                        💰 Bonus ($100)
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch({ type: 'FIRE_EMPLOYEE', employeeId: emp.id })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                      >
                        Pecat
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
