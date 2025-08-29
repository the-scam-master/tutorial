import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  SectionList 
} from 'react-native';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteModal } from '@/components/AddNoteModal';
import { BookOpen, Plus, Search } from 'lucide-react-native';

export default function NotesScreen() {
  const { notes, loading, updateNote, deleteNote, addNote, getTopicGroups } = useNotes();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  const topicGroups = getTopicGroups();
  const sectionData = Object.entries(topicGroups).map(([topic, notes]) => ({
    title: topic,
    data: notes,
  }));

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <BookOpen size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with the AI tutor to automatically collect notes, or add your own manually.
      </Text>
    </View>
  );

  const renderNote = ({ item: note }: { item: any }) => (
    <NoteCard 
      note={note} 
      onUpdate={updateNote} 
      onDelete={deleteNote} 
    />
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} notes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
            style={styles.viewModeButton}
          >
            <Text style={styles.viewModeText}>
              {viewMode === 'list' ? 'Group' : 'List'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowAddModal(true)} 
            style={styles.addButton}
          >
            <Plus size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {notes.length === 0 ? (
        <EmptyState />
      ) : viewMode === 'list' ? (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          style={styles.notesList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          sections={sectionData}
          renderItem={renderNote}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          style={styles.notesList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddNoteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    padding: 8,
  },
  notesList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});