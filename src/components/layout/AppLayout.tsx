import { useState } from 'react';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AgendaImporter } from '@/components/features/AgendaImporter';
import * as XLSX from 'xlsx';
import { Menu, Clock, BarChart2, Upload, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const currentModule = useAgendaStore(state => state.currentModule);
    const setModule = useAgendaStore(state => state.setModule);
    const agendaData = useAgendaStore(state => state.agenda);

    const handleExport = () => {
        // Flatten data for export
        const rows: any[] = [];
        Object.entries(agendaData.modules).forEach(([modName, activities]) => {
            activities.forEach(act => {
                rows.push({
                    Modulo: modName,
                    Ordem: act.order,
                    Atividade: act.title,
                    Inicio_Planejado: act.plannedStart,
                    Fim_Planejado: act.plannedEnd,
                    Duracao_Planejada: act.plannedDuration,
                    Inicio_Real: act.realStart || '',
                    Fim_Real: act.realEnd || '',
                    Duracao_Real: act.realDuration || '',
                    Variacao: act.variation || '',
                    Status: act.status
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
        XLSX.writeFile(wb, "Relatorio_Treinamento.xlsx");
    };

    const modules = Object.keys(agendaData.modules).length > 0
        ? Object.keys(agendaData.modules)
        : ["Módulo I", "Módulo II", "Módulo III"];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 h-screen sticky top-0">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        TimeTracker
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-sm font-semibold text-muted-foreground mb-4 px-2">Módulos</div>
                    {modules.map(mod => (
                        <Button
                            key={mod}
                            variant={currentModule === mod ? "secondary" : "ghost"}
                            className={cn("w-full justify-start", currentModule === mod && "bg-secondary font-semibold")}
                            onClick={() => setModule(mod)}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {mod}
                        </Button>
                    ))}

                    <div className="my-4 border-t" />
                    <Button variant="ghost" className="w-full justify-start" onClick={handleExport}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Relatórios (Exportar Excel)
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start">
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Agenda
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Importar Agenda</DialogTitle>
                            </DialogHeader>
                            <AgendaImporter />
                        </DialogContent>
                    </Dialog>
                </nav>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    TimeTracker
                </h1>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm p-4 pt-20 overflow-y-auto">
                    <nav className="space-y-4">
                        <div className="text-sm font-semibold text-muted-foreground mb-2">Módulos</div>
                        {modules.map(mod => (
                            <Button
                                key={mod}
                                variant={currentModule === mod ? "secondary" : "ghost"}
                                className="w-full justify-start text-lg"
                                onClick={() => { setModule(mod); setIsMobileMenuOpen(false); }}
                            >
                                <Calendar className="mr-2 h-5 w-5" />
                                {mod}
                            </Button>
                        ))}

                        <div className="my-4 border-t" />

                        <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => { handleExport(); setIsMobileMenuOpen(false); }}>
                            <BarChart2 className="mr-2 h-5 w-5" />
                            Exportar Relatório
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start text-lg">
                                    <Upload className="mr-2 h-5 w-5" />
                                    Importar Agenda
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Importar Agenda</DialogTitle>
                                </DialogHeader>
                                <AgendaImporter onClose={() => setIsMobileMenuOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">
                {/* Added padding bottom for mobile overlay space */}
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
