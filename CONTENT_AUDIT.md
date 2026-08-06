# Content Audit — Rainfall Health Marketing Site

A text/content audit of the Rainfall Health marketing site, looking for clarity issues, voice inconsistencies, and writing that doesn't carry the weight of an enterprise B2B healthcare-compliance brand. Findings, rationale, and suggested rewrites — **no code has been changed by this audit**.

If you want any of these rewrites *applied* to the actual site copy, that's a separate, scoped pass — happy to do it page-by-page or all at once, with each change shown for sign-off before commit.

## Scope reviewed

- All marketing pages: `index.astro`, `raincompliant.astro`, `schedule-a-demo.astro`, all `/about/*` pages, both `/legal/*` pages
- Global components (`Header`, `Footer`, `Hero`, `MobileNavPanel`)
- Content data files: `site-config.ts`, `homepage-features.ts`, `rain-standards.ts`, `faq.ts`, `team-members.ts`, `company-values.ts`, `press-items.ts`, `page-index.ts`, `navigation.ts`
- Blog posts (5 published) + post metadata
- LLM endpoints (`llms.txt.ts`, `llms-full.txt.ts`)

---

# Findings

Findings are organized by severity. For each: **location → current copy → why it's a problem → suggested rewrite**.

## Tier 1 — Critical (brand/legal risk; fix first)

### 1.1 Stale "Effective Date" / "Last Updated" on both legal pages

**Where:** `src/pages/legal/privacypolicy.astro:6-7`, `src/pages/legal/terms.astro:6-7`
**Current:**
> Effective Date: January 1, 2024
> Last Updated: January 1, 2024

**Problem:** The site is live in 2026. Stale legal dates undermine credibility and create real risk — if you ever amend (the document already says "we may modify… we will provide notice of material changes at least 30 days before they take effect"), an outdated "Last Updated" muddies whether the update happened. For a HIPAA-regulated business associate this is a meaningful trust signal.

**Suggested rewrite:** Update to a real, current effective date once counsel signs off on the current text. If the policy text genuinely hasn't been touched since 2024, leave the original "Effective Date" but absolutely refresh "Last Updated" the next time anything is reviewed. Consider also adding a short version line like:
> **Version:** 1.1 — *Most recent change: clarified Section 5 (Data Security) on October 15, 2026.*

This is heavier than your average marketing copy task — recommend looping in legal before changing.

---

### 1.2 Entity-name inconsistency in Terms of Use

**Where:** `src/pages/legal/terms.astro`
**Current:**
- Line 33–35: *"…the exclusive property of **Bettermeant Inc. d/b/a Rainfall Health**…"*
- Line 55: *"…**Rainfall Health** shall not be liable for any indirect, incidental…"*
- Line 75: *"**Bettermeant Inc. d/b/a Rainfall Health**"* (contact block — correct)

The Privacy Policy uses only "Rainfall Health" throughout and never names the legal entity at all (`privacypolicy.astro:11, 92`).

**Problem:** A liability-limitation clause that names a different entity than the IP-ownership clause is a soft target for an opposing counsel. The Privacy Policy probably should also identify the data controller as "Bettermeant Inc. d/b/a Rainfall Health" so PHI complaints reach the right legal entity.

**Suggested rewrite (Terms §6):**
> *"To the fullest extent permitted by law, Bettermeant Inc. d/b/a Rainfall Health (\"Rainfall Health\") shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Services."*

Then introduce the parenthetical short form ("Rainfall Health") in §1 so the rest of the document can use the short form cleanly. Privacy Policy §1 should mirror that introduction pattern.

---

### 1.3 The "Crisis Lifeline" notice in the footer is off-brand and likely inappropriate

**Where:** `src/data/site-config.ts:13-14`, surfaced in `Footer.astro:137-138`
**Current:**
> *"If you are in a life threatening situation please call 911. Contact the Suicide and Crisis Lifeline at 988 for immediate assistance."*

**Problem:** This is verbatim crisis-line copy meant for **direct-to-patient mental-health products** (BetterHelp, Talkspace, Crisis Text Line, etc.). Rainfall Health is a **B2B compliance and reimbursement platform sold to hospital CFOs and CEOs**. The 988 hotline is for individuals in mental-health crisis; nothing on the site (homepage, RAIN Compliant page, About) addresses individuals seeking care, makes mental-health claims, or invites a patient-population user. The notice reads like template copy carried over from a different product positioning, and it actively damages enterprise credibility — your buyer is a hospital executive evaluating a regulatory tool, not a patient looking for help.

