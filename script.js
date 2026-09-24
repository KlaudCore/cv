/* =========================================================
   ERICK CASTAÑEDA — script.js unificado
   Funciona para index.html y portafolio.html
========================================================= */

/* =========================
   PRELOADER
========================= */
(function initPreloader(){
    const preloader = document.getElementById('preloader');
    const bar       = document.getElementById('preloaderBar');
    const number    = document.getElementById('preloaderNumber');
    const textEl    = document.getElementById('preloaderText');
    if (!preloader) return;

    document.body.classList.add('is-loading');

    const messages = [
        'Inicializando experiencia',
        'Cargando recursos',
        'Preparando IA creativa',
        'Casi listo…'
    ];

    let progress = 0;
    let done     = false;

    const setProgress = (v) => {
        progress = Math.min(100, Math.max(0, v));
        const p = Math.round(progress);
        bar.style.width    = p + '%';
        number.textContent = String(p).padStart(2, '0');

        const idx = Math.min(messages.length - 1, Math.floor(p / (100 / messages.length)));
        textEl.textContent = messages[idx];
    };

    const tick = () => {
        if (done) return;
        const remaining = 100 - progress;
        const step = progress < 70
            ? Math.random() * 6 + 2
            : Math.random() * (remaining * 0.15) + 0.3;

        setProgress(progress + step);

        if (progress < 100) {
            setTimeout(tick, 60 + Math.random() * 90);
        } else {
            finish();
        }
    };

    const finish = () => {
        done = true;
        setProgress(100);

        const go = () => {
            setTimeout(() => {
                preloader.classList.add('is-done');
                document.body.classList.remove('is-loading');
                document.dispatchEvent(new CustomEvent('ec:loaded'));
            }, 350);
        };

        if (document.readyState === 'complete') go();
        else window.addEventListener('load', go, { once: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 200));
    } else {
        setTimeout(tick, 200);
    }
})();

