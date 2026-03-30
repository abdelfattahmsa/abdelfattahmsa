/* ============================================
   ABDELFATTAH M. — Site Engine
   Theme · i18n · Blog · Animations · Navigation
   ============================================ */

'use strict';

// ==========================================
// INTERNATIONALIZATION (i18n)
// ==========================================
const i18n = {
  en: {
    // Nav
    'nav.name': 'Abdelfattah M.',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.portfolio': 'Portfolio',
    'nav.research': 'Research',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',

    // Theme names
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'theme.peridot': 'Peridot',
    'theme.ocean': 'Ocean',
    'theme.warm': 'Warm',

    // Hero
    'hero.tag': 'Available for Opportunities',
    'hero.name': 'Abdelfattah M. S.<br>Aboulfoutoh',
    'hero.desc': 'Project Controls Engineer at PGESCO with 1.5+ years of mega-project experience across Egypt. Civil Engineering graduate from the German University in Cairo, currently completing an MSc in Project Management at Liverpool John Moores University. Founder of Kyberia Tech — a creative technology studio.',
    'hero.cta': 'Get in Touch',
    'hero.cta2': 'View Work',
    'hero.scroll': 'Scroll',

    // About
    'about.label': 'Who I Am',
    'about.title': 'About Me',
    'about.subtitle': 'Civil Engineer · Project Controls · Technology Founder',
    'about.p1': "I'm a Civil Engineering graduate from the German University in Cairo (2022) with a passion for project controls, emerging technologies, and building meaningful digital experiences. My bachelor's project — a comparison of structural systems for an elevated monorail — earned an Excellent grade and was published in the IEEE Smart Cities Journal.",
    'about.p2': "Currently, I serve as a Project Controls Engineer at PGESCO, one of Egypt's leading engineering consultancies under the Hassan Allam group, where I oversee scheduling, cost baselines, and stakeholder engagement on billion-pound mega-projects. I'm completing my MSc in Project Management at Liverpool John Moores University (expected 2026) and working towards RICS chartered status.",
    'about.p3': 'Beyond engineering, I founded Kyberia Tech — a creative technology studio spanning web development, digital products, and future cybersecurity services. With 10+ years of web development experience since 2014, I bridge the gap between engineering discipline and creative technology.',
    'about.stat1': 'Years in Dev',
    'about.stat2': 'Projects',
    'about.stat3': 'Years in PC',

    // Services
    'service.pc': 'Project Controls',
    'service.pc.desc': 'Planning, cost management, schedule monitoring & stakeholder reporting on mega-projects.',
    'service.web': 'Web Development',
    'service.web.desc': 'Full-stack websites, LMS platforms, and custom digital solutions since 2014.',
    'service.eng': 'Civil Engineering',
    'service.eng.desc': 'Structural analysis, site management, and quality control across large-scale projects.',
    'service.tech': 'Tech & Innovation',
    'service.tech.desc': 'AI decision-support tools, data analytics, and creative technology ventures.',

    // Experience
    'exp.label': 'Career Path',
    'exp.title': 'Experience & Education',
    'exp.work': 'Work',
    'exp.education': 'Education',
    'exp.certs': 'Certifications',

    // Work entries
    'work.pgesco2.role': 'Project Controls Engineer & Associate Site Manager',
    'work.pgesco2.desc': '1.2+ billion EGP project for Hassan Allam Utilities / A.P. Møller. Luxor, Egypt.',
    'work.pgesco2.t1': 'Daily, weekly & monthly progress reporting',
    'work.pgesco2.t2': 'Schedule & cost baseline monitoring (Primavera P6)',
    'work.pgesco2.t3': 'Stakeholder management & contract enforcement',
    'work.pgesco2.t4': 'Engineering works oversight & claim analysis',
    'work.pgesco2.t5': 'Acting as Associate Site Manager — construction follow-up, QA/QC, steel structure inspections',
    'work.pgesco1.role': 'Project Control Engineer',
    'work.pgesco1.desc': '2+ billion EGP logistics park on Suez Road, Cairo. Tenants: Amazon, PepsiCo, Jumia, Haier.',
    'work.pgesco1.t1': 'Baseline schedule & cost monitoring',
    'work.pgesco1.t2': 'Primavera P6, Unifier & Oracle ERP',
    'work.pgesco1.t3': 'Stakeholder alignment on scope, strategy & contracts',
    'work.rme.role': 'Cost & Planning Engineer',
    'work.rme.desc': '100+ million USD container terminal project. Damietta, Egypt.',
    'work.rme.t1': 'Baseline schedule & cost baseline development',
    'work.rme.t2': 'Daily & monthly site progress reporting',
    'work.rme.t3': 'Project execution plan support using P6, Unifier & Oracle ERP',
    'work.ccc.role': 'Site Engineer',
    'work.ccc.desc': '2 billion EGP expansion for Al-Futtaim Group. New Cairo, Egypt.',
    'work.ccc.t1': 'Finishes works oversight — blockwork, plastering, flooring & cladding',
    'work.ccc.t2': 'Excavation, soil replacement & concrete pouring',
    'work.ecg.role': 'Civil Engineering Intern',
    'work.ecg.t1': 'Prestressed slab testing & structural element checking',
    'work.ecg.t2': 'Contractor and sub-contractor work review',
    'work.ha.role': 'Civil Engineering Intern',
    'work.ha.t1': 'Workshop & as-built drawings, quantity surveying',
    'work.ha.t2': 'Structural element design & scheduling basics',
    'work.freelance.role': 'Freelance Developer & Designer',
    'work.freelance.company': 'Self-employed — Global Clients',
    'work.freelance.desc': '15+ completed projects for clients across Egypt, Saudi Arabia, Australia, USA & Europe. WordPress, React, custom coded sites, and LMS platforms.',

    // Education
    'edu.ljmu': 'Via UNICAF Scholarship. Research methods, quantitative techniques, and project management theory.',
    'edu.guc.name': 'German University in Cairo (GUC)',
    'edu.guc': 'Bachelor\'s project: "Comparison between Structural Systems for an Elevated Monorail" — Excellent grade. Published in IEEE Smart Cities Journal.',
    'cert.label': 'PROFESSIONAL CERTIFICATIONS',
    'cert.provider': 'Professional Certification',

    // Portfolio
    'portfolio.label': 'Selected Work',
    'portfolio.title': 'Portfolio',
    'portfolio.subtitle': 'A selection of projects across technology, creative ventures, and engineering.',
    'filter.all': 'All',
    'filter.kyberia': 'Kyberia Ecosystem',
    'filter.web': 'Web Development',
    'filter.engineering': 'Engineering',
    'tag.flagship': 'Flagship',
    'tag.current': 'Current',
    'project.peridot.desc': 'A comprehensive creative technology platform — the centerpiece of the Kyberia ecosystem. Designed to power digital experiences, product launches, and creative workflows.',
    'project.kyberia.desc': 'Creative agency & holding company. Parent to Kyberia Labs (tech lab & cybersecurity) and Kyberia Studio (digital art & game design).',
    'project.labs.desc': 'Tech lab focused on building new digital services and products. Future focus on cybersecurity & networking solutions.',
    'project.luxor.title': 'Luxor Strategic Warehouse — ITDA',
    'project.luxor.desc': '1.2+ billion EGP warehouse project in Luxor for Hassan Allam Utilities / A.P. Møller. Project controls & associate site management.',
    'project.eclp.title': 'East Cairo Flex Park (ECLP)',
    'project.eclp.desc': '2+ billion EGP logistics park on Suez Road, Cairo. Tenants include Amazon, PepsiCo, Jumia. Schedule & cost baseline management.',
    'project.damietta.title': 'Damietta Port Container Terminal',
    'project.damietta.desc': '100+ million USD container terminal infrastructure project. Cost baseline development & progress reporting.',
    'project.pioneers.desc': 'Corporate website for Pioneers Middle East — business and consulting firm.',
    'project.gm.desc': 'Bilingual website for a German mediation firm — custom design and development.',
    'project.swim.desc': 'Sports team website — dynamic content, event management, and member profiles.',

    // Research
    'research.label': 'Publications',
    'research.title': 'Research & Publications',
    'research.paper.title': 'Advancement of Decision-Making in Structural Design through Optimization for Monorail Girder Design',
    'research.grade': 'Excellent Grade',
    'research.abstract': 'Developed a weak-AI decision-support software tool for selecting optimal structural systems and materials for elevated monorail structures, considering critical factors such as time and cost. The research compared multiple structural systems and presented an innovative approach to engineering decision-making using artificial intelligence.',
    'research.view': 'View on ResearchGate',

    // Blog
    'blog.label': 'Insights',
    'blog.title': 'Blog',
    'blog.subtitle': 'Thoughts on engineering, technology, and building in the MENA region.',
    'blog.readmore': 'Read more →',

    // Time Capsule
    'capsule.label': 'Time Capsule',
    'capsule.title': 'Website Versions',
    'capsule.subtitle': 'A look back at previous iterations of this site.',
    'capsule.v3.title': 'The Redesign — Multi-Theme & Multilingual',
    'capsule.v3.desc': 'Complete rebuild. 5 themes, Arabic support, built-in blog, time capsule, scroll animations. Focused on Kyberia ecosystem and engineering portfolio.',
    'capsule.current': '← You are here',
    'capsule.v2.title': 'Dark Portfolio — SPA with Theme Toggle',
    'capsule.v2.desc': 'Vanilla HTML/CSS/JS single-page portfolio. Dark/light toggle, sidebar layout, client testimonials, and project gallery. Poppins font, ionicons.',
    'capsule.view': 'View Archive',
    'capsule.v1.title': 'First Portfolio — Simple Landing Page',
    'capsule.v1.desc': 'Initial personal site built during university. Basic layout showcasing education and early freelancing work.',

    // Contact
    'contact.label': "Let's Connect",
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Open to opportunities, collaborations, and interesting conversations.',
    'contact.email': 'Email',
    'contact.location': 'Location',
    'contact.city': 'Cairo, Egypt',
    'contact.status': 'Status',
    'contact.status.value': 'Open to opportunities & freelance work',
    'form.name': 'Full Name',
    'form.email': 'Email Address',
    'form.subject': 'Subject',
    'form.message': 'Your Message',
    'form.send': 'Send Message',

    // Footer
    'footer.rights': 'All rights reserved.',

    // Typing
    'typing': [
      'Project Controls Engineer',
      'Civil Engineer · BSc GUC',
      'MSc Project Management · LJMU',
      'Founder @ Kyberia Tech',
      'IEEE Published Researcher',
      'Web Developer Since 2014'
    ]
  },

  ar: {
    // Nav
    'nav.name': 'عبدالفتاح م.',
    'nav.about': 'نبذة عني',
    'nav.experience': 'الخبرات',
    'nav.portfolio': 'الأعمال',
    'nav.research': 'الأبحاث',
    'nav.blog': 'المدونة',
    'nav.contact': 'تواصل',

    // Theme names
    'theme.dark': 'داكن',
    'theme.light': 'فاتح',
    'theme.peridot': 'زبرجد',
    'theme.ocean': 'محيط',
    'theme.warm': 'دافئ',

    // Hero
    'hero.tag': 'متاح للفرص الجديدة',
    'hero.name': 'عبدالفتاح محمد صبحي<br>أبوالفتوح',
    'hero.desc': 'مهندس التحكم في المشاريع في بجيسكو مع أكثر من ١.٥ عام من الخبرة في المشاريع الكبرى عبر مصر. خريج هندسة مدنية من الجامعة الألمانية بالقاهرة، حاليًا أكمل ماجستير إدارة المشاريع في جامعة ليفربول جون موريس. مؤسس Kyberia Tech — استوديو تكنولوجيا إبداعية.',
    'hero.cta': 'تواصل معي',
    'hero.cta2': 'عرض الأعمال',
    'hero.scroll': 'انزل',

    // About
    'about.label': 'من أنا',
    'about.title': 'نبذة عني',
    'about.subtitle': 'مهندس مدني · التحكم في المشاريع · مؤسس تكنولوجيا',
    'about.p1': 'أنا خريج هندسة مدنية من الجامعة الألمانية بالقاهرة (٢٠٢٢) مع شغف بالتحكم في المشاريع والتقنيات الناشئة وبناء تجارب رقمية ذات معنى. مشروع البكالوريوس الخاص بي — مقارنة بين الأنظمة الإنشائية للمونوريل المرتفع — حصل على تقدير ممتاز ونُشر في مجلة IEEE للمدن الذكية.',
    'about.p2': 'حاليًا، أعمل كمهندس تحكم مشاريع في بجيسكو، إحدى أكبر الشركات الاستشارية الهندسية في مصر ضمن مجموعة حسن علام، حيث أشرف على الجدولة وخطوط الأساس للتكلفة وإدارة أصحاب المصلحة في مشاريع ضخمة بالمليارات. أنهي حاليًا ماجستير إدارة المشاريع في جامعة ليفربول جون موريس (متوقع ٢٠٢٦) وأعمل على الحصول على عضوية RICS.',
    'about.p3': 'بجانب الهندسة، أسست Kyberia Tech — استوديو تكنولوجيا إبداعية يشمل تطوير الويب والمنتجات الرقمية وخدمات الأمن السيبراني المستقبلية. مع أكثر من ١٠ سنوات من الخبرة في تطوير الويب منذ ٢٠١٤، أربط بين الانضباط الهندسي والتكنولوجيا الإبداعية.',
    'about.stat1': 'سنوات تطوير',
    'about.stat2': 'مشاريع',
    'about.stat3': 'سنوات PC',

    // Services
    'service.pc': 'التحكم في المشاريع',
    'service.pc.desc': 'التخطيط وإدارة التكاليف ومراقبة الجداول الزمنية وإعداد التقارير لأصحاب المصلحة في المشاريع الكبرى.',
    'service.web': 'تطوير الويب',
    'service.web.desc': 'مواقع متكاملة ومنصات تعليمية وحلول رقمية مخصصة منذ ٢٠١٤.',
    'service.eng': 'الهندسة المدنية',
    'service.eng.desc': 'التحليل الإنشائي وإدارة الموقع وضبط الجودة عبر مشاريع واسعة النطاق.',
    'service.tech': 'التكنولوجيا والابتكار',
    'service.tech.desc': 'أدوات دعم القرار بالذكاء الاصطناعي وتحليل البيانات ومشاريع التكنولوجيا الإبداعية.',

    // Experience
    'exp.label': 'المسار المهني',
    'exp.title': 'الخبرات والتعليم',
    'exp.work': 'العمل',
    'exp.education': 'التعليم',
    'exp.certs': 'الشهادات',

    // Work
    'work.pgesco2.role': 'مهندس تحكم مشاريع ومدير موقع مساعد',
    'work.pgesco2.desc': 'مشروع بأكثر من ١.٢ مليار جنيه لحسن علام / أ.ب. مولر. الأقصر، مصر.',
    'work.pgesco2.t1': 'إعداد تقارير التقدم اليومية والأسبوعية والشهرية',
    'work.pgesco2.t2': 'مراقبة الجدول الزمني وخط أساس التكلفة (Primavera P6)',
    'work.pgesco2.t3': 'إدارة أصحاب المصلحة وإنفاذ العقود',
    'work.pgesco2.t4': 'الإشراف على الأعمال الهندسية وتحليل المطالبات',
    'work.pgesco2.t5': 'العمل كمدير موقع مساعد — متابعة البناء وضبط الجودة وفحص الهياكل المعدنية',
    'work.pgesco1.role': 'مهندس تحكم مشاريع',
    'work.pgesco1.desc': 'حديقة لوجستية بأكثر من ٢ مليار جنيه على طريق السويس، القاهرة. المستأجرون: أمازون، بيبسيكو، جوميا، هاير.',
    'work.pgesco1.t1': 'مراقبة الجدول الزمني والتكلفة',
    'work.pgesco1.t2': 'Primavera P6 و Unifier و Oracle ERP',
    'work.pgesco1.t3': 'مواءمة أصحاب المصلحة على النطاق والاستراتيجية والعقود',
    'work.rme.role': 'مهندس تكاليف وتخطيط',
    'work.rme.desc': 'مشروع محطة حاويات بأكثر من ١٠٠ مليون دولار. دمياط، مصر.',
    'work.rme.t1': 'تطوير الجدول الزمني وخط أساس التكلفة',
    'work.rme.t2': 'إعداد تقارير التقدم اليومية والشهرية',
    'work.rme.t3': 'دعم خطة تنفيذ المشروع باستخدام P6 و Unifier و Oracle ERP',
    'work.ccc.role': 'مهندس موقع',
    'work.ccc.desc': 'توسعة بملياري جنيه لمجموعة الفطيم. القاهرة الجديدة، مصر.',
    'work.ccc.t1': 'الإشراف على أعمال التشطيبات — المباني والمحارة والأرضيات والتكسيات',
    'work.ccc.t2': 'أعمال الحفر واستبدال التربة وصب الخرسانة',
    'work.ecg.role': 'متدرب هندسة مدنية',
    'work.ecg.t1': 'اختبار الأسقف سابقة الإجهاد وفحص العناصر الإنشائية',
    'work.ecg.t2': 'مراجعة أعمال المقاول والمقاولين الفرعيين',
    'work.ha.role': 'متدرب هندسة مدنية',
    'work.ha.t1': 'رسومات الورشة والرسومات التنفيذية وحصر الكميات',
    'work.ha.t2': 'تصميم العناصر الإنشائية وأساسيات الجدولة',
    'work.freelance.role': 'مطور ومصمم مستقل',
    'work.freelance.company': 'عمل حر — عملاء عالميون',
    'work.freelance.desc': 'أكثر من ١٥ مشروع مكتمل لعملاء في مصر والسعودية وأستراليا والولايات المتحدة وأوروبا. ووردبريس وReact ومواقع مبرمجة ومنصات تعليمية.',

    // Education
    'edu.ljmu': 'عبر منحة يونيكاف. مناهج البحث والتقنيات الكمية ونظرية إدارة المشاريع.',
    'edu.guc.name': 'الجامعة الألمانية بالقاهرة (GUC)',
    'edu.guc': 'مشروع البكالوريوس: "مقارنة بين الأنظمة الإنشائية للمونوريل المرتفع" — تقدير ممتاز. نُشر في مجلة IEEE للمدن الذكية.',
    'cert.label': 'شهادات مهنية',
    'cert.provider': 'شهادة مهنية',

    // Portfolio
    'portfolio.label': 'أعمال مختارة',
    'portfolio.title': 'الأعمال',
    'portfolio.subtitle': 'مجموعة مختارة من المشاريع في التكنولوجيا والمشاريع الإبداعية والهندسة.',
    'filter.all': 'الكل',
    'filter.kyberia': 'منظومة Kyberia',
    'filter.web': 'تطوير الويب',
    'filter.engineering': 'الهندسة',
    'tag.flagship': 'رئيسي',
    'tag.current': 'حالي',
    'project.peridot.desc': 'منصة تكنولوجيا إبداعية شاملة — محور منظومة Kyberia. مصممة لدعم التجارب الرقمية وإطلاق المنتجات وسير العمل الإبداعي.',
    'project.kyberia.desc': 'وكالة إبداعية وشركة قابضة. تضم Kyberia Labs (مختبر تقني وأمن سيبراني) و Kyberia Studio (فن رقمي وتصميم ألعاب).',
    'project.labs.desc': 'مختبر تقني يركز على بناء خدمات ومنتجات رقمية جديدة. التركيز المستقبلي على حلول الأمن السيبراني والشبكات.',
    'project.luxor.title': 'مستودع الأقصر الاستراتيجي — ITDA',
    'project.luxor.desc': 'مشروع مستودع بأكثر من ١.٢ مليار جنيه في الأقصر لحسن علام / أ.ب. مولر. التحكم في المشاريع وإدارة الموقع.',
    'project.eclp.title': 'إيست كايرو فليكس بارك (ECLP)',
    'project.eclp.desc': 'حديقة لوجستية بأكثر من ٢ مليار جنيه على طريق السويس، القاهرة. يشمل أمازون وبيبسيكو وجوميا. إدارة الجدول الزمني والتكلفة.',
    'project.damietta.title': 'محطة حاويات ميناء دمياط',
    'project.damietta.desc': 'مشروع بنية تحتية لمحطة حاويات بأكثر من ١٠٠ مليون دولار. تطوير خط أساس التكلفة وإعداد تقارير التقدم.',
    'project.pioneers.desc': 'موقع شركة Pioneers Middle East — شركة أعمال واستشارات.',
    'project.gm.desc': 'موقع ثنائي اللغة لشركة وساطة ألمانية — تصميم وتطوير مخصص.',
    'project.swim.desc': 'موقع فريق رياضي — محتوى ديناميكي وإدارة فعاليات وملفات الأعضاء.',

    // Research
    'research.label': 'المنشورات',
    'research.title': 'الأبحاث والمنشورات',
    'research.paper.title': 'تطوير صنع القرار في التصميم الإنشائي من خلال التحسين لتصميم عوارض المونوريل',
    'research.grade': 'تقدير ممتاز',
    'research.abstract': 'تطوير أداة برمجية لدعم القرار بالذكاء الاصطناعي الضعيف لاختيار الأنظمة الإنشائية والمواد المثلى لهياكل المونوريل المرتفعة، مع مراعاة عوامل حرجة مثل الوقت والتكلفة. قارن البحث بين أنظمة إنشائية متعددة وقدم نهجًا مبتكرًا لصنع القرار الهندسي باستخدام الذكاء الاصطناعي.',
    'research.view': 'عرض على ResearchGate',

    // Blog
    'blog.label': 'رؤى',
    'blog.title': 'المدونة',
    'blog.subtitle': 'أفكار حول الهندسة والتكنولوجيا والبناء في منطقة الشرق الأوسط وشمال أفريقيا.',
    'blog.readmore': 'اقرأ المزيد ←',

    // Time Capsule
    'capsule.label': 'كبسولة الزمن',
    'capsule.title': 'إصدارات الموقع',
    'capsule.subtitle': 'نظرة على الإصدارات السابقة لهذا الموقع.',
    'capsule.v3.title': 'إعادة التصميم — متعدد السمات ومتعدد اللغات',
    'capsule.v3.desc': 'إعادة بناء كاملة. ٥ سمات ودعم العربية ومدونة مدمجة وكبسولة زمن ورسوم متحركة. التركيز على منظومة Kyberia ومحفظة الهندسة.',
    'capsule.current': '← أنت هنا',
    'capsule.v2.title': 'محفظة داكنة — SPA مع تبديل السمة',
    'capsule.v2.desc': 'محفظة صفحة واحدة بـ HTML/CSS/JS. تبديل داكن/فاتح وتخطيط جانبي وشهادات عملاء ومعرض مشاريع.',
    'capsule.view': 'عرض الأرشيف',
    'capsule.v1.title': 'أول محفظة — صفحة هبوط بسيطة',
    'capsule.v1.desc': 'أول موقع شخصي تم بناؤه أثناء الجامعة. تخطيط بسيط يعرض التعليم وأعمال العمل الحر المبكرة.',

    // Contact
    'contact.label': 'تواصل معي',
    'contact.title': 'تواصل معي',
    'contact.subtitle': 'منفتح على الفرص والتعاون والمحادثات المثيرة.',
    'contact.email': 'البريد الإلكتروني',
    'contact.location': 'الموقع',
    'contact.city': 'القاهرة، مصر',
    'contact.status': 'الحالة',
    'contact.status.value': 'متاح للفرص والعمل الحر',
    'form.name': 'الاسم الكامل',
    'form.email': 'البريد الإلكتروني',
    'form.subject': 'الموضوع',
    'form.message': 'رسالتك',
    'form.send': 'إرسال الرسالة',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة.',

    // Typing
    'typing': [
      'مهندس التحكم في المشاريع',
      'مهندس مدني · بكالوريوس GUC',
      'ماجستير إدارة المشاريع · LJMU',
      'مؤسس Kyberia Tech',
      'باحث منشور في IEEE',
      'مطور ويب منذ ٢٠١٤'
    ]
  }
};

