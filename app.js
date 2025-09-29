// Application Data
let appData = {
  residents: [
    {
      id: "R001",
      name: "Priya Sharma",
      flat: "A-201",
      mobile: "9876543210",
      email: "priya@email.com"
    },
    {
      id: "R002", 
      name: "Rajesh Kumar",
      flat: "B-105",
      mobile: "9876543211",
      email: "rajesh@email.com"
    },
    {
      id: "R003",
      name: "Anita Singh",
      flat: "C-301",
      mobile: "9876543212", 
      email: "anita@email.com"
    }
  ],
  guards: [
    {
      id: "G001",
      name: "Ramesh Gupta",
      shift: "Day",
      mobile: "9876543220"
    },
    {
      id: "G002",
      name: "Suresh Yadav", 
      shift: "Night",
      mobile: "9876543221"
    }
  ],
  admin: [
    {
      id: "A001",
      name: "Society Admin",
      mobile: "9876543230",
      email: "admin@society.com"
    }
  ],
  visitorRequests: [
    {
      id: "VR001",
      visitorName: "Amit Patel",
      visitorMobile: "9876543240",
      purpose: "Delivery - Amazon",
      requestedBy: "G001",
      requestedFor: "R001",
      status: "pending",
      timestamp: "2025-09-10T16:30:00",
      otp: null
    },
    {
      id: "VR002", 
      visitorName: "Dr. Mehta",
      visitorMobile: "9876543241",
      purpose: "Personal Visit",
      requestedBy: "G001",
      requestedFor: "R002",
      status: "approved",
      timestamp: "2025-09-10T15:45:00",
      otp: "4756"
    }
  ],
  entryLogs: [
    {
      id: "EL001",
      visitorName: "Rohit Singh",
      flat: "A-201",
      purpose: "Guest Visit",
      entryTime: "2025-09-10T14:20:00",
      exitTime: "2025-09-10T16:10:00",
      guardId: "G001"
    },
    {
      id: "EL002",
      visitorName: "Swiggy Delivery",
      flat: "B-105", 
      purpose: "Food Delivery",
      entryTime: "2025-09-10T13:30:00",
      exitTime: "2025-09-10T13:35:00",
      guardId: "G001"
    }
  ],
  emergencyAlerts: [
    {
      id: "EA001",
      residentId: "R001",
      flat: "A-201",
      timestamp: "2025-09-09T22:15:00",
      status: "resolved",
      respondedBy: "G002"
    }
  ],
  preScheduledGuests: [
    {
      id: "PSG001",
      guestName: "Meera Jain",
      residentId: "R003",
      scheduledTime: "2025-09-10T18:00:00",
      qrCode: "QR123456",
      status: "scheduled"
    }
  ]
};

// Current user state
let currentUser = null;
let currentRole = null;
let currentView = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    showPage('loginPage');
}

function setupEventListeners() {
    // Role selection
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const role = this.dataset.role;
            selectRole(role, this);
        });
    });

    // Login form
    document.getElementById('authForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Modal close buttons
    document.getElementById('closeEmergencyModal').addEventListener('click', () => {
        hideModal('emergencyModal');
    });

    document.getElementById('closeOtpModal').addEventListener('click', () => {
        hideModal('otpModal');
    });

    // Confirmation modal
    document.getElementById('confirmYes').addEventListener('click', handleConfirmAction);
    document.getElementById('confirmNo').addEventListener('click', () => {
        hideModal('confirmModal');
    });
}

function selectRole(role, buttonElement) {
    // Reset previous selections
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    
    // Select current role
    buttonElement.classList.add('active');
    
    // Show login form
    const loginForm = document.getElementById('loginForm');
    loginForm.classList.remove('hidden');
    
    // Update title
    document.getElementById('roleTitle').textContent = `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    
    // Populate user select based on role
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">Select User</option>';
    
    let users = [];
    switch(role) {
        case 'resident':
            users = appData.residents;
            break;
        case 'guard':
            users = appData.guards;
            break;
        case 'admin':
            users = appData.admin;
            break;
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name}${user.flat ? ` - ${user.flat}` : ''}`;
        userSelect.appendChild(option);
    });
    
    currentRole = role;
}

