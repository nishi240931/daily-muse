import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: number;
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const { toast } = useToast();

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('journal-entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journal-entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title.trim(),
      content: newEntry.content.trim(),
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      createdAt: Date.now()
    };

    setEntries(prev => [entry, ...prev]);
    setNewEntry({ title: '', content: '' });
    setIsAdding(false);
    
    toast({
      title: "Entry added",
      description: "Your journal entry has been saved."
    });
  };

  const updateEntry = (id: string, title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, title: title.trim(), content: content.trim() }
        : entry
    ));
    setEditingId(null);
    
    toast({
      title: "Entry updated",
      description: "Your changes have been saved."
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Entry deleted",
      description: "The journal entry has been removed."
    });
  };

  const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 mr-3 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent transition-all duration-500 hover:scale-105">
              Daily Journal
            </h1>
          </div>
          <p className="text-muted-foreground text-lg transition-colors duration-300 hover:text-foreground/80">
            Capture your thoughts, one entry at a time
          </p>
        </div>

        {/* Add Entry Section */}
        <Card className="mb-8 p-6 shadow-lg border-2 border-accent/20 animate-scale-in hover:shadow-xl transition-all duration-300 group">
          {!isAdding ? (
            <Button 
              onClick={() => setIsAdding(true)}
              className="w-full h-16 text-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              variant="outline"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
              Write a new entry
            </Button>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <Input
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-medium h-12 transition-all duration-200 focus:scale-[1.01]"
                autoFocus
              />
              <Textarea
                placeholder="What's on your mind today?"
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-32 text-base resize-none transition-all duration-200 focus:scale-[1.01]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={addEntry} 
                  className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Entry
                </Button>
                <Button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewEntry({ title: '', content: '' });
                  }}
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Entries List */}
        <div className="space-y-6">
          {sortedEntries.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in">
              <div className="flex flex-col items-center space-y-4">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
                <p className="text-muted-foreground text-lg">
                  No entries yet. Start writing your first journal entry!
                </p>
              </div>
            </Card>
          ) : (
            sortedEntries.map((entry, index) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                isEditing={editingId === entry.id}
                onEdit={() => setEditingId(entry.id)}
                onSave={(title, content) => updateEntry(entry.id, title, content)}
                onCancel={() => setEditingId(null)}
                onDelete={() => deleteEntry(entry.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface JournalEntryCardProps {
  entry: JournalEntry;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  index: number;
}

const JournalEntryCard = ({ 
  entry, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  index 
}: JournalEntryCardProps) => {
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);

  useEffect(() => {
    if (isEditing) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
    }
  }, [isEditing, entry.title, entry.content]);

  return (
    <Card 
      className="p-6 shadow-md hover:shadow-lg transition-all duration-300 group animate-fade-in hover:scale-[1.01] border-l-4 border-l-primary/20 hover:border-l-primary/60"
      style={{ 
        animationDelay: `${index * 100}ms` 
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <Badge 
          variant="secondary" 
          className="text-sm font-medium transition-all duration-200 group-hover:scale-105"
        >
          {entry.date}
        </Badge>
        {!isEditing && (
          <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              onClick={onEdit}
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-accent"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onDelete}
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 animate-fade-in">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-lg font-semibold h-12 transition-all duration-200 focus:scale-[1.01]"
            autoFocus
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-32 resize-none transition-all duration-200 focus:scale-[1.01]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => onSave(editTitle, editContent)}
              size="sm"
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button 
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="transition-all duration-300">
          <h2 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
            {entry.title}
          </h2>
          <p className="text-card-foreground/90 leading-relaxed whitespace-pre-wrap transition-all duration-300 group-hover:text-card-foreground">
            {entry.content}
          </p>
        </div>
      )}
    </Card>
  );
};

export default Journal;