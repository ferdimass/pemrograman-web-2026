let students = [
    { id: 1, nim: "5025251001", nama: "Riko Simanjuntak", email: "5025251001@student.its.ac.id", prodi: "Teknik Informatika", status: "Aktif" },
    { id: 2, nim: "5054251001", nama: "Putri Naila", email: "5054251001@student.its.ac.id", prodi: "Rekayasa Kecerdasan Artifisial", status: "Lulus" },
    { id: 3, nim: "5053251001", nama: "Agus Setyo", email: "5053251001@student.its.ac.id", prodi: "Rekayasa Perangkat Lunak", status: "Cuti" }
];

let currentPage = 1;
const rowsPerPage = 5;

const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const nimInput = document.getElementById('NRP');
const namaInput = document.getElementById('nama');
const emailInput = document.getElementById('email');
const prodiInput = document.getElementById('prodi');
const statusInput = document.getElementById('status');
const tableBody = document.getElementById('student-table-body');
const totalBadge = document.getElementById('total-badge');
const searchInput = document.getElementById('search-input');
const filterProdi = document.getElementById('filter-prodi');
const btnReset = document.getElementById('btn-reset');
const formTitle = document.getElementById('form-title');
const paginationContainer = document.querySelector('.pagination');

document.addEventListener('DOMContentLoaded', () => {
    handleSearchAndFilter();

    studentForm.addEventListener('submit', handleFormSubmit);
    btnReset.addEventListener('click', resetForm);
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        handleSearchAndFilter();
    });
    filterProdi.addEventListener('change', () => {
        currentPage = 1;
        handleSearchAndFilter();
    });
});

function renderTable(dataList, totalCount) {
    tableBody.innerHTML = '';

    if (dataList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color: var(--text-muted); padding: 20px;">
                    Tidak ada data mahasiswa ditemukan.
                </td>
            </tr>`;
        totalBadge.textContent = `Total: 0`;
        return;
    }

    dataList.forEach(student => {
        const tr = document.createElement('tr');
        
        let statusClass = 'status-aktif';
        if (student.status === 'Cuti') statusClass = 'status-cuti';
        if (student.status === 'Lulus') statusClass = 'status-lulus';

        tr.innerHTML = `
            <td><strong>${student.nim}</strong></td>
            <td>${student.nama}</td>
            <td>${student.email}</td>
            <td>${student.prodi}</td>
            <td><span class="status-badge ${statusClass}">${student.status}</span></td>
            <td class="actions">
                <button class="action-btn action-edit" onclick="editStudent(${student.id})" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="action-btn action-delete" onclick="deleteStudent(${student.id})" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    totalBadge.textContent = `Total: ${totalCount}`;
}

function handleSearchAndFilter() {
    const keyword = searchInput.value.toLowerCase();
    const selectedProdi = filterProdi.value;

    const filtered = students.filter(student => {
        const matchSearch = student.nama.toLowerCase().includes(keyword) || student.nim.toLowerCase().includes(keyword);
        const matchProdi = selectedProdi === '' || student.prodi === selectedProdi;
        return matchSearch && matchProdi;
    });

    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    renderTable(paginatedData, filtered.length);
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn-page';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            handleSearchAndFilter();
        }
    };
    paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            handleSearchAndFilter();
        };
        paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-page';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            handleSearchAndFilter();
        }
    };
    paginationContainer.appendChild(nextBtn);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = studentIdInput.value;
    const nim = nimInput.value.trim();
    const nama = namaInput.value.trim();
    const email = emailInput.value.trim();
    const prodi = prodiInput.value;
    const status = statusInput.value;

    if (id) {
        const index = students.findIndex(s => s.id == id);
        if (index !== -1) {
            students[index] = { id: Number(id), nim, nama, email, prodi, status };
        }
    } else {
        const newStudent = {
            id: Date.now(),
            nim,
            nama,
            email,
            prodi,
            status
        };
        students.push(newStudent);
    }

    resetForm();
    handleSearchAndFilter();
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    studentIdInput.value = student.id;
    nimInput.value = student.nim;
    namaInput.value = student.nama;
    emailInput.value = student.email;
    prodiInput.value = student.prodi;
    statusInput.value = student.status;

    formTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Data Mahasiswa`;
    document.getElementById('btn-save').innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Update Data`;
}

function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data mahasiswa ini?')) {
        students = students.filter(s => s.id !== id);
        handleSearchAndFilter();
    }
}

function resetForm() {
    studentIdInput.value = '';
    studentForm.reset();
    formTitle.innerHTML = `<i class="fa-solid fa-user"></i> Formulir Mahasiswa`;
    document.getElementById('btn-save').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Data`;
}