import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { parseExcelAgenda } from '@/lib/agenda-parser';

export function AgendaImporter({ onClose }: { onClose?: () => void }) {
    const loadAgenda = useAgendaStore(state => state.loadAgenda);
    const setAgenda = useAgendaStore(state => state.setAgenda);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.name.endsWith('.md')) {
            const text = await file.text();
            loadAgenda(text);
            if (onClose) onClose();
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            try {
                const agenda = await parseExcelAgenda(file);
                setAgenda(agenda);
                if (onClose) onClose();
            } catch (e) {
                console.error(e);
                alert("Erro ao ler arquivo Excel. Verifique o formato.");
            }
        }
    }, [loadAgenda, setAgenda, onClose]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/markdown': ['.md'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        }
    });

    return (
        <div className="p-6 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                {isDragActive ? (
                    <p className="font-medium">Solte o arquivo aqui...</p>
                ) : (
                    <div className="space-y-1">
                        <p className="font-medium">Arraste um arquivo ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground">Suporta Markdown (.md) e Excel (.xlsx)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
