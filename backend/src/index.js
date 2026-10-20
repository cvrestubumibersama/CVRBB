import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { generateCatalogPdf } from './catalogPdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname, '..', '..');
const uploadsDir = process.env.UPLOADS_DIR || path.resolve(projectRootDir, 'public', 'uploads');

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json());

const rawCors = process.env.CORS_ORIGIN || '';
const parsedCors = rawCors.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server SSR)
      if (!origin) return callback(null, true);
      if (rawCors === '*' || parsedCors.includes('*')) return callback(null, true);
      if (parsedCors.length > 0 && parsedCors.includes(origin)) return callback(null, true);
      const defaultAllowed = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ];
      if (defaultAllowed.includes(origin) || !rawCors) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  }),
);

// Serve uploaded files statically
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {
  console.error('Failed to configure static uploads serving:', e);
}

function mapRowToL(row) {
  return { id: row.value_id ?? '', en: row.value_en ?? '' };
}

const ADMIN_COMPANY_INFO_MAP = {
  alamat: 'address',
  telepon: 'phone',
  email: 'email',
  whatsapp_number: 'whatsapp',
  jam_operasional: 'operating_hours',
  google_maps_embed: 'maps_embed_url',
  company_name: 'company_name',
  footer_tagline: 'footer_tagline',
  footer_rights: 'footer_rights',
};

function mapAdminCompanyInfo(row = {}) {
  const mapped = {};
  Object.entries(ADMIN_COMPANY_INFO_MAP).forEach(([adminKey, dbKey]) => {
    mapped[adminKey] = row[dbKey] ?? '';
  });
  return mapped;
}

async function saveCompanyInfo(req, res) {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const updates = {};

    items.forEach((entry) => {
      const key = String(entry?.key ?? '').trim();
      const value = String(entry?.value ?? '');
      const mappedKey = ADMIN_COMPANY_INFO_MAP[key];
      if (mappedKey) {
        updates[mappedKey] = value;
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid company info fields provided' });
    }

    const [existingRows] = await db.query('SELECT id FROM site_settings ORDER BY id DESC LIMIT 1');
    const existing = existingRows[0];

    if (existing?.id) {
      const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), existing.id];
      await db.query(`UPDATE site_settings SET ${setClause} WHERE id = ?`, values);
    } else {
      const columns = Object.keys(updates);
      const placeholders = columns.map(() => '?').join(', ');
      await db.query(`INSERT INTO site_settings (${columns.join(', ')}) VALUES (${placeholders})`, Object.values(updates));
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Update company info failed:', error);
    res.status(500).json({ error: 'Unable to save company info' });
  }
}

function mapLocaleFields(row, mappings) {
  return Object.entries(mappings).reduce((acc, [target, [idKey, enKey]]) => ({
    ...acc,
    [target]: { id: row[idKey] ?? '', en: row[enKey] ?? '' },
  }), row);
}

app.get('/api/public/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
    res.json(rows[0] ?? {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load settings' });
  }
});

app.get('/api/public/site-texts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT key_name, value_id, value_en FROM site_texts');
    const result = {};
    rows.forEach((row) => {
      result[row.key_name] = { id: row.value_id ?? '', en: row.value_en ?? '' };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load site texts' });
  }
});

app.get('/api/public/services', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) => {
      let imageUrls = [];
      try {
        if (row.image_url) {
          imageUrls = row.image_url.startsWith('[') ? JSON.parse(row.image_url) : [row.image_url];
        }
      } catch(e) {}
      
      return {
        ...mapLocaleFields(row, {
          title: ['title_id', 'title_en'],
          desc: ['desc_id', 'desc_en'],
        }),
        image_urls: imageUrls,
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load services' });
  }
});

app.get('/api/public/work-steps', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM work_steps WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        title: ['title_id', 'title_en'],
        desc: ['desc_id', 'desc_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load work steps' });
  }
});

app.get('/api/public/product-categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        label: ['label_id', 'label_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load product categories' });
  }
});

app.get('/api/public/products', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.spec_id, p.spec_en, p.price, p.image_url, p.sort_order, p.is_active, pc.slug AS category
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       WHERE p.is_active = 1
       ORDER BY p.sort_order ASC`,
    );
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        spec: ['spec_id', 'spec_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load products' });
  }
});

app.get('/api/public/catalog-pdf', async (req, res) => {
  try {
    await generateCatalogPdf(db, res);
  } catch (error) {
    console.error('Error generating catalog PDF:', error);
    res.status(500).json({ message: 'Gagal membuat katalog PDF' });
  }
});

app.get('/api/public/company-profile-download', (req, res) => {
  const possiblePaths = [
    path.resolve(projectRootDir, 'public', 'COMPANY PROFILE CV. RBB.pdf'),
    path.resolve(projectRootDir, 'public/COMPANY PROFILE CV. RBB.pdf'),
    path.resolve(process.cwd(), 'public/COMPANY PROFILE CV. RBB.pdf'),
    path.resolve(process.cwd(), '../public/COMPANY PROFILE CV. RBB.pdf'),
    path.resolve('public', 'COMPANY PROFILE CV. RBB.pdf'),
    path.resolve('..', 'public', 'COMPANY PROFILE CV. RBB.pdf'),
  ];

  const filePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!filePath) {
    return res.status(404).json({ message: 'File Company Profile tidak ditemukan' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.download(filePath, 'COMPANY PROFILE CV. RBB.pdf', (err) => {
    if (err && !res.headersSent) {
      console.error('Download error:', err);
      res.status(500).json({ message: 'Gagal mengunduh Company Profile' });
    }
  });
});

app.get('/api/public/project-categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM project_categories WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        label: ['label_id', 'label_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load project categories' });
  }
});

app.get('/api/public/projects', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.client, p.location, p.year, p.image_url, p.sort_order, p.is_active,
        pc.label_id AS category_id, pc.label_en AS category_en, pc.slug AS category_slug
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       WHERE p.is_active = 1
       ORDER BY p.sort_order ASC`,
    );
    const mapped = rows.map((row) => ({
      ...row,
      category: { id: row.category_id ?? '', en: row.category_en ?? '' },
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load projects' });
  }
});

