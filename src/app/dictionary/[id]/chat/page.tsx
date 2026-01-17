import Chat from "@/src/dictionary/components/Chat";
import { ThemeProvider } from "next-themes";

interface ChatPageProps {
    searchParams?: {
        cardId?: string;
        cardType?: string;
    };
}

export default function ChatPage({ searchParams }: ChatPageProps) {
    return (
        <div>
            <ThemeProvider attribute="class" defaultTheme="light">
                <Chat cardId={searchParams?.cardId} cardType={searchParams?.cardType} />
            </ThemeProvider>
        </div>
    );
}
