import React from 'react';
import { CorrelationResult } from '../types';

interface ResultsTableProps {
  results: CorrelationResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-800">
          <thead className="bg-slate-800/50">
            <tr>
              <th scope="col" className="w-1/4 py-3.5 px-6 text-left text-sm font-semibold text-slate-300">
                Nome da Tarefa
              </th>
              <th scope="col" className="w-2/4 py-3.5 px-6 text-left text-sm font-semibold text-slate-300">
                Resumo da Discussão
              </th>
              <th scope="col" className="w-1/4 py-3.5 px-6 text-left text-sm font-semibold text-slate-300">
                URL da Tarefa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-slate-700/50 transition-colors duration-200">
                <td className="whitespace-normal py-4 px-6 text-sm font-medium text-slate-300 align-top">
                  {result.taskName}
                </td>
                <td className="whitespace-pre-wrap py-4 px-6 text-sm text-slate-400 align-top">
                  {result.summary}
                </td>
                <td className="whitespace-normal py-4 px-6 text-sm text-slate-400 align-top break-all">
                  {result.taskUrl ? (
                    <a
                      href={result.taskUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      {result.taskUrl}
                    </a>
                  ) : (
                    <span className="text-slate-500">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
