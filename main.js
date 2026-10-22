// ============================================================================
// خزانة علوم العترة | جليس الكليني — المحرك البحثي والقارئ الأسطوري (V12 Pro)
// الجزء الأول (1 من 2): إعدادات النظام، الفهارس، التطبيع اللغوي، والرفوف الذكية
// ============================================================================

const MANIFEST_FILES = [
    "./manifest.json",
    "./manifest_2.json",
    "./manifest_3.json",
    "./manifest_4.json",
    "./manifest_5.json",
    "./manifest_6.json",
    "./data/manifest.json",
    "./data/manifest_2.json",
    "./data2/manifest.json",
    "./data2/manifest_2.json",
    "./data3/manifest.json",
    "./data3/manifest_2.json",
    "./data3/manifest_3.json",
    "./data4/manifest.json",
    "./data4/manifest_2.json",
    "./data4/manifest_4.json",
    "./data5/manifest.json",
    "./data5/manifest_2.json",
    "./data5/manifest_5.json",
    "./data6/manifest.json",
    "./data6/manifest_6.json",
    "./books/manifest.json"
];

const SEARCH_FOLDERS = ["./data6/", "./data5/", "./data4/", "./data3/", "./data2/", "./data/", "./books/", "./"];
const CLOUD_FALLBACK_URL = "https://cdn.jsdelivr.net/gh/jalisalkulayni-maker/-@main/";

let allBooksManifest = {};
let allBookGroupsMap = {};
let currentBookPages = [];
let currentBookToc = [];
let currentPageIndex = 1;
let currentBookTotalPages = 0;
let currentBookId = "";
let currentBookTitle = "";

// متغيرات محرك البحث العلمي المتقدم
let currentSearchScope = 'all';
let customSelectedGroups = new Set();
let currentSearchTarget = 'toc'; // 'toc' | 'fulltext' | 'topics'
let currentSearchMatchType = 'exact'; // 'exact' | 'all' | 'any' | 'smart'
let currentSearchBookFilter = 'all';
let isSearchGroupedByBook = false;
let lastSearchResultsCache = [];
let searchRequestId = 0;
let searchIndex = [];
let searchDebounceTimer = null;

// متغيرات التحديد والتحقيق والمقارنة
let savedSelectionRange = null;
let savedSelectionText = "";
let pinnedComparisonData = null;
let currentPreviewState = null;
let isZenModeActive = false;
let currentHomeCategoryFilter = 'all';
let isShelfListView = false;
let allCatalogExpanded = false;

let currentTagFilter = 'all';
let dailyHadithCollection = [];
let currentDailyHadith = null;
let hadithIntervalTimer = null;
let isDeepSearching = false;

let savedScrollPosition = 0;
let currentActiveSearchHighlight = "";
let currentDeepLinkQuote = "";
let currentPersonalLibraryTab = 'recent';
let readingHistory = [];

const RECENT_SEARCH_KEY = 'recent_searches_v2';
const FAVORITE_BOOKS_KEY = 'favorite_books_v2';
const READING_HISTORY_KEY = 'reading_history_v2';
const SAVED_QUOTES_KEY = 'saved_quotes_v2';
const SAVED_NOTES_KEY = 'saved_notes_v2';
const PINNED_COMPARE_KEY = 'pinned_comparison_v12';

