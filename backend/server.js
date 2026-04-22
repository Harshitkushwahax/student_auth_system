const dns = require('dns').promises;   // or just require('dns') in older Node
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMA =================
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    course: { type: String }
});

const Student = mongoose.model("Student", studentSchema);

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// ================= ROUTES =================

// ROOT (fix "Cannot GET /")
app.get('/', (req, res) => {
    res.send("Student API Running 🚀");
});


// 🔹 REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, course } = req.body;

        const existing = await Student.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new Student({
            name,
            email,
            password: hashedPassword,
            course
        });

        await student.save();

        res.status(201).json({ message: "Registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔹 LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: student._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            student
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔹 UPDATE PASSWORD
app.put('/api/update-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const student = await Student.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong old password" });
        }

        student.password = await bcrypt.hash(newPassword, 10);
        await student.save();

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔹 UPDATE COURSE
app.put('/api/update-course', authMiddleware, async (req, res) => {
    try {
        const { course } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { course },
            { new: true }
        );

        res.json({
            message: "Course updated",
            student
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔹 PROTECTED DASHBOARD (OPTIONAL BUT GOOD FOR MARKS)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select("-password");

        res.json(student);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});