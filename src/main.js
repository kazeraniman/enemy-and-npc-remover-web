// Constants
const IS_GITHUB_PAGES = window.location.hostname.endsWith('.github.io');
const MINIMUM_INITIAL_LOAD_MS = 1000;
const MINIMUM_DOWNLOAD_LOAD_MS = 600;
const FILE_NAMES = ['name.anibnd.dcx', 'name.chrbnd.dcx', 'name_h.texbnd.dcx', 'name_l.texbnd.dcx'];
const COUNTER_API_BASE_URL = 'https://abacus.jasoncameron.dev'
const COUNTER_NAMESPACE = IS_GITHUB_PAGES ? 'elden-ring-enemy-and-npc-remover' : 'elden-ring-enemy-and-npc-remover-dev';
const COUNTER_API_URL = (counterName, endpoint) => `${COUNTER_API_BASE_URL}/${endpoint}/${COUNTER_NAMESPACE}/${counterName}`;
const COUNTER_VISIT_KEY = 'visit';
const COUNTER_DOWNLOAD_KEY = 'download';
const VISIT_ELEMENT_ID = 'visitor-count';
const DOWNLOAD_ELEMENT_ID = 'download-count'

// Prepare to load
const delay = (waitMs) => new Promise(resolve => setTimeout(resolve, waitMs));
let loadStartTime = performance.now();

// Load the available options
let available;
await Promise.all(
    [
        loadReplacementOptions(),
        incrementVisitCounter(),
        getDownloadCounter()
    ]
);
sortEntries(available);
let filteredAvailable = available.slice();

// Prepare the tables
const availableTable = document.getElementById('available-table');
const replacedTable = document.getElementById('replaced-table');
const replaced = [];

// Prepare the buttons
const clearButton = document.getElementById('clear-button');
const downloadButton = document.getElementById('download-button');
const replacementType = document.getElementById('replacement-type');

clearButton.addEventListener('click', () => {
    for (const npc of replaced) {
        available.push(npc);
    }

    replaced.length = 0;
    sortEntries(available);
    updateTables();
});

