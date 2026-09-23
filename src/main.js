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
clearButton.addEventListener('click', () => {
    replaced.forEach(npc => {
        available.push(npc);
    });
    replaced.length = 0;
    sortEntries(available);
    updateTables();
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
    filteredEntries.forEach(npc => {
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
    });
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
    clearButton.disabled = replaced.length === 0;
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