app.get('/api/public/legal-docs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM legal_docs WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        name: ['name_id', 'name_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load legal docs' });
  }
});

app.get('/api/public/partners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partners WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load partners' });
  }
});

app.get('/api/public/testimonials', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load testimonials' });
  }
});

app.get('/api/public/advantages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM advantages WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        title: ['title_id', 'title_en'],
        desc: ['desc_id', 'desc_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load advantages' });
  }
});

app.get('/api/public/organization-members', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM organization_members WHERE is_active = 1 ORDER BY sort_order ASC');
    const mapped = rows.map((row) =>
      mapLocaleFields(row, {
        role: ['role_id', 'role_en'],
      }),
    );
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load organization members' });
  }
});

app.get('/api/public/articles', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, c.slug AS category_slug, c.name_id AS category_id, c.name_en AS category_en
       FROM articles a
       LEFT JOIN article_categories c ON a.category_id = c.id
       WHERE a.is_published = 1
       ORDER BY a.published_at DESC, a.sort_order ASC`,
    );
    const mapped = rows.map((row) => ({
      ...row,
      category: { id: row.category_id ?? '', en: row.category_en ?? '' },
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load articles' });
  }
});

app.get('/api/public/articles/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, c.slug AS category_slug, c.name_id AS category_id, c.name_en AS category_en
       FROM articles a
       LEFT JOIN article_categories c ON a.category_id = c.id
       WHERE a.slug = ? AND a.is_published = 1 LIMIT 1`,
      [req.params.slug],
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const row = rows[0];
    res.json({
      ...row,
      category: { id: row.category_id ?? '', en: row.category_en ?? '' },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load article' });
  }
});

app.get('/api/public/all', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
    const [siteTexts] = await db.query('SELECT key_name, value_id, value_en FROM site_texts');
    const [services] = await db.query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC');
    const [workSteps] = await db.query('SELECT * FROM work_steps WHERE is_active = 1 ORDER BY sort_order ASC');
    const [productCategories] = await db.query('SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC');
    const [products] = await db.query(`SELECT p.id, p.name, p.spec_id, p.spec_en, p.price, p.image_url, p.sort_order, p.is_active, pc.slug AS category FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.is_active = 1 ORDER BY p.sort_order ASC`);
    const [projectCategories] = await db.query('SELECT * FROM project_categories WHERE is_active = 1 ORDER BY sort_order ASC');
    const [projects] = await db.query(`SELECT p.id, p.name, p.client, p.location, p.year, p.image_url, p.sort_order, p.is_active, pc.label_id AS category_id, pc.label_en AS category_en FROM projects p LEFT JOIN project_categories pc ON p.category_id = pc.id WHERE p.is_active = 1 ORDER BY p.sort_order ASC`);
    const [legalDocs] = await db.query('SELECT * FROM legal_docs WHERE is_active = 1 ORDER BY sort_order ASC');
    const [partners] = await db.query('SELECT * FROM partners WHERE is_active = 1 ORDER BY sort_order ASC');
    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC');
    const [advantages] = await db.query('SELECT * FROM advantages WHERE is_active = 1 ORDER BY sort_order ASC');
    const [organizationMembers] = await db.query('SELECT * FROM organization_members WHERE is_active = 1 ORDER BY sort_order ASC');
    const mappedSiteTexts = siteTexts.reduce((acc, row) => {
      acc[row.key_name] = { id: row.value_id ?? '', en: row.value_en ?? '' };
      return acc;
    }, {});
    const mappedServices = services.map((row) =>
      mapLocaleFields(row, {
        title: ['title_id', 'title_en'],
        desc: ['desc_id', 'desc_en'],
      }),
    );
    const mappedWorkSteps = workSteps.map((row) =>
      mapLocaleFields(row, {
        title: ['title_id', 'title_en'],
        desc: ['desc_id', 'desc_en'],
      }),
    );
    const mappedProductCategories = productCategories.map((row) =>
      mapLocaleFields(row, {
        label: ['label_id', 'label_en'],
      }),
    );
    const mappedProducts = products.map((row) =>
      mapLocaleFields(row, {
        spec: ['spec_id', 'spec_en'],
      }),
    );
    const mappedProjectCategories = projectCategories.map((row) =>
      mapLocaleFields(row, {
        label: ['label_id', 'label_en'],
      }),
    );
    const mappedLegalDocs = legalDocs.map((row) =>
      mapLocaleFields(row, {
        name: ['name_id', 'name_en'],
      }),
    );
    const mappedAdvantages = advantages.map((row) =>
      mapLocaleFields(row, {
        title: ['title_id', 'title_en'],
        desc: ['desc_id', 'desc_en'],
      }),
    );
    const mappedOrganizationMembers = organizationMembers.map((row) =>
      mapLocaleFields(row, {
        role: ['role_id', 'role_en'],
      }),
    );
    res.json({
      settings: settings[0] ?? {},
      siteTexts: mappedSiteTexts,
      services: mappedServices,
      workSteps: mappedWorkSteps,
      productCategories: mappedProductCategories,
      products: mappedProducts,
      projectCategories: mappedProjectCategories,
      projects: projects.map((row) => ({
        ...row,
        category: { id: row.category_id ?? '', en: row.category_en ?? '' },
      })),
      legalDocs: mappedLegalDocs,
      partners,
      testimonials,
      advantages: mappedAdvantages,
      organizationMembers: mappedOrganizationMembers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load all public data' });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'rbb_super_secret_jwt_key_2026';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Sesi tidak valid atau telah kedaluwarsa.' });
  }
};

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  message: { message: 'Terlalu banyak percobaan login, silakan coba lagi nanti.' },
});

