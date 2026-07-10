const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json()); // रेज़रपे के डेटा को पढ़ने के लिए

// ===================================================
// 🔑 FIREBASE ADMIN SETUP (यहाँ अपनी सीक्रेट JSON पेस्ट करें)
// ===================================================
// 🔴 ध्यान दें: नीचे जो 'serviceAccount = { ... }' है, इस पूरे डिब्बे को 
// हटाकर अपनी डाउनलोड की हुई नोटपैड वाली .json फ़ाइल का पूरा डेटा हुबहू यहाँ पेस्ट कर दें।

const serviceAccount = {
  "type": "service_account",
  "project_id": "jkssb-studies-ai",
  "private_key_id": "381befa4f80267b5b8205ee76f474fdae73d62bf",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDYKsBlMGxW8i0r\n1/qgW62JM66eR7mIrRIbptgFpmi6ZXOAFFVshtI87Voz4PRcYG1eBi/la9n7NgMv\nrfoJ3vlSNkWqzhj8v5+OSkAaVy9MWAjuGxcBesQuuc8GMkUfUVq3pUIEn5eAjZJe\nHE8erUACLJrojqNd5DxWIjVURlHd4g6VmeMU+CTLyiDArhjuAZHApt4Jk4uJrbck\nBb83fwn2zdtVJRau1BSfgI+uoEsOR38gjuv1ugkndcN7sf0JqxOC7AhJzR1+B02I\net3da/3cd1MlWh4UJYVXeL3If0lk+PWR5/nF2BCE4RVjgX9oBQ/8wB2JXF2MLyIz\nUqfd3xQhAgMBAAECgf8T1pnIuTzvIRU4giku0amj4miRu57Bj+YaeWxFMBZWJaPE\n23sUtqT41CRhQVsXUjafrEfTkcpEtnVd7RwSo1GU9z4iIWJF2YVTCYl+nbv0ImZ7\n4jARqUzNqUK5OyHP1GHkygaflX8x3QbBZl0RF3vtPmaPU6zg+cCcJn86rMYMBbdX\nmh4mLrb3QpMOgcA/AJEIfb9PeicSP7zzoFPtHH7EsaKFr2bZ1Tg5/CanXTOfwLNz\nNBIr7jaTNparQuaWEQc4ZecCmqhGWRLx3O5EJOO9Hj64B9VP/sP24Xs+g+TAaPm6\nFQjIKYfcqJwJ7u8yQwRXV2qiHdglXYhVJB2AABUCgYEA/bwSL2wtic+D1dc5Xqp+\n+tO+TiPDFlpOqMoeT8fWQpzcrwzWQn5ojUHOAsbEWbocWDpvXUN45LlUBgxx8NEl\n1771YYULDN7AwyP8rRpCZMfLeP3MRnHV/3cZCwjlLgu6DnXUdA4KMpARyw1BsJCU\nWeCblRM0AXiibuufkKruJfUCgYEA2hjRINls+Yc+OsKJPb8mSbe2BTH6bG7+kGBu\nJZDCjTCl+34yooLxgHLGJ30RYNNZYWs2GQbz5vMJaqd8v4j7vkkNjp+rXeDmB7bN\n6UVmTA5ScvWdGtdvWFs1Nj/Uem2TFag4Y7qzG/g3tETgysjUnfkrkJD96lKQCat7\ny7ZJrf0CgYA7LYL8Rnm0e46e8Cx0NMWa0InBBbw5WWShH0rEhrIlJRqfRRovtfXC\nhEd9BEjFOI/lz/MrSFJI3iSHqJ1mchEmaWYnkXULUmSY3qrO4KH9iU+eb2sWPvSP\nOYLAvRlejOOe/cJIMwIT2uAbgIMCoCXJdIY01Z66fR09S30Sq5sRhQKBgQCBToVv\nPHnn18+FdyF3goVo34sDuYYIFCbJ4uJrU1CF9Xnzifbrc0dMKMBjWTucdLJhl/cT\nD5Q8MYw7t+G2jbj0MMvg67nmhxjbKf8bdxIXtcYccpMa/u/9KtZ5u452p9C03m/Q\ncTkQNDKSpuPAVyH4J2s040IoU5sioJFdTk6Q4QKBgDgVfuqRG4YwlgHBqIf65TLh\na+l2yuJDiLcTUuO90WjHYOpyUJ6FRAFFnrQWuE+oVTiNPwvELb718osIDHeUWuxF\nKIlkg3LtmeuwRDUGs9r4fVMSUrWSD3HPpzCcnxzRDZ1ChVzwpmpioRHEKgduX78q\nZ2A4GY9g4kK2sP1zFvA0\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@jkssb-studies-ai.iam.gserviceaccount.com",
  "client_id": "100544831378399285010",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40jkssb-studies-ai.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ===================================================
// 💳 RAZORPAY AUTOMATIC WEBHOOK RECEIVER
// ===================================================
app.post('/razorpay-webhook', async (req, res) => {
    const event = req.body.event;
    
    // जैसे ही रेज़रपे कहेगा कि पेमेंट सफ़ल हो गई है:
    if (event === 'payment.captured') {
        const paymentEntities = req.body.payload.payment.entity;
        const studentEmail = paymentEntities.email; // छात्र की ईमेल आईडी
        
        console.log(`Payment Captured for Student: ${studentEmail}`);

        try {
            // फायरबेस डेटाबेस में छात्र को ढूंढना
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', studentEmail).get();

            if (!snapshot.empty) {
                // छात्र मिलते ही उसका प्लान "pro" कर देना
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

    // रेज़रपे को वापस 200 OK सिग्नल भेजना
    res.status(200).send({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
