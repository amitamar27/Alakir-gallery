/**
 * Alakir Gallery — Optional Node.js backend
 *
 * IMPORTANT: This server is OPTIONAL.
 *  - Payments go directly to iCount (hosted payment page) — no server needed.
 *  - The site can run on Cloudflare Pages / Netlify / any static host.
 *  - This server is only useful if you want:
 *      • Admin changes to sync between devices (instead of just one browser)
 *      • Server-side image upload (instead of base64 in localStorage)
 *      • A persistent orders log on disk
 *      • iCount IPN webhook receiver (so paid orders appear in admin Orders tab)
 *
 * Run with:
 *     npm install
 *     npm start
 *
 * Endpoints:
 *  - GET  /api/ping              → health check (admin auto-detects server mode)
 *  - GET  /api/data              → returns data/gallery-data.json
 *  - POST /api/save-data         → saves admin changes to that file
 *  - POST /api/upload            → image upload (multer → assets/gallery-images/)
 *  - POST /api/orders            → append a new order (also accepts iCount IPN)
 *  - GET  /api/orders            → list orders
 *
 * Environment variables (optional, set in .env):
 *  - PORT                  default 3000
 *  - ADMIN_API_TOKEN       if set, admin write endpoints require this token
 *                          in the `x-admin-token` header (defense-in-depth)
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const cors    = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const ROOT       = path.resolve(__dirname, '..');
const DATA_FILE  = path.join(ROOT, 'data', 'gallery-data.json');
const IMG_DIR    = path.join(ROOT, 'assets', 'gallery-images');
const PORT       = process.env.PORT || 3000;
const ADMIN_TOK  = process.env.ADMIN_API_TOKEN || '';

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));   // iCount IPN posts form-encoded data

// ──────────────────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────────────────
function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
        return { version: 1, settings: {}, items: [], orders: [] };
    }
}
function writeData(d) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(d, null, 2), 'utf-8');
    fs.renameSync(tmp, DATA_FILE);
}
function requireAdmin(req, res, next) {
    if (!ADMIN_TOK) return next();
    if (req.headers['x-admin-token'] === ADMIN_TOK) return next();
    return res.status(401).json({ error: 'unauthorized' });
}

// ──────────────────────────────────────────────────────────
// upload (multer → assets/gallery-images/)
// ──────────────────────────────────────────────────────────
fs.mkdirSync(IMG_DIR, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMG_DIR),
    filename: (req, file, cb) => {
        const safe = (file.originalname || 'img')
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '-')
            .slice(0, 60);
        const ts = Date.now().toString(36);
        const rnd = Math.random().toString(36).slice(2, 6);
        const ext = path.extname(safe) || '.jpg';
        const base = path.basename(safe, ext) || 'img';
        cb(null, `${ts}-${rnd}-${base}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

// ──────────────────────────────────────────────────────────
// API routes
// ──────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.json({ ok: true, t: Date.now() }));

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/save-data', requireAdmin, (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || !Array.isArray(body.items)) {
        return res.status(400).json({ error: 'invalid payload' });
    }
    try {
        writeData(body);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'save failed' });
    }
});

app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const rel = path.posix.join('assets', 'gallery-images', req.file.filename);
    res.json({ ok: true, path: rel, filename: req.file.filename });
});

/**
 * Order log endpoint.
 * Two clients post here:
 *  1. The gallery's checkout success handler (after iCount return)
 *  2. iCount IPN webhook (server-to-server notification, configured in iCount)
 *
 * iCount IPN posts form-encoded fields like `doc_number`, `cust_name`,
 * `cust_email`, `total`, `add_remark` (we put our orderId there). We map
 * the common fields into our order schema.
 */
app.post('/api/orders', (req, res) => {
    const body = req.body || {};
    let order;

    // Detect iCount IPN by the presence of iCount-specific fields
    if (body.doc_number || body.cust_name || body.pgcode) {
        const orderId = body.add_remark || ('IC-' + body.doc_number);
        order = {
            id: orderId,
            ts: Date.now(),
            total: parseFloat(body.total || body.amount || body.totalfortax || 0),
            customer: {
                name:  body.cust_name  || body.full_name || '',
                email: body.cust_email || body.email     || '',
                phone: body.cust_phone || body.phone     || ''
            },
            items: [],
            status: 'paid',
            source: 'icount-ipn',
            invoice_doc: body.doc_number || null,
            raw: body
        };
    } else if (body.id) {
        // Posted by gallery checkout
        order = { ...body, ts: body.ts || Date.now() };
    } else {
        return res.status(400).json({ error: 'invalid' });
    }

    const data = readData();
    data.orders = data.orders || [];
    const idx = data.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) data.orders[idx] = { ...data.orders[idx], ...order };
    else          data.orders.push(order);

    try {
        writeData(data);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'save failed' });
    }
});

app.get('/api/orders', requireAdmin, (req, res) => {
    res.json(readData().orders || []);
});

// ──────────────────────────────────────────────────────────
// Static (gallery, admin, assets) — served from parent dir
// ──────────────────────────────────────────────────────────
app.use(express.static(ROOT, { extensions: ['html'] }));

// ──────────────────────────────────────────────────────────
// Boot
// ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ALAKIR Gallery — server running');
    console.log('  ──────────────────────────────────');
    console.log(`  Gallery : http://localhost:${PORT}/gallery.html`);
    console.log(`  Admin   : http://localhost:${PORT}/admin.html`);
    console.log(`  Data    : ${path.relative(ROOT, DATA_FILE)}`);
    console.log(`  Images  : ${path.relative(ROOT, IMG_DIR)}`);
    console.log('  Payments: handled by iCount (no server-side processing)');
    if (ADMIN_TOK) console.log('  · ADMIN_API_TOKEN gate ENABLED');
    console.log('');
});
