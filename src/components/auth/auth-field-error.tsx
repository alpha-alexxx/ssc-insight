/**
 * The auth forms' shared error line, composed from tokens (the old
 * `FieldError` slot): `role="alert"` so server-side and form-level failures
 * reach screen readers, destructive ink, and nothing rendered when there is
 * no content — the same null-on-empty contract the shadcn field had.
 *
 * Field-level errors live inside the Hairline Input/PasswordInput `error`
 * prop (aria-describedby wiring comes with it); this line is for the
 * form-level and wire-level messages that sit outside any field.
 */
export function AuthFieldError({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`text-[12.5px] leading-snug text-destructive ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
