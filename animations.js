(() => {
    const initializePurposeExperience = () => {
        const section = document.getElementById('proposito-integral');
        if (!section) return;

        const layers = [...section.querySelectorAll('.texto-fluido')];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (window.gsap && window.ScrollTrigger && layers.length === 4) {
            const { gsap, ScrollTrigger } = window;
            gsap.registerPlugin(ScrollTrigger);

            if (reducedMotion) {
                gsap.set(layers, { clearProps: 'all', opacity: 1, x: 0, y: 0 });
            } else {
                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 65%',
                        toggleActions: 'play none none reverse'
                    }
                });

                timeline
                    .fromTo(layers[0], { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, 0)
                    .fromTo(layers[1], { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, 0.12)
                    .fromTo(layers[2], { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, 0.24)
                    .fromTo(layers[3], { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, 0.36);
            }
        }

        const swiperElement = section.querySelector('.proposito-swiper');
        if (window.Swiper && swiperElement && !swiperElement.swiper) {
            const wrapper = swiperElement.querySelector('.swiper-wrapper');
            [...wrapper.children].forEach((slide) => {
                const duplicate = slide.cloneNode(true);
                duplicate.setAttribute('aria-hidden', 'true');
                duplicate.dataset.loopClone = 'true';
                wrapper.appendChild(duplicate);
            });

            new window.Swiper(swiperElement, {
                loop: true,
                slidesPerView: 'auto',
                centeredSlides: true,
                spaceBetween: 30,
                grabCursor: true,
                autoplay: false,
                slideToClickedSlide: true,
                watchSlidesProgress: true,
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePurposeExperience, { once: true });
    } else {
        initializePurposeExperience();
    }
})();