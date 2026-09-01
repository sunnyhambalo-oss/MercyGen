const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const publicStatic = express.static('.');
app.use((req, res, next) => {
  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    return next();
  }
  return publicStatic(req, res, next);
});

// Static file serving
app.use('/Images', express.static('Images'));
app.use('/Videos', express.static('Videos'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow both images and videos
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  
  const isImage = allowedImageTypes.test(file.mimetype) || allowedImageTypes.test(extname);
  const isVideo = allowedVideoTypes.test(file.mimetype) || allowedVideoTypes.test(extname);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter
});

// Utility functions
const readContent = () => {
  try {
    const data = fs.readFileSync('data/content.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading content.json:', err);
    return {};
  }
};

const writeContent = (data) => {
  try {
    fs.writeFileSync('data/content.json', JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing content.json:', err);
    return false;
  }
};

const getCookies = (req) => {
  const cookieHeader = req.headers.cookie || '';
  return Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map(cookie => {
      const separator = cookie.indexOf('=');
      return [
        decodeURIComponent(cookie.slice(0, separator).trim()),
        decodeURIComponent(cookie.slice(separator + 1).trim())
      ];
    })
  );
};

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000
};

const denyAdminAccess = (req, res, status, error) => {
  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    return res.redirect('/login');
  }
  return res.status(status).json({ error });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || getCookies(req).adminToken;

  if (!token) {
    return denyAdminAccess(req, res, 401, 'Access token required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return denyAdminAccess(req, res, 403, 'Invalid or expired token');
    }
    req.user = user;
    next();
  });
};

// ==================== Authentication Routes ====================

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email && email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const isValidPassword = await bcryptjs.compare(password, process.env.ADMIN_PASSWORD_HASH);
    const isValidEmail = normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase();

    if (!isValidEmail || !isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY
    });

    res.cookie('adminToken', token, sessionCookieOptions);
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logout successful' });
});

// ==================== Content Routes ====================

// Get all content
app.get('/api/content', (req, res) => {
  const content = readContent();
  res.json(content);
});

// Get specific section
app.get('/api/content/:section', (req, res) => {
  const content = readContent();
  const section = content[req.params.section];

  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  res.json(section);
});

// Update section (requires authentication)
app.put('/api/content/:section', authenticateToken, (req, res) => {
  try {
    const content = readContent();
    const sectionName = req.params.section;

    if (!content.hasOwnProperty(sectionName)) {
      return res.status(404).json({ error: 'Section not found' });
    }

    content[sectionName] = req.body;

    if (writeContent(content)) {
      res.json({ message: 'Section updated successfully', data: content[sectionName] });
    } else {
      res.status(500).json({ error: 'Failed to save content' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Update specific item in section (requires authentication)
app.put('/api/content/:section/:id', authenticateToken, (req, res) => {
  try {
    const content = readContent();
    const { section, id } = req.params;

    if (!content.hasOwnProperty(section)) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (!Array.isArray(content[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }

    const itemIndex = content[section].findIndex(item => item.id === parseInt(id));

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    content[section][itemIndex] = { ...content[section][itemIndex], ...req.body };

    if (writeContent(content)) {
      res.json({ message: 'Item updated successfully', data: content[section][itemIndex] });
    } else {
      res.status(500).json({ error: 'Failed to save content' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item from section (requires authentication)
app.delete('/api/content/:section/:id', authenticateToken, (req, res) => {
  try {
    const content = readContent();
    const { section, id } = req.params;

    if (!content.hasOwnProperty(section)) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (!Array.isArray(content[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }

    content[section] = content[section].filter(item => item.id !== parseInt(id));

    if (writeContent(content)) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save content' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Add new item to section (requires authentication)
app.post('/api/content/:section', authenticateToken, (req, res) => {
  try {
    const content = readContent();
    const section = req.params.section;

    if (!content.hasOwnProperty(section)) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (!Array.isArray(content[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }

    // Generate new ID
    const maxId = Math.max(...content[section].map(item => item.id || 0), 0);
    const newItem = { ...req.body, id: maxId + 1 };

    content[section].push(newItem);

    if (writeContent(content)) {
      res.status(201).json({ message: 'Item created successfully', data: newItem });
    } else {
      res.status(500).json({ error: 'Failed to save content' });
    }
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// ==================== File Upload Route ====================

// Upload image (requires authentication)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'File uploaded successfully',
      path: filePath,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// ==================== Serve Login And Admin Dashboard ====================

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.js'));
});

app.get('/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.css'));
});

app.get(['/admin', '/admin/'], authenticateToken, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

app.get('/admin/admin.css', authenticateToken, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin', 'admin.css'));
});

app.get('/admin/admin.js', authenticateToken, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin', 'admin.js'));
});

app.use('/admin', (req, res) => {
  res.redirect('/login');
});

// ==================== Error handling ====================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`MercyGen Admin CMS Server`);
  console.log(`========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Default password: admin123`);
  console.log(`========================================\n`);
});
