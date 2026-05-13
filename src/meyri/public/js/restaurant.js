const menu = document.getElementById('menu');

document
    .getElementById('menuOpen')
    .addEventListener('click', () => {

        menu.classList.toggle('active');

    });

document
    .getElementById('centerMenu')
    .addEventListener('click', () => {

        menu.classList.toggle('active');

    });

const leftColumn =
    document.getElementById('leftColumn');

const rightColumn =
    document.getElementById('rightColumn');

async function loadTables() {

    const response =
        await fetch('/api/tables');

    const booked =
        await response.json();

    const bookedTables =
        booked.map(t => t.tableNumber);

    for (let i = 1; i <= 26; i++) {

        const table =
            document.createElement('a');

        table.href =
            `booking.html?table=${i}`;

        table.className = 'table';

        if (bookedTables.includes(i)) {
            table.classList.add('booked');
        }

        table.innerHTML =
            `<span>${i}</span>`;

        if (i <= 13) {

            leftColumn.appendChild(table);

        } else {

            rightColumn.appendChild(table);

        }

    }

}

loadTables();