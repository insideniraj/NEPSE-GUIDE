const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-screenshot-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_GMAIL_ADDRESS', // Replace with your Gmail address
        pass: 'YOUR_APP_PASSWORD'    // Replace with your Gmail app password
    }
});

// Endpoint to handle purchase form submission with file upload
app.post('/submit-purchase', upload.single('paymentScreenshot'), async (req, res) => {
    try {
        const { name, email, mobile } = req.body;
        const paymentScreenshot = req.file;

        if (!name || !email || !mobile || !paymentScreenshot) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields including payment screenshot are required' 
            });
        }

        // Send notification email to admin
        const adminMailOptions = {
            from: 'YOUR_GMAIL_ADDRESS',
            to: 'nepseguide@gmail.com',
            subject: `New NEPSE Guide Purchase Request - ${name}`,
            html: `
                <h1>🎉 New Purchase Request</h1>
                <p>A new customer wants to purchase the NEPSE Guide:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Customer Details:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>👤 Name:</strong> ${name}</li>
                        <li><strong>📧 Email:</strong> ${email}</li>
                        <li><strong>📱 Mobile:</strong> ${mobile}</li>
                        <li><strong>💰 Amount:</strong> Rs. 999 NPR</li>
                        <li><strong>📅 Date:</strong> ${new Date().toLocaleString('en-US', { 
                            timeZone: 'Asia/Kathmandu',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</li>
                    </ul>
                </div>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                    <h4>Next Steps:</h4>
                    <ol>
                        <li>Verify the payment screenshot (attached)</li>
                        <li>Confirm payment receipt</li>
                        <li>Share Google Drive access with: <strong>${email}</strong></li>
                        <li>Send Telegram channel invite</li>
                        <li>Update customer within 24 hours</li>
                    </ol>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This is an automated message from NEPSE Guide purchase system.
                </p>
            `,
            attachments: [
                {
                    filename: `payment-screenshot-${name.replace(/\s+/g, '-')}.${path.extname(paymentScreenshot.originalname)}`,
                    path: paymentScreenshot.path
                }
            ]
        };

        // Send confirmation email to customer
        const customerMailOptions = {
            from: 'YOUR_GMAIL_ADDRESS',
            to: email,
            subject: '🎉 NEPSE Guide Purchase Request Received - नेप्से गाइड खरिद अनुरोध प्राप्त',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0047FF, #1a5eff); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">🙏 धन्यवाद / Thank You!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px;">Understanding NEPSE Guide</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #0047FF; margin-top: 0;">प्रिय ${name}, / Dear ${name},</h2>
                        
                        <p style="font-size: 16px; line-height: 1.6;">तपाईंको NEPSE Guide खरिद अनुरोध सफलतापूर्वक प्राप्त भयो! / Your NEPSE Guide purchase request has been successfully received!</p>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F5C518;">
                            <h3 style="color: #0047FF; margin-top: 0;">📋 तपाईंको विवरण / Your Details:</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin: 8px 0;"><strong>नाम / Name:</strong> ${name}</li>
                                <li style="margin: 8px 0;"><strong>इमेल / Email:</strong> ${email}</li>
                                <li style="margin: 8px 0;"><strong>मोबाइल / Mobile:</strong> ${mobile}</li>
                                <li style="margin: 8px 0;"><strong>राशि / Amount:</strong> Rs. 999 NPR</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #28a745; margin-top: 0;">🚀 अब के हुन्छ? / What happens next?</h3>
                            <ol style="line-height: 1.8;">
                                <li>हामी तपाईंको भुक्तानी स्क्रिनसट जाँच गर्नेछौं / We will verify your payment screenshot</li>
                                <li>Google Drive मा पुस्तकको पहुँच प्रदान गर्नेछौं / Provide Google Drive access to the book</li>
                                <li>निजी Telegram च्यानलको निमन्त्रणा पठाउनेछौं / Send private Telegram channel invitation</li>
                                <li><strong>24 घण्टा भित्र</strong> तपाईंलाई सम्पूर्ण पहुँच दिइनेछ / Complete access within <strong>24 hours</strong></li>
                            </ol>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #856404; margin-top: 0;">📱 तुरुन्त सहायता चाहिन्छ? / Need immediate help?</h4>
                            <p style="margin: 0; color: #856404;">कुनै प्रश्न भए nepseguide@gmail.com मा इमेल गर्नुहोस् / Email us at nepseguide@gmail.com for any questions</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: linear-gradient(135deg, #F5C518, #FFD700); color: #0A2463; padding: 15px; border-radius: 8px; display: inline-block;">
                                <h3 style="margin: 0;">🎁 तपाईंले पाउनुहुनेछ / You will get:</h3>
                                <ul style="list-style: none; padding: 0; margin: 10px 0 0 0;">
                                    <li>📚 Complete PDF Guide (200+ pages)</li>
                                    <li>🎧 Audio Podcast Series (All Chapters)</li>
                                    <li>📱 Private Telegram Channel Access</li>
                                    <li>🎯 Bonus Advanced Strategies Chapter</li>
                                </ul>
                            </div>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #666;">हामी तपाईंको निवेश यात्रामा साथ दिन उत्साहित छौं! / We're excited to support your investment journey!</p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #666; font-size: 14px; margin: 0;">सादर / Best regards,<br><strong>NEPSE Guide Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        res.status(200).json({ 
            success: true, 
            message: 'Purchase request submitted successfully! Check your email for confirmation.' 
        });

    } catch (error) {
        console.error('Error processing purchase request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process purchase request. Please try again.' 
        });
    }
});

// Legacy email endpoint (keeping for compatibility)
app.post('/send-email', async (req, res) => {
    const { name, email } = req.body;

    // Email to customer
    const customerMailOptions = {
        from: 'YOUR_GMAIL_ADDRESS',
        to: email,
        subject: 'Welcome to NEPSE Guide - Your Purchase Details',
        html: `
            <h1>Welcome to NEPSE Guide!</h1>
            <p>Dear ${name},</p>
            <p>Thank you for purchasing the NEPSE Guide. We're excited to have you join our community of investors!</p>
            
            <h2>Your Access Details:</h2>
            <ul>
                <li><strong>Private Telegram Channel:</strong> <a href="https://t.me/your_channel_link">Click here to join</a></li>
                <li><strong>eBook Access:</strong> You can download your copy from the Telegram channel</li>
            </ul>
            
            <h2>Next Steps:</h2>
            <ol>
                <li>Join our private Telegram channel using the link above</li>
                <li>Download your copy of the NEPSE Guide</li>
                <li>Start your investment journey with confidence!</li>
            </ol>
            
            <p>If you have any questions, feel free to reach out to us through the Telegram channel.</p>
            
            <p>Best regards,<br>NEPSE Guide Team</p>
        `
    };

    // Email to admin
    const adminMailOptions = {
        from: 'YOUR_GMAIL_ADDRESS',
        to: 'YOUR_GMAIL_ADDRESS', // Your email to receive notifications
        subject: 'New NEPSE Guide Purchase',
        html: `
            <h1>New Purchase Notification</h1>
            <p>A new customer has purchased the NEPSE Guide:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
        `
    };

    try {
        // Send email to customer
        await transporter.sendMail(customerMailOptions);
        
        // Send notification to admin
        await transporter.sendMail(adminMailOptions);
        
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`New purchase endpoint available at: http://localhost:${PORT}/submit-purchase`);
}); 