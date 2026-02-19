# UI Design Tokens & Component Library

> Extracted from gravix-final-prd.md Part IV. Complete design system: colors, typography, spacing, components.

# PART IV: UI DESIGN SYSTEM & COMPONENT LIBRARY

> **Source document:** `gravix-ui-spec.docx` (v1.0)
>
> Complete visual design system: color palette, typography, spacing, component library, and page-level design specifications. For page-specific component details and updates, see Part V (Page-by-Page Specification).


1\. Design Philosophy & Strategic Context

2\. Design System: Foundations

3\. Design System: Component Library

4\. Page Specifications: Global Navigation

5\. Page Specifications: Landing Page

6\. Page Specifications: Spec Engine Tool

7\. Page Specifications: Failure Analysis Tool

8\. Page Specifications: Results & Reports

9\. Page Specifications: Pricing & Auth

10\. User Flows & State Machines

11\. Responsive Design Breakpoints

12\. Animation & Motion System

13\. Accessibility (WCAG 2.1 AA)

14\. Error States & Edge Cases

15\. Performance Budgets

16\. Implementation Priorities

**1. Design Philosophy & Strategic Context**

**1.1 Core Design Principles**

Gravix serves manufacturing engineers, process engineers, and quality
engineers under time pressure. Every design decision must prioritize
speed-to-answer, cognitive clarity, and professional credibility. The UI
must feel like a precision instrument, not a consumer app. Engineers
trust tools that look engineered.

+-----------------------------------------------------------------------+
| **THE GRAVIX DESIGN AXIOM**                                           |
|                                                                       |
| Every pixel must earn trust. Engineers scan for credibility in        |
| milliseconds. The interface must communicate: neutral, rigorous,      |
| data-driven, no-bullshit. If it looks like a marketing site,          |
| engineers will leave. If it looks like an engineering tool, they will |
| stay.                                                                 |
+-----------------------------------------------------------------------+

**Five Pillars of Gravix Design**

  -----------------------------------------------------------------------
  **Pillar**              **Principle**           **Implementation**
  ----------------------- ----------------------- -----------------------
  Precision               Data density without    Tight spacing,
                          clutter                 monospace data, clear
                                                  hierarchy

  Neutrality              No vendor bias in       Avoid manufacturer
                          visual language         brand colors; use
                                                  steel/slate palette

  Speed                   Sub-3-second time to    Pre-focused first
                          first input             field, progressive
                                                  disclosure, no splash

  Authority               Visual weight =         Dark theme, sharp
                          technical credibility   geometry, no rounded
                                                  playful elements

  Clarity                 One task per screen,    Clear sections, labeled
                          one answer per result   outputs, exportable
                                                  summaries
  -----------------------------------------------------------------------

**1.2 Target User Psychology**

The primary users are process engineers in manufacturing environments
who are often evaluating adhesives under production pressure. They have
been burned by vendor-biased recommendations, incomplete datasheets, and
costly failures. Their trust hierarchy is: peer-reviewed data \>
independent testing \> neutral tools \> vendor claims. Gravix must
position itself in the \"neutral tools\" tier and work toward the
\"independent testing\" tier through accumulated case data.

**User Mental Models**

  ----------------------------------------------------------------------------
  **User Segment**     **Mindset When      **What They Need  **Trust Signal**
                       Arriving**          to See**          
  -------------------- ------------------- ----------------- -----------------
  Failure diagnosis    Urgent, frustrated, Input form        Technical
                       production down     immediately, no   language,
                                           barriers          specificity

  Spec research        Methodical,         Clear comparison, Neutrality,
                       evaluating options  data tables       multiple adhesive
                                                             types

  Procurement          Budget-conscious,   Executive         PDF export,
                       needs justification summary, cost     professional
                                           framing           format

  Quality/compliance   Risk-averse, needs  Standards         Traceability,
                       documentation       references, audit methodology
                                           trail             display
  ----------------------------------------------------------------------------

**1.3 Competitive Visual Positioning**

Gravix must visually distinguish itself from three categories of
existing solutions. Manufacturer sites (Henkel, 3M) use heavily branded,
sales-oriented layouts. Engineering tools (ANSYS, SolidWorks) use dense,
complex UIs optimized for power users. Consumer SaaS (generic AI tools)
use friendly, rounded, approachable aesthetics. Gravix occupies the gap:
the authority of an engineering tool with the accessibility of modern
SaaS, minus the vendor bias.

**Visual Differentiation Matrix**

  ------------------------------------------------------------------------------
  **Attribute**   **Manufacturer   **Engineering   **Consumer     **GRAVIX**
                  Sites**          Tools**         SaaS**         
  --------------- ---------------- --------------- -------------- --------------
  Theme           Branded colors   Gray/dense      Light/pastel   Dark navy +
                                                                  electric blue

  Typography      Marketing serif  System fonts    Rounded sans   Industrial
                                                                  geometric sans

  Density         Low (marketing)  Very high       Low (friendly) Medium-high
                                                                  (efficient)

  Corners         Mixed            Sharp           Rounded 8-16px Sharp 2-4px
                                                                  max

  Trust cues      Brand logos      Complexity      Social proof   Data
                                                                  transparency
  ------------------------------------------------------------------------------

**2. Design System: Foundations**

**2.1 Color System**

The Gravix color system is built on a dark-mode-first approach. Dark
backgrounds reduce eye strain for engineers working in varied lighting
conditions (factory floors, offices, labs) and create visual authority.
The palette is industrial: deep navy, slate grays, and electric blue
accents. No warm colors in the primary palette --- warmth implies
marketing.

**Primary Palette**

  ---------------------------------------------------------------------------
  **Token**         **Hex**           **Usage**         **CSS Variable**
  ----------------- ----------------- ----------------- ---------------------
  brand-900         #0A1628           Primary           \--color-brand-900
                                      background,       
                                      headers           

  brand-800         #111827           Card/surface      \--color-brand-800
                                      backgrounds       

  brand-700         #1F2937           Elevated          \--color-brand-700
                                      surfaces, modals  

  brand-600         #374151           Borders, dividers \--color-brand-600

  accent-500        #3B82F6           Primary actions,  \--color-accent-500
                                      links, focus      

  accent-600        #2563EB           Hover states on   \--color-accent-600
                                      primary actions   

  accent-700        #1D4ED8           Active/pressed    \--color-accent-700
                                      states            

  accent-100        #DBEAFE           Accent            \--color-accent-100
                                      backgrounds       
                                      (light)           
  ---------------------------------------------------------------------------

**Semantic Colors**

  ------------------------------------------------------------------------
  **Token**         **Hex**           **Usage**         **CSS Variable**
  ----------------- ----------------- ----------------- ------------------
  success-500       #10B981           Positive results, \--color-success
                                      confirmed specs   

  warning-500       #F59E0B           Caution, medium   \--color-warning
                                      confidence        

  danger-500        #EF4444           Failures, errors, \--color-danger
                                      high risk         

  info-500          #6366F1           Informational     \--color-info
                                      badges, tips      
  ------------------------------------------------------------------------

**Text Colors**

  -----------------------------------------------------------------------
  **Token**         **Hex**           **Usage**         **Contrast Ratio
                                                        vs #0A1628**
  ----------------- ----------------- ----------------- -----------------
  text-primary      #F9FAFB           Headings, body    15.2:1
                                      text              

  text-secondary    #9CA3AF           Labels,           7.1:1
                                      descriptions      

  text-tertiary     #6B7280           Placeholders,     4.6:1
                                      disabled          

  text-inverse      #0A1628           Text on light     N/A
                                      backgrounds       
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **ACCESSIBILITY NOTE**                                                |
|                                                                       |
| All text-secondary elements meet WCAG AA (4.5:1) against brand-900.   |
| text-tertiary is used only for non-essential information              |
| (placeholders, hints). Interactive elements always use text-primary   |
| or accent-500.                                                        |
+-----------------------------------------------------------------------+

