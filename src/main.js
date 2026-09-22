// Load the available options
let idsResponse = await fetch('./res/ids.json');
let available = await idsResponse.json();
available.sort((a, b) => a.name.localeCompare(b.name));

// Prepare the tables
let availableTable = document.getElementById('available-table');
let replacedTable = document.getElementById('replaced-table');
let replaced = [];

// Set up the initial availability
updateAvailableTable();

/**
 * Update the data displayed by a table given the backing entries.
 * @param table The table to modify.
 * @param entries The entries to display.
 */
function updateTable(table, entries) {
    table.innerHTML = '';
    entries.forEach(npc => {
        let row = table.insertRow();
        let nameCell = row.insertCell(0);
        let idCell = row.insertCell(1);
        let tagsCell = row.insertCell(2);
        nameCell.innerText = npc.name;
        row.dataset.name = npc.name;
        idCell.innerText = npc.id;
        row.dataset.id = npc.id;
        tagsCell.innerText = npc.tags.join(", ");
        row.dataset.id = npc.id;
        row.dataset.data = npc;
    });
}

/**
 * Update the data displayed by the "available" table.
 */
function updateAvailableTable() {
    updateTable(availableTable, available);
}

/**
 * Update the data displayed by the "replaced" table.
 */
function updateReplacedTable() {
    updateTable(replacedTable, replaced);
}
