const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const message = document.getElementById('message'); // Per il secondo container (pipeline)
const messaggioUpload = document.getElementById('messaggio'); // Per il primo container (upload)
// Rimossa la variabile brischetto non dichiarata correttamente
var checked = false;
let messageTimeout;

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileNameDisplay.textContent = file ? `File selezionato: ${file.name}` : 'Nessun file selezionato';
  Funzione(); // Aggiorna lo stato del bottone in base alla selezione del file
});

document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const file = fileInput.files[0];

  if (!file) {
    showMessageUpload('Seleziona un file prima di procedere.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Content = reader.result.split(',')[1];
    const payload = {
      filename: file.name,
      filecontent: base64Content
    };

    try {
      const response = await fetch("https://prod-43.northeurope.logic.azure.com:443/workflows/9cf005581a0d45bc92aff2b3833a1f1a/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=hxbJjW30LHPG-wsAOCqW5TETXSmafu8zWK-v2jUPvcA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMessageUpload('File caricato con successo.', 'success', true);
        fileInput.value = '';
        fileNameDisplay.textContent = 'Nessun file selezionato';
        Funzione(); // Aggiorna lo stato del bottone dopo il reset
      } else {
        const errorText = await response.text();
        showMessageUpload(`Upload fallito: ${response.statusText} (${response.status})`, 'error');
        console.error(errorText);
      }
    } catch (error) {
      showMessageUpload(`Errore: ${error.message}`, 'error');
    }
  };
  reader.readAsDataURL(file);
});

function showMessage(text, type, autoHide = false) {
  if (messageTimeout) clearTimeout(messageTimeout);
  message.textContent = text;
  message.className = `message ${type}`;
  message.style.display = 'block';

  if (autoHide) {
    messageTimeout = setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        message.style.display = 'none';
        message.style.opacity = '1';
      }, 300);
    }, 3500);
  }
}

function showMessageUpload(text, type, autoHide = false) {
  if (messageTimeout) clearTimeout(messageTimeout);
  messaggioUpload.textContent = text;
  messaggioUpload.className = `message ${type}`;
  messaggioUpload.style.display = 'block';

  if (autoHide) {
    messageTimeout = setTimeout(() => {
      messaggioUpload.style.opacity = '0';
      setTimeout(() => {
        messaggioUpload.style.display = 'none';
        messaggioUpload.style.opacity = '1';
      }, 300);
    }, 35000);
  }
}

document.getElementById('triggerPipelineBtn').addEventListener('click', async () => {
  const button = document.getElementById('triggerPipelineBtn');
  const spinner = document.getElementById('spinner');

  // Disabilita il bottone e mostra lo spinner
  button.disabled = true;
  // spinner.style.display = 'block';
  showMessage("Avvio della pipeline in corso...", "info");

  try {
    const response = await fetch("https://prod-134.westeurope.logic.azure.com:443/workflows/fc956404e695482ea6b78b493c5b75b8/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=WN55PqcAQApMuETiU2309oKL-N2ng_ZXc1Au64iIHUg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pipelineName: "update BIG",
        parameters: {}
      })
    });

    const data = await response.json();
    const runId = data.runId;

    if (!response.ok || !runId) {
      throw new Error("Errore nell'avvio della pipeline.");
    }

    showMessage("Pipeline avviata. Attendere il completamento (circa 6 minuti)...", "info");

    // Disabilita il bottone per max 5 minuti (300.000 ms)
    const timeout = setTimeout(() => {
      button.disabled = false;
      spinner.style.display = 'none';
      showMessage("Timeout: la pipeline potrebbe essere ancora in esecuzione.", "warning");
    }, 300000);

    // 🔁 Se vuoi monitorare lo stato reale, qui andrebbe una chiamata a una seconda Logic App
    // Simulazione completamento dopo 6 minuti
    await new Promise(resolve => setTimeout(resolve, 360000)); // 6 minuti

    clearTimeout(timeout);
    button.disabled = false;
    spinner.style.display = 'none';
    showMessage("Pipeline completata con successo!", "success", true);

  } catch (error) {
    spinner.style.display = 'none';
    button.disabled = false;
    showMessage(`Errore: ${error.message}`, "error");
  }
});

function Funzione() {
  const bottoneToCheck = document.getElementById('bottoneToCheck');
  if (fileInput.files.length > 0) {
    bottoneToCheck.disabled = false;
    bottoneToCheck.classList.remove('disabled');
    checked = true;
  } else {
    bottoneToCheck.disabled = true;
    bottoneToCheck.classList.add('disabled');
    checked = false;
  }
}

// Inizializza lo stato del bottone al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
  Funzione();
});
