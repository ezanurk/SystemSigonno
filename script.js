let currentUser = null;
let currentRole = null;
let currentPage = null;

const users = {
    pendaftaran: { password: '123', role: 'Pendaftaran', name: 'Admin Pendaftaran' },
    rekammedis: { password: '123', role: 'Rekam Medis', name: 'Admin Rekam Medis' },
    manajer: { password: '123', role: 'Manajer', name: 'Manajer' }
};

// Storage Functions
function getPatients() {
    return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(patients) {
    localStorage.setItem('patients', JSON.stringify(patients));
}

function getMedicalRecords() {
    return JSON.parse(localStorage.getItem('medicalRecords') || '[]');
}

function saveMedicalRecords(records) {
    localStorage.setItem('medicalRecords', JSON.stringify(records));
}

function getCodings() {
    return JSON.parse(localStorage.getItem('codings') || '[]');
}

function saveCodings(codings) {
    localStorage.setItem('codings', JSON.stringify(codings));
}

// Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        currentUser = users[username].name;
        currentRole = users[username].role;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userDisplay').textContent = `${currentUser} (${currentRole})`;
        renderMenu();
        showDefaultPage();
    } else {
        alert('Username atau password salah!');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    currentPage = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Menu Rendering
function renderMenu() {
    const menus = {
        'Pendaftaran': [
            { name: 'Dashboard', func: 'showDashboard' },
            { name: 'Pasien Baru', func: 'showPasienBaru' },
            { name: 'Pasien Lama', func: 'showPasienLama' },
            { name: 'Data Pasien', func: 'showDataPasien' }
        ],
        'Rekam Medis': [
            { name: 'Rekam Medis', func: 'showRekamMedis' },
            { name: 'Koding', func: 'showKoding' },
            { name: 'Laporan', func: 'showLaporan' }
        ],
        'Manajer': [
            { name: 'Dashboard', func: 'showDashboardManajer' },
            { name: 'Data Pasien', func: 'showPendaftaran' },
            { name: 'Rekam Medis', func: 'showRekamMedis' },
            { name: 'Koding', func: 'showKoding' },
            { name: 'Grafik', func: 'showGrafik' },
            { name: 'Laporan', func: 'showLaporan' }
        ]
    };

    const menuHTML = menus[currentRole].map(m => 
        `<div class="nav-item ${currentPage === m.func ? 'active' : ''}" onclick="${m.func}()">${m.name}</div>`
    ).join('');
    
    document.getElementById('navMenu').innerHTML = menuHTML;
}

function showDefaultPage() {
    if (currentRole === 'Pendaftaran') showDashboard();
    else if (currentRole === 'Rekam Medis') showRekamMedis();
    else if (currentRole === 'Manajer') showDashboardManajer();
}

// DASHBOARD MANAJER
function showDashboardManajer() {
    currentPage = 'showDashboardManajer';
    renderMenu();
    
    const patients = getPatients();
    const medicalRecords = getMedicalRecords();
    const codings = getCodings();
    
    // Hitung statistik
    const totalPasien = patients.length;
    const pasienAktif = patients.filter(p => p.status === 'Aktif').length;
    const pasienBulanIni = patients.filter(p => {
        const tanggal = new Date(p.tanggalDaftar);
        const now = new Date();
        return tanggal.getMonth() === now.getMonth() && tanggal.getFullYear() === now.getFullYear();
    }).length;
    const pasienMingguIni = patients.filter(p => {
        const tanggal = new Date(p.tanggalDaftar);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tanggal >= weekAgo;
    }).length;

    // Data untuk grafik per bulan (6 bulan terakhir)
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = 0;
    }
    
    patients.forEach(p => {
        const month = p.tanggalDaftar.substring(0, 7);
        if (monthlyData.hasOwnProperty(month)) {
            monthlyData[month]++;
        }
    });

    // Data jenis kelamin
    const laki = patients.filter(p => p.jenisKelamin === 'Laki-laki').length;
    const perempuan = patients.filter(p => p.jenisKelamin === 'Perempuan').length;

    // Rekam medis belum dikoding
    const belumDikoding = medicalRecords.filter(mr => !codings.find(c => c.medicalRecordId === mr.id)).length;

    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <h2 class="card-title">📊 Dashboard Manajer - Overview Sistem</h2>
            
            <div class="dashboard-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">👥</div>
                    <div class="stat-label">Total Pasien Terdaftar</div>
                    <div class="stat-value">${totalPasien}</div>
                    <div class="stat-change neutral">Total keseluruhan pasien</div>
                </div>
                
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-label">Pasien Aktif</div>
                    <div class="stat-value">${pasienAktif}</div>
                    <div class="stat-change positive">
                        ↑ ${totalPasien > 0 ? ((pasienAktif/totalPasien)*100).toFixed(1) : 0}% dari total
                    </div>
                </div>
                
                <div class="stat-card purple">
                    <div class="stat-icon">📅</div>
                    <div class="stat-label">Pasien Bulan Ini</div>
                    <div class="stat-value">${pasienBulanIni}</div>
                    <div class="stat-change neutral">Pendaftaran bulan berjalan</div>
                </div>
                
                <div class="stat-card yellow">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-label">Pasien Minggu Ini</div>
                    <div class="stat-value">${pasienMingguIni}</div>
                    <div class="stat-change neutral">7 hari terakhir</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">📋 Statistik Rekam Medis & Koding</h3>
            
            <div class="quick-stats">
                <div class="quick-stat" style="background: linear-gradient(135deg, #10b981, #34d399);">
                    <div class="quick-stat-value">${medicalRecords.length}</div>
                    <div class="quick-stat-label">Total Rekam Medis</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa);">
                    <div class="quick-stat-value">${codings.length}</div>
                    <div class="quick-stat-label">Sudah Dikoding</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #f59e0b, #fbbf24);">
                    <div class="quick-stat-value">${belumDikoding}</div>
                    <div class="quick-stat-label">Belum Dikoding</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #0066FF, #4A90E2);">
                    <div class="quick-stat-value">${medicalRecords.length > 0 ? ((codings.length/medicalRecords.length)*100).toFixed(0) : 0}%</div>
                    <div class="quick-stat-label">Persentase Koding</div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div class="card">
                <h3 class="card-title">📈 Tren Pendaftaran (6 Bulan Terakhir)</h3>
                <canvas id="monthlyChart"></canvas>
            </div>

            <div class="card">
                <h3 class="card-title">👤 Distribusi Jenis Kelamin</h3>
                <canvas id="genderChart"></canvas>
                <div style="margin-top: 20px;">
                    <div class="quick-stats">
                        <div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; padding: 16px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800;">${laki}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Laki-laki</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 16px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800;">${perempuan}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Perempuan</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">🆕 Aktivitas Terbaru</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--dark-blue);">Pasien Terbaru (5 Terakhir)</h4>
                    ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Belum ada pasien</div></div>' : `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>No. RM</th>
                                    <th>Nama</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patients.slice(-5).reverse().map(p => `
                                    <tr>
                                        <td><strong>${p.noRM}</strong></td>
                                        <td>${p.nama}</td>
                                        <td>${new Date(p.tanggalDaftar).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
                
                <div>
                    <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--dark-blue);">Rekam Medis Terbaru (5 Terakhir)</h4>
                    ${medicalRecords.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Belum ada rekam medis</div></div>' : `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Pasien</th>
                                    <th>Diagnosis</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${medicalRecords.slice(-5).reverse().map(mr => {
                                    const p = patients.find(p => p.id === mr.patientId);
                                    return `
                                        <tr>
                                            <td>${p ? p.nama : '-'}</td>
                                            <td>${mr.diagnosis.substring(0, 30)}${mr.diagnosis.length > 30 ? '...' : ''}</td>
                                            <td>${new Date(mr.tanggal).toLocaleDateString('id-ID')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
            </div>
        </div>
    `;

    // Render Chart - Tren Bulanan
    setTimeout(() => {
        const ctx = document.getElementById('monthlyChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: Object.keys(monthlyData).map(m => {
                        const [year, month] = m.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
                        return `${monthNames[parseInt(month)-1]} ${year}`;
                    }),
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: Object.values(monthlyData),
                        borderColor: '#0066FF',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0066FF',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            ticks: { stepSize: 1 },
                            grid: {
                                color: 'rgba(0, 102, 255, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Render Chart - Jenis Kelamin
        const ctxGender = document.getElementById('genderChart');
        if (ctxGender) {
            new Chart(ctxGender.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Laki-laki', 'Perempuan'],
                    datasets: [{
                        data: [laki, perempuan],
                        backgroundColor: ['#3b82f6', '#ec4899'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }, 100);
}

// DASHBOARD PENDAFTARAN
function showDashboard() {
    currentPage = 'showDashboard';
    renderMenu();
    
    const patients = getPatients();
    const medicalRecords = getMedicalRecords();
    const codings = getCodings();
    
    // Hitung statistik
    const totalPasien = patients.length;
    const pasienAktif = patients.filter(p => p.status === 'Aktif').length;
    const pasienBulanIni = patients.filter(p => {
        const tanggal = new Date(p.tanggalDaftar);
        const now = new Date();
        return tanggal.getMonth() === now.getMonth() && tanggal.getFullYear() === now.getFullYear();
    }).length;
    const pasienMingguIni = patients.filter(p => {
        const tanggal = new Date(p.tanggalDaftar);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tanggal >= weekAgo;
    }).length;

    // Data untuk grafik per bulan (6 bulan terakhir)
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = 0;
    }
    
    patients.forEach(p => {
        const month = p.tanggalDaftar.substring(0, 7);
        if (monthlyData.hasOwnProperty(month)) {
            monthlyData[month]++;
        }
    });

    // Data jenis kelamin
    const laki = patients.filter(p => p.jenisKelamin === 'Laki-laki').length;
    const perempuan = patients.filter(p => p.jenisKelamin === 'Perempuan').length;

    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <h2 class="card-title">📊 Dashboard Pendaftaran Pasien</h2>
            
            <div class="dashboard-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">👥</div>
                    <div class="stat-label">Total Pasien Terdaftar</div>
                    <div class="stat-value">${totalPasien}</div>
                    <div class="stat-change neutral">Total keseluruhan pasien</div>
                </div>
                
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-label">Pasien Aktif</div>
                    <div class="stat-value">${pasienAktif}</div>
                    <div class="stat-change positive">
                        ↑ ${totalPasien > 0 ? ((pasienAktif/totalPasien)*100).toFixed(1) : 0}% dari total
                    </div>
                </div>
                
                <div class="stat-card purple">
                    <div class="stat-icon">📅</div>
                    <div class="stat-label">Pasien Bulan Ini</div>
                    <div class="stat-value">${pasienBulanIni}</div>
                    <div class="stat-change neutral">Pendaftaran bulan berjalan</div>
                </div>
                
                <div class="stat-card yellow">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-label">Pasien Minggu Ini</div>
                    <div class="stat-value">${pasienMingguIni}</div>
                    <div class="stat-change neutral">7 hari terakhir</div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div class="card">
                <h3 class="card-title">📈 Tren Pendaftaran (6 Bulan Terakhir)</h3>
                <canvas id="monthlyChart"></canvas>
            </div>

            <div class="card">
                <h3 class="card-title">👤 Distribusi Jenis Kelamin</h3>
                <canvas id="genderChart"></canvas>
                <div style="margin-top: 20px;">
                    <div class="quick-stats">
                        <div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; padding: 16px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800;">${laki}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Laki-laki</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 16px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800;">${perempuan}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Perempuan</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 class="card-title" style="margin: 0;">📋 Data Rekam Medis & Koding</h3>
            </div>
            
            <div class="quick-stats">
                <div class="quick-stat" style="background: linear-gradient(135deg, #10b981, #34d399);">
                    <div class="quick-stat-value">${medicalRecords.length}</div>
                    <div class="quick-stat-label">Total Rekam Medis</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa);">
                    <div class="quick-stat-value">${codings.length}</div>
                    <div class="quick-stat-label">Total Koding</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #f59e0b, #fbbf24);">
                    <div class="quick-stat-value">${medicalRecords.length - codings.length}</div>
                    <div class="quick-stat-label">Belum Dikoding</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">🆕 Pasien Terbaru (5 Terakhir)</h3>
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada pasien terdaftar</div></div>' : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No. RM</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Jenis Kelamin</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patients.slice(-5).reverse().map(p => `
                            <tr>
                                <td><strong>${p.noRM}</strong></td>
                                <td>${p.nik}</td>
                                <td>${p.nama}</td>
                                <td>${p.jenisKelamin}</td>
                                <td>${new Date(p.tanggalDaftar).toLocaleDateString('id-ID')}</td>
                                <td><span class="badge ${p.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${p.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;

    // Render Chart - Tren Bulanan
    setTimeout(() => {
        const ctx = document.getElementById('monthlyChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: Object.keys(monthlyData).map(m => {
                        const [year, month] = m.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
                        return `${monthNames[parseInt(month)-1]} ${year}`;
                    }),
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: Object.values(monthlyData),
                        borderColor: '#0066FF',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0066FF',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            ticks: { stepSize: 1 },
                            grid: {
                                color: 'rgba(0, 102, 255, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Render Chart - Jenis Kelamin
        const ctxGender = document.getElementById('genderChart');
        if (ctxGender) {
            new Chart(ctxGender.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Laki-laki', 'Perempuan'],
                    datasets: [{
                        data: [laki, perempuan],
                        backgroundColor: ['#3b82f6', '#ec4899'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }, 100);
}

// PASIEN BARU
function showPasienBaru() {
    currentPage = 'showPasienBaru';
    renderMenu();
    const patients = getPatients();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="card-title" style="margin: 0;">➕ Pendaftaran Pasien Baru</h2>
                <button onclick="openPatientModal()" class="btn-primary">+ Daftar Pasien Baru</button>
            </div>
            
            <div class="alert alert-success">
                ℹ️ Gunakan menu ini untuk mendaftarkan pasien baru yang belum pernah terdaftar di sistem
            </div>
            
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">Belum ada data pasien</div></div>' : `
                <h3 style="font-size: 18px; font-weight: 700; margin: 24px 0 16px;">Pasien Terbaru (10 Terakhir)</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No. RM</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tanggal Lahir</th>
                            <th>Jenis Kelamin</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patients.slice(-10).reverse().map(p => `
                            <tr>
                                <td><strong>${p.noRM}</strong></td>
                                <td>${p.nik}</td>
                                <td>${p.nama}</td>
                                <td>${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}</td>
                                <td>${p.jenisKelamin}</td>
                                <td>${new Date(p.tanggalDaftar).toLocaleDateString('id-ID')}</td>
                                <td><span class="badge ${p.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${p.status}</span></td>
                                <td>
                                    <button onclick="viewPatient(${p.id})" class="btn-primary" style="padding: 6px 12px; font-size: 13px;">Lihat</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

// PASIEN LAMA
function showPasienLama() {
    currentPage = 'showPasienLama';
    renderMenu();
    const patients = getPatients();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="card-title" style="margin: 0;">📋 Data Pasien Lama</h2>
                <div style="display: flex; gap: 12px;">
                    <input type="text" id="searchPatient" class="form-control" placeholder="🔍 Cari pasien (No. RM, NIK, atau Nama)..." style="width: 350px;">
                </div>
            </div>
            
            <div class="alert alert-success">
                ℹ️ Gunakan menu ini untuk melihat dan mengelola data pasien yang sudah terdaftar
            </div>
            
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">Belum ada data pasien</div></div>' : `
                <div id="patientTableContainer">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No. RM</th>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Tanggal Lahir</th>
                                <th>Jenis Kelamin</th>
                                <th>Telepon</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="patientTableBody">
                            ${patients.map(p => `
                                <tr class="patient-row" data-search="${p.noRM.toLowerCase()} ${p.nik.toLowerCase()} ${p.nama.toLowerCase()}">
                                    <td><strong>${p.noRM}</strong></td>
                                    <td>${p.nik}</td>
                                    <td>${p.nama}</td>
                                    <td>${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}</td>
                                    <td>${p.jenisKelamin}</td>
                                    <td>${p.telepon || '-'}</td>
                                    <td><span class="badge ${p.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${p.status}</span></td>
                                    <td>
                                        <button onclick="viewPatient(${p.id})" class="btn-primary" style="padding: 6px 12px; font-size: 13px;">Lihat</button>
                                        <button onclick="editPatient(${p.id})" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;">Edit</button>
                                        <button onclick="deletePatient(${p.id})" class="btn-danger" style="padding: 6px 12px; font-size: 13px;">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    // Add search functionality
    const searchInput = document.getElementById('searchPatient');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.patient-row');
            
            rows.forEach(row => {
                const searchData = row.getAttribute('data-search');
                if (searchData.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// DATA PASIEN (All patients)
function showDataPasien() {
    currentPage = 'showDataPasien';
    renderMenu();
    const patients = getPatients();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="card-title" style="margin: 0;">📊 Data Seluruh Pasien</h2>
                <div style="display: flex; gap: 12px;">
                    <input type="text" id="searchAllPatient" class="form-control" placeholder="🔍 Cari pasien..." style="width: 350px;">
                    <button onclick="exportDataPasien()" class="btn-primary">📥 Export CSV</button>
                </div>
            </div>
            
            <div class="quick-stats" style="margin-bottom: 24px;">
                <div class="quick-stat" style="background: linear-gradient(135deg, #0066FF, #4A90E2);">
                    <div class="quick-stat-value">${patients.length}</div>
                    <div class="quick-stat-label">Total Pasien</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #10b981, #34d399);">
                    <div class="quick-stat-value">${patients.filter(p => p.status === 'Aktif').length}</div>
                    <div class="quick-stat-label">Pasien Aktif</div>
                </div>
                <div class="quick-stat" style="background: linear-gradient(135deg, #ef4444, #f87171);">
                    <div class="quick-stat-value">${patients.filter(p => p.status === 'Tidak Aktif').length}</div>
                    <div class="quick-stat-label">Tidak Aktif</div>
                </div>
            </div>
            
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">Belum ada data pasien</div></div>' : `
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No. RM</th>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Tanggal Lahir</th>
                                <th>Jenis Kelamin</th>
                                <th>Pendidikan</th>
                                <th>Pekerjaan</th>
                                <th>Alamat</th>
                                <th>Telepon</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="allPatientTableBody">
                            ${patients.map(p => `
                                <tr class="patient-row" data-search="${p.noRM.toLowerCase()} ${p.nik.toLowerCase()} ${p.nama.toLowerCase()} ${(p.pekerjaan || '').toLowerCase()}">
                                    <td><strong>${p.noRM}</strong></td>
                                    <td>${p.nik}</td>
                                    <td>${p.nama}</td>
                                    <td>${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}</td>
                                    <td>${p.jenisKelamin}</td>
                                    <td>${p.pendidikan || '-'}</td>
                                    <td>${p.pekerjaan || '-'}</td>
                                    <td>${p.alamat ? (p.alamat.substring(0, 30) + (p.alamat.length > 30 ? '...' : '')) : '-'}</td>
                                    <td>${p.telepon || '-'}</td>
                                    <td><span class="badge ${p.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${p.status}</span></td>
                                    <td>
                                        <button onclick="viewPatient(${p.id})" class="btn-primary" style="padding: 6px 12px; font-size: 13px;">Lihat</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    // Add search functionality
    const searchInput = document.getElementById('searchAllPatient');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.patient-row');
            
            rows.forEach(row => {
                const searchData = row.getAttribute('data-search');
                if (searchData.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

function exportDataPasien() {
    const patients = getPatients();
    let csv = 'No. RM,NIK,Nama,Tanggal Lahir,Jenis Kelamin,Status Perkawinan,Pendidikan,Pekerjaan,BB,TB,Alamat,RT,RW,Kelurahan,Kecamatan,Kabupaten,Provinsi,Telepon,Status,Tanggal Daftar\n';
    
    patients.forEach(p => {
        csv += `${p.noRM},${p.nik},"${p.nama}",${p.tanggalLahir},${p.jenisKelamin},${p.statusPerkawinan||''},"${p.pendidikan||''}","${p.pekerjaan||''}",${p.beratBadan||''},${p.tinggiBadan||''},"${p.alamat||''}",${p.rt||''},${p.rw||''},${p.kelurahan||''},${p.kecamatan||''},${p.kabupaten||''},${p.provinsi||''},${p.telepon||''},${p.status},${p.tanggalDaftar}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-pasien-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// LIHAT DETAIL PASIEN
function viewPatient(id) {
    const patients = getPatients();
    const patient = patients.find(p => p.id === id);
    const medicalRecords = getMedicalRecords().filter(mr => mr.patientId === id);
    
    if (!patient) return;
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <button onclick="${currentPage}()" class="btn-secondary">← Kembali</button>
                <div style="display: flex; gap: 12px;">
                    <button onclick="editPatient(${id})" class="btn-primary">✏️ Edit Data</button>
                </div>
            </div>
            
            <h2 class="card-title">👤 Detail Pasien</h2>
            
            <div class="form-section">
                <div class="form-section-title">📋 Data Identitas</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <div class="stat-label">No. Rekam Medis</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--electric-blue);">${patient.noRM}</div>
                    </div>
                    <div>
                        <div class="stat-label">NIK</div>
                        <div style="font-size: 18px; font-weight: 600; color: var(--dark-blue);">${patient.nik}</div>
                    </div>
                    <div>
                        <div class="stat-label">Nama Lengkap</div>
                        <div style="font-size: 18px; font-weight: 600; color: var(--dark-blue);">${patient.nama}</div>
                    </div>
                    <div>
                        <div class="stat-label">Tanggal Lahir</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--dark-blue);">${new Date(patient.tanggalLahir).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div>
                        <div class="stat-label">Jenis Kelamin</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--dark-blue);">${patient.jenisKelamin}</div>
                    </div>
                    <div>
                        <div class="stat-label">Status</div>
                        <div><span class="badge ${patient.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${patient.status}</span></div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title">👤 Data Pribadi</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <div class="stat-label">Status Perkawinan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.statusPerkawinan || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Pendidikan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.pendidikan || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Pekerjaan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.pekerjaan || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Berat Badan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.beratBadan ? patient.beratBadan + ' kg' : '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Tinggi Badan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.tinggiBadan ? patient.tinggiBadan + ' cm' : '-'}</div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title">📍 Alamat</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="grid-column: 1 / -1;">
                        <div class="stat-label">Alamat Lengkap</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.alamat || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">RT / RW</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.rt || '-'} / ${patient.rw || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Kelurahan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.kelurahan || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Kecamatan</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.kecamatan || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Kabupaten/Kota</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.kabupaten || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Provinsi</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.provinsi || '-'}</div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title">📞 Kontak</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <div class="stat-label">Nomor Telepon</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${patient.telepon || '-'}</div>
                    </div>
                    <div>
                        <div class="stat-label">Tanggal Pendaftaran</div>
                        <div style="font-weight: 600; color: var(--dark-blue);">${new Date(patient.tanggalDaftar).toLocaleDateString('id-ID')}</div>
                    </div>
                </div>
            </div>

            ${medicalRecords.length > 0 ? `
                <div class="card" style="margin-top: 24px; background: #f9fafb;">
                    <h3 class="card-title">📋 Riwayat Rekam Medis</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Poli</th>
                                <th>Keluhan</th>
                                <th>Diagnosis</th>
                                <th>Tindakan</th>
                                <th>Terapi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medicalRecords.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map(mr => `
                                <tr>
                                    <td>${new Date(mr.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td><span class="badge badge-active">${mr.poli || '-'}</span></td>
                                    <td>${mr.keluhan}</td>
                                    <td>${mr.diagnosis}</td>
                                    <td>${mr.tindakan || '-'}</td>
                                    <td>${mr.terapi || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="alert alert-success" style="margin-top: 24px;">
                    ℹ️ Pasien ini belum memiliki riwayat rekam medis
                </div>
            `}
        </div>
    `;
}

// PENDAFTARAN (Untuk Manajer)
function showPendaftaran() {
    currentPage = 'showPendaftaran';
    renderMenu();
    const patients = getPatients();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="card-title" style="margin: 0;">Data Pasien</h2>
                <button onclick="openPatientModal()" class="btn-primary">+ Tambah Pasien</button>
            </div>
            
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">Belum ada data pasien</div></div>' : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No. RM</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tanggal Lahir</th>
                            <th>Jenis Kelamin</th>
                            <th>Telepon</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patients.map(p => `
                            <tr>
                                <td><strong>${p.noRM}</strong></td>
                                <td>${p.nik}</td>
                                <td>${p.nama}</td>
                                <td>${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}</td>
                                <td>${p.jenisKelamin}</td>
                                <td>${p.telepon || '-'}</td>
                                <td><span class="badge ${p.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}">${p.status}</span></td>
                                <td>
                                    <button onclick="editPatient(${p.id})" class="btn-secondary">Edit</button>
                                    <button onclick="deletePatient(${p.id})" class="btn-danger">Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

function openPatientModal(patientId = null) {
    document.getElementById('patientModal').style.display = 'flex';
    document.getElementById('patientForm').reset();
    document.getElementById('editPatientId').value = '';
    
    if (patientId) {
        const patients = getPatients();
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            document.getElementById('patientModalTitle').textContent = 'Edit Pasien';
            document.getElementById('editPatientId').value = patient.id;
            document.getElementById('nik').value = patient.nik;
            document.getElementById('nama').value = patient.nama;
            document.getElementById('tanggalLahir').value = patient.tanggalLahir;
            document.getElementById('jenisKelamin').value = patient.jenisKelamin;
            document.getElementById('statusPerkawinan').value = patient.statusPerkawinan || '';
            document.getElementById('pendidikan').value = patient.pendidikan || '';
            document.getElementById('pekerjaan').value = patient.pekerjaan || '';
            document.getElementById('beratBadan').value = patient.beratBadan || '';
            document.getElementById('tinggiBadan').value = patient.tinggiBadan || '';
            document.getElementById('alamat').value = patient.alamat || '';
            document.getElementById('rt').value = patient.rt || '';
            document.getElementById('rw').value = patient.rw || '';
            document.getElementById('kelurahan').value = patient.kelurahan || '';
            document.getElementById('kecamatan').value = patient.kecamatan || '';
            document.getElementById('kabupaten').value = patient.kabupaten || '';
            document.getElementById('provinsi').value = patient.provinsi || '';
            document.getElementById('telepon').value = patient.telepon || '';
            document.getElementById('status').value = patient.status;
            document.getElementById('poliTujuan').value = patient.poliTujuan || '';
        }
    } else {
        document.getElementById('patientModalTitle').textContent = 'Tambah Pasien Baru';
    }
}

function closePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
}

function validateNIK() {
    const nik = document.getElementById('nik').value;
    const error = document.getElementById('nikError');
    
    if (nik.length > 0 && nik.length !== 16) {
        error.textContent = 'NIK harus 16 digit';
        return false;
    } else if (!/^\d*$/.test(nik)) {
        error.textContent = 'NIK hanya boleh berisi angka';
        return false;
    } else {
        error.textContent = '';
        return true;
    }
}

function savePatient(event) {
    event.preventDefault();
    
    if (!validateNIK()) {
        alert('NIK tidak valid!');
        return;
    }
    
    const patients = getPatients();
    const editId = document.getElementById('editPatientId').value;
    
    const patientData = {
        id: editId ? parseInt(editId) : Date.now(),
        noRM: editId ? patients.find(p => p.id === parseInt(editId)).noRM : generateNoRM(),
        nik: document.getElementById('nik').value,
        nama: document.getElementById('nama').value,
        tanggalLahir: document.getElementById('tanggalLahir').value,
        jenisKelamin: document.getElementById('jenisKelamin').value,
        statusPerkawinan: document.getElementById('statusPerkawinan').value,
        pendidikan: document.getElementById('pendidikan').value,
        pekerjaan: document.getElementById('pekerjaan').value,
        beratBadan: document.getElementById('beratBadan').value,
        tinggiBadan: document.getElementById('tinggiBadan').value,
        alamat: document.getElementById('alamat').value,
        rt: document.getElementById('rt').value,
        rw: document.getElementById('rw').value,
        kelurahan: document.getElementById('kelurahan').value,
        kecamatan: document.getElementById('kecamatan').value,
        kabupaten: document.getElementById('kabupaten').value,
        provinsi: document.getElementById('provinsi').value,
        telepon: document.getElementById('telepon').value,
        status: document.getElementById('status').value,
        poliTujuan: document.getElementById('poliTujuan').value,
        tanggalDaftar: editId ? patients.find(p => p.id === parseInt(editId)).tanggalDaftar : new Date().toISOString().split('T')[0]
    };
    
    if (editId) {
        const index = patients.findIndex(p => p.id === parseInt(editId));
        patients[index] = patientData;
    } else {
        patients.push(patientData);
    }
    
    savePatients(patients);
    closePatientModal();
    
    // Refresh halaman sesuai context
    if (currentPage === 'showPendaftaran') {
        showPendaftaran();
    } else if (currentPage === 'showPasienLama') {
        showPasienLama();
    } else if (currentPage === 'showPasienBaru') {
        showPasienBaru();
    } else if (currentPage === 'showDataPasien') {
        showDataPasien();
    } else if (currentPage === 'showDashboard') {
        showDashboard();
    } else if (currentPage === 'showDashboardManajer') {
        showDashboardManajer();
    }
}

function generateNoRM() {
    const patients = getPatients();
    const lastRM = patients.length > 0 ? Math.max(...patients.map(p => parseInt(p.noRM.replace('RM', '')))) : 0;
    return 'RM' + String(lastRM + 1).padStart(6, '0');
}

function editPatient(id) {
    openPatientModal(id);
}

function deletePatient(id) {
    if (confirm('Yakin ingin menghapus data pasien ini?')) {
        let patients = getPatients();
        patients = patients.filter(p => p.id !== id);
        savePatients(patients);
        
        // Refresh halaman sesuai context
        if (currentPage === 'showPendaftaran') {
            showPendaftaran();
        } else if (currentPage === 'showPasienLama') {
            showPasienLama();
        } else if (currentPage === 'showPasienBaru') {
            showPasienBaru();
        } else if (currentPage === 'showDataPasien') {
            showDataPasien();
        } else if (currentPage === 'showDashboard') {
            showDashboard();
        } else if (currentPage === 'showDashboardManajer') {
            showDashboardManajer();
        }
    }
}

// REKAM MEDIS
function showRekamMedis() {
    currentPage = 'showRekamMedis';
    renderMenu();
    const patients = getPatients();
    const mrs = getMedicalRecords();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <h2 class="card-title">Rekam Medis Pasien</h2>
            
            ${patients.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada data pasien</div></div>' : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No. RM</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tanggal Lahir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patients.map(p => `
                            <tr>
                                <td><strong>${p.noRM}</strong></td>
                                <td>${p.nik}</td>
                                <td>${p.nama}</td>
                                <td>${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <button onclick="openMedicalRecordModal(${p.id})" class="btn-primary">+ Input RM</button>
                                    <button onclick="viewMedicalHistory(${p.id})" class="btn-secondary">Lihat Riwayat</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
            
            ${mrs.length > 0 ? `
                <h3 style="font-size: 20px; font-weight: 700; margin: 32px 0 16px; color: var(--dark-blue);">Rekam Medis Terbaru</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>No. RM</th>
                            <th>Nama</th>
                            <th>Poli</th>
                            <th>Keluhan</th>
                            <th>Diagnosis</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mrs.slice(-10).reverse().map(mr => {
                            const p = patients.find(p => p.id === mr.patientId);
                            return `
                                <tr>
                                    <td>${new Date(mr.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td><strong>${p ? p.noRM : '-'}</strong></td>
                                    <td>${p ? p.nama : '-'}</td>
                                    <td><span class="badge badge-active">${mr.poli || '-'}</span></td>
                                    <td>${mr.keluhan}</td>
                                    <td>${mr.diagnosis}</td>
                                    <td>
                                        <button onclick="openMedicalRecordModal(${mr.patientId}, ${mr.id})" class="btn-secondary">Edit</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : ''}
        </div>
    `;
}

function openMedicalRecordModal(patientId, recordId = null) {
    document.getElementById('medicalRecordModal').style.display = 'flex';
    document.getElementById('mrPatientId').value = patientId;
    document.getElementById('editMRId').value = '';
    
    if (recordId) {
        const records = getMedicalRecords();
        const record = records.find(r => r.id === recordId);
        if (record) {
            document.getElementById('editMRId').value = record.id;
            document.getElementById('mrPoli').value = record.poli || '';
            document.getElementById('mrTanggal').value = record.tanggal;
            document.getElementById('mrKeluhan').value = record.keluhan;
            document.getElementById('mrDiagnosis').value = record.diagnosis;
            document.getElementById('mrTindakan').value = record.tindakan || '';
            document.getElementById('mrTerapi').value = record.terapi || '';
        }
    } else {
        document.getElementById('mrPoli').value = '';
        document.getElementById('mrTanggal').value = new Date().toISOString().split('T')[0];
        document.getElementById('mrKeluhan').value = '';
        document.getElementById('mrDiagnosis').value = '';
        document.getElementById('mrTindakan').value = '';
        document.getElementById('mrTerapi').value = '';
    }
}

function closeMedicalRecordModal() {
    document.getElementById('medicalRecordModal').style.display = 'none';
}

function saveMedicalRecord(event) {
    event.preventDefault();
    
    const records = getMedicalRecords();
    const editId = document.getElementById('editMRId').value;
    
    const recordData = {
        id: editId ? parseInt(editId) : Date.now(),
        patientId: parseInt(document.getElementById('mrPatientId').value),
        poli: document.getElementById('mrPoli').value,
        tanggal: document.getElementById('mrTanggal').value,
        keluhan: document.getElementById('mrKeluhan').value,
        diagnosis: document.getElementById('mrDiagnosis').value,
        tindakan: document.getElementById('mrTindakan').value,
        terapi: document.getElementById('mrTerapi').value
    };
    
    if (editId) {
        const index = records.findIndex(r => r.id === parseInt(editId));
        records[index] = recordData;
    } else {
        records.push(recordData);
    }
    
    saveMedicalRecords(records);
    closeMedicalRecordModal();
    showRekamMedis();
}

function viewMedicalHistory(patientId) {
    const patients = getPatients();
    const patient = patients.find(p => p.id === patientId);
    const records = getMedicalRecords().filter(r => r.patientId === patientId);
    
    if (records.length === 0) {
        alert('Belum ada riwayat rekam medis untuk pasien ini');
        return;
    }
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <button onclick="showRekamMedis()" class="btn-secondary" style="margin-bottom: 20px;">← Kembali</button>
            
            <h2 class="card-title">Riwayat Rekam Medis</h2>
            
            <div class="form-section">
                <div class="form-section-title">👤 Data Pasien</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">No. RM</div>
                        <div style="font-weight: 700;">${patient.noRM}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Nama</div>
                        <div style="font-weight: 700;">${patient.nama}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">NIK</div>
                        <div style="font-weight: 700;">${patient.nik}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Tanggal Lahir</div>
                        <div style="font-weight: 700;">${new Date(patient.tanggalLahir).toLocaleDateString('id-ID')}</div>
                    </div>
                </div>
            </div>
            
            <h3 style="font-size: 18px; font-weight: 700; margin: 24px 0 16px;">Riwayat Kunjungan</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Poli</th>
                        <th>Keluhan</th>
                        <th>Diagnosis</th>
                        <th>Tindakan</th>
                        <th>Terapi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map(r => `
                        <tr>
                            <td>${new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                            <td><span class="badge badge-active">${r.poli || '-'}</span></td>
                            <td>${r.keluhan}</td>
                            <td>${r.diagnosis}</td>
                            <td>${r.tindakan || '-'}</td>
                            <td>${r.terapi || '-'}</td>
                            <td>
                                <button onclick="openMedicalRecordModal(${patientId}, ${r.id})" class="btn-secondary">Edit</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// KODING
function showKoding() {
    currentPage = 'showKoding';
    renderMenu();
    const mrs = getMedicalRecords();
    const patients = getPatients();
    const codings = getCodings();
    
    const uncodedMRs = mrs.filter(mr => !codings.find(c => c.medicalRecordId === mr.id));
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <h2 class="card-title">Koding Diagnosis & Tindakan</h2>
            
            <div class="alert alert-${uncodedMRs.length > 0 ? 'error' : 'success'}">
                ${uncodedMRs.length > 0 ? 
                    `⚠️ Terdapat ${uncodedMRs.length} rekam medis yang belum dikoding` :
                    '✅ Semua rekam medis sudah dikoding'
                }
            </div>
            
            ${uncodedMRs.length > 0 ? `
                <h3 style="font-size: 18px; font-weight: 700; margin: 24px 0 16px;">RM Belum Dikoding</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>No. RM</th>
                            <th>Nama</th>
                            <th>Diagnosis</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${uncodedMRs.map(mr => {
                            const p = patients.find(p => p.id === mr.patientId);
                            return `
                                <tr>
                                    <td>${new Date(mr.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td><strong>${p ? p.noRM : '-'}</strong></td>
                                    <td>${p ? p.nama : '-'}</td>
                                    <td>${mr.diagnosis}</td>
                                    <td>
                                        <button onclick="openCodingModal(${mr.id})" class="btn-primary">+ Koding</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : ''}

            ${codings.length > 0 ? `
                <h3 style="font-size: 18px; font-weight: 700; margin: 32px 0 16px;">Data Koding</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Pasien</th>
                            <th>ICD-10</th>
                            <th>Diagnosis</th>
                            <th>ICD-9</th>
                            <th>Tindakan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${codings.map(c => {
                            const mr = mrs.find(m => m.id === c.medicalRecordId);
                            const p = mr ? patients.find(p => p.id === mr.patientId) : null;
                            return `
                                <tr>
                                    <td>${mr ? new Date(mr.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                                    <td>${p ? p.nama : '-'}</td>
                                    <td><strong>${c.icd10}</strong></td>
                                    <td>${c.diagnosisText}</td>
                                    <td><strong>${c.icd9 || '-'}</strong></td>
                                    <td>${c.tindakanText || '-'}</td>
                                    <td>
                                        <button onclick="openCodingModal(${c.medicalRecordId}, ${c.id})" class="btn-secondary">Edit</button>
                                        <button onclick="deleteCoding(${c.id})" class="btn-danger">Hapus</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">Belum ada data koding</div></div>'}
        </div>
    `;
}

function openCodingModal(medicalRecordId, codingId = null) {
    document.getElementById('codingModal').style.display = 'flex';
    document.getElementById('codingMRId').value = medicalRecordId;
    document.getElementById('editCodingId').value = '';
    
    if (codingId) {
        const codings = getCodings();
        const coding = codings.find(c => c.id === codingId);
        if (coding) {
            document.getElementById('editCodingId').value = coding.id;
            document.getElementById('icd10').value = coding.icd10;
            document.getElementById('diagnosisText').value = coding.diagnosisText;
            document.getElementById('icd9').value = coding.icd9 || '';
            document.getElementById('tindakanText').value = coding.tindakanText || '';
        }
    } else {
        const mr = getMedicalRecords().find(r => r.id === medicalRecordId);
        if (mr) {
            document.getElementById('diagnosisText').value = mr.diagnosis;
            document.getElementById('tindakanText').value = mr.tindakan || '';
        }
        document.getElementById('icd10').value = '';
        document.getElementById('icd9').value = '';
    }
}

function closeCodingModal() {
    document.getElementById('codingModal').style.display = 'none';
}

function saveCoding(event) {
    event.preventDefault();
    
    const codings = getCodings();
    const editId = document.getElementById('editCodingId').value;
    
    const codingData = {
        id: editId ? parseInt(editId) : Date.now(),
        medicalRecordId: parseInt(document.getElementById('codingMRId').value),
        icd10: document.getElementById('icd10').value,
        diagnosisText: document.getElementById('diagnosisText').value,
        icd9: document.getElementById('icd9').value,
        tindakanText: document.getElementById('tindakanText').value
    };
    
    if (editId) {
        const index = codings.findIndex(c => c.id === parseInt(editId));
        codings[index] = codingData;
    } else {
        codings.push(codingData);
    }
    
    saveCodings(codings);
    closeCodingModal();
    showKoding();
}

function deleteCoding(id) {
    if (confirm('Yakin ingin menghapus data koding ini?')) {
        let codings = getCodings();
        codings = codings.filter(c => c.id !== id);
        saveCodings(codings);
        showKoding();
    }
}

// GRAFIK
function showGrafik() {
    currentPage = 'showGrafik';
    renderMenu();
    const patients = getPatients();
    
    const monthlyData = {};
    patients.forEach(p => {
        const month = p.tanggalDaftar.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <h2 class="card-title">📊 Grafik Pasien Bulanan</h2>
            
            <div class="dashboard-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">👥</div>
                    <div class="stat-label">Total Pasien</div>
                    <div class="stat-value">${patients.length}</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">📈</div>
                    <div class="stat-label">Total Bulan</div>
                    <div class="stat-value">${sortedMonths.length}</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon">📅</div>
                    <div class="stat-label">Rata-rata/Bulan</div>
                    <div class="stat-value">${sortedMonths.length > 0 ? Math.round(patients.length / sortedMonths.length) : 0}</div>
                </div>
            </div>
            
            ${sortedMonths.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada data untuk ditampilkan</div></div>' : 
                '<div class="chart-container"><canvas id="monthlyChart"></canvas></div>'
            }
        </div>
    `;

    if (sortedMonths.length > 0) {
        setTimeout(() => {
            const ctx = document.getElementById('monthlyChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedMonths.map(m => {
                        const [year, month] = m.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
                        return `${monthNames[parseInt(month)-1]} ${year}`;
                    }),
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: sortedMonths.map(m => monthlyData[m]),
                        borderColor: '#0066FF',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0066FF',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            ticks: { stepSize: 1 },
                            grid: {
                                color: 'rgba(0, 102, 255, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }, 100);
    }
}

// LAPORAN
function showLaporan() {
    currentPage = 'showLaporan';
    renderMenu();
    const patients = getPatients();
    
    document.getElementById('contentArea').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="card-title" style="margin: 0;">📄 Laporan</h2>
                <button onclick="exportLaporan()" class="btn-primary">📥 Ekspor CSV</button>
            </div>
            
            <div class="dashboard-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">👥</div>
                    <div class="stat-label">Total Pasien</div>
                    <div class="stat-value">${patients.length}</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">📋</div>
                    <div class="stat-label">Rekam Medis</div>
                    <div class="stat-value">${getMedicalRecords().length}</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon">📝</div>
                    <div class="stat-label">Koding</div>
                    <div class="stat-value">${getCodings().length}</div>
                </div>
                <div class="stat-card yellow">
                    <div class="stat-icon">✅</div>
                    <div class="stat-label">Pasien Aktif</div>
                    <div class="stat-value">${patients.filter(p => p.status === 'Aktif').length}</div>
                </div>
            </div>
        </div>
    `;
}

function exportLaporan() {
    const patients = getPatients();
    let csv = 'No. RM,NIK,Nama,Tanggal Lahir,Jenis Kelamin,Status Perkawinan,Pekerjaan,BB,TB,Alamat,RT,RW,Kelurahan,Kecamatan,Kabupaten,Provinsi,Telepon,Status\n';
    
    patients.forEach(p => {
        csv += `${p.noRM},${p.nik},"${p.nama}",${p.tanggalLahir},${p.jenisKelamin},${p.statusPerkawinan},"${p.pekerjaan}",${p.beratBadan||''},${p.tinggiBadan||''},"${p.alamat}",${p.rt||''},${p.rw||''},${p.kelurahan},${p.kecamatan},${p.kabupaten},${p.provinsi},${p.telepon},${p.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-sigonno-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('input', function(e) {
        if (e.target.id === 'nik') validateNIK();
    });
});

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