app.use('/api/admin', verifyAdminToken);

// Basic admin stats endpoint (development-friendly)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const safeCount = async (table, where = '1=1') => {
      try {
        const [[{ c }]] = await db.query(`SELECT COUNT(*) AS c FROM ${table} WHERE ${where}`);
        return Number(c || 0);
      } catch (e) {
        return 0;
      }
    };

    const leadsBaru = await safeCount('leads');
    const proyek = await safeCount('projects');
    const produk = await safeCount('products');
    const artikel = await safeCount('articles');

    // leads per month (last 12 months) if `leads` table has `created_at` column
    let leadsPerBulan = [];
    try {
      const [rows] = await db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS bulan, COUNT(*) AS jumlah
         FROM leads
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY bulan ASC`
      );
      leadsPerBulan = rows.map((r) => ({ bulan: r.bulan, jumlah: Number(r.jumlah || 0) }));
    } catch (e) {
      leadsPerBulan = [];
    }

    res.json({ leadsBaru, proyek, produk, artikel, leadsPerBulan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load admin stats' });
  }
});

// Read-only admin endpoints mapped to public queries (development)
app.get('/api/admin/produk-kategori', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, label_id AS nama, slug, sort_order, is_active FROM product_categories ORDER BY sort_order ASC');
    res.json({ items: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load product categories' });
  }
});

app.post('/api/admin/produk-kategori', async (req, res) => {
  try {
    const body = req.body || {};
    const nama = String(body.nama ?? '').trim();
    if (!nama) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }

    const slug = nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'kategori';

    const [existing] = await db.query(
      'SELECT id FROM product_categories WHERE slug = ? OR label_id = ? LIMIT 1',
      [slug, nama],
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Kategori dengan nama yang sama sudah ada' });
    }

    const [result] = await db.query(
      'INSERT INTO product_categories (label_id, label_en, slug, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [nama, '', slug, 0, 1],
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Create product category failed:', error);
    res.status(500).json({ error: 'Unable to create product category' });
  }
});

app.put('/api/admin/produk-kategori/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const nama = String(body.nama ?? '').trim();

    if (!nama) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }

    const slug = nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'kategori';

    await db.query(
      'UPDATE product_categories SET label_id = ?, slug = ?, is_active = ? WHERE id = ?',
      [nama, slug, body.isActive ? 1 : 0, id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update product category failed:', error);
    res.status(500).json({ error: 'Unable to update product category' });
  }
});

app.delete('/api/admin/produk-kategori/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM product_categories WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete product category failed:', error);
    res.status(500).json({ error: 'Unable to delete product category' });
  }
});

app.get('/api/admin/project-categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, label_id AS nama, label_en, slug, sort_order, is_active FROM project_categories ORDER BY sort_order ASC');
    res.json({ items: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load project categories' });
  }
});

app.get('/api/admin/produk', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name AS nama, p.spec_id AS spec_id, p.spec_en AS spec_en, p.price, p.image_url, p.sort_order, p.is_active, pc.id AS kategoriId, pc.label_id AS kategoriNama
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       ORDER BY p.sort_order ASC`
    );
    res.json({ items: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load products' });
  }
});

