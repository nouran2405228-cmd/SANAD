const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Anya Sharma',
    arName: 'د. أنيا شارما',
    specialty: 'Cardiology',
    arSpecialty: 'أمراض القلب',
    title: 'Chief Cardiologist',
    arTitle: 'رئيسة قسم أمراض القلب',
    bio: 'Dr. Sharma combines advanced cardiac expertise with a calm, personal approach to every consultation.',
    arBio: 'تجمع د. شارما بين الخبرة المتقدمة في أمراض القلب والنهج الهادئ والإنساني في كل استشارة.',
    fee: 500,
    rating: 4.9,
    visits: '340+',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80',
    clinic: 'Heart & Vascular Clinic',
    arClinic: 'عيادة القلب والأوعية الدموية',
    experience: '16 years',
    arExperience: '١٦ سنة'
  },
  {
    id: '2',
    name: 'Dr. Omar Farouk',
    arName: 'د. عمر فاروق',
    specialty: 'Pediatrics',
    arSpecialty: 'طب الأطفال',
    title: 'Senior Pediatrician',
    arTitle: 'استشاري طب الأطفال',
    bio: 'Dr. Farouk partners with families to make every child feel safe, seen, and supported.',
    arBio: 'يتعاون د. فاروق مع العائلات ليشعر كل طفل بالأمان والاهتمام والدعم.',
    fee: 400,
    rating: 4.9,
    visits: '286+',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=80',
    clinic: 'Children’s Health Center',
    arClinic: 'مركز صحة الطفل',
    experience: '13 years',
    arExperience: '١٣ سنة'
  },
  {
    id: '3',
    name: 'Dr. Layla Hassan',
    arName: 'د. ليلى حسن',
    specialty: 'Orthopedics',
    arSpecialty: 'جراحة العظام',
    title: 'Orthopedic Surgeon',
    arTitle: 'استشارية جراحة العظام',
    bio: 'Dr. Hassan specializes in joint care, sports injuries, and helping patients return to the life they love.',
    arBio: 'تتخصص د. حسن في رعاية المفاصل والإصابات الرياضية ومساعدة المرضى على العودة لحياتهم.',
    fee: 450,
    rating: 4.8,
    visits: '251+',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=80',
    clinic: 'Bone & Joint Clinic',
    arClinic: 'عيادة العظام والمفاصل',
    experience: '12 years',
    arExperience: '١٢ سنة'
  },
  {
    id: '4',
    name: 'Dr. Karim Nassar',
    arName: 'د. كريم نصار',
    specialty: 'Neurology',
    arSpecialty: 'طب الأعصاب',
    title: 'Consultant Neurologist',
    arTitle: 'استشاري طب الأعصاب',
    bio: 'Dr. Nassar provides thoughtful, evidence-led neurological care, from diagnosis through ongoing treatment.',
    arBio: 'يقدم د. نصار رعاية عصبية مدروسة قائمة على الأدلة، من التشخيص إلى المتابعة والعلاج.',
    fee: 550,
    rating: 4.9,
    visits: '198+',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=80',
    clinic: 'Neurology & Spine Center',
    arClinic: 'مركز الأعصاب والعمود الفقري',
    experience: '18 years',
    arExperience: '١٨ سنة'
  },
  {
    id: '5',
    name: 'Dr. Nour El-Din',
    arName: 'د. نور الدين',
    specialty: 'Dermatology',
    arSpecialty: 'الأمراض الجلدية',
    title: 'Consultant Dermatologist',
    arTitle: 'استشارية الأمراض الجلدية',
    bio: 'Dr. Nour offers comprehensive medical and cosmetic dermatology with a focus on lasting skin health.',
    arBio: 'تقدم د. نور رعاية جلدية طبية وتجميلية متكاملة مع التركيز على صحة البشرة.',
    fee: 400,
    rating: 4.8,
    visits: '176+',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80',
    clinic: 'Skin Health Clinic',
    arClinic: 'عيادة صحة الجلد',
    experience: '10 years',
    arExperience: '١٠ سنوات'
  },
  {
    id: '6',
    name: 'Dr. Youssef Adel',
    arName: 'د. يوسف عادل',
    specialty: 'Cardiology',
    arSpecialty: 'أمراض القلب',
    title: 'Interventional Cardiologist',
    arTitle: 'استشاري قسطرة القلب',
    bio: 'Dr. Adel specializes in minimally invasive cardiac procedures and preventive heart care.',
    arBio: 'يتخصص د. عادل في إجراءات القلب طفيفة التوغل والوقاية من أمراض القلب.',
    fee: 500,
    rating: 4.9,
    visits: '223+',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=700&q=80',
    clinic: 'Heart & Vascular Clinic',
    arClinic: 'عيادة القلب والأوعية الدموية',
    experience: '14 years',
    arExperience: '١٤ سنة'
  },
  {
    id: '7',
    name: 'Dr. Mariam Saleh',
    arName: 'د. مريم صالح',
    specialty: 'Pediatrics',
    arSpecialty: 'طب الأطفال',
    title: 'Pediatric Consultant',
    arTitle: 'استشارية طب الأطفال',
    bio: 'Dr. Saleh supports children’s health from newborn care through adolescence.',
    arBio: 'تدعم د. صالح صحة الأطفال من رعاية حديثي الولادة حتى مرحلة المراهقة.',
    fee: 400,
    rating: 4.8,
    visits: '204+',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=80',
    clinic: 'Children’s Health Center',
    arClinic: 'مركز صحة الطفل',
    experience: '11 years',
    arExperience: '١١ سنة'
  },
  {
    id: '8',
    name: 'Dr. Hadi Mansour',
    arName: 'د. هادي منصور',
    specialty: 'Orthopedics',
    arSpecialty: 'جراحة العظام',
    title: 'Consultant Orthopedic Surgeon',
    arTitle: 'استشاري جراحة العظام',
    bio: 'Dr. Mansour focuses on joint replacement and modern techniques for mobility restoration.',
    arBio: 'يركز د. منصور على استبدال المفاصل والتقنيات الحديثة لاستعادة الحركة.',
    fee: 450,
    rating: 4.7,
    visits: '165+',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
    clinic: 'Bone & Joint Clinic',
    arClinic: 'عيادة العظام والمفاصل',
    experience: '15 years',
    arExperience: '١٥ سنة'
  }
];