**2.2 Typography**

Typography must communicate precision and engineering authority. The
type system uses two font families: a geometric sans-serif for headings
and UI elements, and a monospace font for technical data, values, and
specifications. Body text is highly readable at data-dense sizes.

**Font Stack**

  -----------------------------------------------------------------------
  **Role**          **Font Family**   **Fallback**      **Rationale**
  ----------------- ----------------- ----------------- -----------------
  Display /         JetBrains Mono or system-ui,        Geometric
  Headings          DM Sans           sans-serif        precision,
                                                        technical feel

  Body / UI         DM Sans or IBM    system-ui,        Highly legible at
                    Plex Sans         sans-serif        small sizes,
                                                        clean geometry

  Data / Values     JetBrains Mono    Fira Code,        Tabular
                                      monospace         alignment,
                                                        engineering
                                                        credibility

  Code / Technical  JetBrains Mono    Fira Code,        Chemical
                                      monospace         formulas, spec
                                                        codes
  -----------------------------------------------------------------------

**Type Scale**

  ----------------------------------------------------------------------------
  **Token**   **Size      **Size      **Weight**   **Line      **Usage**
              (rem)**     (px)**                   Height**    
  ----------- ----------- ----------- ------------ ----------- ---------------
  text-xs     0.75        12          400          1.5         Badges, fine
                                                               print

  text-sm     0.875       14          400          1.5         Labels,
                                                               descriptions,
                                                               table body

  text-base   1.0         16          400          1.6         Body text, form
                                                               inputs

  text-lg     1.125       18          500          1.5         Section labels,
                                                               card titles

  text-xl     1.25        20          600          1.4         Page subtitles

  text-2xl    1.5         24          700          1.3         Page titles

  text-3xl    1.875       30          700          1.2         Hero heading

  text-4xl    2.25        36          800          1.1         Landing hero
                                                               display

  data-lg     1.5         24          600 mono     1.0         Result values,
                                                               spec numbers

  data-xl     2.0         32          700 mono     1.0         Hero stat
                                                               values
  ----------------------------------------------------------------------------

**2.3 Spacing & Layout Grid**

Spacing follows a 4px base unit system. All spacing values are multiples
of 4px for pixel-perfect alignment. The layout uses a 12-column grid
with 24px gutters on desktop, collapsing to single-column on mobile.

**Spacing Scale**

  -----------------------------------------------------------------------
  **Token**               **Value**               **Usage**
  ----------------------- ----------------------- -----------------------
  space-1                 4px                     Tight internal padding
                                                  (badges)

  space-2                 8px                     Inline spacing, icon
                                                  gaps

  space-3                 12px                    Small component padding

  space-4                 16px                    Standard component
                                                  padding

  space-5                 20px                    Input field padding

  space-6                 24px                    Card padding, section
                                                  gaps

  space-8                 32px                    Section separation

  space-10                40px                    Major section breaks

  space-12                48px                    Page section padding

  space-16                64px                    Hero section padding

  space-20                80px                    Landing page section
                                                  gaps
  -----------------------------------------------------------------------

**Layout Grid**

  ----------------------------------------------------------------------------
  **Breakpoint**   **Columns**    **Gutter**     **Margin**     **Max Width**
  ---------------- -------------- -------------- -------------- --------------
  Mobile (\<640px) 1              16px           16px           100%

  Tablet           6              20px           24px           100%
  (640-1023px)                                                  

  Desktop          12             24px           32px           1024px
  (1024-1279px)                                                 

  Wide (1280px+)   12             24px           auto           1280px
  ----------------------------------------------------------------------------

**2.4 Elevation & Depth**

Dark mode depth is communicated through surface color lightness rather
than traditional drop shadows. Higher elevation surfaces use lighter
background colors. Subtle shadows are used sparingly for floating
elements like dropdowns and modals.

  -----------------------------------------------------------------------
  **Level**         **Background**    **Shadow**        **Usage**
  ----------------- ----------------- ----------------- -----------------
  Level 0 (base)    #0A1628           none              Page background

  Level 1 (surface) #111827           none              Cards, panels

  Level 2           #1F2937           0 1px 3px         Active cards,
  (elevated)                          rgba(0,0,0,0.3)   hover states

  Level 3           #1F2937           0 4px 16px        Dropdowns,
  (floating)                          rgba(0,0,0,0.5)   tooltips

  Level 4 (overlay) #1F2937           0 8px 32px        Modals, dialogs
                                      rgba(0,0,0,0.6)   
  -----------------------------------------------------------------------

**2.5 Iconography**

Use Lucide Icons (lucide.dev) as the primary icon set. These are
geometric, consistent, and optimized for the industrial aesthetic. Icon
sizes follow the spacing scale: 16px for inline, 20px for buttons, 24px
for section headers. Stroke width: 1.5px default, 2px for emphasis.
Icons are always paired with text labels in navigation and CTAs ---
never icon-only for critical actions (except established patterns like
close/X).

**3. Design System: Component Library**

**3.1 Buttons**

  ----------------------------------------------------------------------------
  **Variant**    **Background**   **Text**       **Border**     **Usage**
  -------------- ---------------- -------------- -------------- --------------
  Primary        #3B82F6          #FFFFFF        none           Main CTAs: Run
                                                                Analysis, Get
                                                                Spec

  Secondary      transparent      #3B82F6        1px #3B82F6    Secondary
                                                                actions:
                                                                Export, Share

  Ghost          transparent      #9CA3AF        none           Tertiary:
                                                                Cancel, Back,
                                                                Reset

  Danger         #EF4444          #FFFFFF        none           Destructive:
                                                                Clear All,
                                                                Delete

  Success        #10B981          #FFFFFF        none           Confirm:
                                                                Submit Review
                                                                Request
  ----------------------------------------------------------------------------

**Button Sizes**

  --------------------------------------------------------------------------
  **Size**       **Height**     **Padding H**  **Font Size**  **Border
                                                              Radius**
  -------------- -------------- -------------- -------------- --------------
  sm             32px           12px           14px           2px

  md             40px           16px           14px           4px

  lg             48px           24px           16px           4px

  xl             56px           32px           18px           4px
  --------------------------------------------------------------------------

**Button States**

  -----------------------------------------------------------------------
  **State**               **Visual Change**       **Cursor**
  ----------------------- ----------------------- -----------------------
  Default                 Base styles             pointer

  Hover                   Background lightens     pointer
                          10%, subtle scale(1.01) 

  Active                  Background darkens 10%, pointer
                          scale(0.99)             

  Focus                   2px accent-500 ring,    pointer
                          2px offset              

  Disabled                opacity: 0.4            not-allowed

  Loading                 Spinner replaces text,  wait
                          width locked            
  -----------------------------------------------------------------------

**3.2 Form Inputs**

Form inputs are the most critical components in Gravix. Engineers
interact with these under time pressure. Every input must be immediately
clear in purpose, responsive in feedback, and efficient in data entry.

**Text Input Spec**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Height                              44px

  Background                          #111827

  Border                              1px solid #374151

  Border radius                       4px

  Padding                             12px 16px

  Font                                DM Sans, 16px, #F9FAFB

  Placeholder color                   #6B7280

  Focus border                        2px solid #3B82F6

  Focus ring                          0 0 0 3px rgba(59,130,246,0.15)

  Error border                        2px solid #EF4444

  Error message                       Below input, 12px, #EF4444, 4px top
                                      margin

  Label                               Above input, 14px, #9CA3AF, 6px
                                      bottom margin, font-weight 500
  -----------------------------------------------------------------------