// Admin create/update/delete for products
app.post('/api/admin/produk', async (req, res) => {
  try {
    const body = req.body || {};
    const [result] = await db.query(
      `INSERT INTO products (category_id, name, spec_id, spec_en, image_url, sort_order, is_active, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.kategoriId || null, body.nama || null, body.deskripsi || null, body.deskripsi_en || null, body.gambarUrl || null, body.urutan || 0, body.isActive ? 1 : 0, body.price || null]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    console.error('Create product failed:', e);
    res.status(500).json({ error: 'Unable to create product' });
  }
});

app.put('/api/admin/produk/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    await db.query(
      `UPDATE products SET category_id = ?, name = ?, spec_id = ?, spec_en = ?, image_url = ?, sort_order = ?, is_active = ?, price = ? WHERE id = ?`,
      [body.kategoriId || null, body.nama || null, body.deskripsi || null, body.deskripsi_en || null, body.gambarUrl || null, body.urutan || 0, body.isActive ? 1 : 0, body.price || null, id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Update product failed:', e);
    res.status(500).json({ error: 'Unable to update product' });
  }
});

app.delete('/api/admin/produk/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete product failed:', e);
    res.status(500).json({ error: 'Unable to delete product' });
  }
});

app.get('/api/admin/proyek', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name AS nama, p.client AS klien, p.location AS lokasi, p.year AS tahun, p.image_url, p.sort_order, p.is_active, pc.label_id AS kategori
       FROM projects p
       LEFT JOIN project_categories pc ON p.category_id = pc.id
       ORDER BY p.sort_order ASC`
    );
    res.json({ items: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load projects' });
  }
});

// Admin create/update/delete for projects
app.post('/api/admin/proyek', async (req, res) => {
  try {
    const body = req.body || {};
    // resolve category to numeric id (accept id or name)
    let categoryId = null;
    if (body.kategori !== undefined && body.kategori !== null && body.kategori !== '') {
      const raw = body.kategori;
      if (typeof raw === 'number' || /^[0-9]+$/.test(String(raw))) {
        categoryId = Number(raw);
      } else if (typeof raw === 'string') {
        const q = String(raw).trim();
        // try to find existing category by slug or label
        const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [rows] = await db.query('SELECT id FROM project_categories WHERE slug = ? OR label_id = ? OR label_en = ? LIMIT 1', [slug, q, q]);
        if (rows && rows.length) {
          categoryId = rows[0].id;
        } else {
          // create new category
          const [ins] = await db.query('INSERT INTO project_categories (label_id, label_en, slug, sort_order, is_active) VALUES (?, ?, ?, ?, ?)', [q, '', slug, 0, 1]);
          categoryId = ins.insertId || null;
        }
      }
    }

    const [result] = await db.query(
      `INSERT INTO projects (name, client, location, year, image_url, sort_order, is_active, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.nama || null, body.klien || null, body.lokasi || null, body.tahun || null, body.gambarUrl || null, body.urutan || 0, body.isActive ? 1 : 0, categoryId]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    console.error('Create project failed:', e);
    res.status(500).json({ error: 'Unable to create project' });
  }
});

app.put('/api/admin/proyek/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    // resolve category similar to POST
    let categoryId = null;
    if (body.kategori !== undefined && body.kategori !== null && body.kategori !== '') {
      const raw = body.kategori;
      if (typeof raw === 'number' || /^[0-9]+$/.test(String(raw))) {
        categoryId = Number(raw);
      } else if (typeof raw === 'string') {
        const q = String(raw).trim();
        const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [rows] = await db.query('SELECT id FROM project_categories WHERE slug = ? OR label_id = ? OR label_en = ? LIMIT 1', [slug, q, q]);
        if (rows && rows.length) {
          categoryId = rows[0].id;
        } else {
          const [ins] = await db.query('INSERT INTO project_categories (label_id, label_en, slug, sort_order, is_active) VALUES (?, ?, ?, ?, ?)', [q, '', slug, 0, 1]);
          categoryId = ins.insertId || null;
        }
      }
    }

    await db.query(
      `UPDATE projects SET name = ?, client = ?, location = ?, year = ?, image_url = ?, sort_order = ?, is_active = ?, category_id = ? WHERE id = ?`,
      [body.nama || null, body.klien || null, body.lokasi || null, body.tahun || null, body.gambarUrl || null, body.urutan || 0, body.isActive ? 1 : 0, categoryId, id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Update project failed:', e);
    res.status(500).json({ error: 'Unable to update project' });
  }
});

app.delete('/api/admin/proyek/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete project failed:', e);
    res.status(500).json({ error: 'Unable to delete project' });
  }
});

app.post('/api/admin/klien-mitra', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.nama ?? '').trim();
    const imageUrl = String(body.logoUrl ?? body.image_url ?? '').trim();
    const sortOrder = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!name) {
      return res.status(400).json({ error: 'Nama wajib diisi' });
    }

    const [result] = await db.query(
      `INSERT INTO partners (name, image_url, sort_order, is_active) VALUES (?, ?, ?, ? )`,
      [name, imageUrl || null, sortOrder, isActive],
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Create partner failed:', error);
    res.status(500).json({ error: 'Unable to create partner' });
  }
});

app.put('/api/admin/klien-mitra/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const name = String(body.nama ?? '').trim();
    const imageUrl = String(body.logoUrl ?? body.image_url ?? '').trim();
    const sortOrder = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!name) {
      return res.status(400).json({ error: 'Nama wajib diisi' });
    }

    await db.query(
      `UPDATE partners SET name = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [name, imageUrl || null, sortOrder, isActive, id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update partner failed:', error);
    res.status(500).json({ error: 'Unable to update partner' });
  }
});

app.delete('/api/admin/klien-mitra/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM partners WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete partner failed:', error);
    res.status(500).json({ error: 'Unable to delete partner' });
  }
});

// Additional read-only admin endpoints (development)
const trySelect = async (sql, params = []) => {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (e) {
    console.error('Query failed:', sql, e.message || e);
    return [];
  }
};

app.get('/api/admin/leads', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, name, company, phone, jenis_proyek, lokasi_proyek, status, created_at FROM leads ORDER BY id DESC LIMIT 200');
    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      company: r.company,
      phone: r.phone,
      jenis_proyek: r.jenis_proyek,
      lokasi_proyek: r.lokasi_proyek,
      status: r.status,
      created_at: r.created_at,
    }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load leads' });
  }
});

