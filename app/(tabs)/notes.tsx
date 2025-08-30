import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  SectionList,
  Image,
  Dimensions
} from 'react-native';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteModal } from '@/components/AddNoteModal';
import { BookOpen, Plus, Search, LayoutList, Grid } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
      <View style={styles.emptyIconContainer}>
        <BookOpen size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with the AI tutor to automatically collect notes, or add your own manually.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color="white" />
        <Text style={styles.emptyButtonText}>Add Note</Text>
      </TouchableOpacity>
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
      <View style={styles.sectionCountContainer}>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
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
            {viewMode === 'list' ? (
              <LayoutList size={20} color="#6B7280" />
            ) : (
              <Grid size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowAddModal(true)} 
            style={styles.addButton}
          >
            <Plus size={20} color="white" />
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
          stickySectionHeadersEnabled={false}
        />
      )}
      
      <AddNoteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addNote}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  sectionCountContainer: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
