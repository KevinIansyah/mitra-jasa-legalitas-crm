import { Node, mergeAttributes } from '@tiptap/core';

export const ImageCaption = Node.create({
    name: 'imageCaption',
    group: 'block',
    content: 'inline*',
    draggable: false,

    parseHTML() {
        return [{ tag: 'figcaption' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'figcaption',
            mergeAttributes(HTMLAttributes, {
                class: 'text-center text-sm text-muted-foreground mt-1 italic',
            }),
            0,
        ];
    },

    addKeyboardShortcuts() {
        return {
            Enter: ({ editor }) => {
                if (!editor.isActive('imageCaption')) return false;
                return editor.commands.exitCode();
            },
        };
    },
});

export const ImageFigure = Node.create({
    name: 'imageFigure',
    group: 'block',
    content: 'image imageCaption',
    draggable: true,
    isolating: true,

    parseHTML() {
        return [{ tag: 'figure' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'figure',
            mergeAttributes(HTMLAttributes, {
                class: 'flex flex-col items-center my-4',
            }),
            0,
        ];
    },
});