// ==================== نظام التنبيهات والإشعارات ====================
let toastTimeout = null;
function showToast(message, iconClass = 'fa-circle-check') {
    const toast = document.getElementById('royalToast');
    if (!toast) return;

    toast.innerHTML = `<i class="fas ${iconClass} text-gold"></i> <span id="royalToastText">${escapeHtml(message)}</span>`;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

let confirmCallback = null;
function showConfirm(message, onConfirm) {
    const modal = document.getElementById('customConfirmModal');
    const msgEl = document.getElementById('confirmModalMsg');
    if (!modal || !msgEl) return;

    msgEl.innerText = message;
    confirmCallback = onConfirm;
    modal.style.display = 'flex';
}

function closeConfirmModal(isConfirmed) {
    const modal = document.getElementById('customConfirmModal');
    if (modal) modal.style.display = 'none';

    if (isConfirmed && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    confirmCallback = null;
}

// ==================== مولّد الأغلفة الملكية التراثية ====================
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function handleCoverError(img) {
    if (!img || !img.parentElement) return;
    img.onerror = null;
    const title = img.dataset.coverTitle || img.alt || "كتاب";
    const isPdf = img.dataset.pdf === "true";
    img.parentElement.innerHTML = createProceduralCover(title, isPdf);
}

function createCoverHtml(coverSrc, title, isPdf = false) {
    if (!coverSrc) {
        return `<div class="book-cover-wrapper">${createProceduralCover(title, isPdf)}</div>`;
    }
    const safeSrc = escapeHtml(String(coverSrc).trim());
    const safeTitle = escapeHtml(title);
    return `<div class="book-cover-wrapper"><img src="${safeSrc}" class="book-cover-img" alt="${safeTitle}" loading="lazy" decoding="async" fetchpriority="low" data-cover-title="${safeTitle}" data-pdf="${isPdf}" onerror="handleCoverError(this)"></div>`;
}

function createProceduralCover(title, isPdf = false) {
    let clean = (title || "").replace(/[\u064B-\u065F\u0670ـ]/g, "").trim();
    if (clean.length > 34) clean = clean.substring(0, 32) + '...';
    clean = escapeHtml(clean);
    let icon = isPdf ? 'fa-file-pdf' : 'fa-book-quran';
    return `
        <div class="procedural-book-cover" style="
            width: 100%; height: 100%; min-height: 135px; background: linear-gradient(135deg, #161412 0%, #261e17 50%, #0f0d0b 100%);
            border: 1px solid rgba(212, 175, 55, 0.45); border-radius: 6px; display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; text-align: center;
            position: relative; box-shadow: inset 0 0 14px rgba(0,0,0,0.85); overflow: hidden;
        ">
            <div style="position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px; border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 4px; pointer-events: none;"></div>
            <i class="fas ${icon}" style="color: var(--gold-main); font-size: 22px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></i>
            <span style="color: #f5eedb; font-family: 'Amiri', serif; font-size: 11.5px; font-weight: bold; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.9); z-index: 1;">${clean}</span>
        </div>
    `;
}

// ==================== البيانات الافتراضية ====================
const defaultTags = [
    { name: "عقائد وإمامة", color: "#D4AF37" },
    { name: "أخلاق وسلوك", color: "#4caf50" },
    { name: "استدلال فقهي", color: "#2196f3" },
    { name: "تفسير وتأويل", color: "#ab47bc" },
    { name: "مراجعة وتحقيق", color: "#e91e63" }
];

const fallbackHadithCollection = [
    {
        text: "قال أمير المؤمنين (عليه السلام): «العِلْمُ وِرَاثَةٌ كَرِيمَةٌ، وَالأَدَبُ حُلَلٌ مُجَدَّدَةٌ، وَالفِكْرُ مِرْآةٌ صَافِيَةٌ».",
        source: "نهج البلاغة - حكمة 5",
        searchKey: "العلم وراثة كريمة"
    },
    {
        text: "عن أبي عبد الله الصادق (عليه السلام) قال: «حَدِيثِي حَدِيثُ أَبِي، وَحَدِيثُ أَبِي حَدِيثُ جَدِّي، وَحَدِيثُ جَدِّي حَدِيثُ الحُسَيْنِ، وَحَدِيثُ الحَسَنِ حَدِيثُ أَمِيرِ المُؤْمِنِينَ، وَحَدِيثُ أَمِيرِ المُؤْمِنِينَ حَدِيثُ رَسُولِ اللهِ (صلى الله عليه وآله)».",
        source: "الكافي الشريف - ج1 ص53",
        searchKey: "حديثي حديث أبي"
    },
    {
        text: "قال الإمام علي بن الحسين السجاد (عليه السلام): «لَوْ يَعْلَمُ النَّاسُ مَا فِي طَلَبِ العِلْمِ لَطَلَبُوهُ وَلَوْ بِسَفْكِ المُهَجِ وَخَوْضِ اللُّجَجِ».",
        source: "الكافي الشريف - ج1 ص35",
        searchKey: "ما في طلب العلم لطلبوه"
    },
    {
        text: "قال الإمام الباقر (عليه السلام): «تَفَقَّهُوا فِي دِينِ اللهِ، فَإِنَّهُ مَنْ لَمْ يَتَفَقَّهْ مِنْكُمْ فِي الدِّينِ فَهُوَ أَعْرَابِيٌّ».",
        source: "المحاسن - ج1 ص219",
        searchKey: "تفقهوا في دين الله"
    },
    {
        text: "قال رسول الله (صلى الله عليه وآله): «إِنِّي تَارِكٌ فِيكُمُ الثَّقَلَيْنِ: كِتَابَ اللهِ وَعِتْرَتِي أَهْلَ بَيْتِي، مَا إِنْ تَمَسَّكْتُمْ بِهِمَا لَنْ تَضِلُّوا بَعْدِي أَبَدًا».",
        source: "كمال الدين وتمام النعمة - ص237",
        searchKey: "تارك فيكم الثقلين"
    },
    {
        text: "قال الإمام الصادق (عليه السلام): «اعْرِفُوا مَنَازِلَ شِيعَتِنَا بِقَدْرِ مَا يُحْسِنُونَ مِنْ رِوَايَتِهِمْ عَنَّا، فَإِنَّا لَا نَعُدُّ الفَقِيهَ مِنْهُمْ فَقِيهاً حَتَّى يَكُونَ مُحَدَّثاً».",
        source: "الكافي الشريف - ج1 ص238",
        searchKey: "اعرفوا منازل شيعتنا"
    }
];

function attachTactilePhysics(btn) {
    if (!btn) return;
    btn.addEventListener('touchstart', () => btn.classList.add('pressed'), { passive: true });
    btn.addEventListener('touchend', () => btn.classList.remove('pressed'), { passive: true });
    btn.addEventListener('touchcancel', () => btn.classList.remove('pressed'), { passive: true });
}

// ==================== المرشد العائم الذكي ====================
const GUIDE_STORAGE_KEY = 'library_guide_position_v3';
let guideDragState = null;
let guideStep = 0;
const GUIDE_TEXT = {
    '#navHomeBtn': 'الرواق: العودة إلى الصفحة الرئيسية واستئناف القراءة.',
    '#navCatalogBtn': 'التصنيفات: تصفح الخزانة مبوبة حسب العلوم الموضوعية.',
    '#navSearchBtn': 'البحث العلمي: ابحث في كتاب، مجموعة كتب، أو داخل باب موضوعي معين.',
    '#navTagsBtn': 'الوسوم: استعرض الشواهد والنصوص التي قمت بتصنيفها.',
    '#navAppearanceBtn': 'استوديو الألوان: غيّر ثيم الواجهة الداكنة والألوان بتناسق.',
    '#pinCompareBtn': 'المقارنة المرجعية: ثبّت هذه الصفحة في الأعلى لمقارنتها بصفحة أو كتاب آخر.',
    '#academicCiteBtn': 'التوثيق الأكاديمي: استخرج توثيقاً علمياً جاهزاً للنسخ (حوزوي، APA، MLA).',
    '#downloadPdfBtn': 'تصدير PDF: تنزيل أو طباعة الكتاب بصيغة PDF.',
    '#bookmarkBtn': 'الإشارة المرجعية: احفظ موضع القراءة للعودة إليه لاحقاً.',
    '#openTocBtn': 'فهرس الأبواب: انتقل بسرعة بين فصول وأبواب الكتاب.',
    '#inlineJumpInput': 'الانتقال المباشر: اكتب رقم الصفحة للقفز إليها فوراً.'
};

function getVisibleGuideTargets(viewId) {
    const root = document.getElementById(viewId) || document;
    const selectors = viewId === 'readerView'
        ? ['#pinCompareBtn', '#academicCiteBtn', '#downloadPdfBtn', '#bookmarkBtn', 'button[onclick*="openInBookSearch"]', '#openTocBtn', 'button[onclick*="openSettings"]', '#inlineJumpInput']
        : ['#navHomeBtn', '#navCatalogBtn', '#navSearchBtn', '#navTagsBtn', '#navAppearanceBtn'];
    return selectors.map(selector => {
        try {
            const el = document.querySelector(selector);
            if (!el || (!root.contains(el) && !el.closest('.glass-bottom-nav'))) return null;
            const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
            if (r.width < 2 || r.height < 2 || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return null;
            let text = GUIDE_TEXT[selector] || el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent?.trim() || 'أداة بحثية متاحة في هذه الشاشة.';
            return { el, selector, text: text.replace(/\s+/g, ' ').trim() };
        } catch (e) { return null; }
    }).filter(Boolean);
}

function currentGuideSteps(viewId = document.querySelector('.stage-view.active')?.id || 'homeView') {
    return getVisibleGuideTargets(viewId);
}

function updateGuideContext(viewId = document.querySelector('.stage-view.active')?.id || 'homeView') {
    const steps = currentGuideSteps(viewId);
    if (guideStep >= steps.length) guideStep = 0;
    const item = steps[guideStep];
    const text = document.getElementById('guideSpeechText');
    const counter = document.getElementById('guideStepCounter');
    if (text) text.textContent = item?.text || 'اضغط على المرشد وسأدلك على أدوات البحث والقراءة في هذه الصفحة.';
    if (counter) counter.textContent = steps.length ? `خطوة ${guideStep + 1} من ${steps.length}` : '';
}

function positionGuideBubble() {
    const guide = document.getElementById('floatingGuide');
    const bubble = document.getElementById('guideSpeechBubble');
    if (!guide || !bubble) return;
    const r = guide.getBoundingClientRect();
    const bw = Math.min(285, innerWidth - 16);
    const bh = Math.min(bubble.scrollHeight || 160, Math.floor(innerHeight * 0.48));
    bubble.style.width = bw + 'px';
    let left = r.left + r.width - bw, top = r.top - bh - 12;
    if (top < 8) top = r.bottom + 12;
    if (top + bh > innerHeight - 8) top = Math.max(8, innerHeight - bh - 8);
    left = Math.max(8, Math.min(innerWidth - bw - 8, left));
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
    const afterX = Math.max(12, Math.min(bw - 22, r.left + r.width / 2 - left - 5));
    bubble.style.setProperty('--guide-tail-left', afterX + 'px');
}

function positionGuideArrow(target) {
    let arrow = document.getElementById('guideArrow');
    if (!arrow) {
        arrow = document.createElement('div');
        arrow.id = 'guideArrow';
        document.body.appendChild(arrow);
    }
    const guide = document.getElementById('floatingGuide');
    if (!guide || !target) { arrow.style.display = 'none'; return; }
    const a = guide.getBoundingClientRect(), b = target.getBoundingClientRect();
    const x1 = a.left + a.width / 2, y1 = a.top + a.height / 2;
    const x2 = b.left + b.width / 2, y2 = b.top + b.height / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.max(20, Math.hypot(dx, dy));
    arrow.style.left = x1 + 'px';
    arrow.style.top = y1 + 'px';
    arrow.style.width = len + 'px';
    arrow.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    arrow.style.display = 'block';
}

function guideFocusTarget() {
    const viewId = document.querySelector('.stage-view.active')?.id || 'homeView';
    const steps = currentGuideSteps(viewId);
    if (!steps.length) { positionGuideArrow(null); return; }
    if (guideStep >= steps.length) guideStep = 0;
    const target = steps[guideStep].el;
    updateGuideContext(viewId);
    positionGuideBubble();
    const isFixed = !!target.closest('.glass-modal, .reader-bottom-bar, .glass-bottom-nav, .reader-top-bar');
    if (!isFixed) target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    setTimeout(() => { positionGuideBubble(); positionGuideArrow(target); }, isFixed ? 40 : 300);
    target.classList.remove('guide-focus-pulse');
    void target.offsetWidth;
    target.classList.add('guide-focus-pulse');
    setTimeout(() => target.classList.remove('guide-focus-pulse'), 2300);
}

function toggleGuideBubble() {
    const bubble = document.getElementById('guideSpeechBubble');
    if (!bubble) return;
    const opening = getComputedStyle(bubble).display === 'none';
    if (opening) {
        bubble.style.display = 'block';
        guideStep = 0;
        updateGuideContext();
        setTimeout(guideFocusTarget, 40);
    } else {
        hideGuideBubble();
    }
}

function hideGuideBubble() {
    const b = document.getElementById('guideSpeechBubble');
    if (b) b.style.display = 'none';
    document.getElementById('guideArrow')?.style.setProperty('display', 'none');
}

function advanceGuide() {
    const steps = currentGuideSteps();
    if (!steps.length) return;
    guideStep = (guideStep + 1) % steps.length;
    guideFocusTarget();
}

function initGuideDrag() {
    const guide = document.querySelector('.floating-guide-container');
    const handle = guide?.querySelector('.guide-avatar');
    if (!guide || !handle || guide.dataset.dragReady === '1') return;
    guide.dataset.dragReady = '1';
    try {
        const saved = JSON.parse(localStorage.getItem(GUIDE_STORAGE_KEY) || 'null');
        if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
            guide.style.left = Math.max(4, Math.min(innerWidth - (guide.offsetWidth || 44) - 4, saved.x)) + 'px';
            guide.style.top = Math.max(4, Math.min(innerHeight - (guide.offsetHeight || 44) - 4, saved.y)) + 'px';
            guide.style.right = 'auto';
            guide.style.bottom = 'auto';
        }
    } catch (e) {}

    const down = e => {
        if (e.button !== undefined && e.button !== 0) return;
        const r = guide.getBoundingClientRect();
        guideDragState = { startX: e.clientX, startY: e.clientY, baseLeft: r.left, baseTop: r.top, moved: false };
        handle.setPointerCapture?.(e.pointerId);
        handle.classList.add('is-dragging');
        e.preventDefault();
    };
    const move = e => {
        if (!guideDragState) return;
        const dx = e.clientX - guideDragState.startX, dy = e.clientY - guideDragState.startY;
        if (Math.abs(dx) + Math.abs(dy) > 5) guideDragState.moved = true;
        const w = guide.offsetWidth || 44, h = guide.offsetHeight || 44;
        guide.style.left = Math.max(4, Math.min(innerWidth - w - 4, guideDragState.baseLeft + dx)) + 'px';
        guide.style.top = Math.max(4, Math.min(innerHeight - h - 4, guideDragState.baseTop + dy)) + 'px';
        guide.style.right = 'auto';
        guide.style.bottom = 'auto';
        if (getComputedStyle(document.getElementById('guideSpeechBubble') || document.body).display !== 'none') positionGuideBubble();
        const t = currentGuideSteps()[guideStep]?.el;
        if (t) positionGuideArrow(t);
        e.preventDefault();
    };
    const up = () => {
        if (!guideDragState) return;
        const moved = guideDragState.moved;
        guideDragState = null;
        handle.classList.remove('is-dragging');
        try {
            const r = guide.getBoundingClientRect();
            localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify({ x: r.left, y: r.top }));
        } catch (e) {}
        if (moved) {
            handle.dataset.suppressClick = '1';
            setTimeout(() => handle.dataset.suppressClick = '0', 220);
        }
    };
    handle.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    handle.addEventListener('click', e => {
        if (handle.dataset.suppressClick === '1') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        toggleGuideBubble();
    });
    const next = document.createElement('button');
    next.className = 'guide-next-btn';
    next.type = 'button';
    next.textContent = 'الأداة التالية ⬅';
    next.addEventListener('click', advanceGuide);
    guide.querySelector('.guide-speech-bubble')?.appendChild(next);
    updateGuideContext();
}

function initGuideWhenReady() {
    initGuideDrag();
    updateGuideContext();
}
document.addEventListener('DOMContentLoaded', initGuideWhenReady, { once: true });
window.addEventListener('resize', () => {
    const b = document.getElementById('guideSpeechBubble');
    if (b && getComputedStyle(b).display !== 'none') guideFocusTarget();
});

// ==================== إدارة التبويبات والشاشات ====================
function showView(viewId, pushHistory = true) {
    if (document.getElementById('homeView')?.classList.contains('active') && viewId !== 'homeView') {
        savedScrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
    }

    document.querySelectorAll('.stage-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    const bottomNav = document.querySelector('.glass-bottom-nav');
    if (bottomNav) {
        const isReader = viewId === 'readerView';
        bottomNav.style.display = isReader ? 'none' : '';
        bottomNav.setAttribute('aria-hidden', isReader ? 'true' : 'false');
    }

    if (viewId !== 'readerView' && isZenModeActive) {
        toggleZenMode(false);
    }

    updateGuideContext(viewId);

    if (pushHistory) {
        history.pushState({ view: viewId }, '', '');
    }

    if (viewId === 'homeView') {
        setTimeout(() => {
            window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
        }, 40);
    }
}

function switchTab(tabKey) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    if (tabKey === 'home') {
        document.getElementById('navHomeBtn')?.classList.add('active');
        showView('homeView');
    } else if (tabKey === 'catalog') {
        document.getElementById('navCatalogBtn')?.classList.add('active');
        showView('catalogView');
        renderCatalogAccordion();
    } else if (tabKey === 'tags') {
        document.getElementById('navTagsBtn')?.classList.add('active');
        showView('tagsView');
        renderTagsView(currentTagFilter);
    } else if (tabKey === 'search') {
        document.getElementById('navSearchBtn')?.classList.add('active');
        openSearch();
    }
}

window.addEventListener('popstate', (event) => {
    const openModals = [
        document.getElementById('volumesModal'),
        document.getElementById('tocModal'),
        document.getElementById('settingsModal'),
        document.getElementById('inBookSearchModal'),
        document.getElementById('addTagModal'),
        document.getElementById('customConfirmModal'),
        document.getElementById('personalLibraryModal'),
        document.getElementById('libraryCommandCenterModal'),
        document.getElementById('noteEditorModal'),
        document.getElementById('customBookScopeModal'),
        document.getElementById('quickPreviewModal'),
        document.getElementById('citationModal'),
        document.getElementById('appearanceModal')
    ];

    let modalClosed = false;
    for (let modal of openModals) {
        if (modal && (modal.style.display === 'flex' || modal.style.display === 'block')) {
            modal.style.display = 'none';
            modalClosed = true;
        }
    }
    if (modalClosed) return;

    const targetView = event.state?.view || 'homeView';
    showView(targetView, false);

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (targetView === 'homeView') document.getElementById('navHomeBtn')?.classList.add('active');
    else if (targetView === 'catalogView') document.getElementById('navCatalogBtn')?.classList.add('active');
    else if (targetView === 'tagsView') document.getElementById('navTagsBtn')?.classList.add('active');
    else if (targetView === 'searchView') document.getElementById('navSearchBtn')?.classList.add('active');
});

// ==================== التطبيع اللغوي والجذور العربية المرنة ====================
function normalizeArabicText(text) {
    if (!text) return "";
    return String(text)
        .replace(/[\u064B-\u065F\u0670ـ]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ک/g, "ك")
        .replace(/ی/g, "ي")
        .toLowerCase()
        .trim();
}

// تجريد اللواصق والضمائر العربية للبحث الذكي المرن
function stripArabicAffixes(word) {
    let w = normalizeArabicText(word);
    if (w.length <= 3) return w;
    const prefixes = ["وال", "بال", "كال", "فال", "لل", "ال", "و", "ف", "ب", "ل"];
    for (const p of prefixes) {
        if (w.startsWith(p) && (w.length - p.length) >= 3) {
            w = w.slice(p.length);
            break;
        }
    }
    const suffixes = ["كموها", "هموها", "تموها", "ها", "هم", "هن", "كم", "كن", "نا", "ين", "ون", "ات", "ان", "يه", "ه", "ي", "ك"];
    for (const s of suffixes) {
        if (w.endsWith(s) && (w.length - s.length) >= 3) {
            w = w.slice(0, -s.length);
            break;
        }
    }
    return w;
}

function createArabicSearchRegex(rawQuery) {
    if (!rawQuery) return null;
    let cleanQ = rawQuery.replace(/[\u064B-\u065F\u0670ـ]/g, "").trim();
    if (!cleanQ) return null;

    const tashkeel = "[\\u064B-\\u065F\\u0670ـ]*";
    let words = cleanQ.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return null;

    let wordPatterns = words.map(w => {
        let baseWord = currentSearchMatchType === 'smart' ? stripArabicAffixes(w) : w;
        let p = "";
        for (let i = 0; i < baseWord.length; i++) {
            let c = baseWord[i];
            if ("اأإآٱ".includes(c)) p += "[اأإآٱ]" + tashkeel;
            else if ("هة".includes(c)) p += "[هة]" + tashkeel;
            else if ("يىئی".includes(c)) p += "[يىئی]" + tashkeel;
            else if ("وؤ".includes(c)) p += "[وؤ]" + tashkeel;
            else if ("كک".includes(c)) p += "[كک]" + tashkeel;
            else if (/[a-zA-Z0-9\u0621-\u064A]/.test(c)) p += c + tashkeel;
            else p += "\\" + c;
        }
        return p;
    });

    let patternCore = (currentSearchMatchType === 'exact')
        ? wordPatterns.join("\\s+")
        : wordPatterns.join("|");

    try {
        return new RegExp(`(${patternCore})`, "gim");
    } catch (e) {
        return null;
    }
}

function highlightArabicText(text, query) {
    if (!text || !query) return text || "";
    let reg = createArabicSearchRegex(query);
    if (!reg) return text;
    return String(text).replace(reg, '<mark class="search-highlight">$1</mark>');
}

// ==================== تحليل المجلدات وتصنيف الكتب ====================
const compoundMap = {
    "الحادي والتسعون": 91, "الثاني والتسعون": 92, "الثالث والتسعون": 93, "الرابع والتسعون": 94,
    "الخامس والتسعون": 95, "السادس والتسعون": 96, "السابع والتسعون": 97, "الثامن والتسعون": 98, "التاسع والتسعون": 99,
    "الحادي والثمانون": 81, "الثاني والثمانون": 82, "الثالث والثمانون": 83, "الرابع والثمانون": 84,
    "الخامس والثمانون": 85, "السادس والثمانون": 86, "السابع والثمانون": 87, "الثامن والثمانون": 88, "التاسع والثمانون": 89,
    "الحادي والسبعون": 71, "الثاني والسبعون": 72, "الثالث والسبعون": 73, "الرابع والسبعون": 74,
    "الخامس والسبعون": 75, "السادس والسبعون": 76, "السابع والسبعون": 77, "الثامن والسبعون": 78, "التاسع والسبعون": 79,
    "الحادي والستون": 61, "الثاني والستون": 62, "الثالث والستون": 63, "الرابع والستون": 64,
    "الخامس والستون": 65, "السادس والستون": 66, "السابع والستون": 67, "الثامن والستون": 68, "التاسع والستون": 69,
    "الحادي والخمسون": 51, "الثاني والخمسون": 52, "الثالث والخمسون": 53, "الرابع والخمسون": 54,
    "الخامس والخمسون": 55, "السادس والخمسون": 56, "السابع والخمسون": 57, "الثامن والخمسون": 58, "التاسع والخمسون": 59,
    "الحادي والاربعون": 41, "الحادي والأربعون": 41, "الثاني والاربعون": 42, "الثاني والأربعون": 42,
    "الثالث والاربعون": 43, "الثالث والأربعون": 43, "الرابع والاربعون": 44, "الرابع والأربعون": 44,
    "الخامس والاربعون": 45, "الخامس والأربعون": 45, "السادس والاربعون": 46, "السادس والأربعون": 46,
    "السابع والاربعون": 47, "السابع والأربعون": 47, "الثامن والاربعون": 48, "الثامن والأربعون": 48,
    "التاسع والاربعون": 49, "التاسع والأربعون": 49,
    "الحادي والثلاثون": 31, "الثاني والثلاثون": 32, "الثالث والثلاثون": 33, "الرابع والثلاثون": 34,
    "الخامس والثلاثون": 35, "السادس والثلاثون": 36, "السابع والثلاثون": 37, "الثامن والثلاثون": 38, "التاسع والثلاثون": 39,
    "الحادي والعشرون": 21, "الثاني والعشرون": 22, "الثالث والعشرون": 23, "الرابع والعشرون": 24,
    "الخامس والعشرون": 25, "السادس والعشرون": 26, "السابع والعشرون": 27, "الثامن والعشرون": 28, "التاسع والعشرون": 29,
    "الحادي عشر": 11, "الثاني عشر": 12, "الثالث عشر": 13, "الرابع عشر": 14, "الخامس عشر": 15,
    "السادس عشر": 16, "السابع عشر": 17, "الثامن عشر": 18, "التاسع عشر": 19,
    "المائة": 100, "المئة": 100, "التسعون": 90, "الثمانون": 80, "السبعون": 70,
    "الستون": 60, "الخمسون": 50, "الأربعون": 40, "الاربعون": 40, "الثلاثون": 30, "العشرون": 20,
    "العاشر": 10, "التاسع": 9, "الثامن": 8, "السابع": 7, "السادس": 6,
    "الخامس": 5, "الرابع": 4, "الثالث": 3, "الثاني": 2, "الأول": 1, "الاول": 1
};

function getVolumeNumber(vol) {
    if (vol.pdf_url) return 1;
    let cleanTitle = (vol.title || "").replace(/[\u064B-\u065F\u0670ـ]/g, "");
    let norm = normalizeArabicText(cleanTitle);
    let lowerId = (vol.id || "").toLowerCase();

    if (norm.includes("الروضه") || lowerId.includes("rawda") || lowerId.includes("rwdh")) {
        return 8;
    }
    if (cleanTitle.includes("مخطوط") || cleanTitle.includes("نسخة")) return 1;

    if (vol.volume) {
        let cleanVol = String(vol.volume).replace(/\D/g, '');
        if (cleanVol && !isNaN(parseInt(cleanVol, 10))) return parseInt(cleanVol, 10);
    }

    let idMatch = (vol.id || "").match(/_(\d+)/);
    if (idMatch && !isNaN(parseInt(idMatch[1], 10))) {
        return parseInt(idMatch[1], 10);
    }

    for (let [word, num] of Object.entries(compoundMap)) {
        if (cleanTitle.includes(word)) return num;
    }

    let textMatch = cleanTitle.match(/\d+/);
    if (textMatch && !isNaN(parseInt(textMatch[0], 10))) {
        return parseInt(textMatch[0], 10);
    }

    return 999;
}

function getGroupName(book, bookId) {
    let lowerId = (bookId || "").toLowerCase();
    let rawTitle = (book?.title || "").trim();
    let normTitle = normalizeArabicText(rawTitle);

    if (book?.pdf_url || lowerId.includes("mkh") || normTitle.includes("مخطوط") || normTitle.includes("نسخه خطيه") || normTitle.includes("وثيقه")) {
        return rawTitle || bookId;
    }
    if (normTitle.includes("الاصول السته عشر") || normTitle.includes("الاصول ١٦") || lowerId.includes("osol16") || lowerId.includes("usul16")) return "الأصول الستة عشر";
    if (normTitle.includes("مناقب الامام امير") || normTitle.includes("مناقب امير المومنين") || lowerId.startsWith("mnqb_amr") || lowerId.startsWith("mnqb_amir")) return "مناقب الإمام أمير المؤمنين (عليه السلام)";
    if (lowerId.startsWith("kafi") || lowerId.startsWith("rawda") || lowerId.startsWith("rwdh") ||
       (normTitle.includes("الكافي") && !normTitle.includes("مراه")) ||
       (normTitle.includes("الروضه") && !normTitle.includes("الواعظين") && !normTitle.includes("الجنان") && !normTitle.includes("الشهداء") && !normTitle.includes("الانوار"))) {
        return "الكافي الشريف";
    }
    if (lowerId.startsWith("bhr") || normTitle.includes("بحار الانوار")) return "بحار الأنوار";
    if (lowerId.startsWith("mrat") || lowerId.startsWith("mra") || normTitle.includes("مراه العقول")) return "مرآة العقول في شرح أخبار آل الرسول";
    if (lowerId.startsWith("iqbal") || lowerId.startsWith("liqbal") || normTitle.includes("اقبال الاعمال") || normTitle.includes("الاقبال بالاعمال")) return "الإقبال بالأعمال الحسنة";
    if (lowerId.startsWith("mtehjd") || normTitle.includes("المتهجد")) return "مصباح المتهجد وسلاح المتعبد";
    if (lowerId.startsWith("mhj") || normTitle.includes("مهج الدعوات")) return "مهج الدعوات ومنهج العبادات";
    if (lowerId.startsWith("hdyq") || normTitle.includes("الحدائق")) return "الحدائق الناضرة";
    if (lowerId.startsWith("brh") || normTitle.includes("تفسير البرهان") || normTitle.includes("البرهان في تفسير")) return "تفسير البرهان";
    if (lowerId.startsWith("knz") || normTitle.includes("كنز الدقائق")) return "تفسير كنز الدقائق وبحر الغرائب";
    if (lowerId.startsWith("nwr") || normTitle.includes("نور الثقلين")) return "تفسير نور الثقلين";
    if (lowerId.startsWith("kml") || normTitle.includes("كمال الدين")) return "كمال الدين وتمام النعمة";
    if (lowerId.startsWith("wsl") || normTitle.includes("وسائل الشيعه")) return "وسائل الشيعة";
    if (lowerId.startsWith("mstdrk") || normTitle.includes("مستدرك الوسائل")) return "مستدرك الوسائل";
    if (lowerId.startsWith("mzn") || normTitle.includes("الميزان")) return "تفسير الميزان";
    if (lowerId.startsWith("shf") || normTitle.includes("الصحيفه السجاديه")) return "الصحيفة السجادية";
    if (lowerId.startsWith("nahj") || normTitle.includes("نهج البلاغه")) return "نهج البلاغة";
    if (lowerId.startsWith("stb") || normTitle.includes("الاستبصار")) return "الاستبصار";
    if (lowerId.startsWith("thb") || normTitle.includes("تهذيب الاحكام")) return "تهذيب الأحكام";
    if (lowerId.startsWith("faqih") || lowerId.startsWith("yhdrh") || normTitle.includes("من لا يحضره")) return "من لا يحضره الفقيه";
    if (lowerId.startsWith("ayash") || lowerId.startsWith("aysh") || normTitle.includes("العياشي")) return "تفسير العياشي";
    if (lowerId.startsWith("htj") || lowerId.startsWith("ihtjaj") || normTitle.includes("الاحتجاج")) return "الإحتجاج للطبرسي";
    if (lowerId.startsWith("irshad") || normTitle.includes("الارشاد")) return "الإرشاد في معرفة حجج الله على العباد";
    if (lowerId.startsWith("amli") || normTitle.includes("امالي")) return "الأمالي";
    if (lowerId.startsWith("ilzam") || normTitle.includes("الزام الناصب")) return "إلزام الناصب في إثبات الحجة الغائب";
    if (lowerId.startsWith("bsayr") || normTitle.includes("بصائر الدرجات")) return "بصائر الدرجات";
    if (lowerId.startsWith("thwab") || normTitle.includes("ثواب الاعمال")) return "ثواب الأعمال وعقاب الأعمال";
    if (lowerId.startsWith("zad") || normTitle.includes("زاد المعاد")) return "زاد المعاد";
    if (lowerId.startsWith("bld") || normTitle.includes("البلد الامين")) return "البلد الأمين والدرع الحصين";
    if (lowerId.startsWith("msb_kfc") || (normTitle.includes("مصباح") && normTitle.includes("كفعمي"))) return "مصباح الكفعمي";
    if (lowerId.startsWith("mzr_shd") || (normTitle.includes("مزار") && normTitle.includes("شهيد"))) return "المزار للشهيد الأول";
    if (lowerId.startsWith("mzr_mshd") || (normTitle.includes("مزار") && normTitle.includes("مشهدي"))) return "المزار الكبير للمشهدي";
    if (lowerId.startsWith("mzr_bk") || lowerId.startsWith("mzar") || normTitle.includes("المزار")) return "المزار";
    if (lowerId.startsWith("jmal") || lowerId.startsWith("jml") || normTitle.includes("جمال الاسبوع")) return "جمال الأسبوع بكمال العمل المشروع";
    if (lowerId.startsWith("mjtna") || normTitle.includes("المجتني")) return "المجتنى من الدعاء المجتبى";
    if (lowerId.startsWith("slwh") || normTitle.includes("سلوه الحزين") || normTitle.includes("الدعوات للراوندي")) return "الدعوات (سلوة الحزين)";
    if (lowerId.startsWith("flah") || lowerId.startsWith("falah") || normTitle.includes("فلاح السائل")) return "فلاح السائل ونجاح المسائل";
    if (lowerId.startsWith("fth") || normTitle.includes("فتح الابواب")) return "فتح الأبواب في الاستخارات";
    if (lowerId.startsWith("drwa") || normTitle.includes("الدروع الواقيه")) return "الدروع الواقية";
    if (lowerId.startsWith("aman") || normTitle.includes("الامان من اخطار")) return "الأمان من أخطار الأسفار والأزمان";
    if (lowerId.startsWith("qny") || lowerId.startsWith("mqna") || normTitle.includes("المقنع")) return "المقنع للمفيد";
    if (lowerId.startsWith("add") || normTitle.includes("العدد القويه")) return "العدد القوية لدفع المخاوف اليومية";
    if (lowerId.startsWith("qmy") || normTitle.includes("تفسير القمي")) return "تفسير القمي";

    if (book?.series && book.series.trim() !== "") return book.series.trim();

    let clean = rawTitle
        .replace(/[\u064B-\u065F\u0670ـ]/g, "")
        .replace(/[-–—_:\/,\.،؛\(\)]/g, ' ');

    for (let w of Object.keys(compoundMap).sort((a, b) => b.length - a.length)) {
        clean = clean.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
    }

    clean = clean
        .replace(/\b(?:الجزء|المجلد|جزء|مجلد|ج|م|vol|v)\b\s*\d*/gi, '')
        .replace(/\s+\d+\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return clean || rawTitle || bookId;
}

function getBookCategory(book) {
    let rawTitle = (book?.title || "").toLowerCase();
    let rawCat = (book?.category || "").trim().toLowerCase();
    let combined = normalizeArabicText(rawTitle + " " + rawCat);

    if (book?.pdf_url || combined.includes("مخطوط") || combined.includes("وثيقه")) return "المخطوطات والوثائق التراثية";

    if (combined.includes("كامل الزيارات") ||
        combined.includes("علل الشرايع") ||
        combined.includes("دلائل الامامه") ||
        combined.includes("ارشاد القلوب") ||
        combined.includes("كمال الدين")) {
        return "الحديث والرواية";
    }

    if (combined.includes("الكافي") || combined.includes("من لا يحضره") || combined.includes("تهذيب الاحكام") || combined.includes("الاستبصار")) return "الكتب الأربعة";
    if (combined.includes("غيبه") || combined.includes("الزام الناصب") || combined.includes("المهدي") || combined.includes("الايقاظ من الهجعه") || combined.includes("النجم الثاقب") || combined.includes("توقيعات") || combined.includes("الرجعه") || combined.includes("الملاحم والفتن")) return "كتب الغيبة";
    if (combined.includes("تفسير") || combined.includes("قران") || combined.includes("عياشي") || combined.includes("برهان") || combined.includes("الميزان") || combined.includes("الثقلين") || combined.includes("فرات الكوفي") || combined.includes("القمي") || combined.includes("اسباب النزول") || combined.includes("عين العبره") || combined.includes("عيون الغرر") || combined.includes("تاويل الايات") || combined.includes("تاويل ما نزل") || combined.includes("مراه الانوار") || combined.includes("المحكم والمتشابه")) return "تفسير أهل البيت";
    if (combined.includes("شبهات") || combined.includes("رد") || combined.includes("مناظرات") || combined.includes("مراجعات") || combined.includes("نقض") || combined.includes("بهجه النظر") || combined.includes("غايه المرام") || combined.includes("حجه الخصام")) return "رد الشبهات";
    if (combined.includes("سيره") || combined.includes("تاريخ") || combined.includes("مقتل") || combined.includes("ارشاد") || combined.includes("هجوم") || combined.includes("فاطمه") || combined.includes("حليه الابرار") || combined.includes("نوادر المعجزات") || combined.includes("عوالم العلوم")) return "سيرة النبي وأهل بيته";
    if (combined.includes("فقه") || combined.includes("احكام") || combined.includes("شرايع") || combined.includes("شرائع") || combined.includes("حدائق") || combined.includes("رساله") || combined.includes("المقنع")) return "الفقه";
    if (combined.includes("عقائد") || combined.includes("عقايد") || combined.includes("توحيد") || combined.includes("امامه") || combined.includes("عدل") || combined.includes("اعتقادات") || combined.includes("سفينه النجاه") || combined.includes("كنز الفوائد") || combined.includes("افصاح")) return "عقائد";
    if (combined.includes("اخلاق") || combined.includes("اداب") || combined.includes("مواعظ")) return "الأخلاق";
    if (combined.includes("دعاء") || combined.includes("ادعيه") || combined.includes("صحيفه") || combined.includes("زياره") || combined.includes("مناجات") || combined.includes("مفاتيح") || combined.includes("اقبال") || combined.includes("مصباح") || combined.includes("مزار") || combined.includes("مهج") || combined.includes("زاد المعاد") || combined.includes("البلد الامين") || combined.includes("الدروع") || combined.includes("فلاح السائل") || combined.includes("جمال الاسبوع")) return "الدعاء والزيارة";
    if (combined.includes("حديث") || combined.includes("بحار") || combined.includes("وافي") || combined.includes("وسائل") || combined.includes("مستدرك") || combined.includes("احتجاج") || combined.includes("عقول") || combined.includes("فضائل") || combined.includes("فضايل") || combined.includes("بصائر") || combined.includes("مناقب") || combined.includes("اصول") || combined.includes("خرائج") || combined.includes("محاسن") || combined.includes("بشاره") || combined.includes("رجال") || combined.includes("كتب الصدوق") || combined.includes("نهج البلاغه") || combined.includes("عيون اخبار") || combined.includes("سليم بن قيس") || combined.includes("معاجز") || combined.includes("مشارق") || combined.includes("امالي") || combined.includes("اختصاص")) return "الحديث والرواية";

    return "المتون العامة";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal, cache: options.cache || 'default' });
    } finally {
        clearTimeout(timer);
    }
}

