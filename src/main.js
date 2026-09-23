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
    let tableBody = table.getElementsByTagName('tbody');
    tableBody.innerHTML = '';
    entries.forEach(npc => {
        let row = table.insertRow();

        let nameCell = row.insertCell(0);
        let name = npc.name;
        if (npc.tags.includes('sote')) {
            name += ' (DLC)';
        }
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
        let infoLink = document.createElement('a');
        infoLink.className = 'info-link';
        infoLink.href = `https://eldenring.wiki.gg/wiki/Special:Search?search=${npc.name}&go=Go&ns0=1`;
        infoLink.target = '_blank';
        infoLink.innerHTML = '  &#128712;  ';
        infoLink.title = 'Search on Wiki';
        actionsCell.appendChild(infoLink);

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
