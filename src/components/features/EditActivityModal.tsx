import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from '@/lib/agenda-parser';
import { useAgendaStore } from '@/stores/useAgendaStore';

export function EditActivityModal({ activity, onClose }: { activity: Activity, onClose: () => void }) {
    const { agenda, setAgenda } = useAgendaStore();
    const [title, setTitle] = useState(activity.title);
    const [start, setStart] = useState(activity.plannedStart);
    const [end, setEnd] = useState(activity.plannedEnd);
    const [duration, setDuration] = useState(activity.plannedDuration);

    const handleSave = () => {
        const newModules = { ...agenda.modules };
        const moduleActivities = [...newModules[activity.module]];
        const idx = moduleActivities.findIndex(a => a.id === activity.id);

        if (idx !== -1) {
            moduleActivities[idx] = {
                ...moduleActivities[idx],
                title,
                plannedStart: start,
                plannedEnd: end,
                plannedDuration: duration
            };
            newModules[activity.module] = moduleActivities;
            setAgenda({ ...agenda, modules: newModules });
        }
        onClose();
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Atividade</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Título</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start" className="text-right">Início</Label>
                    <Input id="start" value={start} onChange={(e) => setStart(e.target.value)} className="col-span-3" placeholder="HH:mm:ss" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end" className="text-right">Fim</Label>
                    <Input id="end" value={end} onChange={(e) => setEnd(e.target.value)} className="col-span-3" placeholder="HH:mm:ss" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">Duração</Label>
                    <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="col-span-3" placeholder="HH:mm:ss" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </DialogFooter>
        </DialogContent>
    );
}
