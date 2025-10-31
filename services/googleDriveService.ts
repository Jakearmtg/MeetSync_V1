// @ts-nocheck

// ATENÇÃO: Para esta funcionalidade operar, é necessário criar um projeto
// no Google Cloud Platform, ativar a API do Google Drive e criar um ID do Cliente OAuth 2.0.
// O valor abaixo deve ser substituído pelo seu ID de cliente real.
const CLIENT_ID = "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let gisInited = false;
let tokenClient;

/**
 * Inicializa os clientes GAPI e GIS do Google.
 * Deve ser chamado quando o aplicativo carrega.
 */
export function initGoogleClient() {
  const gapiScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
  gapiScript.onload = () => {
    gapi.load('client', initializeGapiClient);
  };

  const gisScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  gisScript.onload = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // O callback é tratado pela promessa retornada por requestAccessToken
    });
    gisInited = true;
  };
}

async function initializeGapiClient() {
  await gapi.client.init({
    // A chave de API não é necessária para o upload de arquivos com OAuth.
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  });
  gapiInited = true;
}

/**
 * Solicita um token de acesso ao usuário através de um pop-up de login
 * e, em seguida, prossegue com o upload do arquivo.
 */
export async function signInAndUploadFile(fileName: string, fileContent: string, folderId: string) {
  return new Promise((resolve, reject) => {
    if (!gapiInited || !gisInited) {
      reject(new Error("Cliente Google não inicializado."));
      return;
    }
    
    // Se o gapi.client já tiver um token, use-o.
    if (gapi.client.getToken() === null) {
      // Solicita um token de acesso.
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        // O token agora está em gapi.client, a próxima chamada de API irá usá-lo.
        await uploadFile(fileName, fileContent, folderId);
        resolve();
      };
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Se já estiver logado, faz o upload diretamente.
      uploadFile(fileName, fileContent, folderId).then(resolve).catch(reject);
    }
  });
}

/**
 * Faz o upload de um arquivo para o Google Drive usando a API REST.
 */
async function uploadFile(fileName: string, fileContent: string, folderId: string) {
    const metadata = {
        name: fileName,
        mimeType: 'text/csv',
        parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/csv\r\n\r\n' +
        fileContent +
        close_delim;

    const request = gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: {uploadType: 'multipart'},
        headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
    });

    try {
        const response = await request;
        return response.result;
    } catch (error) {
        // Se o token expirar, limpe-o para forçar um novo login na próxima tentativa.
        if (error.status === 401) {
            gapi.client.setToken(null);
        }
        console.error("Erro no GAPI ao fazer upload:", error);
        throw new Error(error.result?.error?.message || 'Falha ao fazer upload do arquivo.');
    }
}