/* =========================================================
   IIFE PRINCIPAL
========================================================= */
(function () {
    "use strict";

    var $  = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* =========================================================
       1. TEMA CLARO / OSCURO
    ========================================================= */
    (function initTheme() {
        var rootEl = document.documentElement;
        var themeToggle = $("#themeToggle");

        function syncToggle() {
            if (!themeToggle) return;
            themeToggle.setAttribute("aria-pressed",
                rootEl.classList.contains("light-theme") ? "true" : "false");
        }

        syncToggle();

        if (themeToggle) {
            themeToggle.addEventListener("click", function () {
                var isLight = rootEl.classList.toggle("light-theme");
                try { localStorage.setItem("ec-theme", isLight ? "light" : "dark"); } catch (e) {}
                syncToggle();
            });
        }
    })();

    /* =========================================================
       2. NAVBAR SHRINK
    ========================================================= */
    (function initNavbar() {
        var navbar = $("#navbar");
        if (!navbar) return;
        var lastScroll = 0;

        window.addEventListener("scroll", function () {
            var y = window.scrollY;
            if (y > 40 && lastScroll <= 40) navbar.classList.add("scrolled");
            if (y <= 40 && lastScroll > 40) navbar.classList.remove("scrolled");
            document.body.classList.toggle("nav-shrunk", y > 40);
            lastScroll = y;
        }, { passive: true });
    })();

    /* =========================================================
       3. PARTÍCULAS
    ========================================================= */
    function initParticles(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            canvas.style.display = "none";
            return;
        }

        var ctx = canvas.getContext("2d");
        var particles = [], w, h, dpr;

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            createParticles();
        }

        function createParticles() {
            var count = Math.min(Math.floor(w / 22), 60);
            var hues = [215, 225, 245, 265, 285];
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - .5) * .22,
                    vy: (Math.random() - .5) * .22,
                    r: Math.random() * 1.4 + .5,
                    hue: hues[Math.floor(Math.random() * hues.length)],
                    a: Math.random() * .4 + .35
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            var i, j, p1, p2, dx, dy, dist, alpha, p;

            for (i = 0; i < particles.length; i++) {
                for (j = i + 1; j < particles.length; j++) {
                    p1 = particles[i]; p2 = particles[j];
                    dx = p1.x - p2.x; dy = p1.y - p2.y;
                    dist = Math.hypot(dx, dy);
                    if (dist < 140) {
                        alpha = (1 - dist / 140) * .12;
                        ctx.strokeStyle = "rgba(107,149,255," + alpha + ")";
                        ctx.lineWidth = .6;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            for (i = 0; i < particles.length; i++) {
                p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = "hsla(" + p.hue + ", 90%, 72%, " + p.a + ")";
                ctx.shadowColor = "hsla(" + p.hue + ", 90%, 65%, .7)";
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(draw);
        }

        window.addEventListener("resize", resize);
        resize();
        draw();
    }

    initParticles("heroParticles");
    initParticles("pfParticles");

    /* =========================================================
       4. HERO — PARALLAX
    ========================================================= */
    (function initParallax() {
        var hero = $(".hero");
        var portrait = $(".hero-portrait");
        var glow = $(".portrait-glow");
        if (!hero || !portrait || !glow) return;

        hero.addEventListener("mousemove", function (event) {
            if (document.body.classList.contains("recruiter-on")) return;
            var rect = hero.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            var moveX = (x - rect.width / 2) / 85;
            var moveY = (y - rect.height / 2) / 85;

            portrait.style.transform = "translate(" + moveX + "px," + moveY + "px)";
            glow.style.transform = "translate(" + (-moveX) + "px," + (-moveY) + "px)";
        });

        hero.addEventListener("mouseleave", function () {
            portrait.style.transform = "translate(0,0)";
            glow.style.transform = "translate(0,0)";
        });
    })();

    /* =========================================================
       5. REVEAL ON SCROLL
    ========================================================= */
    (function initReveal() {
        var els = $$(".reveal");
        if (!els.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        els.forEach(function (el) { io.observe(el); });
    })();

    /* =========================================================
       6. CONTADORES ANIMADOS
    ========================================================= */
    (function initCounters() {
        var els = $$("[data-counter]");
        if (!els.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                var target = parseFloat(el.dataset.counter);
                var prefix = el.dataset.prefix || "";
                var suffix = el.dataset.suffix || "";
                var decimals = (el.dataset.counter.split(".")[1] || "").length;
                var duration = 1500;
                var start = performance.now();

                function tick(now) {
                    var p = Math.min((now - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                }

                requestAnimationFrame(tick);
                io.unobserve(el);
            });
        }, { threshold: .6 });

        els.forEach(function (el) { io.observe(el); });
    })();

    /* =========================================================
       7. AI PROCESS SECUENCIAL
    ========================================================= */
    (function initAiProcess() {
        var aiProcess = $("#aiProcess");
        if (!aiProcess) return;
        var aiSteps = aiProcess.querySelectorAll(".step");

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                aiProcess.classList.add("playing");
                aiSteps.forEach(function (step, i) {
                    setTimeout(function () { step.classList.add("lit"); }, i * 280);
                });
                io.unobserve(entry.target);
            });
        }, { threshold: .3 });

        io.observe(aiProcess);
    })();

    /* =========================================================
       8. LOTTIE — FALLBACK
    ========================================================= */
    (function initLottieFallback() {
        var aiLottie = $("#aiLottie");
        if (!aiLottie) return;
        aiLottie.addEventListener("error", function () {
            aiLottie.style.display = "none";
        });
    })();

    /* =========================================================
       9. SKILLS — STAGGER POP
    ========================================================= */
    (function initSkills() {
        var skillsList = $("#skillsList");
        if (!skillsList) return;
        var skills = skillsList.querySelectorAll(".skill");

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                skillsList.classList.add("visible");
                skills.forEach(function (s, i) {
                    s.style.transitionDelay = (i * 45) + "ms";
                });
                io.unobserve(entry.target);
            });
        }, { threshold: .25 });

        io.observe(skillsList);
    })();

    /* =========================================================
       10. PROJECTS CAROUSEL (index)
    ========================================================= */
    (function initProjects() {
        var carousel = $(".projects-carousel");
        var cards    = $$(".project-card");
        var dots     = $$(".pagination-dot");
        if (!carousel || !cards.length || !dots.length) return;

        var AUTOPLAY_MS = 4000;
        var autoplayId  = null;
        var paused      = false;

        function perView() {
            if (window.matchMedia("(max-width: 560px)").matches) return 1;
            if (window.matchMedia("(max-width: 860px)").matches) return 2;
            return 3;
        }

        function step() {
            if (cards.length < 2) return cards[0] ? cards[0].offsetWidth : 0;
            return cards[1].offsetLeft - cards[0].offsetLeft;
        }

        function pageCount() {
            return Math.ceil(cards.length / perView());
        }

        function goToPage(page) {
            var max = pageCount() - 1;
            if (page > max) page = 0;
            if (page < 0) page = max;
            carousel.scrollTo({
                left: page * perView() * step(),
                behavior: "smooth"
            });
        }

        function currentPage() {
            var s = step() * perView();
            if (!s) return 0;
            return Math.round(carousel.scrollLeft / s);
        }

        function setActive(page) {
            dots.forEach(function (d, i) {
                d.classList.toggle("active", i === page);
            });
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayId = setInterval(function () {
                if (paused) return;
                goToPage(currentPage() + 1);
            }, AUTOPLAY_MS);
        }
        function stopAutoplay() {
            if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
        }

        carousel.addEventListener("mouseenter", function () { paused = true; });
        carousel.addEventListener("mouseleave", function () { paused = false; });
        carousel.addEventListener("focusin",    function () { paused = true; });
        carousel.addEventListener("focusout",   function () { paused = false; });
        carousel.addEventListener("touchstart", function () { paused = true;  }, { passive:true });
        carousel.addEventListener("touchend",   function () { paused = false; }, { passive:true });

        document.addEventListener("visibilitychange", function () {
            paused = document.hidden;
        });

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                goToPage(index);
                setActive(index);
            });
        });

        var raf;
        carousel.addEventListener("scroll", function () {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(function () { setActive(currentPage()); });
        }, { passive:true });

        var rraf;
        window.addEventListener("resize", function () {
            if (rraf) cancelAnimationFrame(rraf);
            rraf = requestAnimationFrame(function () {
                var pages = pageCount();
                dots.forEach(function (d, i) { d.style.display = i < pages ? "" : "none"; });
                setActive(Math.min(currentPage(), pages - 1));
            });
        });

        setActive(0);
        startAutoplay();
    })();

    /* =========================================================
       11. NAV ACTIVE STATE
    ========================================================= */
    (function initNavActive() {
        var sections = $$("section[id]:not(#recruiter-panel)");
        var navLinks = $$(".navigation a");
        if (!sections.length || !navLinks.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === "#" + entry.target.id) {
                        link.classList.add("active");
                    }
                });
            });
        }, { threshold: 0.35 });

        sections.forEach(function (section) { io.observe(section); });
    })();

    /* =========================================================
       12. RECRUITER MODE (index)
    ========================================================= */
    (function initRecruiter() {
        var recruiterButton = $("#recruiterBtn");
        var recruiterPanel  = $("#recruiter-panel");
        if (!recruiterButton) return;
        var recruiterLabel = recruiterButton.querySelector(".recruiter-label");

        function setRecruiter(on) {
            document.body.classList.toggle("recruiter-on", on);
            recruiterButton.classList.toggle("active", on);
            recruiterButton.setAttribute("aria-pressed", on ? "true" : "false");

            if (recruiterPanel) {
                recruiterPanel.setAttribute("aria-hidden", on ? "false" : "true");
                if (on) recruiterPanel.scrollTop = 0;
            }
            if (recruiterLabel) {
                recruiterLabel.textContent = on ? "Salir del modo" : "Modo Reclutador";
            }
        }

        recruiterButton.addEventListener("click", function () {
            setRecruiter(!document.body.classList.contains("recruiter-on"));
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && document.body.classList.contains("recruiter-on")) {
                setRecruiter(false);
            }
        });

        if (window.location.hash === "#recruiter") {
            setRecruiter(true);
        }
    })();

    /* =========================================================
       13. PORTAFOLIO — TABS / SWITCH DE VISTAS
    ========================================================= */
    (function initPfTabs() {
        var tabs = $$(".pf-tab");
        var views = $$(".pf-view");
        var tabsInner = $("#pfTabs");
        if (!tabs.length || !views.length) return;

        function activateCategory(cat, scroll) {
            tabs.forEach(function (t) {
                var isActive = t.dataset.cat === cat;
                t.classList.toggle("active", isActive);
                t.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            views.forEach(function (v) {
                v.classList.toggle("active", v.dataset.view === cat);
            });

            var activeTab = $(".pf-tab.active");
            if (activeTab && tabsInner && scroll) {
                activeTab.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest"
                });
            }

            if (history.replaceState) {
                history.replaceState(null, "", "#" + cat);
            }
        }

        tabs.forEach(function (t) {
            t.addEventListener("click", function () {
                activateCategory(t.dataset.cat, true);
                var tabsWrap = $(".pf-tabs-wrap");
                if (tabsWrap) {
                    var y = tabsWrap.getBoundingClientRect().bottom + window.scrollY - 20;
                    window.scrollTo({ top: y, behavior: "smooth" });
                }
            });
        });

        var hash = window.location.hash.replace("#", "");
        var valid = ["grafico", "tresd", "web", "audiovisual", "ia", "eventos"];
        if (valid.indexOf(hash) !== -1) {
            activateCategory(hash, false);
        }
    })();

    /* =========================================================
       14. PORTAFOLIO — MODAL CON GALERÍA (imagen + video)
    ========================================================= */
    (function initPfModal() {
        var modal = $("#pfModal");
        if (!modal) return;

        var modalImg     = $("#pfModalImg");
        var modalVideo   = $("#pfModalVideo");
        var modalCat     = $("#pfModalCat");
        var modalTitle   = $("#pfModalTitle");
        var modalDesc    = $("#pfModalDesc");
        var modalTags    = $("#pfModalTags");
        var modalPrev    = $("#pfModalPrev");
        var modalNext    = $("#pfModalNext");
        var modalThumbs  = $("#pfModalThumbs");
        var modalCounter = $("#pfModalCounter");
        var modalLive    = $("#pfModalLive");   /* ← NUEVO: botón "Ver sitio en vivo" */

        var currentMedia = [];
        var currentIndex = 0;

        /* ---------- Convierte un <img> o <video> en objeto de datos ---------- */
        function mediaOf(node) {
            if (node.tagName === "VIDEO") {
                var src = node.getAttribute("src");
                if (!src) {
                    var source = node.querySelector("source");
                    src = source ? (source.getAttribute("src") || source.src) : "";
                }
                return {
                    type:   "video",
                    src:    src,
                    poster: node.getAttribute("poster") || ""
                };
            }
            return {
                type: "image",
                src:  node.getAttribute("src") || node.currentSrc || ""
            };
        }

        /* ---------- Control del <video> del modal ---------- */
        function stopVideo() {
            if (!modalVideo) return;
            try { modalVideo.pause(); } catch (e) {}
            modalVideo.removeAttribute("src");
            modalVideo.removeAttribute("poster");
            try { modalVideo.load(); } catch (e) {}
        }

        function showVideo(media) {
            if (!modalVideo) return;
            modalImg.style.display   = "none";
            modalVideo.style.display = "block";

            if (media.poster) modalVideo.setAttribute("poster", media.poster);
            else              modalVideo.removeAttribute("poster");

            modalVideo.src   = media.src;
            modalVideo.muted = true;
            try { modalVideo.currentTime = 0; } catch (e) {}

            var p = modalVideo.play();
            if (p && typeof p.catch === "function") p.catch(function () {});
        }

        function showImage(media) {
            stopVideo();
            if (modalVideo) modalVideo.style.display = "none";
            modalImg.style.display = "";
            modalImg.src = media.src;
            modalImg.alt = modalTitle.textContent;
        }

        /* ---------- Render de un slide ---------- */
        function renderSlide(i) {
            if (!currentMedia.length) return;
            currentIndex = (i + currentMedia.length) % currentMedia.length;

            var media = currentMedia[currentIndex];
            if (media.type === "video") showVideo(media);
            else                        showImage(media);

            var multi = currentMedia.length > 1;
            modal.classList.toggle("is-single", !multi);

            if (modalCounter) {
                modalCounter.textContent = (currentIndex + 1) + " / " + currentMedia.length;
            }

            if (modalThumbs) {
                Array.prototype.forEach.call(modalThumbs.children, function (t, idx) {
                    t.classList.toggle("active", idx === currentIndex);
                });
            }
        }

        /* ---------- Abrir ---------- */
        function openModal(data) {
            currentMedia = (data.media && data.media.length)
                ? data.media
                : [{ type: "image", src: data.img || "" }];

            modalCat.textContent   = data.cat + " · " + data.year;
            modalTitle.textContent = data.title;
            modalDesc.textContent  = data.desc;
            modalTags.innerHTML    = data.tags.split(",").map(function (t) {
                return "<span>" + t.trim() + "</span>";
            }).join("");

            /* ---------- Botón "Ver sitio en vivo" ---------- */
            if (modalLive) {
                if (data.live) {
                    modalLive.href = data.live;
                    modalLive.style.display = "";
                } else {
                    modalLive.removeAttribute("href");
                    modalLive.style.display = "none";
                }
            }

            /* Miniaturas (solo si hay más de 1) */
            if (modalThumbs) {
                modalThumbs.innerHTML = "";
                if (currentMedia.length > 1) {
                    currentMedia.forEach(function (m, i) {
                        var t = document.createElement("button");
                        t.type = "button";
                        t.className = "pf-modal-thumb";
                        t.setAttribute("aria-label", "Ver elemento " + (i + 1));

                        var bg = m.type === "video" ? (m.poster || "") : m.src;
                        if (bg) t.style.backgroundImage = 'url("' + bg + '")';

                        if (m.type === "video") {
                            t.classList.add("is-video");
                            t.innerHTML = '<span class="thumb-play" aria-hidden="true">▶</span>';
                        }

                        t.addEventListener("click", function (e) {
                            e.stopPropagation();
                            renderSlide(i);
                        });
                        modalThumbs.appendChild(t);
                    });
                }
            }

            renderSlide(0);

            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
        }

        /* ---------- Cerrar ---------- */
        function closeModal() {
            stopVideo();
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
        }

        /* ---------- Flechas ---------- */
        if (modalPrev) modalPrev.addEventListener("click", function (e) {
            e.stopPropagation();
            renderSlide(currentIndex - 1);
        });
        if (modalNext) modalNext.addEventListener("click", function (e) {
            e.stopPropagation();
            renderSlide(currentIndex + 1);
        });

        /* ---------- Click en card ---------- */
        $$(".pf-item").forEach(function (item) {
            item.addEventListener("click", function () {
                var nodes = item.querySelectorAll(".pf-item-slides > img, .pf-item-slides > video");
                var media = Array.prototype.map.call(nodes, mediaOf);

                openModal({
                    media:  media,
                    img:    media[0] ? media[0].src : "",
                    cat:    item.dataset.cat   || "",
                    year:   item.dataset.year  || "",
                    title:  item.dataset.title || "",
                    desc:   item.dataset.desc  || "",
                    tags:   item.dataset.tags  || "",
                    live:   item.dataset.live  || ""   /* ← NUEVO: URL del sitio en vivo */
                });
            });
        });

        /* ---------- Cerrar con backdrop / botón X ---------- */
        $$("[data-close]", modal).forEach(function (el) {
            el.addEventListener("click", closeModal);
        });

        /* ---------- Teclado ---------- */
        document.addEventListener("keydown", function (e) {
            if (!modal.classList.contains("open")) return;
            if (e.target === modalVideo) return;

            if (e.key === "Escape")     closeModal();
            if (e.key === "ArrowLeft")  renderSlide(currentIndex - 1);
            if (e.key === "ArrowRight") renderSlide(currentIndex + 1);
        });

        /* ---------- Swipe táctil ---------- */
        var touchStartX = 0;
        modal.addEventListener("touchstart", function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modal.addEventListener("touchend", function (e) {
            if (currentMedia.length < 2) return;
            if (e.target === modalVideo) return;
            var dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) < 50) return;
            renderSlide(dx < 0 ? currentIndex + 1 : currentIndex - 1);
        }, { passive: true });

    })();
    /* =========================================================
       15. PORTAFOLIO — BOTÓN RECLUTADOR
    ========================================================= */
    (function initPfRecruiter() {
        var pfBtn = $(".navbar .recruiter-mode");
        if (pfBtn && !$("#recruiter-panel")) {
            pfBtn.addEventListener("click", function () {
                window.location.href = "index.html#recruiter";
            });
        }
    })();

})();   /* ← CIERRE DEL IIFE PRINCIPAL */