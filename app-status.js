(() => {
    const API_BASE_URL = 'https://bridge-bionics-api.juandabondano30.workers.dev';
    const REFRESH_INTERVAL_MS = 2000;
    const MODE_LABELS = {
        abecedario: 'Abecedario',
        'adivina la seña': 'Adivina la seña',
        diccionario: 'Diccionario',
        'aprender mi nombre en señas': 'Aprender mi nombre en señas',
        registro: 'Registro'
    };

    let refreshTimer = null;
    let refreshInProgress = null;
    let historyExpanded = false;
    let lastHistorySnapshot = null;

    function setText(id, text) {
        const element = document.getElementById(id);
        if (element && element.textContent !== text) {
            element.textContent = text;
        }
    }

    function formatDate(value) {
        if (!value) {
            return 'Sin fecha disponible';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'Fecha no válida';
        }

        return new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    function formatMode(value) {
        if (!value) {
            return 'Sin modo disponible';
        }

        const normalized = String(value).trim().toLocaleLowerCase('es-CO');
        return MODE_LABELS[normalized] || String(value);
    }

    function setHistoryExpanded(list, toggle, expanded) {
        historyExpanded = expanded;
        list.querySelectorAll('.app-history-extra').forEach(item => {
            item.setAttribute('aria-hidden', String(!expanded));
            item.classList.toggle('is-expanded', expanded);
            item.style.maxHeight = expanded ? `${item.scrollHeight}px` : '0px';
        });

        toggle.setAttribute('aria-expanded', String(expanded));
        const label = toggle.querySelector('[data-history-toggle-label]');
        if (label) {
            label.textContent = expanded ? 'Mostrar menos' : 'Ver historial completo';
        }
    }

    async function fetchJson(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`La API respondió con el estado ${response.status}.`);
        }

        return response.json();
    }

    function renderState(payload) {
        const record = payload && payload.estado;
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            setText('appStatusName', 'Sin registros');
            setText('appStatusMode', '—');
            setText('appStatusLetter', '—');
            setText('appStatusUpdated', 'Todavía no hay actualizaciones.');
            return false;
        }

        setText('appStatusName', record.nombre ? String(record.nombre) : 'Nombre no disponible');
        setText('appStatusMode', formatMode(record.modo));
        setText('appStatusLetter', record.ultima_letra ? String(record.ultima_letra) : '—');
        setText('appStatusUpdated', formatDate(record.actualizado_en || record.fecha));
        return true;
    }

    function renderHistory(payload) {
        const list = document.getElementById('appHistoryList');
        const toggle = document.getElementById('appHistoryToggle');
        if (!list || !toggle) {
            return;
        }

        const records = payload && payload.historial;
        if (!Array.isArray(records) || records.length === 0) {
            if (lastHistorySnapshot === '[]') {
                setText('appHistoryStatus', 'No hay cambios registrados todavía.');
                return;
            }

            lastHistorySnapshot = '[]';
            list.replaceChildren();
            historyExpanded = false;
            toggle.hidden = true;
            setHistoryExpanded(list, toggle, false);
            setText('appHistoryStatus', 'No hay cambios registrados todavía.');
            return;
        }

        const orderedRecords = [...records].sort((left, right) => {
            const leftTime = new Date(left.actualizado_en || left.fecha || 0).getTime();
            const rightTime = new Date(right.actualizado_en || right.fecha || 0).getTime();
            return rightTime - leftTime;
        });
        const displayRecords = orderedRecords.map(record => {
            const updatedAt = record.actualizado_en || record.fecha;
            return {
                name: record.nombre ? String(record.nombre) : 'Nombre no disponible',
                dateTime: String(updatedAt || ''),
                dateText: formatDate(updatedAt),
                details: `Modo: ${formatMode(record.modo)} · Última letra: ${record.ultima_letra ? String(record.ultima_letra) : '—'}`
            };
        });
        const snapshot = JSON.stringify(displayRecords);

        if (snapshot === lastHistorySnapshot) {
            setText('appHistoryStatus', `${records.length} ${records.length === 1 ? 'registro' : 'registros'}`);
            return;
        }

        if (orderedRecords.length < 2) {
            historyExpanded = false;
        }

        list.classList.add('is-updating');
        list.replaceChildren();
        displayRecords.forEach((record, index) => {
            const item = document.createElement('li');
            item.className = 'glass-card border border-deepLilac/20 p-4 transition-all duration-300 hover:border-deepLilac/50';
            if (index > 0) {
                item.classList.add('app-history-extra');
                item.setAttribute('aria-hidden', String(!historyExpanded));
            }

            const header = document.createElement('div');
            header.className = 'flex flex-wrap items-center justify-between gap-2';

            const name = document.createElement('p');
            name.className = 'font-bold text-paleSky';
            name.textContent = record.name;

            const date = document.createElement('time');
            date.className = 'text-xs text-dustyDenim';
            date.dateTime = record.dateTime;
            date.textContent = record.dateText;

            const details = document.createElement('p');
            details.className = 'mt-2 text-sm text-dustyDenim';
            details.textContent = record.details;

            header.append(name, date);
            item.append(header, details);
            list.appendChild(item);
        });

        toggle.hidden = orderedRecords.length < 2;
        setHistoryExpanded(list, toggle, historyExpanded);
        list.classList.remove('is-updating');
        lastHistorySnapshot = snapshot;
        setText('appHistoryStatus', `${records.length} ${records.length === 1 ? 'registro' : 'registros'}`);
    }

    const historyList = document.getElementById('appHistoryList');
    const historyToggle = document.getElementById('appHistoryToggle');
    if (historyList && historyToggle) {
        historyToggle.addEventListener('click', () => {
            setHistoryExpanded(historyList, historyToggle, !historyExpanded);
        });
    }

