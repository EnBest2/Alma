// Állapotkezelés
let documents = JSON.parse(localStorage.getItem('documents')) || [];
let tags = JSON.parse(localStorage.getItem('tags')) || ['Főállás', 'Túlóra', 'Bónusz'];
let pin = localStorage.getItem('pin') || '0000';
let darkMode = localStorage.getItem('darkMode') === 'true';

// DOM elemek
const root = document.getElementById('root');

// Fő komponens
function renderApp() {
  root.innerHTML = `
    <div class="min-h-screen flex flex-col">
      <!-- Fejléc -->
      <header class="bg-primary text-white p-4 shadow-md">
        <div class="container mx-auto flex justify-between items-center">
          <h1 class="text-xl font-bold flex items-center">
            <i class="fas fa-wallet mr-2"></i>BérZseb
          </h1>
          <div>
            <button id="themeToggle" class="p-2 rounded-full bg-white bg-opacity-20">
              ${darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'}
            </button>
          </div>
        </div>
      </header>

      <!-- Navigáció -->
      <nav class="bg-gray-100 dark:bg-gray-800 p-2 flex overflow-x-auto">
        <button data-page="home" class="nav-btn active">Kezdőlap</button>
        <button data-page="upload" class="nav-btn">Feltöltés</button>
        <button data-page="tags" class="nav-btn">Címkék</button>
        <button data-page="stats" class="nav-btn">Statisztika</button>
        <button data-page="settings" class="nav-btn">Beállítások</button>
      </nav>

      <!-- Tartalom -->
      <main class="flex-grow container mx-auto p-4" id="mainContent">
        ${renderHome()}
      </main>

      <!-- Értesítés -->
      <div id="notification" class="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg hidden"></div>
    </div>
  `;

  // Eseménykezelők
  document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });
}

// Oldalváltás
function switchPage(page) {
  const mainContent = document.getElementById('mainContent');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  switch(page) {
    case 'home': mainContent.innerHTML = renderHome(); break;
    case 'upload': mainContent.innerHTML = renderUpload(); break;
    case 'tags': mainContent.innerHTML = renderTags(); break;
    case 'stats': mainContent.innerHTML = renderStats(); break;
    case 'settings': mainContent.innerHTML = renderSettings(); break;
  }
}

// Kezdőlap
function renderHome() {
  if (documents.length === 0) {
    return `
      <div class="text-center py-10">
        <i class="fas fa-file-invoice text-5xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Nincsenek bérpapírjai</p>
        <button class="mt-4 bg-primary text-white px-4 py-2 rounded-lg" data-page="upload">
          Első bérpapír feltöltése
        </button>
      </div>
    `;
  }

  return `
    <div class="mb-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Bérpapírjaim</h2>
        <div class="relative">
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Keresés..." 
            class="pl-8 pr-4 py-2 border rounded-lg"
          >
          <i class="fas fa-search absolute left-2 top-3 text-gray-400"></i>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="documentsList">
        ${documents.map(doc => renderDocumentCard(doc)).join('')}
      </div>
    </div>
  `;
}

// Dokumentum kártya
function renderDocumentCard(doc) {
  return `
    <div class="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <div class="p-4 bg-white dark:bg-gray-700">
        <div class="flex justify-between">
          <h3 class="font-semibold">${doc.title}</h3>
          <span class="text-sm text-gray-500">${doc.date}</span>
        </div>
        <p class="text-sm mt-2">
          <span class="inline-block bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-1">
            ${doc.tags.join('</span><span class="inline-block bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-1">')}
          </span>
        </p>
        <div class="mt-4 flex space-x-2">
          <button class="view-btn" data-id="${doc.id}">
            <i class="fas fa-eye mr-1"></i> Megtekintés
          </button>
          <button class="download-btn" data-id="${doc.id}">
            <i class="fas fa-download mr-1"></i> Letöltés
          </button>
        </div>
      </div>
    </div>
  `;
}

// Feltöltés oldal
function renderUpload() {
  return `
    <div class="max-w-md mx-auto">
      <h2 class="text-lg font-semibold mb-4">Bérpapír feltöltése</h2>
      
      <div class="mb-4">
        <label class="block mb-2">Dokumentum címe</label>
        <input 
          type="text" 
          id="docTitle" 
          class="w-full p-2 border rounded-lg"
          placeholder="Pl. 2023. decemberi bérpapír"
        >
      </div>
      
      <div class="mb-4">
        <label class="block mb-2">Dátum</label>
        <input 
          type="month" 
          id="docDate" 
          class="w-full p-2 border rounded-lg"
        >
      </div>
      
      <div class="mb-4">
        <label class="block mb-2">Címkék</label>
        <select id="docTags" class="w-full p-2 border rounded-lg" multiple>
          ${tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
        </select>
      </div>
      
      <div class="mb-4">
        <label class="block mb-2">Fájl feltöltése</label>
        <div class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer" id="dropZone">
          <i class="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-2"></i>
          <p>Húzza ide a fájlt vagy kattintson a tallózáshoz</p>
          <input type="file" id="fileInput" class="hidden" accept=".pdf,.jpg,.jpeg,.png">
        </div>
      </div>
      
      <button id="uploadBtn" class="w-full bg-primary text-white py-2 rounded-lg disabled:opacity-50">
        Feltöltés
      </button>
    </div>
  `;
}

// Beállítások
function renderSettings() {
  return `
    <div class="max-w-md mx-auto">
      <h2 class="text-lg font-semibold mb-4">Beállítások</h2>
      
      <div class="mb-6">
        <h3 class="font-medium mb-2">PIN kód beállítása</h3>
        <div class="flex space-x-2">
          <input 
            type="password" 
            id="pinInput" 
            maxlength="4" 
            pattern="\d{4}"
            class="flex-grow p-2 border rounded-lg text-center"
            placeholder="0000"
            value="${pin}"
          >
          <button id="savePin" class="bg-primary text-white px-4 py-2 rounded-lg">
            Mentés
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-1">4 számjegyű PIN kód a letöltések védelméhez</p>
      </div>
      
      <div class="mb-6">
        <h3 class="font-medium mb-2">Emlékeztetők</h3>
        <div class="flex items-center">
          <input type="checkbox" id="reminderToggle" class="mr-2">
          <label for="reminderToggle">Havi emlékeztető a bérpapír feltöltésére</label>
        </div>
        <div class="mt-2 ml-6 hidden" id="reminderSettings">
          <label class="block mb-1">Emlékeztető napja:</label>
          <input 
            type="number" 
            min="1" 
            max="28" 
            value="10" 
            class="w-20 p-2 border rounded-lg"
          >
        </div>
      </div>
    </div>
  `;
}

// Sötét mód váltó
function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode.toString());
  
  if (darkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Értesítés megjelenítése
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`;
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Inicializálás
document.addEventListener('DOMContentLoaded', renderApp);