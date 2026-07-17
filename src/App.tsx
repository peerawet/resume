import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import PageOne from "./components/PageOne";
import PageTwo from "./components/PageTwo";

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Peerawet_Chursuk_Resume",
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-200 py-10 print:bg-white print:py-0">
      <button
        onClick={() => handlePrint()}
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-navy/90 print:hidden"
      >
        <Printer size={16} /> Print / Save PDF
      </button>

      <div ref={contentRef} className="flex flex-col items-center gap-10 print:gap-0">
        <PageOne />
        <PageTwo />
      </div>
    </div>
  );
}
