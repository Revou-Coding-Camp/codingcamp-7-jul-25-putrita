document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoList = document.getElementById('todo-list');

    // Status yang bisa dipilih
    const statuses = ['Baru', 'Pending', 'Selesai'];

    // Muat data dari localStorage atau gunakan array kosong
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Fungsi untuk menyimpan data ke localStorage
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Fungsi untuk merender (menampilkan) semua to-do item
    const renderTodos = () => {
        todoList.innerHTML = ''; // Kosongkan list sebelum render ulang

        if (todos.length === 0) {
            todoList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada tugas.</td></tr>';
            return;
        }

        todos.forEach((todo, index) => {
            const tr = document.createElement('tr');

            const statusClass = `status-${todo.status.toLowerCase()}`;

            tr.innerHTML = `
                <td>${todo.task}</td>
                <td>${todo.date}</td>
                <td><span class="status ${statusClass}">${todo.status}</span></td>
                <td>
                    <button class="action-btn change-status-btn" data-index="${index}">Ubah Status</button>
                    <button class="action-btn delete-btn" data-index="${index}">Hapus</button>
                </td>
            `;
            todoList.appendChild(tr);
        });
    };

    // Event listener untuk form submission (menambah to-do baru)
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah reload halaman

        const newTask = {
            task: todoInput.value,
            date: todoDate.value,
            status: 'Baru' // Status default
        };

        todos.push(newTask);
        saveTodos();
        renderTodos();

        // Kosongkan input field
        todoInput.value = '';
        todoDate.value = '';
    });

    // Event listener untuk tombol aksi (Ubah Status & Hapus)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.getAttribute('data-index');

        if (target.classList.contains('change-status-btn')) {
            // Cari index status saat ini
            const currentStatusIndex = statuses.indexOf(todos[index].status);
            // Pindah ke status berikutnya, atau kembali ke awal jika sudah di akhir
            const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
            todos[index].status = statuses[nextStatusIndex];
        }

        if (target.classList.contains('delete-btn')) {
            // Hapus to-do dari array berdasarkan index
            todos.splice(index, 1);
        }

        saveTodos();
        renderTodos();
    });

    // Render to-do list saat halaman pertama kali dimuat
    renderTodos();
});