const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json()); // रेज़रपे से आने वाले JSON डेटा को पढ़ने के लिए

// ===================================================
// 🔑 FIREBASE ADMIN SETUP (यहाँ अपनी सीक्रेट JSON की डालें)
// ===================================================
// जो .json फ़ाइल आपने डाउनलोड की है, उसे ओपन करके नीचे हुबहू पेस्ट कर दें
const serviceAccount = {
  "type": "service_account",
  "project_id": "jkssb-studies-ai",
  "private_key_id": "यहाँ_अपनी_private_key_id_पेस्ट_करें",
  "private_key": "-----BEGIN PRIVATE KEY-----\nयहाँ_अपनी_पूरी_private_key_पेस्ट_करें\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@://gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://google.com",
  "token_uri": "https://googleapis.com",
  "auth_provider_x509_cert_url": "https://googleapis.com",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40://gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ===================================================
// 💳 RAZORPAY AUTOMATIC WEBHOOK RECEIVER (मुख्य एंडपॉइंट)
// ===================================================
app.post('/razorpay-webhook', async (req, res) => {
    const event = req.body.event;
    
    // ⚡ जादू: जैसे ही रेज़रपे कहेगा कि छात्र ने ₹99 पे कर दिए हैं:
    if (event === 'payment.captured') {
        const paymentEntities = req.body.payload.payment.entity;
        const studentEmail = paymentEntities.email; // छात्र की ईमेल आईडी जो उसने पेमेंट करते समय डाली
        
        console.log(`Payment Captured Alert for Student: ${studentEmail}`);

        try {
            // फायरबेस डेटाबेस (Firestore) में इस ईमेल वाले छात्र को ढूंढना
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', studentEmail).get();

            if (!snapshot.empty) {
                // छात्र मिलते ही उसका प्लान "pro" कर देना ताकि सारे फीचर्स खुद खुल जाएँ
                snapshot.forEach(async (doc) => {
                    await db.collection('users').doc(doc.id).update({
                        plan: 'pro',
                        subscribedAt: new Date().toISOString()
                    });
                    console.log(`User ${studentEmail} successfully upgraded to PRO Automatically!`);
                });
            } else {
                console.log(`User email ${studentEmail} paid but is not registered in Firestore yet.`);
            }
        } catch (error) {
            console.error("Database Update Failed Error:", error);
        }
    }

    // रेज़रपे को वापस 200 OK सिग्नल भेजना ज़रूरी है, नहीं तो वो बार-बार एरर देगा
    res.status(200).send({ status: 'ok' });
});

// रेंडर सर्वर के लिए पोर्ट कॉन्फ़िगरेशन
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`JKSSB Studies Webhook Server Running on Port ${PORT}`));
