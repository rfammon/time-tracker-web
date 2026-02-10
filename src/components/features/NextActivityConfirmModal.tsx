import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

interface NextActivityConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentActivityTitle: string;
    nextActivityTitle: string | null;
}

export function NextActivityConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    currentActivityTitle,
    nextActivityTitle
}: NextActivityConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Atividade Concluída! 🎉</DialogTitle>
                    <DialogDescription className="pt-2">
                        Você finalizou: <span className="font-bold text-foreground">"{currentActivityTitle}"</span>.
                    </DialogDescription>
                </DialogHeader>

                {nextActivityTitle ? (
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">Deseja iniciar a próxima atividade agora?</p>
                        <p className="text-lg font-bold mt-1 text-primary">"{nextActivityTitle}"</p>
                    </div>
                ) : (
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground italic">Esta foi a última atividade deste módulo.</p>
                    </div>
                )}

                <DialogFooter className="flex flex-row gap-2 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
                        <X className="w-4 h-4 mr-2" /> Agora não
                    </Button>
                    {nextActivityTitle && (
                        <Button onClick={onConfirm} className="flex-1 sm:flex-none font-bold">
                            <Play className="w-4 h-4 mr-2" /> Sim, iniciar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