**Select / Dropdown Spec**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Trigger height                      44px, same as text input

  Dropdown background                 #1F2937

  Dropdown border                     1px solid #374151

  Dropdown shadow                     0 8px 32px rgba(0,0,0,0.5)

  Option height                       40px

  Option hover                        background #374151

  Option selected                     background #1E3A5F, text #3B82F6

  Search input                        Sticky top, 40px, #111827 bg

  Max visible options                 6 (scrollable after)

  Animation                           opacity + translateY(-4px), 150ms
                                      ease-out
  -----------------------------------------------------------------------

**Substrate Selector (Custom Component)**

The substrate selector is a specialized typeahead dropdown that handles
the most common input in both tools. It must support fast selection from
a pre-populated list while allowing custom entries. This is a
high-frequency interaction that directly impacts time-to-first-result.

  -----------------------------------------------------------------------
  **Feature**                         **Specification**
  ----------------------------------- -----------------------------------
  Input type                          Typeahead with dropdown

  Pre-populated options               ABS, Polycarbonate, Nylon 6, Nylon
                                      6/6, PBT, PET, PMMA, Polypropylene,
                                      Polyethylene (HDPE), Polyethylene
                                      (LDPE), PVC, PTFE, Steel (mild),
                                      Steel (stainless 304/316), Aluminum
                                      6061, Aluminum 7075, Brass, Copper,
                                      Titanium, Glass, Ceramic, Rubber
                                      (natural), Rubber (silicone),
                                      Rubber (EPDM), Carbon fiber
                                      composite, Fiberglass, Wood
                                      (hardwood), Wood (softwood),
                                      Leather, Fabric/textile

  Category grouping                   Plastics, Metals, Elastomers,
                                      Composites, Natural

  Search behavior                     Fuzzy match on name + category
                                      (e.g., typing \"steel\" shows all
                                      steel variants)

  Custom entry                        \"Other: \[user types\]\" option at
                                      bottom of filtered list

  Recent selections                   Last 5 used substrates pinned to
                                      top (localStorage)

  Keyboard nav                        Arrow keys to navigate, Enter to
                                      select, Esc to close

  Empty state                         Show all categories collapsed with
                                      counts
  -----------------------------------------------------------------------

**3.3 Cards**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Background                          #111827

  Border                              1px solid #374151

  Border radius                       4px

  Padding                             24px

  Hover                               border-color #3B82F6,
                                      translateY(-1px), shadow 0 4px 12px
                                      rgba(0,0,0,0.2)

  Active/selected                     border-color #3B82F6, background
                                      #0F1D32
  -----------------------------------------------------------------------

**3.4 Confidence Indicator (Custom Component)**

Confidence scores are displayed throughout Gravix results. This custom
component communicates AI confidence visually and numerically. Engineers
must be able to quickly assess reliability.

  -----------------------------------------------------------------------
  **Confidence      **Color**         **Label**         **Icon**
  Range**                                               
  ----------------- ----------------- ----------------- -----------------
  90-100%           #10B981 (success) High Confidence   Shield-check

  70-89%            #3B82F6 (accent)  Good Confidence   Shield

  50-69%            #F59E0B (warning) Moderate ---      Alert-triangle
                                      Verify            

  0-49%             #EF4444 (danger)  Low --- Requires  Alert-circle
                                      Testing           
  -----------------------------------------------------------------------

Visual: Circular progress ring (48px diameter) with percentage centered
in monospace. Color fills the ring proportionally. Below the ring: text
label in matching color. Tooltip on hover explains confidence
methodology.

**3.5 Result Cards (Custom Components)**

**Spec Recommendation Card**

  ----------------------------------------------------------------------------
  **Section**             **Content**             **Layout**
  ----------------------- ----------------------- ----------------------------
  Header                  Adhesive type name +    Flex row, space-between
                          confidence badge        

  Properties grid         Viscosity, shear        2-column grid, label-value
                          strength, fixture time, pairs
                          gap fill, temp range    

  Substrate compatibility Compatibility rating    Inline badges
                          for each substrate      (Excellent/Good/Fair/Poor)

  Known risks             Risk factors with       List with colored severity
                          severity                dots

  Substitutes             Alternative adhesive    Collapsible section, 2-3
                          specs                   alternatives

  Footer                  Export PDF / Request    Right-aligned button row
                          Review buttons          
  ----------------------------------------------------------------------------

**Failure Analysis Card**

  -----------------------------------------------------------------------
  **Section**             **Content**             **Layout**
  ----------------------- ----------------------- -----------------------
  Header                  Root cause #N +         Flex row with rank
                          confidence badge        number

  Explanation             Detailed technical      Prose paragraph, 14px
                          explanation             

  Mechanism               Scientific mechanism of Monospace block,
                          failure                 indented

  Recommendations         Immediate + long-term   Two-column: Immediate
                          actions                 \| Long-term

  Prevention              Step-by-step prevention Numbered list
                          plan                    
  -----------------------------------------------------------------------

**3.6 Loading & Progress States**

  -----------------------------------------------------------------------
  **State**               **Component**           **Specification**
  ----------------------- ----------------------- -----------------------
  Initial load            Skeleton screens        Pulsing rectangles
                                                  matching content
                                                  layout, #1F2937 on
                                                  #111827

  AI processing           Progress stepper        3-step: Analyzing
                                                  inputs \> Processing \>
                                                  Generating results

  AI processing           Status text             Rotating messages:
                                                  \"Evaluating substrate
                                                  compatibility\...\"
                                                  \"Analyzing cure
                                                  kinetics\...\"
                                                  \"Cross-referencing
                                                  failure modes\...\"

  AI processing           Timer                   Elapsed time counter in
                                                  monospace, bottom-right
                                                  of progress area

  Partial results         Streaming               Results fade in
                                                  section-by-section as
                                                  AI generates them

  Button loading          Spinner                 16px spinner replaces
                                                  button text, button
                                                  width locked
  -----------------------------------------------------------------------

**3.7 Toast Notifications**

  ------------------------------------------------------------------------------
  **Type**       **Background**   **Border       **Icon**         **Duration**
                                  Left**                          
  -------------- ---------------- -------------- ---------------- --------------
  Success        #064E3B          3px #10B981    Check-circle     4 seconds

  Error          #7F1D1D          3px #EF4444    X-circle         8 seconds
                                                                  (manual
                                                                  dismiss)

  Warning        #78350F          3px #F59E0B    Alert-triangle   6 seconds

  Info           #1E1B4B          3px #6366F1    Info             5 seconds
  ------------------------------------------------------------------------------

Position: top-right, 24px from edges. Stack downward. Max 3 visible.
Width: 380px. Enter: slide-in from right, 300ms. Exit: fade-out 200ms.

**4. Page Specifications: Global Navigation**

**4.1 Top Navigation Bar**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Height                              64px

  Background                          #0A1628

  Border bottom                       1px solid #1F2937

  Position                            sticky top: 0, z-index: 50

  Padding                             0 32px (desktop), 0 16px (mobile)

  Backdrop filter                     blur(8px) (when scrolled, bg
                                      becomes rgba(10,22,40,0.9))
  -----------------------------------------------------------------------

**Nav Layout (Left to Right)**

  -----------------------------------------------------------------------
  **Element**             **Spec**                **Behavior**
  ----------------------- ----------------------- -----------------------
  Logo                    GRAVIX wordmark, 20px,  Links to /
                          bold, white. No logo    
                          image in V1             

  Spec Tool               Text link, 14px,        Links to /tool
                          text-secondary. Active: 
                          text-primary + 2px      
                          accent underline        

  Failure Analysis        Text link, same as      Links to /failure
                          above                   

  Pricing                 Text link, same as      Links to /pricing
                          above                   

  \[spacer\]              flex-grow               ---

  Free uses badge         \"3/3 free\" or \"2/3   Shows for free tier
                          remaining\", 12px, in a 
                          pill, accent bg at 10%  
                          opacity                 

  Sign In                 Ghost button, sm        Opens auth modal

  Get Started             Primary button, sm      Opens auth modal
                                                  (signup)
  -----------------------------------------------------------------------

