
import Chat from "@/src/dictionary/components/Chat";
import { ThemeProvider } from "next-themes";

export default function ChatPage() {
    const dictionaryId = process.env.NEXT_PUBLIC_DICTIONARY_ID;

    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <Chat dictionaryId={dictionaryId} />
        </ThemeProvider>
    );
}