function handleLogin(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userSelect').value;
    if (!userId) {
        showToast('Please select a user', 'error');
        return;
    }
    
    // Find user in appropriate data array
    let userData = null;
    switch(currentRole) {
        case 'resident':
            userData = appData.residents.find(u => u.id === userId);
            break;
        case 'guard':
            userData = appData.guards.find(u => u.id === userId);
            break;
        case 'admin':
            userData = appData.admin.find(u => u.id === userId);
            break;
    }
    
    if (userData) {
        currentUser = userData;
        showMainApp();
        showToast(`Welcome, ${userData.name}!`, 'success');
    }
}

function showMainApp() {
    showPage('mainApp');
    updateHeader();
    setupNavigation();
    showDashboard();
}

function updateHeader() {
    document.getElementById('currentUser').textContent = currentUser.name;
    document.getElementById('currentRole').textContent = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
    document.getElementById('currentRole').className = `role-badge ${currentRole}`;
}

function setupNavigation() {
    const navLinks = document.getElementById('navLinks');
    navLinks.innerHTML = '';
    
    let navigation = [];
    
    switch(currentRole) {
        case 'resident':
            navigation = [
                {id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home'},
                {id: 'requests', label: 'Visitor Requests', icon: 'fas fa-user-friends'},
                {id: 'schedule', label: 'Schedule Guest', icon: 'fas fa-calendar-plus'},
                {id: 'logs', label: 'Entry Logs', icon: 'fas fa-list'}
            ];
            break;
        case 'guard':
            navigation = [
                {id: 'dashboard', label: 'Dashboard', icon: 'fas fa-shield-alt'},
                {id: 'visitor-entry', label: 'New Visitor', icon: 'fas fa-user-plus'},
                {id: 'verify-otp', label: 'Verify OTP', icon: 'fas fa-key'},
                {id: 'logs', label: 'Entry Logs', icon: 'fas fa-list'}
            ];
            break;
        case 'admin':
            navigation = [
                {id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-bar'},
                {id: 'residents', label: 'Residents', icon: 'fas fa-users'},
                {id: 'guards', label: 'Guards', icon: 'fas fa-user-shield'},
                {id: 'emergency', label: 'Emergency Logs', icon: 'fas fa-exclamation-triangle'},
                {id: 'logs', label: 'All Logs', icon: 'fas fa-list'}
            ];
            break;
    }
    
    navigation.forEach(nav => {
        const button = document.createElement('button');
        button.className = `nav-link ${nav.id === 'dashboard' ? 'active' : ''}`;
        button.innerHTML = `<i class="${nav.icon}"></i> ${nav.label}`;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(nav.id, button);
        });
        navLinks.appendChild(button);
    });
}

function navigateTo(view, buttonElement) {
    // Update active navigation
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    currentView = view;
    
    // Show appropriate content
    switch(view) {
        case 'dashboard':
            showDashboard();
            break;
        case 'requests':
            showVisitorRequests();
            break;
        case 'schedule':
            showScheduleGuest();
            break;
        case 'visitor-entry':
            showVisitorEntry();
            break;
        case 'verify-otp':
            showOTPVerification();
            break;
        case 'residents':
            showResidentsManagement();
            break;
        case 'guards':
            showGuardsManagement();
            break;
        case 'emergency':
            showEmergencyLogs();
            break;
        case 'logs':
            showLogs();
            break;
    }
}

function showDashboard() {
    const content = document.getElementById('dashboardContent');
    
    if (currentRole === 'resident') {
        content.innerHTML = generateResidentDashboard();
        setupResidentDashboardEvents();
    } else if (currentRole === 'guard') {
        content.innerHTML = generateGuardDashboard();
        setupGuardDashboardEvents();
    } else if (currentRole === 'admin') {
        content.innerHTML = generateAdminDashboard();
        setupAdminDashboardEvents();
    }
}

