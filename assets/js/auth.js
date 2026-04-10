/*
 * Authentication Module
 * Handles admin login/logout and mode switching.
 * Security note: Client-side auth controls UI only.
 * Firestore/Storage security rules enforce actual permissions.
 */

let isAdminMode = false;

// Listen for auth state changes
function initAuth() {
    if (!firebaseReady) return;

    auth.onAuthStateChanged(function (user) {
        if (user) {
            enterAdminMode();
        } else {
            exitAdminMode();
        }
    });
}

function enterAdminMode() {
    isAdminMode = true;
    document.body.classList.add('admin-mode');

    // Swap FAB icon
    document.getElementById('fab-icon-lock').classList.add('hidden');
    document.getElementById('fab-icon-logout').classList.remove('hidden');

    // Make cards draggable
    document.querySelectorAll('.skill-card, .project-card').forEach(function (card) {
        card.setAttribute('draggable', 'true');
    });

    showToast('Logged in as admin', 'success');
}

function exitAdminMode() {
    isAdminMode = false;
    document.body.classList.remove('admin-mode');

    // Swap FAB icon
    document.getElementById('fab-icon-lock').classList.remove('hidden');
    document.getElementById('fab-icon-logout').classList.add('hidden');

    // Remove draggable
    document.querySelectorAll('.skill-card, .project-card').forEach(function (card) {
        card.setAttribute('draggable', 'false');
    });
}

function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    document.getElementById('login-email').focus();
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-form').reset();
}

function handleLoginSubmit(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    if (!firebaseReady) {
        document.getElementById('login-error').textContent = 'Firebase not configured yet.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
            closeLoginModal();
        })
        .catch(function (error) {
            var msg = 'Invalid credentials';
            if (error.code === 'auth/user-not-found') msg = 'User not found';
            if (error.code === 'auth/wrong-password') msg = 'Wrong password';
            if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try later.';
            document.getElementById('login-error').textContent = msg;
        });
}

function handleLogout() {
    if (!firebaseReady) return;
    auth.signOut();
}

function handleFabClick() {
    if (isAdminMode) {
        handleLogout();
    } else {
        openLoginModal();
    }
}

// Close modal on backdrop click
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-backdrop')) {
        closeLoginModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});
