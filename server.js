const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Path for storing submitted messages
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Ensure messages.json exists
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Get Portfolio Data (Projects & Skills)
app.get('/api/portfolio-data', (req, res) => {
    res.json({
        skills: [
            {
                category: "Software & Web",
                icon: "fa-laptop-code",
                items: ["C / C++ Programming", "PHP & MySQL Databases", "Flutter & Mobile Dev", "HTML5, CSS3, JavaScript"]
            },
            {
                category: "Robotics & Hardware",
                icon: "fa-microchip",
                items: ["Arduino & Microcontrollers", "Circuit & Logic Design", "Battle Bots & Autonomous Rovers", "Drone Avionics & Electronics"]
            },
            {
                category: "Workflow & Tools",
                icon: "fa-gears",
                items: ["Git & GitHub Version Control", "Relational Database Systems", "Algorithms & Data Structures", "Technical Event Management"]
            }
        ],
        projects: [
            {
                id: "varsity-laundry",
                tag: "WEB APPLICATION / DATABASE",
                title: "Varsity Laundry Service",
                shortDesc: "Web-based management system streamlining laundry requests, tracking status, and user accounting on campus.",
                fullDesc: "A complete campus management system built with PHP and MySQL that allows students to schedule pickups, track laundry status in real-time, and enables administrators to manage staff workflows."
            },
            {
                id: "face-match",
                tag: "AI / SECURITY",
                title: "Face-Match Security System",
                shortDesc: "Biometric authentication platform matching user features for identity verification and authorization.",
                fullDesc: "A security authentication project incorporating computer vision techniques to detect and match authorized user faces against registered database entries for smart lock and access control systems."
            },
            {
                id: "battle-bots",
                tag: "HARDWARE / EMBEDDED",
                title: "Battle Bots & Mobile Robotics",
                shortDesc: "High-power remote-operated combat robot designed for university-level competitions.",
                fullDesc: "Custom-built combat robot featuring high-torque motor driver configuration, radio-frequency transmitter receiver setups, and custom protective chassis built for university tech fests."
            },
            {
                id: "drone-electronics",
                tag: "AEROSPACE / EMBEDDED",
                title: "Custom Drone Electronics",
                shortDesc: "Calibrated flight controller layout and motor speed setup for custom quadcopter hardware.",
                fullDesc: "Complete hardware assembly, ESC calibration, flight controller programming, and remote receiver channel configuration for stable multirotor unmanned aerial vehicles."
            }
        ]
    });
});

// 2. Contact Form Submission Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Please provide name, email, and message.' });
    }

    const newMessage = {
        id: Date.now(),
        name,
        email,
        message,
        date: new Date().toISOString()
    };

    try {
        // Save to JSON file
        const fileData = fs.readFileSync(MESSAGES_FILE);
        const messages = JSON.parse(fileData);
        messages.unshift(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        // Optional: Email Notification Setup (Uncomment and set credentials if needed)
        /*
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: `New Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });
        */

        return res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been stored in the backend server successfully.' 
        });
    } catch (err) {
        console.error('Error saving message:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 3. Admin Route to Read Messages
app.get('/api/messages', (req, res) => {
    try {
        const fileData = fs.readFileSync(MESSAGES_FILE);
        const messages = JSON.parse(fileData);
        res.json({ success: true, count: messages.length, messages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Could not retrieve messages' });
    }
});

// Fallback to index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Server running live on http://localhost:${PORT}`);
    console.log(`API Messages Endpoint: http://localhost:${PORT}/api/messages`);
    console.log(`====================================================`);
});