"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

/**
 * Questions, answered with the shipped behaviour rather than marketing.
 *
 * Radix supplies the a11y contract (button headers, `aria-expanded`,
 * `aria-controls`, arrow-key movement). The height animation reads
 * `--radix-accordion-content-height`, which is the only way to animate an
 * unknown content height without measuring it in JS — and the reason the
 * project does not need `tw-animate-css`.
 *
 * The trigger wrapper injects a default chevron after the children; the
 * landing section keeps its own plus/minus `.faq-mark` glyph, so the
 * chevron is hidden via `[&>svg]:hidden` (the mark is a <span>, not an svg).
 */

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Do I need a Google account?",
    answer:
      "No. You can sign in with Google, or create an email account with a password — and any account can sign in with a 6-digit code emailed to it instead of a password. Whichever way in, the workspace stays private: no guest mode, no shared account, no administrator view.",
  },
  {
    question: "Does it handle sectional and subject mocks?",
    answer:
      "Full mocks, single-subject mocks, and sectionals (Quant + Reasoning, or English + General Awareness). Computer Knowledge is optional on a full mock: its 60 marks are scored separately from the 390, and its time still counts in your total.",
  },
  {
    question: "What if I attempt a mock on a different day than scheduled?",
    answer:
      "The attempt date is what the tracker records, and history, filters and every chart use it. Logging an attempt never moves or completes a plan task, so the schedule stays exactly where it was.",
  },
  {
    question: "Can I move my data to another account?",
    answer:
      "Export a JSON backup, sign in with the other account, and import it. The file carries no email, user ID or credentials. Merge keeps what is already there and skips exact duplicates; replace asks for a fresh safety backup and a confirmation naming the account before it deletes anything.",
  },
  {
    question: "What if I forget my password?",
    answer:
      "Request a code on the reset page and set a new password against it — the same code path also sets a first password on a Google-only account. Your data is untouched by a reset: attempts, plan progress and targets stay exactly where they were.",
  },
  {
    question: "Do I have to configure the AI?",
    answer:
      "No. The coach is optional and stays hidden until a provider is configured. You can enter your own key in Settings or in the panel itself; it is encrypted before storage, shown back only as its last four characters, and excluded from backups. Every table, chart, comparison and plan day works without it.",
  },
  {
    question: "How is the score calculated?",
    answer:
      "Three marks for a correct answer, one lost for an incorrect one, and nothing for a question left blank. A full mock is out of 390 — Quant 30, Reasoning 30, English 45 and General Awareness 25 questions — and a subject or sectional mock is out of three times its own question count.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="mt-10">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="faq-item border-b-0"
        >
          <AccordionTrigger className="faq-trigger [&>svg]:hidden">
            <span>{item.question}</span>
            <span className="faq-mark" aria-hidden="true" />
          </AccordionTrigger>
          <AccordionContent className="faq-content">
            <div className="faq-answer">{item.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