downloadButton.addEventListener('click', async () => {
    enableLoading('Bestowing Blessing...');

    const basePath = `./res/${replacementType.value}/`
    const baseFiles = await Promise.all(
        FILE_NAMES.map(async (fileName) => {
            const filePath = await fetch(`${basePath}/${fileName}`);
            return await filePath.blob();
        })
    );

    const replacementFiles = replaced.flatMap(npc => {
        return baseFiles.map((baseFile, i) => new File([baseFile], FILE_NAMES[i].replace('name', npc.id)));
    });

    const zip = new JSZip();
    for (const file of replacementFiles) {
        zip.file(file.name, file);
    }

    const downloadableFile = await zip.generateAsync({type: 'blob'});

    await disableLoading(MINIMUM_DOWNLOAD_LOAD_MS);

    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const downloadUrl = URL.createObjectURL(downloadableFile);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `replacements_${localTimestamp}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
        downloadLink.remove();
        URL.revokeObjectURL(downloadUrl);
    }, 100);

    await incrementDownloadCounter();

});

// Prepare filtering
const filterText = document.getElementById('available-filter');
filterText.addEventListener('input', debounce(updateAvailableTable, 500));

// Prepare the help modal
const instructionsModal = document.getElementById('instructions-modal');
const openInstructionsButton = document.getElementById('open-instructions-btn');
const closeInstructionsButton = document.getElementById('close-instructions-btn');

const setScrollLock = (locked) => {
    document.documentElement.classList.toggle('no-scroll', locked);
    document.body.classList.toggle('no-scroll', locked);
};

const closeModalSmoothly = () => {
    if (!instructionsModal.open || instructionsModal.classList.contains('is-closing')) {
        return;
    }

    instructionsModal.classList.add('is-closing');

    setTimeout(() => {
        instructionsModal.close();
        instructionsModal.classList.remove('is-closing');
        setScrollLock(false);
    }, 200); // Matches the 0.2s duration in CSS
};

openInstructionsButton.addEventListener('click', () => {
    setScrollLock(true);
    instructionsModal.classList.remove('is-closing');
    instructionsModal.showModal();
});

closeInstructionsButton.addEventListener('click', closeModalSmoothly);

instructionsModal.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModalSmoothly();
});

instructionsModal.addEventListener('click', (event) => {
    const rect = instructionsModal.getBoundingClientRect();
    const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.bottom &&
        rect.left <= event.clientX &&
        event.clientX <= rect.right
    );

    if (isInDialog) {
        return;
    }

    closeModalSmoothly();
});

// Set up the initial availability
updateTables();

// Complete loading
const loader = document.getElementById('page-loader');
const loaderText = document.getElementById('loader-text');
await disableLoading(MINIMUM_INITIAL_LOAD_MS);

/**
 * Set the loading state of the webpage.
 * @param loadingMessage The message to display on the loading screen.
 */
function enableLoading(loadingMessage = 'Guiding Tarnished...') {
    if (!loader.classList.contains('hidden')) {
        return;
    }

    loadStartTime = performance.now();
    loaderText.innerText = loadingMessage;
    loader.classList.remove('hidden');
    document.body.setAttribute('aria-busy', 'true');
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

async function disableLoading(minLoadingTime = 0) {
    if (loader.classList.contains('hidden')) {
        return;
    }

    const loadTime = performance.now() - loadStartTime;
    const waitTime = Math.max(0, minLoadingTime - loadTime);
    await delay(waitTime);
    document.body.removeAttribute('aria-busy');
    loader.classList.add('hidden');
}

/**
 * Load all the replacement options.
 * @returns {Promise<any>} The list of replacement options.
 */
async function loadReplacementOptions() {
    const idsResponse = await fetch('./res/ids.json');
    available = await idsResponse.json();
}

/**
 * Update the data displayed by a table given the backing entries.
 * @param table The table to modify.
 * @param filteredEntries The entries to display.
 * @param masterEntries The entries from which `filteredEntries` is filtered.
 */
function updateTable(table, filteredEntries, masterEntries = null) {
    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';
    for (const npc of filteredEntries) {
        const row = tableBody.insertRow();
        row.className = 'entry-row';

        const nameCell = row.insertCell(0);
        let name = npc.name;
        if (npc.tags.includes('sote')) {
            name += ' (DLC)';
        }
        nameCell.className = 'name-cell';
        nameCell.innerText = name;
        row.dataset.name = name;

        const idCell = row.insertCell(1);
        idCell.innerText = npc.id;
        row.dataset.id = npc.id;

        const tagsCell = row.insertCell(2);
        const tags = npc.tags.join(", ");
        tagsCell.innerText = tags;
        row.dataset.tags = tags;

        const actionsCell = row.insertCell(3);
        actionsCell.className = 'centred-cell';
        const infoLink = document.createElement('a');
        infoLink.className = 'info-link';
        infoLink.href = `https://eldenring.wiki.gg/wiki/Special:Search?search=${npc.name}&go=Go&ns0=1`;
        infoLink.target = '_blank';
        infoLink.innerHTML = `
          <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <circle cx="12" cy="8" r="1.25" fill="currentColor" stroke="none"></circle>
          </svg>
        `;
        infoLink.title = 'Search on Wiki';
        actionsCell.appendChild(infoLink);

        row.dataset.data = npc;

        const clickHandler = () => {
            swapTable(npc, masterEntries ?? filteredEntries);
        };

        nameCell.addEventListener('click', clickHandler);
        idCell.addEventListener('click', clickHandler);
        tagsCell.addEventListener('click', clickHandler);
    }
}

/**
 * Update the data displayed by the "available" table.
 */
function updateAvailableTable() {
    const search = filterText.value.trim().toLocaleLowerCase();
    filteredAvailable = available.filter(npc => !search || npc.name.toLocaleLowerCase().includes(search) || npc.tags.some(tag => tag.toLocaleLowerCase().includes(search)));
    updateTable(availableTable, filteredAvailable, available);
}

/**
 * Update the data displayed by the "replaced" table.
 */
