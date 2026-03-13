import { Send } from 'lucide-react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getInitials } from '@/lib/service';

export type MentionUser = {
    id: number;
    name: string;
    avatar?: string | null;
};

type CommentComposerProps = {
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
    processing?: boolean;
    mentionUsers?: MentionUser[];
    onSubmit: (comment: string) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
};

export function CommentComposer({
    placeholder = 'Tulis komentar... Ketik @ untuk mention anggota tim',
    initialValue = '',
    submitLabel = 'Kirim',
    processing = false,
    mentionUsers = [],
    onSubmit,
    onCancel,
    autoFocus = false,
}: CommentComposerProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
    const [value, setValue] = React.useState(initialValue);
    const [mentionQuery, setMentionQuery] = React.useState<string | null>(null);
    const [mentionStart, setMentionStart] = React.useState<number>(0);
    const [selectedMentionIdx, setSelectedMentionIdx] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const mentionResults = React.useMemo(() => {
        if (mentionQuery === null) return [];
        return mentionUsers.filter((u) => u.name.toLowerCase().includes(mentionQuery.toLowerCase()));
    }, [mentionQuery, mentionUsers]);

    const showMentionDropdown = mentionQuery !== null && mentionResults.length > 0;

    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    React.useEffect(() => {
        if (autoFocus) textareaRef.current?.focus();
    }, [autoFocus]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newVal = e.target.value;
        const cursor = e.target.selectionStart ?? 0;
        setValue(newVal);

        // Detect @mention: look backwards from cursor for "@"
        const textToCursor = newVal.slice(0, cursor);
        const match = textToCursor.match(/@(\w*)$/);
        if (match) {
            setMentionQuery(match[1]);
            setMentionStart(cursor - match[0].length);
            setSelectedMentionIdx(0);
        } else {
            setMentionQuery(null);
        }
    }

    function insertMention(user: MentionUser) {
        const before = value.slice(0, mentionStart);
        const after = value.slice(textareaRef.current?.selectionStart ?? mentionStart);
        const mention = `@${user.name} `;
        const newVal = before + mention + after;
        setValue(newVal);
        setMentionQuery(null);

        // Move cursor to after inserted mention
        const newCursor = mentionStart + mention.length;
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(newCursor, newCursor);
        });
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (showMentionDropdown) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedMentionIdx((i) => Math.min(i + 1, mentionResults.length - 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedMentionIdx((i) => Math.max(i - 1, 0));
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(mentionResults[selectedMentionIdx]);
                return;
            }
            if (e.key === 'Escape') {
                setMentionQuery(null);
                return;
            }
        }

        // Ctrl/Cmd + Enter submits
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleSubmit() {
        const trimmed = value.trim();
        if (!trimmed || processing) return;
        onSubmit(trimmed);
        setValue('');
        setMentionQuery(null);
    }

    return (
        <div className="relative space-y-2">
            {/* Mention dropdown */}
            {showMentionDropdown && (
                <div className="absolute bottom-full left-0 z-50 mb-1 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                    {mentionResults.map((user, idx) => (
                        <button
                            key={user.id}
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                                idx === selectedMentionIdx ? 'bg-muted' : ''
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                insertMention(user);
                            }}
                        >
                            <Avatar className="h-6 w-6 rounded-full">
                                <AvatarImage src={`${R2_PUBLIC_URL}/${user.avatar}`} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 pt-0.5 text-[12px] text-primary">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-primary bg-input/30 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={2}
                    className="block w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm outline-none placeholder:text-muted-foreground"
                />

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                        <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Ctrl</kbd>
                        {' + '}
                        <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Enter</kbd>
                        {' untuk kirim'}
                    </p>
                    <div className="flex items-center gap-2">
                        {onCancel && (
                            <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={processing}>
                                Batal
                            </Button>
                        )}
                        <Button type="button" disabled={!value.trim() || processing} onClick={handleSubmit} className="gap-1.5">
                            {processing ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
