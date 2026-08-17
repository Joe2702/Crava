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
            'Your progress: which lesson steps you have ticked and which lessons you have completed, with the date each was completed.',
            'Which courses you have started and which you have bought.',
            'Coaching session requests, if you make one: which coach, which time slot, and which session type.',
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
            'Your progress and your purchases are readable only by you. Security rules enforce this at the database, not just in the app.',
            'When you request a coaching session, the coach you selected can see that request and your name.',
          ],
        },
        {
          heading: 'Deleting your data',
          paragraphs: [
            'You can delete your account from the Account tab. This removes your profile, your progress, your enrolments, and your account itself.',
            'Deleting your account does not refund purchases; refunds are handled by the app store you bought through.',
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
            'تقدمك: الخطوات التي أنجزتها والدروس التي أكملتها وتاريخ كل منها.',
            'الدورات التي بدأتها والدورات التي اشتريتها.',
            'طلبات جلسات التدريب إن طلبت واحدة: المدرب والموعد ونوع الجلسة.',
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
            'تقدمك ومشترياتك مرئية لك وحدك، وقواعد الأمان تفرض ذلك على مستوى قاعدة البيانات لا التطبيق فقط.',
            'عند طلب جلسة تدريب، يرى المدرب المختار هذا الطلب واسمك.',
          ],
        },
        {
          heading: 'حذف بياناتك',
          paragraphs: [
            'يمكنك حذف حسابك من تبويب «حسابي». يحذف ذلك ملفك الشخصي وتقدمك وتسجيلاتك والحساب نفسه.',
            'حذف الحساب لا يعني استرداد المشتريات؛ الاسترداد يتم عبر متجر التطبيقات الذي اشتريت منه.',
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
            'Crava sells video courses that teach physical skills. Strength training, boxing, sprinting and parkour carry a real risk of injury.',
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
            'كرافا يبيع دورات فيديو تعلّم مهارات بدنية. تدريب القوة والملاكمة والعدو والباركور تحمل خطر إصابة حقيقياً.',
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
