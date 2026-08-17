/**
 * In-app privacy policy and terms. Both stores require these to be reachable
 * from inside the app and from a public URL on the listing, and the text has to
 * match what the app actually does — which is why this describes the real data
 * the app holds rather than boilerplate.
 *
 * This is a factual description written by an engineer, not legal advice. Have
 * a lawyer review it before submitting to a store, especially the Egyptian
 * PDPL points and anything about payments once billing is connected.
 */
export type LegalDoc = 'privacy' | 'terms'

interface Section {
  heading: string
  paragraphs: string[]
}

interface Content {
  title: string
  sections: Section[]
}

export const LEGAL: Record<LegalDoc, Record<'en' | 'ar', Content>> & { updated: string } = {
  updated: '17 August 2026',

  privacy: {
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: 'What we collect',
          paragraphs: [
            'An email address and password, to create and secure your account. Passwords are handled by Firebase Authentication and are never visible to us.',
            'A display name and city, only if you enter them.',
            'Your training progress: which drills you have ticked and which levels you have cleared, with the date each level was cleared.',
            'Anything you post to Milestones, including the text of your posts and which posts you have liked.',
            'Coaching session requests: which coach, which time slot, and which session type.',
          ],
        },
        {
          heading: 'What we do not collect',
          paragraphs: [
            'We do not collect your location, contacts, photos, or advertising identifiers. The app contains no advertising and no third-party analytics or tracking SDKs.',
          ],
        },
        {
          heading: 'Where it is stored',
          paragraphs: [
            'On Google Firebase (Firestore and Authentication). Google processes this data on our behalf as our service provider, and may store it on servers outside Egypt.',
          ],
        },
        {
          heading: 'Who can see it',
          paragraphs: [
            'Your progress is readable only by you. Security rules enforce this at the database, not just in the app.',
            'Anything you post to Milestones is visible to every signed-in user, along with the display name on your account. Do not post anything you would not want other users to see.',
            'When you request a session, the coach you selected can see that request.',
          ],
        },
        {
          heading: 'Deleting your data',
          paragraphs: [
            'You can delete your account from the You tab. This removes your profile, your drill and level completions, and your account itself.',
            'Posts you have made to Milestones are deleted individually from the post menu. Delete them before deleting your account if you want them gone.',
          ],
        },
        {
          heading: 'Children',
          paragraphs: [
            'Crava is not directed at children under 13, and we do not knowingly create accounts for them.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: ['For any question about your data, or to request its deletion, contact us in the app listing.'],
        },
      ],
    },
    ar: {
      title: 'سياسة الخصوصية',
      sections: [
        {
          heading: 'ما الذي نجمعه',
          paragraphs: [
            'البريد الإلكتروني وكلمة المرور لإنشاء حسابك وتأمينه. كلمات المرور تديرها Firebase Authentication ولا نراها إطلاقاً.',
            'الاسم والمدينة، فقط إذا أدخلتهما.',
            'تقدمك في التدريب: التمارين التي أنجزتها والمستويات التي أنهيتها وتاريخ كل منها.',
            'ما تنشره في الإنجازات، بما في ذلك نص المنشورات والإعجابات.',
            'طلبات جلسات التدريب: المدرب والموعد ونوع الجلسة.',
          ],
        },
        {
          heading: 'ما لا نجمعه',
          paragraphs: [
            'لا نجمع موقعك أو جهات اتصالك أو صورك أو معرفات الإعلانات. التطبيق خالٍ من الإعلانات ومن أدوات التتبع والتحليلات التابعة لجهات خارجية.',
          ],
        },
        {
          heading: 'أين تُحفظ',
          paragraphs: [
            'على Google Firebase (‏Firestore و‏Authentication). تعالج Google هذه البيانات نيابة عنا كمزود خدمة، وقد تُحفظ على خوادم خارج مصر.',
          ],
        },
        {
          heading: 'من يمكنه رؤيتها',
          paragraphs: [
            'تقدمك مرئي لك وحدك، وقواعد الأمان تفرض ذلك على مستوى قاعدة البيانات لا التطبيق فقط.',
            'ما تنشره في الإنجازات يراه كل مستخدم مسجّل، مع الاسم الظاهر على حسابك. لا تنشر ما لا تريد أن يراه الآخرون.',
            'عند طلب جلسة، يرى المدرب المختار هذا الطلب.',
          ],
        },
        {
          heading: 'حذف بياناتك',
          paragraphs: [
            'يمكنك حذف حسابك من تبويب «حسابي». يحذف ذلك ملفك الشخصي وتمارينك ومستوياتك المكتملة والحساب نفسه.',
            'تُحذف منشورات الإنجازات واحداً واحداً من قائمة المنشور. احذفها قبل حذف حسابك إن أردت إزالتها.',
          ],
        },
        {
          heading: 'الأطفال',
          paragraphs: ['كرافا ليس موجهاً لمن هم دون ١٣ عاماً، ولا ننشئ حسابات لهم عن علم.'],
        },
        {
          heading: 'التواصل',
          paragraphs: ['لأي استفسار عن بياناتك أو لطلب حذفها، تواصل معنا عبر صفحة التطبيق في المتجر.'],
        },
      ],
    },
  },

  terms: {
    en: {
      title: 'Terms of Use',
      sections: [
        {
          heading: 'Training at your own risk',
          paragraphs: [
            'Crava teaches physical skills. Strength training, boxing, sprinting and parkour carry a real risk of injury.',
            'Crava is not medical advice. Check with a doctor before starting, especially if you have an injury or a health condition. Stop if something hurts. You train at your own risk.',
          ],
        },
        {
          heading: 'Your account',
          paragraphs: [
            'You are responsible for what happens under your account. One account per person, and do not share your password.',
          ],
        },
        {
          heading: 'What you post',
          paragraphs: [
            'You keep ownership of what you post, and you give us permission to display it inside the app.',
            'Do not post anything abusive, harassing, sexual, hateful, illegal, or that is not yours to post. Report anything that breaks this from the post menu, and block anyone you do not want to see.',
            'We can remove posts and suspend accounts that break these rules.',
          ],
        },
        {
          heading: 'Buying courses',
          paragraphs: [
            'Lesson 1 of every course is a free preview. Buying a course gives you its remaining lessons.',
            'A course you have bought stays yours; it is not a rental and does not expire.',
            'When billing is available, purchases are handled through your app store account rather than by us, and refunds follow that store\u2019s policy.',
          ],
        },
        {
          heading: 'Coaching sessions',
          paragraphs: [
            'Booking a session sends a request. A coach may accept or decline it, and coaches are independent, not employees of Crava.',
          ],
        },
        {
          heading: 'Changes',
          paragraphs: ['We may update these terms. Continuing to use the app after a change means you accept it.'],
        },
      ],
    },
    ar: {
      title: 'شروط الاستخدام',
      sections: [
        {
          heading: 'التدريب على مسؤوليتك',
          paragraphs: [
            'كرافا يعلّم مهارات بدنية. تدريب القوة والملاكمة والعدو والباركور تحمل خطر إصابة حقيقياً.',
            'كرافا ليس نصيحة طبية. استشر طبيباً قبل البدء، خاصة إن كنت تعاني إصابة أو حالة صحية. توقف إذا شعرت بألم. أنت تتدرب على مسؤوليتك.',
          ],
        },
        {
          heading: 'حسابك',
          paragraphs: [
            'أنت مسؤول عما يحدث عبر حسابك. حساب واحد لكل شخص، ولا تشارك كلمة المرور.',
          ],
        },
        {
          heading: 'ما تنشره',
          paragraphs: [
            'تحتفظ بملكية ما تنشره، وتمنحنا إذناً بعرضه داخل التطبيق.',
            'لا تنشر ما هو مسيء أو تحرّشي أو جنسي أو كراهي أو غير قانوني أو ليس ملكك. أبلغ عن أي مخالفة من قائمة المنشور، واحظر من لا تريد رؤيته.',
            'يحق لنا حذف المنشورات وإيقاف الحسابات المخالفة.',
          ],
        },
        {
          heading: 'شراء الدورات',
          paragraphs: [
            'الدرس الأول من كل دورة معاينة مجانية. شراء الدورة يمنحك باقي دروسها.',
            'الدورة التي اشتريتها تبقى ملكك؛ ليست إيجاراً ولا تنتهي صلاحيتها.',
            'عند توفر الدفع، تتم عمليات الشراء عبر حسابك في متجر التطبيقات لا عبرنا، ويخضع الاسترداد لسياسة المتجر.',
          ],
        },
        {
          heading: 'جلسات التدريب',
          paragraphs: [
            'حجز الجلسة يرسل طلباً، وللمدرب قبوله أو رفضه. المدربون مستقلون وليسوا موظفين لدى كرافا.',
          ],
        },
        {
          heading: 'التغييرات',
          paragraphs: ['قد نحدّث هذه الشروط. استمرارك في استخدام التطبيق بعد التغيير يعني قبولك به.'],
        },
      ],
    },
  },
}
