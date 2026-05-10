document.addEventListener('DOMContentLoaded', () => {
    const addNoteBtn = document.getElementById('add-note-btn');
    const modal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note');
    const noteTitle = document.getElementById('note-title');
    const noteText = document.getElementById('note-text');
    const notesContainer = document.getElementById('notes-container');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme Toggle Logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Load notes from local storage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let editingIndex = -1;

    // Render existing notes
    const renderNotes = (searchQuery = '') => {
        notesContainer.innerHTML = '';
        notes.forEach((note, index) => {
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                const titleMatch = note.title && note.title.toLowerCase().includes(lowerQuery);
                const textMatch = note.text && note.text.toLowerCase().includes(lowerQuery);
                if (!titleMatch && !textMatch) return;
            }
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';

            // Format date
            const dateObj = new Date(note.timestamp);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const titleHTML = note.title ? `<div class="note-title-display">${escapeHTML(note.title)}</div>` : '';

            noteCard.innerHTML = `
                ${titleHTML}
                <div class="note-content">${escapeHTML(note.text)}</div>
                <div class="note-footer">
                    <span class="note-date">${dateStr}</span>
                    <div class="note-actions">
                        <button class="edit-btn" data-index="${index}" title="Edit Note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-index="${index}" title="Delete Note">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            notesContainer.appendChild(noteCard);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                deleteNote(index);
            });
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                openEditModal(index);
            });
        });
    };

    // Open modal for new note
    addNoteBtn.addEventListener('click', () => {
        editingIndex = -1;
        document.querySelector('.modal-header h2').textContent = "New Note";
        modal.classList.add('active');
        if (noteTitle) noteTitle.value = '';
        noteText.value = '';
        noteText.style.height = 'auto'; // Reset height
        setTimeout(() => noteTitle ? noteTitle.focus() : noteText.focus(), 100);
    });

    // Open modal for editing note
    const openEditModal = (index) => {
        editingIndex = parseInt(index);
        const note = notes[editingIndex];

        document.querySelector('.modal-header h2').textContent = "Edit Note";
        if (noteTitle) noteTitle.value = note.title || '';
        noteText.value = note.text || '';

        modal.classList.add('active');
        noteText.style.height = 'auto';
        setTimeout(() => {
            noteText.style.height = (noteText.scrollHeight) + 'px';
            noteTitle ? noteTitle.focus() : noteText.focus();
        }, 100);
    };

    // Auto-resize textarea
    noteText.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Save note
    saveNoteBtn.addEventListener('click', () => {
        let title = noteTitle ? noteTitle.value.trim() : '';
        let text = noteText.value.trim();

        // If title is completely empty, use the first line of text as the title (max 40 chars)
        if (!title && text) {
            const lines = text.split('\n');
            if (lines.length > 0 && lines[0].trim().length > 0) {
                title = lines[0].trim();
                // If title extracted is longer than 40 chars, truncate it
                if (title.length > 40) {
                    title = title.substring(0, 40) + "...";
                }
                // Optional: remove first line from text so it's not duplicated
                // text = lines.slice(1).join('\n').trim(); 
            }
        }

        if (title || text) {
            if (editingIndex >= 0) {
                // Update existing note
                notes[editingIndex].title = title;
                notes[editingIndex].text = text;
                // We keep original timestamp or update one. Let's keep original for now and maybe append logic later.
            } else {
                // Create new note
                notes.unshift({
                    title: title,
                    text: text,
                    timestamp: new Date().toISOString()
                });
            }
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes(searchInput ? searchInput.value : '');
            closeModal();
        }
    });

    // Delete note
    const deleteNote = (index) => {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(searchInput ? searchInput.value : '');
    };

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderNotes(e.target.value);
        });
    }

    // Helper function to escape HTML to prevent XSS
    const escapeHTML = (str) => {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    };

    // Initial render
    renderNotes();
});