// ==========================================
// BLOG DATA
// ==========================================
const blogPosts = [
  {
    id: 'mega-projects-egypt',
    date: '2026-03-15',
    tags: ['Engineering', 'Project Controls'],
    title: {
      en: 'What I Learned from Billion-Pound Mega-Projects in Egypt',
      ar: 'ما تعلمته من المشاريع الضخمة بالمليارات في مصر'
    },
    excerpt: {
      en: 'From logistics parks to strategic warehouses — reflections on stakeholder management, Primavera P6, and the reality of mega-project delivery in Egypt.',
      ar: 'من الحدائق اللوجستية إلى المستودعات الاستراتيجية — تأملات حول إدارة أصحاب المصلحة وPrimavera P6 وواقع تسليم المشاريع الضخمة في مصر.'
    },
    body: {
      en: `<p>Over the past year and a half, I've had the privilege of working on some of Egypt's most significant infrastructure projects — from the East Cairo Flex Park (a 2+ billion EGP logistics hub with tenants like Amazon and PepsiCo) to the Luxor Strategic Warehouse for ITDA.</p>
<h3>The Reality of Project Controls</h3>
<p>Project controls on mega-projects isn't just about tracking schedules. It's about understanding the complex web of stakeholders, managing expectations across international partnerships (like A.P. Møller), and translating raw data into actionable insights.</p>
<h3>Key Takeaways</h3>
<ul>
<li>Primavera P6 is your foundation, but Oracle ERP and Unifier complete the picture</li>
<li>Daily reporting discipline prevents weekly surprises</li>
<li>Contract enforcement isn't adversarial — it's about clarity</li>
<li>Stakeholder alignment saves more time than any scheduling tool</li>
</ul>
<p>These projects have taught me that engineering excellence is necessary but insufficient. What separates successful mega-projects from troubled ones is the quality of communication, the rigor of controls, and the willingness to address problems early.</p>`,
      ar: `<p>على مدار العام والنصف الماضيين، حظيت بشرف العمل في بعض أهم مشاريع البنية التحتية في مصر — من إيست كايرو فليكس بارك (مركز لوجستي بأكثر من ٢ مليار جنيه بمستأجرين مثل أمازون وبيبسيكو) إلى مستودع الأقصر الاستراتيجي لـ ITDA.</p>
<h3>واقع التحكم في المشاريع</h3>
<p>التحكم في المشاريع الضخمة ليس مجرد تتبع الجداول الزمنية. إنه فهم الشبكة المعقدة لأصحاب المصلحة وإدارة التوقعات عبر الشراكات الدولية وترجمة البيانات الخام إلى رؤى قابلة للتنفيذ.</p>
<h3>أهم الدروس</h3>
<ul>
<li>Primavera P6 هو الأساس، لكن Oracle ERP و Unifier يكملان الصورة</li>
<li>الانضباط في التقارير اليومية يمنع المفاجآت الأسبوعية</li>
<li>إنفاذ العقود ليس عدائيًا — إنه يتعلق بالوضوح</li>
<li>مواءمة أصحاب المصلحة توفر وقتًا أكثر من أي أداة جدولة</li>
</ul>
<p>علمتني هذه المشاريع أن التميز الهندسي ضروري لكنه غير كافٍ. ما يفصل المشاريع الضخمة الناجحة عن المتعثرة هو جودة التواصل ودقة الضوابط والاستعداد لمعالجة المشكلات مبكرًا.</p>`
    }
  },
  {
    id: 'kyberia-vision',
    date: '2026-02-20',
    tags: ['Kyberia', 'Startup'],
    title: {
      en: 'Why I\'m Building Kyberia Tech',
      ar: 'لماذا أبني Kyberia Tech'
    },
    excerpt: {
      en: 'The story behind Kyberia Tech — from freelancing since 2014 to building a structured creative technology venture with labs, studio, and a vision for MENA.',
      ar: 'القصة وراء Kyberia Tech — من العمل الحر منذ ٢٠١٤ إلى بناء مشروع تكنولوجيا إبداعية منظم مع مختبرات واستوديو ورؤية لمنطقة الشرق الأوسط.'
    },
    body: {
      en: `<p>I've been building websites since 2014. Across 15+ projects for clients in Egypt, Saudi Arabia, Australia, the USA, and Europe, I've learned that freelancing alone doesn't scale. That's why I'm building Kyberia Tech.</p>
<h3>The Structure</h3>
<p>Kyberia Tech isn't just another agency. It's a holding company with three focused arms:</p>
<ul>
<li><strong>Kyberia Tech</strong> — The parent creative agency handling client projects and brand strategy</li>
<li><strong>Kyberia Labs</strong> — A tech lab building digital products, with future focus on cybersecurity and networking</li>
<li><strong>Kyberia Studio</strong> — Digital art, game design, and creative experimentation</li>
</ul>
<h3>Why Now?</h3>
<p>The MENA region is experiencing a massive digital transformation. With my dual background in engineering and technology, I see opportunities that pure developers or pure engineers might miss. Kyberia is built to operate at that intersection.</p>`,
      ar: `<p>أبني مواقع الويب منذ ٢٠١٤. عبر أكثر من ١٥ مشروعًا لعملاء في مصر والسعودية وأستراليا والولايات المتحدة وأوروبا، تعلمت أن العمل الحر وحده لا يتوسع. لهذا أبني Kyberia Tech.</p>
<h3>الهيكل</h3>
<p>Kyberia Tech ليست مجرد وكالة أخرى. إنها شركة قابضة بثلاثة أذرع مركزة:</p>
<ul>
<li><strong>Kyberia Tech</strong> — الوكالة الإبداعية الأم التي تتعامل مع مشاريع العملاء واستراتيجية العلامة التجارية</li>
<li><strong>Kyberia Labs</strong> — مختبر تقني يبني منتجات رقمية مع التركيز المستقبلي على الأمن السيبراني والشبكات</li>
<li><strong>Kyberia Studio</strong> — الفن الرقمي وتصميم الألعاب والتجريب الإبداعي</li>
</ul>
<h3>لماذا الآن؟</h3>
<p>تشهد منطقة الشرق الأوسط وشمال أفريقيا تحولًا رقميًا هائلاً. مع خلفيتي المزدوجة في الهندسة والتكنولوجيا، أرى فرصًا قد لا يراها المطورون البحتون أو المهندسون البحتون. Kyberia مبنية للعمل عند هذا التقاطع.</p>`
    }
  },
  {
    id: 'ai-engineering-decisions',
    date: '2026-01-10',
    tags: ['AI', 'Research'],
    title: {
      en: 'Using AI for Engineering Decision-Making — My IEEE Research',
      ar: 'استخدام الذكاء الاصطناعي في صنع القرار الهندسي — بحثي في IEEE'
    },
    excerpt: {
      en: 'How I developed a weak-AI decision-support tool for monorail structural systems as part of my bachelor\'s project at GUC.',
      ar: 'كيف طورت أداة دعم قرار بالذكاء الاصطناعي الضعيف لأنظمة المونوريل الإنشائية كجزء من مشروع البكالوريوس في GUC.'
    },
    body: {
      en: `<p>My bachelor's project at the German University in Cairo wasn't just an academic exercise — it was an attempt to bring AI into practical engineering decision-making.</p>
<h3>The Problem</h3>
<p>When designing elevated monorail structures, engineers face complex trade-offs between different structural systems, materials, time, and cost. Traditional approaches rely heavily on experience and intuition.</p>
<h3>The Solution</h3>
<p>I developed a weak-AI decision-support software tool that systematically compares structural systems for elevated monorails, weighing factors like construction time, material costs, and structural performance. The tool doesn't replace the engineer — it augments their decision-making with data-driven insights.</p>
<h3>The Result</h3>
<p>The project earned an Excellent grade, was presented at the Smart Cities Conference 4.0 in 2023, and the accompanying research paper was published in the IEEE Smart Cities Journal. It proved that even "weak AI" — rule-based systems with optimization algorithms — can meaningfully improve engineering outcomes.</p>`,
      ar: `<p>مشروع البكالوريوس في الجامعة الألمانية بالقاهرة لم يكن مجرد تمرين أكاديمي — كان محاولة لإدخال الذكاء الاصطناعي في صنع القرار الهندسي العملي.</p>
<h3>المشكلة</h3>
<p>عند تصميم هياكل المونوريل المرتفعة، يواجه المهندسون مقايضات معقدة بين الأنظمة الإنشائية المختلفة والمواد والوقت والتكلفة. تعتمد الأساليب التقليدية بشكل كبير على الخبرة والحدس.</p>
<h3>الحل</h3>
<p>طورت أداة برمجية لدعم القرار بالذكاء الاصطناعي الضعيف تقارن بشكل منهجي بين الأنظمة الإنشائية للمونوريل المرتفع، مع مراعاة عوامل مثل وقت البناء وتكاليف المواد والأداء الإنشائي. الأداة لا تحل محل المهندس — بل تعزز صنع قراره برؤى مبنية على البيانات.</p>
<h3>النتيجة</h3>
<p>حصل المشروع على تقدير ممتاز وعُرض في مؤتمر المدن الذكية ٤.٠ عام ٢٠٢٣ ونُشرت ورقة البحث المرافقة في مجلة IEEE للمدن الذكية. أثبت أنه حتى "الذكاء الاصطناعي الضعيف" — الأنظمة القائمة على القواعد مع خوارزميات التحسين — يمكن أن يحسن النتائج الهندسية بشكل ملموس.</p>`
    }
  }
];

