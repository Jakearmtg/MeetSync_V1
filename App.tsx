import React, { useState, useCallback } from 'react';
import { CorrelationResult } from './types';
import { correlateTranscriptWithTasks } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { DownloadIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [transcriptContent, setTranscriptContent] = useState<string>('');
  const [tasksContent, setTasksContent] = useState<string>('');
  const [transcriptFileName, setTranscriptFileName] = useState<string>('');
  const [tasksFileName, setTasksFileName] = useState<string>('');
  const [results, setResults] = useState<CorrelationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCorrelate = useCallback(async () => {
    if (!transcriptContent || !tasksContent) {
      setError('Por favor, carregue ambos os arquivos.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const lines = tasksContent.split('\n').filter(line => line.trim() !== '');
      const tasksForPromptLines: string[] = [];
      const taskUrlMap = new Map<string, string>();

      lines.forEach(line => {
        const columns = line.split(',');
        if (columns.length >= 3) {
          const taskName = columns[1]?.trim().replace(/^"|"$/g, '');
          const taskUrl = columns[2]?.trim().replace(/^"|"$/g, '');
          if (taskName) {
              tasksForPromptLines.push(taskName);
              if (taskUrl) {
                taskUrlMap.set(taskName, taskUrl);
              }
          }
        }
      });
      
      if (tasksForPromptLines.length === 0) {
        setError("Não foram encontradas tarefas válidas no arquivo da lista de tarefas. Verifique se o arquivo está no formato CSV correto com o nome da tarefa na coluna B.");
        setIsLoading(false);
        return;
      }

      const tasksForPrompt = tasksForPromptLines.join('\n');
      const correlationResults = await correlateTranscriptWithTasks(transcriptContent, tasksForPrompt);
      
      const finalResults = correlationResults.map(result => ({
        ...result,
        taskUrl: taskUrlMap.get(result.taskName) || '',
      }));

      setResults(finalResults);
    } catch (err) {
      console.error(err);
      setError('Falha ao processar os arquivos. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  }, [transcriptContent, tasksContent]);
  
  const generateCsvContent = () => {
    if (results.length === 0) return null;
    const headers = '"Nome da Tarefa","Resumo","URL da Tarefa"';
    const rows = results.map(row => {
        const taskName = row.taskName.replace(/"/g, '""');
        const summary = row.summary.replace(/"/g, '""');
        const taskUrl = (row.taskUrl || '').replace(/"/g, '""');
        return `"${taskName}","${summary}","${taskUrl}"`;
    }).join('\n');
    return `${headers}\n${rows}`;
  };

  const handleExportCsv = () => {
    const csvContent = generateCsvContent();
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MeetSync_Resumo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  
  const isButtonDisabled = !transcriptContent || !tasksContent || isLoading;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            MeetSync
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Correlacione as transcrições das reuniões com as tarefas do seu projeto instantaneamente.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FileUpload
              id="transcript-upload"
              label="Carregar Transcrição da Reunião"
              onFileSelect={setTranscriptContent}
              onFileNameChange={setTranscriptFileName}
              fileName={transcriptFileName}
              acceptedFileTypes=".txt"
            />
            <FileUpload
              id="tasks-upload"
              label="Carregar Lista de Tarefas"
              onFileSelect={setTasksContent}
              onFileNameChange={setTasksFileName}
              fileName={tasksFileName}
              acceptedFileTypes=".txt,.csv"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleCorrelate}
              disabled={isButtonDisabled}
              className={`inline-flex items-center justify-center px-8 py-3 font-semibold text-white rounded-full transition-all duration-300 ease-in-out
                ${isButtonDisabled 
                  ? 'bg-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transform hover:scale-105'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Correlacionar e Resumir
                </>
              )}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-300">Resultados da Análise</h2>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200"
                aria-label="Exportar resultados como arquivo CSV"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Exportar CSV
              </button>
            </div>
            <ResultsTable results={results} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;