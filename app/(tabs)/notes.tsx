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
import { BookOpen, Plus, LayoutList, Grid } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

export default function NotesScreen() {
  const colors = useThemeColors();
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
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceVariant }]}>
        <BookOpen size={64} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notes Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create your own notes to keep track of important information.
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color={colors.onPrimary} />
        <Text style={[styles.emptyButtonText, { color: colors.onPrimary }]}>Add Note</Text>
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
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
      <View style={[styles.sectionCountContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>{section.data.length}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
            style={[styles.viewModeButton, { backgroundColor: colors.surfaceVariant }]}
          >
            {viewMode === 'list' ? (
              <LayoutList size={20} color={colors.textSecondary} />
            ) : (
              <Grid size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowAddModal(true)} 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Plus size={20} color={colors.onPrimary} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
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
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCountContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
