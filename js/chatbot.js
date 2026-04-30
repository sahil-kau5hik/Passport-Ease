/* ================================================================
   chatbot.js — AI Help & Support Chatbot
   - Auto-detects input language (Hindi, English, Tamil, etc.)
   - Responds in the SAME language the user typed in
   - Knowledge base for passport process queries
   - Floating widget on all pages
   ================================================================ */
(function () {
  'use strict';

  // ===== LANGUAGE DETECTION =====
  function detectLang(text) {
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    return 'en';
  }

  // ===== KNOWLEDGE BASE =====
  const KB = {
    greet: {
      keywords: ['hello','hi','hey','help','hii','namaste','namaskar','hola','good morning','good evening','start','shuru','madad','sahayata','kaise','नमस्ते','हेलो','हाय','मदद','सहायता','शुरू'],
      en: "👋 Hello! I'm the PassportEase AI Assistant. How can I help you today?\n\nYou can ask me about:\n• How to apply for a passport\n• Required documents\n• Renewal process\n• Track application status\n• Police verification\n• Fees & processing time",
      hi: "👋 नमस्ते! मैं PassportEase AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?\n\nआप मुझसे पूछ सकते हैं:\n• पासपोर्ट के लिए कैसे आवेदन करें\n• आवश्यक दस्तावेज़\n• नवीनीकरण प्रक्रिया\n• आवेदन की स्थिति ट्रैक करें\n• पुलिस सत्यापन\n• शुल्क और प्रसंस्करण समय",
      ta: "👋 வணக்கம்! நான் PassportEase AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?\n\n• பாஸ்போர்ட் விண்ணப்பம்\n• தேவையான ஆவணங்கள்\n• புதுப்பித்தல்\n• நிலை கண்காணிப்பு",
      te: "👋 నమస్కారం! నేను PassportEase AI సహాయకుడిని. నేను మీకు ఎలా సహాయం చేయగలను?\n\n• పాస్‌పోర్ట్ దరఖాస్తు\n• అవసరమైన పత్రాలు\n• పునరుద్ధరణ\n• స్థితి ట్రాకింగ్",
      bn: "👋 নমস্কার! আমি PassportEase AI সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?\n\n• পাসপোর্ট আবেদন\n• প্রয়োজনীয় নথি\n• নবায়ন\n• স্থিতি ট্র্যাকিং",
      gu: "👋 નમસ્તે! હું PassportEase AI સહાયક છું.\n\n• પાસપોર્ટ અરજી\n• જરૂરી દસ્તાવેજો\n• નવીકરણ",
      pa: "👋 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ PassportEase AI ਸਹਾਇਕ ਹਾਂ.\n\n• ਪਾਸਪੋਰਟ ਅਰਜ਼ੀ\n• ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼\n• ਨਵੀਨੀਕਰਨ",
    },
    apply: {
      keywords: ['apply','application','new passport','fresh','how to apply','kaise apply','form','avedan','aavedan','kare','karu','apply kaise','apply karna','आवेदन','अप्लाई','कैसे','फॉर्म','नया पासपोर्ट','अप्लाई करें','कैसे अप्लाई करें'],
      en: "📝 **How to Apply for a Passport:**\n\n**Step 1:** Click 'Apply' in the navigation bar\n**Step 2:** Fill the 6-step form:\n  1️⃣ Application Type (Fresh/Renewal)\n  2️⃣ Personal Details (Name, DOB, Gender)\n  3️⃣ Family Information (Parents' names)\n  4️⃣ Contact & Address + Select nearest PSK city\n  5️⃣ Upload Documents (Photo, Aadhaar, etc.)\n  6️⃣ Review & Submit\n\n✅ Your form auto-saves as you type!\n\n👉 Would you like to know about required documents?",
      hi: "📝 **पासपोर्ट के लिए कैसे आवेदन करें:**\n\n**चरण 1:** नेविगेशन बार में 'Apply' पर क्लिक करें\n**चरण 2:** 6-चरण फॉर्म भरें:\n  1️⃣ आवेदन प्रकार (नया/नवीनीकरण)\n  2️⃣ व्यक्तिगत विवरण (नाम, जन्मतिथि)\n  3️⃣ पारिवारिक जानकारी\n  4️⃣ संपर्क और पता + नजदीकी PSK शहर चुनें\n  5️⃣ दस्तावेज़ अपलोड करें\n  6️⃣ समीक्षा करें और सबमिट करें\n\n✅ आपका फॉर्म टाइप करते समय ऑटो-सेव होता है!\n\n👉 क्या आप आवश्यक दस्तावेज़ों के बारे में जानना चाहेंगे?",
      ta: "📝 **பாஸ்போர்ட் விண்ணப்பிக்க:**\n\n1️⃣ விண்ணப்ப வகை\n2️⃣ தனிப்பட்ட விவரங்கள்\n3️⃣ குடும்ப தகவல்\n4️⃣ தொடர்பு & முகவரி\n5️⃣ ஆவணங்கள் பதிவேற்றம்\n6️⃣ மதிப்பாய்வு & சமர்ப்பிப்பு",
    },
    documents: {
      keywords: ['document','documents','dastavez','dastaveez','kagaz','papers','upload','photo','aadhaar','aadhar','proof','required documents','kya chahiye','kaun se','dstaavez','दस्तावेज़','कागज़ात','क्या चाहिए','कौन से','अपलोड','फोटो','आधार'],
      en: "📎 **Required Documents (6 uploads):**\n\n1️⃣ **Passport Photo** ✱ — Recent colour photo, white background (3.5×4.5 cm)\n2️⃣ **Aadhaar Card** ✱ — Front and back scan\n3️⃣ **PAN Card** (optional) — Clear image\n4️⃣ **Date of Birth Proof** ✱ — Birth certificate or 10th marksheet\n5️⃣ **Address Proof** ✱ — Aadhaar/Voter ID/Utility bill\n6️⃣ **Signature** ✱ — On white paper\n\n📏 Max size: 2MB per file | Formats: JPG, PNG, WebP\n\n⚠️ If documents fail admin verification, you'll be notified and can re-upload.",
      hi: "📎 **आवश्यक दस्तावेज़ (6 अपलोड):**\n\n1️⃣ **पासपोर्ट फोटो** ✱ — हाल की रंगीन फोटो, सफेद पृष्ठभूमि\n2️⃣ **आधार कार्ड** ✱ — आगे और पीछे की स्कैन\n3️⃣ **PAN कार्ड** (वैकल्पिक)\n4️⃣ **जन्म तिथि प्रमाण** ✱ — जन्म प्रमाणपत्र या 10वीं मार्कशीट\n5️⃣ **पता प्रमाण** ✱ — आधार/वोटर ID/बिजली बिल\n6️⃣ **हस्ताक्षर** ✱ — सफेद कागज पर\n\n📏 अधिकतम आकार: 2MB प्रति फ़ाइल | प्रारूप: JPG, PNG, WebP",
    },
    renewal: {
      keywords: ['renew','renewal','renew passport','extend','purana','expire','validity','punarnirman','tatkal','renewal kaise','renew kaise','purana passport','नवीनीकरण','रिन्यू','पुराना','वैधता','कैसे रिन्यू करें','एक्सपायर'],
      en: "🔄 **Passport Renewal Process:**\n\n1. Select **'Renewal'** as Application Type in Step 1\n2. Fill your existing details (same 6-step form)\n3. Upload current & new documents\n4. Submit your application\n\n📋 **Additional things for renewal:**\n• Your old passport (original)\n• Self-attested copy of first & last page of old passport\n• If name changed: marriage certificate / gazette notification\n\n⏱️ Normal processing: 30-45 days\n⚡ Tatkal: 7-14 days (extra fee applies)",
      hi: "🔄 **पासपोर्ट नवीनीकरण प्रक्रिया:**\n\n1. चरण 1 में **'Renewal'** चुनें\n2. अपना विवरण भरें (6-चरण फॉर्म)\n3. वर्तमान और नए दस्तावेज़ अपलोड करें\n4. आवेदन सबमिट करें\n\n📋 **नवीनीकरण के लिए अतिरिक्त:**\n• पुराना पासपोर्ट (मूल)\n• पहले और अंतिम पृष्ठ की स्व-प्रमाणित प्रति\n\n⏱️ सामान्य: 30-45 दिन\n⚡ तत्काल: 7-14 दिन (अतिरिक्त शुल्क)",
    },
    track: {
      keywords: ['track','status','check status','where is','kahan','kab','kitna time','kab milega','track kaise','mera passport','status check','tracking','ट्रैक','स्थिति','कहाँ','कब','कितना समय','कब मिलेगा','मेरा पासपोर्ट'],
      en: "📍 **Track Your Application:**\n\n1. Click **'Track'** in the navigation bar\n2. You'll see all your submitted applications\n3. Each shows a **5-step progress tracker:**\n  📄 Submitted → ✅ Admin Approved → 📋 Docs Verified → 🛡️ Police Verified → 🛂 Passport Issued\n\n🔴 If rejected, you'll see the reason\n📄 Download PDF of your application anytime",
      hi: "📍 **अपने आवेदन को ट्रैक करें:**\n\n1. नेविगेशन बार में **'Track'** पर क्लिक करें\n2. आपको सभी सबमिट किए गए आवेदन दिखेंगे\n3. प्रत्येक में **5-चरण प्रगति ट्रैकर:**\n  📄 सबमिट → ✅ एडमिन स्वीकृत → 📋 दस्तावेज़ सत्यापित → 🛡️ पुलिस सत्यापित → 🛂 पासपोर्ट जारी\n\n🔴 यदि अस्वीकृत, आपको कारण दिखेगा",
    },
    appointment: {
      keywords: ['appointment','slot','booking','book','time','date','kab jaana','kab jana','appointment kaise','slot book','समय','अपॉइंटमेंट','बुकिंग','स्लॉट','कब जाना','तاريख'],
      en: "📅 **Appointment Not Required:**\n\nAs of April 2026, physically visiting the Passport Seva Kendra for an appointment is **no longer required**. The entire process, including document verification and identity check, is now conducted **100% online**.\n\nSimply submit your application and track the progress!",
      hi: "📅 **अपॉइंटमेंट की आवश्यकता नहीं है:**\n\nअप्रैल 2026 से, पासपोर्ट सेवा केंद्र पर भौतिक रूप से जाने की **आवश्यकता नहीं है**। दस्तावेज़ सत्यापन और पहचान जांच सहित पूरी प्रक्रिया अब **100% ऑनलाइन** आयोजित की जाती है।\n\nबस अपना आवेदन जमा करें और प्रगति को ट्रैक करें!",
    },
    police: {
      keywords: ['police','verification','police verification','criminal','check','pv','police check','background','पुलिस','सत्यापन','पुलिस सत्यापन','जाँच','बैकग्राउंड','क्रिमिनल'],
      en: "🛡️ **Police Verification:**\n\n• After admin verifies your documents, your application goes to the **Police Department** of your selected PSK city\n• Police checks your **Aadhaar number** against the national criminal database\n• If ✅ **no criminal record** → Application cleared\n• If 🚨 **record found** → Application may be rejected\n• After police clearance → **Passport is automatically issued** with a passport number\n\n⏱️ Police verification usually takes 1-2 weeks",
      hi: "🛡️ **पुलिस सत्यापन:**\n\n• एडमिन द्वारा दस्तावेज़ सत्यापन के बाद, आवेदन **पुलिस विभाग** को जाता है\n• पुलिस आपके **आधार नंबर** की जाँच अपराधिक डेटाबेस से करती है\n• ✅ **कोई रिकॉर्ड नहीं** → आवेदन मंजूर\n• 🚨 **रिकॉर्ड मिला** → आवेदन अस्वीकृत हो सकता है\n• पुलिस मंजूरी के बाद → **पासपोर्ट स्वचालित रूप से जारी** होता है\n\n⏱️ पुलिस सत्यापन में आमतौर पर 1-2 सप्ताह लगते हैं",
    },
    fees: {
      keywords: ['fee','fees','cost','price','kitna paisa','charge','charges','payment','amount','kitna lagta','शुल्क','फीस','कितना पैसा','चार्ज','कीमत','कितना लगता'],
      en: "💰 **Passport Fees (Approximate):**\n\n| Type | Normal | Tatkal |\n|------|--------|--------|\n| Fresh (36 pages) | ₹1,500 | ₹3,500 |\n| Fresh (60 pages) | ₹2,000 | ₹4,000 |\n| Renewal | ₹1,500 | ₹3,500 |\n| Minor (under 18) | ₹1,000 | ₹2,000 |\n\n📝 Payment accepted: Online (UPI, Net Banking, Cards)\n\n*Note: This is a demo system. Actual fees may vary.*",
      hi: "💰 **पासपोर्ट शुल्क (अनुमानित):**\n\n• नया (36 पेज): ₹1,500 (सामान्य) / ₹3,500 (तत्काल)\n• नया (60 पेज): ₹2,000 / ₹4,000\n• नवीनीकरण: ₹1,500 / ₹3,500\n• नाबालिग: ₹1,000 / ₹2,000\n\n📝 भुगतान: ऑनलाइन (UPI, नेट बैंकिंग, कार्ड)\n\n*नोट: यह डेमो सिस्टम है। वास्तविक शुल्क भिन्न हो सकते हैं।*",
    },
    time: {
      keywords: ['time','how long','processing','days','kitne din','duration','weeks','delivery','कितने दिन','समय','प्रसंस्करण','कब तक','डिलीवरी'],
      en: "⏱️ **Processing Time:**\n\n• **Normal Processing:** 30-45 days\n  → Includes admin review, document verification, police verification, printing & dispatch\n• **Tatkal Processing:** 7-14 days\n  → Expedited review, higher fees\n\n📦 Passport is delivered via **Speed Post** to your registered address\n\n💡 Track your application status in real-time on the Track page!",
      hi: "⏱️ **प्रसंस्करण समय:**\n\n• **सामान्य:** 30-45 दिन\n  → एडमिन समीक्षा, दस्तावेज़ सत्यापन, पुलिस सत्यापन, प्रिंटिंग शामिल\n• **तत्काल:** 7-14 दिन\n  → त्वरित समीक्षा, अधिक शुल्क\n\n📦 पासपोर्ट **स्पीड पोस्ट** से आपके पते पर भेजा जाता है",
    },
    docfail: {
      keywords: ['document fail','doc fail','rejected document','wrong document','re-upload','reupload','dastAvez fail','document reject','galat document','গুলি ব্যর्থ','fail hua','doc reject','डॉक्यूमेंट फेल','दस्तावेज़ रिजेक्ट','गलत दस्तावेज़','दोबारा अपलोड','री-अपलोड'],
      en: "❌ **Document Verification Failed?**\n\nDon't worry! Here's what to do:\n\n1. Go to **Track** page → find your application\n2. You'll see which specific documents failed ❌ with the reason\n3. Click **'Re-upload'** next to the failed document\n4. Upload a corrected document\n5. Your application goes back to admin for re-verification\n\n📋 **Common rejection reasons:**\n• Blurry or unclear image\n• Wrong document uploaded\n• File too large (max 2MB)\n• Expired document\n• Name mismatch between documents",
      hi: "❌ **दस्तावेज़ सत्यापन विफल?**\n\nचिंता न करें! यह करें:\n\n1. **Track** पेज पर जाएं → अपना आवेदन खोजें\n2. आप देखेंगे कौन से दस्तावेज़ फेल हुए ❌ कारण के साथ\n3. फेल दस्तावेज़ के बगल में **'Re-upload'** पर क्लिक करें\n4. सही दस्तावेज़ अपलोड करें\n5. आपका आवेदन दोबारा एडमिन के पास जाएगा\n\n📋 **सामान्य अस्वीकृति कारण:**\n• धुंधली तस्वीर\n• गलत दस्तावेज़\n• फ़ाइल बहुत बड़ी (अधिकतम 2MB)\n• समाप्त दस्तावेज़",
    },
    thankyou: {
      keywords: ['thank','thanks','dhanyavaad','shukriya','धन्यवाद','शुक्रिया','thankyou','thx','ok','okay','theek hai','ठीक है','ओके'],
      en: "😊 You're welcome! Is there anything else I can help you with? Feel free to ask anytime!\n\n🛂 PassportEase is here to make your passport journey smooth and hassle-free.",
      hi: "😊 आपका स्वागत है! क्या मैं आपकी और कुछ मदद कर सकता हूँ?\n\n🛂 PassportEase आपकी पासपोर्ट यात्रा को आसान बनाने के लिए यहाँ है।",
    },
  };

  // Default/fallback response
  const FALLBACK = {
    en: "🤔 I'm not sure I understand. Could you try rephrasing?\n\nHere are things I can help with:\n• How to apply for a passport\n• Required documents\n• Renewal process\n• Track application\n• Police verification\n• Fees & processing time\n• Document re-upload (if failed)",
    hi: "🤔 मुझे समझ नहीं आया। क्या आप दूसरे शब्दों में पूछ सकते हैं?\n\nमैं इनमें मदद कर सकता हूँ:\n• पासपोर्ट आवेदन कैसे करें\n• आवश्यक दस्तावेज़\n• नवीनीकरण\n• आवेदन ट्रैक करें\n• पुलिस सत्यापन\n• शुल्क और समय\n• दस्तावेज़ दोबारा अपलोड (फेल होने पर)",
    ta: "🤔 புரியவில்லை. மீண்டும் கேளுங்கள்.\n\n• பாஸ்போர்ட் விண்ணப்பம்\n• தேவையான ஆவணங்கள்\n• புதுப்பித்தல்",
    te: "🤔 అర్థం కాలేదు. దయచేసి మళ్ళీ అడగండి.",
    bn: "🤔 বুঝতে পারলাম না। অনুগ্রহ করে আবার জিজ্ঞাসা করুন।",
    gu: "🤔 સમજાયું નહીં. ફરીથી પૂછો.",
    kn: "🤔 ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಕೇಳಿ.",
    ml: "🤔 മനസ്സിലായില്ല. ദയവായി വീണ്ടും ചോദിക്കുക.",
    pa: "🤔 ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਪੁੱਛੋ।",
    ur: "🤔 سمجھ نہیں آیا۔ دوبارہ پوچھیں۔",
  };

  function findResponse(text) {
    const lang = detectLang(text);
    const lower = text.toLowerCase().replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0600-\u06FF]/g, '');

    let bestMatch = null;
    let bestScore = 0;

    for (const [, entry] of Object.entries(KB)) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (lower.includes(kw.toLowerCase())) score += kw.length;
      }
      if (score > bestScore) { bestScore = score; bestMatch = entry; }
    }

    if (bestMatch && bestScore > 0) {
      return bestMatch[lang] || bestMatch.hi || bestMatch.en;
    }
    return FALLBACK[lang] || FALLBACK.en;
  }

  // ===== QUICK ACTION BUTTONS =====
  const QUICK_ACTIONS = [
    { label: '📝 How to Apply', text: 'How to apply for passport?' },
    { label: '📎 Documents', text: 'What documents are required?' },
    { label: '🔄 Renewal', text: 'How to renew passport?' },
    { label: '📍 Track', text: 'How to track application?' },
    { label: '💰 Fees', text: 'What are the passport fees?' },
    { label: '🛡️ Police Check', text: 'What is police verification?' },
  ];

  // ===== UI =====
  function createChatWidget() {
    // Floating button
    const fab = document.createElement('div');
    fab.id = 'chatFab';
    fab.innerHTML = '💬';
    fab.title = 'AI Help & Support';
    document.body.appendChild(fab);

    // Chat window
    const win = document.createElement('div');
    win.id = 'chatWindow';
    win.classList.add('chat-hidden');
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">🤖</div>
          <div>
            <div class="chat-header-title">PassportEase AI</div>
            <div class="chat-header-status">● Online — Ask in any language</div>
          </div>
        </div>
        <button class="chat-close" id="chatClose">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-quick-actions" id="chatQuickActions"></div>
      <div class="chat-input-bar">
        <input type="text" class="chat-input" id="chatInput" placeholder="Type your question in any language..." />
        <button class="chat-send" id="chatSend">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    // Quick actions
    const qaContainer = document.getElementById('chatQuickActions');
    QUICK_ACTIONS.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'chat-quick-btn';
      btn.textContent = q.label;
      btn.addEventListener('click', () => { handleSend(q.text); qaContainer.classList.add('hidden'); });
      qaContainer.appendChild(btn);
    });

    // Events
    fab.addEventListener('click', () => {
      win.classList.toggle('chat-hidden');
      if (!win.classList.contains('chat-hidden') && document.getElementById('chatMessages').children.length === 0) {
        addBotMessage(KB.greet[getUILang()] || KB.greet.en);
      }
      document.getElementById('chatInput').focus();
    });
    document.getElementById('chatClose').addEventListener('click', () => win.classList.add('chat-hidden'));
    document.getElementById('chatSend').addEventListener('click', () => handleSend());
    document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  }

  function getUILang() {
    return localStorage.getItem('pe_language') || 'en';
  }

  function addBotMessage(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.innerHTML = `<div class="chat-msg-avatar">🤖</div><div class="chat-msg-bubble">${formatMsg(text)}</div>`;
    document.getElementById('chatMessages').appendChild(el);
    scrollChat();
  }

  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg user';
    el.innerHTML = `<div class="chat-msg-bubble">${escapeHtml(text)}</div>`;
    document.getElementById('chatMessages').appendChild(el);
    scrollChat();
  }

  function handleSend(overrideText) {
    const inp = document.getElementById('chatInput');
    const text = overrideText || inp.value.trim();
    if (!text) return;
    inp.value = '';
    addUserMessage(text);

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing-indicator';
    typing.innerHTML = '<div class="chat-msg-avatar">🤖</div><div class="chat-msg-bubble"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
    document.getElementById('chatMessages').appendChild(typing);
    scrollChat();

    setTimeout(() => {
      typing.remove();
      const response = findResponse(text);
      addBotMessage(response);
    }, 600 + Math.random() * 400);
  }

  function formatMsg(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(t) {
    const d = document.createElement('div'); d.textContent = t; return d.innerHTML;
  }

  function scrollChat() {
    const m = document.getElementById('chatMessages');
    setTimeout(() => m.scrollTop = m.scrollHeight, 50);
  }

  // Boot
window.onDBReady ? window.onDBReady(createChatWidget) : document.addEventListener('DOMContentLoaded', createChatWidget);
})();