// ==================== تحميل ودمج الفهارس الذكي ====================
async function loadLibraryManifest() {
    const container = document.getElementById('dynamicBooksContainer');
    if (!container) return;
    allBooksManifest = {};

    const normalizeManifest = (raw) => {
        if (!raw) return {};
        if (Array.isArray(raw)) {
            const out = {};
            raw.forEach((book, i) => {
                if (!book || typeof book !== 'object') return;
                const id = String(book.id || book.book_id || book.slug || `book_${i + 1}`);
                out[id] = book;
            });
            return out;
        }
        if (raw.books && typeof raw.books === 'object') return normalizeManifest(raw.books);
        if (raw.data && typeof raw.data === 'object') return normalizeManifest(raw.data);
        if (typeof raw === 'object') return raw;
        return {};
    };

    const mergeBooks = (booksObj) => {
        for (const [id, incoming] of Object.entries(normalizeManifest(booksObj))) {
            if (!incoming || typeof incoming !== 'object') continue;
            if (!allBooksManifest[id]) {
                allBooksManifest[id] = { ...incoming };
            } else {
                const old = allBooksManifest[id];
                allBooksManifest[id] = { ...old, ...incoming };
                if ((old.cover || '').trim() && !(incoming.cover || '').trim()) allBooksManifest[id].cover = old.cover;
                if (Array.isArray(old.pages) && !Array.isArray(incoming.pages)) allBooksManifest[id].pages = old.pages;
                if (Array.isArray(old.toc) && !Array.isArray(incoming.toc)) allBooksManifest[id].toc = old.toc;
            }
        }
    };

    try {
        const results = await Promise.all(MANIFEST_FILES.map(async (fileUrl) => {
            try {
                const res = await fetchWithTimeout(fileUrl, {}, 7000);
                if (!res.ok) return { url: fileUrl, data: {} };
                return { url: fileUrl, data: await res.json() };
            } catch (err) {
                return { url: fileUrl, data: {} };
            }
        }));
        results.forEach(r => mergeBooks(r.data));

        if (!Object.keys(allBooksManifest).length) {
            for (const fileUrl of MANIFEST_FILES) {
                try {
                    const remote = CLOUD_FALLBACK_URL + fileUrl.replace(/^\.\//, '');
                    const res = await fetchWithTimeout(remote, {}, 9000);
                    if (res.ok) mergeBooks(await res.json());
                } catch (err) {}
            }
        }

        if (Object.keys(allBooksManifest).length === 0) throw new Error('لم يتم العثور على أي بيانات في ملفات manifest');

        processAndRenderBooks(allBooksManifest);
        restorePinnedComparisonFromStorage();

        const urlParams = new URLSearchParams(window.location.search);
        const targetBookId = urlParams.get('book');
        const targetPage = urlParams.get('page');
        const targetQuote = urlParams.get('quote');
        const initialQuery = urlParams.get('q');
        if (targetBookId && allBooksManifest[targetBookId]) {
            const b = allBooksManifest[targetBookId];
            if (b.pdf_url) window.open(b.pdf_url, '_blank', 'noopener,noreferrer');
            else loadAndOpenBook(targetBookId, b.title, b.toc, b.total_pages, targetPage ? Number(targetPage) : null, targetQuote || '');
        } else if (initialQuery) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = initialQuery;
            openSearch();
            setTimeout(() => handleSearchInput(initialQuery), 60);
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="library-load-status" data-kind="error"><i class="fas fa-triangle-exclamation"></i><span>تعذر تحميل الفهارس. تأكد من اتصال الإنترنت أو مسارات الفهارس.</span></div>`;
    }
}

// ==================== بناء واجهة الكتب والرفوف التفاعلية ====================
function processAndRenderBooks(data) {
    const container = document.getElementById('dynamicBooksContainer');
    const track = document.getElementById('heroSliderTrack');
    const indicators = document.getElementById('heroIndicators');
    if (!container) return;

    container.innerHTML = "";
    if (track) track.innerHTML = "";
    if (indicators) indicators.innerHTML = "";

    const bookKeys = Object.keys(data);
    searchIndex = [];
    allBookGroupsMap = {};

    if (bookKeys.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); grid-column: span 3; text-align: center;">قائمة الكتب فارغة.</div>';
        return;
    }

    const categoriesCount = {};

    bookKeys.forEach(bookId => {
        let book = data[bookId];
        book.id = bookId;
        let groupName = getGroupName(book, bookId);
        let categoryName = getBookCategory(book);
        book._groupName = groupName;
        book._categoryName = categoryName;

        searchIndex.push({
            id: bookId,
            title: book.title || '',
            author: book.author || book.writer || book.authors || '',
            category: categoryName,
            group: groupName,
            toc: Array.isArray(book.toc) ? book.toc : [],
            pdf: !!book.pdf_url
        });

        if (!allBookGroupsMap[groupName]) allBookGroupsMap[groupName] = [];
        allBookGroupsMap[groupName].push(book);
    });

    const sortedGroupTitles = Object.keys(allBookGroupsMap).sort((a, b) =>
        a.localeCompare(b, 'ar', { numeric: true, sensitivity: 'base' })
    );

    let heroCount = 0;
    const maxHeroSlides = 10;

    sortedGroupTitles.forEach(groupTitle => {
        const booksInGroup = allBookGroupsMap[groupTitle];
        booksInGroup.sort((a, b) => getVolumeNumber(a) - getVolumeNumber(b));

        const mainBook = booksInGroup[0];
        const groupCategory = getBookCategory(mainBook);
        categoriesCount[groupCategory] = (categoriesCount[groupCategory] || 0) + 1;

        const isSeries = booksInGroup.length > 1;
        const isPdfManuscript = !!mainBook.pdf_url;

        let coverSrc = "";
        for (let b of booksInGroup) {
            let candidate = (b.cover || "").trim();
            if (candidate !== "") { coverSrc = candidate; break; }
        }

        let coverHtml = createCoverHtml(coverSrc, groupTitle, isPdfManuscript);
        let subtitle = isPdfManuscript
            ? `${mainBook.total_pages || 0} لوحة (مخطوط PDF)`
            : (isSeries ? `${booksInGroup.length} أجزاء / مجلدات` : `${mainBook.total_pages || 0} صفحة`);

        let cleanTitleForSearch = normalizeArabicText(groupTitle);
        let isFeatured = cleanTitleForSearch.includes("الهجوم") ||
            cleanTitleForSearch.includes("نعماني") ||
            cleanTitleForSearch.includes("الكافي") ||
            cleanTitleForSearch.includes("سجاديه") ||
            cleanTitleForSearch.includes("توحيد المفضل") ||
            cleanTitleForSearch.includes("نهج البلاغه") ||
            cleanTitleForSearch.includes("بحار الانوار");

        if (track && isFeatured && heroCount < maxHeroSlides) {
            const slide = document.createElement('div');
            slide.className = 'hero-slide tactile-btn';
            slide.innerHTML = `
                ${coverHtml}
                <div class="hero-slide-content">
                    <span class="hero-slide-tag">${escapeHtml(groupCategory)}</span>
                    <h4 class="hero-slide-title">${escapeHtml(groupTitle)}</h4>
                    <p class="hero-slide-desc">${escapeHtml(subtitle)}</p>
                    <button class="hero-slide-btn">مطالعة وبحث</button>
                </div>
            `;
            attachTactilePhysics(slide);

            if (isPdfManuscript) slide.onclick = () => window.open(mainBook.pdf_url, '_blank');
            else if (isSeries) slide.onclick = () => openVolumesModal(groupTitle, booksInGroup);
            else slide.onclick = () => loadAndOpenBook(mainBook.id, mainBook.title, mainBook.toc, mainBook.total_pages);

            track.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = 'hero-dot' + (heroCount === 0 ? ' active' : '');
            indicators.appendChild(dot);
            heroCount++;
        }

        const card = document.createElement("div");
        card.className = "book-card tactile-btn";
        card.dataset.groupTitle = normalizeArabicText(groupTitle);
        card.dataset.category = groupCategory;
        card.innerHTML = `
            <button class="book-favorite-btn tactile-btn ${isFavoriteBook(mainBook.id) ? 'active' : ''}" title="${isFavoriteBook(mainBook.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}" onclick="toggleFavoriteBook('${escapeHtml(mainBook.id)}', event)"><i class="${isFavoriteBook(mainBook.id) ? 'fas' : 'far'} fa-star"></i></button>
            ${coverHtml}
            <div class="book-info">
                <h4 class="text-white">${escapeHtml(groupTitle)}</h4>
                <p class="text-muted">${escapeHtml(subtitle)}</p>
                <div class="progress-bar v2-book-progress" style="width: 100%;"><div class="progress-fill" style="width: ${getBookProgressPercent(mainBook.id)}%;"></div></div>
            </div>
        `;

        attachTactilePhysics(card);
        if (isPdfManuscript) {
            card.onclick = () => window.open(mainBook.pdf_url, '_blank');
        } else if (isSeries) {
            card.onclick = () => openVolumesModal(groupTitle, booksInGroup);
        } else {
            card.onclick = () => loadAndOpenBook(mainBook.id, mainBook.title, mainBook.toc, mainBook.total_pages);
        }
        container.appendChild(card);
    });

    renderHomeCategoryPills(categoriesCount);
    renderSearchFilterPills(allBookGroupsMap);
    renderContinueReading();
    if (heroCount > 0) setupHeroSlider(heroCount);
}

function renderHomeCategoryPills(categoriesCount) {
    const host = document.getElementById('homeCategoryPills');
    if (!host) return;
    const totalGroups = Object.keys(allBookGroupsMap).length;
    let html = `<button class="filter-pill ${currentHomeCategoryFilter === 'all' ? 'active' : ''} tactile-btn" onclick="setHomeCategoryFilter('all')">الكل (${totalGroups})</button>`;
    const categoryOrder = [
        "الكتب الأربعة", "تفسير أهل البيت", "الحديث والرواية", "كتب الغيبة",
        "عقائد", "الفقه", "سيرة النبي وأهل بيته", "رد الشبهات",
        "الأخلاق", "الدعاء والزيارة", "المخطوطات والوثائق التراثية", "المتون العامة"
    ];
    categoryOrder.forEach(cat => {
        if (!categoriesCount[cat]) return;
        html += `<button class="filter-pill ${currentHomeCategoryFilter === cat ? 'active' : ''} tactile-btn" onclick="setHomeCategoryFilter('${escapeHtml(cat)}')">${escapeHtml(cat)} (${categoriesCount[cat]})</button>`;
    });
    host.innerHTML = html;
}

function setHomeCategoryFilter(catName) {
    currentHomeCategoryFilter = catName;
    document.querySelectorAll('#homeCategoryPills .filter-pill').forEach(btn => {
        btn.classList.toggle('active', (catName === 'all' && btn.textContent.startsWith('الكل')) || btn.textContent.startsWith(catName));
    });
    filterHomeBooksGrid(document.getElementById('homeQuickFilterInput')?.value || '');
}

function filterHomeBooksGrid(query = '') {
    const normQ = normalizeArabicText(query);
    const cards = document.querySelectorAll('#dynamicBooksContainer .book-card');
    cards.forEach(card => {
        const matchText = !normQ || (card.dataset.groupTitle || '').includes(normQ);
        const matchCat = currentHomeCategoryFilter === 'all' || card.dataset.category === currentHomeCategoryFilter;
        card.style.display = (matchText && matchCat) ? '' : 'none';
    });
}

function toggleShelfLayoutMode() {
    isShelfListView = !isShelfListView;
    const container = document.getElementById('dynamicBooksContainer');
    const btn = document.getElementById('shelfViewToggleBtn');
    if (container) container.classList.toggle('list-view-mode', isShelfListView);
    if (btn) btn.innerHTML = `<i class="fas ${isShelfListView ? 'fa-table-cells-large' : 'fa-list'}"></i>`;
}

let heroSliderTimer = null;
function setupHeroSlider(count) {
    clearInterval(heroSliderTimer);
    let currentIndex = 0;
    const track = document.getElementById('heroSliderTrack');
    const dots = document.querySelectorAll('.hero-dot');
    if (!track) return;

    track.addEventListener('scroll', () => {
        let index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
        if (index < count) {
            currentIndex = index;
            dots.forEach(d => d.classList.remove('active'));
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');
        }
    }, { passive: true });

    heroSliderTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % count;
        const slide = track.children[currentIndex];
        if (slide) {
            track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
        }
    }, 4500);
}

// ==================== الفهرس الموضوعي والأكورديون ====================
function renderCatalogAccordion() {
    const catalogContainer = document.getElementById('catalogAccordionContainer');
    if (!catalogContainer) return;

    if (Object.keys(allBooksManifest).length === 0) {
        catalogContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:30px;">جاري تحميل الفهرس...</div>';
        return;
    }

    const categoriesMap = {};
    Object.keys(allBookGroupsMap).forEach(groupTitle => {
        const booksInGroup = allBookGroupsMap[groupTitle];
        booksInGroup.sort((a, b) => getVolumeNumber(a) - getVolumeNumber(b));
        const mainBook = booksInGroup[0];
        const cat = getBookCategory(mainBook);

        if (!categoriesMap[cat]) categoriesMap[cat] = [];
        categoriesMap[cat].push({ groupTitle, booksInGroup, mainBook });
    });

    catalogContainer.innerHTML = '';

    const categoryOrder = [
        "تفسير أهل البيت", "الكتب الأربعة", "الحديث والرواية", "كتب الغيبة",
        "عقائد", "الفقه", "سيرة النبي وأهل بيته", "رد الشبهات",
        "الأخلاق", "الدعاء والزيارة", "المخطوطات والوثائق التراثية", "المتون العامة"
    ];

    const sortedCategories = Object.keys(categoriesMap).sort((a, b) => {
        let indexA = categoryOrder.indexOf(a.trim());
        let indexB = categoryOrder.indexOf(b.trim());
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        if (indexA === 999 && indexB === 999) return a.localeCompare(b, 'ar');
        return indexA - indexB;
    });

    sortedCategories.forEach((catName, index) => {
        const items = categoriesMap[catName];
        if (!items || items.length === 0) return;

        items.sort((a, b) => a.groupTitle.localeCompare(b.groupTitle, 'ar', { numeric: true }));

        const accordionId = `acc_item_${index}`;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'catalog-accordion-item';
        itemDiv.dataset.catName = normalizeArabicText(catName);
        itemDiv.innerHTML = `
            <div class="catalog-accordion-header tactile-btn" onclick="toggleAccordionBody('${accordionId}')">
                <h4><i class="fas fa-bookmark text-gold"></i> ${escapeHtml(catName)} <span class="results-badge" style="font-size: 10px; margin-right: 6px;">${items.length} كتاب</span></h4>
                <div class="catalog-category-actions">
                    <button class="tactile-btn search-action-chip" onclick="searchInSpecificCategory('${escapeHtml(catName)}', event)" title="بحث شامل في كتب هذا القسم فقط">
                        <i class="fas fa-magnifying-glass"></i> بحث في القسم
                    </button>
                    <i class="fas fa-chevron-down text-gold" id="icon_${accordionId}" style="transition: transform 0.3s;"></i>
                </div>
            </div>
            <div class="catalog-accordion-body" id="${accordionId}">
                <div class="books-grid-container" id="grid_${accordionId}" style="padding: 4px 0 !important;"></div>
            </div>
        `;
        attachTactilePhysics(itemDiv.querySelector('.catalog-accordion-header'));
        catalogContainer.appendChild(itemDiv);

        const gridEl = itemDiv.querySelector(`#grid_${accordionId}`);
        items.forEach(item => {
            const { groupTitle, booksInGroup, mainBook } = item;
            const isSeries = booksInGroup.length > 1;
            const isPdfManuscript = !!mainBook.pdf_url;

            let coverSrc = "";
            for (let b of booksInGroup) {
                let candidate = (b.cover || "").trim();
                if (candidate !== "") { coverSrc = candidate; break; }
            }

            let coverHtml = createCoverHtml(coverSrc, groupTitle, isPdfManuscript);
            let subtitle = isPdfManuscript
                ? `${mainBook.total_pages || 0} لوحة (مخطوط PDF)`
                : (isSeries ? `${booksInGroup.length} أجزاء` : `${mainBook.total_pages || 0} صفحة`);

            const card = document.createElement("div");
            card.className = "book-card tactile-btn";
            card.dataset.bookTitle = normalizeArabicText(groupTitle);
            card.innerHTML = `
                <button class="book-favorite-btn tactile-btn ${isFavoriteBook(mainBook.id) ? 'active' : ''}" title="${isFavoriteBook(mainBook.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}" onclick="toggleFavoriteBook('${escapeHtml(mainBook.id)}', event)"><i class="${isFavoriteBook(mainBook.id) ? 'fas' : 'far'} fa-star"></i></button>
                ${coverHtml}
                <div class="book-info">
                    <h4 class="text-white">${escapeHtml(groupTitle)}</h4>
                    <p class="text-muted">${escapeHtml(subtitle)}</p>
                    <div class="progress-bar v2-book-progress" style="width: 100%;"><div class="progress-fill" style="width: ${getBookProgressPercent(mainBook.id)}%;"></div></div>
                </div>
            `;

            attachTactilePhysics(card);
            if (isPdfManuscript) card.onclick = () => window.open(mainBook.pdf_url, '_blank');
            else if (isSeries) card.onclick = () => openVolumesModal(groupTitle, booksInGroup);
            else card.onclick = () => loadAndOpenBook(mainBook.id, mainBook.title, mainBook.toc, mainBook.total_pages);
            gridEl.appendChild(card);
        });
    });
}

function toggleAccordionBody(accId) {
    const bodyEl = document.getElementById(accId);
    const iconEl = document.getElementById(`icon_${accId}`);
    if (!bodyEl) return;

    const isOpen = bodyEl.classList.contains('open');
    bodyEl.classList.toggle('open', !isOpen);
    if (iconEl) iconEl.className = !isOpen ? 'fas fa-chevron-up text-gold' : 'fas fa-chevron-down text-gold';
}

function expandOrCollapseAllCategories() {
    allCatalogExpanded = !allCatalogExpanded;
    document.querySelectorAll('.catalog-accordion-body').forEach(b => b.classList.toggle('open', allCatalogExpanded));
    document.querySelectorAll('.catalog-accordion-header i[id^="icon_"]').forEach(i => {
        i.className = allCatalogExpanded ? 'fas fa-chevron-up text-gold' : 'fas fa-chevron-down text-gold';
    });
}

function filterCatalogAccordion(val = '') {
    const norm = normalizeArabicText(val);
    document.querySelectorAll('#catalogAccordionContainer .catalog-accordion-item').forEach(acc => {
        if (!norm) {
            acc.style.display = '';
            acc.querySelectorAll('.book-card').forEach(c => c.style.display = '');
            return;
        }
        const catMatches = (acc.dataset.catName || '').includes(norm);
        let anyBookMatches = false;
        acc.querySelectorAll('.book-card').forEach(card => {
            const bm = catMatches || (card.dataset.bookTitle || '').includes(norm);
            card.style.display = bm ? '' : 'none';
            if (bm) anyBookMatches = true;
        });
        acc.style.display = (catMatches || anyBookMatches) ? '' : 'none';
        if (anyBookMatches) {
            acc.querySelector('.catalog-accordion-body')?.classList.add('open');
        }
    });
}

function searchInSpecificCategory(catName, event) {
    if (event) event.stopPropagation();
    selectCategoryScopePreset(catName);
    applyCustomBooksScope();
}

