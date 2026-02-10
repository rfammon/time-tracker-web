import { useTimerStore } from '@/stores/useTimerStore';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';
import { formatSeconds } from '@/lib/time-utils';

export function ActiveTimerOverlay() {
    const { isRunning, accumulatedTime, pause, resume, stop, activeActivityId, activeModuleName, lastResumeTime } = useTimerStore();
    const { agenda, completeActivity } = useAgendaStore();

    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: any;

        if (isRunning) {
            interval = window.setInterval(() => {
                const now = Date.now();
                const currentSession = lastResumeTime ? now - lastResumeTime : 0;
                setElapsed(accumulatedTime + currentSession);
            }, 1000);
        } else {
            setElapsed(accumulatedTime);
        }

        return () => clearInterval(interval);
    }, [isRunning, lastResumeTime, accumulatedTime]);

    if (!activeActivityId || !activeModuleName) return null;

    const activity = agenda.modules[activeModuleName]?.find(a => a.id === activeActivityId);
    if (!activity) return null;

    const timerString = formatSeconds(Math.floor(elapsed / 1000));

    const handleFinish = () => {
        const finalSeconds = stop();
        completeActivity(activeModuleName, activeActivityId, finalSeconds);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-background/90 backdrop-blur-md border-t z-[60] flex justify-center shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 max-w-4xl w-full justify-between">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Em Andamento</span>
                    <span className="font-semibold truncate max-w-[280px] md:max-w-md text-sm md:text-base">{activity.title}</span>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="text-2xl md:text-4xl font-mono font-black tracking-wider tabular-nums text-primary drop-shadow-sm">
                        {timerString}
                    </div>

                    <div className="flex gap-2">
                        {isRunning ? (
                            <Button size="icon" variant="secondary" className="h-9 w-9 md:h-11 md:w-11" onClick={() => pause()}>
                                <Pause className="h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                        ) : (
                            <Button size="icon" variant="secondary" className="h-9 w-9 md:h-11 md:w-11" onClick={() => resume()}>
                                <Play className="h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                        )}
                        <Button size="icon" variant="destructive" className="h-9 w-9 md:h-11 md:w-11" onClick={handleFinish}>
                            <Square className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
