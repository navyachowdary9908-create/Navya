/* ============================================================
   Appointment Scheduler - Client-Side Application Logic
   ============================================================ */

const state = {
    appointments: [],
    currentFilter: '',
    searchQuery: '',
    editingId: null,
    deleteTargetId: null,
};

const els = {
    appointmentsGrid: document.getElementById('appointmentsGrid'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    fab: document.getElementById('fab'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    appointmentForm: document.getElementById('appointmentForm'),
    appointmentId: document.getElementById('appointmentId'),
    title: document.getElementById('title'),
    start_time: document.getElementById('start_time'),
    end_time: document.getElementById('end_time'),
    description: document.getElementById('description'),
    user_id: document.getElementById('user_id'),
    color: document.getElementById('color'),
    status: document.getElementById('status'),
    modalCancel: document.getElementById('modalCancel'),
    modalClose: document.getElementById('modalClose'),
    modalSubmit: document.getElementById('modalSubmit'),
    deleteOverlay: document.getElementById('deleteOverlay'),
    deleteCancel: document.getElementById('deleteCancel'),
    deleteCancelBtn: document.getElementById('deleteCancelBtn'),
    deleteConfirm: document.getElementById('deleteConfirm'),
    toastContainer: document.getElementById('toastContainer'),
};

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return response.json();
}


// ---------------------------------------------------------------------------
//  Rendering
// ---------------------------------------------------------------------------
function formatDateTime(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeClass(status) {
    return `badge-${status}` || 'badge-other';
}

function renderAppointments() {
    const grid = els.appointmentsGrid;
    const loading = els.loading;
    const emptyState = els.emptyState;

    if (loading) loading.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    if (!state.appointments || state.appointments.length === 0) {
        grid.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.innerHTML = `
            <div class="empty-icon">&#128228;</div>
            <h3>No appointments found</h3>
            <p>${state.searchQuery || state.currentFilter ? 'Try adjusting your filters.' : 'Schedule your first appointment to get started.'}</p>
        `;
        grid.appendChild(div);
        els.fab.classList.remove('hidden');
        return;
    }

    els.fab.classList.add('hidden');

    grid.innerHTML = state.appointments.map(appt => `

// ---------------------------------------------------------------------------
//  Form Submission
// ---------------------------------------------------------------------------
els.appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        title: els.title.value.trim(),
        description: els.description.value.trim(),
        start_time: els.start_time.value,
        end_time: els.end_time.value,
        user_id: els.user_id.value.trim(),
        color: els.color.value,
    };

    if (!data.title || !data.start_time || !data.end_time) {
        showToast('Title, start time, and end time are required.', 'error');
        return;
    }

    if (new Date(data.start_time) >= new Date(data.end_time)) {
        showToast('End time must be after start time.', 'error');
        return;
    }

    if (state.editingId) {
        await updateAppointment(state.editingId, data);
    } else {
        await createAppointment(data);
    }
});

// ---------------------------------------------------------------------------
//  Delete Confirmation
// ---------------------------------------------------------------------------
els.deleteConfirm.addEventListener('click', () => {
    if (state.deleteTargetId) {
        deleteAppointment(state.deleteTargetId);
        closeDeleteModal();
    }
});

// ---------------------------------------------------------------------------
//  Event Listeners
// ---------------------------------------------------------------------------
// Filter inputs
els.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    fetchAppointments();
});

els.statusFilter.addEventListener('change', (e) => {
    state.currentFilter = e.target.value;
    state.searchQuery = '';
    els.searchInput.value = '';
    fetchAppointments();
});

// FAB button
els.fab.addEventListener('click', openNewModal);

// Modal close buttons
els.modalClose.addEventListener('click', closeModal);
els.modalCancel.addEventListener('click', closeModal);

els.deleteCancel.addEventListener('click', closeDeleteModal);
els.deleteCancelBtn.addEventListener('click', closeDeleteModal);

// Close modal on overlay click
els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
});

els.deleteOverlay.addEventListener('click', (e) => {
    if (e.target === els.deleteOverlay) closeDeleteModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        openNewModal();
    }
});

// ---------------------------------------------------------------------------
//  Toast Notifications
// ---------------------------------------------------------------------------
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '&#10003;',
        error: '&#10007;',
        info: '&#9432;',
        warning: '&#9888;',
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---------------------------------------------------------------------------
//  Initialization
// ---------------------------------------------------------------------------
async function init() {
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 3600000);
    els.start_time.value = defaultStart.toISOString().slice(0, 16);
    els.end_time.value = new Date(defaultStart.getTime() + 3600000).toISOString().slice(0, 16);

    await fetchAppointments();
}

init();

        <div class="appointment-card">
            <div class="appointment-card-header">
                <div class="appointment-color-badge" style="background:${appt.color}"></div>
                <div class="appointment-title-row">
                    <h3 class="appointment-card-title">${escapeHtml(appt.title)}</h3>
                    <span class="status-badge ${getStatusBadgeClass(appt.status)}">
                        ${formatStatus(appt.status)}
                    </span>
                </div>
                <div class="appointment-card-time">${formatDateTime(appt.startTime)}</div>
            </div>
            <div class="appointment-card-body">
                <p class="appointment-card-description">${escapeHtml(appt.description)}</p>
                <div style="margin-top:10px; font-size:0.85rem; color:var(--text-light);">
                    <div>&#128197; ${formatDateTime(appt.startTime)} - ${formatDateTime(appt.endTime)}</div>
                    <div>&#128100; User #${appt.userId}</div>
                </div>
            </div>
            <div class="appointment-card-actions">
                <button class="btn btn-action btn-edit" data-id="${appt.id}">Edit</button>
                <button class="btn btn-action btn-delete" data-id="${appt.id}">Delete</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });

    grid.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---------------------------------------------------------------------------
//  Modal Management
// ---------------------------------------------------------------------------
function openNewModal() {
    state.editingId = null;
    els.modalTitle.textContent = 'New Appointment';
    els.appointmentForm.reset();
    els.appointmentId.value = '';
    els.color.value = '#4f46e5';
    els.modalOverlay.classList.add('active');
    els.title.focus();
}

function openEditModal(id) {
    const appt = state.appointments.find(a => a.id === id);
    if (!appt) return;

    state.editingId = id;
    els.modalTitle.textContent = 'Edit Appointment';
    els.appointmentId.value = appt.id;
    els.title.value = appt.title;
    els.start_time.value = appt.startTime.replace(' ', 'T');
    els.end_time.value = appt.endTime.replace(' ', 'T');
    els.description.value = appt.description;
    els.user_id.value = appt.userId;
    els.color.value = appt.color;
    els.status.value = appt.status;
    els.modalOverlay.classList.add('active');
    els.title.focus();
}

function closeModal() {
    els.modalOverlay.classList.remove('active');
    els.appointmentForm.reset();
}

function openDeleteModal(id) {
    state.deleteTargetId = id;
    els.deleteOverlay.classList.add('active');
}

function closeDeleteModal() {
    els.deleteOverlay.classList.remove('active');
    state.deleteTargetId = null;
}

async function fetchAppointments() {
    const params = new URLSearchParams();
    if (state.currentFilter) params.set('status', state.currentFilter);
    if (state.searchQuery) params.set('q', state.searchQuery);

    const queryString = params.toString();
    const url = queryString
        ? `/api/appointments?${queryString}`
        : '/api/appointments';

    try {
        const data = await apiRequest(url);
        state.appointments = data.appointments || [];
        renderAppointments();
    } catch (error) {
        showToast('Failed to fetch appointments', 'error');
        console.error('Fetch error:', error);
    }
}

async function createAppointment(data) {
    try {
        await apiRequest('/api/appointments', {
            method: 'POST',
            body: new URLSearchParams(data).toString(),
        });
        showToast('Appointment created successfully!', 'success');
        state.editingId = null;
        closeModal();
        await fetchAppointments();
    } catch (error) {
        showToast(error.message || 'Failed to create appointment', 'error');
    }
}

async function updateAppointment(id, data) {
    try {
        await apiRequest(`/api/appointments/${id}`, {
            method: 'PUT',
            body: new URLSearchParams(data).toString(),
        });
        showToast('Appointment updated successfully!', 'success');
        state.editingId = null;
        closeModal();
        await fetchAppointments();
    } catch (error) {
        showToast(error.message || 'Failed to update appointment', 'error');
    }
}

async function deleteAppointment(id) {
    try {
        await apiRequest(`/api/appointments/${id}`, {
            method: 'DELETE',
        });
        showToast('Appointment deleted', 'success');
        if (state.deleteTargetId === id) {
            state.deleteTargetId = null;
        }
        await fetchAppointments();
    } catch (error) {
        showToast(error.message || 'Failed to delete appointment', 'error');
    }
}