async function resetAppStatus() {
        try {
            setText('appStatusConnection', 'Reiniciando estado...');

            const response = await fetch(`${API_BASE_URL}/api/reiniciar`, {
                method: 'POST',
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            await refreshAppStatus();
        } catch (error) {
            setText('appStatusConnection', `No se pudo reiniciar: ${error.message}`);
        }
    }
    async function refreshAppStatus() {
        if (refreshInProgress) {
            return refreshInProgress;
        }

        refreshInProgress = Promise.allSettled([
            fetchJson('/api/estado'),
            fetchJson('/api/historial')
        ]).then(([stateResult, historyResult]) => {
            const errors = [];

            if (stateResult.status === 'fulfilled') {
                const hasState = renderState(stateResult.value);
                if (hasState) {
                    setText('appStatusConnection', 'Conectado · Estado actualizado');
                } else {
                    setText('appStatusConnection', 'Conectado · Sin registros');
                }
            } else {
                errors.push(`Estado: ${stateResult.reason.message || 'no disponible'}`);
                setText('appStatusName', 'No se pudo cargar');
                setText('appStatusMode', '—');
                setText('appStatusLetter', '—');
                setText('appStatusUpdated', 'Verifica la conexión e inténtalo de nuevo.');
            }

            if (historyResult.status === 'fulfilled') {
                renderHistory(historyResult.value);
            } else {
                errors.push(`Historial: ${historyResult.reason.message || 'no disponible'}`);
                setText('appHistoryStatus', `No se pudo cargar el historial. ${historyResult.reason.message || ''}`);
            }

            if (errors.length > 0) {
                setText('appStatusConnection', `Error de conexión. ${errors.join(' ')}`);
            }
        }).finally(() => {
            refreshInProgress = null;
        });

        return refreshInProgress;
    }
window.resetAppStatus = resetAppStatus;
    window.refreshAppStatus = refreshAppStatus;
    window.startAppStatusUpdates = function() {
        window.stopAppStatusUpdates();
        refreshAppStatus();
        refreshTimer = window.setInterval(refreshAppStatus, REFRESH_INTERVAL_MS);
    };
    window.stopAppStatusUpdates = function() {
        if (refreshTimer !== null) {
            window.clearInterval(refreshTimer);
            refreshTimer = null;
        }
    };

    window.startAppStatusUpdates();
})();