const SERVICES = [
  { id:'cbc', name:'Complete blood count', arName:'صورة دم كاملة', description:'A detailed snapshot of your overall health.', arDescription:'فحص شامل يقدم صورة واضحة عن صحتك العامة.', price:350, rating:4.8, reviews:126, icon:'lab', category:'tests', preparation:'No fasting required.', arPreparation:'لا يتطلب الصيام.', duration:'15 min', clinic:'Central Laboratory', arClinic:'المختبر المركزي', specialist:'Dr. Salma Fathy', arSpecialist:'د. سلمى فتحي' },
  { id:'hormone-panel', name:'Hormone panel', arName:'تحليل الهرمونات', description:'A focused assessment of key hormone levels.', arDescription:'تقييم دقيق لمستويات الهرمونات الأساسية.', price:850, rating:4.7, reviews:84, icon:'lab', category:'tests', preparation:'Fast for 8 hours before collection.', arPreparation:'الصيام لمدة ٨ ساعات قبل أخذ العينة.', duration:'20 min', clinic:'Endocrine Lab', arClinic:'مختبر الغدد الصماء', specialist:'Dr. Salma Fathy', arSpecialist:'د. سلمى فتحي' },
  { id:'genetic-screening', name:'Genetic screening', arName:'الفحص الجيني', description:'Personalized insight to guide your care.', arDescription:'معلومات شخصية تساعد في توجيه الرعاية.', price:2400, rating:4.9, reviews:42, icon:'lab', category:'tests', preparation:'Book a pre-test consultation.', arPreparation:'احجز استشارة ما قبل الفحص.', duration:'45 min', clinic:'Precision Medicine Lab', arClinic:'مختبر الطب الدقيق', specialist:'Dr. Rami Aziz', arSpecialist:'د. رامي عزيز' },
  { id:'pathology', name:'Pathology services', arName:'خدمات علم الأمراض', description:'Specialist analysis of tissue and cell samples.', arDescription:'تحليل متخصص لعينات الأنسجة والخلايا.', price:1200, rating:4.6, reviews:58, icon:'lab', category:'tests', preparation:'Preparation depends on the sample.', arPreparation:'يعتمد التحضير على نوع العينة.', duration:'1–3 days', clinic:'Central Laboratory', arClinic:'المختبر المركزي', specialist:'Dr. Salma Fathy', arSpecialist:'د. سلمى فتحي' },
  { id:'mri', name:'MRI scan', arName:'تصوير بالرنين المغناطيسي', description:'High-resolution imaging, without radiation.', arDescription:'تصوير عالي الدقة دون استخدام الإشعاع.', price:3200, rating:4.9, reviews:107, icon:'scan', category:'scans', preparation:'Remove metal items; fasting may apply.', arPreparation:'إزالة المعادن؛ قد يتطلب الصيام.', duration:'30–60 min', clinic:'Advanced Imaging', arClinic:'مركز التصوير المتقدم', specialist:'Dr. Karim Nassar', arSpecialist:'د. كريم نصار' },
  { id:'ct', name:'128-slice CT scan', arName:'أشعة مقطعية ١٢٨ شريحة', description:'Fast, detailed cross-sectional imaging.', arDescription:'تصوير مقطعي سريع ودقيق.', price:2800, rating:4.8, reviews:75, icon:'scan', category:'scans', preparation:'Bring previous scans if available.', arPreparation:'أحضر صور الأشعة السابقة إن وجدت.', duration:'15–25 min', clinic:'Advanced Imaging', arClinic:'مركز التصوير المتقدم', specialist:'Dr. Dina Roshdy', arSpecialist:'د. دينا رشدي' },
  { id:'xray', name:'Digital X-ray', arName:'أشعة سينية رقمية', description:'Clear digital imaging for confident diagnosis.', arDescription:'تصوير رقمي واضح يساعد في تشخيص موثوق.', price:950, rating:4.7, reviews:93, icon:'scan', category:'scans', preparation:'No preparation needed.', arPreparation:'لا يتطلب تجهيز.', duration:'10–15 min', clinic:'Radiology Wing', arClinic:'جناح الأشعة', specialist:'Dr. Dina Roshdy', arSpecialist:'د. دينا رشدي' },
  { id:'mammography', name:'3D mammography', arName:'تصوير الثدي ثلاثي الأبعاد', description:'Advanced breast screening with clear images.', arDescription:'فحص متقدم للثدي بصور واضحة ومفصلة.', price:1800, rating:4.9, reviews:61, icon:'scan', category:'scans', preparation:'Schedule outside your menstrual period if possible.', arPreparation:'يفضل تحديد الموعد خارج فترة الدورة الشهرية.', duration:'20 min', clinic:'Women’s Imaging Center', arClinic:'مركز تصوير المرأة', specialist:'Dr. Dina Roshdy', arSpecialist:'د. دينا رشدي' },
  { id:'laparoscopy', name:'Laparoscopy', arName:'جراحة المناظير', description:'Minimally invasive surgical exploration and repair.', arDescription:'جراحة طفيفة التوغل لاستكشاف وعلاج الحالة.', price:18000, rating:4.8, reviews:39, icon:'surgery', category:'surgery', preparation:'Pre-operative consultation required.', arPreparation:'يتطلب استشارة قبل الجراحة.', duration:'1–2 hours', clinic:'Surgical Center', arClinic:'مركز الجراحة', specialist:'Dr. Hadi Mansour', arSpecialist:'د. هادي منصور' },
  { id:'joint-replacement', name:'Joint replacement', arName:'استبدال المفاصل', description:'Modern techniques to restore mobility and comfort.', arDescription:'تقنيات حديثة لاستعادة الحركة والراحة.', price:42000, rating:4.9, reviews:48, icon:'surgery', category:'surgery', preparation:'Medical evaluation and imaging required.', arPreparation:'تقييم طبي وصور تشخيصية مطلوبة.', duration:'2–4 hours', clinic:'Orthopedic Suite', arClinic:'جناح العظام', specialist:'Dr. Layla Hassan', arSpecialist:'د. ليلى حسن' },
  { id:'heart-surgery', name:'Open-heart surgery', arName:'جراحة القلب المفتوح', description:'Advanced cardiac procedures with coordinated follow-up.', arDescription:'إجراءات قلبية متقدمة مع متابعة متكاملة.', price:78000, rating:4.9, reviews:34, icon:'surgery', category:'surgery', preparation:'Detailed cardiac review required.', arPreparation:'يتطلب مراجعة قلبية متكاملة.', duration:'3–6 hours', clinic:'Cardiac Unit', arClinic:'وحدة القلب', specialist:'Dr. Anya Sharma', arSpecialist:'د. أنيا شارما' },
  { id:'neurosurgery', name:'Neurosurgery', arName:'جراحة الأعصاب', description:'Specialist brain and spine procedures with coordinated recovery.', arDescription:'عمليات متخصصة للدماغ والعمود الفقري مع رعاية متكاملة للتعافي.', price:95000, rating:4.8, reviews:27, icon:'surgery', category:'surgery', preparation:'Surgeon consultation and pre-operative assessment required.', arPreparation:'يتطلب استشارة الجراح وتقييماً قبل العملية.', duration:'3–6 hours', clinic:'Neurology & Spine Center', arClinic:'مركز الأعصاب والعمود الفقري', specialist:'Dr. Karim Nassar', arSpecialist:'د. كريم نصار' }
];

