import type { ComponentProps } from "react";
import NextLink from "next/link";
import { STATIC_EXPORT, hrefFor } from "@/lib/href";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/** Link, der in der Offline-Version (file://) auf relative .html-Dateien zeigt. */
export default function SiteLink({ href, prefetch, replace, scroll, ...rest }: Props) {
  void prefetch;
  void replace;
  void scroll;
  if (STATIC_EXPORT) return <a href={hrefFor(href)} {...(rest as ComponentProps<"a">)} />;
  return <NextLink href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...rest} />;
}