// ==================== قائمة اختيار الأجزاء والمجلدات ====================
function openVolumesModal(seriesTitle, volumesList) {
    const modalTitle = document.getElementById('volumesModalTitle');
    const container = document.getElementById('volumesListContainer');
    const searchSeriesBtn = document.getElementById('searchInSeriesBtn');
    if (modalTitle) modalTitle.innerText = seriesTitle;
    if (!container) return;

    if (searchSeriesBtn) {
        searchSeriesBtn.onclick = () => {
            closeVolumesModal();
            customSelectedGroups.clear();
            customSelectedGroups.add(seriesTitle);
            currentSearchScope = 'custom';
            updateCustomScopeBadge();
            openSearch();
            showToast(`تم حصر نطاق البحث في جميع أجزاء: ${seriesTitle}`, 'fa-bullseye');
        };
    }

    volumesList.sort((a, b) => getVolumeNumber(a) - getVolumeNumber(b));
    container.innerHTML = '';

    volumesList.forEach(vol => {
        let volNum = getVolumeNumber(vol);
        let volLabel = (volNum !== 999 && !isNaN(volNum)) ? `الجزء ${volNum} — ${vol.title || seriesTitle}` : (vol.title || seriesTitle);

        const item = document.createElement('div');
        item.className = 'toc-item tactile-btn';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <i class="fas fa-book text-gold"></i>
                <span class="toc-item-title" style="font-weight: bold; font-size: 13px;">${escapeHtml(volLabel)}</span>
            </div>
            <span class="toc-item-page">${vol.total_pages || 0} ص</span>
        `;
        attachTactilePhysics(item);
        item.onclick = () => {
            closeVolumesModal();
            if (vol.pdf_url) {
                window.open(vol.pdf_url, '_blank');
            } else {
                loadAndOpenBook(vol.id, vol.title, vol.toc, vol.total_pages);
            }
        };
        container.appendChild(item);
    });

    const modal = document.getElementById('volumesModal');
    if (modal) modal.style.display = 'flex';
}

function closeVolumesModal() {
    const modal = document.getElementById('volumesModal');
    if (modal) modal.style.display = 'none';
}
// ============================================================================
// خزانة علوم العترة | جليس الكليني — المحرك البحثي والقارئ الأسطوري (V12 Pro)
// الجزء الثاني (2 من 2): القارئ، المقارنة، التوثيق، البحث الفائق، وطبقة IndexedDB
// ============================================================================

// ==================== محرك القارئ وجلب البيانات ====================
async function fetchBookData(bookId) {
    const cleanId = (bookId || "").trim();
    const encodedId = encodeURIComponent(cleanId);

    for (let folder of SEARCH_FOLDERS) {
        try {
            let res = await fetchWithTimeout(`${folder}${cleanId}.json`, {}, 6000);
            if (!res.ok) res = await fetchWithTimeout(`${folder}${encodedId}.json`, {}, 6000);
            if (res.ok) return await res.json();
        } catch (e) {}
    }

    let fallbackId = cleanId.replace(/_[0-9]+$/, '').replace(/_ج[0-9]+$/, '');
    if (fallbackId && fallbackId !== cleanId) {
        for (let folder of SEARCH_FOLDERS) {
            try {
                let res = await fetchWithTimeout(`${folder}${fallbackId}.json`, {}, 6000);
                if (!res.ok) res = await fetchWithTimeout(`${folder}${encodeURIComponent(fallbackId)}.json`, {}, 6000);
                if (res.ok) return await res.json();
            } catch (e) {}
        }
    }

    try {
        let res = await fetchWithTimeout(`${CLOUD_FALLBACK_URL}${encodedId}.json`, {}, 7000);
        if (res.ok) return await res.json();
    } catch (e) {}

    throw new Error("تعذر جلب ملف الكتاب");
}

async function loadAndOpenBook(bookId, bookTitle, bookToc, totalPages, targetPageNumber = null, highlightQuery = "") {
    showView('readerView');
    currentBookId = bookId;
    currentBookTitle = bookTitle || allBooksManifest[bookId]?.title || bookId;
    currentActiveSearchHighlight = "";
    currentDeepLinkQuote = highlightQuery || "";
    const titleEl = document.getElementById('readerTitle');
    if (titleEl) titleEl.innerText = currentBookTitle;
    rememberRecentBook(bookId, currentBookTitle, bookTotal(bookId));

    const contentDiv = document.getElementById('pageContent');
    if (contentDiv) {
        contentDiv.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:50px;"><i class="fas fa-spinner fa-spin fa-2x text-gold"></i><p style="margin-top:10px;">جاري استحضار المتن المبارك...</p></div>';
    }

    try {
        const bookData = await fetchBookData(bookId);
        currentBookPages = bookData.pages || [];
        currentBookToc = bookData.toc || bookToc || allBooksManifest[bookId]?.toc || [];
        currentBookTotalPages = bookData.total_pages || totalPages || currentBookPages.length;

        initReaderEngine(targetPageNumber);
    } catch (err) {
        if (contentDiv) {
            contentDiv.innerHTML = `<div style="text-align:center; color:#ff6b6b; padding:30px;">⚠️ تعذر فتح الكتاب (${escapeHtml(bookId)}.json). تأكد من اتصال الإنترنت أو رفع الأجزاء.</div>`;
        }
    }
}

function initReaderEngine(targetPageNumber = null) {
    currentBookPages.sort((a, b) => Number(a.page_number) - Number(b.page_number));

    if (targetPageNumber !== null && targetPageNumber !== undefined) {
        const targetIdx = currentBookPages.findIndex(p => Number(p.page_number) === Number(targetPageNumber));
        currentPageIndex = targetIdx !== -1 ? (targetIdx + 1) : Math.min(Math.max(1, Number(targetPageNumber) || 1), currentBookPages.length || 1);
    } else {
        const savedLastPage = parseInt(localStorage.getItem(`last_page_${currentBookId}`), 10);
        if (Number.isFinite(savedLastPage) && savedLastPage >= 1 && savedLastPage <= currentBookPages.length) {
            currentPageIndex = savedLastPage;
        } else {
            currentPageIndex = 1;
        }
    }

    renderCurrentPage();
    renderTocList();
    renderBookmarksList();
}

function getCurrentChapterForPage(realPageNum) {
    if (!Array.isArray(currentBookToc) || currentBookToc.length === 0) return "";
    let currentChap = "";
    const pNum = Number(realPageNum) || 1;
    for (const item of currentBookToc) {
        const cPage = Number(item.page_number) || 0;
        if (cPage <= pNum) {
            currentChap = item.title || "";
        } else {
            break;
        }
    }
    return currentChap;
}

function cleanPageWatermarkHtml(rawHtml) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml || "";
    tempDiv.querySelectorAll('*').forEach(el => {
        if (el.textContent && el.textContent.toLowerCase().includes('t.me/jali4s') && el.textContent.length < 250) {
            el.remove();
        }
    });
    let cleaned = tempDiv.innerHTML;
    cleaned = cleaned.replace(/مكتبة\s*الامام\s*السجاد:\s*جليس\s*الكليني\s*-\s*https:\/\/t\.me\/Jali4s/gi, '');
    cleaned = cleaned.replace(/مكتبة\s*جليس\s*-\s*https:\/\/t\.me\/Jali4s/gi, '');
    cleaned = cleaned.replace(/<div[^>]*border-top[^>]*dashed[^>]*>\s*<\/div>/gi, '');
    return cleaned;
}

function renderCurrentPage() {
    const contentDiv = document.getElementById('pageContent');
    const rangeSlider = document.getElementById('pageRangeSlider');
    const currentLbl = document.getElementById('currentPaginationLabel');
    const totalLbl = document.getElementById('totalPaginationLabel');
    const chapterSub = document.getElementById('readerCurrentChapterSubtitle');

    if (!contentDiv) return;
    if (currentBookPages.length === 0) {
        contentDiv.innerHTML = '<div style="text-align:center; color:#888;">لا توجد صفحات متاحة.</div>';
        return;
    }

    const pageData = currentBookPages[currentPageIndex - 1];
    let rawHtml = cleanPageWatermarkHtml(pageData ? (pageData.content || "صفحة فارغة") : "صفحة فارغة");

    const watermarkHtml = `
        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px dashed rgba(150, 150, 150, 0.3); text-align: center; font-size: 13px; font-weight: 500; font-family: 'Cairo', sans-serif; direction: rtl; clear: both; user-select: none; opacity: 0.9;">
            <span style="color: var(--text-muted);">مكتبة الإمام السجاد: </span>
            <a href="https://t.me/Jali4s" target="_blank" rel="noopener" style="color: var(--gold-main); font-weight: 700;">جليس الكليني - https://t.me/Jali4s</a>
        </div>
    `;
    rawHtml += watermarkHtml;

    const activeHighlight = currentActiveSearchHighlight || currentDeepLinkQuote;
    if (activeHighlight) {
        contentDiv.innerHTML = highlightArabicText(rawHtml, activeHighlight);
    } else {
        contentDiv.innerHTML = rawHtml;
    }
    currentDeepLinkQuote = "";

    window.scrollTo({ top: 0, behavior: 'instant' });

    let displayPage = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    const pagenEl = contentDiv.querySelector('.pagen');
    if (pagenEl) {
        const match = pagenEl.innerText.match(/\d+/);
        if (match) displayPage = match[0];
    }

    if (chapterSub) {
        const chap = getCurrentChapterForPage(displayPage);
        chapterSub.textContent = chap ? `باب: ${chap}` : "";
    }

    syncReaderUrl(currentPageIndex, true);

    contentDiv.querySelectorAll('.fnote, .footnote, .hawamish, .margin, .note').forEach(el => {
        el.style.setProperty('font-size', '11px', 'important');
        el.style.setProperty('line-height', '1.55', 'important');
    });

    if (rangeSlider) {
        rangeSlider.min = 1;
        rangeSlider.max = currentBookPages.length;
        rangeSlider.value = currentPageIndex;
    }

    if (currentLbl) currentLbl.innerText = displayPage;
    if (totalLbl) totalLbl.innerText = currentBookTotalPages;

    if (currentBookId) {
        try {
            localStorage.setItem(`last_page_${currentBookId}`, currentPageIndex);
        } catch (e) {}
    }

    const pct = Math.min(100, Math.max(0, Math.round((currentPageIndex / Math.max(currentBookPages.length, 1)) * 100)));
    const progressFill = document.getElementById('readerProgressFill');
    if (progressFill) progressFill.style.width = `${pct}%`;

    rememberRecentBook(currentBookId, currentBookTitle, currentBookTotalPages);
    updateBookmarkIconState();
}

function handleScreenTap(e) {
    if (window.getSelection && window.getSelection().toString().length > 0) return;
    if (e.target.closest('a, button, input, .glass-modal, .selection-toolbar, .comparison-drawer')) return;

    const screenWidth = window.innerWidth;
    const tapX = e.clientX;

    if (tapX < screenWidth * 0.32) nextPage();
    else if (tapX > screenWidth * 0.68) prevPage();
}

function executeInlineJump() {
    const input = document.getElementById('inlineJumpInput');
    if (!input || !input.value.trim()) return;

    let targetPage = parseInt(input.value.trim(), 10);
    if (isNaN(targetPage)) return;

    let foundIndex = currentBookPages.findIndex(p => Number(p.page_number) === targetPage);
    if (foundIndex !== -1) {
        currentPageIndex = foundIndex + 1;
    } else {
        let closestIndex = 0;
        let minDiff = Infinity;
        currentBookPages.forEach((p, idx) => {
            let pNum = Number(p.page_number) || (idx + 1);
            let diff = Math.abs(pNum - targetPage);
            if (diff < minDiff) { minDiff = diff; closestIndex = idx; }
        });
        currentPageIndex = closestIndex + 1;
    }

    input.value = '';
    renderCurrentPage();
}

function nextPage() {
    if (currentPageIndex < currentBookPages.length) {
        currentPageIndex++;
        renderCurrentPage();
    }
}

function prevPage() {
    if (currentPageIndex > 1) {
        currentPageIndex--;
        renderCurrentPage();
    }
}

function slidePageChanged(val) {
    let idx = parseInt(val, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= currentBookPages.length) {
        currentPageIndex = idx;
        renderCurrentPage();
    }
}

function closeReader() {
    currentActiveSearchHighlight = "";
    if (isZenModeActive) toggleZenMode(false);
    if (history.state && history.state.view === 'readerView') {
        history.back();
    } else {
        showView('homeView', false);
    }
}

function toggleZenMode(forceState) {
    isZenModeActive = typeof forceState === 'boolean' ? forceState : !isZenModeActive;
    document.body.classList.toggle('zen-reading-mode', isZenModeActive);
    const exitBtn = document.getElementById('zenExitFloatingBtn');
    if (exitBtn) exitBtn.style.display = isZenModeActive ? 'inline-flex' : 'none';
    if (isZenModeActive) showToast('تم تفعيل وضع التركيز الغامر', 'fa-expand');
}

// ==================== درج المقارنة المرجعية للباحث ====================
function restorePinnedComparisonFromStorage() {
    try {
        const raw = localStorage.getItem(PINNED_COMPARE_KEY);
        if (raw) pinnedComparisonData = JSON.parse(raw);
    } catch (e) {}
}

function togglePinCurrentPageForComparison() {
    const drawer = document.getElementById('comparisonDrawer');
    if (!drawer) return;

    if (drawer.style.display !== 'none' && pinnedComparisonData) {
        closeComparisonDrawer();
        return;
    }

    if (!pinnedComparisonData) {
        updatePinWithCurrentPage();
    } else {
        renderComparisonDrawer();
    }
}

function updatePinWithCurrentPage() {
    if (!currentBookId || !currentBookPages.length) return;
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    pinnedComparisonData = {
        bookId: currentBookId,
        bookTitle: currentBookTitle,
        pageIndex: currentPageIndex,
        pageNum: pageNum,
        content: cleanPageWatermarkHtml(pageData?.content || '')
    };
    try {
        localStorage.setItem(PINNED_COMPARE_KEY, JSON.stringify(pinnedComparisonData));
    } catch (e) {}
    renderComparisonDrawer();
    showToast('تم تثبيت الصفحة في لوحة المقارنة المرجعية', 'fa-columns');
}

function renderComparisonDrawer() {
    const drawer = document.getElementById('comparisonDrawer');
    const titleEl = document.getElementById('pinnedComparisonTitle');
    const bodyEl = document.getElementById('pinnedComparisonBody');
    if (!drawer || !pinnedComparisonData) return;

    titleEl.textContent = `${pinnedComparisonData.bookTitle} — صـ ${pinnedComparisonData.pageNum}`;
    bodyEl.innerHTML = pinnedComparisonData.content || 'صفحة فارغة';
    drawer.style.display = 'flex';
    document.body.classList.add('comparison-open');
}

function closeComparisonDrawer() {
    const drawer = document.getElementById('comparisonDrawer');
    if (drawer) drawer.style.display = 'none';
    document.body.classList.remove('comparison-open');
}

function jumpToPinnedPage() {
    if (!pinnedComparisonData) return;
    const b = allBooksManifest[pinnedComparisonData.bookId];
    if (!b) return;
    loadAndOpenBook(pinnedComparisonData.bookId, pinnedComparisonData.bookTitle, b.toc, b.total_pages, pinnedComparisonData.pageNum);
}

// ==================== مولّد التوثيق الأكاديمي (Citation Generator) ====================
function openCitationModal(fromSelection = false) {
    if (!currentBookId) return;
    const modal = document.getElementById('citationModal');
    const container = document.getElementById('citationStylesContainer');
    if (!modal || !container) return;

    const book = allBooksManifest[currentBookId] || {};
    const groupTitle = getGroupName(book, currentBookId);
    const volNum = getVolumeNumber(book);
    const hasVol = volNum !== 999 && !isNaN(volNum) && (allBookGroupsMap[groupTitle]?.length > 1);
    const author = book.author || book.writer || "مؤلف المتن";
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    const chapter = getCurrentChapterForPage(pageNum);

    let rawQuote = "";
    if (fromSelection) {
        rawQuote = (window.getSelection()?.toString().trim() || savedSelectionText || "").trim();
    }
    if (!rawQuote && pageData) {
        const tmp = document.createElement('div');
        tmp.innerHTML = cleanPageWatermarkHtml(pageData.content || '');
        rawQuote = (tmp.textContent || '').trim().slice(0, 260) + '...';
    }

    const volPart = hasVol ? `، ج ${volNum}` : '';
    const chapPart = chapter ? `، ${chapter}` : '';

    const styles = [
        {
            name: "التوثيق التراثي / الحوزوي التفصيلي",
            text: `«${rawQuote}» — المصدر: ${groupTitle}${volPart}، ص ${pageNum}${chapPart}.`
        },
        {
            name: "حاشية الرسائل والبحوث الأكاديمية",
            text: `${author !== "مؤلف المتن" ? author + "، " : ""}${groupTitle}${volPart}${chapPart}، ص ${pageNum} (نسخة خزانة علوم العترة الرقمية).`
        },
        {
            name: "نمط التوثيق العالمي (APA Style)",
            text: `${author !== "مؤلف المتن" ? author : groupTitle}. ${book.title || groupTitle}${hasVol ? ` (مج. ${volNum})` : ''}، ص. ${pageNum}. خزانة علوم العترة - جليس الكليني.`
        },
        {
            name: "توثيق مختصر مع الرابط المباشر للموضع",
            text: `«${rawQuote}»\n[${groupTitle}${volPart} : ص ${pageNum}]\n${buildDeepLink(currentPageIndex)}`
        }
    ];

    container.innerHTML = styles.map(s => `
        <div class="citation-card">
            <div class="citation-card-head">
                <span><i class="fas fa-feather-pointed"></i> ${escapeHtml(s.name)}</span>
                <button class="tactile-btn v2-primary-btn" onclick="copyCitationStyleText('${encodeURIComponent(s.text)}')">
                    <i class="fas fa-copy"></i> نسخ التوثيق
                </button>
            </div>
            <div class="citation-text-box">${escapeHtml(s.text)}</div>
        </div>
    `).join('');

    hideSelectionToolbar();
    modal.style.display = 'flex';
}

function closeCitationModal() {
    const modal = document.getElementById('citationModal');
    if (modal) modal.style.display = 'none';
}

function copyCitationStyleText(encodedText) {
    const text = decodeURIComponent(encodedText);
    navigator.clipboard?.writeText(text).then(() => {
        showToast('تم نسخ التوثيق العلمي بنجاح', 'fa-graduation-cap');
        closeCitationModal();
    });
}

// ==================== شريط الأدوات والوسوم والاقتباسات ====================
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const toolbar = document.getElementById('selectionToolbar');
    if (!toolbar) return;

    if (selection && selection.toString().trim().length > 0 && document.getElementById('readerView')?.classList.contains('active')) {
        try {
            savedSelectionRange = selection.getRangeAt(0).cloneRange();
            savedSelectionText = selection.toString().trim();
            toolbar.style.display = 'flex';
        } catch (e) {}
    } else {
        setTimeout(() => {
            if (!window.getSelection()?.toString().trim()) {
                toolbar.style.display = 'none';
            }
        }, 280);
    }
});

function applyHighlight(className) {
    if (!savedSelectionRange) return;
    const span = document.createElement('span');
    span.className = className;
    try {
        savedSelectionRange.surroundContents(span);
    } catch (e) {
        document.execCommand('backColor', false, className === 'hl-yellow' ? '#ffeb3b' : (className === 'hl-green' ? '#4caf50' : '#e91e63'));
    }
    hideSelectionToolbar();
    showToast("تم تظليل النص بنجاح", "fa-highlighter");
}

function removeHighlight() {
    if (!savedSelectionRange) return;
    document.execCommand('removeFormat', false, null);
    hideSelectionToolbar();
    showToast("تمت إزالة التظليل", "fa-eraser");
}

function searchSelectedTextInLibrary() {
    const text = (window.getSelection()?.toString().trim() || savedSelectionText).trim();
    if (!text) return;
    hideSelectionToolbar();
    const input = document.getElementById('searchInput');
    if (input) input.value = text.slice(0, 120);
    currentSearchTarget = 'fulltext';
    document.getElementById('searchTargetTocBtn')?.classList.remove('active');
    document.getElementById('searchTargetTopicsBtn')?.classList.remove('active');
    document.getElementById('searchTargetTextBtn')?.classList.add('active');
    openSearch();
    setTimeout(() => handleSearchInput(input.value), 80);
}

function getStoredTags() {
    const data = localStorage.getItem('custom_tags_list');
    return data ? JSON.parse(data) : defaultTags;
}

function saveStoredTags(tags) {
    localStorage.setItem('custom_tags_list', JSON.stringify(tags));
}

function getStoredTaggedSnippets() {
    const data = localStorage.getItem('custom_tagged_snippets');
    return data ? JSON.parse(data) : [];
}

function saveStoredTaggedSnippets(items) {
    localStorage.setItem('custom_tagged_snippets', JSON.stringify(items));
}

function openAddTagModal() {
    const text = window.getSelection()?.toString().trim() || savedSelectionText;
    if (!text) {
        showToast("يرجى تحديد نص لتصنيفه أولاً", "fa-triangle-exclamation");
        return;
    }
    savedSelectionText = text;
    if (window.getSelection) window.getSelection().removeAllRanges();

    renderAvailableTagsSelection();
    const modal = document.getElementById('addTagModal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('selectionToolbar').style.display = 'none';
}

function closeAddTagModal() {
    const modal = document.getElementById('addTagModal');
    if (modal) modal.style.display = 'none';
}

function renderAvailableTagsSelection() {
    const container = document.getElementById('availableTagsList');
    if (!container) return;

    const tags = getStoredTags();
    container.innerHTML = '';

    tags.forEach(t => {
        const btn = document.createElement('div');
        btn.className = 'tag-badge-select tactile-btn';
        btn.style.backgroundColor = t.color;
        btn.innerHTML = `<i class="fas fa-tag"></i> ${escapeHtml(t.name)}`;
        attachTactilePhysics(btn);
        btn.onclick = () => assignTagToSelection(t.name, t.color);
        container.appendChild(btn);
    });
}

function createNewCustomTag() {
    const nameInput = document.getElementById('newTagNameInput');
    const colorInput = document.getElementById('newTagColorInput');
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
        showToast("يرجى كتابة اسم للوسم أولاً", "fa-triangle-exclamation");
        return;
    }

    const tags = getStoredTags();
    if (!tags.some(t => t.name === name)) {
        tags.push({ name, color });
        saveStoredTags(tags);
    }

    nameInput.value = '';
    assignTagToSelection(name, color);
}

function assignTagToSelection(tagName, tagColor) {
    if (!savedSelectionText) return;

    let pageData = currentBookPages[currentPageIndex - 1];
    let pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;

    const taggedItems = getStoredTaggedSnippets();
    taggedItems.unshift({
        id: 'tag_' + Date.now(),
        tagName: tagName,
        tagColor: tagColor,
        text: savedSelectionText,
        bookId: currentBookId,
        bookTitle: currentBookTitle,
        pageNum: pageNum,
        pageIndex: currentPageIndex,
        date: new Date().toLocaleDateString('ar-IQ')
    });

    saveStoredTaggedSnippets(taggedItems);
    closeAddTagModal();
    showToast(`تم تصنيف النص تحت وسم [${tagName}]`, "fa-tag");
}

function renderTagsView(filterTag = 'all') {
    currentTagFilter = filterTag;
    const pillsContainer = document.getElementById('tagsFilterPillsContainer');
    const listContainer = document.getElementById('taggedItemsListContainer');
    if (!pillsContainer || !listContainer) return;

    const tags = getStoredTags();
    const items = getStoredTaggedSnippets();

    pillsContainer.innerHTML = `
        <button class="filter-pill ${currentTagFilter === 'all' ? 'active' : ''} tactile-btn" onclick="renderTagsView('all')">
            <i class="fas fa-layer-group"></i> كل الوسوم (${items.length})
        </button>
    `;

    tags.forEach(t => {
        const count = items.filter(i => i.tagName === t.name).length;
        const btn = document.createElement('button');
        btn.className = `filter-pill ${currentTagFilter === t.name ? 'active' : ''} tactile-btn`;
        btn.style.borderColor = t.color;
        btn.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${t.color}; margin-left:4px;"></span> ${escapeHtml(t.name)} (${count})`;
        btn.onclick = () => renderTagsView(t.name);
        pillsContainer.appendChild(btn);
    });

    const filteredItems = (currentTagFilter === 'all')
        ? items
        : items.filter(i => i.tagName === currentTagFilter);

    listContainer.innerHTML = '';

    if (filteredItems.length === 0) {
        listContainer.innerHTML = `
            <div class="search-empty-state">
                <div class="empty-icon-box"><i class="fas fa-tags text-gold"></i></div>
                <h4>لا توجد نصوص موسومة في هذا التصنيف</h4>
                <p>حدد أي نص أثناء قراءة الكتب واضغط على «وسم» لإضافته هنا.</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'tagged-item-card';
        card.innerHTML = `
            <div class="tagged-card-header">
                <span class="tag-pill-badge" style="background-color: ${item.tagColor || '#D4AF37'};">
                    <i class="fas fa-tag"></i> ${escapeHtml(item.tagName)}
                </span>
                <span style="font-size: 10px; color: var(--text-muted);">${escapeHtml(item.date || '')}</span>
            </div>
            <p class="tagged-quote-text">«${escapeHtml(item.text)}»</p>
            <div class="tagged-card-footer">
                <div>
                    <i class="fas fa-book-bookmark text-gold"></i> ${escapeHtml(item.bookTitle)} (صـ ${escapeHtml(item.pageNum)})
                </div>
                <div class="tagged-actions">
                    <button class="tactile-btn mini-action-btn" title="انتقال للموضع في الكتاب" onclick="jumpToTaggedSnippet('${escapeHtml(item.bookId)}', '${escapeHtml(item.bookTitle)}', ${Number(item.pageIndex || item.pageNum) || 1})">
                        <i class="fas fa-arrow-up-right-from-square"></i>
                    </button>
                    <button class="tactile-btn mini-action-btn" title="مشاركة" onclick="shareTaggedSnippet('${escapeHtml(item.id)}')">
                        <i class="fas fa-share-nodes"></i>
                    </button>
                    <button class="tactile-btn mini-action-btn" title="حذف" style="color:#ff5252;" onclick="deleteTaggedSnippet('${escapeHtml(item.id)}')">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        attachTactilePhysics(card);
        listContainer.appendChild(card);
    });
}

async function jumpToTaggedSnippet(bookId, bookTitle, pageIndexOrNum) {
    const book = allBooksManifest[bookId] || {};
    if (book.pdf_url) {
        window.open(book.pdf_url, '_blank');
        return;
    }
    await loadAndOpenBook(bookId, bookTitle || book.title, book.toc, book.total_pages);
    currentPageIndex = parseInt(pageIndexOrNum, 10) || 1;
    renderCurrentPage();
}

function shareTaggedSnippet(itemId) {
    const items = getStoredTaggedSnippets();
    const target = items.find(i => i.id === itemId);
    if (!target) return;

    const shareContent = `✦ [${target.tagName}] من علوم آل محمد:\n\n«${target.text}»\n\n📖 المصدر: ${target.bookTitle} (صـ ${target.pageNum})\n✦ خزانة علوم العترة: https://t.me/Jali4s`;

    if (navigator.share) {
        navigator.share({ title: target.bookTitle, text: shareContent }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareContent);
        showToast("تم نسخ النص الموسوم مع المصدر", "fa-clipboard-check");
    }
}

function deleteTaggedSnippet(itemId) {
    showConfirm("هل أنت متأكد من رغبتك في إزالة هذا الشاهد من الوسوم؟", () => {
        let items = getStoredTaggedSnippets();
        items = items.filter(i => i.id !== itemId);
        saveStoredTaggedSnippets(items);
        renderTagsView(currentTagFilter);
        showToast("تمت إزالة الشاهد من الوسوم", "fa-trash-can");
    });
}

