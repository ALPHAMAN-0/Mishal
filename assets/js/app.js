/*
 * App Module — Main orchestrator
 * Scroll reveal animations, theme toggle, services accordion,
 * data loading, and initialization.
 */

// Default data
var defaultSkills = [
    { id: 'skill-1', name: 'JavaScript', proficiency: 90 },
    { id: 'skill-2', name: 'HTML & CSS', proficiency: 95 },
    { id: 'skill-3', name: 'React', proficiency: 80 },
    { id: 'skill-4', name: 'Node.js', proficiency: 75 },
    { id: 'skill-5', name: 'Python', proficiency: 70 },
    { id: 'skill-6', name: 'Git & GitHub', proficiency: 85 }
];

var defaultProjects = [
    {
        id: 'proj-1',
        title: 'Portfolio Website',
        description: 'A drag-and-drop editable portfolio with Firebase backend and auto-deployment.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Firebase'],
        demoUrl: '#',
        repoUrl: '#'
    },
    {
        id: 'proj-2',
        title: 'Task Manager App',
        description: 'A full-stack task management application with real-time updates and authentication.',
        tags: ['React', 'Node.js', 'MongoDB'],
        demoUrl: '#',
        repoUrl: '#'
    },
    {
        id: 'proj-3',
        title: 'Weather Dashboard',
        description: 'A weather dashboard that shows current conditions and forecasts using a public API.',
        tags: ['JavaScript', 'API', 'CSS Grid'],
        demoUrl: '#',
        repoUrl: '#'
    }
];

// ===== Initialization =====

document.addEventListener('DOMContentLoaded', function () {
    // Set year
    var yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Load saved theme
    initTheme();

    // Initialize modules
    initAuth();
    initDragDrop();
    initEditor();

    // Load data
    loadPortfolioData();

    // IP check
    checkIPAccess();

    // Start GSAP animations
    initGSAPAnimations();
});

// ===== GSAP ANIMATIONS =====

