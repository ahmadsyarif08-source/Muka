import { Sekolah, Kegiatan, Siswa, PembayaranHonor } from '../types';
import { formatTanggalSaja, formatBulanTahunIndo, formatRupiah } from './storage';

interface WordDocConfig {
  filename: string;
  title: string;
  contentHtml: string;
}

export function downloadWordDocument({ filename, title, contentHtml }: WordDocConfig) {
  const completeHtml = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21cm 29.7cm;
      margin: 2cm 2cm 2cm 2cm;
      mso-page-orientation: portrait;
    }
    body {
      font-family: 'Times New Roman', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, p {
      margin: 0;
      padding: 0;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    
    /* Kop Surat */
    .kop-wrapper {
      width: 100%;
      border-bottom: 3px double #000000;
      padding-bottom: 8px;
      margin-bottom: 18px;
    }
    .kop-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    .kop-table td {
      border: none;
      padding: 2px 4px;
      vertical-align: middle;
    }
    .kop-title-1 {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .kop-title-2 {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .kop-title-3 {
      font-size: 11pt;
      font-weight: bold;
    }
    .kop-sub {
      font-size: 9pt;
      color: #333333;
      margin-top: 3px;
    }

    /* Document Title */
    .doc-header {
      margin-bottom: 16px;
      text-align: center;
    }
    .doc-title {
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 10pt;
      color: #222222;
    }

    /* Standard Data Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 16px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #333333;
      padding: 6px 8px;
      font-size: 9.5pt;
    }
    table.data-table th {
      background-color: #f1f3f5;
      font-weight: bold;
      text-align: center;
    }
    table.data-table tr:nth-child(even) {
      background-color: #fafbfc;
    }

    /* Summary Bar */
    .summary-box {
      margin-top: 10px;
      font-size: 10pt;
      font-weight: bold;
    }

    /* Signatures */
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-top: 25px;
      page-break-inside: avoid;
    }
    .signature-table td {
      border: none;
      padding: 2px 6px;
      vertical-align: top;
      font-size: 10pt;
    }
    .sign-space {
      height: 60px;
    }
    .sign-name {
      font-weight: bold;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>
  `;

  const blob = new Blob(['\ufeff' + completeHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// Generate Kop Surat HTML for Word
function buildWordKop(sekolah: Sekolah): string {
  const gudepNo = sekolah.gudep || '00.000 - 00.000';
  const alamat = sekolah.alamat || 'Alamat Belum Diatur';
  const hariJam = `${sekolah.hariLatihan || 'Jumat'} (${sekolah.jamLatihan || '14:00 - 16:00'})`;

  return `
    <div class="kop-wrapper">
      <table class="kop-table">
        <tr>
          <td style="width: 70px; text-align: center;">
            <div style="font-size: 26pt; color: #5c3a21; font-weight: bold;">⚜</div>
            <div style="font-size: 7pt; font-weight: bold; color: #555;">GERAKAN PRAMUKA</div>
          </td>
          <td style="text-align: center;">
            <div class="kop-title-1">GERAKAN PRAMUKA GUGUS DEPAN</div>
            <div class="kop-title-2">PANGKALAN ${sekolah.nama.toUpperCase()}</div>
            <div class="kop-title-3">NOMOR GUDEP: ${gudepNo} · TINGKAT ${sekolah.tingkat}</div>
            <div class="kop-sub">${alamat} · Latihan Rutin: ${hariJam}</div>
          </td>
          <td style="width: 70px; text-align: center;">
            <div style="font-size: 22pt; color: #1e3a8a; font-weight: bold;">🏫</div>
            <div style="font-size: 7pt; font-weight: bold; color: #555;">PANGKALAN SEKOLAH</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Generate Signature Table for Word
function buildWordSignatures(
  sekolah: Sekolah,
  kotaTtd: string,
  tanggalTtd: string,
  pembinaNama: string,
  rightTitleRole: string = 'Pembina Gugus Depan'
): string {
  const tanggalFormat = formatTanggalSaja(tanggalTtd);
  return `
    <table class="signature-table">
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: right;">
          ${kotaTtd}, ${tanggalFormat}
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          Mengetahui,<br>
          <strong>Kepala Sekolah / Ka Mabigus</strong>
        </td>
        <td style="text-align: right;">
          ${rightTitleRole},<br>
          <strong>Pelatih Bertugas</strong>
        </td>
      </tr>
      <tr>
        <td class="sign-space"></td>
        <td class="sign-space"></td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <span class="sign-name">${sekolah.kepalaSekolah || '( .............................................. )'}</span><br>
          NIP. ${sekolah.nipKepsek || '...........................................'}
        </td>
        <td style="text-align: right;">
          <span class="sign-name">${pembinaNama || '( .............................................. )'}</span><br>
          Gugus Depan ${sekolah.gudep || ''}
        </td>
      </tr>
    </table>
  `;
}

// 1. Export Jurnal Latihan ke Word
export function exportJurnalToWord(
  sekolah: Sekolah,
  kegiatanList: Kegiatan[],
  bulan: string,
  kotaTtd: string,
  tanggalTtd: string,
  pembinaNama: string
) {
  const bulanLabel = formatBulanTahunIndo(bulan);
  let totalPeserta = 0;

  const rowsHtml = kegiatanList.length === 0
    ? `<tr><td colspan="7" class="text-center" style="padding: 14px; color: #777;">Belum ada catatan jurnal latihan pada periode ini.</td></tr>`
    : kegiatanList.map((k, idx) => {
        totalPeserta += k.peserta || 0;
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td class="text-center">${formatTanggalSaja(k.tanggal)}</td>
            <td><strong>${k.materi}</strong></td>
            <td class="text-center">${k.kategoriMateri}</td>
            <td class="text-center">${k.peserta} Orang</td>
            <td>${k.pelatih}</td>
            <td>${k.catatan || k.kendala || '-'}</td>
          </tr>
        `;
      }).join('');

  const contentHtml = `
    ${buildWordKop(sekolah)}

    <div class="doc-header">
      <div class="doc-title">JURNAL KEGIATAN & MATERI LATIHAN PRAMUKA</div>
      <div class="doc-subtitle">Periode: Bulan ${bulanLabel} | Pangkalan: ${sekolah.nama}</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">No</th>
          <th style="width: 85px;">Tanggal</th>
          <th>Materi Pokok / Bahasan Latihan</th>
          <th style="width: 75px;">Kategori</th>
          <th style="width: 75px;">Peserta</th>
          <th style="width: 130px;">Pelatih Bertugas</th>
          <th style="width: 140px;">Catatan / Evaluasi</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="summary-box">
      Total Pertemuan Terlaksana: ${kegiatanList.length} Sesi &nbsp;|&nbsp; Akumulasi Kehadiran Peserta: ${totalPeserta} Siswa
    </div>

    ${buildWordSignatures(sekolah, kotaTtd, tanggalTtd, pembinaNama, 'Pembina Gugus Depan')}
  `;

  downloadWordDocument({
    filename: `Laporan_Jurnal_${sekolah.nama.replace(/\s+/g, '_')}_${bulan}.doc`,
    title: `Jurnal Latihan Pramuka - ${sekolah.nama} - ${bulanLabel}`,
    contentHtml,
  });
}

// 2. Export Presensi Siswa ke Word
export function exportPresensiToWord(
  sekolah: Sekolah,
  siswaList: Siswa[],
  absensi: Record<string, string>,
  allDates: string[],
  bulan: string,
  kotaTtd: string,
  tanggalTtd: string,
  pembinaNama: string
) {
  const bulanLabel = formatBulanTahunIndo(bulan);

  const rowsHtml = siswaList.length === 0
    ? `<tr><td colspan="9" class="text-center" style="padding: 14px; color: #777;">Belum ada data anggota siswa terdaftar.</td></tr>`
    : siswaList.map((s, idx) => {
        let h = 0, i = 0, sk = 0, a = 0;
        allDates.forEach((d) => {
          const stat = absensi[`${sekolah.id}_${d}_${s.id}`];
          if (stat === 'H') h++;
          else if (stat === 'I') i++;
          else if (stat === 'S') sk++;
          else if (stat === 'A') a++;
        });
        const pct = allDates.length > 0 ? Math.round((h / allDates.length) * 100) : 0;
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${s.nama}</strong> (${s.jenisKelamin})</td>
            <td class="text-center">${s.nis || '-'}</td>
            <td class="text-center">${s.kelas}</td>
            <td>${s.regu || '-'}</td>
            <td class="text-center" style="font-weight: bold; color: #065f46;">${h}</td>
            <td class="text-center" style="color: #1e3a8a;">${i}</td>
            <td class="text-center" style="color: #92400e;">${sk}</td>
            <td class="text-center" style="color: #991b1b;">${a}</td>
            <td class="text-center font-bold">${pct}%</td>
          </tr>
        `;
      }).join('');

  const contentHtml = `
    ${buildWordKop(sekolah)}

    <div class="doc-header">
      <div class="doc-title">REKAPITULASI PRESENSI / KEHADIRAN ANGGOTA PRAMUKA</div>
      <div class="doc-subtitle">Periode: Bulan ${bulanLabel} | Jumlah Latihan: ${allDates.length} Pertemuan</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 30px;">No</th>
          <th>Nama Anggota</th>
          <th style="width: 65px;">NIS</th>
          <th style="width: 55px;">Kelas</th>
          <th style="width: 90px;">Regu / Barung</th>
          <th style="width: 35px;">H</th>
          <th style="width: 35px;">I</th>
          <th style="width: 35px;">S</th>
          <th style="width: 35px;">A</th>
          <th style="width: 50px;">% Hadir</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <p style="font-size: 8.5pt; color: #555; margin-top: 4px;">
      * Keterangan: H = Hadir, I = Izin, S = Sakit, A = Alpa / Tanpa Keterangan
    </p>

    ${buildWordSignatures(sekolah, kotaTtd, tanggalTtd, pembinaNama, 'Pembina Gugus Depan')}
  `;

  downloadWordDocument({
    filename: `Laporan_Presensi_${sekolah.nama.replace(/\s+/g, '_')}_${bulan}.doc`,
    title: `Rekap Presensi Pramuka - ${sekolah.nama} - ${bulanLabel}`,
    contentHtml,
  });
}

// 3. Export Honor Pelatih ke Word
export function exportHonorToWord(
  sekolah: Sekolah,
  honorList: PembayaranHonor[],
  bulan: string,
  kotaTtd: string,
  tanggalTtd: string,
  pembinaNama: string
) {
  const bulanLabel = formatBulanTahunIndo(bulan);
  let totalHonorSemua = 0;

  const rowsHtml = honorList.length === 0
    ? `<tr><td colspan="7" class="text-center" style="padding: 14px; color: #777;">Belum ada rekap honor pelatih pada bulan ini.</td></tr>`
    : honorList.map((h, idx) => {
        totalHonorSemua += h.totalHonor;
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${h.pelatih}</strong></td>
            <td class="text-center">${h.jumlahPertemuan} Sesi</td>
            <td class="text-right">${formatRupiah(h.tarifPerPertemuan)}</td>
            <td class="text-right font-bold">${formatRupiah(h.totalHonor)}</td>
            <td class="text-center">${h.statusBayar}</td>
            <td>${h.tanggalBayar ? formatTanggalSaja(h.tanggalBayar) : '-'}</td>
          </tr>
        `;
      }).join('');

  const contentHtml = `
    ${buildWordKop(sekolah)}

    <div class="doc-header">
      <div class="doc-title">DAFTAR REKAPITULASI HONORARIUM PELATIH PRAMUKA</div>
      <div class="doc-subtitle">Periode: Bulan ${bulanLabel} | Tarif Standar: ${formatRupiah(sekolah.honorPerPertemuan || 0)} / Sesi</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">No</th>
          <th>Nama Pembina / Pelatih</th>
          <th style="width: 85px;">Jumlah Sesi</th>
          <th style="width: 110px;">Tarif / Sesi</th>
          <th style="width: 120px;">Total Honor</th>
          <th style="width: 90px;">Status</th>
          <th style="width: 100px;">Tanggal Bayar</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        ${honorList.length > 0 ? `
          <tr style="background-color: #f1f3f5; font-weight: bold;">
            <td colspan="4" class="text-center">TOTAL DANA HONOR KESELURUHAN</td>
            <td class="text-right" style="color: #065f46; font-size: 11pt;">${formatRupiah(totalHonorSemua)}</td>
            <td colspan="2"></td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    ${buildWordSignatures(sekolah, kotaTtd, tanggalTtd, pembinaNama, 'Penerima Honor / Pelatih')}
  `;

  downloadWordDocument({
    filename: `Laporan_Honor_${sekolah.nama.replace(/\s+/g, '_')}_${bulan}.doc`,
    title: `Rekap Honor Pelatih - ${sekolah.nama} - ${bulanLabel}`,
    contentHtml,
  });
}

// 4. Export Buku Induk Anggota ke Word
export function exportBukuIndukToWord(
  sekolah: Sekolah,
  siswaList: Siswa[],
  kotaTtd: string,
  tanggalTtd: string,
  pembinaNama: string
) {
  const rowsHtml = siswaList.length === 0
    ? `<tr><td colspan="7" class="text-center" style="padding: 14px; color: #777;">Belum ada anggota terdaftar di pangkalan ini.</td></tr>`
    : siswaList.map((s, idx) => {
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${s.nama}</strong></td>
            <td class="text-center">${s.nis || '-'}</td>
            <td class="text-center">${s.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
            <td class="text-center">${s.kelas}</td>
            <td>${s.regu || '-'}</td>
            <td class="text-center font-bold">${s.jabatan || 'Anggota'}</td>
          </tr>
        `;
      }).join('');

  const contentHtml = `
    ${buildWordKop(sekolah)}

    <div class="doc-header">
      <div class="doc-title">BUKU INDUK REGISTRASI ANGGOTA PRAMUKA</div>
      <div class="doc-subtitle">Pangkalan: ${sekolah.nama} | Gugus Depan: ${sekolah.gudep || '-'} | Total: ${siswaList.length} Anggota</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">No</th>
          <th>Nama Lengkap Anggota</th>
          <th style="width: 85px;">NIS / NTA</th>
          <th style="width: 90px;">Jenis Kelamin</th>
          <th style="width: 60px;">Kelas</th>
          <th style="width: 120px;">Regu / Barung / Sangga</th>
          <th style="width: 100px;">Jabatan</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="summary-box">
      Total Anggota Aktif Terdaftar: ${siswaList.length} Siswa (Laki-laki: ${siswaList.filter(s => s.jenisKelamin === 'L').length}, Perempuan: ${siswaList.filter(s => s.jenisKelamin === 'P').length})
    </div>

    ${buildWordSignatures(sekolah, kotaTtd, tanggalTtd, pembinaNama, 'Pembina Gugus Depan')}
  `;

  downloadWordDocument({
    filename: `Buku_Induk_Anggota_${sekolah.nama.replace(/\s+/g, '_')}.doc`,
    title: `Buku Induk Anggota Pramuka - ${sekolah.nama}`,
    contentHtml,
  });
}
