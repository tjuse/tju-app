import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { builtInLinks } from "@/features/links/builtin-links";

export const metadata = { title: "常用链接" };

export default function LinksPage() {
  // 按分类分组
  const grouped = builtInLinks.reduce<Record<string, typeof builtInLinks>>((acc, link) => {
    const cat = link.category ?? "其他";
    const bucket = acc[cat] ?? [];
    bucket.push(link);
    acc[cat] = bucket;
    return acc;
  }, {});

  return (
    <>
      <Header title="常用链接" subtitle="天津大学校内高频入口" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([category, links], gi) => (
            <FadeIn key={category} delay={gi * 0.05}>
              <section>
                <h3 className="mb-3 font-medium text-[13px] text-[var(--color-text-mid)] uppercase tracking-wider">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <Card className="card-interactive flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--color-text-high)] text-sm">
                            {link.title}
                          </p>
                          <p className="truncate text-[12px] text-[var(--color-text-low)]">
                            {new URL(link.url).hostname}
                          </p>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-[var(--color-text-low)] transition-colors group-hover:text-[var(--color-accent)]" />
                      </Card>
                    </a>
                  ))}
                </div>
              </section>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  );
}