function exportTaggedSnippetsAsReport() {
    const items = getStoredTaggedSnippets();
    if (!items.length) {
        showToast("لا توجد شواهد موسومة لتصديرها", "fa-triangle-exclamation");
        return;
    }
    let txt = "=== تقرير الشواهد الموسومة — خزانة علوم العترة (جليس الكليني) ===\n\n";
    items.forEach((item, idx) => {
        txt += `${idx + 1}. [${item.tagName}] (${item.date || ''})\n«${item.text}»\nالمصدر: ${item.bookTitle} — ص ${item.pageNum}\n----------------------------------------\n`;
    });
    downloadPlainTextFile(txt, 'tagged-research-snippets.txt');
    showToast("تم تصدير الشواهد الموسومة كملف نصي", "fa-file-export");
}

function downloadPlainTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ==================== الإشارات المرجعية وفهرس الكتاب ====================
function getStoredBookmarks() {
    const data = localStorage.getItem(`bookmarks_${currentBookId}`);
    return data ? JSON.parse(data) : [];
}

function toggleBookmark() {
    if (!currentBookId) return;

    let bookmarks = getStoredBookmarks();
    let curPageData = currentBookPages[currentPageIndex - 1];
    let curPageNum = curPageData ? (curPageData.page_number || currentPageIndex) : currentPageIndex;

    const existingIndex = bookmarks.findIndex(b => b.pageIndex === currentPageIndex);

    if (existingIndex !== -1) {
        bookmarks.splice(existingIndex, 1);
        showToast("تمت إزالة الإشارة المرجعية", "fa-bookmark");
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = curPageData ? curPageData.content : '';
        const preview = (tempDiv.textContent || '').trim().substring(0, 55) + '...';

        bookmarks.push({
            pageIndex: currentPageIndex,
            pageNum: curPageNum,
            preview: preview,
            date: new Date().toLocaleDateString('ar-IQ')
        });
        showToast(`تم حفظ الإشارة المرجعية (صـ ${curPageNum})`, "fa-bookmark");
    }

    try {
        localStorage.setItem(`bookmarks_${currentBookId}`, JSON.stringify(bookmarks));
    } catch (e) {}
    updateBookmarkIconState();
    renderBookmarksList();
}

function updateBookmarkIconState() {
    const btn = document.getElementById('bookmarkBtn');
    if (!btn || !currentBookId) return;
    let bookmarks = getStoredBookmarks();
    const isBookmarked = bookmarks.some(b => b.pageIndex === currentPageIndex);
    btn.innerHTML = isBookmarked ? '<i class="fas fa-bookmark" style="color:var(--gold-main);"></i>' : '<i class="far fa-bookmark"></i>';
}

function renderBookmarksList() {
    const container = document.getElementById('bookmarksListContainer');
    if (!container || !currentBookId) return;

    const bookmarks = getStoredBookmarks();
    container.innerHTML = '';

    if (bookmarks.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 25px; font-size:12px;">لا توجد إشارات مرجعية محفوظة في هذا الكتاب.</div>';
        return;
    }

    bookmarks.forEach((b, bIdx) => {
        const div = document.createElement('div');
        div.className = 'toc-item tactile-btn';
        div.innerHTML = `
            <div style="flex:1; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span class="toc-item-page">صفحة ${escapeHtml(b.pageNum)}</span>
                    <span style="font-size:10px; color:#888;">${escapeHtml(b.date || '')}</span>
                </div>
                <p style="font-size:11px; color:#aaa; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(b.preview)}</p>
            </div>
            <button style="background:none; border:none; color:#ff5252; margin-right:8px; cursor:pointer;" onclick="deleteBookmark(${bIdx}, event)"><i class="fas fa-trash-can"></i></button>
        `;
        attachTactilePhysics(div);
        div.onclick = () => {
            currentPageIndex = b.pageIndex;
            renderCurrentPage();
            closeTocModal();
        };
        container.appendChild(div);
    });
}

function deleteBookmark(idx, event) {
    event.stopPropagation();
    let bookmarks = getStoredBookmarks();
    bookmarks.splice(idx, 1);
    try {
        localStorage.setItem(`bookmarks_${currentBookId}`, JSON.stringify(bookmarks));
    } catch (e) {}
    updateBookmarkIconState();
    renderBookmarksList();
    showToast("تم حذف الإشارة المرجعية", "fa-trash-can");
}

function switchModalTab(tab) {
    const tocTab = document.getElementById('tabTocBtn');
    const bmarksTab = document.getElementById('tabBookmarksBtn');
    const tocList = document.getElementById('tocListContainer');
    const bmarksList = document.getElementById('bookmarksListContainer');
    const filterWrap = document.getElementById('tocFilterBoxWrap');

    if (tab === 'toc') {
        tocTab?.classList.add('active');
        bmarksTab?.classList.remove('active');
        if (tocList) tocList.style.display = 'flex';
        if (bmarksList) bmarksList.style.display = 'none';
        if (filterWrap) filterWrap.style.display = 'flex';
    } else {
        bmarksTab?.classList.add('active');
        tocTab?.classList.remove('active');
        if (tocList) tocList.style.display = 'none';
        if (bmarksList) bmarksList.style.display = 'flex';
        if (filterWrap) filterWrap.style.display = 'none';
    }
}

function renderTocList(filterQuery = '') {
    const tocContainer = document.getElementById('tocListContainer');
    if (!tocContainer) return;
    tocContainer.innerHTML = '';

    if (currentBookToc.length === 0) {
        tocContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">لا يوجد فهرس تفصيلي مسجل لهذا الكتاب.</div>';
        return;
    }

    const normFilter = normalizeArabicText(filterQuery);
    const filteredToc = normFilter
        ? currentBookToc.filter(item => normalizeArabicText(item.title || '').includes(normFilter))
        : currentBookToc;

    if (filteredToc.length === 0) {
        tocContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">لا توجد أبواب مطابقة للتصفية.</div>';
        return;
    }

    filteredToc.forEach(item => {
        const div = document.createElement('div');
        div.className = 'toc-item tactile-btn';
        div.innerHTML = `
            <span class="toc-item-title">${escapeHtml(item.title)}</span>
            <span class="toc-item-page">ص ${escapeHtml(item.page_number)}</span>
        `;
        attachTactilePhysics(div);
        div.onclick = () => {
            const targetIdx = currentBookPages.findIndex(p => Number(p.page_number) === Number(item.page_number));
            currentPageIndex = targetIdx !== -1 ? (targetIdx + 1) : 1;
            currentActiveSearchHighlight = "";
            renderCurrentPage();
            closeTocModal();
        };
        tocContainer.appendChild(div);
    });
}

function filterReaderTocList(val) {
    renderTocList(val);
}

function openTocModal() {
    const m = document.getElementById('tocModal');
    if (m) m.style.display = 'flex';
}
function closeTocModal() {
    const m = document.getElementById('tocModal');
    if (m) m.style.display = 'none';
}

// ==================== استوديو المظهر والألوان (8 ثيمات متناسقة + تخصيص) ====================
const APPEARANCE_KEY = 'library_appearance_v3';
const APPEARANCE_PRESETS = {
    royal:     { accent: '#D4AF37', bg: '#030705', text: '#F8F9FA', brightness: 100 },
    emerald:   { accent: '#2E8B57', bg: '#05110C', text: '#F3F7F2', brightness: 100 },
    navy:      { accent: '#5B86E5', bg: '#060D1A', text: '#F2F5F8', brightness: 100 },
    burgundy:  { accent: '#C49A6C', bg: '#16070B', text: '#F8F1EC', brightness: 100 },
    turquoise: { accent: '#26C6DA', bg: '#041216', text: '#ECFAFC', brightness: 100 },
    amethyst:  { accent: '#AB47BC', bg: '#100716', text: '#F7EEF9', brightness: 100 },
    slate:     { accent: '#AAB7C4', bg: '#0B0F14', text: '#EEF2F6', brightness: 100 },
    paper:     { accent: '#8C6239', bg: '#F4ECD8', text: '#2B2118', brightness: 100 }
};

function setReadingTheme(themeName) {
    const appBody = document.getElementById('appBody');
    if (!appBody) return;
    appBody.classList.remove('theme-royal', 'theme-sepia', 'theme-dark', 'theme-light');
    appBody.classList.add(themeName);
    try {
        localStorage.setItem('reading_theme', themeName);
    } catch (e) {}
}

function openSettings() {
    const m = document.getElementById('settingsModal');
    if (m) m.style.display = 'flex';
}
function closeSettings() {
    const m = document.getElementById('settingsModal');
    if (m) m.style.display = 'none';
}
function openAppearanceSettings() {
    const m = document.getElementById('appearanceModal');
    if (m) {
        m.style.display = 'flex';
        syncAppearanceControls();
    }
}
function closeAppearanceSettings() {
    const m = document.getElementById('appearanceModal');
    if (m) m.style.display = 'none';
}

function hexToRgb(hex) {
    const h = String(hex || '').replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(h)) return { r: 212, g: 175, b: 55 };
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function mixHex(a, b, t = 0.5) {
    const x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex(x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t);
}

function luminance(hex) {
    const c = hexToRgb(hex);
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function contrastRatio(a, b) {
    const l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function setCssVar(name, value) {
    document.documentElement.style.setProperty(name, value);
}

function applyAppearance(data, save = true) {
    const d = { ...APPEARANCE_PRESETS.royal, ...(data || {}) };
    const dark = luminance(d.bg) < 0.45;
    const surface = mixHex(d.bg, dark ? '#FFFFFF' : '#000000', dark ? 0.075 : 0.045);
    const surface2 = mixHex(d.bg, dark ? '#FFFFFF' : '#000000', dark ? 0.125 : 0.075);
    const border = mixHex(d.bg, d.accent, 0.46);
    const muted = mixHex(d.text, d.bg, 0.45);

    setCssVar('--bg-dark', d.bg);
    setCssVar('--gold-main', d.accent);
    setCssVar('--gold-bright', mixHex(d.accent, d.text, 0.28));
    setCssVar('--gold-dim', `rgba(${hexToRgb(d.accent).r}, ${hexToRgb(d.accent).g}, ${hexToRgb(d.accent).b}, 0.15)`);
    setCssVar('--gold-border', border);
    setCssVar('--surface-glass', surface);
    setCssVar('--surface-glass-strong', surface2);
    setCssVar('--surface-border', `rgba(${hexToRgb(d.text).r},${hexToRgb(d.text).g},${hexToRgb(d.text).b},0.09)`);
    setCssVar('--text-white', d.text);
    setCssVar('--text-muted', muted);
    setCssVar('--text-gold', mixHex(d.accent, d.text, 0.22));
    setCssVar('--appearance-brightness', (Number(d.brightness) || 100) / 100);

    const badge = document.getElementById('appearanceContrastBadge');
    if (badge) {
        const ratio = contrastRatio(d.text, d.bg);
        badge.textContent = ratio >= 4.5 ? 'متناسق ومريح' : ratio >= 3 ? 'جيد' : 'يحتاج موازنة';
        badge.classList.toggle('is-warning', ratio < 4.5);
    }

    document.querySelectorAll('.palette-preset').forEach(b => b.classList.toggle('active', b.dataset.preset === d.preset));
    if (save) {
        try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(d)); } catch (e) {}
    }
}

function applyPalettePreset(name) {
    const p = APPEARANCE_PRESETS[name] || APPEARANCE_PRESETS.royal;
    const a = document.getElementById('uiAccentColor');
    const bg = document.getElementById('uiBackgroundColor');
    const t = document.getElementById('uiTextColor');
    const br = document.getElementById('uiBrightness');
    if (a) a.value = p.accent;
    if (bg) bg.value = p.bg;
    if (t) t.value = p.text;
    if (br) br.value = p.brightness;
    applyAppearance({ ...p, preset: name });
}

function applyCustomAppearance() {
    const a = document.getElementById('uiAccentColor');
    const bg = document.getElementById('uiBackgroundColor');
    const t = document.getElementById('uiTextColor');
    const br = document.getElementById('uiBrightness');
    const out = document.getElementById('uiBrightnessValue');
    const d = {
        accent: a?.value || '#D4AF37',
        bg: bg?.value || '#030705',
        text: t?.value || '#F8F9FA',
        brightness: Number(br?.value || 100),
        preset: 'custom'
    };
    if (out) out.textContent = d.brightness + '%';
    applyAppearance(d);
}

function autoBalanceAppearance() {
    const bg = document.getElementById('uiBackgroundColor')?.value || '#030705';
    let text = document.getElementById('uiTextColor')?.value || '#F8F9FA';
    const accent = document.getElementById('uiAccentColor')?.value || '#D4AF37';
    if (contrastRatio(text, bg) < 4.5) text = luminance(bg) < 0.45 ? '#F8F9FA' : '#141414';
    if (contrastRatio(accent, bg) < 3) document.getElementById('uiAccentColor').value = mixHex(accent, text, 0.42);
    document.getElementById('uiTextColor').value = text;
    applyCustomAppearance();
    showToast('تمت موازنة التباين والألوان تلقائياً', 'fa-wand-magic-sparkles');
}

function syncAppearanceControls() {
    let d = APPEARANCE_PRESETS.royal;
    try { d = { ...d, ...JSON.parse(localStorage.getItem(APPEARANCE_KEY) || '{}') }; } catch (e) {}
    const a = document.getElementById('uiAccentColor');
    const bg = document.getElementById('uiBackgroundColor');
    const t = document.getElementById('uiTextColor');
    const br = document.getElementById('uiBrightness');
    const out = document.getElementById('uiBrightnessValue');
    if (a) a.value = d.accent;
    if (bg) bg.value = d.bg;
    if (t) t.value = d.text;
    if (br) br.value = d.brightness || 100;
    if (out) out.textContent = (d.brightness || 100) + '%';
    applyAppearance(d, false);
}

function resetCustomAppearance() {
    applyPalettePreset('royal');
}

(function initAppearance() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(APPEARANCE_KEY) || 'null'); } catch (e) {}
    if (saved) applyAppearance(saved, false);

    const savedTheme = localStorage.getItem('reading_theme');
    if (savedTheme && ['theme-royal', 'theme-sepia', 'theme-dark', 'theme-light'].includes(savedTheme)) {
        setReadingTheme(savedTheme);
    }
})();

function adjustFontSize(delta) {
    let content = document.getElementById('pageContent');
    if (content) {
        let currentSize = parseInt(window.getComputedStyle(content).fontSize, 10) || 18;
        let newSize = Math.min(Math.max(currentSize + delta, 12), 38);
        content.style.fontSize = newSize + 'px';
        const display = document.getElementById('fontSizeDisplay');
        if (display) display.innerText = newSize;
    }
}

function adjustLineHeight(delta) {
    let content = document.getElementById('pageContent');
    if (content) {
        let currentLh = parseFloat(content.style.lineHeight) || 2.1;
        let newLh = Math.min(Math.max(Number((currentLh + delta).toFixed(2)), 1.4), 3.0);
        content.style.lineHeight = String(newLh);
        const display = document.getElementById('lineHeightDisplay');
        if (display) display.innerText = newLh;
    }
}

function changeFontFamily(font) {
    const content = document.getElementById('pageContent');
    if (!content) return;
    if (font === 'Amiri') content.style.fontFamily = "'Amiri', serif";
    else if (font === 'Naskh') content.style.fontFamily = "'Noto Naskh Arabic', 'Amiri', serif";
    else content.style.fontFamily = "'Cairo', sans-serif";
}

// ==================== البحث الداخلي في الكتاب المفتوح ====================
function openInBookSearch() {
    const modal = document.getElementById('inBookSearchModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            const input = document.getElementById('inBookSearchInput');
            if (input) input.focus();
        }, 150);
    }
}

function closeInBookSearch() {
    const modal = document.getElementById('inBookSearchModal');
    if (modal) modal.style.display = 'none';
}

function executeInBookSearch(val) {
    const query = val.trim();
    const container = document.getElementById('inBookSearchResults');
    const countBar = document.getElementById('inBookSearchCountBar');
    if (!container) return;

    if (!query) {
        if (countBar) countBar.style.display = 'none';
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">اكتب كلمة أو جملة للبحث داخل صفحات هذا الكتاب...</p>';
        return;
    }

    container.innerHTML = '';
    let found = 0;
    const matcher = createSearchMatcher(query);

    currentBookPages.forEach((page, idx) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = page.content || '';
        const rawText = tempDiv.textContent || '';

        if (matcher(rawText)) {
            found++;
            const snippet = generateSearchSnippet(rawText, query);
            const chap = getCurrentChapterForPage(page.page_number || (idx + 1));
            const item = document.createElement('div');
            item.className = 'toc-item tactile-btn';
            item.innerHTML = `
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:var(--gold-main); font-size:12px; font-weight:bold;">صفحة ${escapeHtml(page.page_number)}</span>
                        ${chap ? `<span style="font-size:10px; color:var(--text-muted); max-width:65%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(chap)}</span>` : ''}
                    </div>
                    <p style="font-size:12.5px; color:#ddd; margin:4px 0 0; line-height:1.65; font-family:'Amiri',serif;">${snippet}</p>
                </div>
            `;
            attachTactilePhysics(item);
            item.onclick = () => {
                currentActiveSearchHighlight = query;
                currentPageIndex = idx + 1;
                renderCurrentPage();
                closeInBookSearch();
            };
            container.appendChild(item);
        }
    });

    if (countBar) {
        countBar.style.display = 'block';
        countBar.textContent = `تم العثور على (${found}) موضع في هذا الكتاب`;
    }

    if (found === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">لا توجد نتائج مطابقة لـ «${escapeHtml(query)}» في هذا الكتاب.</p>`;
    }
}

function generateSearchSnippet(fullText, rawQuery) {
    if (!fullText || !rawQuery) return escapeHtml(fullText || "");
    let regex = createArabicSearchRegex(rawQuery);
    if (!regex) return escapeHtml(fullText.substring(0, 120) + '...');

    let match = regex.exec(fullText);
    let snippet = "";

    if (match) {
        let matchIdx = match.index;
        let start = Math.max(0, matchIdx - 45);
        let end = Math.min(fullText.length, matchIdx + match[0].length + 75);
        snippet = fullText.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < fullText.length) snippet = snippet + '...';
    } else {
        snippet = fullText.substring(0, 120) + '...';
    }

    return highlightArabicText(escapeHtml(snippet), rawQuery);
}

// ==================== تصدير الكتاب كـ PDF ====================
async function downloadBookAsPDF() {
    const book = getBookById(currentBookId);
    if (!book) {
        showToast("لا يوجد كتاب مفتوح", "fa-triangle-exclamation");
        return;
    }

    const fileName = sanitizeFileName(book.title || currentBookTitle || 'book') + '.pdf';

    if (book.pdf_url) {
        showToast("جاري تجهيز ملف PDF...", "fa-file-pdf");
        try {
            const response = await fetch(book.pdf_url, { mode: 'cors', cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            if (!blob.size) throw new Error("empty PDF");

            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            a.rel = 'noopener';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
            showToast("تم تنزيل الكتاب بصيغة PDF", "fa-circle-check");
            return;
        } catch (error) {
            window.open(book.pdf_url, '_blank', 'noopener,noreferrer');
            showToast("تم فتح ملف PDF الأصلي", "fa-file-pdf");
            return;
        }
    }

    if (!currentBookPages || currentBookPages.length === 0) {
        showToast("لا توجد صفحات متاحة للتصدير", "fa-triangle-exclamation");
        return;
    }

    showToast("جاري تجهيز الكتاب للحفظ كـ PDF...", "fa-file-pdf");

    const printIframe = document.createElement('iframe');
    printIframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0;opacity:0;';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    const safeTitle = escapeHtml(currentBookTitle || 'كتاب');

    let fullContent = `
        <!doctype html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="utf-8">
            <title>${safeTitle}</title>
            <style>
                @page { size:A4; margin:16mm 14mm; }
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
                body { font-family:'Amiri',serif; line-height:1.9; color:#111; background:#fff; }
                .cover { text-align:center; min-height:240mm; display:flex; flex-direction:column; justify-content:center; page-break-after:always; }
                .cover h1 { font-size:30px; margin:0 0 16px; }
                .cover p { font-family:Arial,sans-serif; font-size:12px; color:#666; }
                .page { page-break-after:always; }
                .page-num { text-align:center; font:12px Arial,sans-serif; color:#777; margin-top:14px; }
                .watermark { text-align:center; margin-top:22px; padding-top:8px; border-top:1px solid #ddd; font:10px Arial,sans-serif; color:#777; }
                img { max-width:100%; }
            </style>
        </head>
        <body>
            <section class="cover">
                <h1>${safeTitle}</h1>
                <p>تم التصدير من خزانة علوم العترة — جليس الكليني</p>
            </section>`;

    currentBookPages.forEach((page, index) => {
        const content = page?.content || '';
        const pageNumber = escapeHtml(String(page?.page_number ?? index + 1));
        fullContent += `
            <section class="page">
                <div>${content}</div>
                <div class="page-num">صـ ${pageNumber}</div>
                <div class="watermark">جليس الكليني | Jali4s</div>
            </section>`;
    });

    fullContent += '</body></html>';

    doc.open();
    doc.write(fullContent);
    doc.close();

    setTimeout(() => {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
        setTimeout(() => printIframe.remove(), 2000);
    }, 700);
}

function sanitizeFileName(name) {
    return String(name || 'book').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 140) || 'book';
}

// ==================== الحقيبة البحثية والمكتبة الشخصية V2 ====================
function readJsonStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
}

function writeJsonStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

function getFavoriteBookIds() { return readJsonStorage(FAVORITE_BOOKS_KEY, []); }
function isFavoriteBook(id) { return getFavoriteBookIds().includes(id); }

function toggleFavoriteBook(id, event) {
    if (event) event.stopPropagation();
    const list = getFavoriteBookIds();
    const idx = list.indexOf(id);
    if (idx >= 0) {
        list.splice(idx, 1);
        showToast('أزيل الكتاب من المفضلة', 'fa-star');
    } else {
        list.unshift(id);
        showToast('أضيف الكتاب إلى المفضلة', 'fa-star');
    }
    writeJsonStorage(FAVORITE_BOOKS_KEY, list.slice(0, 150));
    if (Object.keys(allBooksManifest).length) {
        processAndRenderBooks(allBooksManifest);
        if (document.getElementById('catalogView')?.classList.contains('active')) {
            renderCatalogAccordion();
        }
    }
    renderPersonalLibrary();
}

function rememberRecentBook(id, title, totalPages) {
    if (!id || !title) return;
    const history = readJsonStorage(READING_HISTORY_KEY, []).filter(x => x.id !== id);
    const page = Number(localStorage.getItem(`last_page_${id}`)) || 1;
    const item = { id, title, totalPages: totalPages || 1, page, updatedAt: Date.now() };
    history.unshift(item);
    readingHistory = history.slice(0, 20);
    writeJsonStorage(READING_HISTORY_KEY, readingHistory);
    renderContinueReading();
}

