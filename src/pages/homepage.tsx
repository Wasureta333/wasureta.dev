"use client"

import { useEffect, useRef, useState } from "react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

/**
 * FIX THEME SCOPE
 * - Alcune section restavano chiare perché la classe `dark` non era un ancestor diretto dello scroller.
 * - Aggiungo un wrapperRef e un MutationObserver che *rispecchia* la presenza di `dark` su <html> anche sul wrapper della pagina.
 *   Così tutte le `dark:` utilities funzionano, indipendentemente da come il toggler applica la classe.
 * - Ho anche sistemato un refuso `bg-zync` -> `bg-neutral-300/80` e un `dark:text-black` -> `dark:text-flash`.
 */

export default function HomePage() {
  const [active, setActive] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sectionRefs = useRef<Array<HTMLElement | null>>([])

  const scrollTo = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    const htmlEl = document.documentElement

    // 1) Sincronizza stato locale con la classe su <html>
    const syncDark = () => {
      const d = htmlEl.classList.contains("dark")
      setIsDark(d)
      // mirror anche sul wrapper (utile se Tailwind è scoping-agnostic)
      wrapperRef.current?.classList.toggle("dark", d)
    }
    syncDark()
    const mo = new MutationObserver(syncDark)
    mo.observe(htmlEl, { attributes: true, attributeFilter: ["class"] })

    // 2) blocca lo scroll su <html> e <body> mentre sei in Home
    const prev = {
      htmlX: htmlEl.style.overflowX,
      htmlY: htmlEl.style.overflowY,
      bodyX: document.body.style.overflowX,
      bodyY: document.body.style.overflowY,
    }
    htmlEl.style.overflowX = "hidden"
    htmlEl.style.overflowY = "hidden"
    document.body.style.overflowX = "hidden"
    document.body.style.overflowY = "hidden"

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = sectionRefs.current.findIndex((el) => el === visible.target)
        if (idx !== -1) setActive(idx)
      },
      { root: containerRef.current, threshold: [0.55] },
    )

    sectionRefs.current.forEach((el) => el && obs.observe(el))

    return () => {
      obs.disconnect()
      mo.disconnect()
      htmlEl.style.overflowX = prev.htmlX
      htmlEl.style.overflowY = prev.htmlY
      document.body.style.overflowX = prev.bodyX
      document.body.style.overflowY = prev.bodyY
    }
  }, [])

  return (
    // full-bleed e niente overflow X — wrapperRef per scoping della dark mode
    <div ref={wrapperRef} className="w-[100dvw] mx-[calc(50%-50dvw)] overflow-x-hidden">
      {/* indicatori: attivo pieno, altri dim. Light/Dark - hidden on mobile, visible on lg+ */}
      <div className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[9999] hidden md:flex flex-col gap-3 lg:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-current={active === i ? "true" : "false"}
            aria-label={`Vai alla sezione ${i + 1}`}
            className={
              `w-2 h-8 lg:w-2.5 lg:h-10 rounded-[12px] transition-all duration-500 ease-out ` +
              (active === i
                ? isDark
                  ? "bg-flash scale-110"
                  : "bg-neutral-900 scale-110"
                : isDark
                  ? "bg-zync hover:scale-105"
                  : "bg-zync/40 hover:scale-105")
            }
          />
        ))}
      </div>

      {/* scroller: snap verticale, niente overscroll, scrollbar NASCOSTA */}
      <div
        ref={containerRef}
        className="h-dvh w-full overflow-y-scroll overscroll-none snap-y snap-mandatory scrollbar-hide"
      >
        {/* SECTION 1 */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el
          }}
          className={
            `snap-start h-dvh flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-24 px-6 md:px-12 lg:px-0 ` +
            (isDark ? "bg-liquirice text-flash" : "bg-white text-neutral-900")
          }
        >
          <div className="flex-col justify-start items-start text-left w-full lg:w-[30%]">
            <span
              className={`font-mono text-sm md:text-md animate-fade-in delay-100 ${isDark ? "text-cement" : "text-neutral-500"}`}
            >
              {" "}
              PORTFOLIO / 2025{" "}
            </span>
            <div
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light animate-fade-in-up delay-200 ${isDark ? "text-flash" : "text-neutral-900"}`}
            >
              Marco
            </div>
            <div
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light animate-fade-in-up delay-300 ${isDark ? "text-cement" : "text-neutral-800"}`}
            >
              Lana
            </div>
            <div
              className={`text-base md:text-lg lg:text-xl font-light mt-4 md:mt-6 lg:mt-8 animate-fade-in-up delay-400 ${isDark ? "text-cement" : "text-neutral-700"}`}
            >
              Full-stack developer specialized in React and Microsoft Power Platform, crafting design-driven products
              end to end.
            </div>

            <div
              className={`font-light flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-[15px] mt-3 md:mt-4 animate-fade-in-up delay-500 ${isDark ? "text-cement" : "text-neutral-700"}`}
            >
              <div className="space-x-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="leading-none">Available for work</span>
              </div>

              <span className="leading-none">Italy</span>
            </div>
          </div>

          <div className="text-left space-y-6 md:space-y-8 w-full lg:w-auto">
            <div className="animate-slide-in-right delay-300">
              <span className={`font-mono text-xs md:text-sm ${isDark ? "text-cement" : "text-neutral-500"}`}> CURRENTLY </span>
              <div className={`mt-2 md:mt-4 text-sm md:text-base ${isDark ? "text-flash" : "text-neutral-900"}`}> Technical Consultant </div>
              <div className={`mt-1 md:mt-2 text-sm md:text-base ${isDark ? "text-cement" : "text-neutral-700"}`}> @ Aubay Italy </div>
              <div className={`mt-1 text-xs md:text-sm ${isDark ? "text-cement" : "text-neutral-500"}`}>
                {" "}
                2025 - Present{" "}
              </div>
            </div>

            <div className="space-y-2 animate-slide-in-right delay-500">
              <span className={`font-mono text-xs md:text-sm ${isDark ? "text-cement" : "text-neutral-500"}`}> FOCUS </span>
              <div className="flex flex-wrap gap-2">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className={
                    isDark
                      ? "bg-black text-white flex items-center space-x-2 text-[10px]"
                      : "bg-neutral-900 text-white flex items-center space-x-2 text-[10px]"
                  }
                >
                  <span>React</span>
                </HoverBorderGradient>
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className={
                    isDark
                      ? "bg-black text-white flex items-center space-x-2 text-[10px]"
                      : "bg-neutral-900 text-white flex items-center space-x-2 text-[10px]"
                  }
                >
                  <span>Power Automate</span>
                </HoverBorderGradient>
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className={
                    isDark
                      ? "bg-black text-white flex items-center space-x-2 text-[10px]"
                      : "bg-neutral-900 text-white flex items-center space-x-2 text-[10px]"
                  }
                >
                  <span>Power Apps</span>
                </HoverBorderGradient>
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className={
                    isDark
                      ? "bg-black text-white flex items-center space-x-2 text-[10px]"
                      : "bg-neutral-900 text-white flex items-center space-x-2 text-[10px]"
                  }
                >
                  <span>Typescript</span>
                </HoverBorderGradient>
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className={
                    isDark
                      ? "bg-black text-white flex items-center space-x-2 text-[10px]"
                      : "bg-neutral-900 text-white flex items-center space-x-2 text-[10px]"
                  }
                >
                  <span>C#</span>
                </HoverBorderGradient>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el
          }}
          className={`snap-start min-h-dvh ` + (isDark ? "bg-pine text-flash" : "bg-neutral-50 text-neutral-900")}
        >
          <div className="w-full lg:w-[80%] xl:w-[60%] mx-auto px-6 md:px-8 min-h-dvh flex flex-col justify-center gap-4 md:gap-6 py-12 md:py-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 animate-fade-in-up delay-100">
              <span className={`font-light text-2xl md:text-3xl lg:text-4xl ${isDark ? "text-flash" : "text-neutral-900"}`}>Experiences</span>
              <span className={`font-mono text-sm md:text-base ${isDark ? "text-cement" : "text-neutral-500"}`}>2018 - 2025</span>
            </div>

            <div
              className={`border-b w-full pb-6 md:pb-8 mt-6 md:mt-12 animate-fade-in-up delay-200 ${isDark ? "border-flash/10" : "border-neutral-200"}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 md:gap-12 lg:gap-24">
                  <span className={`font-thin text-xl md:text-2xl ${isDark ? "text-cement" : "text-neutral-500"}`}>2025</span>
                  <div className="text-left">
                    <span className={`font-semibold text-lg md:text-xl ${isDark ? "text-flash" : "text-neutral-900"}`}>
                      Fullstack Developer
                    </span>
                    <div className={`font-normal text-sm md:text-md ${isDark ? "text-cement" : "text-neutral-700"}`}>
                      loldata.cc
                    </div>

                    <div className={`font-normal text-sm md:text-md w-full md:w-[90%] lg:w-[70%] mt-3 md:mt-4 ${isDark ? "text-cement" : "text-neutral-700"}`}>
                      Delivering full-stack work with ongoing DB stewardship, and building a bespoke AI for player
                      performance coaching.
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap gap-2 md:gap-4 text-xs shrink-0 ${isDark ? "text-cement" : "text-neutral-600"}`}
                >
                  <span>React</span>
                  <span>Typescript</span>
                  <span>SQL</span>
                </div>
              </div>
            </div>

            <div
              className={`border-b w-full pb-6 md:pb-8 mt-6 md:mt-12 animate-fade-in-up delay-400 ${isDark ? "border-flash/10" : "border-neutral-200"}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 md:gap-12 lg:gap-24">
                  <span className={`font-thin text-xl md:text-2xl ${isDark ? "text-cement" : "text-neutral-500"}`}>2025</span>
                  <div className="text-left">
                    <span className={`font-semibold text-lg md:text-xl ${isDark ? "text-flash" : "text-neutral-900"}`}>
                      Technical Consultant
                    </span>
                    <div className={`font-normal text-sm md:text-md ${isDark ? "text-cement" : "text-neutral-700"}`}>Aubay</div>

                    <div className={`font-normal text-sm md:text-md w-full md:w-[90%] lg:w-[70%] mt-3 md:mt-4 ${isDark ? "text-cement" : "text-neutral-700"}`}>
                      Building and maintaining Power Automate solutions for banks from flow design to end-to-end
                      automation.
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap gap-2 md:gap-4 text-xs shrink-0 ${isDark ? "text-cement" : "text-neutral-600"}`}
                >
                  <span>Power Automate Desktop</span>
                  <span>Power Apps</span>
                </div>
              </div>
            </div>

            <div
              className={`border-b w-full pb-6 md:pb-8 mt-6 md:mt-12 animate-fade-in-up delay-600 ${isDark ? "border-flash/10" : "border-neutral-200"}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 md:gap-12 lg:gap-24">
                  <span className={`font-thin text-xl md:text-2xl ${isDark ? "text-cement" : "text-neutral-500"}`}>2024</span>
                  <div className="text-left">
                    <span className={`font-semibold text-lg md:text-xl ${isDark ? "text-flash" : "text-neutral-900"}`}>
                      Software Developer
                    </span>
                    <div className={`font-normal text-sm md:text-md ${isDark ? "text-cement" : "text-neutral-700"}`}>
                      Horsa Way
                    </div>

                    <div className={`font-normal text-sm md:text-md w-full md:w-[90%] lg:w-[70%] mt-3 md:mt-4 ${isDark ? "text-cement" : "text-neutral-700"}`}>
                      Developed and maintained .NET MAUI applications connected to an ERP, including ongoing database
                      maintenance and optimization.
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap gap-2 md:gap-4 text-xs shrink-0 ${isDark ? "text-cement" : "text-neutral-600"}`}
                >
                  <span>C#</span>
                  <span>.NET</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el
          }}
          className={
            `snap-start h-dvh flex items-center justify-center ` +
            (isDark ? "bg-pine text-flash" : "bg-neutral-50 text-neutral-900")
          }
        >
          <div className="text-3xl font-bold animate-fade-in-scale delay-200">Sezione 3</div>
        </section>

        {/* SECTION 4 */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el
          }}
          className={
            `snap-start min-h-dvh flex items-center py-12 md:py-0 ` + (isDark ? "bg-jade text-cement" : "bg-neutral-100 text-neutral-800")
          }
        >
          {/* wrapper centrato, come section 2 */}
          <div className="w-full lg:w-[80%] xl:w-[55%] mx-auto px-6 md:px-8 flex flex-col">
            {/* riga top */}
            <div
              className={`flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 pb-12 md:pb-24 lg:pb-44 border-b ` + (isDark ? "border-flash/10" : "border-neutral-200")}
            >
              <div className="space-y-4 md:space-y-6 lg:space-y-8 text-left w-full lg:w-[45%] animate-slide-in-left delay-100">
                <span className={`font-light text-2xl md:text-3xl lg:text-4xl ` + (isDark ? "text-flash" : "text-neutral-900")}>
                  Let's Connect
                </span>
                <div className={`text-base md:text-lg lg:text-xl ` + (isDark ? "text-cement" : "text-neutral-600")}>
                  Always interested in new opportunities, collaborations, and conversations about technology and design.
                </div>
                <div className={`text-sm md:text-md break-all ` + (isDark ? "text-flash" : "text-neutral-900")}>marco.lana001@gmail.com</div>
              </div>
              <div className="text-left w-full lg:w-[45%] animate-slide-in-right delay-200">
                <span className={`text-xs md:text-sm font-mono ` + (isDark ? "text-cement" : "text-neutral-500")}>ELSEWHERE</span>

                <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4">
                  <a
                    href="https://github.com/wasureta333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 md:gap-4 border border-flash/10 hover:border-flash/20 p-3 md:p-5 rounded-[10px] transition-all duration-300 hover:scale-105 animate-fade-in-scale delay-400"
                    aria-label="Apri il profilo GitHub di wasureta333"
                  >
                    <p className="text-sm md:text-base text-flash group-hover:text-cement transition-colors">GitHub</p>
                    <p className="text-xs md:text-sm text-cement">@wasureta333</p>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/marco-lana-2442bb245/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 md:gap-4 border border-flash/10 hover:border-flash/20 p-3 md:p-5 rounded-[10px] transition-all duration-300 hover:scale-105 animate-fade-in-scale delay-500"
                    aria-label="Apri il profilo LinkedIn di marco-lana"
                  >
                    <p className="text-sm md:text-base text-flash group-hover:text-cement transition-colors">Linkedin</p>
                    <p className="text-xs md:text-sm text-cement">marco-lana</p>
                  </a>
                  <a
                    href="https://github.com/wasureta333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 md:gap-4 border border-flash/10 hover:border-flash/20 p-3 md:p-5 rounded-[10px] transition-all duration-300 hover:scale-105 animate-fade-in-scale delay-600"
                    aria-label="Apri il profilo GitHub di wasureta333"
                  >
                    <p className="text-sm md:text-base text-flash">GitHub</p>
                    <p className="text-xs md:text-sm text-cement">@wasureta333</p>
                  </a>
                  <a
                    href="https://github.com/wasureta333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 md:gap-4 border border-flash/10 hover:border-flash/20 p-3 md:p-5 rounded-[10px] transition-all duration-300 hover:scale-105 animate-fade-in-scale delay-700"
                    aria-label="Apri il profilo LinkedIn"
                  >
                    <p className="text-sm md:text-base text-flash">Linkedin</p>
                    <p className="text-xs md:text-sm text-cement">marco-lana</p>
                  </a>
                </div>
              </div>
            </div>

            {/* blocco sotto */}
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 animate-fade-in delay-800">
              <div className="text-left space-y-1.5 md:space-y-2.5">
                <p className={`text-xs md:text-sm ${isDark ? "text-cement" : "text-neutral-600"}`}>
                  © 2025 Marco Lana. All rights reserved.
                </p>
                <p className={`text-xs ${isDark ? "text-cement/50" : "text-neutral-400"}`}>
                  Built in Oct. 2025 with love
                </p>
              </div>
              <div>
                <div
                  className={
                    `rounded-[10px] p-0.5 border transition-all duration-300 hover:scale-110 ` +
                    (isDark ? "border-zync" : "border-neutral-300")
                  }
                >
                  {/* Toggler piccolo */}
                  <AnimatedThemeToggler className="inline-flex items-center justify-center h-6 w-6 p-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:stroke-[2]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
