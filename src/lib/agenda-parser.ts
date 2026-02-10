import * as XLSX from 'xlsx';

export interface Activity {
  id: string;
  module: string;
  order: number;
  title: string;
  plannedStart: string; // "13:00:00"
  plannedEnd: string;   // "13:10:00"
  plannedDuration: string; // "00:10:00"
  realStart?: string;
  realEnd?: string;
  realDuration?: string;
  variation?: string;
  status: 'pending' | 'running' | 'paused' | 'completed';
  isBreak?: boolean;
}

export interface Agenda {
  modules: {
    [key: string]: Activity[]; // "Módulo I", "Módulo II", etc.
  };
}

export const DEFAULT_AGENDA_MARKDOWN = `
## Módulo I

| # | Atividade | Planejado (Início) | Planejado (Fim) | Planejado (Duração) | Realizado (Início) | Realizado (Fim) | Realizado (Duração) | Variação |
|---|-----------|-------------------|-----------------|---------------------|-------------------|----------------|---------------------|----------|
| 1 | Apresentação Inicial e Combinados | 13:00:00 | 13:10:00 | 00:10:00 |  |  | 00:00:00 |  |
| 2 | Agenda | 13:10:00 | 13:15:00 | 00:05:00 | 00:00:00 |  | 00:00:00 |  |
| 3 | Reflexão - video queda de árvore | 13:15:00 | 13:25:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 4 | Apresentação do Instrutor e Objetivos do Modulo 1 | 13:25:00 | 13:30:00 | 00:05:00 | 00:00:00 |  | 00:00:00 |  |
| 5 | Bloco 1- A Padronização Estatisticas e depoimento Douglas | 13:30:00 | 13:40:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 6 | Bloco 1 - B Momento interação - Núvens de Palavras - Painel Ocorrências | 13:40:00 | 13:50:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 7 | Bloco 1  - C Aspectos Legais e Normativos e conclusão | 13:50:00 | 14:10:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 8 | Primeiro Bloco de Perguntas | 14:10:00 | 14:20:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 9 | Intervalo | 14:20:00 | 14:40:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 10 | Bloco 2 A - Escopo e Planejamento | 14:40:00 | 15:00:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 11 | Bloco 2 B - Plano de Trabalho | 15:00:00 | 15:10:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 12 | Bloco 2 C - Autorização de Supressão | 15:10:00 | 15:30:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 13 | Bloco 2 D - Ferramentas de Gestão e Verificação | 15:30:00 | 15:40:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 14 | Segundo Bloco de Perguntas | 15:40:00 | 15:50:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 15 | Bloco 2 E - Conclusão e Interação  | 15:50:00 | 16:00:00 | 00:10:00 |  |  |  |  |

## Módulo II

| # | Atividade | Planejado (Início) | Planejado (Fim) | Planejado (Duração) | Realizado (Início) | Realizado (Fim) | Realizado (Duração) | Variação |
|---|-----------|-------------------|-----------------|---------------------|-------------------|----------------|---------------------|----------|
| 1 | Apresentação Inicial e Combinados | 13:00:00 | 13:10:00 | 00:10:00 |  |  | 00:00:00 |  |
| 2 | Agenda e Quiz | 13:10:00 | 13:25:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 3 | Bloco 1 A - Risco Abóreo | 13:25:00 | 13:35:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 4 | Bloco 1 B - Avaliação de Falhas | 13:35:00 | 13:45:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 5 | Bloco 1 C - Avaliação de Raízes | 13:45:00 | 14:00:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 6 | Bloco 1 E - Avaliação de Tronco | 14:00:00 | 14:10:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 7 | Bloco 1 F - Avaliação de Galhos | 14:10:00 | 14:20:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 8 | Primeiro Bloco de Perguntas | 14:20:00 | 14:35:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 9 | Intervalo | 14:35:00 | 14:55:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 10 | Bloco 2 A - Avaliação de Alvos | 14:55:00 | 15:05:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 11 | Bloco 2 B - Avaliação de Risco | 15:05:00 | 15:15:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 12 | Bloco 2 C - Mobilização e isolamento | 15:15:00 | 15:25:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 13 | Segundo Bloco de Perguntas | 15:25:00 | 15:40:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 14 | Quiz | 15:40:00 | 15:50:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 15 | Encerramento do módulo II | 15:50:00 | 15:55:00 | 00:05:00 | 00:00:00 |  | 00:00:00 |  |

## Módulo III

| # | Atividade | Planejado (Início) | Planejado (Fim) | Planejado (Duração) | Realizado (Início) | Realizado (Fim) | Realizado (Duração) | Variação |
|---|-----------|-------------------|-----------------|---------------------|-------------------|----------------|---------------------|----------|
| 1 | Apresentação Inicial e Combinados | 13:00:00 | 13:10:00 | 00:10:00 |  |  | 00:00:00 |  |
| 2 | Agenda e Quiz | 13:10:00 | 13:25:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 3 | Bloco 1 A - Anatomia do Galho | 13:25:00 | 13:40:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 4 | Bloco 1 B - Tipos de Poda | 13:40:00 | 13:50:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 5 | Bloco 1 C - Perigos na Poda - Interação | 13:50:00 | 14:00:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 6 | Primeiro Bloco de Perguntas | 14:00:00 | 14:15:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 7 | Intervalo | 14:15:00 | 14:35:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 8 | Bloco 2 A - Técnicas de Corte | 14:35:00 | 14:55:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 9 | Bloco 2 B - Cuidados na Operação | 14:55:00 | 15:15:00 | 00:20:00 | 00:00:00 |  | 00:00:00 |  |
| 10 | Bloco 2 C - Ferramentas e EPIs | 15:15:00 | 15:25:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 11 | Bloco 2 B - Gestão de Resíduos e desmobilização | 15:25:00 | 15:35:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
| 12 | Segundo Bloco de Perguntas | 15:35:00 | 15:50:00 | 00:15:00 | 00:00:00 |  | 00:00:00 |  |
| 13 | Encerramento do módulo II | 15:50:00 | 16:00:00 | 00:10:00 | 00:00:00 |  | 00:00:00 |  |
`;