function getBookProgressPercent(id) {
    const total = Number(allBooksManifest[id]?.total_pages) || Number(readJsonStorage(READING_HISTORY_KEY, []).find(x => x.id === id)?.totalPages) || 1;
    const page = Number(localStorage.getItem(`last_page_${id}`)) || 0;
    return Math.min(100, Math.max(0, Math.round((page / total) * 100)));
}

function getBookById(id) {
    return allBooksManifest[id] || null;
}

function renderContinueReading() {
    const section = document.getElementById('continueReadingSection');
    const card = document.getElementById('continueReadingCard');
    if (!section || !card) return;
    const history = readJsonStorage(READING_HISTORY_KEY, []).filter(x => getBookById(x.id));
    readingHistory = history;
    if (!history.length) {
        section.style.display = 'none';
        return;
    }
    const item = history[0];
    const book = getBookById(item.id);
    const group = getGroupName(book, item.id);
    const total = Number(book.total_pages) || item.totalPages || 1;
    const page = Number(localStorage.getItem(`last_page_${item.id}`)) || item.page || 1;
    const pct = Math.min(100, Math.max(0, Math.round((page / total) * 100)));
    section.style.display = 'block';
    card.innerHTML = `
        <div class="continue-reading-cover">${createCoverHtml((book.cover || '').trim(), group, !!book.pdf_url)}</div>
        <div class="continue-reading-main">
            <div class="continue-reading-kicker"><i class="fas fa-book-open"></i> آخر مطالعة (${escapeHtml(book.title || group)})</div>
            <h4>${escapeHtml(group)}</h4>
            <p>وصلت إلى الموضع <b>${page}</b> من ${total} · (${pct}%)</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            <button class="v2-primary-btn tactile-btn" onclick="resumeRecentBook('${escapeHtml(item.id)}', event)">متابعة المطالعة <i class="fas fa-arrow-left"></i></button>
        </div>`;
    attachTactilePhysics(card.querySelector('.v2-primary-btn'));
}

function resumeRecentBook(id, event) {
    if (event) event.stopPropagation();
    const book = getBookById(id);
    if (!book) return;
    loadAndOpenBook(id, book.title || getGroupName(book, id), book.toc, book.total_pages);
}

function getRecentSearches() { return readJsonStorage(RECENT_SEARCH_KEY, []); }
function rememberSearchQuery(query) {
    const q = query.trim();
    if (!q) return;
    const next = [q, ...getRecentSearches().filter(x => x !== q)].slice(0, 10);
    writeJsonStorage(RECENT_SEARCH_KEY, next);
}

function renderSmartSearchPanel(query = '') {
    const panel = document.getElementById('searchSmartPanel');
    if (!panel) return;
    const q = query.trim();
    if (!q) {
        const recent = getRecentSearches();
        if (!recent.length) { panel.style.display = 'none'; panel.innerHTML = ''; return; }
        panel.innerHTML = `<div class="smart-panel-head"><span>عمليات بحثك الأخيرة</span><button class="tactile-btn" onclick="clearRecentSearches()">مسح السجل</button></div><div class="smart-chip-row">${recent.map(x => `<button class="smart-search-chip tactile-btn" onclick="useSmartSearch(this.dataset.q)" data-q="${escapeHtml(x)}"><i class="fas fa-clock"></i>${escapeHtml(x)}</button>`).join('')}</div>`;
        panel.style.display = 'block';
        return;
    }
    const matcher = createSearchMatcher(q);
    const suggestions = [];
    getScopedSearchIndex().forEach(item => {
        if (suggestions.length >= 8) return;
        if (matcher(item.title) || matcher(item.group)) suggestions.push({ label: item.title || item.group, icon: 'fa-book' });
        if (suggestions.length >= 8) return;
        for (const t of item.toc || []) {
            if (matcher(t.title || '')) {
                suggestions.push({ label: t.title, icon: 'fa-bookmark' });
                if (suggestions.length >= 8) break;
            }
        }
    });
    panel.innerHTML = suggestions.length ? `<div class="smart-panel-head"><span>اقتراحات فورية من الفهارس</span></div><div class="smart-chip-row">${suggestions.map(x => `<button class="smart-search-chip tactile-btn" onclick="useSmartSearch(this.dataset.q)" data-q="${escapeHtml(x.label)}"><i class="fas ${x.icon}"></i>${escapeHtml(x.label)}</button>`).join('')}</div>` : '';
    panel.style.display = suggestions.length ? 'block' : 'none';
}

function useSmartSearch(query) {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.value = query;
    rememberSearchQuery(query);
    handleSearchInput(query);
    setTimeout(() => { document.getElementById('searchSmartPanel')?.style.setProperty('display', 'none'); }, 50);
}

function clearRecentSearches() {
    writeJsonStorage(RECENT_SEARCH_KEY, []);
    renderSmartSearchPanel('');
}

function getSavedQuotes() { return readJsonStorage(SAVED_QUOTES_KEY, []); }
function saveSelectedQuote() {
    const text = (window.getSelection()?.toString().trim() || savedSelectionText).trim();
    if (!text) { showToast('حدد نصاً أولاً لحفظه في الشواهد', 'fa-text-height'); return; }
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    const quotes = getSavedQuotes();
    const key = `${currentBookId}|${pageNum}|${text}`;
    if (quotes.some(q => q.key === key)) { showToast('الشاهد محفوظ مسبقاً في حقيبتك', 'fa-bookmark'); return; }
    quotes.unshift({
        id: 'q_' + Date.now(),
        key,
        text,
        bookId: currentBookId,
        bookTitle: currentBookTitle,
        pageNum,
        pageIndex: currentPageIndex,
        date: new Date().toLocaleDateString('ar-IQ')
    });
    writeJsonStorage(SAVED_QUOTES_KEY, quotes.slice(0, 400));
    hideSelectionToolbar();
    showToast('تم حفظ الشاهد في حقيبتك البحثية', 'fa-bookmark');
}

function getCurrentRealPageNumber(pageIndex = currentPageIndex) {
    const page = currentBookPages?.[Math.max(0, Number(pageIndex) - 1)];
    const n = Number(page?.page_number);
    return Number.isFinite(n) ? n : Number(pageIndex) || 1;
}

function syncReaderUrl(pageIndex = currentPageIndex, replace = true) {
    if (!currentBookId) return;
    const pageNumber = getCurrentRealPageNumber(pageIndex);
    const url = new URL(window.location.href);
    url.searchParams.set('book', currentBookId);
    url.searchParams.set('page', String(pageNumber));
    url.searchParams.delete('quote');

    try {
        const state = {
            ...(window.history.state || {}),
            view: 'readerView',
            book: currentBookId,
            page: pageNumber
        };
        if (replace) window.history.replaceState(state, '', url.toString());
        else window.history.pushState(state, '', url.toString());
    } catch (e) {}
    return url.toString();
}

function buildDeepLink(pageIndex = currentPageIndex, quote = '') {
    const url = new URL(window.location.href);
    url.searchParams.set('book', currentBookId);
    url.searchParams.set('page', String(getCurrentRealPageNumber(pageIndex)));
    if (quote) url.searchParams.set('quote', quote.slice(0, 1200));
    return url.toString();
}

async function shareSelectedQuote() {
    const selectedText = (window.getSelection()?.toString().trim() || savedSelectionText).trim();
    if (!selectedText || !currentBookId) return;
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    const deepLink = buildDeepLink(currentPageIndex, selectedText);
    const quoteFormatted = `«${selectedText}»\n\n📖 ${currentBookTitle} — صـ ${pageNum}\n🔗 فتح الموضع مباشرة: ${deepLink}\n✦ جليس الكليني | Jali4s`;

    try {
        if (navigator.share) {
            await navigator.share({ title: `شاهد من ${currentBookTitle}`, text: quoteFormatted, url: deepLink });
            showToast('تمت مشاركة الشاهد مع رابط الموضع', 'fa-share-nodes');
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(quoteFormatted);
            showToast('تم نسخ الشاهد مع رابط الصفحة', 'fa-link');
        }
    } catch (_) {}
    hideSelectionToolbar();
}

function hideSelectionToolbar() {
    const tb = document.getElementById('selectionToolbar');
    if (tb) tb.style.display = 'none';
    window.getSelection()?.removeAllRanges();
}

function getSavedNotes() { return readJsonStorage(SAVED_NOTES_KEY, []); }
function saveSelectedNote() {
    const text = (window.getSelection()?.toString().trim() || savedSelectionText).trim();
    if (!text) { showToast('حدد نصاً أولاً لإضافة تعليق بحثي', 'fa-note-sticky'); return; }
    savedSelectionText = text;
    const preview = document.getElementById('selectedTextPreview');
    if (preview) preview.textContent = `«${text.slice(0, 420)}${text.length > 420 ? '…' : ''}»`;
    const input = document.getElementById('noteEditorInput');
    if (input) input.value = '';
    document.getElementById('noteEditorModal').style.display = 'flex';
    hideSelectionToolbar();
    setTimeout(() => input?.focus(), 80);
}

function closeNoteEditor() {
    const m = document.getElementById('noteEditorModal');
    if (m) m.style.display = 'none';
}

function commitNote() {
    const note = (document.getElementById('noteEditorInput')?.value || '').trim();
    if (!note) { showToast('اكتب التعليق أولاً', 'fa-triangle-exclamation'); return; }
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData ? (pageData.page_number || currentPageIndex) : currentPageIndex;
    const notes = getSavedNotes();
    notes.unshift({
        id: 'n_' + Date.now(),
        note,
        text: savedSelectionText,
        bookId: currentBookId,
        bookTitle: currentBookTitle,
        pageNum,
        pageIndex: currentPageIndex,
        date: new Date().toLocaleDateString('ar-IQ')
    });
    writeJsonStorage(SAVED_NOTES_KEY, notes.slice(0, 400));
    closeNoteEditor();
    showToast('تم حفظ التعليق البحثي', 'fa-note-sticky');
}

function deleteSavedQuote(id) {
    writeJsonStorage(SAVED_QUOTES_KEY, getSavedQuotes().filter(x => x.id !== id));
    renderPersonalLibrary();
    showToast('تم حذف الشاهد', 'fa-trash-can');
}

function deleteSavedNote(id) {
    writeJsonStorage(SAVED_NOTES_KEY, getSavedNotes().filter(x => x.id !== id));
    renderPersonalLibrary();
    showToast('تم حذف التعليق', 'fa-trash-can');
}

function copyCurrentCitation() {
    const pageData = currentBookPages[currentPageIndex - 1];
    if (!pageData) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = cleanPageWatermarkHtml(pageData.content || '');
    const text = (tmp.textContent || '').trim();
    if (!text) return;
    const pageNum = pageData.page_number || currentPageIndex;
    const citation = `${text}\n\n📖 المصدر: ${currentBookTitle} — صـ ${pageNum}\n✦ خزانة علوم العترة | جليس الكليني`;
    navigator.clipboard?.writeText(citation)
        .then(() => showToast('تم نسخ نص الصفحة مع المصدر', 'fa-copy'))
        .catch(() => showToast('تعذر النسخ التلقائي', 'fa-triangle-exclamation'));
}

async function shareCurrentPage() {
    if (!currentBookId) return;
    const pageData = currentBookPages[currentPageIndex - 1];
    const pageNum = pageData?.page_number || currentPageIndex;
    const url = buildDeepLink(currentPageIndex);
    const data = { title: currentBookTitle, text: `${currentBookTitle} — صـ ${pageNum}\nفتح هذه الصفحة مباشرة:`, url };
    try {
        if (navigator.share) {
            await navigator.share(data);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${currentBookTitle} — صـ ${pageNum}\n${url}`);
            showToast('تم نسخ رابط الموضع', 'fa-link');
        }
    } catch (_) {}
}

function renderPersonalLibraryDashboard() {
    const el = document.getElementById('personalLibraryDashboard');
    if (!el) return;
    const recent = readJsonStorage(READING_HISTORY_KEY, []).filter(x => getBookById(x.id)).length;
    const fav = getFavoriteBookIds().filter(id => getBookById(id)).length;
    const quotes = getSavedQuotes().length;
    const notes = getSavedNotes().length;
    el.innerHTML = `<div class="v2-stat"><b>${recent}</b><span>مطالعات</span></div><div class="v2-stat"><b>${fav}</b><span>مفضلة</span></div><div class="v2-stat"><b>${quotes}</b><span>شواهد</span></div><div class="v2-stat"><b>${notes}</b><span>تعليقات</span></div>`;
}

function openPersonalLibrary(initialTab = null) {
    const modal = document.getElementById('personalLibraryModal');
    if (!modal) return;
    if (initialTab) {
        currentPersonalLibraryTab = initialTab;
        document.querySelectorAll('.v2-library-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === initialTab);
        });
    }
    modal.style.display = 'flex';
    renderPersonalLibraryDashboard();
    renderPersonalLibrary();
}

function closePersonalLibrary() {
    const m = document.getElementById('personalLibraryModal');
    if (m) m.style.display = 'none';
}

function openLibraryCommandCenter() {
    const m = document.getElementById('libraryCommandCenterModal');
    if (m) m.style.display = 'flex';
}

function closeLibraryCommandCenter() {
    const m = document.getElementById('libraryCommandCenterModal');
    if (m) m.style.display = 'none';
}

function switchPersonalLibraryTab(tab, btn) {
    currentPersonalLibraryTab = tab;
    document.querySelectorAll('.v2-library-tab').forEach(x => x.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else document.querySelector(`.v2-library-tab[data-tab="${tab}"]`)?.classList.add('active');
    renderPersonalLibrary();
}

function renderPersonalLibrary() {
    const container = document.getElementById('personalLibraryList');
    if (!container) return;
    renderPersonalLibraryDashboard();
    let items = [];
    if (currentPersonalLibraryTab === 'favorites') items = getFavoriteBookIds().map(id => ({ ...getBookById(id), id })).filter(x => x.title);
    else if (currentPersonalLibraryTab === 'bookmarks') {
        Object.keys(localStorage).filter(k => k.startsWith('bookmarks_')).forEach(k => {
            const id = k.replace(/^bookmarks_/, '');
            const book = getBookById(id);
            if (!book) return;
            readJsonStorage(k, []).forEach(b => items.push({ ...b, id, book }));
        });
    } else if (currentPersonalLibraryTab === 'quotes') items = getSavedQuotes();
    else if (currentPersonalLibraryTab === 'notes') items = getSavedNotes();
    else if (currentPersonalLibraryTab === 'tags') items = getStoredTaggedSnippets();
    else items = readJsonStorage(READING_HISTORY_KEY, []).filter(x => getBookById(x.id));

    if (!items.length) {
        const titles = {
            recent: 'ابدأ القراءة لتظهر مطالعاتك هنا',
            favorites: 'لا توجد كتب مفضلة بعد',
            bookmarks: 'لا توجد علامات مرجعية محفوظة بعد',
            quotes: 'لم تحفظ شواهد نصية بعد',
            notes: 'لا توجد تعليقات بحثية بعد',
            tags: 'لا توجد نصوص موسومة بعد'
        };
        const icons = {
            recent: 'fa-book-open',
            favorites: 'fa-star',
            bookmarks: 'fa-bookmark',
            quotes: 'fa-quote-right',
            notes: 'fa-note-sticky',
            tags: 'fa-tags'
        };
        container.innerHTML = `<div class="v2-empty"><i class="fas ${icons[currentPersonalLibraryTab] || 'fa-book-open'}"></i><h4>${titles[currentPersonalLibraryTab] || titles.recent}</h4><p>جميع بياناتك البحثية تحفظ تلقائياً على جهازك ويمكنك تصديرها.</p></div>`;
        return;
    }

    container.innerHTML = '';
    items.slice(0, 60).forEach(item => {
        const row = document.createElement('div');
        row.className = 'v2-library-row';
        if (currentPersonalLibraryTab === 'quotes') {
            row.innerHTML = `<div class="v2-library-icon"><i class="fas fa-quote-right"></i></div><div class="v2-library-row-main"><b>${escapeHtml(item.bookTitle || 'كتاب')}</b><span>«${escapeHtml(item.text.slice(0, 150))}${item.text.length > 150 ? '…' : ''}» · صـ ${escapeHtml(item.pageNum)}</span></div><button class="mini-action-btn tactile-btn" title="حذف" onclick="deleteSavedQuote('${escapeHtml(item.id)}')"><i class="fas fa-trash-can"></i></button>`;
            row.onclick = (e) => { if (e.target.closest('button')) return; closePersonalLibrary(); jumpToTaggedSnippet(item.bookId, item.bookTitle, item.pageIndex || item.pageNum); };
        } else if (currentPersonalLibraryTab === 'notes') {
            row.innerHTML = `<div class="v2-library-icon"><i class="fas fa-note-sticky"></i></div><div class="v2-library-row-main"><b>${escapeHtml(item.bookTitle || 'كتاب')} · صـ ${escapeHtml(item.pageNum)}</b><span>${escapeHtml(item.note.slice(0, 150))}${item.note.length > 150 ? '…' : ''}</span></div><button class="mini-action-btn tactile-btn" title="حذف" onclick="deleteSavedNote('${escapeHtml(item.id)}')"><i class="fas fa-trash-can"></i></button>`;
            row.onclick = (e) => { if (e.target.closest('button')) return; closePersonalLibrary(); jumpToTaggedSnippet(item.bookId, item.bookTitle, item.pageIndex || item.pageNum); };
        } else if (currentPersonalLibraryTab === 'tags') {
            row.innerHTML = `<div class="v2-library-icon"><i class="fas fa-tag"></i></div><div class="v2-library-row-main"><b>[${escapeHtml(item.tagName || 'وسم')}] ${escapeHtml(item.bookTitle || 'كتاب')}</b><span>«${escapeHtml((item.text || '').slice(0, 120))}» · صـ ${escapeHtml(item.pageNum)}</span></div><i class="fas fa-chevron-left text-gold"></i>`;
            row.onclick = () => { closePersonalLibrary(); jumpToTaggedSnippet(item.bookId, item.bookTitle, item.pageIndex || item.pageNum); };
        } else {
            const id = item.id;
            const book = item.book || getBookById(id);
            const title = book?.title || getGroupName(book || {}, id);
            const group = getGroupName(book || {}, id);
            const page = currentPersonalLibraryTab === 'bookmarks' ? (item.pageNum || item.pageIndex || 1) : (Number(localStorage.getItem(`last_page_${id}`)) || item.page || 1);
            row.innerHTML = `<div class="v2-library-icon"><i class="fas ${currentPersonalLibraryTab === 'favorites' ? 'fa-star' : 'fa-book'}"></i></div><div class="v2-library-row-main"><b>${escapeHtml(group)}</b><span>${escapeHtml(title)} · صـ ${escapeHtml(page)}</span></div><i class="fas fa-chevron-left text-gold"></i>`;
            row.onclick = () => { closePersonalLibrary(); if (book) loadAndOpenBook(id, title, book.toc, book.total_pages, currentPersonalLibraryTab === 'bookmarks' ? (item.pageNum || item.pageIndex) : null); };
        }
        container.appendChild(row);
    });
}

function exportPersonalLibrary() {
    const data = {
        version: 12,
        exportedAt: new Date().toISOString(),
        favorites: getFavoriteBookIds(),
        history: readJsonStorage(READING_HISTORY_KEY, []),
        quotes: getSavedQuotes(),
        notes: getSavedNotes(),
        tags: getStoredTaggedSnippets(),
        customTags: getStoredTags()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jalis-research-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    showToast('تم تصدير النسخة الاحتياطية لحقيبتك البحثية', 'fa-download');
}

function triggerImportPersonalLibrary() {
    document.getElementById('importLibraryFileInput')?.click();
}

function handleImportPersonalLibraryFile(event) {
    const file = event.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(String(reader.result || '{}'));
            if (Array.isArray(parsed.favorites)) writeJsonStorage(FAVORITE_BOOKS_KEY, parsed.favorites);
            if (Array.isArray(parsed.history)) writeJsonStorage(READING_HISTORY_KEY, parsed.history);
            if (Array.isArray(parsed.quotes)) writeJsonStorage(SAVED_QUOTES_KEY, parsed.quotes);
            if (Array.isArray(parsed.notes)) writeJsonStorage(SAVED_NOTES_KEY, parsed.notes);
            if (Array.isArray(parsed.tags)) saveStoredTaggedSnippets(parsed.tags);
            if (Array.isArray(parsed.customTags)) saveStoredTags(parsed.customTags);
            renderPersonalLibrary();
            renderContinueReading();
            showToast('تم استيراد الحقيبة البحثية بنجاح', 'fa-circle-check');
        } catch (err) {
            showToast('ملف النسخة الاحتياطية غير صالح', 'fa-triangle-exclamation');
        }
    };
    reader.readAsText(file);
}

function exportResearchReportText() {
    const quotes = getSavedQuotes();
    const notes = getSavedNotes();
    const tags = getStoredTaggedSnippets();
    if (!quotes.length && !notes.length && !tags.length) {
        showToast('لا توجد شواهد أو تعليقات محفوظة للتصدير', 'fa-triangle-exclamation');
        return;
    }
    let out = "========================================================\n";
    out += "   المسودة البحثية المستخرجة — خزانة علوم العترة (جليس الكليني)\n";
    out += "========================================================\n\n";

    if (quotes.length) {
        out += ` أولاً: الشواهد والاقتباسات المحفوظة (${quotes.length})\n--------------------------------------------------------\n`;
        quotes.forEach((q, i) => {
            out += `[${i + 1}] «${q.text}»\n    المصدر: ${q.bookTitle} — ص ${q.pageNum} (${q.date || ''})\n\n`;
        });
    }
    if (notes.length) {
        out += `\n ثانياً: التعليقات والحواشي التحقيقية (${notes.length})\n--------------------------------------------------------\n`;
        notes.forEach((n, i) => {
            out += `[${i + 1}] التعليق: ${n.note}\n    على النص: «${n.text}»\n    المصدر: ${n.bookTitle} — ص ${n.pageNum} (${n.date || ''})\n\n`;
        });
    }
    if (tags.length) {
        out += `\n ثالثاً: النصوص الموسومة (${tags.length})\n--------------------------------------------------------\n`;
        tags.forEach((t, i) => {
            out += `[${i + 1}] [${t.tagName}] «${t.text}»\n    المصدر: ${t.bookTitle} — ص ${t.pageNum}\n\n`;
        });
    }

    downloadPlainTextFile(out, 'jalis-research-draft.txt');
    showToast('تم تصدير المسودة البحثية كملف نصي', 'fa-file-lines');
}

// ============================================================================
// محرك البحث العلمي الفائق (Ultra Research Search Engine)
// يدعم: كل المكتبة، مجموعة كتب مخصصة، البحث داخل باب موضوعي، وتناظر الأبواب
// ============================================================================
function openSearch() {
    showView('searchView');
    setTimeout(() => {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
    }, 150);
}

function openSearchWithMode(mode) {
    openSearch();
    setSearchTargetMode(mode);
}

function closeSearch() {
    isDeepSearching = false;
    if (history.state && history.state.view === 'searchView') {
        history.back();
    } else {
        showView('homeView', false);
    }
}

function setSearchTargetMode(mode) {
    currentSearchTarget = ['toc', 'fulltext', 'topics'].includes(mode) ? mode : 'toc';
    document.getElementById('searchTargetTocBtn')?.classList.toggle('active', currentSearchTarget === 'toc');
    document.getElementById('searchTargetTextBtn')?.classList.toggle('active', currentSearchTarget === 'fulltext');
    document.getElementById('searchTargetTopicsBtn')?.classList.toggle('active', currentSearchTarget === 'topics');
    executeGlobalSearch();
}

function setSearchMatchType(type) {
    currentSearchMatchType = ['exact', 'all', 'any', 'smart'].includes(type) ? type : 'exact';
    document.getElementById('searchMatchTypeExact')?.classList.toggle('active', currentSearchMatchType === 'exact');
    document.getElementById('searchMatchTypeAll')?.classList.toggle('active', currentSearchMatchType === 'all');
    document.getElementById('searchMatchTypeAny')?.classList.toggle('active', currentSearchMatchType === 'any');
    document.getElementById('searchMatchTypeSmart')?.classList.toggle('active', currentSearchMatchType === 'smart');
    executeGlobalSearch();
}

function clearChapterTopicFilter() {
    const input = document.getElementById('chapterTopicFilterInput');
    if (input) input.value = '';
    const btn = document.getElementById('clearChapterScopeBtn');
    if (btn) btn.style.display = 'none';
    executeGlobalSearch();
}

function renderSearchFilterPills(groups) {
    const container = document.getElementById('searchFilterPills');
    if (!container) return;

    let html = `
        <button class="filter-pill ${currentSearchScope === 'all' ? 'active' : ''} tactile-btn" onclick="setSearchScope('all', this)">
            <i class="fas fa-globe"></i> كل المكتبة
        </button>
        <button class="filter-pill ${currentSearchScope === 'custom' ? 'active' : ''} tactile-btn" onclick="openCustomBooksScopeModal()">
            <i class="fas fa-list-check"></i> مجموعة مخصصة (${customSelectedGroups.size || 'اختر'})
        </button>
    `;

    Object.keys(groups).sort((a, b) => a.localeCompare(b, 'ar')).forEach(gName => {
        const active = currentSearchScope === 'group:' + gName ? 'active' : '';
        html += `<button class="filter-pill ${active} tactile-btn" onclick="setSearchScope('group:${escapeHtml(gName)}', this)"><i class="fas fa-book"></i> ${escapeHtml(gName)}</button>`;
    });

    container.innerHTML = html;
}

function setSearchScope(scopeKey, element) {
    currentSearchScope = scopeKey;
    currentSearchBookFilter = 'all';
    document.querySelectorAll('#searchFilterPills .filter-pill').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    updateCustomScopeBadge();
    executeGlobalSearch();
}

// نافذة اختيار مجموعة كتب مخصصة للبحث فيها معاً
let shouldOpenSearchAfterScopeModal = false;
function openCustomBooksScopeModal(openSearchAfter = false) {
    shouldOpenSearchAfterScopeModal = openSearchAfter;
    const modal = document.getElementById('customBookScopeModal');
    if (!modal) return;
    renderCustomScopeBooksList(document.getElementById('scopeModalFilterInput')?.value || '');
    modal.style.display = 'flex';
}

function closeCustomBooksScopeModal() {
    const modal = document.getElementById('customBookScopeModal');
    if (modal) modal.style.display = 'none';
}

function renderCustomScopeBooksList(filterVal = '') {
    const container = document.getElementById('customScopeBooksContainer');
    const summaryEl = document.getElementById('selectedScopeSummaryText');
    if (!container) return;

    const norm = normalizeArabicText(filterVal);
    const groupNames = Object.keys(allBookGroupsMap).sort((a, b) => a.localeCompare(b, 'ar'));

    container.innerHTML = '';
    groupNames.forEach(gName => {
        const books = allBookGroupsMap[gName] || [];
        const mainBook = books[0] || {};
        const cat = getBookCategory(mainBook);
        if (norm && !normalizeArabicText(gName + ' ' + cat).includes(norm)) return;

        const isSelected = customSelectedGroups.has(gName);
        const row = document.createElement('div');
        row.className = `scope-book-row tactile-btn ${isSelected ? 'selected' : ''}`;
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                <i class="fas ${isSelected ? 'fa-square-check text-gold' : 'fa-square text-muted'}" style="font-size:15px;"></i>
                <div style="min-width:0;">
                    <div style="font-size:12.5px; font-weight:700; color:var(--text-white); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(gName)}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${escapeHtml(cat)} · ${books.length} مجلد/جزء</div>
                </div>
            </div>
            <span class="search-page-badge">${isSelected ? 'محدد' : 'تحديد'}</span>
        `;
        row.onclick = () => {
            if (customSelectedGroups.has(gName)) customSelectedGroups.delete(gName);
            else customSelectedGroups.add(gName);
            renderCustomScopeBooksList(filterVal);
        };
        container.appendChild(row);
    });

    if (summaryEl) {
        summaryEl.textContent = customSelectedGroups.size > 0
            ? `تم تحديد (${customSelectedGroups.size}) كتاب/موسوعة للبحث المشترك`
            : 'لم يتم التحديد (سيتم البحث في كل المكتبة)';
    }
}

