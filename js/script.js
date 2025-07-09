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

            // Membuat opsi untuk dropdown status
            const statusOptions = statuses.map(s => 
                `<option value="${s}" ${s === todo.status ? 'selected' : ''}>${s}</option>`
            ).join('');

            tr.innerHTML = `
                <td>${todo.task}</td>
                <td>${todo.date}</td>
                <td><span class="status ${statusClass}">${todo.status}</span></td>
                <td>
                    <select class="status-select" data-index="${index}">
                        ${statusOptions}
                    </select>
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

    // Event listener untuk klik pada tombol Hapus
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        // Hanya jalankan jika yang diklik adalah tombol hapus
        if (target.classList.contains('delete-btn')) {
            const index = target.getAttribute('data-index');
            todos.splice(index, 1); // Hapus to-do dari array
            saveTodos();
            renderTodos();
        }
    });
    
    // Event listener untuk perubahan pada dropdown status
    todoList.addEventListener('change', (e) => {
        const target = e.target;
        // Hanya jalankan jika yang berubah adalah dropdown status
        if (target.classList.contains('status-select')) {
            const index = target.getAttribute('data-index');
            todos[index].status = target.value; // Update status di array
            saveTodos();
            renderTodos();
        }
    });

    // Event listener untuk tombol download Excel
    downloadBtn.addEventListener('click', () => {
        if (todos.length === 0) {
            alert('Tidak ada data untuk diunduh.');
            return;
        }

        // 1. Ubah nama properti agar lebih ramah pengguna di file Excel
        const dataToExport = todos.map(todo => {
            return {
                'Tugas': todo.task,
                'Tanggal': todo.date,
                'Status': todo.status
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