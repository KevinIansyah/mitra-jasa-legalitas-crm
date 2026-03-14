import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type FaqItem = { question: string; answer: string };

type FaqEditorProps = {
    faqs: FaqItem[];
    onChange: (faqs: FaqItem[]) => void;
};

export function FaqEditor({ faqs, onChange }: FaqEditorProps) {
    const [questionInput, setQuestionInput] = useState('');

    const addFaq = () => {
        const trimmed = questionInput.trim();
        if (!trimmed) return;
        onChange([...faqs, { question: trimmed, answer: '' }]);
        setQuestionInput('');
    };

    const updateFaq = (index: number, patch: Partial<FaqItem>) => {
        onChange(faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, ...patch } : faq)));
    };

    const deleteFaq = (index: number) => {
        onChange(faqs.filter((_, faqIndex) => faqIndex !== index));
    };

    return (
        <div className="space-y-3">
            {faqs.map((faq, index) => (
                <div key={index} className="space-y-4 rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">FAQ #{index + 1}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={() => deleteFaq(index)}>
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hapus FAQ</TooltipContent>
                        </Tooltip>
                    </div>

                    <Input value={faq.question} onChange={(event) => updateFaq(index, { question: event.target.value })} placeholder="Pertanyaan..." />

                    <Textarea
                        value={faq.answer}
                        onChange={(event) => updateFaq(index, { answer: event.target.value })}
                        placeholder="Jawaban..."
                        className="min-h-20 resize-none"
                        rows={3}
                    />
                </div>
            ))}

            <div className="flex gap-2">
                <Input
                    value={questionInput}
                    onChange={(event) => setQuestionInput(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addFaq())}
                    placeholder="Ketik pertanyaan lalu Enter atau klik tambah..."
                    className="flex-1"
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="icon" onClick={addFaq}>
                            <Plus className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tambah FAQ</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
