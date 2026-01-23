/**
 * Young Capital Advisory - Client Portal JavaScript
 * Handles authentication, dashboard functionality, and user interactions
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration & State
    // ==========================================================================

    const STORAGE_KEY = 'yca_portal_user';
    const STORAGE_DATA_KEY = 'yca_portal_data';

    let currentUser = null;
    let portalData = {
        requests: [],
        meetings: [],
        files: [],
        activity: []
    };

    // ==========================================================================
    // DOM Elements
    // ==========================================================================

    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');

    // Auth forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');
    const authFooterLogin = document.getElementById('auth-footer-login');
    const authFooterSignup = document.getElementById('auth-footer-signup');

    // Auth switches
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginBtn = document.getElementById('back-to-login');

    // Dashboard elements
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const logoutBtn = document.getElementById('logout-btn');

    // Quick action buttons
    const actionCards = document.querySelectorAll('.action-card[data-action]');

    // Forms
    const serviceRequestForm = document.getElementById('service-request-form');
    const meetingForm = document.getElementById('meeting-form');
    const uploadForm = document.getElementById('upload-form');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    // Upload elements
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const uploadQueue = document.getElementById('upload-queue');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');

    // Password toggles
    const passwordToggles = document.querySelectorAll('.password-toggle');

    // Toast container
    const toastContainer = document.getElementById('toast-container');

    // ==========================================================================
    // Utility Functions
    // ==========================================================================

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">
                ${type === 'success'
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
                }
            </span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format date
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Format file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get initials from name
     */
    function getInitials(firstName, lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    // ==========================================================================
    // Storage Functions
    // ==========================================================================

    /**
     * Save user to storage
     */
    function saveUser(user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    /**
     * Load user from storage
     */
    function loadUser() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Clear user from storage
     */
    function clearUser() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Save portal data
     */
    function savePortalData() {
        localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(portalData));
    }

    /**
     * Load portal data
     */
    function loadPortalData() {
        const stored = localStorage.getItem(STORAGE_DATA_KEY);
        if (stored) {
            portalData = JSON.parse(stored);
        }
    }

    // ==========================================================================
    // Auth Functions
    // ==========================================================================

    /**
     * Show login form
     */
    function showLoginForm() {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        authFooterLogin.classList.remove('hidden');
        authFooterSignup.classList.add('hidden');
    }

    /**
     * Show signup form
     */
    function showSignupForm() {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        forgotForm.classList.add('hidden');
        authFooterLogin.classList.add('hidden');
        authFooterSignup.classList.remove('hidden');
    }

    /**
     * Show forgot password form
     */
    function showForgotForm() {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        forgotForm.classList.remove('hidden');
        authFooterLogin.classList.add('hidden');
        authFooterSignup.classList.add('hidden');
    }

    /**
     * Handle login
     */
    function handleLogin(e) {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        // Simple validation (in production, this would be server-side)
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        // Demo login - in production, authenticate against backend
        // Check if user exists in storage (from signup)
        const existingUsers = JSON.parse(localStorage.getItem('yca_users') || '[]');
        const user = existingUsers.find(u => u.email === email);

        if (user && user.password === password) {
            currentUser = user;
            saveUser(currentUser);
            loadPortalData();
            showDashboard();
            showToast('Welcome back, ' + currentUser.firstname + '!');
        } else if (!user) {
            // For demo purposes, create user on first login
            showToast('No account found. Please create an account first.', 'error');
        } else {
            showToast('Invalid email or password', 'error');
        }
    }

    /**
     * Handle signup
     */
    function handleSignup(e) {
        e.preventDefault();

        const formData = new FormData(signupForm);
        const userData = {
            id: generateId(),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            company: formData.get('company'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: '',
            createdAt: new Date().toISOString()
        };

        // Validation
        if (!userData.firstname || !userData.lastname || !userData.email || !userData.password) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (userData.password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        // Store user (in production, this would go to a backend)
        const existingUsers = JSON.parse(localStorage.getItem('yca_users') || '[]');

        if (existingUsers.find(u => u.email === userData.email)) {
            showToast('An account with this email already exists', 'error');
            return;
        }

        existingUsers.push(userData);
        localStorage.setItem('yca_users', JSON.stringify(existingUsers));

        // Log them in
        currentUser = userData;
        saveUser(currentUser);

        // Initialize their data
        portalData = {
            requests: [],
            meetings: [],
            files: [],
            activity: [{
                id: generateId(),
                type: 'account',
                message: 'Account created',
                timestamp: new Date().toISOString()
            }]
        };
        savePortalData();

        showDashboard();
        showToast('Account created successfully! Welcome to Young Capital Advisory.');
    }

    /**
     * Handle forgot password
     */
    function handleForgotPassword(e) {
        e.preventDefault();

        const formData = new FormData(forgotForm);
        const email = formData.get('email');

        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        // In production, this would send an email
        showToast('If an account exists with this email, you will receive a reset link shortly.');
        forgotForm.reset();
        showLoginForm();
    }

    /**
     * Handle logout
     */
    function handleLogout() {
        currentUser = null;
        clearUser();
        showAuthSection();
        showToast('You have been signed out');
    }

    // ==========================================================================
    // Dashboard Functions
    // ==========================================================================

    /**
     * Show auth section
     */
    function showAuthSection() {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        showLoginForm();
    }

    /**
     * Show dashboard
     */
    function showDashboard() {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        updateDashboard();
        switchTab('overview');
    }

    /**
     * Update dashboard with user data
     */
    function updateDashboard() {
        if (!currentUser) return;

        // Update user info
        document.getElementById('user-avatar').textContent = getInitials(currentUser.firstname, currentUser.lastname);
        document.getElementById('user-name').textContent = `${currentUser.firstname} ${currentUser.lastname}`;
        document.getElementById('user-company').textContent = currentUser.company || 'No company';
        document.getElementById('welcome-name').textContent = currentUser.firstname;

        // Update stats
        document.getElementById('stat-requests').textContent = portalData.requests.length;
        document.getElementById('stat-meetings').textContent = portalData.meetings.length;
        document.getElementById('stat-uploads').textContent = portalData.files.length;

        // Update settings form
        document.getElementById('settings-firstname').value = currentUser.firstname;
        document.getElementById('settings-lastname').value = currentUser.lastname;
        document.getElementById('settings-company').value = currentUser.company || '';
        document.getElementById('settings-email').value = currentUser.email;
        document.getElementById('settings-phone').value = currentUser.phone || '';

        // Update lists
        renderRequestsList();
        renderMeetingsList();
        renderFilesList();
        renderActivityList();
    }

    /**
     * Switch dashboard tab
     */
    function switchTab(tabName) {
        // Update sidebar
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabName);
        });

        // Update tabs
        dashboardTabs.forEach(tab => {
            tab.classList.toggle('active', tab.id === `tab-${tabName}`);
        });
    }

    // ==========================================================================
    // Service Requests
    // ==========================================================================

    /**
     * Handle service request submission
     */
    function handleServiceRequest(e) {
        e.preventDefault();

        const formData = new FormData(serviceRequestForm);
        const request = {
            id: generateId(),
            type: formData.get('type'),
            propertyType: formData.get('propertyType'),
            title: formData.get('title'),
            description: formData.get('description'),
            budget: formData.get('budget'),
            timeline: formData.get('timeline'),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        portalData.requests.push(request);
        portalData.activity.unshift({
            id: generateId(),
            type: 'request',
            message: `New service request: ${request.title}`,
            timestamp: new Date().toISOString()
        });
        savePortalData();

        serviceRequestForm.reset();
        updateDashboard();
        showToast('Service request submitted successfully!');
    }

    /**
     * Render requests list
     */
    function renderRequestsList() {
        const container = document.getElementById('requests-list');

        if (portalData.requests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <p>No requests yet</p>
                    <span>Submit your first request using the form</span>
                </div>
            `;
            return;
        }

        container.innerHTML = portalData.requests.map(req => `
            <div class="request-card">
                <div class="request-card-header">
                    <span class="request-card-title">${req.title}</span>
                    <span class="request-status ${req.status}">${req.status.replace('-', ' ')}</span>
                </div>
                <div class="request-card-meta">${req.type} • ${formatDate(req.createdAt)}</div>
            </div>
        `).join('');
    }

    // ==========================================================================
    // Meetings
    // ==========================================================================

    /**
     * Handle meeting request submission
     */
    function handleMeetingRequest(e) {
        e.preventDefault();

        const formData = new FormData(meetingForm);
        const meeting = {
            id: generateId(),
            type: formData.get('type'),
            date: formData.get('date'),
            time: formData.get('time'),
            topic: formData.get('topic'),
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        // Validate date is in the future
        const meetingDate = new Date(meeting.date);
        if (meetingDate < new Date()) {
            showToast('Please select a future date', 'error');
            return;
        }

        portalData.meetings.push(meeting);
        portalData.activity.unshift({
            id: generateId(),
            type: 'meeting',
            message: `Meeting scheduled for ${formatDate(meeting.date)}`,
            timestamp: new Date().toISOString()
        });
        savePortalData();

        meetingForm.reset();
        updateDashboard();
        showToast('Meeting request submitted! We\'ll confirm shortly.');
    }

    /**
     * Render meetings list
     */
    function renderMeetingsList() {
        const container = document.getElementById('meetings-list');

        // Filter future meetings
        const upcomingMeetings = portalData.meetings.filter(m => new Date(m.date) >= new Date());

        if (upcomingMeetings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p>No meetings scheduled</p>
                    <span>Book your first meeting using the form</span>
                </div>
            `;
            return;
        }

        container.innerHTML = upcomingMeetings.map(meeting => `
            <div class="meeting-card">
                <div class="meeting-card-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${formatDate(meeting.date)} at ${meeting.time}
                </div>
                <div class="meeting-card-type">${getMeetingTypeName(meeting.type)}</div>
                <div class="meeting-card-topic">${meeting.topic}</div>
            </div>
        `).join('');
    }

    /**
     * Get meeting type display name
     */
    function getMeetingTypeName(type) {
        const types = {
            'intro': 'Introductory Call (15 min)',
            'project': 'Project Discussion (30 min)',
            'review': 'Model Review Session (45 min)',
            'strategy': 'Strategy Consultation (60 min)'
        };
        return types[type] || type;
    }

    // ==========================================================================
    // File Upload
    // ==========================================================================

    let pendingFiles = [];

    /**
     * Handle file selection
     */
    function handleFileSelect(files) {
        const validExtensions = ['.xlsx', '.xlsm', '.xls', '.pdf'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        Array.from(files).forEach(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();

            if (!validExtensions.includes(ext)) {
                showToast(`Invalid file type: ${file.name}`, 'error');
                return;
            }

            if (file.size > maxSize) {
                showToast(`File too large: ${file.name}`, 'error');
                return;
            }

            // Check for duplicates
            if (pendingFiles.find(f => f.name === file.name)) {
                showToast(`File already added: ${file.name}`, 'error');
                return;
            }

            pendingFiles.push(file);
        });

        renderUploadQueue();
    }

    /**
     * Render upload queue
     */
    function renderUploadQueue() {
        if (pendingFiles.length === 0) {
            uploadQueue.innerHTML = '';
            uploadSubmitBtn.classList.add('hidden');
            return;
        }

        uploadSubmitBtn.classList.remove('hidden');
        uploadQueue.innerHTML = pendingFiles.map((file, index) => `
            <div class="file-item" data-index="${index}">
                <div class="file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                </div>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="file-remove" data-index="${index}" aria-label="Remove file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add remove handlers
        uploadQueue.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                pendingFiles.splice(index, 1);
                renderUploadQueue();
            });
        });
    }

    /**
     * Handle file upload submission
     */
    function handleUploadSubmit() {
        if (pendingFiles.length === 0) {
            showToast('Please select files to upload', 'error');
            return;
        }

        const formData = new FormData(uploadForm);
        const notes = formData.get('notes');

        // In production, upload to server/cloud storage
        // For demo, just save metadata
        pendingFiles.forEach(file => {
            portalData.files.push({
                id: generateId(),
                name: file.name,
                size: file.size,
                type: 'uploaded',
                notes: notes,
                uploadedAt: new Date().toISOString()
            });
        });

        portalData.activity.unshift({
            id: generateId(),
            type: 'upload',
            message: `Uploaded ${pendingFiles.length} file(s)`,
            timestamp: new Date().toISOString()
        });

        savePortalData();

        pendingFiles = [];
        uploadForm.reset();
        renderUploadQueue();
        updateDashboard();

        showToast('Files uploaded successfully!');
    }

    /**
     * Render files list
     */
    function renderFilesList() {
        const container = document.getElementById('files-list');

        if (portalData.files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    <p>No files yet</p>
                    <span>Upload your first file to get started</span>
                </div>
            `;
            return;
        }

        container.innerHTML = portalData.files.map(file => `
            <div class="file-item">
                <div class="file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                </div>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)} • ${file.type} • ${formatDate(file.uploadedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    // ==========================================================================
    // Activity
    // ==========================================================================

    /**
     * Render activity list
     */
    function renderActivityList() {
        const container = document.getElementById('activity-list');

        if (portalData.activity.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>No recent activity</p>
                    <span>Your recent actions will appear here</span>
                </div>
            `;
            return;
        }

        // Show last 5 activities
        const recentActivity = portalData.activity.slice(0, 5);

        container.innerHTML = recentActivity.map(activity => `
            <div class="request-card">
                <div class="request-card-title">${activity.message}</div>
                <div class="request-card-meta">${formatDate(activity.timestamp)}</div>
            </div>
        `).join('');
    }

    // ==========================================================================
    // Settings
    // ==========================================================================

    /**
     * Handle profile update
     */
    function handleProfileUpdate(e) {
        e.preventDefault();

        const formData = new FormData(profileForm);

        currentUser.firstname = formData.get('firstname');
        currentUser.lastname = formData.get('lastname');
        currentUser.company = formData.get('company');
        currentUser.phone = formData.get('phone');

        // Update in users list
        const users = JSON.parse(localStorage.getItem('yca_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('yca_users', JSON.stringify(users));
        }

        saveUser(currentUser);
        updateDashboard();
        showToast('Profile updated successfully!');
    }

    /**
     * Handle password update
     */
    function handlePasswordUpdate(e) {
        e.preventDefault();

        const formData = new FormData(passwordForm);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (currentPassword !== currentUser.password) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('New password must be at least 8 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        currentUser.password = newPassword;

        // Update in users list
        const users = JSON.parse(localStorage.getItem('yca_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('yca_users', JSON.stringify(users));
        }

        saveUser(currentUser);
        passwordForm.reset();
        showToast('Password updated successfully!');
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    // Auth form switches
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSignupForm();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotForm();
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', showLoginForm);
    }

    // Auth form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    // Quick actions
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            switch (action) {
                case 'new-request':
                    switchTab('requests');
                    break;
                case 'schedule-meeting':
                    switchTab('meetings');
                    break;
                case 'upload-model':
                    switchTab('uploads');
                    break;
            }
        });
    });

    // Form submissions
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', handleServiceRequest);
    }

    if (meetingForm) {
        meetingForm.addEventListener('submit', handleMeetingRequest);
    }

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }

    // File upload
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFileSelect(e.dataTransfer.files);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files);
            fileInput.value = '';
        });
    }

    if (uploadSubmitBtn) {
        uploadSubmitBtn.addEventListener('click', handleUploadSubmit);
    }

    // Password toggles
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    // File filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Filter would be applied here in a full implementation
        });
    });

    // Set minimum date for meeting scheduler
    const meetingDateInput = document.getElementById('meeting-date');
    if (meetingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        meetingDateInput.setAttribute('min', today);
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================

    function init() {
        // Check if user is logged in
        currentUser = loadUser();

        if (currentUser) {
            loadPortalData();
            showDashboard();
        } else {
            showAuthSection();
        }
    }

    // Initialize on page load
    init();

})();
