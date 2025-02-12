import { ref } from 'vue'

interface Note {
  id: string;
  title: string;
  note: string;
  created: Date;
}

let notesRef = ref<Note[]>([]);

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 15 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export function addNote(title: string, note: string) {
  const newNote = {
    id: generateId(),
    title: title,
    note: note,
    created: new Date()
  }
  notesRef.value.push(newNote);
  localStorage.setItem('notes', JSON.stringify(notesRef.value));
  return newNote;
}

export function getNotes() {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) {
    notesRef.value = JSON.parse(storedNotes);
  }
  return notesRef.value
}

export function deleteNote(id: string) {
  notesRef.value = notesRef.value.filter(note => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(notesRef.value));
}


