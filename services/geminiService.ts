import { GoogleGenAI, Type } from "@google/genai";
import { CorrelationResult } from '../types';

export async function correlateTranscriptWithTasks(apiKey: string, transcript: string, tasks: string): Promise<CorrelationResult[]> {
  if (!apiKey) {
    throw new Error("A chave de API da Gemini não foi fornecida.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `Você é um assistente de reuniões especialista. Sua tarefa é analisar a transcrição de uma reunião e uma lista de tarefas de projeto. Correlacione trechos da conversa da transcrição com as tarefas específicas que estão sendo discutidas.

Para cada tarefa na lista, forneça um resumo da discussão relacionada a ela. Se uma tarefa não foi mencionada, indique isso. Estruture sua saída como um array JSON de objetos. Cada objeto deve ter duas chaves: 'taskName' e 'summary'.

- 'taskName' deve ser o nome exato da tarefa da lista fornecida.
- 'summary' deve ser um resumo conciso da discussão sobre essa tarefa na transcrição. Se a tarefa não foi discutida, o resumo deve ser exatamente a string 'Não mencionada'.`;

  const userPrompt = `
    Aqui está a lista de tarefas:
    --- INÍCIO DA LISTA DE TAREFAS ---
    ${tasks}
    --- FIM DA LISTA DE TAREFAS ---

    Aqui está a transcrição da reunião:
    --- INÍCIO DA TRANSCRIÇÃO ---
    ${transcript}
    --- FIM DA TRANSCRIÇÃO ---

    Analise a transcrição e gere a saída JSON conforme instruído.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        taskName: {
          type: Type.STRING,
          description: "O nome da tarefa da lista fornecida.",
        },
        summary: {
          type: Type.STRING,
          description: "Um resumo da discussão sobre a tarefa, ou 'Não mencionada' se não foi discutida.",
        },
      },
      required: ["taskName", "summary"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    
    // Validação básica
    if (!Array.isArray(parsedResult)) {
        throw new Error("A resposta da API não é um array.");
    }
    parsedResult.forEach(item => {
        if (typeof item.taskName !== 'string' || typeof item.summary !== 'string') {
            throw new Error("Estrutura de item inválida na resposta da API.");
        }
    });

    return parsedResult as CorrelationResult[];
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    throw new Error("Falha ao obter uma resposta válida do modelo de IA.");
  }
}