**Mobile Navigation**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Hamburger icon                      24px, right side of nav bar

  Menu type                           Full-screen overlay, #0A1628 bg,
                                      fade in 200ms

  Menu items                          Vertically stacked, 56px touch
                                      targets, centered text

  Close                               X icon in same position as
                                      hamburger, or tap overlay
  -----------------------------------------------------------------------

**5. Page Specifications: Landing Page**

Route: / (gravix.com root)

Purpose: Convert visitors into tool users or email subscribers.
Acquisition via SEO (adhesive failure search terms) and direct traffic.

**5.1 Hero Section**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Height                              100vh minimum, content-driven

  Background                          Gradient: #0A1628 to #111827 (top
                                      to bottom)

  Background accent                   Subtle grid pattern overlay at 3%
                                      opacity (CSS grid lines)

  Padding                             80px top (below nav), 64px bottom
  -----------------------------------------------------------------------

**Hero Content**

  -----------------------------------------------------------------------
  **Element**                         **Spec**
  ----------------------------------- -----------------------------------
  Badge (above headline)              Pill: \"Vendor-Neutral Adhesive
                                      Intelligence\" --- 12px, uppercase,
                                      accent bg at 10%, accent text,
                                      letter-spacing 1.5px

  Headline                            \"Specify industrial adhesives in
                                      seconds.\" --- text-4xl (36px),
                                      bold, white, max-width 640px

  Subheadline                         \"AI-powered spec engine and
                                      failure analysis. No vendor bias.
                                      No guesswork.\" --- text-lg (18px),
                                      text-secondary, max-width 520px,
                                      16px top margin

  CTA row                             Two buttons side by side, 32px top
                                      margin

  Primary CTA                         \"Try Spec Tool →\" --- Primary
                                      button, xl size

  Secondary CTA                       \"Diagnose a Failure\" ---
                                      Secondary button, xl size

  Trust line                          \"Free. No signup required for
                                      first 3 analyses.\" --- 12px,
                                      text-tertiary, 16px top margin
  -----------------------------------------------------------------------

**Hero Right Side (Desktop Only)**

A simplified, static representation of a spec result card (not
interactive). Shows: adhesive type, 3 key properties with values in
monospace, and a confidence badge. This is a visual proof-of-product,
not a real component. Styled as a Level 1 card with accent border-top
(3px). Slight rotation: transform: perspective(1000px) rotateY(-5deg)
rotateX(2deg). Animate in: fade + slide from right, 600ms, 300ms delay
after page load.

**5.2 Problem Section**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Background                          #111827

  Padding                             80px vertical

  Layout                              Section title + 4-column grid of
                                      problem cards
  -----------------------------------------------------------------------

Section title: \"Why adhesive decisions fail\" --- text-2xl, centered,
white. Subtitle: \"The current process is broken\" --- text-base,
centered, text-secondary.

**Problem Cards (4 cards)**

  -----------------------------------------------------------------------
  **Card**          **Icon**          **Title**         **Description**
  ----------------- ----------------- ----------------- -----------------
  1                 User-x            Vendor Bias       Manufacturer reps
                                                        recommend their
                                                        own products, not
                                                        the best solution
                                                        for your
                                                        application.

  2                 FileWarning       Incomplete Data   Datasheets show
                                                        idealized
                                                        conditions. Your
                                                        production
                                                        environment is
                                                        not a lab.

  3                 DollarSign        Costly Failures   Average adhesive
                                                        failure costs
                                                        \$12K-\$150K in
                                                        downtime, rework,
                                                        and scrap.

  4                 Clock             Slow Resolution   Consultants take
                                                        weeks. Production
                                                        lines wait hours.
  -----------------------------------------------------------------------