function selectAllScopeBooks() {
    Object.keys(allBookGroupsMap).forEach(g => customSelectedGroups.add(g));
    renderCustomScopeBooksList(document.getElementById('scopeModalFilterInput')?.value || '');
}

function clearAllScopeBooks() {
    customSelectedGroups.clear();
    renderCustomScopeBooksList(document.getElementById('scopeModalFilterInput')?.value || '');
}

function selectCategoryScopePreset(catName) {
    customSelectedGroups.clear();
    Object.keys(allBookGroupsMap).forEach(gName => {
        const mainBook = allBookGroupsMap[gName]?.[0];
        if (mainBook && getBookCategory(mainBook) === catName) {
            customSelectedGroups.add(gName);
        }
    });
    renderCustomScopeBooksList(document.getElementById('scopeModalFilterInput')?.value || '');
}

function updateCustomScopeBadge() {
    const badge = document.getElementById('customScopeCountBadge');
    if (!badge) return;
    if (currentSearchScope === 'custom' && customSelectedGroups.size > 0) {
        badge.textContent = `${customSelectedGroups.size} كتب`;
    } else if (currentSearchScope.startsWith('group:')) {
        badge.textContent = currentSearchScope.replace(/^group:/, '');
    } else {
        badge.textContent = 'الكل';
    }
}

function applyCustomBooksScope() {
    if (customSelectedGroups.size > 0) {
        currentSearchScope = 'custom';
    } else {
        currentSearchScope = 'all';
    }
    currentSearchBookFilter = 'all';
    updateCustomScopeBadge();
    renderSearchFilterPills(allBookGroupsMap);
    closeCustomBooksScopeModal();
    if (shouldOpenSearchAfterScopeModal || !document.getElementById('searchView')?.classList.contains('active')) {
        openSearch();
    }
    executeGlobalSearch();
}

function searchTokens(value) {
    return normalizeArabicText(value).split(/\s+/).filter(Boolean);
}

function createSearchMatcher(query) {
    const normalized = normalizeArabicText(query);
    const tokens = searchTokens(query);
    const smartTokens = tokens.map(stripArabicAffixes).filter(Boolean);

    return text => {
        const hay = normalizeArabicText(text);
        if (!hay || !normalized) return false;
        if (currentSearchMatchType === 'exact') return hay.includes(normalized);
        if (currentSearchMatchType === 'all') return tokens.every(t => hay.includes(t));
        if (currentSearchMatchType === 'any') return tokens.some(t => hay.includes(t));
        if (currentSearchMatchType === 'smart') return smartTokens.every(st => hay.includes(st));
        return hay.includes(normalized);
    };
}

function handleSearchInput(val) {
    const chapInput = document.getElementById('chapterTopicFilterInput');
    const clearChapBtn = document.getElementById('clearChapterScopeBtn');
    if (clearChapBtn && chapInput) {
        clearChapBtn.style.display = chapInput.value.trim() ? 'block' : 'none';
    }

    renderSmartSearchPanel(val);
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = val.trim() ? 'block' : 'none';

    clearTimeout(searchDebounceTimer);
    isDeepSearching = false;
    searchRequestId++;
    const request = searchRequestId;
    searchDebounceTimer = setTimeout(() => {
        if (request === searchRequestId) {
            if (val.trim()) rememberSearchQuery(val);
            executeGlobalSearch(request);
        }
    }, 110);
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (input) { input.value = ''; input.focus(); }
    handleSearchInput('');
}

function getScopedSearchIndex() {
    let items = searchIndex.length ? searchIndex : Object.keys(allBooksManifest).map(id => ({
        id,
        title: allBooksManifest[id]?.title || '',
        author: allBooksManifest[id]?.author || allBooksManifest[id]?.writer || '',
        category: getBookCategory(allBooksManifest[id]),
        group: getGroupName(allBooksManifest[id], id),
        toc: Array.isArray(allBooksManifest[id]?.toc) ? allBooksManifest[id].toc : [],
        pdf: !!allBooksManifest[id]?.pdf_url
    }));

    if (currentSearchScope === 'all') return items;
    if (currentSearchScope === 'custom' && customSelectedGroups.size > 0) {
        return items.filter(x => customSelectedGroups.has(x.group));
    }
    if (currentSearchScope.startsWith('group:')) {
        const group = currentSearchScope.replace(/^group:/, '');
        return items.filter(x => x.group === group);
    }
    return items;
}

// حساب نطاقات صفحات الأبواب المطابقة لشرط الباب الموضوعي داخل الكتاب
function getMatchingChapterRanges(toc, chapterFilterQuery, totalPages = 99999) {
    if (!chapterFilterQuery || !Array.isArray(toc) || toc.length === 0) return null;
    const normChapQ = normalizeArabicText(chapterFilterQuery);
    const chapTokens = normChapQ.split(/\s+/).filter(Boolean).map(stripArabicAffixes);

    const ranges = [];
    for (let i = 0; i < toc.length; i++) {
        const titleNorm = normalizeArabicText(toc[i].title || '');
        const matches = chapTokens.every(t => titleNorm.includes(t));
        if (matches) {
            const startPage = Number(toc[i].page_number) || 1;
            const endPage = (i + 1 < toc.length) ? (Number(toc[i + 1].page_number) || totalPages) : totalPages;
            ranges.push({ start: startPage, end: Math.max(startPage, endPage), title: toc[i].title });
        }
    }
    return ranges;
}

