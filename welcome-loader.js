(() => {
    const loader = document.getElementById('bbWelcomeLoader');
    if (!loader) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const displayDuration = reducedMotion ? 900 : 3600;
    const exitDuration = reducedMotion ? 250 : 650;

    window.setTimeout(() => {
        loader.classList.add('is-exiting');
        loader.setAttribute('aria-hidden', 'true');

        window.setTimeout(() => {
            loader.hidden = true;
        }, exitDuration);
    }, displayDuration);
})();
