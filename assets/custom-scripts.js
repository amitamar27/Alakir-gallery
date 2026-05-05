/* ==========================================================================
   ALAKIR GALLERY — site-wide interactions
   - Custom cursor with hover morphing into a "view" pill
   - Sticky navbar that frosts on scroll
   - Mobile drawer
   - IntersectionObserver-based reveal animations
   - Newsletter form micro-interaction
   ========================================================================== */

(function () {
    "use strict";

    /* ---------------- Custom cursor ------------------------------------ */
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let cursor = null;

    if (supportsHover) {
        cursor = document.createElement("div");
        cursor.className = "ak-cursor";
        cursor.setAttribute("data-label", "");
        document.body.appendChild(cursor);
        document.body.classList.add("ak-cursor-active");

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let curX = targetX;
        let curY = targetY;

        document.addEventListener("mousemove", (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
        document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));

        function tick() {
            curX += (targetX - curX) * 0.18;
            curY += (targetY - curY) * 0.18;
            cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(tick);
        }
        tick();

        // Hover morph — anything with [data-cursor] or specific selectors
        const hoverSelector = ".ak-piece, .ak-event, .ak-artist, [data-cursor]";
        document.addEventListener("mouseover", (e) => {
            const t = e.target.closest(hoverSelector);
            if (t) {
                cursor.classList.add("is-hover");
                cursor.setAttribute("data-label", t.getAttribute("data-cursor") || "View");
            }
        });
        document.addEventListener("mouseout", (e) => {
            if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverSelector)) {
                cursor.classList.remove("is-hover");
            }
        });
    }

    /* ---------------- Navbar scroll state ------------------------------ */
    const nav = document.querySelector(".ak-nav");
    if (nav) {
        const updateNav = () => {
            const y = window.scrollY;
            // Frosted navbar after a tiny scroll
            nav.classList.toggle("is-scrolled", y > 60);
            // Fade the original splash logo once we're well into the gallery zone,
            // so it stops competing with the navbar brand. Threshold = 55% of viewport.
            const fadeThreshold = window.innerHeight * 0.55;
            document.body.classList.toggle("ak-logo-fade", y > fadeThreshold);
        };
        updateNav();
        window.addEventListener("scroll", updateNav, { passive: true });
        window.addEventListener("resize", updateNav, { passive: true });
    }

    /* ---------------- Mobile drawer ------------------------------------ */
    const burger = document.querySelector(".ak-nav__burger");
    const drawer = document.querySelector(".ak-drawer");
    if (burger && drawer) {
        burger.addEventListener("click", () => {
            drawer.classList.toggle("is-open");
            document.body.style.overflow = drawer.classList.contains("is-open") ? "hidden" : "";
        });
        drawer.querySelectorAll("a").forEach((a) => {
            a.addEventListener("click", () => {
                drawer.classList.remove("is-open");
                document.body.style.overflow = "";
            });
        });
    }

    /* ---------------- Reveal on scroll --------------------------------- */
    const revealEls = document.querySelectorAll(".ak-reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-in");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-in"));
    }

    /* ---------------- Smooth anchor scrolling -------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const id = a.getAttribute("href");
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /* ---------------- Newsletter feedback ------------------------------ */
    const form = document.querySelector(".ak-newsletter__form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = form.querySelector(".ak-newsletter__input");
            const btn = form.querySelector(".ak-newsletter__submit");
            if (!input.value.trim()) {
                input.focus();
                return;
            }
            btn.textContent = "✓ נרשמת";
            input.value = "";
            input.disabled = true;
            setTimeout(() => {
                btn.textContent = "הרשמה";
                input.disabled = false;
            }, 2400);
        });
    }

    /* ---------------- Events horizontal drag-scroll on desktop --------- */
    const eventsWrap = document.querySelector(".ak-events-track-wrap");
    if (eventsWrap && supportsHover) {
        let isDown = false, startX = 0, scrollStart = 0;
        eventsWrap.addEventListener("mousedown", (e) => {
            // Don't hijack clicks on actual links/buttons inside cards
            if (e.target.closest("a, button")) return;
            isDown = true;
            startX = e.pageX - eventsWrap.offsetLeft;
            scrollStart = eventsWrap.scrollLeft;
            eventsWrap.style.scrollBehavior = "auto";
        });
        ["mouseleave", "mouseup"].forEach((ev) =>
            eventsWrap.addEventListener(ev, () => { isDown = false; })
        );
        eventsWrap.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - eventsWrap.offsetLeft;
            eventsWrap.scrollLeft = scrollStart - (x - startX) * 1.4;
        });
    }
})();