A second issue: the wording itself has an unhyphenated "life threatening" (should be "life-threatening") and a missing comma after "situation."

**Suggested action — three options, pick one:**

1. **Remove entirely** (recommended). The footer doesn't need it for a B2B compliance product. The legal pages already cover what needs covering.
2. **Replace with a contextually appropriate note** — e.g., *"Rainfall Health provides software and services to hospitals and is not a clinical care provider. Patients seeking medical care should contact their hospital or provider directly."*
3. **Keep but only on patient-facing pages** — there are none currently, so this collapses into option 1.

If kept anywhere, fix the grammar:
> *"If you are in a life-threatening situation, please call 911. Contact the Suicide and Crisis Lifeline at 988 for immediate assistance."*

---

### 1.4 Product name spelled inconsistently — `RainCompliant™` vs. `RAIN Compliant™`

**Where:**
- `src/data/faq.ts:68` — *"RainCompliant&trade; by Rainfall Health"*
- `src/data/faq.ts:78` — *"Who Helps to Inform RainCompliant™ Guidelines?"*
- `src/data/faq.ts:79` — *"the RainCompliant&trade; platform"*

Everywhere else (homepage, raincompliant page, page-index, terms of use, rain-standards, blog posts) uses **`RAIN Compliant™`** — two words, capital RAIN, space, capitalized Compliant. The FAQ is the only place that closes the gap and writes it as one word.

**Problem:** Inconsistent product naming reads as either sloppiness or a forgotten rename. The terms-of-use registers the trademark as **"RAIN Compliant"** (per `terms.astro:34`), so `RainCompliant™` is also legally weaker — you're claiming a mark in one place and using a different mark in another.

**Suggested rewrite:** In `faq.ts`, replace all three instances of `RainCompliant&trade;`/`RainCompliant™` with `RAIN Compliant™`. While there, also normalize the question:
> *Current:* "Who Helps to Inform RainCompliant™ Guidelines?"
> *Rewrite:* "Who shapes RAIN Compliant™ standards?"

