let player;
let notes = [];
let currentVideoUrl = '';

function loadVideo() {
    const input = document.getElementById('video-id').value;
    const videoId = extractVideoId(input);
    
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady
            }
        });
    }

    currentVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
}

function extractVideoId(urlOrId) {
    const urlPattern = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = urlOrId.match(urlPattern);
    return match ? match[1] : urlOrId;
}

function onPlayerReady(event) {
    // Player is ready
}

function addNote() {
    const noteText = document.getElementById('note-input').value;
    const currentTime = player.getCurrentTime();
    const note = { text: noteText, time: currentTime };
    notes.push(note);
    displayNotes();
    document.getElementById('note-input').value = '';
    saveNotes();
}

function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.className = 'collection-item';
        noteItem.innerHTML = `<span onclick="seekToTime(${note.time})">${formatTime(note.time)}</span> - ${note.text} 
                              <button class="btn-small red" onclick="deleteNote(${index})">Delete</button>`;
        notesList.appendChild(noteItem);
    });
}

function deleteNote(index) {
    notes.splice(index, 1);
    displayNotes();
    saveNotes();
}

function seekToTime(time) {
    player.seekTo(time, true);
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function downloadNotes() {
    const notesWithLink = {
        videoUrl: currentVideoUrl,
        notes: notes
    };
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(notesWithLink, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'notes.txt';
    document.body.appendChild(element);
    element.click();
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        displayNotes();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const parsedData = JSON.parse(content);
            currentVideoUrl = parsedData.videoUrl;
            notes = parsedData.notes;
            const videoId = extractVideoId(currentVideoUrl);
            loadVideoById(videoId);
            displayNotes();
        };
        reader.readAsText(file);
    }
}

function loadVideoById(videoId) {
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady
            }
        });
    }
}

window.onload = loadNotes;