async function executeGlobalSearch(requestId = searchRequestId) {
    const input = document.getElementById('searchInput');
    const chapInput = document.getElementById('chapterTopicFilterInput');
    const query = input ? input.value.trim() : '';
    const chapterQuery = chapInput ? chapInput.value.trim() : '';

    const container = document.getElementById('searchResultsContainer');
    const statusInfo = document.getElementById('searchStatusInfo');
    const distBar = document.getElementById('searchBookDistributionBar');
    if (!container) return;
    if (requestId !== searchRequestId) return;

    // إذا لم يكتب كلمة بحث ولكنه كتب عنوان باب في خانة الباب الموضوعي، نبحث عن ذلك الباب
    const effectiveQuery = query || chapterQuery;

    if (!effectiveQuery) {
        if (statusInfo) statusInfo.style.display = 'none';
        if (distBar) distBar.style.display = 'none';
        container.innerHTML = `
            <div class="search-empty-state search-start-state">
                <div class="empty-icon-box"><i class="fas fa-compass-drafting text-gold"></i></div>
                <h4>محرك التحقيق والبحث العلمي المتقدم</h4>
                <p>ابحث في كامل الخزانة، أو خصص مجموعة كتب، أو اشترط عنوان باب موضوعي للبحث داخل صفحاته عبر الكتب.</p>
            </div>`;
        return;
    }

    currentSearchBookFilter = 'all';
    lastSearchResultsCache = [];
    const matcher = query ? createSearchMatcher(query) : (() => true);
    const items = getScopedSearchIndex();

    container.innerHTML = '';
    const resultLimit = currentSearchTarget === 'fulltext' ? 180 : 300;

    // ==================== 1. نمط مستكشف تناظر الأبواب الموضوعية (Topic Clusters) ====================
    if (currentSearchTarget === 'topics') {
        const topicMatcher = createSearchMatcher(effectiveQuery);
        const clustersMap = new Map();

        for (const item of items) {
            for (const tocItem of item.toc || []) {
                const title = (tocItem.title || '').trim();
                if (!title || !topicMatcher(title)) continue;
                if (chapterQuery && query && !normalizeArabicText(title).includes(normalizeArabicText(chapterQuery))) continue;

                // استخراج المحور الموضوعي للباب لتجميع الأبواب المتناظرة
                const words = normalizeArabicText(title)
                    .replace(/\b(باب|كتاب|فصل|في|من|عن|ذكر|بيان|حكم|فضل|ما|جاء|ان|انه|قوله|تعالي)\b/g, ' ')
                    .trim()
                    .split(/\s+/)
                    .filter(w => w.length > 2)
                    .slice(0, 3)
                    .join(' ');

                const clusterKey = words || normalizeArabicText(title).slice(0, 25);
                if (!clustersMap.has(clusterKey)) {
                    clustersMap.set(clusterKey, { heading: title, entries: [] });
                }
                clustersMap.get(clusterKey).entries.push({
                    type: 'toc',
                    bookId: item.id,
                    bookTitle: item.title || item.group,
                    group: item.group,
                    chapterTitle: title,
                    pageNum: tocItem.page_number ?? 1
                });
            }
        }

        const clusters = Array.from(clustersMap.values()).sort((a, b) => b.entries.length - a.entries.length);
        let totalMatchedChapters = 0;

        clusters.slice(0, 45).forEach(cluster => {
            totalMatchedChapters += cluster.entries.length;
            cluster.entries.forEach(e => lastSearchResultsCache.push(e));

            const card = document.createElement('div');
            card.className = 'topic-cluster-card';
            card.innerHTML = `
                <div class="topic-cluster-head">
                    <h4><i class="fas fa-sitemap text-gold"></i> محور موضوعي: ${highlightArabicText(escapeHtml(cluster.heading), effectiveQuery)}</h4>
                    <span class="results-badge">${cluster.entries.length} باب مناظر</span>
                </div>
                <div class="topic-cluster-items">
                    ${cluster.entries.map(e => `
                        <div class="topic-branch-item tactile-btn" onclick="loadAndOpenBook('${escapeHtml(e.bookId)}', '${escapeHtml(e.bookTitle)}', null, null, ${Number(e.pageNum) || 1}, '${escapeHtml(effectiveQuery)}')">
                            <div style="min-width:0; flex:1;">
                                <div style="font-size:12px; font-weight:700; color:var(--text-white);">${highlightArabicText(escapeHtml(e.chapterTitle), effectiveQuery)}</div>
                                <div style="font-size:10px; color:var(--gold-main); margin-top:2px;"><i class="fas fa-book"></i> ${escapeHtml(e.bookTitle)}</div>
                            </div>
                            <span class="search-page-badge">ص ${escapeHtml(e.pageNum)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(card);
        });

        updateSearchStatusHeader(totalMatchedChapters, effectiveQuery);
        if (!totalMatchedChapters) renderEmptySearchState(effectiveQuery);
        return;
    }

    // ==================== 2. نمط البحث في العناوين والأبواب (TOC & Books) ====================
    if (currentSearchTarget === 'toc') {
        const chapMatcher = chapterQuery ? createSearchMatcher(chapterQuery) : null;

        for (const item of items) {
            if (requestId !== searchRequestId) return;

            if (!chapterQuery && matcher(`${item.title} ${item.author || ''} ${item.category || ''} ${item.group}`)) {
                lastSearchResultsCache.push({
                    type: 'book',
                    bookId: item.id,
                    bookTitle: item.title || item.group,
                    group: item.group,
                    author: item.author || item.category,
                    tocCount: item.toc.length,
                    pdf: item.pdf
                });
            }

            for (const tocItem of item.toc) {
                const tTitle = tocItem.title || '';
                if (query && !matcher(tTitle)) continue;
                if (chapMatcher && !chapMatcher(tTitle)) continue;

                lastSearchResultsCache.push({
                    type: 'toc',
                    bookId: item.id,
                    bookTitle: item.title || item.group,
                    group: item.group,
                    chapterTitle: tTitle,
                    pageNum: tocItem.page_number ?? 1
                });
                if (lastSearchResultsCache.length >= resultLimit) break;
            }
            if (lastSearchResultsCache.length >= resultLimit) break;
        }

        updateSearchStatusHeader(lastSearchResultsCache.length, effectiveQuery);
        renderSearchDistributionBar(effectiveQuery);
        renderSearchResultsList(effectiveQuery);
        return;
    }

    // ==================== 3. نمط البحث في نصوص الصفحات (مع دعم حصر الباب الموضوعي!) ====================
    const progress = document.createElement('div');
    progress.className = 'search-progress-card';
    progress.innerHTML = `<i class="fas fa-bolt"></i><span>جاري الفحص العلمي في متون الصفحات${chapterQuery ? ` (ضمن أبواب: ${escapeHtml(chapterQuery)})` : ''}...</span><b id="deepSearchProgress">0%</b>`;
    container.appendChild(progress);
    isDeepSearching = true;

    const total = items.length;
    let processed = 0;
    const batchSize = 5;

    for (let i = 0; i < items.length && lastSearchResultsCache.length < resultLimit; i += batchSize) {
        if (requestId !== searchRequestId) return;
        const batch = items.slice(i, i + batchSize);

        await Promise.all(batch.map(async item => {
            if (requestId !== searchRequestId || lastSearchResultsCache.length >= resultLimit || item.pdf) return;

            // إذا اشترط الباحث باباً معيناً، نفحص أولاً هل هذا الكتاب يحتوي على باب يطابق الشرط
            let allowedRanges = null;
            if (chapterQuery) {
                allowedRanges = getMatchingChapterRanges(item.toc, chapterQuery, bookTotal(item.id));
                if (!allowedRanges || allowedRanges.length === 0) return;
            }

            try {
                const bookData = await fetchBookData(item.id);
                if (!bookData?.pages) return;

                for (const page of bookData.pages) {
                    if (requestId !== searchRequestId || lastSearchResultsCache.length >= resultLimit) break;
                    const pNum = Number(page.page_number) || 1;

                    let matchedChapterName = "";
                    if (allowedRanges) {
                        const hitRange = allowedRanges.find(r => pNum >= r.start && pNum <= r.end);
                        if (!hitRange) continue;
                        matchedChapterName = hitRange.title;
                    }

                    const temp = document.createElement('div');
                    temp.innerHTML = page.content || '';
                    const raw = temp.textContent || '';
                    if (!matcher(raw)) continue;

                    if (!matchedChapterName && Array.isArray(item.toc) && item.toc.length) {
                        for (const t of item.toc) {
                            if ((Number(t.page_number) || 0) <= pNum) matchedChapterName = t.title || "";
                            else break;
                        }
                    }

                    lastSearchResultsCache.push({
                        type: 'text',
                        bookId: item.id,
                        bookTitle: item.title || item.group,
                        group: item.group,
                        chapterTitle: matchedChapterName,
                        pageNum: pNum,
                        snippet: generateSearchSnippet(raw, effectiveQuery)
                    });
                }
            } catch (_) {}
        }));

        processed += batch.length;
        const p = document.getElementById('deepSearchProgress');
        if (p) p.textContent = `${Math.round((processed / Math.max(total, 1)) * 100)}%`;
    }

    isDeepSearching = false;
    progress.remove();

    if (requestId !== searchRequestId) return;
    updateSearchStatusHeader(lastSearchResultsCache.length, effectiveQuery);
    renderSearchDistributionBar(effectiveQuery);
    renderSearchResultsList(effectiveQuery);
}

function updateSearchStatusHeader(count, query) {
    const statusInfo = document.getElementById('searchStatusInfo');
    const countBadge = document.getElementById('searchResultCount');
    const filterBadge = document.getElementById('searchFilterName');
    const chapterQuery = document.getElementById('chapterTopicFilterInput')?.value.trim() || '';

    if (statusInfo) statusInfo.style.display = 'flex';
    if (countBadge) countBadge.textContent = `${count} نتيجة`;

    let scopeLabel = 'كل المكتبة';
    if (currentSearchScope === 'custom' && customSelectedGroups.size > 0) {
        scopeLabel = `${customSelectedGroups.size} كتب مختارة`;
    } else if (currentSearchScope.startsWith('group:')) {
        scopeLabel = currentSearchScope.replace(/^group:/, '');
    }
    if (chapterQuery) scopeLabel += ` · باب: ${chapterQuery}`;
    if (filterBadge) filterBadge.textContent = scopeLabel;
}

function renderSearchDistributionBar(query) {
    const distBar = document.getElementById('searchBookDistributionBar');
    if (!distBar) return;

    if (!lastSearchResultsCache.length) {
        distBar.style.display = 'none';
        return;
    }

    const countsByGroup = {};
    lastSearchResultsCache.forEach(r => {
        const g = r.group || r.bookTitle;
        countsByGroup[g] = (countsByGroup[g] || 0) + 1;
    });

    const entries = Object.entries(countsByGroup).sort((a, b) => b[1] - a[1]);
    let html = `<button class="dist-book-chip ${currentSearchBookFilter === 'all' ? 'active' : ''}" onclick="filterResultsByBook('all', '${escapeHtml(query)}')">كل النتائج <b>${lastSearchResultsCache.length}</b></button>`;
    entries.forEach(([gName, cnt]) => {
        const active = currentSearchBookFilter === gName ? 'active' : '';
        html += `<button class="dist-book-chip ${active}" onclick="filterResultsByBook('${escapeHtml(gName)}', '${escapeHtml(query)}')">${escapeHtml(gName)} <b>${cnt}</b></button>`;
    });

    distBar.innerHTML = html;
    distBar.style.display = 'flex';
}

function filterResultsByBook(groupName, query) {
    currentSearchBookFilter = groupName;
    renderSearchDistributionBar(query);
    renderSearchResultsList(query);
}

function toggleSearchResultsGrouping() {
    isSearchGroupedByBook = !isSearchGroupedByBook;
    const btn = document.getElementById('groupResultsToggleBtn');
    if (btn) btn.style.color = isSearchGroupedByBook ? 'var(--gold-bright)' : '';
    const q = document.getElementById('searchInput')?.value.trim() || document.getElementById('chapterTopicFilterInput')?.value.trim() || '';
    renderSearchResultsList(q);
}

function renderSearchResultsList(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    container.innerHTML = '';
    container.classList.toggle('grouped-mode', isSearchGroupedByBook);

    const filtered = currentSearchBookFilter === 'all'
        ? lastSearchResultsCache
        : lastSearchResultsCache.filter(r => (r.group || r.bookTitle) === currentSearchBookFilter);

    if (!filtered.length) {
        renderEmptySearchState(query);
        return;
    }

    if (isSearchGroupedByBook) {
        const grouped = {};
        filtered.forEach(r => {
            const g = r.group || r.bookTitle;
            if (!grouped[g]) grouped[g] = [];
            grouped[g].push(r);
        });

        Object.entries(grouped).forEach(([gName, list]) => {
            const block = document.createElement('div');
            block.className = 'search-group-block';
            block.innerHTML = `
                <div class="search-group-header">
                    <span><i class="fas fa-book-bookmark"></i> ${escapeHtml(gName)}</span>
                    <span class="results-badge">${list.length} موضع</span>
                </div>
                <div class="search-group-items"></div>
            `;
            const itemsHost = block.querySelector('.search-group-items');
            list.forEach(item => itemsHost.appendChild(createResultCardNode(item, query)));
            container.appendChild(block);
        });
        return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(item => fragment.appendChild(createResultCardNode(item, query)));
    container.appendChild(fragment);
}

function createResultCardNode(item, query) {
    const card = document.createElement('div');
    card.className = 'search-result-card tactile-btn';

    if (item.type === 'book') {
        const book = allBooksManifest[item.bookId];
        card.innerHTML = `
            <div class="search-result-icon"><i class="fas ${item.pdf ? 'fa-file-pdf' : 'fa-book-open'}"></i></div>
            <div class="search-result-main">
                <div class="search-card-header">
                    <h4>${highlightArabicText(escapeHtml(item.bookTitle), query)}</h4>
                    <span class="search-page-badge">${item.pdf ? 'مخطوط PDF' : 'متن'}</span>
                </div>
                <div class="search-result-meta">
                    <span>${escapeHtml(item.group)}</span>
                    <span>${item.tocCount || 0} باب مفهرس</span>
                </div>
            </div>
        `;
        card.onclick = () => item.pdf ? window.open(book.pdf_url, '_blank') : loadAndOpenBook(item.bookId, book.title, book.toc, book.total_pages, null, query);
        return card;
    }

    if (item.type === 'toc') {
        const book = allBooksManifest[item.bookId] || {};
        card.innerHTML = `
            <div class="search-result-icon"><i class="fas fa-bookmark"></i></div>
            <div class="search-result-main">
                <div class="search-card-header">
                    <h4>${highlightArabicText(escapeHtml(item.chapterTitle), query)}</h4>
                    <span class="search-page-badge">صـ ${escapeHtml(item.pageNum)}</span>
                </div>
                <div class="search-result-meta">
                    <span><i class="fas fa-book text-gold"></i> ${escapeHtml(item.bookTitle)}</span>
                    <span>${escapeHtml(item.group)}</span>
                </div>
                <div class="search-result-actions">
                    <button class="search-action-chip" onclick="openQuickPreviewModal('${escapeHtml(item.bookId)}', ${Number(item.pageNum) || 1}, '${escapeHtml(query)}', event)">
                        <i class="fas fa-eye"></i> معاينة السياق
                    </button>
                    <button class="search-action-chip" onclick="loadAndOpenBook('${escapeHtml(item.bookId)}', '${escapeHtml(item.bookTitle)}', null, ${bookTotal(item.bookId)}, ${Number(item.pageNum) || 1}, '${escapeHtml(query)}')">
                        <i class="fas fa-book-open"></i> فتح الباب
                    </button>
                </div>
            </div>
        `;
        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            loadAndOpenBook(item.bookId, item.bookTitle, book.toc, bookTotal(item.bookId), item.pageNum, query);
        };
        return card;
    }

    // نتيجة نصية داخل الصفحات
    const book = allBooksManifest[item.bookId] || {};
    card.className = 'search-result-card search-text-result tactile-btn';
    card.innerHTML = `
        <div class="search-result-icon"><i class="fas fa-align-right"></i></div>
        <div class="search-result-main">
            <div class="search-card-header">
                <h4>${escapeHtml(item.bookTitle)}</h4>
                <span class="search-page-badge">صـ ${escapeHtml(item.pageNum)}</span>
            </div>
            ${item.chapterTitle ? `<div class="search-chapter-badge"><i class="fas fa-sitemap"></i> ${highlightArabicText(escapeHtml(item.chapterTitle), query)}</div>` : ''}
            <p class="search-snippet">${item.snippet}</p>
            <div class="search-result-actions">
                <button class="search-action-chip" onclick="openQuickPreviewModal('${escapeHtml(item.bookId)}', ${Number(item.pageNum) || 1}, '${escapeHtml(query)}', event)">
                    <i class="fas fa-eye"></i> معاينة سريعة
                </button>
                <button class="search-action-chip" onclick="quickSaveSearchResultSnippet('${escapeHtml(item.bookId)}', ${Number(item.pageNum) || 1}, event)">
                    <i class="fas fa-bookmark"></i> حفظ شاهد
                </button>
                <button class="search-action-chip" onclick="loadAndOpenBook('${escapeHtml(item.bookId)}', '${escapeHtml(item.bookTitle)}', null, ${bookTotal(item.bookId)}, ${Number(item.pageNum) || 1}, '${escapeHtml(query)}')">
                    <i class="fas fa-arrow-up-right-from-square"></i> فتح الموضع
                </button>
            </div>
        </div>
    `;
    card.onclick = (e) => {
        if (e.target.closest('button')) return;
        loadAndOpenBook(item.bookId, item.bookTitle, book.toc, bookTotal(item.bookId), item.pageNum, query);
    };
    return card;
}

function renderEmptySearchState(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="search-empty-state">
            <div class="empty-icon-box"><i class="fas fa-magnifying-glass-minus text-gold"></i></div>
            <h4>لا توجد نتائج مطابقة لـ «${escapeHtml(query)}»</h4>
            <p>جرّب اختيار «جذور مرنة» أو «كل الكلمات» أو توسيع نطاق الكتب المحددة.</p>
        </div>`;
}

// ==================== نافذة المعاينة الفورية للسياق من داخل البحث ====================
async function openQuickPreviewModal(bookId, pageNum, query = '', event = null) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('quickPreviewModal');
    const bodyEl = document.getElementById('previewModalContent');
    const titleEl = document.getElementById('previewModalBookTitle');
    const metaEl = document.getElementById('previewModalMetaTag');
    if (!modal || !bodyEl) return;

    const book = allBooksManifest[bookId] || {};
    if (titleEl) titleEl.textContent = book.title || getGroupName(book, bookId);
    bodyEl.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin text-gold"></i> جاري جلب الصفحة...</div>';
    modal.style.display = 'flex';

    try {
        const data = await fetchBookData(bookId);
        const pages = data.pages || [];
        pages.sort((a, b) => Number(a.page_number) - Number(b.page_number));
        let idx = pages.findIndex(p => Number(p.page_number) === Number(pageNum));
        if (idx === -1) idx = 0;

        currentPreviewState = {
            bookId,
            bookTitle: book.title || getGroupName(book, bookId),
            pages,
            toc: data.toc || book.toc || [],
            pageIndex: idx,
            query
        };
        renderQuickPreviewModalContent();
    } catch (e) {
        bodyEl.innerHTML = '<div style="text-align:center; color:#ff6b6b; padding:25px;">تعذر تحميل محتوى الصفحة للمعاينة.</div>';
    }
}

function renderQuickPreviewModalContent() {
    if (!currentPreviewState) return;
    const bodyEl = document.getElementById('previewModalContent');
    const metaEl = document.getElementById('previewModalMetaTag');
    const pageObj = currentPreviewState.pages[currentPreviewState.pageIndex];
    if (!pageObj || !bodyEl) return;

    const pNum = pageObj.page_number || (currentPreviewState.pageIndex + 1);
    if (metaEl) metaEl.textContent = `✦ معاينة السياق — صفحة ${pNum} من ${currentPreviewState.pages.length}`;

    const cleaned = cleanPageWatermarkHtml(pageObj.content || '');
    bodyEl.innerHTML = currentPreviewState.query
        ? highlightArabicText(cleaned, currentPreviewState.query)
        : cleaned;
    bodyEl.scrollTop = 0;
}

function previewModalAdjacentPage(delta) {
    if (!currentPreviewState) return;
    const nextIdx = currentPreviewState.pageIndex + delta;
    if (nextIdx >= 0 && nextIdx < currentPreviewState.pages.length) {
        currentPreviewState.pageIndex = nextIdx;
        renderQuickPreviewModalContent();
    }
}

function copyPreviewModalCitation() {
    if (!currentPreviewState) return;
    const pageObj = currentPreviewState.pages[currentPreviewState.pageIndex];
    if (!pageObj) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = cleanPageWatermarkHtml(pageObj.content || '');
    const text = (tmp.textContent || '').trim();
    const pNum = pageObj.page_number || (currentPreviewState.pageIndex + 1);
    const out = `«${text}»\n\n📖 المصدر: ${currentPreviewState.bookTitle} — صـ ${pNum}\n✦ خزانة علوم العترة | جليس الكليني`;
    navigator.clipboard?.writeText(out).then(() => showToast('تم نسخ الصفحة مع توثيقها الكامل', 'fa-copy'));
}

function pinPreviewModalPage() {
    if (!currentPreviewState) return;
    const pageObj = currentPreviewState.pages[currentPreviewState.pageIndex];
    if (!pageObj) return;
    const pNum = pageObj.page_number || (currentPreviewState.pageIndex + 1);
    pinnedComparisonData = {
        bookId: currentPreviewState.bookId,
        bookTitle: currentPreviewState.bookTitle,
        pageIndex: currentPreviewState.pageIndex + 1,
        pageNum: pNum,
        content: cleanPageWatermarkHtml(pageObj.content || '')
    };
    try { localStorage.setItem(PINNED_COMPARE_KEY, JSON.stringify(pinnedComparisonData)); } catch (e) {}
    showToast('تم تثبيت الصفحة في درج المقارنة المرجعية داخل القارئ', 'fa-columns');
}

function openPreviewModalInFullReader() {
    if (!currentPreviewState) return;
    const pageObj = currentPreviewState.pages[currentPreviewState.pageIndex];
    const pNum = pageObj ? (pageObj.page_number || (currentPreviewState.pageIndex + 1)) : 1;
    closeQuickPreviewModal();
    loadAndOpenBook(
        currentPreviewState.bookId,
        currentPreviewState.bookTitle,
        currentPreviewState.toc,
        currentPreviewState.pages.length,
        pNum,
        currentPreviewState.query
    );
}

function closeQuickPreviewModal() {
    const modal = document.getElementById('quickPreviewModal');
    if (modal) modal.style.display = 'none';
}

async function quickSaveSearchResultSnippet(bookId, pageNum, event) {
    if (event) event.stopPropagation();
    try {
        const data = await fetchBookData(bookId);
        const page = (data.pages || []).find(p => Number(p.page_number) === Number(pageNum)) || data.pages?.[0];
        if (!page) return;
        const tmp = document.createElement('div');
        tmp.innerHTML = cleanPageWatermarkHtml(page.content || '');
        const text = (tmp.textContent || '').trim().slice(0, 350);
        const bTitle = allBooksManifest[bookId]?.title || bookId;
        const quotes = getSavedQuotes();
        quotes.unshift({
            id: 'q_' + Date.now(),
            key: `${bookId}|${pageNum}|${text}`,
            text,
            bookId,
            bookTitle: bTitle,
            pageNum,
            pageIndex: Number(pageNum) || 1,
            date: new Date().toLocaleDateString('ar-IQ')
        });
        writeJsonStorage(SAVED_QUOTES_KEY, quotes.slice(0, 400));
        showToast('تم حفظ الموضع في دفتر الشواهد', 'fa-bookmark');
    } catch (e) {}
}

function exportCurrentSearchResults() {
    if (!lastSearchResultsCache.length) {
        showToast('لا توجد نتائج حالية لتصديرها', 'fa-triangle-exclamation');
        return;
    }
    const q = document.getElementById('searchInput')?.value.trim() || '';
    let txt = `=== تقرير نتائج البحث العلمي عن: «${q}» ===\nعدد النتائج: ${lastSearchResultsCache.length}\n\n`;
    lastSearchResultsCache.forEach((r, idx) => {
        const cleanSnip = (r.snippet || '').replace(/<[^>]+>/g, '');
        txt += `${idx + 1}. الكتاب: ${r.bookTitle} — ص ${r.pageNum || '-'}\n`;
        if (r.chapterTitle) txt += `   الباب: ${r.chapterTitle}\n`;
        if (cleanSnip) txt += `   النص: «${cleanSnip}»\n`;
        txt += `--------------------------------------------\n`;
    });
    downloadPlainTextFile(txt, `search-results-${Date.now()}.txt`);
    showToast('تم تصدير نتائج البحث كملف نصي', 'fa-download');
}

function bookTotal(id) {
    return allBooksManifest[id]?.total_pages || 1;
}

// ==================== محرك الإشراقات اليومية ====================
function initDailyHadithSystem() {
    dailyHadithCollection = fallbackHadithCollection;
    loadRandomDailyHadith();

    if (hadithIntervalTimer) clearInterval(hadithIntervalTimer);
    hadithIntervalTimer = setInterval(() => {
        if (dailyHadithCollection.length > 0 && document.getElementById('homeView')?.classList.contains('active')) {
            loadRandomDailyHadith();
        }
    }, 12000);
}

function loadRandomDailyHadith() {
    const textEl = document.getElementById('dailyHadithText');
    const sourceEl = document.getElementById('dailyHadithSource');
    if (!textEl || !sourceEl || dailyHadithCollection.length === 0) return;

    const randomIndex = Math.floor(Math.random() * dailyHadithCollection.length);
    currentDailyHadith = dailyHadithCollection[randomIndex];

    textEl.style.opacity = '0';
    setTimeout(() => {
        textEl.innerText = currentDailyHadith.text || "";
        sourceEl.innerHTML = `<i class="fas fa-feather-pointed text-gold"></i> المصدر: ${escapeHtml(currentDailyHadith.source || "غير محدد")}`;
        textEl.style.transition = 'opacity 0.3s ease';
        textEl.style.opacity = '1';
    }, 150);
}

function searchCurrentHadithInLibrary() {
    if (!currentDailyHadith) return;
    const q = currentDailyHadith.searchKey || currentDailyHadith.text.slice(0, 35);
    const input = document.getElementById('searchInput');
    if (input) input.value = q;
    openSearch();
    setSearchTargetMode('fulltext');
}

function shareDailyHadith() {
    if (!currentDailyHadith) return;
    const shareContent = `✦ إشراقة النور من علوم آل محمد:\n\n${currentDailyHadith.text}\n\n📖 ${currentDailyHadith.source}\n✦ خزانة علوم العترة: https://t.me/Jali4s`;

    if (navigator.share) {
        navigator.share({ title: "إشراقة علوم العترة", text: shareContent }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareContent);
        showToast("تم نسخ الإشراقة المباركة مع التوثيق والمصدر", "fa-clipboard-check");
    }
}

// ==================== نظام الحواشي المنبثقة الذكي ====================
let footnoteTimeout;
function showFootnoteToast(text) {
    let toast = document.getElementById('footnoteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'footnoteToast';
        toast.className = 'footnote-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = text;
    toast.classList.add('show');

    clearTimeout(footnoteTimeout);
    footnoteTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 7500);

    toast.onclick = () => toast.classList.remove('show');
}

document.addEventListener('click', function (e) {
    let target = e.target.closest('a');
    if (!target) return;
    let href = target.getAttribute('href');
    if (href && href.startsWith('#') && (target.classList.contains('footnote-ref') || target.classList.contains('note') || href.includes('fn'))) {
        e.preventDefault();
        let footnoteId = href.substring(1);
        let footnoteElement = document.getElementById(footnoteId);
        if (footnoteElement) {
            showFootnoteToast(footnoteElement.innerHTML);
        }
    }
});

// ==================== التهيئة والاختصارات وطبقة الأداء V12 ====================
document.querySelectorAll('.tactile-btn').forEach(btn => attachTactilePhysics(btn));
initDailyHadithSystem();

document.addEventListener('keydown', (event) => {
    const tag = (event.target?.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || event.target?.isContentEditable;
    if (event.key === 'Escape') {
        ['personalLibraryModal', 'libraryCommandCenterModal', 'noteEditorModal', 'customBookScopeModal', 'quickPreviewModal', 'citationModal', 'appearanceModal', 'volumesModal', 'tocModal', 'settingsModal', 'inBookSearchModal', 'addTagModal'].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'none';
        });
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openLibraryCommandCenter();
        return;
    }
    if (event.key === '/' && !typing) {
        event.preventDefault();
        openSearch();
    }
});

/* ============================================================================
   JALIS AL-KULAYNI — PERFORMANCE & INDEXEDDB CACHE CORE V12
   ========================================================================== */
(() => {
    'use strict';

    const PERF = {
        dbName: 'jalis_alkulaini_cache_v1',
        dbVersion: 1,
        store: 'books',
        memory: new Map(),
        pending: new Map(),
        lastUrlSync: 0
    };

    const safeJson = (value, fallback) => {
        try { return JSON.parse(value); } catch (_) { return fallback; }
    };

    function openCacheDB() {
        if (!('indexedDB' in window)) return Promise.resolve(null);
        if (PERF.dbPromise) return PERF.dbPromise;
        PERF.dbPromise = new Promise(resolve => {
            try {
                const req = indexedDB.open(PERF.dbName, PERF.dbVersion);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(PERF.store)) {
                        db.createObjectStore(PERF.store, { keyPath: 'id' });
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            } catch (_) { resolve(null); }
        });
        return PERF.dbPromise;
    }

    async function idbGet(id) {
        const db = await openCacheDB();
        if (!db) return null;
        return new Promise(resolve => {
            try {
                const tx = db.transaction(PERF.store, 'readonly');
                const req = tx.objectStore(PERF.store).get(String(id));
                req.onsuccess = () => resolve(req.result?.data || null);
                req.onerror = () => resolve(null);
            } catch (_) { resolve(null); }
        });
    }

    async function idbPut(id, data) {
        const db = await openCacheDB();
        if (!db || !data) return false;
        return new Promise(resolve => {
            try {
                const tx = db.transaction(PERF.store, 'readwrite');
                tx.objectStore(PERF.store).put({ id: String(id), data, savedAt: Date.now() });
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
                tx.onabort = () => resolve(false);
            } catch (_) { resolve(false); }
        });
    }

    function setLibraryStats() {
        const count = Object.keys(allBooksManifest || {}).length;
        document.querySelectorAll('[data-library-book-count]').forEach(el => {
            el.textContent = count.toLocaleString('ar-IQ');
        });
    }

    const originalFetchBookData = fetchBookData;
    fetchBookData = async function (bookId) {
        const id = String(bookId || '').trim();
        if (!id) throw new Error('معرّف الكتاب فارغ');
        if (PERF.memory.has(id)) return PERF.memory.get(id);
        if (PERF.pending.has(id)) return PERF.pending.get(id);

        const task = (async () => {
            const dbData = await idbGet(id);
            if (dbData?.pages) {
                PERF.memory.set(id, dbData);
                return dbData;
            }

            try {
                const old = localStorage.getItem(`book_pages_${id}`);
                const parsed = safeJson(old, null);
                if (parsed?.length) {
                    const data = { pages: parsed };
                    PERF.memory.set(id, data);
                    void idbPut(id, data);
                    return data;
                }
            } catch (_) {}

            const manifestBook = allBooksManifest[id] || {};
            const directCandidates = [
                manifestBook.json_url, manifestBook.url, manifestBook.json,
                manifestBook.file, manifestBook.file_path, manifestBook.path, manifestBook.src
            ].filter(v => typeof v === 'string' && /\.json(?:$|\?)/i.test(v));

            for (const candidate of [...new Set(directCandidates)]) {
                try {
                    const res = await fetchWithTimeout(candidate, { cache: 'default' }, 6500);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            PERF.memory.set(id, data);
                            void idbPut(id, data);
                            return data;
                        }
                    }
                } catch (_) {}
            }

            const data = await originalFetchBookData(id);
            PERF.memory.set(id, data);
            void idbPut(id, data);
            return data;
        })();

        PERF.pending.set(id, task);
        try { return await task; }
        finally { PERF.pending.delete(id); }
    };

    let pageFrame = 0;
    const originalRenderCurrentPage = renderCurrentPage;
    renderCurrentPage = function () {
        cancelAnimationFrame(pageFrame);
        pageFrame = requestAnimationFrame(() => {
            try { originalRenderCurrentPage(); }
            catch (error) {
                console.error('[Reader] renderCurrentPage failed', error);
            }
        });
    };

    const originalLoadLibraryManifest = loadLibraryManifest;
    loadLibraryManifest = async function () {
        await originalLoadLibraryManifest();
        setLibraryStats();
    };

    document.addEventListener('keydown', event => {
        const tag = String(event.target?.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || event.target?.isContentEditable;
        if (typing) return;
        if (document.getElementById('readerView')?.classList.contains('active')) {
            if (event.key === 'ArrowRight') { event.preventDefault(); prevPage(); }
            else if (event.key === 'ArrowLeft') { event.preventDefault(); nextPage(); }
        }
    }, { passive: false });

    const originalSyncReaderUrl = syncReaderUrl;
    syncReaderUrl = function (pageIndex = currentPageIndex, replace = true) {
        const now = performance.now();
        if (now - PERF.lastUrlSync < 80) return;
        PERF.lastUrlSync = now;
        return originalSyncReaderUrl(pageIndex, replace);
    };

    const start = () => {
        void loadLibraryManifest();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