(Title-case Q's read like an editorial style — see §3.5 below.)

---

### 1.5 Unverified superlative claim: "Rainfall Health is the Only Health Compliance Platform…"

**Where:** `src/pages/index.astro:117-119`
**Current:**
> *"Rainfall Health is the Only Health Compliance Platform With Everything You Need to Respond to the TEAM Model"*

**Problem:** "The Only" + "Everything You Need" is a doubly absolute claim that invites legal challenge under FTC truth-in-advertising rules (and is easily falsified as competitors enter the TEAM space — Premier, Signify, and others are all positioning here). This kind of headline reads as overreach to a CFO who has been pitched by three other vendors that week. Title-case-every-word also reads more 2014-marketing than 2026-enterprise.

**Suggested rewrite:**
> *"Built end-to-end for the CMS TEAM Model"*
> *(supporting line, smaller)* *"Compliance, reimbursement modeling, and an executive advisory committee — in one platform."*

Or, if you want to keep some of the "category-leading" energy without the absolute:
> *"The most complete platform for responding to the CMS TEAM Model"*

"Most complete" is defensible (it's a superlative of degree, not a uniqueness claim) and easier to substantiate.

---

### 1.6 Unverified specific dollar figure in hero

**Where:** `src/pages/index.astro:21`
**Current:**
> *"Rainfall Health helps CEOs and CFOs quantify, capture, and maximize TEAM incentives, unlocking up to $85M in new Medicare revenue over five years."*

**Problem:** A specific dollar figure without a source citation, on the homepage hero, is the highest-risk claim on the site. Two issues: (a) "$85M" implies an average or modal outcome but is presented as if applicable to any reader; (b) for a CMS-regulated activity, hospitals (and their compliance counsel) will treat unsourced revenue projections skeptically.

**Suggested rewrite** — either drop the figure or anchor it:
> *(option A, anchored)* *"…unlocking as much as $85M in new Medicare revenue over the five-year performance period for the largest mandated systems."*
> *(option B, qualified)* *"…with TEAM revenue impact ranging into the tens of millions over the five-year performance period for high-volume systems."*
> *(option C, removed)* *"…unlocking new Medicare revenue across the five-year performance period."*

I'd lean **option A** — preserves the wow-number, removes the implication that everyone gets $85M.

---

## Tier 2 — High priority (voice, clarity, professionalism)

### 2.1 Homepage hero — defensive opener

**Where:** `src/pages/index.astro:19-22`
**Current:**
> *Heading:* "TEAM isn't just a CMS mandate."
> *Highlight:* "It's a revenue opportunity most hospitals are missing."
> *Subtext:* "Rainfall Health helps CEOs and CFOs quantify, capture, and maximize TEAM incentives, unlocking up to $85M in new Medicare revenue over five years."

**Problem:** Negative-framed openers ("isn't just…") are weaker than affirmative ones because they presuppose a reader who already had the wrong frame. A CEO reading the headline cold doesn't have an "it's just a mandate" assumption to overturn. "Most hospitals are missing" is also a soft accusation against your audience — punching down at the reader is a poor way to open.

**Suggested rewrite:**
> *Heading:* "Turn the CMS TEAM mandate into measurable Medicare revenue."
> *Highlight:* *(remove — let the heading carry it)*
> *Subtext:* "Rainfall Health helps hospital CEOs and CFOs quantify, capture, and maximize TEAM incentives — anchored by an executive advisory committee and an EHR-integrated compliance platform."

Or, if you want to keep the contrast structure:
> *Heading:* "TEAM is a mandate. It's also the largest Medicare revenue shift in a decade."
> *Subtext:* (as rewritten in §1.6)

---

### 2.2 "Have Questions" CTA — colloquial drift

**Where:** `src/pages/index.astro:67-72` (and a near-duplicate at `raincompliant.astro:54-58`)
**Current:**
> *"Chat with one of our experts to answer your questions around the requirements and reimbursements."*
> *Button:* "Book Your Session Now"

**Problems:**
- *"Chat with"* — too casual for the audience (think CFO).
- *"answer your questions around"* — colloquialism; "around" is being used where "about" belongs.
- *"Book Your Session Now"* — trailing "Now" is high-pressure-marketing energy. The same CTA appears as just "Book a Session" on the RAIN Compliant page (line 58), so the site is also internally inconsistent.

**Suggested rewrite:**
> *Heading:* "Have questions about TEAM and how it affects your hospital?"
> *Body:* "Speak with one of our advisors to get answers specific to your facility's episode mix, mandate status, and reimbursement potential."
> *Button:* "Book a 9-minute consult" (or "Schedule a consultation" — pick one CTA verb and use it sitewide; see §2.7)

---

### 2.3 Advisory Committee blurb is duplicated and over-claimed

**Where:** `src/pages/index.astro:33-38` and verbatim at `raincompliant.astro:127` and similar at `meet-our-advisory-team.astro:21-23`
**Current:**
> *"This historic committee is made of select Healthcare Executives and Operators that will help create operational and technology frameworks for healthcare systems. The Advisory Committee provides strategic guidance to promote healthcare accessibility. By holding healthcare organizations accountable to measurable benchmarks, the Committee aims to use best operational practices for the betterment of all communities."*

**Problems:**
1. *"historic committee"* is unsubstantiated and overreaches — call something "historic" and your reader pattern-matches to puffery.
2. *"made of select Healthcare Executives and Operators that will help"* — grammar drift ("that" should be "who"); inconsistent capitalization ("Healthcare Executives" mid-sentence).
3. *"betterment of all communities"* is greeting-card prose, not enterprise B2B copy.
4. Duplicating the blurb verbatim across three pages means a single edit has to be made in three places — if these were a shared component (like `homepage-features.ts`), you'd avoid that. (Implementation note, not a copy fix per se.)

**Suggested rewrite** (canonical, then variants for each page):
> *"The RAIN Advisory Committee brings together health-system executives, CMIOs, and operators from organizations including Mayo Clinic, UPMC, UC Health, Kaiser Permanente, and the Department of Veterans Affairs. The committee shapes the operational and technology standards behind RAIN Compliant™ — and challenges them, so the framework reflects how hospitals actually run."*

This version names institutions (provable), positions the committee as governance for the product (not vague "betterment"), and switches to active verbs.

---

### 2.4 "Why It Matters" / RAIN Compliant hero subtext is a 90-word wall

**Where:** `src/pages/raincompliant.astro:24`
**Current:**
> *"The RAIN (Referral Accountability for Integrated Networks) Compliant™ standards are strategically designed for the Centers for Medicare & Medicaid Services (CMS) TEAM Model to empower health systems and healthcare provider groups to deliver superior patient care and maximum reimbursements. This framework ensures a structured approach that prioritizes efficiency and outcomes in healthcare. We go at-risk with you for a true partnership. CMS TEAM mandated model went into effect January 1, 2026."*

**Problems:**
- 90+ words across four sentences that could be three.
- *"strategically designed"* and *"empower"* and *"superior patient care"* are buzzword stacking.
- *"This framework ensures a structured approach that prioritizes efficiency and outcomes"* — this sentence says nothing.
- *"CMS TEAM mandated model went into effect January 1, 2026."* — grammatically broken (should be *"The CMS TEAM mandated model went into effect…"* or *"The CMS TEAM model became mandatory on…"*).

**Suggested rewrite:**
> *"RAIN — Referral Accountability for Integrated Networks — is a six-step framework built around the CMS TEAM Model, which became mandatory on January 1, 2026. It helps hospitals and provider groups deliver better surgical-episode outcomes and capture the reimbursements TEAM puts on the table. We share risk with our customers, because we believe a true partner has skin in the game."*

That's 65 words, three sentences, and keeps the "we go at-risk with you" line — that's actually the strongest sentence in the original, so it should stay (just less casually phrased).

---

### 2.5 RAIN Compliant Standards — buzzword density

**Where:** `src/data/rain-standards.ts`
**Current:**
- Step 2 *(Audit)*: "Receive a RAIN Compliant ranking using our proprietary framework built by industry experts and executives for necessary investments in infrastructure."
- Step 3 *(Data Modeling)*: "Utilize proprietary frameworks and the most up-to-date policy requirements with a flexible and AI-enabled technology platform to maximize reimbursement."
- Step 5 *(Technology Enabled Implementation)*: "Scalable insights for all relevant sites with personalized components to maximize reimbursement."

**Problems:**
- "Proprietary framework" appears in two consecutive steps — empty signaling.
- "industry experts and executives" — vague authority attribution; you have a *named* advisory committee, *use them* by name.
- Step 2 doesn't parse: *"…framework built by industry experts and executives for necessary investments in infrastructure"* — the prepositional phrase doesn't connect to anything coherent.
- "Scalable insights" doesn't mean anything.

**Suggested rewrites:**
- *Step 2 (Audit):* "Receive a RAIN Compliant™ readiness ranking benchmarked against the standards developed by our advisory committee — including infrastructure gaps to close before TEAM Year 1."
- *Step 3 (Data Modeling):* "Model your TEAM reimbursement against current CMS policy using an AI-enabled, EHR-integrated platform."
- *Step 5 (Technology Enabled Implementation):* "Roll out across every TEAM-eligible facility, with workflows tailored to each site's case mix and post-acute network."

Also rename **Step 5** from *"Technology Enabled Implementation"* to *"Implementation"* — every step here is technology-enabled; flagging it on one step weakens the others.

---

### 2.6 SOC 2 section — emotional drift in an enterprise context

**Where:** `src/pages/raincompliant.astro:155-159`
**Current:**
> *"This achievement — verified through a successful audit by AssuranceLab — demonstrates our **unwavering commitment** to safeguarding our customers' most critical data assets. SOC 2 is more than just a checkbox. It's a globally recognized standard that signals trust, security, and operational excellence — and we're **proud to meet it**."*

**Problem:** "Unwavering commitment" + "proud to meet it" is the emotional register of a startup mission page, not an enterprise security claim. Buyers evaluating SOC 2 want **scope** and **specificity**, not emotion. "More than just a checkbox" is also a sentence that anticipates skepticism rather than just being unambiguous.

**Suggested rewrite:**
> *"Rainfall Health's platform is SOC 2 Type 1 compliant, audited by AssuranceLab. Our security program covers the AICPA Trust Services Criteria for security, availability, and confidentiality — the controls hospitals' compliance and security teams expect from a business associate handling PHI. Our SOC 2 Type 2 audit is in progress."*

(Add the last sentence only if true — a Type 2 in progress is a stronger signal than Type 1 alone, since Type 1 is just "controls exist on a date" and Type 2 is "controls operated effectively over time." If Type 2 is a year out, you can skip it.)

---

### 2.7 CTA verb inconsistency

**Where:** Multiple
**Current variations across the site:**
- "See Your Potential CMS TEAM Revenue" (homepage hero)
- "View Full Advisory Committee" (homepage)
- "Book Your Session Now" (homepage)
- "Schedule Demo" (raincompliant hero, raincompliant footer banner)
- "Book a Session" (raincompliant secondary)
- "Meet the Advisory Committee" (raincompliant)
- "9 Minute Expert Consult" / "30 Minute Meeting" (schedule page — note one says "Expert Consult" and the other says "Meeting", inconsistent)
- "Request a Demo" (header/footer nav)
- "Join Us" (careers)
- "Book a Session" (FAQ CTA)

**Problem:** Six different verbs for what's essentially two actions (book a meeting, view a list). For a marketing site this is the easiest brand-voice win — pick one verb per CTA pattern and stick to it.

**Suggested rewrite — canonical CTA library:**

| Action | Canonical CTA |
|---|---|
| Primary "talk to sales" — long form | **"Schedule a demo"** |
| Primary "talk to sales" — short consult | **"Book a 9-minute consult"** |
| Secondary "see more / explore" | **"See the [thing]"** (e.g. "See the advisory committee", "See your TEAM revenue potential") |
| Hospital search no-match fallback | **"Talk to us about your facility"** |
| Careers | **"View open roles"** if listings exist; **"Send us your resume"** if not |

Then update the schedule-a-demo page so the two button labels are parallel:
- "9-minute expert consult" → keep
- "30-minute meeting" → "30-minute product demo" (matches the description above the buttons)

---

### 2.8 Page-index summary for `/about/careers` is generic

**Where:** `src/data/page-index.ts:54-57`
**Current:**
> *"Values, benefits, and how to join Rainfall Health."*

**Problem:** This text appears in the OG image and `llms.txt` for the careers page — it's the version of the page LLMs and social cards see. "Values, benefits, and how to join" reads like a wireframe placeholder.

**Suggested rewrite:**
> *"A remote, mission-driven team building the operational and AI infrastructure for the CMS TEAM mandate. See our values, benefits, and open roles."*

---

## Tier 3 — Medium priority (clarity polish)

### 3.1 "First to market product based solution"

**Where:** `src/data/homepage-features.ts:23` (Card 2 description)
**Current:**
> *"The first to market product based solution that sets you up for compliance and manages your journey over the 5 year period of performance."*

**Problems:**
- *"first to market product based solution"* — three modifiers stacked with no hyphens, hard to parse on first read. Should be hyphenated as *"first-to-market product-based solution"* — but even hyphenated, "product-based solution" is a tautology (every product is a product-based solution).
- *"sets you up"* — informal.
- *"5 year"* — should be hyphenated when adjectival ("5-year period of performance").
- "first to market" is also a defensible-but-aging claim once a quarter passes.

**Suggested rewrite:**
> *"The first compliance platform purpose-built for the CMS TEAM Model — designed to guide hospitals across the full five-year performance period."*

---

### 3.2 Home feature card: "Maximizing Reimbursement"

**Where:** `src/data/homepage-features.ts:12-13`
**Current:**
> *"TEAM-related procedures could see up to a 20% impact on Medicare reimbursements."*

**Problem:** "Could see up to" + "impact" is hedging in two directions. "Impact" is also directionally ambiguous — is the 20% a gain or a loss? A CFO reading this can't tell.

**Suggested rewrite:**
> *"Hospitals can swing as much as 20% of TEAM-episode Medicare reimbursement — up or down — based on episode quality and cost performance."*

This makes the bidirectionality explicit (which is also more honest about risk), and it's more useful to a CFO.

---

### 3.3 Career page subhead — "Welcomed" vs. "Welcome"

**Where:** `src/data/company-values.ts` value 4
**Current:**
> Title: *"Everyone is Welcomed"*

**Problem:** *"Everyone is Welcomed"* uses the past participle as predicate, which reads as if "is welcomed" is a perpetually ongoing action being done to each person. The intended meaning is the adjective: *"Everyone is welcome"* (i.e., a welcoming place). This reads as a typo.

**Suggested rewrite:**
> Title: *"Everyone is welcome"*

(Lowercase first word of the value title is also more modern, but the other four values use Title Case so leave that consistent — see §3.5.)

### 3.4 Careers page CTA paragraph — over-friendly opener

**Where:** `src/pages/about/careers.astro:79`
**Current:**
> *"Great news — we're hiring! We have positions open and would love to know about you. Submit your resume and we'll be in touch about opportunities with Rainfall Health."*

**Problem:** "Great news" + "love to know about you" is the warmth dial pegged at 11 for an enterprise compliance company. Compare to the rest of the careers page (values like "Bias for Action") and the SOC 2 register elsewhere — the tones don't match.

**Suggested rewrite:**
> *"We're hiring across product, engineering, and customer engagement. Send us your resume — we'll reach out when we see a fit."*

---

### 3.5 Title case in headings is inconsistent

**Where:** Throughout
**Examples:**
- *"Rainfall Health is the Only Health Compliance Platform With Everything You Need to Respond to the TEAM Model"* — Title Case With Lower-Case "is"/"to"/"the"
- *"Why It Matters"* — Title Case
- *"Have questions about TEAM and how it affects your organization?"* — Sentence case
- *"What Is TEAM?"* — Title Case (FAQ)
- *"What Patients are Included Under TEAM?"* — Mixed (Title Case but lowercase "are")
- *"Have Questions?"* (Footer) — Title Case
- *"Search For Your Hospital"* — Title Case ("for" capitalized — uncommon)

**Suggested action:** Pick one and apply sitewide. Modern enterprise B2B (Stripe, Linear, Vercel, Notion) leans **sentence case** — easier to read, less shouty, more current. Recommend:

| Surface | Convention |
|---|---|
| H1 / hero headlines | Sentence case |
| H2 section headers | Sentence case |
| Buttons / CTAs | Sentence case |
| FAQ questions | Sentence case (already a question — it doesn't need Title Case to look like a heading) |
| Brand/product names | Preserve (Rainfall Health, RAIN Compliant™, TEAM, CMS) |

This is a cosmetic but high-volume change — a list of every heading to flip can be auto-generated if useful.

---

### 3.6 Em-dash and hyphen handling is inconsistent

**Where:** Throughout
**Notes:**
- Marketing copy mostly uses em-dashes correctly (`—`, `&mdash;`).
- Blog posts mix em-dashes and double-hyphens (`--`) — the latter is markdown source that won't always render to em-dash. Example: "rural America -- specialists, modern facilities…" in the rural-access post. This renders as a literal `--` in some MD pipelines.
- Adjective compounds inconsistently hyphenated: "5 year period" (`rain-standards.ts:39`), "5-year performance period" elsewhere, "30-day post-discharge" (correct), "30 days post-discharge" (also used).

**Suggested action:** Pass through blog MD source and replace `--` with `—`. Adopt a sentence-level rule: hyphenate compound adjectives before a noun ("5-year period"), don't hyphenate when used predicatively ("over five years").

---

### 3.7 Acronym density without first-mention expansion

**Where:** Throughout
**Examples flagged:**
- `IPPS` introduced in `raincompliant.astro:39` — never expanded.
- `EHR` used multiple times — never expanded on first use.
- `BPCI Advanced`, `CJR`, `MDH`, `SCH`, `CBSA`, `ACO`, `CMMI`, `THA/TKA PRO-PM`, `HAC`, `PSI 90` — all in `faq.ts` without glossary.
- `CABG`, `LEJR`, `SHFFT` — expanded inline, good.

**Problem:** Your buyer (CFO/CEO) knows IPPS and EHR. Their *board members*, who they may share the link with, do not. And your search/SEO surface area improves when acronyms are expanded at least once per page.

**Suggested action:** First-mention expansion rule. On any given page, the *first* time an acronym appears, expand it: *"Inpatient Prospective Payment System (IPPS)"*. Subsequent uses can be just `IPPS`. The FAQ page, in particular, should expand all of `BPCI`, `CJR`, `MDH`, `SCH`, `CBSA`, `ACO`, `CMMI` once.

---

### 3.8 "Tagline" is grammatically off

**Where:** `src/data/site-config.ts:3`, surfaces in homepage `<title>`, OG, llms.txt
**Current:**
> *"AI Enabled Accountability and Accessibility"*

**Problem:** *"AI Enabled"* — should be hyphenated as *"AI-Enabled"* (used as a compound adjective). Currently reads as if "AI" and "Enabled" are two separate things. The site does this correctly elsewhere (`AI-enabled compliance platform` in the meta description on the same file).

**Suggested rewrite:**
> *"AI-enabled accountability and accessibility"* (sentence case, hyphenated)

Or, if you want to give the tagline more lift:
> *"Hospital compliance, AI-enabled."*

The current tagline lists abstract values; the alternative names the product category and the differentiator.

---

## Tier 4 — Low priority (nice-to-have)

### 4.1 Footer placeholder badge

**Where:** `src/components/Footer.astro:54-55`
**Current:** Empty circle with literal text *"Badge"* — clearly a placeholder for the SOC 2 badge.

**Suggested action:** Either insert the actual SOC 2 badge graphic (SOC 2 Type 1 compliance is mentioned on `raincompliant.astro` but there's no badge asset in `public/images/`) or remove the placeholder until the asset exists. *"Badge"* in a footer is the kind of thing a competitive intel screenshot will land on.

### 4.2 Calendly "coming soon"

**Where:** `src/pages/schedule-a-demo.astro:52-53`
**Current:** *"Calendar scheduling integration coming soon. In the meantime, reach out to us directly."*

**Suggested action:** Either ship the Calendly embed or remove the "coming soon" line entirely. "Coming soon" on a primary conversion surface is a credibility leak — the buyer is clicking *now*. The two email-link buttons above it already function as the fallback; the line below them just draws attention to the missing feature.

### 4.3 Blog post date anomaly

**Where:** `src/content/blog/cms-issues-letters-…` (publishDate `2025-11-17`)

**Note:** Today's date is 2026-04-29. The post is in the past, but it's written as a press release dated *the day it was published* — the date is fine, this isn't a future-dated post. Flagging only because the explorer-agent reported it as suspect; on closer look, it's correct. **No action needed.**

### 4.4 Triple-asterisk markdown emphasis

**Where:** `src/content/blog/cms-team-playbook…` post body uses `***mandatory***` for emphasis.

**Problem:** Triple-asterisk (`***bold italic***`) renders as bold italic in CommonMark, but the visual weight is heavy and inconsistent with the rest of the prose. The post otherwise uses `**bold**` for emphasis.

**Suggested rewrite:** Change `***mandatory***` → `**mandatory**`.

### 4.5 Press item — outdated/off-topic Geekwire 2022 prediction

**Where:** `src/data/press-items.ts:103` — *"Digital health leaders share predictions on what to expect in 2023"*

**Problem:** A 2022 article making 2023 predictions is, in 2026, neither news nor evergreen press coverage. It dilutes the press logo wall.

**Suggested action:** Remove from `press-items.ts`, or move to a smaller "Earlier coverage" subsection if the volume of recent press is thin. (It isn't — the list is robust.)

### 4.6 RAIN Compliant trademark expansion appears once and is buried

**Where:** `raincompliant.astro:24` — only place "Referral Accountability for Integrated Networks" is spelled out.

**Suggested action:** Move the expansion higher (eyebrow text or first-paragraph aside) and consider adding it to the meta description for the page so it shows up in search results. Right now the most important brand backronym on the site is buried inside the longest paragraph.

---

# Cross-cutting observations

**1. The site has two voices fighting each other.**
- Marketing pages skew toward heated marketing language ("the Only", "unwavering", "historic", "leverage", "strategically designed", "your journey").
- The FAQ, RAIN Standards data, and legal pages are restrained, regulatory, and clear.
- The blog posts (Eddie Qureshi-authored ones especially) are personal and well-written.

The marketing-page voice is the weakest of the three and needs to come up to the level of the FAQ. The FAQ voice — clear, fact-anchored, comfortable with specificity — is the right brand voice for selling a regulatory product to hospital executives.

**2. Specific facts and numbers are the site's strongest asset and most underused.**
You have terrific anchor stats: 741 mandated facilities, 5 surgical episodes, 30-day post-discharge window, 5-year performance period, 15% Medicare-revenue impact, January 1, 2026. These are the things a CFO believes. The site uses them well in `raincompliant.astro:102-106` and the FAQ; the homepage hero and feature cards lean instead on adjectives ("seamless," "intuitive," "first to market") that those same readers discount automatically.

**Recommendation across all marketing copy:** when the choice is between a number and an adjective, take the number.

**3. Duplication that should be a shared component.**
- The advisory-committee blurb appears verbatim across three pages (homepage, raincompliant, meet-our-advisory-team).
- The "Have questions about TEAM…" CTA appears across two pages with slightly different button text.
- The `741 mandated facilities` stat is copy-pasted in at least four places.

A future content-system refactor could lift these into `src/data/` modules so a single edit applies everywhere. Out of scope for this audit but worth noting — you'll fight the same naming/voice drift problems again otherwise.