// ==========================================
// APP STATE
// ==========================================
let currentLang = localStorage.getItem('site-lang') || 'en';
let currentTheme = localStorage.getItem('site-theme') || 'dark';

// ==========================================
// THEME ENGINE
// ==========================================
function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('site-theme', theme);

  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.themeValue === theme);
  });
}

function initTheme() {
  setTheme(currentTheme);

  document.getElementById('themeToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('themeDropdown').classList.toggle('open');
    document.getElementById('langDropdown').classList.remove('open');
  });

  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      setTheme(opt.dataset.themeValue);
      document.getElementById('themeDropdown').classList.remove('open');
    });
  });
}

// ==========================================
// LANGUAGE ENGINE
// ==========================================
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('site-lang', lang);

  const isRTL = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang] && i18n[lang][key]) {
      el.innerHTML = i18n[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang] && i18n[lang][key]) {
      el.placeholder = i18n[lang][key];
    }
  });

  // Update lang button
  document.getElementById('langToggle').textContent = lang.toUpperCase();

  // Update active state
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // Re-render blog
  renderBlog();

  // Restart typing
  startTyping();
}

function initLang() {
  setLang(currentLang);

  document.getElementById('langToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('langDropdown').classList.toggle('open');
    document.getElementById('themeDropdown').classList.remove('open');
  });

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      setLang(opt.dataset.lang);
      document.getElementById('langDropdown').classList.remove('open');
    });
  });
}

