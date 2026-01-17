import Chat from "@/src/dictionary/components/Chat";
import { ThemeProvider } from "next-themes";

interface ChatPageProps {
    params: {
        id?: string;
    };
}

export default function ChatPage({ params }: ChatPageProps) {
    const dictionaryId = params?.id ?? process.env.NEXT_PUBLIC_DICTIONARY_ID;

    return (
        <div>
            <ThemeProvider attribute="class" defaultTheme="light">
                <Chat dictionaryId={dictionaryId} />
            </ThemeProvider>
        </div>
    );
}
