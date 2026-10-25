import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Check, Plus, Trash2, X } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ChecklistItem } from '../types';

interface TaskChecklistSectionProps {
  items: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
  onAddItem: (title: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const TaskChecklistSection: React.FC<TaskChecklistSectionProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  const handleSaveNew = () => {
    if (newTitle.trim()) {
      onAddItem(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Checklist {totalCount > 0 ? `(${completedCount}/${totalCount})` : ''}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAdding(true)}
          activeOpacity={0.7}
        >
          <Plus size={16} color={colors.darkPlum || '#2D1225'} strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Adding inline field */}
      {isAdding && (
        <View style={styles.inlineAddRow}>
          <TextInput
            style={styles.inlineInput}
            placeholder="Add new checklist item..."
            placeholderTextColor="#9CA3AF"
            value={newTitle}
            onChangeText={setNewTitle}
            autoFocus
            onSubmitEditing={handleSaveNew}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.inlineSaveBtn}
            onPress={handleSaveNew}
            disabled={!newTitle.trim()}
          >
            <Check size={16} color={colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inlineCancelBtn}
            onPress={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
          >
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Items list */}
      <View style={styles.list}>
        {items.map((item) => {
          return (
            <View key={item.id} style={styles.itemRow}>
              <TouchableOpacity
                style={[styles.circleCheck, item.completed && styles.circleCheckActive]}
                onPress={() => onToggleItem(item.id)}
                activeOpacity={0.8}
              >
                {item.completed && (
                  <Check size={13} color={colors.white} strokeWidth={3} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.itemTitleWrapper}
                onPress={() => onToggleItem(item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.itemTitle,
                    item.completed && styles.itemTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onDeleteItem(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.deleteBtn}
              >
                <Trash2 size={15} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          );
        })}

        {items.length === 0 && !isAdding && (
          <Text style={styles.emptyText}>No checklist items yet.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.darkPlum || '#2D1225',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkPlum || '#2D1225',
  },
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineInput: {
    flex: 1,
    fontSize: 14,
    color: colors.darkPlum || '#2D1225',
    paddingVertical: 6,
  },
  inlineSaveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.darkPlum || '#2D1225',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineCancelBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  circleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#C4BAB0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleCheckActive: {
    backgroundColor: '#3538CD', // modern vivid indigo / purple as seen in design
    borderColor: '#3538CD',
  },
  itemTitleWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: colors.darkPlum || '#2D1225',
    fontWeight: '500',
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
});

export default TaskChecklistSection;
