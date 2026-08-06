type Props = { html?: string; className?: string };
export default function RichTextContent({ html = "", className = "" }: Props) {
  return <div className={`whitespace-pre-wrap text-left [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
