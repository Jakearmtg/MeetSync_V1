import React from 'react';
import { KeyIcon } from './Icons';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div>
      <label htmlFor="api-key" className="block text-sm font-medium text-slate-300 mb-2">
        Sua Chave de API Gemini
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <KeyIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="password"
          id="api-key"
          name="api-key"
          className="block w-full rounded-lg border-slate-600 bg-slate-700/50 py-3 pl-10 pr-3 text-slate-200 placeholder-slate-400 transition focus:border-sky-500 focus:ring-sky-500"
          placeholder="Cole sua chave de API aqui"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ApiKeyInput;