document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoList = document.getElementById('todo-list');
    const downloadBtn = document.getElementById('download-btn');
    const statusFilter = document.getElementById('status-filter');

    // Status yang bisa dipilih
    const statuses = ['Baru', 'Pending', 'Selesai'];

    // Muat data dari localStorage atau gunakan array kosong
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    // State untuk filter
    let currentFilter = 'Semua';

    // Fungsi untuk menyimpan data ke localStorage
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Fungsi untuk format tanggal yang lebih mudah dibaca
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    };

    // Fungsi untuk merender (menampilkan) semua to-do item
    const renderTodos = () => {
        todoList.innerHTML = ''; // Kosongkan list sebelum render ulang

        // 1. Filter todos berdasarkan currentFilter
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'Semua') {
                return true;
            }
            return todo.status === currentFilter;
        });

        if (filteredTodos.length === 0) {
            const message = currentFilter === 'Semua' ? 'Belum ada tugas.' : 'Tidak ada tugas yang cocok dengan filter.';
            todoList.innerHTML = `<tr><td colspan="6" style="text-align:center;">${message}</td></tr>`;
            return;
        }

        // Definisikan urutan status
        const statusOrder = { 'Baru': 0, 'Pending': 1, 'Selesai': 2 };

        // 2. Urutkan array yang sudah difilter
        const sortedTodos = [...filteredTodos].sort((a, b) => {
            const orderA = statusOrder[a.status];
            const orderB = statusOrder[b.status];

            // Jika status berbeda, urutkan berdasarkan status
            if (orderA !== orderB) {
                return orderA - orderB;
            }

            // Jika status sama, urutkan berdasarkan tanggal dibuat (terbaru di atas)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 3. Render array yang sudah difilter dan diurutkan
        sortedTodos.forEach((todo, index) => {
            const tr = document.createElement('tr');

            const statusClass = `status-${todo.status.toLowerCase()}`;
            const taskTextClass = todo.status === 'Selesai' ? 'task-done' : '';

            // Membuat opsi untuk dropdown status
            const statusOptions = statuses.map(s =>
                `<option value="${s}" ${s === todo.status ? 'selected' : ''}>${s}</option>`
            ).join('');

            tr.innerHTML = `
                <td data-label="No.">${index + 1}</td>
                <td data-label="Tugas" class="${taskTextClass}">${todo.task}</td>
                <td data-label="Tanggal">${todo.date}</td>
                <td data-label="Status"><span class="status ${statusClass}">${todo.status}</span></td>
                <td data-label="Aksi" class="action-cell">
                    <select class="status-select" data-id="${todo.createdAt}" title="Ubah Status">
                        ${statusOptions}
                    </select>
                    <button class="action-btn edit-btn" data-id="${todo.createdAt}" title="Edit Tugas">Edit</button>
                    <button class="action-btn delete-btn" data-id="${todo.createdAt}" title="Hapus Tugas">Hapus</button>
                </td>
                <td data-label="Update">${formatDateTime(todo.updatedAt)}</td>
            `;
            todoList.appendChild(tr);
        });
    };

    // Event listener untuk form submission (menambah to-do baru)
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah reload halaman

        const taskContent = todoInput.innerHTML.trim();

        // Validasi manual karena div tidak punya atribut 'required'
        if (taskContent === '') {
            alert('Tugas tidak boleh kosong.');
            return;
        }

        const now = new Date().toISOString();
        const newTask = {
            task: taskContent, // Mengambil dari innerHTML
            date: todoDate.value,
            status: 'Baru', // Status default
            createdAt: now,
            updatedAt: now
        };

        todos.unshift(newTask);
        saveTodos();
        renderTodos();

        // Kosongkan input field
        todoInput.innerHTML = ''; // Mengosongkan div
        todoDate.value = '';
    });

    // Event listener untuk semua aksi di dalam list (delete, edit, save, cancel)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        // Hapus Tugas
        if (target.classList.contains('delete-btn')) {
            const index = todos.findIndex(todo => todo.createdAt === id);
            if (index > -1) {
                todos.splice(index, 1); // Hapus to-do dari array
                saveTodos();
                renderTodos();
            }
        }

        // Edit Tugas
        if (target.classList.contains('edit-btn')) {
            const row = target.closest('tr');
            const todo = todos.find(t => t.createdAt === id);
            if (!todo) return;

            row.classList.add('editing'); // Tandai baris sedang diedit

            row.innerHTML = `
                <td data-label="No.">${row.cells[0].innerHTML}</td>
                <td data-label="Tugas"><div class="editing-textarea" contenteditable="true">${todo.task}</div></td>
                <td data-label="Tanggal"><input type="date" class="editing-input" value="${todo.date}"></td>
                <td data-label="Status">${row.cells[3].innerHTML}</td>
                <td data-label="Aksi" class="action-cell">
                    <button class="action-btn save-btn" data-id="${id}" title="Simpan Perubahan">Simpan</button>
                    <button class="action-btn cancel-btn" data-id="${id}" title="Batal">Batal</button>
                </td>
                <td data-label="Update">${row.cells[5].innerHTML}</td>
            `;
            row.querySelector('.editing-textarea').focus();
        }

        // Simpan Perubahan
        if (target.classList.contains('save-btn')) {
            const index = todos.findIndex(t => t.createdAt === id);
            if (index > -1) {
                const row = target.closest('tr');
                const newTask = row.querySelector('.editing-textarea').innerHTML.trim();
                const newDate = row.querySelector('.editing-input').value;

                if (newTask === '') {
                    alert('Tugas tidak boleh kosong.');
                    return;
                }

                todos[index].task = newTask;
                todos[index].date = newDate;
                todos[index].updatedAt = new Date().toISOString();
                
                saveTodos();
                renderTodos();
            }
        }
    });
    
    // Event listener untuk perubahan pada dropdown status
    todoList.addEventListener('change', (e) => {
        const target = e.target;
        // Hanya jalankan jika yang berubah adalah dropdown status
        if (target.classList.contains('status-select')) {
            const id = target.dataset.id;
            const index = todos.findIndex(todo => todo.createdAt === id);
            if (index > -1) {
                todos[index].updatedAt = new Date().toISOString(); // Perbarui tanggal update
                todos[index].status = target.value; // Update status di array
                saveTodos();
                renderTodos();
            }
        }
    });

    // Event listener untuk filter status
    statusFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTodos();
    });

    // Event listener untuk tombol download Excel
    downloadBtn.addEventListener('click', () => {
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'Semua') return true;
            return todo.status === currentFilter;
        });

        if (filteredTodos.length === 0) {
            alert('Tidak ada data untuk diunduh.');
            return;
        }

        // Urutkan data sama seperti yang ditampilkan di tabel
        const statusOrder = { 'Baru': 0, 'Pending': 1, 'Selesai': 2 };
        const sortedTodos = [...filteredTodos].sort((a, b) => {
            const orderA = statusOrder[a.status];
            const orderB = statusOrder[b.status];
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 1. Siapkan data untuk diekspor
        const dataToExport = sortedTodos.map((todo, index) => {
            return {
                'No.': index + 1,
                'Tugas': todo.task,
                'Tanggal Target': todo.date,
                'Status': todo.status,
                'Tanggal Update': formatDateTime(todo.updatedAt)
            };
        });

        // 2. Buat worksheet dari data yang sudah disiapkan
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // 3. Buat workbook baru dan tambahkan worksheet ke dalamnya
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tugas');

        // 4. Buat dan unduh file Excel
        XLSX.writeFile(workbook, 'Daftar-Tugas.xlsx');
    });

    // Render to-do list saat halaman pertama kali dimuat
    renderTodos();
});