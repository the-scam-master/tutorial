import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { StorageService } from '@/services/storage';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await StorageService.getNotes();
      setNotes(savedNotes.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await StorageService.updateNote(noteId, updates);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await StorageService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const addNote = async (content: string, topic: string) => {
    try {
      const note: Note = {
        id: `manual-${Date.now()}`,
        content: content.trim(),
        topic: topic.trim(),
        timestamp: new Date(),
        source: 'manual',
      };
      await StorageService.addNote(note);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getTopicGroups = () => {
    const groups: Record<string, Note[]> = {};
    notes.forEach(note => {
      const topic = note.topic || 'Uncategorized';
      if (!groups[topic]) {
        groups[topic] = [];
      }
      groups[topic].push(note);
    });
    return groups;
  };

  return {
    notes,
    loading,
    updateNote,
    deleteNote,
    addNote,
    getTopicGroups,
    refreshNotes: loadNotes,
  };
};