function generateResidentDashboard() {
    const pendingRequests = appData.visitorRequests.filter(req => 
        req.requestedFor === currentUser.id && req.status === 'pending'
    );
    
    const recentLogs = appData.entryLogs.filter(log => 
        log.flat === currentUser.flat
    ).slice(0, 3);

    return `
        <div class="dashboard-grid">
            <div class="dashboard-section">
                <div class="section-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Emergency</h3>
                </div>
                <div class="section-content">
                    <p class="mb-16">Press in case of emergency. Security will be notified immediately.</p>
                    <button class="emergency-btn" onclick="triggerEmergency()">
                        <i class="fas fa-exclamation-triangle"></i>
                        EMERGENCY
                    </button>
                </div>
            </div>
            
            <div class="dashboard-section">
                <div class="section-header">
                    <h3><i class="fas fa-bell"></i> Pending Requests (${pendingRequests.length})</h3>
                </div>
                <div class="section-content">
                    ${pendingRequests.length > 0 ? pendingRequests.map(req => `
                        <div class="request-card">
                            <div class="request-header">
                                <div class="request-info">
                                    <h4>${req.visitorName}</h4>
                                    <p>${req.purpose}</p>
                                    <p><i class="fas fa-phone"></i> ${req.visitorMobile}</p>
                                    <p><i class="fas fa-clock"></i> ${formatDateTime(req.timestamp)}</p>
                                </div>
                                <span class="request-status ${req.status}">${req.status}</span>
                            </div>
                            <div class="request-actions">
                                <button class="btn btn--primary btn--sm" onclick="approveRequest('${req.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn--outline btn--sm" onclick="rejectRequest('${req.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No pending requests</p></div>'}
                </div>
            </div>
            
            <div class="dashboard-section">
                <div class="section-header">
                    <h3><i class="fas fa-list"></i> Recent Entry Logs</h3>
                </div>
                <div class="section-content">
                    ${recentLogs.length > 0 ? recentLogs.map(log => `
                        <div class="request-card">
                            <div class="request-info">
                                <h4>${log.visitorName}</h4>
                                <p>${log.purpose}</p>
                                <p><i class="fas fa-sign-in-alt"></i> ${formatDateTime(log.entryTime)}</p>
                                ${log.exitTime ? `<p><i class="fas fa-sign-out-alt"></i> ${formatDateTime(log.exitTime)}</p>` : '<p class="text-warning">Still inside</p>'}
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent entries</p></div>'}
                </div>
            </div>
        </div>
    `;
}

function generateGuardDashboard() {
    const pendingRequests = appData.visitorRequests.filter(req => req.status === 'pending');
    const todayLogs = appData.entryLogs.filter(log => 
        new Date(log.entryTime).toDateString() === new Date().toDateString()
    );
    const emergencyAlerts = appData.emergencyAlerts.filter(alert => alert.status === 'active');

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon visitors">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h4>${todayLogs.length}</h4>
                    <p>Today's Visitors</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <h4>${pendingRequests.length}</h4>
                    <p>Pending Requests</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon emergency">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                    <h4>${emergencyAlerts.length}</h4>
                    <p>Active Emergencies</p>
                </div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-section">
                <div class="section-header">
                    <h3><i class="fas fa-bell"></i> Pending Approvals</h3>
                </div>
                <div class="section-content">
                    ${pendingRequests.length > 0 ? pendingRequests.map(req => {
                        const resident = appData.residents.find(r => r.id === req.requestedFor);
                        return `
                            <div class="request-card">
                                <div class="request-header">
                                    <div class="request-info">
                                        <h4>${req.visitorName}</h4>
                                        <p>${req.purpose}</p>
                                        <p><i class="fas fa-home"></i> ${resident ? `${resident.name} - ${resident.flat}` : 'Unknown'}</p>
                                        <p><i class="fas fa-clock"></i> ${formatDateTime(req.timestamp)}</p>
                                    </div>
                                    <span class="request-status ${req.status}">${req.status}</span>
                                </div>
                            </div>
                        `;
                    }).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No pending requests</p></div>'}
                </div>
            </div>
            
            ${emergencyAlerts.length > 0 ? `
            <div class="dashboard-section">
                <div class="section-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Emergency Alerts</h3>
                </div>
                <div class="section-content">
                    ${emergencyAlerts.map(alert => {
                        const resident = appData.residents.find(r => r.id === alert.residentId);
                        return `
                            <div class="request-card" style="border-left: 4px solid var(--color-error);">
                                <div class="request-info">
                                    <h4>Emergency Alert</h4>
                                    <p><i class="fas fa-home"></i> ${resident ? `${resident.name} - ${alert.flat}` : alert.flat}</p>
                                    <p><i class="fas fa-clock"></i> ${formatDateTime(alert.timestamp)}</p>
                                </div>
                                <button class="btn btn--primary btn--sm" onclick="respondToEmergency('${alert.id}')">
                                    Respond
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function generateAdminDashboard() {
    const totalResidents = appData.residents.length;
    const totalGuards = appData.guards.length;
    const todayVisitors = appData.entryLogs.filter(log => 
        new Date(log.entryTime).toDateString() === new Date().toDateString()
    ).length;
    const emergencyAlerts = appData.emergencyAlerts.length;

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon total">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h4>${totalResidents}</h4>
                    <p>Total Residents</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon visitors">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="stat-content">
                    <h4>${totalGuards}</h4>
                    <p>Security Guards</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon pending">
                    <i class="fas fa-sign-in-alt"></i>
                </div>
                <div class="stat-content">
                    <h4>${todayVisitors}</h4>
                    <p>Today's Visitors</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon emergency">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                    <h4>${emergencyAlerts}</h4>
                    <p>Emergency Alerts</p>
                </div>
            </div>
        </div>
        
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-chart-bar"></i> System Overview</h3>
            </div>
            <div class="section-content">
                <p>Welcome to the Society Gate Management System Admin Dashboard. Use the navigation above to manage residents, guards, and view system logs.</p>
                
                <div class="mt-16">
                    <h4>Quick Actions</h4>
                    <div class="request-actions">
                        <button class="btn btn--primary" onclick="navigateTo('residents')">
                            <i class="fas fa-users"></i> Manage Residents
                        </button>
                        <button class="btn btn--primary" onclick="navigateTo('guards')">
                            <i class="fas fa-user-shield"></i> Manage Guards
                        </button>
                        <button class="btn btn--outline" onclick="navigateTo('emergency')">
                            <i class="fas fa-exclamation-triangle"></i> Emergency Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupResidentDashboardEvents() {
    // Events are handled by onclick attributes in the HTML
}

function setupGuardDashboardEvents() {
    // Events are handled by onclick attributes in the HTML
}

function setupAdminDashboardEvents() {
    // Events are handled by onclick attributes in the HTML
}

function showVisitorRequests() {
    const requests = appData.visitorRequests.filter(req => req.requestedFor === currentUser.id);
    
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-user-friends"></i> Visitor Requests</h3>
            </div>
            <div class="section-content">
                ${requests.length > 0 ? requests.map(req => `
                    <div class="request-card">
                        <div class="request-header">
                            <div class="request-info">
                                <h4>${req.visitorName}</h4>
                                <p>${req.purpose}</p>
                                <p><i class="fas fa-phone"></i> ${req.visitorMobile}</p>
                                <p><i class="fas fa-clock"></i> ${formatDateTime(req.timestamp)}</p>
                                ${req.otp ? `<p><i class="fas fa-key"></i> OTP: <strong>${req.otp}</strong></p>` : ''}
                            </div>
                            <span class="request-status ${req.status}">${req.status}</span>
                        </div>
                        ${req.status === 'pending' ? `
                            <div class="request-actions">
                                <button class="btn btn--primary btn--sm" onclick="approveRequest('${req.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn--outline btn--sm" onclick="rejectRequest('${req.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No visitor requests</p></div>'}
            </div>
        </div>
    `;
}

function showScheduleGuest() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-calendar-plus"></i> Schedule Guest Visit</h3>
            </div>
            <div class="section-content">
                <form id="scheduleGuestForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Guest Name</label>
                            <input type="text" class="form-control" id="guestName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Guest Mobile</label>
                            <input type="tel" class="form-control" id="guestMobile" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Visit Date</label>
                            <input type="date" class="form-control" id="visitDate" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Visit Time</label>
                            <input type="time" class="form-control" id="visitTime" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Purpose</label>
                        <input type="text" class="form-control" id="visitPurpose" placeholder="e.g., Personal visit, Party, etc." required>
                    </div>
                    <button type="submit" class="btn btn--primary">
                        <i class="fas fa-calendar-plus"></i> Schedule Guest
                    </button>
                </form>
            </div>
        </div>
        
        <div class="dashboard-section mt-16">
            <div class="section-header">
                <h3><i class="fas fa-calendar"></i> Scheduled Guests</h3>
            </div>
            <div class="section-content">
                ${generateScheduledGuestsList()}
            </div>
        </div>
    `;
    
    document.getElementById('scheduleGuestForm').addEventListener('submit', handleScheduleGuest);
}

function showVisitorEntry() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-user-plus"></i> New Visitor Entry</h3>
            </div>
            <div class="section-content">
                <form id="visitorEntryForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Visitor Name</label>
                            <input type="text" class="form-control" id="visitorName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Visitor Mobile</label>
                            <input type="tel" class="form-control" id="visitorMobile" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Visiting Flat</label>
                            <select class="form-control" id="visitingFlat" required>
                                <option value="">Select Flat</option>
                                ${appData.residents.map(resident => 
                                    `<option value="${resident.id}">${resident.flat} - ${resident.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Purpose</label>
                            <select class="form-control" id="visitPurpose" required>
                                <option value="">Select Purpose</option>
                                <option value="Personal Visit">Personal Visit</option>
                                <option value="Delivery - Amazon">Delivery - Amazon</option>
                                <option value="Delivery - Flipkart">Delivery - Flipkart</option>
                                <option value="Food Delivery - Swiggy">Food Delivery - Swiggy</option>
                                <option value="Food Delivery - Zomato">Food Delivery - Zomato</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Visitor Photo</label>
                        <div class="file-upload">
                            <input type="file" id="visitorPhoto" accept="image/*">
                            <label for="visitorPhoto" class="file-upload-label">
                                <i class="fas fa-camera"></i>
                                <span>Click to capture/upload photo</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn--primary btn--full-width">
                        <i class="fas fa-paper-plane"></i> Send Request to Resident
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('visitorEntryForm').addEventListener('submit', handleVisitorEntry);
}

function showOTPVerification() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-key"></i> OTP Verification</h3>
            </div>
            <div class="section-content">
                <div class="otp-verification">
                    <p>Enter the OTP provided by the visitor:</p>
                    <form id="otpVerificationForm">
                        <div class="otp-input">
                            <input type="text" class="otp-digit" maxlength="1" required>
                            <input type="text" class="otp-digit" maxlength="1" required>
                            <input type="text" class="otp-digit" maxlength="1" required>
                            <input type="text" class="otp-digit" maxlength="1" required>
                        </div>
                        <button type="submit" class="btn btn--primary">
                            <i class="fas fa-check"></i> Verify & Allow Entry
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="dashboard-section mt-16">
            <div class="section-header">
                <h3><i class="fas fa-list"></i> Approved Visitors</h3>
            </div>
            <div class="section-content">
                ${generateApprovedVisitorsList()}
            </div>
        </div>
    `;
    
    setupOTPInput();
    document.getElementById('otpVerificationForm').addEventListener('submit', handleOTPVerification);
}

function showLogs() {
    const logs = currentRole === 'resident' 
        ? appData.entryLogs.filter(log => log.flat === currentUser.flat)
        : appData.entryLogs;
    
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-list"></i> Entry/Exit Logs</h3>
            </div>
            <div class="section-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Name</th>
                            <th>Flat</th>
                            <th>Purpose</th>
                            <th>Entry Time</th>
                            <th>Exit Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td>${log.visitorName}</td>
                                <td>${log.flat}</td>
                                <td>${log.purpose}</td>
                                <td>${formatDateTime(log.entryTime)}</td>
                                <td>${log.exitTime ? formatDateTime(log.exitTime) : '<span class="text-warning">Still inside</span>'}</td>
                                <td>
                                    <span class="status ${log.exitTime ? 'status--success' : 'status--warning'}">
                                        ${log.exitTime ? 'Completed' : 'In Progress'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showResidentsManagement() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-users"></i> Residents Management</h3>
                <button class="btn btn--primary btn--sm" onclick="showAddResidentForm()">
                    <i class="fas fa-plus"></i> Add Resident
                </button>
            </div>
            <div class="section-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Flat</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appData.residents.map(resident => `
                            <tr>
                                <td>${resident.name}</td>
                                <td>${resident.flat}</td>
                                <td>${resident.mobile}</td>
                                <td>${resident.email}</td>
                                <td>
                                    <button class="btn btn--outline btn--sm" onclick="editResident('${resident.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn--outline btn--sm" onclick="deleteResident('${resident.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showGuardsManagement() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-user-shield"></i> Guards Management</h3>
            </div>
            <div class="section-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Shift</th>
                            <th>Mobile</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appData.guards.map(guard => `
                            <tr>
                                <td>${guard.name}</td>
                                <td>${guard.shift}</td>
                                <td>${guard.mobile}</td>
                                <td>
                                    <button class="btn btn--outline btn--sm" onclick="editGuard('${guard.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showEmergencyLogs() {
    document.getElementById('dashboardContent').innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Emergency Logs</h3>
            </div>
            <div class="section-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Flat</th>
                            <th>Resident</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Responded By</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appData.emergencyAlerts.map(alert => {
                            const resident = appData.residents.find(r => r.id === alert.residentId);
                            const guard = appData.guards.find(g => g.id === alert.respondedBy);
                            return `
                                <tr>
                                    <td>${alert.flat}</td>
                                    <td>${resident ? resident.name : 'Unknown'}</td>
                                    <td>${formatDateTime(alert.timestamp)}</td>
                                    <td>
                                        <span class="status ${alert.status === 'resolved' ? 'status--success' : 'status--error'}">
                                            ${alert.status}
                                        </span>
                                    </td>
                                    <td>${guard ? guard.name : 'Not responded'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Event Handlers
function triggerEmergency() {
    const emergencyId = 'EA' + String(Date.now()).slice(-6);
    const newAlert = {
        id: emergencyId,
        residentId: currentUser.id,
        flat: currentUser.flat,
        timestamp: new Date().toISOString(),
        status: 'active',
        respondedBy: null
    };
    
    appData.emergencyAlerts.push(newAlert);
    
    // Show emergency modal
    showModal('emergencyModal');
    
    // Start response timer
    startResponseTimer();
    
    // Show success toast
    showToast('Emergency alert sent to security!', 'error');
    
    // Play alert sound (simulated)
    console.log('EMERGENCY ALERT TRIGGERED!');
}

function approveRequest(requestId) {
    const request = appData.visitorRequests.find(req => req.id === requestId);
    if (request) {
        request.status = 'approved';
        request.otp = generateOTP();
        
        // Show OTP modal
        document.getElementById('generatedOTP').textContent = request.otp;
        showModal('otpModal');
        
        showToast('Visitor request approved!', 'success');
        
        // Refresh current view
        if (currentView === 'dashboard') {
            showDashboard();
        } else if (currentView === 'requests') {
            showVisitorRequests();
        }
    }
}

function rejectRequest(requestId) {
    const request = appData.visitorRequests.find(req => req.id === requestId);
    if (request) {
        request.status = 'rejected';
        showToast('Visitor request rejected', 'warning');
        
        // Refresh current view
        if (currentView === 'dashboard') {
            showDashboard();
        } else if (currentView === 'requests') {
            showVisitorRequests();
        }
    }
}

function handleScheduleGuest(e) {
    e.preventDefault();
    
    const guestData = {
        id: 'PSG' + String(Date.now()).slice(-6),
        guestName: document.getElementById('guestName').value,
        guestMobile: document.getElementById('guestMobile').value,
        residentId: currentUser.id,
        scheduledTime: document.getElementById('visitDate').value + 'T' + document.getElementById('visitTime').value,
        purpose: document.getElementById('visitPurpose').value,
        qrCode: 'QR' + Math.random().toString(36).substr(2, 9),
        status: 'scheduled'
    };
    
    appData.preScheduledGuests.push(guestData);
    
    showToast('Guest visit scheduled successfully!', 'success');
    document.getElementById('scheduleGuestForm').reset();
    
    // Refresh the scheduled guests list
    showScheduleGuest();
}

function handleVisitorEntry(e) {
    e.preventDefault();
    
    const visitorData = {
        id: 'VR' + String(Date.now()).slice(-6),
        visitorName: document.getElementById('visitorName').value,
        visitorMobile: document.getElementById('visitorMobile').value,
        purpose: document.getElementById('visitPurpose').value,
        requestedBy: currentUser.id,
        requestedFor: document.getElementById('visitingFlat').value,
        status: 'pending',
        timestamp: new Date().toISOString(),
        otp: null
    };
    
    appData.visitorRequests.push(visitorData);
    
    showToast('Visitor request sent to resident!', 'success');
    document.getElementById('visitorEntryForm').reset();
    
    // Refresh dashboard
    showDashboard();
}

function handleOTPVerification(e) {
    e.preventDefault();
    
    const digits = document.querySelectorAll('.otp-digit');
    const enteredOTP = Array.from(digits).map(digit => digit.value).join('');
    
    const request = appData.visitorRequests.find(req => req.otp === enteredOTP && req.status === 'approved');
    
    if (request) {
        // Create entry log
        const entryLog = {
            id: 'EL' + String(Date.now()).slice(-6),
            visitorName: request.visitorName,
            flat: appData.residents.find(r => r.id === request.requestedFor)?.flat || 'Unknown',
            purpose: request.purpose,
            entryTime: new Date().toISOString(),
            exitTime: null,
            guardId: currentUser.id
        };
        
        appData.entryLogs.push(entryLog);
        
        showToast('OTP verified! Visitor entry logged.', 'success');
        
        // Clear form
        digits.forEach(digit => digit.value = '');
        
        // Refresh view
        showOTPVerification();
    } else {
        showToast('Invalid OTP! Please check and try again.', 'error');
    }
}

function respondToEmergency(alertId) {
    const alert = appData.emergencyAlerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = 'resolved';
        alert.respondedBy = currentUser.id;
        showToast('Emergency response logged', 'success');
        showDashboard();
    }
}

// Utility Functions
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function generateScheduledGuestsList() {
    const scheduled = appData.preScheduledGuests.filter(guest => guest.residentId === currentUser.id);
    
    if (scheduled.length === 0) {
        return '<div class="empty-state"><i class="fas fa-calendar"></i><p>No scheduled guests</p></div>';
    }
    
    return scheduled.map(guest => `
        <div class="request-card">
            <div class="request-info">
                <h4>${guest.guestName}</h4>
                <p><i class="fas fa-clock"></i> ${formatDateTime(guest.scheduledTime)}</p>
                <p><i class="fas fa-qrcode"></i> QR Code: ${guest.qrCode}</p>
            </div>
            <span class="request-status ${guest.status}">${guest.status}</span>
        </div>
    `).join('');
}

function generateApprovedVisitorsList() {
    const approvedRequests = appData.visitorRequests.filter(req => req.status === 'approved');
    
    if (approvedRequests.length === 0) {
        return '<div class="empty-state"><i class="fas fa-inbox"></i><p>No approved visitors</p></div>';
    }
    
    return approvedRequests.map(req => {
        const resident = appData.residents.find(r => r.id === req.requestedFor);
        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4>${req.visitorName}</h4>
                        <p>${req.purpose}</p>
                        <p><i class="fas fa-home"></i> ${resident ? `${resident.name} - ${resident.flat}` : 'Unknown'}</p>
                        <p><i class="fas fa-key"></i> OTP: <strong>${req.otp}</strong></p>
                    </div>
                    <span class="request-status ${req.status}">${req.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

function setupOTPInput() {
    const digits = document.querySelectorAll('.otp-digit');
    
    digits.forEach((digit, index) => {
        digit.addEventListener('input', function() {
            if (this.value.length === 1 && index < digits.length - 1) {
                digits[index + 1].focus();
            }
        });
        
        digit.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                digits[index - 1].focus();
            }
        });
    });
}

function startResponseTimer() {
    let seconds = 0;
    const timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        const responseTimeElement = document.getElementById('responseTime');
        if (responseTimeElement) {
            responseTimeElement.textContent = timeString;
        } else {
            clearInterval(timer);
        }
    }, 1000);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function logout() {
    currentUser = null;
    currentRole = null;
    currentView = 'dashboard';
    
    // Reset login page
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('authForm').reset();
    
    showPage('loginPage');
    showToast('Logged out successfully', 'info');
}

// Additional utility functions for admin features
function showAddResidentForm() {
    // This would show a modal with a form to add a new resident
    showToast('Add resident feature - Coming soon!', 'info');
}

function editResident(residentId) {
    showToast('Edit resident feature - Coming soon!', 'info');
}

function deleteResident(residentId) {
    showToast('Delete resident feature - Coming soon!', 'info');
}

function editGuard(guardId) {
    showToast('Edit guard feature - Coming soon!', 'info');
}

let confirmAction = null;

function handleConfirmAction() {
    if (confirmAction) {
        confirmAction();
        confirmAction = null;
    }
    hideModal('confirmModal');
}