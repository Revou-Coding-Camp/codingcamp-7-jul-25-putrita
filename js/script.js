document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoList = document.getElementById('todo-list');
    const downloadBtn = document.getElementById('download-btn');

    // Status yang bisa dipilih
    const statuses = ['Baru', 'Pending', 'Selesai'];

    // Muat data dari localStorage atau gunakan array kosong
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

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

        if (todos.length === 0) {
            todoList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada tugas.</td></tr>';
            return;
        }

        // Definisikan urutan status
        const statusOrder = { 'Baru': 0, 'Pending': 1, 'Selesai': 2 };

        // Buat salinan array dan urutkan
        const sortedTodos = [...todos].sort((a, b) => {
            const orderA = statusOrder[a.status];
            const orderB = statusOrder[b.status];

            // Jika status berbeda, urutkan berdasarkan status
            if (orderA !== orderB) {
                return orderA - orderB;
            }

            // Jika status sama, urutkan berdasarkan tanggal dibuat (terbaru di atas)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        sortedTodos.forEach((todo, index) => {
            const tr = document.createElement('tr');

            const statusClass = `status-${todo.status.toLowerCase()}`;
            const taskTextClass = todo.status === 'Selesai' ? 'task-done' : '';

            // Membuat opsi untuk dropdown status
            const statusOptions = statuses.map(s =>
                `<option value="${s}" ${s === todo.status ? 'selected' : ''}>${s}</option>`
            ).join('');

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="${taskTextClass}">${todo.task}</td>
                <td>${todo.date}</td>
                <td><span class="status ${statusClass}">${todo.status}</span></td>
                <td class="action-cell">
                    <select class="status-select" data-id="${todo.createdAt}">
                        ${statusOptions}
                    </select>
                    <button class="action-btn delete-btn" data-id="${todo.createdAt}">Hapus</button>
                </td>
                <td>${formatDateTime(todo.updatedAt)}</td>
            `;
            todoList.appendChild(tr);
        });
    };

    // Event listener untuk form submission (menambah to-do baru)
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah reload halaman

        const now = new Date().toISOString();
        const newTask = {
            task: todoInput.value,
            date: todoDate.value,
            status: 'Baru', // Status default
            createdAt: now,
            updatedAt: now
        };

        todos.unshift(newTask); // Tambahkan ke paling atas array
        saveTodos();
        renderTodos();

        // Kosongkan input field
        todoInput.value = '';
        todoDate.value = '';
    });

    // Event listener untuk klik pada tombol Hapus
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        // Hanya jalankan jika yang diklik adalah tombol hapus
        if (target.classList.contains('delete-btn')) {
            const id = target.dataset.id;
            const index = todos.findIndex(todo => todo.createdAt === id);
            if (index > -1) {
                todos.splice(index, 1); // Hapus to-do dari array
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

    // Event listener untuk tombol download Excel
    downloadBtn.addEventListener('click', () => {
        if (todos.length === 0) {
            alert('Tidak ada data untuk diunduh.');
            return;
        }

        // Urutkan data sama seperti yang ditampilkan di tabel
        const statusOrder = { 'Baru': 0, 'Pending': 1, 'Selesai': 2 };
        const sortedTodos = [...todos].sort((a, b) => {
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