app.get('/api/admin/layanan', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, title_id, title_en, desc_id, desc_en, image_url, sort_order, is_active FROM services ORDER BY sort_order ASC');
    const mapped = rows.map((r) => {
      let gambarUrl = [];
      try {
        if (r.image_url) {
          gambarUrl = r.image_url.startsWith('[') ? JSON.parse(r.image_url) : [r.image_url];
        }
      } catch(e) {}
      
      return {
        id: r.id,
        judul: r.title_id || '',
        judul_en: r.title_en || '',
        deskripsi: r.desc_id || '',
        deskripsi_en: r.desc_en || '',
        gambarUrl,
        urutan: r.sort_order || 0,
        isActive: Boolean(r.is_active),
      };
    });
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load services' });
  }
});

// Admin create/update/delete for layanan
app.post('/api/admin/layanan', async (req, res) => {
  try {
    const body = req.body || {};
    const titleId = String(body.judul ?? '').trim();
    if (!titleId) return res.status(400).json({ error: 'Judul wajib diisi' });

    const titleEn = String(body.judul_en ?? '') || titleId;
    const descId = String(body.deskripsi ?? '') || '';
    const descEn = String(body.deskripsi_en ?? '') || descId;
    const slug = titleId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'layanan-' + Date.now();
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive ? 1 : 0;
    
    let imageUrlStr = null;
    if (Array.isArray(body.gambarUrl) && body.gambarUrl.length > 0) {
      imageUrlStr = JSON.stringify(body.gambarUrl);
    } else if (typeof body.gambarUrl === 'string' && body.gambarUrl) {
      imageUrlStr = JSON.stringify([body.gambarUrl]);
    }

    const [result] = await db.query(
      `INSERT INTO services (slug, title_id, title_en, desc_id, desc_en, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, titleId, titleEn, descId, descEn, imageUrlStr, sortOrder, isActive],
    );

    res.json({ id: result.insertId });
  } catch (e) {
    console.error('Create layanan failed:', e);
    res.status(500).json({ error: 'Unable to create layanan' });
  }
});

app.put('/api/admin/layanan/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const titleId = String(body.judul ?? '').trim();
    if (!titleId) return res.status(400).json({ error: 'Judul wajib diisi' });

    const titleEn = String(body.judul_en ?? '') || titleId;
    const descId = String(body.deskripsi ?? '') || '';
    const descEn = String(body.deskripsi_en ?? '') || descId;
    const slug = titleId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'layanan-' + Date.now();
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive ? 1 : 0;
    
    let imageUrlStr = null;
    if (Array.isArray(body.gambarUrl) && body.gambarUrl.length > 0) {
      imageUrlStr = JSON.stringify(body.gambarUrl);
    } else if (typeof body.gambarUrl === 'string' && body.gambarUrl) {
      imageUrlStr = JSON.stringify([body.gambarUrl]);
    }

    await db.query(
      `UPDATE services SET slug = ?, title_id = ?, title_en = ?, desc_id = ?, desc_en = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [slug, titleId, titleEn, descId, descEn, imageUrlStr, sortOrder, isActive, id],
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('Update layanan failed:', e);
    res.status(500).json({ error: 'Unable to update layanan' });
  }
});

app.delete('/api/admin/layanan/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete layanan failed:', e);
    res.status(500).json({ error: 'Unable to delete layanan' });
  }
});

// Admin endpoints for Tahapan Kerja (work_steps)
app.get('/api/admin/tahapan-kerja', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, service_id, title_id, title_en, desc_id, desc_en, sort_order, is_active FROM work_steps ORDER BY sort_order ASC');
    const mapped = rows.map((r) => ({
      id: r.id,
      judul: r.title_id || '',
      judul_en: r.title_en || '',
      deskripsi: r.desc_id || '',
      deskripsi_en: r.desc_en || '',
      urutan: r.sort_order || 0,
      isActive: Boolean(r.is_active),
    }));
    res.json({ items: mapped });
  } catch (error) {
    console.error('Get tahapan-kerja failed:', error);
    res.status(500).json({ message: 'Unable to load work steps' });
  }
});

