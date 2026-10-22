const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        businessName,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User baru berhasil didaftarkan dengan ID:', newUser.id);
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        businessName: newUser.businessName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      isPasswordValid = false;
    }

    // Fallback: Jika password di DB sebelumnya tersimpan plaintext, cocokkan dan auto-hash dengan bcrypt
    if (!isPasswordValid && user.password === password) {
      isPasswordValid = true;
      const reHashed = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: reHashed },
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};