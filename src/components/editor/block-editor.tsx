"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import './editor-styles.css';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
} from "lucide-react";

interface BlockContent {
  id: string;
  type: 'text' | 'heading' | 'bullet' | 'divider' | 'code' | 'quote';
  content: string;
  metadata?: Record<string, unknown>;
}

interface BlockEditorProps {
  initialContent?: BlockContent[];
  onChange?: (content: BlockContent[]) => void;
  placeholder?: string;
}

const slashCommands = [
  {
    title: 'Text',
    description: 'Just start writing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: Type,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: Heading1,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: Heading2,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: Heading3,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point'],
    icon: List,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: ListOrdered,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: Quote,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: Code,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Visually divide blocks.',
    searchTerms: ['horizontal rule', 'hr'],
    icon: Minus,
    command: ({ editor }: { editor: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      editor.chain().focus().setHorizontalRule().run();
    },
  },
];

export function BlockEditor({ onChange, placeholder = "Type '/' for commands..." }: BlockEditorProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      // Convert Tiptap content to our BlockContent format
      const blocks = convertTiptapToBlocks(content);
      onChange?.(blocks);
    },
  });

  const convertTiptapToBlocks = (content: Record<string, any>): BlockContent[] => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!content?.content) return [];
    
    return content.content.map((node: Record<string, any>, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      let type: BlockContent['type'] = 'text';
      let textContent = '';

      if (node.type === 'heading') {
        type = 'heading';
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        type = 'bullet';
      } else if (node.type === 'blockquote') {
        type = 'quote';
      } else if (node.type === 'codeBlock') {
        type = 'code';
      } else if (node.type === 'horizontalRule') {
        type = 'divider';
      }

      // Extract text content
      if (node.content) {
        textContent = extractTextFromNode(node);
      }

      return {
        id: `block-${index}`,
        type,
        content: textContent,
        metadata: node.type === 'heading' ? { level: node.attrs?.level } : undefined,
      };
    });
  };

  const extractTextFromNode = (node: Record<string, any>): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.content) {
      return node.content.map(extractTextFromNode).join('');
    }
    
    return '';
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === '/' && !showCommands) {
      const selection = editor?.state.selection;
      const { $from } = selection || {};
      
      // Only show commands if we're at the start of an empty paragraph
      if ($from?.parent.textContent === '' && $from.parentOffset === 0) {
        event.preventDefault();
        setShowCommands(true);
        setCommandQuery('');
      }
    } else if (event.key === 'Escape' && showCommands) {
      setShowCommands(false);
      setCommandQuery('');
      editor?.commands.focus();
    }
  }, [showCommands, editor]);

  const executeCommand = (command: { command: ({ editor }: { editor: any }) => void }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    command.command({ editor });
    setShowCommands(false);
    setCommandQuery('');
  };

  const filteredCommands = slashCommands.filter(command =>
    command.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(commandQuery.toLowerCase()) ||
    command.searchTerms.some(term => 
      term.toLowerCase().includes(commandQuery.toLowerCase())
    )
  );

  return (
    <div className="relative">
      <div 
        className="min-h-[200px] p-4 border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onKeyDown={handleKeyDown}
      >
        <EditorContent editor={editor} />
      </div>

      {showCommands && (
        <div className="absolute top-full left-0 z-50 w-80 mt-2">
          <div className="rounded-lg border bg-popover p-2 shadow-lg">
            <Command>
              <CommandInput 
                placeholder="Search commands..." 
                value={commandQuery}
                onValueChange={setCommandQuery}
              />
              <CommandList>
                <CommandEmpty>No commands found.</CommandEmpty>
                <CommandGroup heading="Basic Blocks">
                  {filteredCommands.map((command) => (
                    <CommandItem
                      key={command.title}
                      onSelect={() => executeCommand(command)}
                      className="flex items-center space-x-3 px-3 py-2"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-background">
                        <command.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{command.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {command.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}