function updateReplacedTable() {
    updateTable(replacedTable, replaced);
    const areButtonsDisabled = replaced.length === 0;
    clearButton.disabled = areButtonsDisabled;
    downloadButton.disabled = areButtonsDisabled;
}

/**
 * Update both of the tables.
 */
function updateTables() {
    updateAvailableTable();
    updateReplacedTable();
}

/**
 * Swaps an entry from one table to the other.
 * @param targetEntry The entity to swap.
 * @param entries The collection of entries to which it currently belongs.
 */
function swapTable(targetEntry, entries) {
    const targetIndex = entries.findIndex(entry => entry.id === targetEntry.id);
    entries.splice(targetIndex, 1);
    if (entries === available) {
        replaced.push(targetEntry);
        sortEntries(replaced);
    } else {
        available.push(targetEntry);
        sortEntries(available);
    }

    updateTables();
}

/**
 * Sort the entries in alphabetical order, then tie-break with the ID.
 * @param entries The entries to sort.
 */
function sortEntries(entries) {
    entries.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

/**
 * Updates the HTML element with the provided counter.
 * @param counter The value to display.
 * @param id The ID of the element to modify.
 */
function updateCounter(counter, id) {
    const counterElement = document.getElementById(id);
    counterElement.textContent = counter;
}

/**
 * Gets the provided counter, then updates it in the webpage.
 * @param counterName The counter to increment.
 * @param id The HTML element to update.
 * @returns {Promise<void>}
 */
async function getCounter(counterName, id) {
    const counter = await makeGetCounterCall(counterName);
    updateCounter(counter, id);
}

/**
 * Increments the provided counter, then updates it in the webpage.
 * @param counterName The counter to increment.
 * @param id The HTML element to update.
 * @returns {Promise<void>}
 */
async function incrementCounter(counterName, id) {
    const counter = await makeIncrementCounterCall(counterName);
    updateCounter(counter, id);
}

/**
 * Increments the visit counter, then updates it in the webpage.
 * @returns {Promise<void>}
 */
async function incrementVisitCounter() {
    await incrementCounter(COUNTER_VISIT_KEY, VISIT_ELEMENT_ID);
}

/**
 * Gets the download counter, then updates it in the webpage.
 * @returns {Promise<void>}
 */
async function getDownloadCounter() {
    await getCounter(COUNTER_DOWNLOAD_KEY, DOWNLOAD_ELEMENT_ID);
}

/**
 * Increments the visit counter, then updates it in the webpage.
 * @returns {Promise<void>}
 */
async function incrementDownloadCounter() {
    await incrementCounter(COUNTER_DOWNLOAD_KEY, DOWNLOAD_ELEMENT_ID);
}

/**
 * Delay and batch calls of a function to prevent spam.
 * @param func The function to call.
 * @param delay The amount of time to wait, in milliseconds.
 * @returns {(function(...[*]): void)|*} The function with a debounce wrapper.
 */
function debounce(func, delay) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args)
        }, delay);
    }
}

/**
 * Increments the provided counter and returns its value.
 * @param counterName The counter to increment and get.
 * @returns {Promise<number|*|undefined>} The counter's value, post-increment.
 */
async function makeIncrementCounterCall(counterName) {
    return await makeCounterCall(counterName, 'hit');
}

/**
 * Gets the value of the provided counter.
 * @param counterName The counter to get.
 * @returns {Promise<number|*|undefined>} The counter's value.
 */
async function makeGetCounterCall(counterName) {
    return await makeCounterCall(counterName, 'get');
}

/**
 * Makes and API call to work with a counter.
 * @param counterName The counter to use.
 * @param endpoint The endpoint to hit.
 * @returns {Promise<*|number>} The counter's value.
 */
async function makeCounterCall(counterName, endpoint) {
    try {
        const response = await fetch(COUNTER_API_URL(counterName, endpoint), {
            method: 'GET',
            cache: 'no-cache'
        });
        if (!response.ok) {
            return 0;
        }

        const data = await response.json();
        if (!(data && typeof data.value === 'number')) {
            return 0;
        }

        return data.value;
    } catch (_) {
        return 0;
    }
}
