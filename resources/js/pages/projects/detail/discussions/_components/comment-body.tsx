export function CommentBody({ text }: { text: string }) {
    const parts = text.split(/(@\w+(?:\s\w+)*)/g);

    return (
        <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
            {parts.map((part, i) =>
                part.startsWith('@') ? (
                    <span key={i} className="font-medium text-primary">
                        {part}
                    </span>
                ) : (
                    part
                ),
            )}
        </p>
    );
}