app.post('/api/admin/tahapan-kerja', async (req, res) => {
  try {
    const body = req.body || {};
    const titleId = String(body.judul ?? '').trim();
    if (!titleId) return res.status(400).json({ error: 'Judul tahapan wajib diisi' });

    const titleEn = String(body.judul_en ?? '') || titleId;
    const descId = String(body.deskripsi ?? '') || '';
    const descEn = String(body.deskripsi_en ?? '') || descId;
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1;
    const serviceId = Number(body.service_id || 1);

    const [result] = await db.query(
      `INSERT INTO work_steps (service_id, title_id, title_en, desc_id, desc_en, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [serviceId, titleId, titleEn, descId, descEn, sortOrder, isActive],
    );

    res.json({ id: result.insertId });
  } catch (e) {
    console.error('Create tahapan-kerja failed:', e);
    res.status(500).json({ error: 'Unable to create work step' });
  }
});

app.put('/api/admin/tahapan-kerja/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const titleId = String(body.judul ?? '').trim();
    if (!titleId) return res.status(400).json({ error: 'Judul tahapan wajib diisi' });

    const titleEn = String(body.judul_en ?? '') || titleId;
    const descId = String(body.deskripsi ?? '') || '';
    const descEn = String(body.deskripsi_en ?? '') || descId;
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1;

    await db.query(
      `UPDATE work_steps SET title_id = ?, title_en = ?, desc_id = ?, desc_en = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [titleId, titleEn, descId, descEn, sortOrder, isActive, id],
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('Update tahapan-kerja failed:', e);
    res.status(500).json({ error: 'Unable to update work step' });
  }
});

app.delete('/api/admin/tahapan-kerja/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM work_steps WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete tahapan-kerja failed:', e);
    res.status(500).json({ error: 'Unable to delete work step' });
  }
});

app.get('/api/admin/legalitas', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, name_id, name_en, document_number, sort_order, is_active, created_at FROM legal_docs ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({
      id: r.id,
      jenisDokumen: r.name_id || '',
      jenisDokumen_en: r.name_en || '',
      nomorDokumen: r.document_number || '',
      urutan: r.sort_order || 0,
      isActive: Boolean(r.is_active),
      created_at: r.created_at,
      fileUrl: r.file_path || '',
    }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load legal docs' });
  }
});

// Admin create/update/delete for legalitas
app.post('/api/admin/legalitas', async (req, res) => {
  try {
    const body = req.body || {};
    const nameId = String(body.jenisDokumen ?? '') || '';
    const nameEn = String(body.jenisDokumen_en ?? '') || nameId || '';
    const documentNumber = String(body.nomorDokumen ?? '') || '';
    const filePath = String(body.fileUrl ?? body.file_path ?? '') || null;
    const issuedAt = body.tanggalTerbit ? String(body.tanggalTerbit) : null;
    const expiresAt = body.tanggalKedaluwarsa ? String(body.tanggalKedaluwarsa) : null;
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO legal_docs (name_id, name_en, document_number, file_path, issued_at, expires_at, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nameId || '', nameEn || '', documentNumber || null, filePath, issuedAt, expiresAt, sortOrder, isActive],
    );

    res.json({ id: result.insertId });
  } catch (e) {
    console.error('Create legalitas failed:', e);
    res.status(500).json({ error: 'Unable to create legalitas' });
  }
});

