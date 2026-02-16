import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    RemoveFormatting,
    ImagePlus,
    Link2,
    Unlink,
    Highlighter,
    Underline as UnderlineIcon,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Palette,
    MoreHorizontal,
    Pilcrow,
    Table as TableIcon,
    CodeSquare,
    Minus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const lowlight = createLowlight(common);

interface TiptapProps {
    content?: string;
    onChange?: (html: string) => void;
}

const Tiptap = ({ content = '', onChange }: TiptapProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                underline: false,
                codeBlock: false,
            }),
            CharacterCount.configure({
                limit: 5000,
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: 'javascript',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Subscript,
            Superscript,
            TextStyle,
            Color,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content || '<p>Hello World! 🌎️</p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap min-h-[300px] p-4 focus:outline-none',
                spellcheck: 'false',
            },
        },
        onUpdate: ({ editor }) => {
            setCharCount(editor.storage.characterCount.characters());
            setWordCount(editor.storage.characterCount.words());
            onChange?.(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '<p>Hello World! 🌎️</p>');
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addImageFromUrl = () => {
        const url = window.prompt('Masukkan URL gambar:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        setLinkUrl('');
        setIsLinkOpen(false);
    };

    const colors = [
        '#000000',
        '#434343',
        '#666666',
        '#999999',
        '#b7b7b7',
        '#cccccc',
        '#d9d9d9',
        '#efefef',
        '#f3f3f3',
        '#ffffff',
        '#980000',
        '#ff0000',
        '#ff9900',
        '#ffff00',
        '#00ff00',
        '#00ffff',
        '#4a86e8',
        '#0000ff',
        '#9900ff',
        '#ff00ff',
        '#ff8002',
        '#123e87',
    ];

    return (
        <div className="w-full overflow-hidden rounded-md border border-primary bg-transparent dark:bg-input/30">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <div className="flex flex-wrap items-center gap-1 border-b bg-input/30 p-2">
                {/* History */}
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <Undo className="h-4 w-4" />
                </Button>

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <Redo className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Headings Dropdown */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" title="Heading">
                            <Heading className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                                <Heading1 className="h-4 w-4" />
                                Heading 1
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                                <Heading2 className="h-4 w-4" />
                                Heading 2
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                                <Heading3 className="h-4 w-4" />
                                Heading 3
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.chain().focus().setParagraph().run()}>
                                <Pilcrow className="h-4 w-4" />
                                Paragraph
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Text Formatting */}
                <Button type="button" variant={editor.isActive('bold') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('strike') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('code') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    title="Code Block"
                >
                    <CodeSquare className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('underline') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('highlight') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* ... rest of your toolbar buttons ... */}
                {/* Link, Color, Alignment, Lists, Table, Image, etc. - tetap sama seperti sebelumnya */}

                {/* Link */}
                <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
                    <PopoverTrigger asChild>
                        <Button type="button" variant={editor.isActive('link') ? 'default' : 'ghost'} size="sm" title="Add Link">
                            <Link2 className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="link-url"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && setLink()}
                                />
                                <Button type="button" onClick={setLink}>
                                    Set
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove Link">
                    <Unlink className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Color Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" title="Text Color">
                            <Palette className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="grid grid-cols-10 gap-1">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="h-6 w-6 rounded border transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                    title={color}
                                />
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => editor.chain().focus().unsetColor().run()}>
                            Reset Color
                        </Button>
                    </PopoverContent>
                </Popover>

                {/* Subscript & Superscript */}
                <Button
                    type="button"
                    variant={editor.isActive('superscript') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    title="Superscript"
                >
                    <SuperscriptIcon className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('subscript') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    title="Subscript"
                >
                    <SubscriptIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Text Alignment */}
                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Lists */}
                <Button
                    type="button"
                    variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line">
                    <Minus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Table */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant={editor.isActive('table') ? 'default' : 'ghost'} size="sm" title="Table">
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
                        <div className="flex flex-col gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                            >
                                Insert Table (3x3)
                            </Button>
                            <Separator className="my-1" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                                disabled={!editor.can().addColumnBefore()}
                            >
                                Add Column Before
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                disabled={!editor.can().addColumnAfter()}
                            >
                                Add Column After
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                disabled={!editor.can().deleteColumn()}
                            >
                                Delete Column
                            </Button>
                            <Separator className="my-1" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().addRowBefore().run()}
                                disabled={!editor.can().addRowBefore()}
                            >
                                Add Row Before
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                disabled={!editor.can().addRowAfter()}
                            >
                                Add Row After
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                disabled={!editor.can().deleteRow()}
                            >
                                Delete Row
                            </Button>
                            <Separator className="my-1" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                disabled={!editor.can().deleteTable()}
                            >
                                Delete Table
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().mergeCells().run()}
                                disabled={!editor.can().mergeCells()}
                            >
                                Merge Cells
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => editor.chain().focus().splitCell().run()}
                                disabled={!editor.can().splitCell()}
                            >
                                Split Cell
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="min-h-8" />

                {/* Image */}
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} title="Upload Image">
                    <ImagePlus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="min-h-8" />

                {/* More Options */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1">
                        <div className="flex flex-col gap-1">
                            <Button type="button" variant="ghost" size="sm" className="justify-start" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                                <RemoveFormatting className="mr-2 h-4 w-4" />
                                Clear Format
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="justify-start" onClick={addImageFromUrl}>
                                <Link2 className="mr-2 h-4 w-4" />
                                Image from URL
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-b border-primary px-3 py-1.5 text-xs text-muted-foreground">
                <span>{wordCount} kata</span>
                <span>{charCount} karakter</span>
            </div>

            <EditorContent className="max-h-[calc(100vh-180px)] overflow-auto" editor={editor} />
        </div>
    );
};

export default Tiptap;
