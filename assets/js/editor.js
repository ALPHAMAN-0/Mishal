/*
 * Editor Module
 * Handles click-to-edit text fields, profile picture upload,
 * and adding/deleting skill & project cards.
 */

var saveTimeout = null;

function initEditor() {
    // Profile picture upload handler
    var picUpload = document.getElementById('pic-upload');
    if (picUpload) {
        picUpload.addEventListener('change', function (e) {
            var file = e.target.files[0];
            if (!file) return;

            // Validate
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image must be under 5MB', 'error');
                return;
            }

            // Preview immediately
            var reader = new FileReader();
            reader.onload = function (ev) {
                document.getElementById('profile-pic').src = ev.target.result;
            };
            reader.readAsDataURL(file);

            // Upload to Firebase
            uploadProfilePic(file);
        });
    }

    // Double-click to edit text fields
    document.addEventListener('dblclick', function (e) {
        if (!isAdminMode) return;

        var target = e.target.closest('.editable');
        if (!target || target.querySelector('.edit-input')) return;

        startEditing(target);
    });
}

function triggerPicUpload() {
    document.getElementById('pic-upload').click();
}

function uploadProfilePic(file) {
    if (!firebaseReady || !isAdminMode) return;

    var storageRef = storage.ref('profile/avatar');
    storageRef.put(file)
        .then(function (snapshot) {
            return snapshot.ref.getDownloadURL();
        })
        .then(function (url) {
            document.getElementById('profile-pic').src = url;
            return db.collection('content').doc('main').set(
                { profilePic: url },
                { merge: true }
            );
        })
        .then(function () {
            showToast('Photo updated', 'success');
        })
        .catch(function (err) {
            console.error('Upload failed:', err);
            showToast('Upload failed', 'error');
        });
}

function startEditing(element) {
    var currentText = element.innerText;
    var isMultiline = element.tagName === 'P' && currentText.length > 60;

    var input;
    if (isMultiline) {
        input = document.createElement('textarea');
        input.rows = 3;
    } else {
        input = document.createElement('input');
        input.type = 'text';
    }

    input.value = currentText;
    input.className = 'edit-input';
    input.style.fontSize = window.getComputedStyle(element).fontSize;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    function finishEditing() {
        var newValue = input.value.trim() || currentText;
        element.textContent = newValue;

        var field = element.dataset.field;
        if (field) {
            debouncedSave(field, newValue);
        }

        // Check if inside a skill or project card
        var card = element.closest('.skill-card, .project-card');
        if (card && card.dataset.id) {
            saveCardData(card);
        }
    }

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !isMultiline) {
            e.preventDefault();
            input.blur();
        }
        if (e.key === 'Escape') {
            input.value = currentText;
            input.blur();
        }
    });
}

function debouncedSave(field, value) {
    if (!firebaseReady || !isAdminMode) return;

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function () {
        var data = {};
        data[field] = value;
        db.collection('content').doc('main').set(data, { merge: true })
            .then(function () {
                showToast('Saved', 'success');
            })
            .catch(function (err) {
                console.error('Save failed:', err);
                showToast('Save failed', 'error');
            });
    }, 300);
}

// ===== Skill Cards =====

function addSkillCard() {
    if (!isAdminMode) return;

    var container = document.getElementById('skills-container');
    var id = 'skill-' + Date.now();
    var card = createSkillElement(id, 'New Skill', 75);
    card.setAttribute('draggable', 'true');
    container.appendChild(card);

    // Save to Firestore
    if (firebaseReady) {
        db.collection('skills').doc(id).set({
            name: 'New Skill',
            proficiency: 75,
            order: container.children.length
        });
    }

    // Start editing the name
    var nameEl = card.querySelector('.skill-name');
    if (nameEl) startEditing(nameEl);
}

function createSkillElement(id, name, proficiency) {
    var card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.id = id;
    card.innerHTML =
        '<button class="card-delete-btn" onclick="deleteCard(this)" title="Delete">&times;</button>' +
        '<div class="skill-name editable">' + escapeHtml(name) + '</div>' +
        '<div class="skill-bar"><div class="skill-bar-fill" style="width: ' + proficiency + '%"></div></div>';
    return card;
}

// ===== Project Cards =====

function addProjectCard() {
    if (!isAdminMode) return;

    var container = document.getElementById('projects-container');
    var id = 'proj-' + Date.now();
    var card = createProjectElement(id, 'New Project', 'Project description...', ['HTML', 'CSS', 'JS'], '#', '#');
    card.setAttribute('draggable', 'true');
    container.appendChild(card);

    // Save to Firestore
    if (firebaseReady) {
        db.collection('projects').doc(id).set({
            title: 'New Project',
            description: 'Project description...',
            tags: ['HTML', 'CSS', 'JS'],
            demoUrl: '#',
            repoUrl: '#',
            order: container.children.length
        });
    }

    var titleEl = card.querySelector('.project-title');
    if (titleEl) startEditing(titleEl);
}

function createProjectElement(id, title, desc, tags, demoUrl, repoUrl) {
    var tagsHtml = (tags || []).map(function (t) {
        return '<span class="project-tag">' + escapeHtml(t) + '</span>';
    }).join('');

    var card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = id;
    card.innerHTML =
        '<button class="card-delete-btn" onclick="deleteCard(this)" title="Delete">&times;</button>' +
        '<div class="project-card-image"><span>' + escapeHtml(title.charAt(0)) + '</span></div>' +
        '<div class="project-card-body">' +
        '  <div class="project-title editable">' + escapeHtml(title) + '</div>' +
        '  <div class="project-desc editable">' + escapeHtml(desc) + '</div>' +
        '  <div class="project-tags">' + tagsHtml + '</div>' +
        '  <div class="project-links">' +
        '    <a href="' + escapeHtml(demoUrl) + '" target="_blank">Live Demo</a>' +
        '    <a href="' + escapeHtml(repoUrl) + '" target="_blank">Source Code</a>' +
        '  </div>' +
        '</div>';
    return card;
}

// ===== Delete Card =====

function deleteCard(btn) {
    if (!isAdminMode) return;

    var card = btn.closest('.skill-card, .project-card');
    if (!card) return;

    if (!confirm('Delete this item?')) return;

    var id = card.dataset.id;
    var collection = card.classList.contains('skill-card') ? 'skills' : 'projects';

    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(function () {
        card.remove();
    }, 300);

    if (firebaseReady && id) {
        db.collection(collection).doc(id).delete()
            .then(function () {
                showToast('Deleted', 'success');
            })
            .catch(function (err) {
                console.error('Delete failed:', err);
                showToast('Delete failed', 'error');
            });
    }
}

// ===== Save Card Data =====

function saveCardData(card) {
    if (!firebaseReady || !isAdminMode) return;

    var id = card.dataset.id;
    if (!id) return;

    if (card.classList.contains('skill-card')) {
        var nameEl = card.querySelector('.skill-name');
        db.collection('skills').doc(id).set(
            { name: nameEl ? nameEl.textContent : '' },
            { merge: true }
        );
    } else if (card.classList.contains('project-card')) {
        var titleEl = card.querySelector('.project-title');
        var descEl = card.querySelector('.project-desc');
        db.collection('projects').doc(id).set({
            title: titleEl ? titleEl.textContent : '',
            description: descEl ? descEl.textContent : ''
        }, { merge: true });
    }
}

// ===== Utility =====

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
