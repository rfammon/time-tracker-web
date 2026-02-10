import { useState } from 'react';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, Square, CheckCircle2, Settings2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditActivityModal } from './EditActivityModal';

export function AgendaTimeline() {
    const { agenda, currentModule, startActivity, completeActivity, totalVariation } = useAgendaStore();
    const activities = agenda.modules[currentModule] || [];
    const { isRunning, start, pause, resume, stop, activeActivityId } = useTimerStore();
    const [editingActivity, setEditingActivity] = useState<any>(null);

    const handleStart = (id: string) => {
        start(currentModule, id);
        startActivity(currentModule, id);
    };

    const handleFinish = (id: string) => {
        const elapsedSeconds = stop();
        completeActivity(currentModule, id, elapsedSeconds);
    };

    const formatVariation = (seconds: number) => {
        const abs = Math.abs(seconds);
        const m = Math.floor(abs / 60);
        const s = abs % 60;
        const sign = seconds >= 0 ? '+' : '-';
        return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Variação Total</p>
                            <p className={cn(
                                "text-xl font-bold font-mono",
                                totalVariation > 0 ? "text-amber-500" : "text-emerald-500"
                            )}>
                                {formatVariation(totalVariation)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Progresso</p>
                            <p className="text-xl font-bold">
                                {activities.filter(a => a.status === 'completed').length} / {activities.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn(
                    "border-2",
                    totalVariation > 300 ? "bg-red-500/5 border-red-500/20" : "bg-muted/10 border-transparent"
                )}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-lg",
                            totalVariation > 300 ? "bg-red-500/10" : "bg-muted"
                        )}>
                            <AlertTriangle className={cn(
                                "w-5 h-5",
                                totalVariation > 300 ? "text-red-500" : "text-muted-foreground"
                            )} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status do Horário</p>
                            <p className="text-sm font-medium">
                                {totalVariation > 300 ? "Atraso Significativo" : totalVariation < -300 ? "Adiantado" : "Dentro do Prazo"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between mt-8">
                <h2 className="text-2xl font-bold tracking-tight">{currentModule}</h2>
                <Badge variant="outline" className="text-base px-4 py-1">
                    {activities.length} Atividades
                </Badge>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const isActive = activeActivityId === activity.id;
                    const isCompleted = activity.status === 'completed';
                    const isNext = !isCompleted && !isActive && (index === 0 || activities[index - 1]?.status === 'completed');

                    return (
                        <Card
                            key={activity.id}
                            className={cn(
                                "transition-all duration-300 border-l-4",
                                isActive ? "border-l-primary shadow-md scale-[1.01]" : "border-l-transparent",
                                isCompleted ? "opacity-75 bg-muted/30" : "bg-card",
                                isNext && "border-l-muted-foreground/50 border-dashed"
                            )}
                        >
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex flex-col gap-1 min-w-[120px]">
                                    <div className="text-sm font-mono font-bold text-muted-foreground">
                                        {activity.plannedStart} - {activity.plannedEnd}
                                    </div>
                                    {activity.realStart && (
                                        <div className="text-xs text-primary font-bold">
                                            RH: {activity.realStart}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg leading-tight">{activity.title}</span>
                                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        {activity.isBreak && <Badge variant="secondary" className="text-xs font-bold">INTERVALO</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-4 uppercase font-bold tracking-tighter">
                                        <span>PLANO: {activity.plannedDuration}</span>
                                        {isCompleted && (
                                            <span className={cn(
                                                activity.variation && activity.variation.startsWith('+') ? "text-amber-600" : "text-emerald-600"
                                            )}>
                                                VARIACAO: {activity.variation}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    {isActive && (
                                        <>
                                            {isRunning ? (
                                                <Button size="sm" variant="outline" onClick={pause} className="flex-1 md:w-24">
                                                    <Pause className="mr-2 h-4 w-4" /> Pausar
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={resume} className="flex-1 md:w-24">
                                                    <Play className="mr-2 h-4 w-4" /> Retomar
                                                </Button>
                                            )}
                                            <Button size="sm" variant="destructive" onClick={() => handleFinish(activity.id)} className="flex-1">
                                                <Square className="mr-2 h-4 w-4" /> Finalizar
                                            </Button>
                                        </>
                                    )}

                                    {!isActive && !isCompleted && (
                                        <Button
                                            size="sm"
                                            variant={isNext ? "default" : "ghost"}
                                            onClick={() => handleStart(activity.id)}
                                            disabled={isRunning}
                                            className="w-full md:w-28 font-bold"
                                        >
                                            <Play className="mr-2 h-4 w-4" /> Iniciar
                                        </Button>
                                    )}

                                    <Dialog open={editingActivity?.id === activity.id} onOpenChange={(open) => !open && setEditingActivity(null)}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingActivity(activity)}>
                                                <Settings2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        {editingActivity && <EditActivityModal activity={editingActivity} onClose={() => setEditingActivity(null)} />}
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
