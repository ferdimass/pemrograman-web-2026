const STORAGE_KEY = "libraryreg_members";
const initialMembers = [
  { id: 1, nrp: "5025251001", nama: "Riko Simanjuntak", email: "5025251001@student.its.ac.id", prodi: "Teknik Informatika", jenis: "Mahasiswa", telepon: "081234567890", alamat: "Surabaya" },
  { id: 2, nrp: "5054251001", nama: "Putri Naila", email: "5054251001@student.its.ac.id", prodi: "Rekayasa Kecerdasan Artifisial", jenis: "Mahasiswa", telepon: "081234567891", alamat: "Sidoarjo" },
  { id: 3, nrp: "1021502520", nama: "Agus Setyo", email: "agus@its.ac.id", prodi: "Teknik Elektro", jenis: "Dosen", telepon: "081234567892", alamat: "Surabaya" }
];

function getMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return JSON.parse(saved);
  } catch (error) {
    console.error("Gagal membaca data anggota:", error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMembers));
  return [...initialMembers];
}
function saveMembers(members) { localStorage.setItem(STORAGE_KEY, JSON.stringify(members)); }
function showNotice(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = "notice show " + type;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

const memberForm = document.getElementById("member-form");
if (memberForm) {
  const notice = document.getElementById("form-notice");
  const formTitle = document.getElementById("form-title");
  const formDesc = document.getElementById("form-desc");
  const submitBtn = document.getElementById("submit-btn");

  // Mode edit: ?edit=ID
  const editId = Number(new URLSearchParams(window.location.search).get("edit")) || null;
  let editingMember = null;

  if (editId) {
    editingMember = getMembers().find(member => member.id === editId) || null;
    if (editingMember) {
      ["nama", "nrp", "prodi", "jenis", "telepon", "email", "alamat"].forEach(field => {
        memberForm[field].value = editingMember[field] ?? "";
      });
      if (formTitle) formTitle.textContent = "Edit Data Anggota";
      if (formDesc) formDesc.textContent = "Ubah data anggota lalu simpan perubahan.";
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
      document.title = "Edit Anggota — LibraryReg";
    } else {
      showNotice(notice, "Data anggota yang akan diedit tidak ditemukan.", "error");
    }
  }

  memberForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!memberForm.reportValidity()) return;
    const data = {
      id: editingMember ? editingMember.id : Date.now(),
      nama: memberForm.nama.value.trim(),
      nrp: memberForm.nrp.value.trim(),
      prodi: memberForm.prodi.value,
      jenis: memberForm.jenis.value,
      telepon: memberForm.telepon.value.trim(),
      email: memberForm.email.value.trim(),
      alamat: memberForm.alamat.value.trim()
    };
    if (Object.values(data).some(value => value === "")) {
      showNotice(notice, "Semua kolom wajib diisi.", "error");
      return;
    }
    const members = getMembers();
    const others = members.filter(member => member.id !== data.id); // abaikan diri sendiri saat edit
    if (others.some(member => member.nrp.toLowerCase() === data.nrp.toLowerCase())) {
      showNotice(notice, "NRP tersebut sudah terdaftar. Gunakan nomor induk yang berbeda.", "error");
      memberForm.nrp.focus();
      return;
    }
    if (others.some(member => member.email.toLowerCase() === data.email.toLowerCase())) {
      showNotice(notice, "Email tersebut sudah digunakan oleh anggota lain.", "error");
      memberForm.email.focus();
      return;
    }

    if (editingMember) {
      saveMembers(members.map(member => member.id === data.id ? data : member));
      showNotice(notice, "Perubahan tersimpan! Mengalihkan ke Daftar Anggota...", "success");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
    } else {
      members.push(data);
      saveMembers(members);
      memberForm.reset();
      showNotice(notice, "Pendaftaran berhasil! Data anggota sudah ditambahkan. Lihat di halaman Daftar Anggota.", "success");
    }
  });
}

