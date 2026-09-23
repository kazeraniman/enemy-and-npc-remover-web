// Constants
const FILE_NAMES = ['name.anibnd.dcx', 'name.chrbnd.dcx', 'name_h.texbnd.dcx', 'name_l.texbnd.dcx'];

// Load the available options
let idsResponse = await fetch('./res/ids.json');
let available = await idsResponse.json();
sortEntries(available);
let filteredAvailable = available.slice();

// Prepare the tables
let availableTable = document.getElementById('available-table');
let replacedTable = document.getElementById('replaced-table');
let replaced = [];

// Prepare the buttons
let clearButton = document.getElementById('clear-button');
let downloadButton = document.getElementById('download-button');
let replacementType = document.getElementById('replacement-type');

clearButton.addEventListener('click', () => {
    for (const npc of replaced) {
        available.push(npc);
    }

    replaced.length = 0;
    sortEntries(available);
    updateTables();
});

downloadButton.addEventListener('click', async () => {
    let basePath = `./res/${replacementType.value}/`
    let baseFiles = await Promise.all(
        FILE_NAMES.map(async (fileName) => {
            let filePath = await fetch(`${basePath}/${fileName}`);
            return await filePath.blob();
        })
    );

    let replacementFiles = replaced.flatMap(npc => {
        return baseFiles.map((baseFile, i) => new File([baseFile], FILE_NAMES[i].replace('name', npc.id)));
    });

    let zip = new JSZip();
    for (const file of replacementFiles) {
        zip.file(file.name, file);
    }

    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    let downloadableFile = await zip.generateAsync({type: 'blob'});
    let downloadUrl = URL.createObjectURL(downloadableFile);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `replacements_${localTimestamp}.zip`;
    document.body.appendChild(downloadLink);

    downloadLink.click();

    setTimeout(() => {
        downloadLink.remove();
        URL.revokeObjectURL(downloadUrl);
    }, 100);
});

// Prepare filtering
let filterText = document.getElementById('available-filter');
filterText.addEventListener('input', debounce(updateAvailableTable, 500));

// Set up the initial availability
updateTables();

/**
 * Update the data displayed by a table given the backing entries.
 * @param table The table to modify.
 * @param filteredEntries The entries to display.
 * @param masterEntries The entries from which `filteredEntries` is filtered.
 */
function updateTable(table, filteredEntries, masterEntries = null) {
    let tableBody = table.querySelector('tbody');
    tableBody.innerHTML = '';
    for (const npc of filteredEntries) {
        let row = tableBody.insertRow();
        row.className = 'entry-row';

        let nameCell = row.insertCell(0);
        let name = npc.name;
        if (npc.tags.includes('sote')) {
            name += ' (DLC)';
        }
        nameCell.className = 'name-cell';
        nameCell.innerText = name;
        row.dataset.name = name;

        let idCell = row.insertCell(1);
        idCell.innerText = npc.id;
        row.dataset.id = npc.id;

        let tagsCell = row.insertCell(2);
        let tags = npc.tags.join(", ");
        tagsCell.innerText = tags;
        row.dataset.tags = tags;

        let actionsCell = row.insertCell(3);
        actionsCell.className = 'centred-cell';
        let infoLink = document.createElement('a');
        infoLink.className = 'info-link';
        infoLink.href = `https://eldenring.wiki.gg/wiki/Special:Search?search=${npc.name}&go=Go&ns0=1`;
        infoLink.target = '_blank';
        infoLink.innerHTML = '  &#128712;  ';
        infoLink.title = 'Search on Wiki';
        actionsCell.appendChild(infoLink);

        row.dataset.data = npc;

        nameCell.addEventListener('click', () => {
            swapTable(npc, masterEntries ?? filteredEntries);
        });
    }
}

/**
 * Update the data displayed by the "available" table.
 */
function updateAvailableTable() {
    let search = filterText.value.trim().toLocaleLowerCase();
    filteredAvailable = available.filter(npc => !search || npc.name.toLocaleLowerCase().includes(search) || npc.tags.some(tag => tag.toLocaleLowerCase().includes(search)));
    updateTable(availableTable, filteredAvailable, available);
}

/**
 * Update the data displayed by the "replaced" table.
 */
function updateReplacedTable() {
    updateTable(replacedTable, replaced);
    let areButtonsDisabled = replaced.length === 0;
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
    let targetIndex = entries.findIndex(entry => entry.id === targetEntry.id);
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
 * Delay and batch calls of a function to prevent spam.
 * @param func The function to call.
 * @param delay The amount of time to wait, in milliseconds.
 * @returns {(function(...[*]): void)|*}
 */
function debounce(func, delay) {
    let timeout;

    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args)
        }, delay);
    }
}
