"use client"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilePenIcon, TrashIcon } from "lucide-react";

type Note = {
  id: number;
  title: string;
  content: string;
};

const defaultNotes: Note[] = [
  {
    id: 1,
    title: "Grocery List",
    content: "Milk, Eggs, Bread, Butter",
  },
  {
    id: 2,
    title: "go to tution",
    content: "go to tution at 5pm",
  },
  {
    id: 3,
    title: "Meeting Notes",
    content: "Meeting with the team at 3pm",
  },
];

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState(initialValue);

useEffect(() => {
  if (typeof window !== "undefined") {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }
}, [key])
const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};


export default function Note(){
    const [notes, setnotes] = useLocalStorage<Note[]>("notes", defaultNotes)

    const [newNote, setnewNote] = useState<{content:string, title:string}>({
        title: "",
        content: ""
    })

    const [editingNoteId, seteditingNoteId] = useState<number | null>(null)

    const [isMounted, setisMounted] = useState<boolean>(false)

    useEffect(()=>{
        setisMounted(true)
    },[])

    function handleAddNote (): void {
        if (newNote.title.trim() && newNote.content.trim() ){
            const newNoteWithId = {id: Date.now(), ... newNote}
            setnotes([...notes , newNoteWithId])
            setnewNote({title: "", content: ""})
        }
    }

    function handleEditingNote(id : number) :void {
        const noteToEdit = notes.find((note) => note.id === id)

        if (noteToEdit){
            setnewNote({title: noteToEdit.title, content: noteToEdit.content})
            seteditingNoteId(id)
        }
    }

    function handleUpdateNote():void {
        if (newNote.title.trim() && newNote.content.trim()){
            setnotes((
                notes.map((note)=> note.id == editingNoteId ? {id:note.id, title: note.title, content: note.content} : note)
            ))
        }

        setnewNote({title: "", content: ""})
        seteditingNoteId(null)
    }

    const handleDeleteNote = (id:number):void => {
        setnotes(notes.filter((note) => note.id !== id))
    }

    if (!isMounted){
        return null
    }


    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
          <header className="bg-blur p-4 shadow">
            <h1 className="text-2xl font-bold">Add Notes and Track</h1>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              {/* Input for note title */}
              <input
                type="text"
                placeholder="Title"
                value={newNote.title || ""}
                onChange={(e) => setnewNote({ ...newNote, title: e.target.value })}
                className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {/* Textarea for note content */}
              <textarea
                placeholder="Content"
                value={newNote.content || ""}
                onChange={(e) =>
                  setnewNote({ ...newNote, content: e.target.value })
                }
                className="mt-2 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                rows={4}
              />
               {editingNoteId === null ? (
            <Button onClick={handleAddNote} className="mt-2">
              Add Note
            </Button>
          ) : (
            <Button onClick={handleUpdateNote} className="mt-2">
              Update Note
            </Button>
          )}
        </div>
        {/* Display list of notes */}
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{note.title}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditingNote(note.id)}
                  >
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{note.content}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );

}
