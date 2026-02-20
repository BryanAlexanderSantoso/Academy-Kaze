import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Lightbulb } from 'lucide-react';

interface MarkdownContentProps {
    content: string;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    const handleCopy = () => {
        const code = String(children).replace(/\n$/, '');
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (inline) {
        return (
            <code className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black text-sm" {...props}>
                {children}
            </code>
        );
    }

    return (
        <div className="relative group my-8">
            <div className="absolute right-6 top-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleCopy}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-white/70 transition-all border border-white/10 active:scale-95"
                >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
            </div>
            <div className="rounded-[40px] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-black/5">
                <SyntaxHighlighter
                    language={language || 'text'}
                    style={shadesOfPurple}
                    customStyle={{
                        margin: 0,
                        padding: '2.5rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.7',
                        background: '#0f172a',
                    }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    return (
        <div className="prose max-w-none custom-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeBlock,
                    blockquote: ({ children }) => (
                        <div className="my-10 p-8 bg-gradient-to-br from-gray-50 to-white border-l-8 border-red-400 rounded-r-[40px] flex gap-6 items-start relative overflow-hidden shadow-sm ring-1 ring-gray-100 italic">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                <Lightbulb size={120} className="text-red-500" />
                            </div>
                            <div className="p-4 bg-red-50 rounded-[20px] text-red-500 shrink-0 shadow-sm">
                                <Lightbulb size={24} />
                            </div>
                            <div className="text-gray-600 font-medium leading-relaxed prose-p:my-0">
                                {children}
                            </div>
                        </div>
                    ),
                    h1: ({ children }) => (
                        <div className="mt-16 mb-8 border-b border-gray-100 pb-6">
                            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                                {children}
                            </h1>
                        </div>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase mt-12 mb-6 text-gray-800 flex items-center gap-4">
                            <span className="w-8 h-1 bg-indigo-600 rounded-full inline-block"></span>
                            {children}
                        </h2>
                    ),
                    p: ({ children }) => (
                        <p className="text-lg text-gray-600 font-medium italic leading-relaxed mb-8">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="space-y-4 mb-8 ml-4">
                            {children}
                        </ul>
                    ),
                    li: ({ children }) => (
                        <li className="flex items-start gap-4 text-gray-600 font-medium italic text-lg">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 mt-3 shrink-0"></span>
                            <span>{children}</span>
                        </li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-black text-gray-900 uppercase tracking-tight mx-1">
                            {children}
                        </strong>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 font-black underline underline-offset-8 decoration-indigo-200 hover:decoration-indigo-600 transition-all italic"
                        >
                            {children}
                        </a>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