// Close dropdowns on outside click
document.addEventListener('click', () => {
  document.getElementById('themeDropdown').classList.remove('open');
  document.getElementById('langDropdown').classList.remove('open');
});

// ==========================================
// TYPING ANIMATION
// ==========================================
let typingTimeout;
function startTyping() {
  const el = document.getElementById('heroTyping');
  if (!el) return;

  clearTimeout(typingTimeout);
  const phrases = i18n[currentLang]['typing'] || i18n['en']['typing'];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    typingTimeout = setTimeout(tick, delay);
  }

  tick();
}

// ==========================================
// NAVIGATION
// ==========================================
function initNav() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links = navLinks.querySelectorAll('a');

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Nav link clicks
  links.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Active section tracking
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-nav') === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });

  sections.forEach(s => observer.observe(s));
}

// ==========================================
// PORTFOLIO FILTERS
// ==========================================
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.hidden = false;
          card.style.display = '';
        } else {
          card.hidden = true;
          card.style.display = 'none';
        }
      });
    });
  });
}

// ==========================================
// EXPERIENCE TABS
// ==========================================
function initExpTabs() {
  const tabs = document.querySelectorAll('.exp-tab');
  const panels = document.querySelectorAll('.exp-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.expTab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-exp-panel="${target}"]`).classList.add('active');
    });
  });
}

