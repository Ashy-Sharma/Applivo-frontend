export default function Footer() {
    return(
        <footer className="w-full border-t border-outline-variant bg-surface-container-lowest">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="font-sans text-xs text-on-surface-variant">
                    Applivo — try Android apps in your browser, no install required.
                </p>
                <p className="font-sans text-xs text-tertiary">
                    Emulator sessions run in isolated Docker containers.
                </p>
            </div>
        </footer>
    );
}