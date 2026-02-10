import { useTimerStore } from '@/stores/useTimerStore';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatSeconds } from '@/lib/time-utils';
import { useWakeLock } from '@/hooks/useWakeLock';
import { NextActivityConfirmModal } from './NextActivityConfirmModal';


export function ActiveTimerOverlay() {
    const { isRunning, accumulatedTime, pause, resume, stop, reset, start, activeActivityId, activeModuleName, lastResumeTime } = useTimerStore();
    const { agenda, startActivity, completeActivity } = useAgendaStore();

    useWakeLock(isRunning);

    const [elapsed, setElapsed] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [lastCompletedActivity, setLastCompletedActivity] = useState<{ title: string, id: string, module: string } | null>(null);
    const [predictedNextActivity, setPredictedNextActivity] = useState<any>(null);

    // Helpers to find adjacent activities
    const getAdjacentActivity = (id: string, module: string, direction: 'prev' | 'next') => {
        const activities = agenda.modules[module] || [];
        const currentIndex = activities.findIndex(a => a.id === id);
        const moduleNames = Object.keys(agenda.modules).sort();
        const currentModIdx = moduleNames.indexOf(module);

        if (direction === 'next') {
            if (currentIndex !== -1 && currentIndex < activities.length - 1) {
                return { ...activities[currentIndex + 1], module };
            }
            if (currentModIdx !== -1 && currentModIdx < moduleNames.length - 1) {
                const nextModName = moduleNames[currentModIdx + 1];
                const nextActArr = agenda.modules[nextModName] || [];
                if (nextActArr.length > 0) return { ...nextActArr[0], module: nextModName };
            }
        } else {
            if (currentIndex > 0) {
                return { ...activities[currentIndex - 1], module };
            }
            if (currentModIdx > 0) {
                const prevModName = moduleNames[currentModIdx - 1];
                const prevActArr = agenda.modules[prevModName] || [];
                if (prevActArr.length > 0) return { ...prevActArr[prevActArr.length - 1], module: prevModName };
            }
        }
        return null;
    };

    const nextActivity = activeActivityId ? getAdjacentActivity(activeActivityId, activeModuleName!, 'next') : null;
    const prevActivity = activeActivityId ? getAdjacentActivity(activeActivityId, activeModuleName!, 'prev') : null;

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
        const activity = agenda.modules[activeModuleName!]?.find(a => a.id === activeActivityId);
        if (!activity) return;

        // CRITICAL: Identify next activity BEFORE calling stop()
        const next = nextActivity;

        const finalSeconds = stop();
        completeActivity(activeModuleName!, activeActivityId!, finalSeconds);

        setLastCompletedActivity({
            title: activity.title,
            id: activeActivityId!,
            module: activeModuleName!
        });
        setPredictedNextActivity(next);
        setShowConfirm(true);
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        const target = direction === 'next' ? nextActivity : prevActivity;
        if (target) {
            // Stop current if any (don't save time, just skip)
            stop();
            start(target.module, target.id);
            startActivity(target.module, target.id);
        }
    };

    const handleConfirmNext = () => {
        if (predictedNextActivity) {
            start(predictedNextActivity.module, predictedNextActivity.id);
            startActivity(predictedNextActivity.module, predictedNextActivity.id);
        }
        setShowConfirm(false);
    };

    const handleCloseConfirm = () => {
        setShowConfirm(false);
        setLastCompletedActivity(null);
        setPredictedNextActivity(null);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-background/90 backdrop-blur-md border-t z-[60] flex justify-center shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 max-w-4xl w-full justify-between">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Em Andamento</span>
                    <span className="font-semibold truncate max-w-[280px] md:max-w-md text-sm md:text-base">{activity.title}</span>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                            onClick={() => handleNavigate('prev')}
                            disabled={!prevActivity}
                            title="Atividade Anterior"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <div className="text-2xl md:text-4xl font-mono font-black tracking-wider tabular-nums text-primary drop-shadow-sm px-2">
                            {timerString}
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                            onClick={() => handleNavigate('next')}
                            disabled={!nextActivity}
                            title="Próxima Atividade"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
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
                        <Button size="icon" variant="ghost" className="h-9 w-9 md:h-11 md:w-11 text-muted-foreground hover:text-amber-600" onClick={reset} title="Reiniciar Contador">
                            <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-9 w-9 md:h-11 md:w-11" onClick={handleFinish}>
                            <Square className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                        </Button>
                    </div>
                </div>
            </div>

            <NextActivityConfirmModal
                isOpen={showConfirm}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmNext}
                currentActivityTitle={lastCompletedActivity?.title || ""}
                nextActivityTitle={predictedNextActivity?.title || null}
            />
        </div>
    );
}