DOCTORS.forEach(doctor => {
  doctor.name_en = doctor.name;
  doctor.name_ar = doctor.arName;
  doctor.specialty_en = doctor.specialty;
  doctor.specialty_ar = doctor.arSpecialty;
  doctor.title_en = doctor.title;
  doctor.title_ar = doctor.arTitle;
  doctor.bio_en = doctor.bio;
  doctor.bio_ar = doctor.arBio;
  doctor.price = `${Number(doctor.fee).toLocaleString('en-US')} EGP`;
});

SERVICES.forEach(service => {
  service.priceValue = Number(service.price);
  service.name_en = service.name;
  service.name_ar = service.arName;
  service.description_en = service.description;
  service.description_ar = service.arDescription;
  service.price = `${service.priceValue.toLocaleString('en-US')} EGP`;
});

const PATIENT_MEDICAL_RECORDS = [
  { id:'patient-1001', name:'Mariam Hassan', age:34, bloodType:'A+', allergies:'Penicillin', conditions:'Migraine; iron deficiency', medications:'Sumatriptan as needed; iron supplement', lastVisit:'2026-10-18' },
  { id:'patient-1002', name:'Youssef Adel', age:12, bloodType:'O+', allergies:'Peanuts', conditions:'Seasonal asthma', medications:'Salbutamol inhaler as needed', lastVisit:'2026-10-14' },
  { id:'patient-1003', name:'Nadia Farouk', age:62, bloodType:'B-', allergies:'None recorded', conditions:'Hypertension; type 2 diabetes', medications:'Amlodipine; metformin', lastVisit:'2026-10-09' },
  { id:'patient-1004', name:'Omar Nabil', age:47, bloodType:'AB+', allergies:'Latex', conditions:'Knee osteoarthritis', medications:'Paracetamol as needed', lastVisit:'2026-10-02' }
];