Card style: Level 1 card, 24px padding, danger border-top (2px #EF4444).
Icon: 32px, danger color. Title: text-lg, white. Description: text-sm,
text-secondary.

**5.3 Solution Section**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Background                          #0A1628

  Padding                             80px vertical

  Layout                              Alternating left-right: text +
                                      visual for each feature
  -----------------------------------------------------------------------

**Three Feature Blocks**

  -----------------------------------------------------------------------
  **Feature**       **Title**         **Description**   **Visual**
  ----------------- ----------------- ----------------- -----------------
  Spec Engine       Instant adhesive  Enter substrates, Simplified spec
                    specifications    load,             form mockup
                                      environment. Get  
                                      vendor-neutral    
                                      specs in seconds. 

  Failure Analysis  Root cause in     Describe the      Simplified
                    minutes, not      failure. Get      failure result
                    weeks             ranked causes,    mockup
                                      corrections, and  
                                      prevention plans. 

  Executive Summary Decisions your VP Auto-generated    PDF preview
                    can approve       risk framing,     mockup
                                      cost logic, and   
                                      procurement       
                                      summaries.        
  -----------------------------------------------------------------------

Each block: 50/50 split on desktop. Text side: accent badge (\"SPEC
ENGINE\"), text-xl title, text-base description, secondary CTA button.
Visual side: stylized card mockup at Level 2 elevation.

**5.4 Social Proof Section (V1: Minimal)**

For V1, since there are no real users yet, this section shows stats
about the knowledge base rather than testimonials: \"Covering 30+
substrate types\", \"7 adhesive categories\", \"150+ failure mode
patterns\". Displayed as 3 large data-xl monospace numbers with labels
below. Background: #111827. Once real users exist, replace with customer
logos and testimonials.

**5.5 CTA Section**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Background                          Gradient: #111827 to #0A1628

  Padding                             80px vertical

  Content                             Centered: headline + email
                                      capture + CTA

  Headline                            \"Stop guessing. Start
                                      specifying.\" --- text-2xl, white

  Email input                         Inline with button: 480px
                                      max-width, input + primary button

  Alternative CTA                     \"Or try the tool now --- no signup
                                      needed\" --- text link below
  -----------------------------------------------------------------------

**5.6 Footer**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Background                          #0A1628

  Border top                          1px solid #1F2937

  Padding                             48px vertical

  Layout                              3 columns: Brand + tagline \| Links
                                      (Tool, Failure, Pricing, Contact)
                                      \| Legal (Privacy, Terms)

  Copyright                           \"Gravix is a product of GLUE
                                      MASTERS LLC\" --- 12px,
                                      text-tertiary, centered below
                                      columns
  -----------------------------------------------------------------------

**6. Page Specifications: Spec Engine Tool**

Route: /tool

Purpose: Primary product. Engineers input substrate + environment +
requirements, get vendor-neutral adhesive specification.

**6.1 Page Layout**

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Layout                              Two-panel: 45% form (left) \| 55%
                                      results (right) on desktop

  Mobile                              Single column: form on top, results
                                      below (scroll)

  Form panel bg                       #111827

  Results panel bg                    #0A1628

  Divider                             1px solid #1F2937 vertical line
                                      between panels
  -----------------------------------------------------------------------

**6.2 Input Form**

The form is the critical path. It must be immediately usable with zero
onboarding. The first field (Substrate A) is auto-focused on page load.

**Form Fields (Top to Bottom)**

  ---------------------------------------------------------------------------------------
  **\#**      **Field**     **Type**       **Required**   **Default**     **Help Text**
  ----------- ------------- -------------- -------------- --------------- ---------------
  1           Substrate A   Substrate      Yes            Auto-focused,   \"Primary
                            selector                      empty           surface to be
                            (typeahead)                                   bonded\"

  2           Substrate B   Substrate      Yes            Empty           \"Secondary
                            selector                                      surface to be
                            (typeahead)                                   bonded\"

  3           Load Type     Select         Yes            None selected   Options: Shear,
                                                                          Tensile, Peel,
                                                                          Cleavage,
                                                                          Impact,
                                                                          Vibration,
                                                                          Combination

  4           Environment   Multi-select   Yes            Indoor ambient  Chips: Indoor,
                            chips                         (pre-checked)   Outdoor, High
                                                                          temp (\>120C),
                                                                          Low temp
                                                                          (\<-20C),
                                                                          Humidity,
                                                                          Chemical
                                                                          exposure, UV
                                                                          exposure,
                                                                          Submersion

  5           Temperature   Two number     No             20C / 60C       \"Operating
              Range         inputs                                        temperature
                            (min/max) +                                   range\"
                            unit toggle                                   
                            (C/F)                                         

  6           Cure          Select         No             No preference   Options: No
              Constraints                                                 preference,
                                                                          \<30 seconds,
                                                                          \<5 minutes,
                                                                          \<30 minutes,
                                                                          \<24 hours

  7           Gap Fill      Toggle +       No             Off             \"If substrates
              Required      number input                                  cannot be
                            (mm)                                          tightly
                                                                          clamped\"

  8           Additional    Textarea, 3    No             Empty           \"Any other
              Context       rows                                          requirements:
                                                                          volume,
                                                                          regulatory,
                                                                          existing
                                                                          adhesive,
                                                                          etc.\"
  ---------------------------------------------------------------------------------------

**Form Footer**

  -----------------------------------------------------------------------
  **Element**                         **Spec**
  ----------------------------------- -----------------------------------
  Submit button                       \"Generate Specification →\" ---
                                      Primary, xl, full-width

  Reset link                          \"Clear form\" --- Ghost text link,
                                      below button, centered

  Usage counter                       \"2 of 3 free analyses remaining\"
                                      --- 12px, text-tertiary, below
                                      reset
  -----------------------------------------------------------------------

**6.3 Results Panel States**

**Empty State (Before First Analysis)**

Centered vertically in the results panel. Icon: Beaker (48px,
text-tertiary). Headline: \"Your specification will appear here\" ---
text-lg, text-secondary. Subtext: \"Fill in the form and click
Generate\" --- text-sm, text-tertiary. Below: 3 mini-cards showing
sample capabilities (\"Substrate compatibility\", \"Property ranges\",
\"Risk assessment\") at 50% opacity.

**Loading State**

  -----------------------------------------------------------------------
  **Phase**               **Duration**            **Visual**
  ----------------------- ----------------------- -----------------------
  Phase 1: Analyzing      0-2s                    Pulsing dot +
                                                  \"Analyzing substrate
                                                  compatibility\...\"

  Phase 2: Processing     2-5s                    Progress bar +
                                                  \"Cross-referencing
                                                  150+ adhesive
                                                  profiles\...\"

  Phase 3: Generating     5-8s                    Streaming text effect
                                                  as results begin
                                                  appearing
  -----------------------------------------------------------------------

**Results State**

Results are displayed as a scrollable panel with the following sections
in order:

-   1\. Summary Header: Recommended adhesive type, confidence badge,
    one-line summary.

-   2\. Primary Recommendation Card: Full spec recommendation card (see
    Component 3.5).

-   3\. Properties Table: 2-column grid of all specification values in
    monospace.

-   4\. Compatibility Assessment: Color-coded badges for each substrate
    match quality.

-   5\. Risk Factors: Yellow/red-bordered cards for each identified
    risk.

-   6\. Alternative Specs: Collapsible accordion with 2-3 alternative
    recommendations.

-   7\. Action Bar: Sticky bottom bar with Export PDF, Request Review,
    New Analysis buttons.

**7. Page Specifications: Failure Analysis Tool**

Route: /failure

Purpose: Acquisition engine. Engineers searching for \"adhesive
failure\" or \"debonding\" land here. Must capture urgent, frustrated
users and deliver value immediately.

**7.1 Page Layout**

Same two-panel layout as Spec Tool for consistency. Left panel: failure
description form. Right panel: analysis results.

**7.2 Input Form**

**Form Fields**

  -----------------------------------------------------------------------------------
  **\#**         **Field**      **Type**       **Required**   **Help Text**
  -------------- -------------- -------------- -------------- -----------------------
  1              Failure        Textarea, 5    Yes            \"Describe what
                 Description    rows,                         happened: when did it
                                auto-focused                  fail, how did it fail,
                                                              what did the failure
                                                              look like?\"

  2              Adhesive Used  Text input     No             \"Product name or type
                                with typeahead                if known (e.g., Loctite
                                (common                       401, generic CA)\"
                                adhesive                      
                                types)                        

  3              Substrate A    Substrate      Yes            Same component as Spec
                                selector                      Tool

  4              Substrate B    Substrate      Yes            Same component as Spec
                                selector                      Tool

  5              Failure Mode   Visual radio   Yes            4 visual cards with
                                cards                         diagrams

  6              Time to        Select         No             Options: Immediate
                 Failure                                      (\<1hr), Short-term
                                                              (1-72hr), Medium (1-4
                                                              weeks), Long-term (\>1
                                                              month),
                                                              Cyclical/intermittent

  7              Environment    Multi-select   No             \"Conditions at time of
                 Conditions     chips (same as                failure\"
                                Spec Tool)                    

  8              Surface Prep   Multi-select   No             Chips: None, Wiped
                 Used           chips                         clean, Solvent
                                                              degrease, Abrasion,
                                                              Primer, Plasma/corona,
                                                              Unknown

  9              Test Results   File upload +  No             \"Attach test data or
                                textarea                      paste results\"

  10             Additional     Textarea, 3    No             \"Production volume,
                 Context        rows                          criticality, timeline
                                                              for resolution\"
  -----------------------------------------------------------------------------------

**Failure Mode Visual Cards**

These replace a standard radio button. Each card shows a simplified
cross-section diagram of the bond joint and where the failure occurred.
Engineers immediately recognize their failure pattern.

  -----------------------------------------------------------------------
  **Card**          **Diagram**       **Label**         **Description**
  ----------------- ----------------- ----------------- -----------------
  1                 Adhesive peels    Adhesive Failure  Bond released at
                    from substrate                      the interface
                    surface                             between adhesive
                                                        and substrate

  2                 Adhesive tears    Cohesive Failure  Adhesive itself
                    through the                         split apart while
                    middle                              remaining bonded
                                                        to both surfaces

  3                 Mix of adhesive   Mixed Mode        Partial interface
                    and cohesive                        failure + partial
                                                        bulk failure

  4                 Substrate         Substrate Failure The substrate
                    material broke                      material failed
                                                        before the
                                                        adhesive bond
  -----------------------------------------------------------------------

Card style: 120px tall, icon/diagram area (80px) + label + description.
Unselected: Level 1 card, border #374151. Selected: border-color
#3B82F6, background #0F1D32, check icon overlay. Cards in a 2x2 grid on
desktop, 1x4 stack on mobile.

**7.3 Results Panel**

The failure analysis results panel follows a diagnostic report format.
Engineers expect a structured analysis similar to an 8D or fishbone
report.

**Results Sections (Top to Bottom)**

-   1\. Diagnosis Summary: Top root cause, confidence level,
    one-paragraph explanation.

-   2\. Root Cause Ranking: Ordered cards (Rank 1, 2, 3\...) each with
    confidence, explanation, and mechanism. See Component 3.5.

-   3\. Contributing Factors: Bulleted list of secondary factors that
    may have contributed.

-   4\. Immediate Actions: High-priority numbered steps to address the
    failure now. Red-accented section header.

-   5\. Long-term Solutions: Structural changes to prevent recurrence.
    Blue-accented section header.

-   6\. Prevention Plan: Step-by-step prevention protocol. Numbered,
    checkboxes for tracking.

-   7\. Action Bar: Sticky bottom with Export PDF, Request Expert
    Review, Run Spec Analysis (pre-fills from failure data) buttons.

**8. Page Specifications: Results & Reports**

**8.1 PDF Export Specification**

The PDF export is a critical conversion tool. Engineers share these with
procurement, quality teams, and management. The PDF must look
professional enough to attach to an engineering change order.

  -----------------------------------------------------------------------
  **Section**                         **Content**
  ----------------------------------- -----------------------------------
  Header                              Gravix logo + \"Adhesive
                                      Specification Report\" or \"Failure
                                      Analysis Report\" + date + unique
                                      report ID

  Executive Summary                   3-5 sentence summary of inputs and
                                      primary recommendation/diagnosis

  Input Parameters                    Table of all user inputs

  Primary Result                      Full specification or root cause
                                      analysis

  Data Tables                         All property values, compatibility
                                      ratings, risk factors

  Recommendations                     Numbered action items

  Methodology Note                    \"This analysis was generated by
                                      Gravix AI engine. Recommendations
                                      should be validated through testing
                                      appropriate to your application.\"

  Footer                              \"Generated by Gravix.com \|
                                      gravix.com \| GLUE MASTERS LLC\" +
                                      page numbers
  -----------------------------------------------------------------------

**8.2 Executive Summary Layer**

This is the premium feature that converts free users to paid. It
transforms technical output into decision-maker language.

  -----------------------------------------------------------------------
  **Component**           **Free Tier**           **Pro Tier**
  ----------------------- ----------------------- -----------------------
  Technical results       Full access             Full access

  Executive summary       Blurred preview with    Full access
                          upgrade CTA overlay     

  Risk framing            Blurred                 Full: \"If this failure
                                                  recurs, estimated cost
                                                  is \$X-\$Y per incident
                                                  based on\...\"

  Procurement summary     Blurred                 Full: Table of spec
                                                  requirements for RFQ

  PDF export              Watermarked, no exec    Clean, full report
                          summary                 
  -----------------------------------------------------------------------

**Blur Overlay Spec**

For gated content: apply CSS filter: blur(6px) to the content area.
Overlay a semi-transparent card (rgba(10,22,40,0.85)) centered on the
blurred area. Card contains: Lock icon (32px), \"Upgrade to Pro\"
heading, one-line value prop, primary CTA button, \"\$29/month\" price
text. This must look like real, valuable content is just behind the blur
--- not a placeholder.

**9. Page Specifications: Pricing & Auth**

**9.1 Pricing Page**

Route: /pricing

  -----------------------------------------------------------------------
  **Element**             **Free Tier**           **Pro Tier**
  ----------------------- ----------------------- -----------------------
  Price                   \$0                     \$29/month

  Badge                   None                    \"Most Popular\" accent
                                                  pill

  Analyses                3 per month             Unlimited

  Spec Engine             Full results            Full results

  Failure Analysis        Full results            Full results

  Executive Summary       Preview only            Full access

  PDF Export              Watermarked             Clean, branded

  History                 None (results not       Full analysis history
                          saved)                  

  Priority                Standard                Priority processing

  CTA                     \"Get Started Free\"    \"Start Pro Trial\"
  -----------------------------------------------------------------------

Layout: Two cards side by side, centered on page. Pro card is visually
elevated (Level 2 + accent border-top 3px). Free card is Level 1. Below
cards: FAQ accordion with 5-6 common questions. Background: #0A1628.

**9.2 Authentication**

Auth is a modal overlay, not a separate page. This prevents breaking
user flow. Uses magic link (email-based, passwordless) for V1 to reduce
friction. Engineers hate creating passwords for tools they are
evaluating.

  -----------------------------------------------------------------------
  **Property**                        **Value**
  ----------------------------------- -----------------------------------
  Modal size                          440px wide, auto height

  Background                          #1F2937

  Overlay                             rgba(0,0,0,0.7), click to dismiss

  Content                             Gravix logo, headline (\"Sign in to
                                      Gravix\" or \"Create your
                                      account\"), email input, submit
                                      button, toggle link (\"Already have
                                      an account?\" / \"Need an
                                      account?\")

  Submit button                       \"Send Magic Link →\" --- Primary,
                                      lg, full-width

  Success state                       Email icon + \"Check your inbox\" +
                                      \"We sent a login link to
                                      \[email\]\" + \"Didn\\\'t receive
                                      it? Resend\" link

  Animation                           Fade in 200ms + scale from 95% to
                                      100%
  -----------------------------------------------------------------------

**10. User Flows & State Machines**

**10.1 Primary Flow: Spec Analysis**

1.  User lands on /tool (via nav, CTA, or direct link)

2.  Substrate A auto-focused. User selects/types substrate.

3.  Tab to Substrate B. Select/type.

4.  Select Load Type from dropdown.

5.  Click Environment chips (one or more).

6.  Optionally fill Temperature, Cure, Gap Fill, Additional Context.

7.  Click \"Generate Specification.\"

8.  Form panel dims slightly (opacity 0.7). Results panel shows loading
    state.

9.  Results stream in over 3-8 seconds.

10. Results fully rendered. Action bar appears at bottom.

11. User can: Export PDF (if signed in or \<3 free), Request Review
    (triggers auth if not signed in), or Run New Analysis (resets form,
    preserves substrates).

**10.2 Primary Flow: Failure Analysis**

1.  User lands on /failure (via SEO, nav, or CTA)

2.  Failure Description textarea auto-focused.

3.  User describes the failure in natural language.

4.  Selects substrates (A and B).

5.  Clicks one of 4 Failure Mode visual cards.

6.  Optionally fills remaining fields.

7.  Click \"Analyze Failure.\"

8.  Loading sequence: Analyzing \> Cross-referencing \> Generating.

9.  Root causes stream in ranked order.

10. Full results rendered with action bar.

11. User can: Export PDF, Request Expert Review, or \"Run Spec
    Analysis\" (auto-fills spec form with failure data for corrective
    spec).

**10.3 Conversion Flow: Free to Pro**

1.  User completes 3rd free analysis.

2.  Results render normally but with blurred Executive Summary section.

3.  User clicks blur overlay → sees upgrade CTA.

4.  On 4th analysis attempt: form submit shows modal: \"You\\\'ve used
    your 3 free analyses this month. Upgrade to Pro for unlimited
    access.\"

5.  Modal has: feature comparison (mini pricing table), Primary CTA
    (\"Start Pro --- \$29/mo\"), Secondary (\"I\\\'ll wait\" dismisses
    modal).

6.  If user upgrades: Lemon Squeezy checkout flow. On success: redirect
    back with full access unlocked.

**10.4 State Machine: Analysis Request**

  -----------------------------------------------------------------------
  **State**         **Entry           **UI State**      **Exit
                    Condition**                         Transitions**
  ----------------- ----------------- ----------------- -----------------
  IDLE              Page load / reset Form editable,    VALIDATING (on
                                      results empty or  submit)
                                      previous          

  VALIDATING        Form submitted    Inline field      ERROR (validation
                                      validation,       fail) or
                                      button disabled   SUBMITTING

  SUBMITTING        Validation passed Button shows      PROCESSING (API
                                      spinner, form     accepted) or
                                      dims              ERROR (API fail)

  PROCESSING        API stream        Progress stepper  STREAMING (first
                    started           active, status    chunk received)
                                      messages rotate   

  STREAMING         First result      Results render    COMPLETE (stream
                    chunk             progressively     ended)

  COMPLETE          All results       Action bar        IDLE (new
                    rendered          visible, form     analysis) or
                                      re-enabled        EXPORTING

  EXPORTING         Export clicked    Generating PDF    COMPLETE (PDF
                                      toast             ready)

  ERROR             Any failure       Error toast +     IDLE (reset) or
                                      inline message,   SUBMITTING
                                      retry button      (retry)
  -----------------------------------------------------------------------

**11. Responsive Design Breakpoints**

  -----------------------------------------------------------------------
  **Breakpoint**          **Width**               **Key Layout Changes**
  ----------------------- ----------------------- -----------------------
  Mobile S                320-374px               Min supported. Single
                                                  column. Tighter padding
                                                  (12px). Substrate
                                                  selector goes
                                                  full-screen overlay.

  Mobile M                375-639px               Standard mobile. Single
                                                  column. 16px padding.
                                                  Failure mode cards:
                                                  1-column stack.

  Tablet                  640-1023px              6-column grid. Tool
                                                  form goes full-width
                                                  (no side-by-side
                                                  panels). Results below
                                                  form. Failure mode
                                                  cards: 2x2 grid.

  Desktop                 1024-1279px             12-column grid. Tool
                                                  uses 45/55 split
                                                  panels. All features
                                                  visible. Nav fully
                                                  expanded.

  Wide                    1280px+                 Same as Desktop but
                                                  with max-width: 1280px
                                                  centered. More
                                                  breathing room.
  -----------------------------------------------------------------------

**11.1 Critical Mobile Adaptations**

  -----------------------------------------------------------------------
  **Component**           **Desktop**             **Mobile**
  ----------------------- ----------------------- -----------------------
  Tool panels             Side-by-side 45/55      Stacked: form then
                                                  results

  Substrate selector      Inline dropdown below   Full-screen modal with
                          input                   search

  Failure mode cards      2x2 grid                1-column stack, 80px
                                                  tall

  Result cards            Full detail             Collapsible accordion
                                                  sections

  Action bar              Fixed bottom of results Fixed bottom of
                          panel                   viewport (60px, z-50)

  PDF export              Inline action           Share sheet integration
                                                  where available

  Navigation              Horizontal links        Hamburger menu,
                                                  full-screen overlay

  Tables (results)        Standard table          Card layout (label
                                                  above value)

  Confidence ring         48px with label         36px, label hidden
                                                  (tooltip)
  -----------------------------------------------------------------------

**12. Animation & Motion System**

Motion in Gravix is functional, not decorative. Every animation serves a
purpose: indicating state change, directing attention, or providing
feedback. The overall motion feel should be crisp and mechanical ---
like precision machinery, not bouncy consumer apps.

**12.1 Easing Curves**

  -----------------------------------------------------------------------
  **Name**                **CSS Value**           **Usage**
  ----------------------- ----------------------- -----------------------
  ease-out-crisp          cubic-bezier(0.16, 1,   Elements entering
                          0.3, 1)                 (modals, dropdowns,
                                                  results)

  ease-in-crisp           cubic-bezier(0.7, 0,    Elements exiting
                          0.84, 0)                

  ease-in-out-crisp       cubic-bezier(0.45, 0,   Transitions between
                          0.55, 1)                states

  linear                  linear                  Progress bars, loading
                                                  indicators
  -----------------------------------------------------------------------

**12.2 Duration Scale**

  -----------------------------------------------------------------------
  **Token**               **Duration**            **Usage**
  ----------------------- ----------------------- -----------------------
  instant                 75ms                    Color changes, opacity
                                                  toggles

  fast                    150ms                   Button hover, focus
                                                  rings, tooltips

  normal                  250ms                   Dropdowns, panel
                                                  transitions, card hover

  slow                    400ms                   Modal open/close, page
                                                  transitions

  deliberate              600ms                   Hero animations, result
                                                  card entrance
  -----------------------------------------------------------------------

**12.3 Key Animations**

  ----------------------------------------------------------------------------
  **Element**       **Trigger**       **Animation**          **Duration**
  ----------------- ----------------- ---------------------- -----------------
  Hero mockup card  Page load         fadeIn +               600ms, 300ms
                                      translateX(40px→0) +   delay
                                      slight rotate          

  Landing section   Scroll into view  fadeIn +               400ms, stagger
                                      translateY(20px→0)     100ms per element

  Dropdown open     Click/focus       opacity 0→1 +          150ms
                                      translateY(-4px→0)     ease-out-crisp

  Results streaming AI chunk received fadeIn + slideDown per 250ms, stagger as
                                      section                data arrives

  Confidence ring   Results complete  Ring fills clockwise   600ms
                                      from 0% to final value ease-out-crisp

  Toast enter       Notification      slideIn from right +   300ms
                    trigger           fadeIn                 ease-out-crisp

  Toast exit        Timeout/dismiss   fadeOut +              200ms
                                      translateX(20px)       ease-in-crisp

  Modal open        Auth/upgrade      overlay fadeIn 200ms + 250ms
                    trigger           modal scale(0.95→1)    ease-out-crisp
                                      250ms                  

  Button hover      Mouse enter       background-color       150ms
                                      transition             

  Card hover        Mouse enter       translateY(-1px) +     250ms
                                      shadow increase        ease-out-crisp

  Form field focus  Focus event       border-color           150ms
                                      transition + ring      
                                      appear                 

  Page transition   Route change      fadeOut 150ms + fadeIn 400ms total
                                      250ms (content area    
                                      only, nav persists)    
  ----------------------------------------------------------------------------

**12.4 Reduced Motion**

When prefers-reduced-motion: reduce is active, all animations should be
replaced with simple opacity transitions (150ms) or disabled entirely.
Progress indicators remain animated (essential). The confidence ring
fills instantly. No transforms.

**13. Accessibility (WCAG 2.1 AA)**

**13.1 Requirements**

-   All interactive elements have visible focus indicators (2px accent
    ring, 2px offset).

-   All form inputs have associated \<label\> elements (not just
    placeholder text).

-   Color is never the sole indicator of state (always paired with
    text/icon).

-   All images and icons have descriptive alt text or aria-label.

-   Keyboard navigation follows logical tab order (left panel
    top-to-bottom, then right panel).

-   Dropdowns and modals trap focus when open.

-   Escape key closes all overlays (dropdowns, modals, mobile nav).

-   Results sections have aria-live=\"polite\" for screen reader
    announcement when content changes.

-   Loading states announce progress via aria-live regions.

-   Minimum touch target: 44x44px on mobile.

-   Skip-to-content link as first focusable element.

-   Semantic HTML: \<main\>, \<nav\>, \<aside\>, \<section\>,
    \<article\> used correctly.

**13.2 Contrast Ratios (Verified)**

  ---------------------------------------------------------------------------------
  **Combination**   **Foreground**   **Background**   **Ratio**      **Pass**
  ----------------- ---------------- ---------------- -------------- --------------
  Primary text on   #F9FAFB          #0A1628          15.2:1         AAA
  brand                                                              

  Secondary text on #9CA3AF          #0A1628          7.1:1          AAA
  brand                                                              

  Accent on brand   #3B82F6          #0A1628          4.8:1          AA

  White on accent   #FFFFFF          #3B82F6          4.6:1          AA
  button                                                             

  Danger text on    #EF4444          #0A1628          4.9:1          AA
  brand                                                              

  Success text on   #10B981          #0A1628          5.7:1          AA
  brand                                                              
  ---------------------------------------------------------------------------------

**14. Error States & Edge Cases**

**14.1 Form Validation Errors**

  -----------------------------------------------------------------------
  **Error**               **Trigger**             **Display**
  ----------------------- ----------------------- -----------------------
  Required field empty    Submit with empty       Field border turns red.
                          required field          Error text below:
                                                  \"\[Field name\] is
                                                  required.\" Scroll to
                                                  first error.

  Same substrate A and B  Both fields match       Warning (not error):
                                                  \"Both substrates are
                                                  the same. This is valid
                                                  for self-bonding
                                                  applications.\" Yellow
                                                  border.

  Temperature range       Min \> Max              Error: \"Minimum
  invalid                                         temperature must be
                                                  less than maximum.\"

  Gap fill out of range   Value \> 25mm or \< 0   Error: \"Gap fill
                                                  range: 0.01mm to
                                                  25mm.\"

  Text too long           Textarea \>2000 chars   Character counter turns
                                                  red. Truncation
                                                  warning.
  -----------------------------------------------------------------------

**14.2 API & System Errors**

  -----------------------------------------------------------------------
  **Error**               **Response**            **UI Treatment**
  ----------------------- ----------------------- -----------------------
  API timeout (\>30s)     No response from AI     Cancel loading. Show:
                                                  \"Analysis took too
                                                  long. This usually
                                                  means high demand.
                                                  Please try again.\"
                                                  Retry button.

  API error (500)         Server error            Error toast + inline:
                                                  \"Something went wrong
                                                  on our end. Your inputs
                                                  are saved. Please
                                                  retry.\" Retry +
                                                  Contact buttons.

  Rate limit (429)        Too many requests       Warning toast: \"Please
                                                  wait a moment before
                                                  submitting another
                                                  analysis.\" Disable
                                                  submit for 30s with
                                                  countdown.

  Network offline         No connectivity         Banner at top: \"You
                                                  appear to be offline.
                                                  Results cannot be
                                                  generated.\" Dismiss
                                                  when online.

  Auth expired            401 on API call         Subtle auth modal:
                                                  \"Your session expired.
                                                  Sign in to continue.\"
                                                  Preserves form state.

  Free tier exhausted     User at limit           Upgrade modal (see Flow
                                                  10.3)
  -----------------------------------------------------------------------

**14.3 Edge Cases**

  -----------------------------------------------------------------------
  **Case**                            **Handling**
  ----------------------------------- -----------------------------------
  User refreshes during analysis      If results were streaming, show:
                                      \"Your last analysis was
                                      interrupted. Run again?\" with
                                      pre-filled form (if form state was
                                      in URL params or localStorage).

  User navigates away during analysis Cancel API call silently. No
                                      warning dialog (annoying for
                                      engineers).

  Very long AI response               Results panel scrolls
                                      independently. Sticky action bar
                                      stays visible.

  AI returns low confidence (\<50%)   Prominent warning banner in
                                      results: \"Low confidence analysis.
                                      Results should be verified through
                                      testing.\" CTA: \"Request Expert
                                      Review\"

  Unknown substrate entered           Accept the custom entry. AI prompt
                                      includes: \"User specified custom
                                      substrate: \[value\]. Analyze based
                                      on available information and note
                                      uncertainty.\"

  Browser back button                 Returns to form with inputs
                                      preserved. Results cleared.

  Multiple rapid submissions          Debounce: disable submit for 2s
                                      after click. If already processing,
                                      ignore.
  -----------------------------------------------------------------------

**15. Performance Budgets**

  -----------------------------------------------------------------------
  **Metric**              **Target**              **Measurement**
  ----------------------- ----------------------- -----------------------
  First Contentful Paint  \<1.2s                  Lighthouse, mobile 4G

  Largest Contentful      \<2.0s                  Lighthouse, mobile 4G
  Paint                                           

  Cumulative Layout Shift \<0.05                  No layout jumps when
                                                  results load

  First Input Delay       \<50ms                  Form interaction
                                                  responsiveness

  Time to Interactive     \<2.5s                  Form usable and
                                                  responsive

  Total bundle size (JS)  \<150KB gzipped         Main bundle only

  Font loading            \<500ms                 Subset + swap display
                                                  strategy

  AI response start       \<2s                    Time from submit to
                                                  first streaming chunk

  AI response complete    \<10s                   Full analysis
                                                  generation
  -----------------------------------------------------------------------

**15.1 Optimization Strategies**

-   Route-based code splitting: /tool and /failure load form+result
    components on demand.

-   Font subsetting: Only load Latin character set for JetBrains Mono
    and DM Sans.

-   Image optimization: No images in V1 except logo (SVG). Landing page
    mockups are CSS-only or SVG.

-   Static generation: Landing page and pricing page are statically
    generated at build time.

-   API streaming: Claude API response streams to client via SSE,
    enabling progressive rendering.

-   Form state persistence: URL search params encode substrate
    selections for shareable/bookmarkable states.

-   Prefetch: When user starts typing in form, prefetch the API route to
    warm the connection.

**16. Implementation Priorities**

Build order optimized for fastest path to a working product that
generates value (email captures + tool usage).

**16.1 Phase 1: Core Tool (Days 1-8)**

  -----------------------------------------------------------------------
  **Day**                 **Deliverable**         **UI Components
                                                  Needed**
  ----------------------- ----------------------- -----------------------
  1-2                     Project setup + design  CSS variables,
                          system tokens           typography, spacing,
                                                  button components

  3                       Navigation + layout     Nav bar, page layout,
                          shell                   footer

  4-5                     Spec Engine form        All input components,
                                                  substrate selector,
                                                  form validation

  6-7                     Spec Engine results +   Result cards,
                          AI integration          confidence indicator,
                                                  loading states,
                                                  streaming UI

  8                       Failure Analysis form + Failure mode cards,
                          results                 reuse spec components +
                                                  failure-specific cards
  -----------------------------------------------------------------------

**16.2 Phase 2: Conversion (Days 9-13)**

  -----------------------------------------------------------------------
  **Day**                 **Deliverable**         **UI Components
                                                  Needed**
  ----------------------- ----------------------- -----------------------
  9                       Landing page            Hero section, problem
                                                  cards, solution blocks,
                                                  CTA section

  10                      Auth flow               Auth modal, magic link
                                                  flow, session
                                                  management

  11                      Usage tracking + free   Usage counter badge,
                          tier limits             limit modal, blur
                                                  overlay

  12                      Pricing page            Pricing cards, FAQ
                                                  accordion

  13                      PDF export              Report generation,
                                                  download flow
  -----------------------------------------------------------------------

**16.3 Phase 3: Polish (Days 14-18)**

  -----------------------------------------------------------------------
  **Day**                 **Deliverable**         **UI Components
                                                  Needed**
  ----------------------- ----------------------- -----------------------
  14                      Responsive design pass  Mobile nav, substrate
                                                  full-screen selector,
                                                  stacked layouts

  15                      Animation               All motion specs from
                          implementation          Section 12

  16                      Error states + edge     All error UIs from
                          cases                   Section 14

  17                      Accessibility audit +   Focus management, ARIA,
                          fixes                   keyboard nav, contrast
                                                  verification

  18                      Performance             Bundle analysis,
                          optimization + QA       lighthouse audit,
                                                  cross-browser testing
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **IMPLEMENTATION NOTE FOR OPENCLAW AGENT**                            |
|                                                                       |
| This UI spec is designed to be directly implementable with Next.js 14 |
| (App Router) + Tailwind CSS + Supabase. All color tokens map to       |
| Tailwind custom config. Component specs include exact pixel values    |
| for Tailwind utility classes. The substrate selector and confidence   |
| indicator are custom React components. All other components can be    |
| built from Tailwind primitives or shadcn/ui as a base. Refer to the   |
| full technical spec (gravix-full-spec.md) for API contracts, database |
| schema, and AI prompt specifications.                                 |
+-----------------------------------------------------------------------+

---

