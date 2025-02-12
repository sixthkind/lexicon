let notes: { 
  title: string, 
  note: string, 
  created: Date 
}[] = [];

export function addNote(title: string, note: string) {
  notes.push({
    title: title,
    note: note,
    created: new Date()
  })
}

export function getNotes() {
  return notes
}


