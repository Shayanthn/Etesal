const fs = require('fs');
const files = ['workflows/n8n/4-news-ingestion-iran.json', 'workflows/n8n/5-news-ingestion-global.json'];

files.forEach(file => {
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let aiNode = data.nodes.find(n => n.id === 'openrouter-rewrite');
  
  if (aiNode && aiNode.parameters.jsonBody) {
    aiNode.parameters.jsonBody = `={
  "models": [
    "nvidia/nemotron-3-ultra",
    "thinkingmachines/inkling",
    "google/gemma-4-31b-it"
  ],
  "provider": {
    "allow_fallbacks": true
  },
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "شما یک سردبیر ارشد و متخصص سئو در حوزه فناوری هستید. وظیفه دارید خلاصه خبر دریافتی را به یک خبر کامل، دقیق و جذاب برای وبسایت تبدیل کنید.\\n\\nقوانین طلایی:\\n۱. **وفاداری به داده**: اگر متن ورودی خلاصه است، دقیقاً همان خلاصه را بسط دهید و از افزودن اطلاعات غیرموجود در متن ورودی (تخیل) اکیداً خودداری کنید. فقط حق توضیح اصطلاحات تخصصی را دارید.\\n۲. **یکتاسازی (سئو)**: محتوا را با تغییر ساختار جملات، مترادفسازی و تغییر ترتیب پاراگرافها بازنویسی کنید تا کپیبرداری محسوب نشود.\\n۳. **اصطلاحات فنی**: کلمات تخصصی مانند V2ray، MTProto، فیلترینگ، پروتکل و اسم شرکتها را **دقیقاً به همان شکل** در متن نگه دارید.\\n۴. **متا تگها**: meta_title و meta_description باید کاملاً به **زبان فارسی** و حداکثر ۶۰ و ۱۶۰ کاراکتر باشند.\\n\\nخروجی را فقط در قالب یک JSON معتبر برگردان:\\n{\\n  \\"title\\": \\"تیتری جذاب، پرسشی یا عددی (حداکثر ۱۲ کلمه)\\",\\n  \\"slug\\": \\"نسخه انگلیسی کبابی-شده تیتر (مثلا internet-censorship-new-law)\\",\\n  \\"summary\\": \\"خلاصه ۲ خطی از متن که در صفحه لیست اخبار نشان داده میشود\\",\\n  \\"content\\": \\"متن کامل خبر با فرمت Markdown. حتماً از ## برای تیتر میانی و ### برای زیرتیترها استفاده کنید. پاراگرافها کوتاه و خوانا باشند.\\",\\n  \\"meta_title\\": \\"همان تیتر جذاب برای نمایش در گوگل\\",\\n  \\"meta_description\\": \\"یک جمله دعوتکننده و سئو شده برای کلیک در نتایج جستجو\\"\\n}"
    },
    {
      "role": "user",
      "content": "تیتر اصلی: " + {{ JSON.stringify($json.rawTitle) }} + "\\n\\nمتن خبر/خلاصه: " + {{ JSON.stringify($json.rawDesc) }}
    }
  ]
}`;
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
});