app.put('/api/admin/legalitas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const nameId = String(body.jenisDokumen ?? '') || '';
    const nameEn = String(body.jenisDokumen_en ?? '') || nameId || '';
    const documentNumber = String(body.nomorDokumen ?? '') || '';
    const filePath = String(body.fileUrl ?? body.file_path ?? '') || null;
    const issuedAt = body.tanggalTerbit ? String(body.tanggalTerbit) : null;
    const expiresAt = body.tanggalKedaluwarsa ? String(body.tanggalKedaluwarsa) : null;
    const sortOrder = Number(body.urutan || 0);
    const isActive = body.isActive ? 1 : 0;

    await db.query(
      `UPDATE legal_docs SET name_id = ?, name_en = ?, document_number = ?, file_path = ?, issued_at = ?, expires_at = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [nameId || '', nameEn || '', documentNumber || null, filePath, issuedAt, expiresAt, sortOrder, isActive, id],
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('Update legalitas failed:', e);
    res.status(500).json({ error: 'Unable to update legalitas' });
  }
});

app.delete('/api/admin/legalitas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM legal_docs WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete legalitas failed:', e);
    res.status(500).json({ error: 'Unable to delete legalitas' });
  }
});

app.get('/api/admin/artikel-kategori', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, name_id, name_en, slug, is_active, sort_order FROM article_categories ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({ id: r.id, nama: r.name_id || '', nama_en: r.name_en || '', slug: r.slug, isActive: Boolean(r.is_active), urutan: r.sort_order || 0 }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load article categories' });
  }
});

// Admin create/update/delete for article categories
app.post('/api/admin/artikel-kategori', async (req, res) => {
  try {
    const body = req.body || {};
    const nama = String(body.nama ?? '').trim();
    if (!nama) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const slug = nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'kategori';

    const [existing] = await db.query('SELECT id FROM article_categories WHERE slug = ? OR name_id = ? LIMIT 1', [slug, nama]);
    if (existing.length > 0) return res.status(409).json({ error: 'Kategori dengan nama yang sama sudah ada' });

    const [result] = await db.query(
      'INSERT INTO article_categories (name_id, name_en, slug, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [nama, '', slug, 0, 1]
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Create article category failed:', error);
    res.status(500).json({ error: 'Unable to create article category' });
  }
});

app.put('/api/admin/artikel-kategori/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const nama = String(body.nama ?? '').trim();
    if (!nama) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const slug = nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'kategori';

    await db.query('UPDATE article_categories SET name_id = ?, slug = ?, is_active = ? WHERE id = ?', [nama, slug, body.isActive ? 1 : 0, id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Update article category failed:', error);
    res.status(500).json({ error: 'Unable to update article category' });
  }
});

app.delete('/api/admin/artikel-kategori/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM article_categories WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete article category failed:', error);
    res.status(500).json({ error: 'Unable to delete article category' });
  }
});

app.get('/api/admin/artikel', async (req, res) => {
  try {
    const rows = await trySelect(
      `SELECT a.id, a.slug, a.category_id, a.title_id, a.title_en, a.excerpt_id, a.excerpt_en, a.body_id, a.body_en, a.image_url, a.published_at, a.is_published, a.sort_order, c.name_id AS category_name_id
       FROM articles a
       LEFT JOIN article_categories c ON a.category_id = c.id
       ORDER BY a.published_at DESC, a.sort_order ASC LIMIT 200`
    );
    const mapped = rows.map(r => ({
      id: r.id,
      judul: r.title_id || '',
      judul_en: r.title_en || '',
      kategoriId: r.category_id,
      kategoriNama: r.category_name_id || '',
      ringkasan: r.excerpt_id || '',
      ringkasan_en: r.excerpt_en || '',
      konten: r.body_id || '',
      konten_en: r.body_en || '',
      gambarThumbnail: r.image_url || '',
      publishedAt: r.published_at,
      status: r.is_published ? 'published' : 'draft',
      sort_order: r.sort_order,
    }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load articles' });
  }
});

app.get('/api/admin/testimoni', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, quote_id, quote_en, author_name, author_role, sort_order, is_active FROM testimonials ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({ id: r.id, namaKlien: r.author_name || '', perusahaan: r.author_role || '', isiTestimoni: r.quote_id || '', isiTestimoni_en: r.quote_en || '', urutan: r.sort_order || 0, isActive: Boolean(r.is_active) }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load testimonials' });
  }
});

app.post('/api/admin/testimoni', async (req, res) => {
  try {
    const body = req.body || {};
    const namaKlien = String(body.namaKlien ?? '').trim();
    const perusahaan = String(body.perusahaan ?? '').trim();
    const isiTestimoni = String(body.isiTestimoni ?? '').trim();
    const isiTestimoniEn = String(body.isiTestimoni_en ?? body.isiTestimoniEn ?? '').trim();
    const urutan = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!namaKlien || !isiTestimoni) {
      return res.status(400).json({ error: 'Nama klien dan isi testimoni wajib diisi' });
    }

    const [result] = await db.query(
      `INSERT INTO testimonials (author_name, author_role, quote_id, quote_en, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [namaKlien, perusahaan || '', isiTestimoni, isiTestimoniEn || '', urutan, isActive],
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Create testimonial failed:', error);
    res.status(500).json({ error: 'Unable to create testimonial' });
  }
});

app.put('/api/admin/testimoni/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const namaKlien = String(body.namaKlien ?? '').trim();
    const perusahaan = String(body.perusahaan ?? '').trim();
    const isiTestimoni = String(body.isiTestimoni ?? '').trim();
    const isiTestimoniEn = String(body.isiTestimoni_en ?? body.isiTestimoniEn ?? '').trim();
    const urutan = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!namaKlien || !isiTestimoni) {
      return res.status(400).json({ error: 'Nama klien dan isi testimoni wajib diisi' });
    }

    await db.query(
      `UPDATE testimonials SET author_name = ?, author_role = ?, quote_id = ?, quote_en = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [namaKlien, perusahaan || '', isiTestimoni, isiTestimoniEn || '', urutan, isActive, id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update testimonial failed:', error);
    res.status(500).json({ error: 'Unable to update testimonial' });
  }
});

app.delete('/api/admin/testimoni/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete testimonial failed:', error);
    res.status(500).json({ error: 'Unable to delete testimonial' });
  }
});

app.get('/api/admin/klien-mitra', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, name, image_url, sort_order, is_active FROM partners ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({ id: r.id, nama: r.name || '', logoUrl: r.image_url || '', urutan: r.sort_order || 0, isActive: Boolean(r.is_active) }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load partners' });
  }
});

app.get('/api/admin/statistics', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, label, value, sort_order FROM statistics ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({ id: r.id, label: r.label || '', nilai: r.value || '', urutan: r.sort_order || 0 }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load statistics' });
  }
});

app.get('/api/admin/struktur-organisasi', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, name, role_id, role_en, sort_order, is_active, image_url FROM organization_members ORDER BY sort_order ASC');
    const mapped = rows.map(r => ({ id: r.id, nama: r.name || '', jabatan: r.role_id || '', jabatan_en: r.role_en || '', fotoUrl: r.image_url || '', urutan: r.sort_order || 0, isActive: Boolean(r.is_active) }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load organization members' });
  }
});

app.post('/api/admin/struktur-organisasi', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.nama ?? '').trim();
    const roleId = String(body.jabatan ?? body.role_id ?? '').trim();
    const roleEn = String(body.jabatan_en ?? body.role_en ?? roleId ?? '').trim();
    const imageUrl = String(body.fotoUrl ?? body.image_url ?? '').trim();
    const sortOrder = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!name || !roleId) {
      return res.status(400).json({ error: 'Nama dan jabatan wajib diisi' });
    }

    const [result] = await db.query(
      `INSERT INTO organization_members (name, role_id, role_en, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, roleId, roleEn || roleId, imageUrl || null, sortOrder, isActive],
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Create organization member failed:', error);
    res.status(500).json({ error: 'Unable to create organization member' });
  }
});

