Product Requirements Document (PRD): Auto Note Maker

Versi: 2.0 (React Professional Version)

Status: Draft untuk Pengembangan (Vibe Coding)

Target Platform: Web (Desktop & Mobile-Responsive)

1. Product Overview

Product Name: Auto Note Maker

Description: Aplikasi web progresif berbasis React yang mentransformasikan input teks digital menjadi tampilan catatan buku tulis fisik yang realistis secara instan. Menggabungkan sistem manajemen buku (Library/Rak Buku) dengan editor teks kaya (rich text) yang canggih untuk menghasilkan aset digital estetik dengan sentuhan tulisan tangan natural.

2. Goals & Objectives

Automate: Mengotomatiskan penyusunan teks agar selalu duduk tepat di atas garis buku (snap-to-line) secara presisi.

Enhance: Memberikan pengalaman menulis digital yang premium menggunakan komponen shadcn/ui dan performa editor Tiptap/Lexical.

Empower: Memungkinkan pengguna membuat catatan belajar, jurnal, atau risalah rapat estetik yang siap dibagikan ke media sosial.

Support: Menjamin keamanan data melalui sistem penyimpanan luring (offline-first) menggunakan IndexedDB.

3. Target User

Pelajar/Mahasiswa: Untuk membuat catatan belajar yang rapi dan estetik.

Digital Journaler: Individu yang menyukai seni membuat jurnal harian secara digital.

Profesional Kreatif: Untuk dokumentasi rapat yang lebih personal dan artistik.

4. Core Features

A. Library Management (Notebook Manager)

Grid/List View: Antarmuka rak buku untuk mengelola berbagai proyek catatan.

Cover Customization: Fitur untuk memilih atau mengunggah gambar sampul (cover) buku.

Full CRUD: Membuat, membaca, memperbarui judul, dan menghapus notebook.

B. Advanced Rich Text Editor

Formatting Engine: Mendukung Bold, Italic, Underline, dan Text Alignment (Left, Center, Right).

Multi-Color Highlighter: Fitur stabilo berwarna (Kuning, Hijau, Merah Muda, Biru) untuk penekanan informasi.

Dynamic Object Insertion: Kemampuan menyisipkan Gambar dan Tabel tanpa merusak tata letak baris.

C. Digital Paper Engine

Baseline Sync Logic: Sinkronisasi otomatis antara line-height teks dengan posisi garis pada latar belakang kertas.

Auto-Scaling Preview: Menggunakan CSS Transform untuk menyesuaikan ukuran pratinjau halaman buku di layar perangkat yang berbeda.

D. Export Center

High-Resolution Export: Mengonversi elemen pratinjau menjadi gambar PNG/JPG berkualitas tinggi melalui html-to-image.

Native PDF Generation: Membuat file PDF fungsional dengan teks yang tetap dapat disalin melalui jsPDF.

5. Architecture & Tech Stack

Tech Stack Utama

Frontend: React (Vite) + TypeScript.

Styling: Tailwind CSS + shadcn/ui (Radix UI).

Editor Core: Tiptap Editor atau Lexical.

Icons: Lucide React.

Storage: IndexedDB (via idb atau Dexie.js) untuk manajemen draf dan file gambar lokal.

Export Tools: html-to-image & jsPDF.

Logika Teknis Spesifik (Crucial)

Baseline Alignment:

Variabel CSS --line-height harus dikunci (contoh: 34px).

Properti background-position pada kertas harus dikalibrasi secara matematis terhadap baseline font (seperti 'Patrick Hand') agar teks selalu menempel di atas garis buku.

Auto-save System:

Implementasi debounce logic pada state React untuk menyinkronkan konten editor ke IndexedDB secara asinkron.

Dokumen ini dibuat untuk memandu proses pengembangan AI dalam sesi Vibe Coding.