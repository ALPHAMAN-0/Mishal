/*
 * Drag and Drop Module
 * HTML5 Drag and Drop API for reordering skill and project cards.
 * Only active in admin mode.
 */

var draggedItem = null;

function initDragDrop() {
    initContainer('skills-container');
    initContainer('projects-container');
}

function initContainer(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('dragstart', function (e) {
        if (!isAdminMode) return;
        var card = e.target.closest('.skill-card, .project-card');
        if (!card) return;
        draggedItem = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id || '');
    });

    container.addEventListener('dragend', function (e) {
        var card = e.target.closest('.skill-card, .project-card');
        if (card) card.classList.remove('dragging');
        draggedItem = null;
        // Remove all drag-over indicators
        container.querySelectorAll('.drag-over').forEach(function (el) {
            el.classList.remove('drag-over');
        });
    });

    container.addEventListener('dragover', function (e) {
        if (!isAdminMode || !draggedItem) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        var afterElement = getDragAfterElement(container, e.clientY);

        // Remove previous indicators
        container.querySelectorAll('.drag-over').forEach(function (el) {
            el.classList.remove('drag-over');
        });

        if (afterElement) {
            afterElement.classList.add('drag-over');
            container.insertBefore(draggedItem, afterElement);
        } else {
            container.appendChild(draggedItem);
        }
    });

    container.addEventListener('dragleave', function (e) {
        var card = e.target.closest('.skill-card, .project-card');
        if (card) card.classList.remove('drag-over');
    });

    container.addEventListener('drop', function (e) {
        e.preventDefault();
        container.querySelectorAll('.drag-over').forEach(function (el) {
            el.classList.remove('drag-over');
        });
        saveOrder(containerId);
    });
}

function getDragAfterElement(container, y) {
    var draggables = Array.from(
        container.querySelectorAll('.skill-card:not(.dragging), .project-card:not(.dragging)')
    );

    return draggables.reduce(function (closest, child) {
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveOrder(containerId) {
    if (!firebaseReady || !isAdminMode) return;

    var container = document.getElementById(containerId);
    var cards = container.querySelectorAll('.skill-card, .project-card');
    var order = [];
    cards.forEach(function (card) {
        if (card.dataset.id) order.push(card.dataset.id);
    });

    var update = {};
    update[containerId] = order;

    db.collection('settings').doc('order').set(update, { merge: true })
        .then(function () {
            showToast('Order saved', 'success');
        })
        .catch(function (err) {
            console.error('Failed to save order:', err);
            showToast('Failed to save order', 'error');
        });
}
