import { Faq } from "./faq";
import { EYEBROW } from "./section";

/** The same truthful answers, recomposed as Hairline's two-column FAQ. */
export function FaqSection() {
  return (
    <section id="faq" className="border-b border-border bg-background py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className={EYEBROW}>09 · Questions</p>
          <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
            The details, before you sign in.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Plain answers about accounts, scoring, the plan, optional AI and leaving with your data.
          </p>
        </div>
        <Faq />
      </div>
    </section>
  );
}