function initGSAPAnimations() {
    // Guard: if GSAP failed to load, show everything
    if (typeof gsap === 'undefined') {
        document.querySelectorAll('.reveal-child, .hero-first-name, .skill-card, .project-card').forEach(function (el) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        });
        return;
    }

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // CSS fallback handles visibility
    }

    // Register plugins
    gsap.registerPlugin(ScrollTrigger);

    // Ensure ticker runs in all contexts (background tabs, headless)
    gsap.ticker.lagSmoothing(0);

    // Mark body for FOUC prevention, mark html as GSAP ready
    document.body.classList.add('gsap-init');
    document.documentElement.classList.add('gsap-ready');

    // Global defaults
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });

    // ========================================
    //  HERO PAGE-LOAD TIMELINE (plays on load)
    // ========================================

    var heroTL = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

    // 1. Navbar — fade down from top
    gsap.set('#navbar .reveal-child', { y: -20, opacity: 0, visibility: 'visible' });
    heroTL.to('#navbar .reveal-child', {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.08
    }, 0);

    // 2. "Hey," slides from left, "there" slides from right
    gsap.set('.hero-script-hey', { opacity: 0, x: -60, visibility: 'visible' });
    gsap.set('.hero-script-there', { opacity: 0, x: 60, visibility: 'visible' });
    heroTL.to('.hero-script-hey', {
        opacity: 0.08, x: 0, duration: 1.2, ease: 'power2.out'
    }, 0.1);
    heroTL.to('.hero-script-there', {
        opacity: 0.08, x: 0, duration: 1.2, ease: 'power2.out'
    }, 0.2);

    // 3. Profile photo — scale up with fade
    gsap.set('.profile-pic-container', { scale: 0.85, opacity: 0, visibility: 'visible' });
    heroTL.to('.profile-pic-container', {
        scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out'
    }, 0.3);

    // 4. "I AM MISHAL" — slide up from bottom left
    gsap.set('.hero-bottom-left .reveal-child', { y: 60, opacity: 0, visibility: 'visible' });
    heroTL.to('.hero-bottom-left .reveal-child', {
        y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'back.out(1.4)'
    }, 0.8);

    // 5. "SOFTWARE DEVELOPER" + desc — slide up from bottom right
    gsap.set('.hero-bottom-right .reveal-child', { y: 50, opacity: 0, visibility: 'visible' });
    heroTL.to('.hero-bottom-right .reveal-child', {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out'
    }, 0.9);

    // ========================================
    //  WATERMARK PARALLAX (scrub — continuous)
    // ========================================

    gsap.utils.toArray('.watermark').forEach(function (wm) {
        gsap.set(wm, { visibility: 'visible' });
        gsap.fromTo(wm,
            { y: 60 },
            {
                y: -60, ease: 'none',
                scrollTrigger: {
                    trigger: wm.closest('.section-header') || wm.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8
                }
            }
        );
    });

    // ========================================
    //  WORK / PROJECTS SECTION
    // ========================================

    animateRevealGroup('#work .section-header', { y: 40, stagger: 0.12 });
    animateRevealGroup('#work .work-filters', { y: 20, stagger: 0.08 });

    // Project cards — stagger with slight rotation
    ScrollTrigger.create({
        trigger: '#projects-container',
        start: 'top 85%',
        once: true,
        onEnter: function () {
            var cards = document.querySelectorAll('#projects-container .project-card');
            if (!cards.length) return;
            gsap.set(cards, { y: 60, opacity: 0, rotation: 2, visibility: 'visible' });
            gsap.to(cards, {
                y: 0, opacity: 1, rotation: 0,
                duration: 0.8, stagger: 0.15, ease: 'power3.out'
            });
        }
    });

    // ========================================
    //  SERVICES SECTION
    // ========================================

    animateRevealGroup('#services .section-header', { y: 40, stagger: 0.12 });

    // Service items — slide from left
    ScrollTrigger.create({
        trigger: '.services-list',
        start: 'top 80%',
        once: true,
        onEnter: function () {
            var items = document.querySelectorAll('.services-list .reveal-child');
            gsap.set(items, { x: -50, opacity: 0, visibility: 'visible' });
            gsap.to(items, {
                x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out'
            });
        }
    });

    // ========================================
    //  SKILLS SECTION
    // ========================================

    animateRevealGroup('#skills .section-header', { y: 40, stagger: 0.12 });

    // Skill cards — stagger fade up, then bars fill
    ScrollTrigger.create({
        trigger: '#skills-container',
        start: 'top 85%',
        once: true,
        onEnter: function () {
            var cards = document.querySelectorAll('#skills-container .skill-card');
            if (!cards.length) return;

            gsap.set(cards, { y: 40, opacity: 0, visibility: 'visible' });

            var skillTL = gsap.timeline();

            // Cards stagger in
            skillTL.to(cards, {
                y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out'
            });

            // Skill bars fill to their target width
            skillTL.add(function () {
                cards.forEach(function (card) {
                    var fill = card.querySelector('.skill-bar-fill');
                    if (!fill) return;
                    var targetWidth = fill.style.width || '0%';
                    gsap.set(fill, { width: '0%' });
                    gsap.to(fill, {
                        width: targetWidth, duration: 1.0, ease: 'power2.out'
                    });
                });
            }, '-=0.3');
        }
    });

    // ========================================
    //  EXPERIENCE SECTION
    // ========================================

    animateRevealGroup('#experience .exp-top', { y: 40, stagger: 0.12 });

    // Timeline line draws down + items stagger from left
    ScrollTrigger.create({
        trigger: '.exp-list',
        start: 'top 80%',
        once: true,
        onEnter: function () {
            // Create timeline line if needed
            var expList = document.querySelector('.exp-list');
            var line = expList.querySelector('.exp-timeline-line');
            if (!line) {
                line = document.createElement('div');
                line.className = 'exp-timeline-line';
                expList.prepend(line);
            }

            // Draw the vertical line
            gsap.to(line, { height: '100%', duration: 1.2, ease: 'power2.inOut' });

            // Experience items slide from left
            var items = document.querySelectorAll('.exp-list .reveal-child');
            gsap.set(items, { x: -40, opacity: 0, visibility: 'visible' });
            gsap.to(items, {
                x: 0, opacity: 1, duration: 0.8, stagger: 0.2,
                ease: 'power3.out', delay: 0.2
            });
        }
    });

    // ========================================
    //  CONTACT CTA SECTION
    // ========================================

    ScrollTrigger.create({
        trigger: '.contact-cta',
        start: 'top 80%',
        once: true,
        onEnter: function () {
            var cta = document.querySelector('.contact-cta');
            gsap.set(cta, { scale: 0.95, opacity: 0 });
            gsap.to(cta, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' });

            var children = cta.querySelectorAll('.reveal-child');
            gsap.set(children, { y: 30, opacity: 0, visibility: 'visible' });
            gsap.to(children, {
                y: 0, opacity: 1, duration: 0.7, stagger: 0.12,
                ease: 'power3.out', delay: 0.3
            });
        }
    });

    // ========================================
    //  FOOTER
    // ========================================

    ScrollTrigger.create({
        trigger: 'footer',
        start: 'top 92%',
        once: true,
        onEnter: function () {
            gsap.from('footer .container', {
                y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
            });
        }
    });

    // ========================================
    //  UTILITY: Reusable section reveal helper
    // ========================================

    function animateRevealGroup(parentSelector, opts) {
        var parent = document.querySelector(parentSelector);
        if (!parent) return;

        var children = parent.querySelectorAll('.reveal-child');
        if (!children.length) return;

        gsap.set(children, { y: opts.y || 30, opacity: 0, visibility: 'visible' });

        ScrollTrigger.create({
            trigger: parent,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                gsap.to(children, {
                    y: 0, opacity: 1,
                    duration: opts.duration || 0.8,
                    stagger: opts.stagger || 0.1,
                    ease: opts.ease || 'power3.out'
                });
            }
        });
    }

    // ========================================
    //  BUTTON POP: bounce after hero CTA appears
    // ========================================

    // Button pop on hero big name
    heroTL.to('.hero-big-name', {
        scale: 1.03, duration: 0.2, ease: 'power2.out'
    }, 1.6);
    heroTL.to('.hero-big-name', {
        scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)'
    }, 1.8);

    // ========================================
    //  MOUSE-TRACKING SHINE on buttons
    // ========================================

    document.querySelectorAll('.btn-dark').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--x', x + '%');
            btn.style.setProperty('--y', y + '%');
        });
    });

    // ========================================
    //  MAGNETIC HOVER on FAB button
    // ========================================

    var fab = document.getElementById('admin-fab');
    if (fab) {
        fab.addEventListener('mousemove', function (e) {
            var rect = fab.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX - cx) * 0.15;
            var dy = (e.clientY - cy) * 0.15;
            gsap.to(fab, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        fab.addEventListener('mouseleave', function () {
            gsap.to(fab, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
    }

    // ========================================
    //  MAGNETIC HOVER on social pills
    // ========================================

    document.querySelectorAll('.social-pill').forEach(function (pill) {
        pill.addEventListener('mousemove', function (e) {
            var rect = pill.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX - cx) * 0.1;
            var dy = (e.clientY - cy) * 0.1;
            gsap.to(pill, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
        });
        pill.addEventListener('mouseleave', function () {
            gsap.to(pill, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });
}

// ===== THEME TOGGLE =====

function initTheme() {
    var saved = localStorage.getItem('portfolio-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
    updateThemeIcons();
}

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcons();
}

function updateThemeIcons() {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var sunIcon = document.getElementById('icon-sun');
    var moonIcon = document.getElementById('icon-moon');
    if (sunIcon && moonIcon) {
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }
}

// ===== SERVICE ACCORDION =====

function toggleService(item) {
    var wasActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.service-item').forEach(function (s) {
        s.classList.remove('active');
        s.querySelector('.service-toggle-icon').innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';
    });

    if (!wasActive) {
        item.classList.add('active');
        item.querySelector('.service-toggle-icon').innerHTML = '&times;';
    }
}

// ===== WORK FILTER =====

function filterWork(type) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter cards (basic — for now show all)
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
        card.style.display = '';
    });
}

// ===== Load Data =====

function loadPortfolioData() {
    if (firebaseReady) {
        loadContentFromFirestore();
        loadSkillsFromFirestore();
        loadProjectsFromFirestore();
    } else {
        renderDefaultSkills();
        renderDefaultProjects();
    }
}

function loadContentFromFirestore() {
    db.collection('content').doc('main').get()
        .then(function (doc) {
            if (!doc.exists) return;
            var data = doc.data();
            Object.keys(data).forEach(function (key) {
                if (key === 'profilePic') {
                    if (data.profilePic) {
                        document.getElementById('profile-pic').src = data.profilePic;
                        var ctaAvatar = document.getElementById('cta-avatar');
                        if (ctaAvatar) ctaAvatar.src = data.profilePic;
                    }
                    return;
                }
                var el = document.querySelector('[data-field="' + key + '"]');
                if (el) el.textContent = data[key];
            });
        })
        .catch(function (err) {
            console.warn('Failed to load content:', err.message);
        });
}

function loadSkillsFromFirestore() {
    db.collection('skills').orderBy('order').get()
        .then(function (snapshot) {
            if (snapshot.empty) {
                renderDefaultSkills();
                return;
            }
            var container = document.getElementById('skills-container');
            container.innerHTML = '';
            snapshot.forEach(function (doc) {
                var data = doc.data();
                var card = createSkillElement(doc.id, data.name, data.proficiency || 75);
                if (isAdminMode) card.setAttribute('draggable', 'true');
                container.appendChild(card);
            });
            applyOrder('skills-container');
        })
        .catch(function (err) {
            console.warn('Failed to load skills:', err.message);
            renderDefaultSkills();
        });
}

function loadProjectsFromFirestore() {
    db.collection('projects').orderBy('order').get()
        .then(function (snapshot) {
            if (snapshot.empty) {
                renderDefaultProjects();
                return;
            }
            var container = document.getElementById('projects-container');
            container.innerHTML = '';
            snapshot.forEach(function (doc) {
                var data = doc.data();
                var card = createProjectElement(
                    doc.id, data.title, data.description,
                    data.tags || [], data.demoUrl || '#', data.repoUrl || '#'
                );
                if (isAdminMode) card.setAttribute('draggable', 'true');
                container.appendChild(card);
            });
            applyOrder('projects-container');
        })
        .catch(function (err) {
            console.warn('Failed to load projects:', err.message);
            renderDefaultProjects();
        });
}

function applyOrder(containerId) {
    if (!firebaseReady) return;
    db.collection('settings').doc('order').get()
        .then(function (doc) {
            if (!doc.exists) return;
            var order = doc.data()[containerId];
            if (!order || !order.length) return;
            var container = document.getElementById(containerId);
            order.forEach(function (id) {
                var card = container.querySelector('[data-id="' + id + '"]');
                if (card) container.appendChild(card);
            });
        })
        .catch(function () {});
}

// ===== Render Defaults =====

function renderDefaultSkills() {
    var container = document.getElementById('skills-container');
    container.innerHTML = '';
    defaultSkills.forEach(function (skill) {
        container.appendChild(createSkillElement(skill.id, skill.name, skill.proficiency));
    });
}

function renderDefaultProjects() {
    var container = document.getElementById('projects-container');
    container.innerHTML = '';
    defaultProjects.forEach(function (proj) {
        container.appendChild(createProjectElement(
            proj.id, proj.title, proj.description, proj.tags, proj.demoUrl, proj.repoUrl
        ));
    });
}

// ===== IP Access Control =====

function checkIPAccess() {
    if (!firebaseReady) return;
    db.collection('settings').doc('access').get()
        .then(function (doc) {
            if (!doc.exists) return;
            var allowedIPs = doc.data().allowedIPs;
            if (!allowedIPs || !allowedIPs.length) return;
            return fetch('https://api.ipify.org?format=json')
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (!allowedIPs.includes(data.ip)) {
                        var fab = document.getElementById('admin-fab');
                        if (fab) fab.style.display = 'none';
                    }
                });
        })
        .catch(function () {});
}

// ===== Toast Notification =====

function showToast(message, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add('show');
    });

    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
}