// ==========================================
// BLOG ENGINE
// ==========================================
function renderBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = blogPosts.map(post => `
    <article class="blog-card reveal visible" data-blog-id="${post.id}">
      <div class="blog-date">${formatDate(post.date)}</div>
      <h3>${post.title[currentLang] || post.title.en}</h3>
      <p class="blog-excerpt">${post.excerpt[currentLang] || post.excerpt.en}</p>
      <div class="blog-tags">
        ${post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}
      </div>
      <span class="blog-read-more">${i18n[currentLang]['blog.readmore'] || 'Read more →'}</span>
    </article>
  `).join('');

  // Attach click handlers
  grid.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', () => openBlogPost(card.dataset.blogId));
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (currentLang === 'ar') {
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function openBlogPost(id) {
  const post = blogPosts.find(p => p.id === id);
  if (!post) return;

  document.getElementById('blogModalDate').textContent = formatDate(post.date);
  document.getElementById('blogModalTitle').textContent = post.title[currentLang] || post.title.en;
  document.getElementById('blogModalTags').innerHTML = post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
  document.getElementById('blogModalBody').innerHTML = post.body[currentLang] || post.body.en;

  const overlay = document.getElementById('blogModal');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initBlogModal() {
  const overlay = document.getElementById('blogModal');
  const closeBtn = document.getElementById('blogModalClose');

  function closeBlog() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeBlog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBlog();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlog();
  });
}

// ==========================================
// SCROLL REVEAL
// ==========================================
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

// ==========================================
// CONTACT FORM
// ==========================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
    btn.disabled = true;

    // Simulate send (replace with real endpoint)
    setTimeout(() => {
      btn.textContent = currentLang === 'ar' ? 'تم الإرسال!' : 'Sent!';
      btn.style.background = '#22c55e';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }, 1000);
  });
}

// ==========================================
// FOOTER YEAR
// ==========================================
function initFooter() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  initNav();
  initFilters();
  initExpTabs();
  initBlogModal();
  renderBlog();
  initReveal();
  initContactForm();
  initFooter();
  initSmoothScroll();
  startTyping();
});
