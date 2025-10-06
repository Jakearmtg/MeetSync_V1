import React, { useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  id: string;
  label: string;
  onFileSelect: (content: string) => void;
  onFileNameChange: (name: string) => void;
  fileName: string;
  acceptedFileTypes: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, onFileSelect, onFileNameChange, fileName, acceptedFileTypes }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileNameChange(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileSelect(text);
      };
      reader.onerror = () => {
        console.error("Erro ao ler o arquivo");
        onFileSelect("");
        onFileNameChange("");
      };
      reader.readAsText(file);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div 
        onClick={handleAreaClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAreaClick(); }}
        tabIndex={0}
        role="button"
        aria-label={`Carregar ${label}`}
        className="flex justify-center items-center w-full h-32 px-6 transition bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-sky-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
      >
        <div className="text-center">
          <UploadIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-sky-400">Clique para carregar</span> ou arraste e solte
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {fileName ? (
              <span className="font-medium text-emerald-400 break-all">{fileName}</span>
            ) : (
              `Suportado: ${acceptedFileTypes}`
            )}
          </p>
        </div>
        <input
          id={id}
          name={id}
          type="file"
          className="sr-only"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
        />
      </div>
    </div>
  );
};

export default FileUpload;