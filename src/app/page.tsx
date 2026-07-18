import ResumeDocumentView from "@/components/resume/ResumeDocumentView";
import { contact, content } from "@/i18n";

/** Landing (MVP): แสดง resume ของเจ้าของจากข้อมูล static เดิมไปก่อน — plan §12 Q2 ยังเปิดอยู่ */
export default function Home() {
  return (
    <ResumeDocumentView
      doc={{ en: content.en, th: content.th, contact }}
      documentTitle="Peerawet_Chursuk_Resume"
    />
  );
}
