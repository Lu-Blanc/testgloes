import config from "../config/config.js";
import sql from "mssql";
import multer from "multer";
import jwt from "jsonwebtoken";
import path from "path";

// ini di gunakan karna tidak bisa langsung menggunakan __dirname
import { dirname } from "path";
import { fileURLToPath } from "url";

const pool = await sql.connect(config);
const secretKey = "rahasia";

// Login
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool
      .request()
      .query(
        `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ msg: "Invalid Username or Password" });
    }
    const token = jwt.sign(
      { username, role: result.recordset[0].role },
      secretKey
    );
    res.status(200).json({
      msg: "login berhasil",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({msg: 'Internal Server Error'});
  }
};

// Upload File
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });

export const uploadFile = async (req, res) => {
  const { filename } = req.file;

  if (!filename) {
    return res.status(400).json({ msg: "File tidak boleh kosong" });
  }

  const { judul, deskripsi } = req.body;

  // Verifikasi autentikasi
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ msg: "Silahkan Login Terlebih Dahulu" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, secretKey);
    const { username, role } = decoded;

    // Periksa peran pengguna dari token
    if (role !== "admin") {
      return res.status(403).json({ msg: "Anda Tidak Memiliki Akses Upload" });
    }

    const result = await pool
    .request()
    .query(
      `INSERT INTO files (filename, judul, deskripsi, nama_pengunggah) VALUES ('${filename}', '${judul}', '${deskripsi}', '${username}')`
    );

    res.status(200).json({ msg: "Upload berhasil" }).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Get Daftar File
export const getFile = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "Silahkan Login Terlebih Dahulu" });
    }

    const result = await pool
      .request()
      .query(
        "SELECT DISTINCT judul, deskripsi, nama_pengunggah, tanggal_unggah FROM files"
      );
    //   agar yang tampil tidak double
    const files = result.recordset;

    res.status(200).json({ msg: "Daftar File", files });
  } catch (error) {
    console.log(error);
  }
};

// Download File
// Untuk mendapatkan path file saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadFile = async (req, res) => {
  const { idfile } = req.params;

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ msg: "Silahkan Login Terlebih Dahulu" });
  }

  try {
    const result = await pool
      .request()
      .query(`SELECT * FROM files WHERE idfile = ${idfile}`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ msg: "File not found" });
    }

    const { filename } = result.recordset[0];
    const filePath = path.join(__dirname, "../upload", filename);

    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Failed to download file" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

//Delete File
export const deleteFile = async (req, res) => {
  const { idfile } = req.params;

  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ msg: "Silahkan Login Terlebih Dahulu" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { role } = decoded;
    if (role !== "admin") {
      return res.status(403).json({ msg: "Anda Tidak Dapat Menghapus File" });
    }
    const result = await pool
      .request()
      .query(`DELETE FROM files WHERE idfile = ${idfile}`);

    //   jika tidak terpengaruh dengan delete atau tidak ada data yang di delete
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ msg: "File Tidak Ada" });
    }
    res.status(200).json({ msg: "File Berhasil Di Hapus" });
  } catch (error) {
    console.log(error);
  }
};