export function parseMarkdownAgenda(markdown: string): Agenda {
  const lines = markdown.split('\n');
  const modules: { [key: string]: Activity[] } = {};
  let currentModule = '';

  lines.forEach(line => {
    if (line.trim().startsWith('## Módulo')) {
      currentModule = line.trim().replace('## ', '');
      modules[currentModule] = [];
    } else if (line.trim().startsWith('|') && !line.includes('Atividade') && !line.includes('---')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 9 && currentModule) {
        const id = currentModule + '-' + parts[1]; // # column
        modules[currentModule].push({
          id,
          module: currentModule,
          order: parseInt(parts[1]) || 0,
          title: parts[2],
          plannedStart: parts[3],
          plannedEnd: parts[4],
          plannedDuration: parts[5],
          status: 'pending',
          isBreak: parts[2].toLowerCase().includes('intervalo'),
        });
      }
    }
  });

  return { modules };
}



export async function parseExcelAgenda(file: File): Promise<Agenda> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Assume first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Parse rows similar to markdown
        // Expected structure is not strictly defined in requirements, let's assume valid structure matches markdown table columns
        // Let's implement a robust finder: look for "Módulo" and table headers

        const modules: { [key: string]: Activity[] } = {};
        let currentModule = '';

        rawData.forEach((row) => {
          const rowStr = row.join(' ');

          if (rowStr.includes('Módulo')) {
            // Try to extract module name. E.g. "## Módulo I" or just "Módulo I" in a cell
            const modCell = row.find((cell: any) => typeof cell === 'string' && cell.includes('Módulo'));
            if (modCell) {
              currentModule = modCell.replace(/#/g, '').trim();
              modules[currentModule] = [];
            }
          }

          // Check if it's a data row
          // Needs at least a number in first col or 'Atividade' in 2nd etc. 
          // Let's map by index assuming the standard columns: #, Atividade, PlanStart, PlanEnd, PlanDur...

          // Validation: Check if row has a time-like string in 3rd/4th col
          if (currentModule && row.length >= 6) {
            const order = parseInt(row[0]);
            if (!isNaN(order)) {
              const id = currentModule + '-' + order;
              modules[currentModule].push({
                id,
                module: currentModule,
                order: order,
                title: row[1],
                plannedStart: row[2], // Time values might be decimals in Excel, need handling? 
                // For now assume text "13:00:00" or handle conversion later if needed
                // If simple text, it works.
                plannedEnd: row[3],
                plannedDuration: row[4],
                status: 'pending',
                isBreak: row[1]?.toLowerCase().includes('intervalo')
              });
            }
          }
        });

        resolve({ modules });

      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