const PATIENT_UPCOMING_VISITS = [
  { id:'visit-1001', patientId:'patient-1001', patient:'Mariam Hassan', date:'2026-10-27', time:'10:30', doctor:'Dr. Lina Hassan', reason:'Migraine follow-up' },
  { id:'visit-1002', patientId:'patient-1002', patient:'Youssef Adel', date:'2026-10-28', time:'12:00', doctor:'Dr. Omar Farouk', reason:'Asthma review' },
  { id:'visit-1003', patientId:'patient-1003', patient:'Nadia Farouk', date:'2026-10-30', time:'09:00', doctor:'Dr. Anya Sharma', reason:'Blood pressure and cardiac review' }
];

const PATIENT_ASSIGNED_DOCTORS = [
  { id:'assignment-1', doctor:'Dr. Lina Hassan', specialty:'Neurology', patientCount:1, nextVisit:'2026-10-27' },
  { id:'assignment-2', doctor:'Dr. Omar Farouk', specialty:'Pediatrics', patientCount:1, nextVisit:'2026-10-28' },
  { id:'assignment-3', doctor:'Dr. Anya Sharma', specialty:'Cardiology', patientCount:1, nextVisit:'2026-10-30' },
  { id:'assignment-4', doctor:'Dr. Layla Hassan', specialty:'Orthopedics', patientCount:1, nextVisit:'2026-11-03' }
];

const PATIENT_ADMISSION_LOGS = [
  { id:'admission-1', patientId:'patient-1003', patient:'Nadia Farouk', admitted:'2026-08-12', discharged:'2026-08-14', department:'Cardiology', outcome:'Stable; outpatient follow-up arranged' },
  { id:'admission-2', patientId:'patient-1004', patient:'Omar Nabil', admitted:'2026-06-03', discharged:'2026-06-05', department:'Orthopedics', outcome:'Recovered; physiotherapy recommended' },
  { id:'admission-3', patientId:'patient-1001', patient:'Mariam Hassan', admitted:'2025-11-20', discharged:'2025-11-21', department:'Neurology', outcome:'Discharged with medication plan' }
];