app.put('/api/admin/struktur-organisasi/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const name = String(body.nama ?? '').trim();
    const roleId = String(body.jabatan ?? body.role_id ?? '').trim();
    const roleEn = String(body.jabatan_en ?? body.role_en ?? roleId ?? '').trim();
    const imageUrl = String(body.fotoUrl ?? body.image_url ?? '').trim();
    const sortOrder = Number(body.urutan ?? 0);
    const isActive = body.isActive ? 1 : 0;

    if (!name || !roleId) {
      return res.status(400).json({ error: 'Nama dan jabatan wajib diisi' });
    }

    await db.query(
      `UPDATE organization_members
       SET name = ?, role_id = ?, role_en = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name, roleId, roleEn || roleId, imageUrl || null, sortOrder, isActive, id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update organization member failed:', error);
    res.status(500).json({ error: 'Unable to update organization member' });
  }
});

app.delete('/api/admin/struktur-organisasi/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM organization_members WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete organization member failed:', error);
    res.status(500).json({ error: 'Unable to delete organization member' });
  }
});

app.get('/api/admin/company-info', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
    res.json(mapAdminCompanyInfo(rows[0] ?? {}));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load company info' });
  }
});

app.put('/api/admin/company-info', saveCompanyInfo);
app.post('/api/admin/company-info', saveCompanyInfo);

app.get('/api/admin/files', async (req, res) => {
  try {
    const rows = await trySelect('SELECT id, file_name, original_name, mime_type, file_path, alt_text, uploaded_by, created_at FROM media_files ORDER BY id DESC');
    const mapped = rows.map(r => ({ id: r.id, fileName: r.file_name, originalName: r.original_name, mimeType: r.mime_type, url: r.file_path, altText: r.alt_text, uploadedBy: r.uploaded_by, createdAt: r.created_at }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load files' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    // try common admin columns, fallback to *
    let rows = await trySelect('SELECT id, name, email, role, is_active, created_at FROM admins ORDER BY id DESC');
    const mapped = rows.map(r => ({ id: r.id, username: r.email, name: r.name, email: r.email, role: r.role, isActive: Boolean(r.is_active), createdAt: r.created_at }));
    res.json({ items: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load users' });
  }
});

// Development-only: list tables in the connected database
app.get('/api/debug/tables', async (req, res) => {
  try {
    const dbName = process.env.MYSQL_DATABASE || 'rbb';
    const [rows] = await db.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name ASC`,
      [dbName],
    );
    res.json(rows.map((r) => r.TABLE_NAME || r.table_name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to list tables' });
  }
});

// Development-only: show latest projects for debugging
app.get('/api/debug/latest-projects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, client, location, year, image_url, sort_order, is_active, category_id, created_at, updated_at FROM projects ORDER BY id DESC LIMIT 10');
    res.json({ items: rows });
  } catch (e) {
    console.error('Debug latest projects failed:', e);
    res.status(500).json({ error: 'Unable to fetch latest projects' });
  }
});


app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username/Email dan password wajib diisi' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, is_active FROM admins WHERE (email = ? OR name = ?) AND is_active = 1 LIMIT 1',
      [username, username],
    );

    const admin = rows?.[0];
    if (!admin) {
      return res.status(401).json({ message: 'Kredensial tidak ditemukan' });
    }

    const storedPassword = admin.password_hash || '';
    let isValid = false;

    if (storedPassword.startsWith('$2')) {
      isValid = bcrypt.compareSync(password, storedPassword);
    } else {
      isValid = storedPassword === password;
    }

    if (!isValid) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const accessToken = jwt.sign(
      { id: admin.id, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    const refreshToken = jwt.sign(
      { id: admin.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil',
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({ message: 'Gagal menghubungkan ke database' });
  }
});

// File upload endpoint
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
      const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_%(),\s]/g, '')}`;
      cb(null, safe);
    },
  });
  const upload = multer({ storage });

  app.post('/api/admin/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const filename = req.file.filename;
      const filePath = `/uploads/${filename}`;
      let item = { id: null, url: filePath, fileName: filename, originalName: req.file.originalname, mimeType: req.file.mimetype };
      try {
        const [result] = await db.query(
          'INSERT INTO media_files (file_name, original_name, mime_type, file_path, alt_text, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
          [filename, req.file.originalname || filename, req.file.mimetype || '', filePath, req.body.alt_text || null, req.body.uploaded_by || null],
        );
        item.id = result.insertId || null;
      } catch (e) {
        console.error('DB insert for upload failed, returning file URL anyway:', e?.message || e);
      }
      return res.json({ item });
    } catch (e) {
      console.error('Upload error:', e);
      res.status(500).json({ message: 'Unable to save uploaded file' });
    }
  });
} catch (e) {
  console.error('Failed to initialize upload route:', e);
}

app.listen(port, () => {
  console.log(`RBB backend running on port ${port} (env: ${process.env.NODE_ENV || 'development'})`);
});