const tableBody = document.getElementById("member-table-body");
if (tableBody) {
  const searchInput = document.getElementById("search-input");
  const totalBadge = document.getElementById("total-badge");
  const pagination = document.getElementById("pagination");
  const tableNotice = document.getElementById("table-notice");
  const modal = document.getElementById("detail-modal");
  const detailContent = document.getElementById("detail-content");
  let currentPage = 1;
  const perPage = 8;

  function renderTable() {
    const keyword = searchInput.value.trim().toLowerCase();
    const members = getMembers();
    const filtered = members.filter(member =>
      member.nama.toLowerCase().includes(keyword) || member.nrp.toLowerCase().includes(keyword)
    );
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(currentPage, pages);
    const shown = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
    totalBadge.textContent = `Total: ${filtered.length}`;
    if (!shown.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Tidak ada anggota yang cocok dengan pencarian.</td></tr>';
    } else {
      tableBody.innerHTML = shown.map(member => `
        <tr>
          <td><strong>${escapeHTML(member.nrp)}</strong></td>
          <td>${escapeHTML(member.nama)}</td>
          <td>${escapeHTML(member.email)}</td>
          <td>${escapeHTML(member.prodi)}</td>
          <td>${escapeHTML(member.jenis)}</td>
          <td><div class="actions">
            <button type="button" class="action-btn action-detail" data-action="detail" data-id="${member.id}" title="Lihat detail" aria-label="Lihat detail"><i class="fa-solid fa-eye"></i></button>
            <button type="button" class="action-btn action-edit" data-action="edit" data-id="${member.id}" title="Edit data" aria-label="Edit data"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="action-btn action-delete" data-action="delete" data-id="${member.id}" title="Hapus data" aria-label="Hapus data"><i class="fa-solid fa-trash"></i></button>
          </div></td>
        </tr>`).join("");
    }
    pagination.innerHTML = "";
    for (let page = 1; page <= pages; page++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn-page" + (page === currentPage ? " active" : "");
      button.textContent = page;
      button.setAttribute("aria-label", `Halaman ${page}`);
      button.addEventListener("click", () => { currentPage = page; renderTable(); });
      pagination.appendChild(button);
    }
  }

  searchInput.addEventListener("input", () => { currentPage = 1; renderTable(); });
  document.getElementById("btn-search").addEventListener("click", () => { currentPage = 1; renderTable(); });
  tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    const members = getMembers();
    const member = members.find(item => item.id === id);
    if (!member) {
      showNotice(tableNotice, "Data anggota tidak ditemukan.", "error");
      renderTable();
      return;
    }
    if (button.dataset.action === "detail") {
      document.getElementById("detail-title").textContent = `Detail Anggota: ${member.nama}`;
      const fields = [
        ["Nama Lengkap", member.nama], ["NRP", member.nrp], ["Email", member.email],
        ["Program Studi", member.prodi], ["Jenis Keanggotaan", member.jenis],
        ["Nomor Telepon", member.telepon], ["Alamat", member.alamat]
      ];
      detailContent.innerHTML = '<div class="detail-grid">' + fields.map(([label, value]) =>
        `<div class="detail-item"><strong>${escapeHTML(label)}</strong>${escapeHTML(value)}</div>`
      ).join("") + '</div>';
      modal.classList.add("open");
    } else if (button.dataset.action === "edit") {
      window.location.href = `layanan.html?edit=${encodeURIComponent(id)}`;
    } else if (button.dataset.action === "delete") {
      if (confirm(`Hapus data anggota "${member.nama}" (${member.nrp})?`)) {
        saveMembers(members.filter(item => item.id !== id));
        showNotice(tableNotice, "Data anggota berhasil dihapus.", "success");
        renderTable();
      }
    }
  });
  document.getElementById("close-detail").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", event => { if (event.target === modal) modal.classList.remove("open"); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") modal.classList.remove("open"); });
  renderTable();
}
