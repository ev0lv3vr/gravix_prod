-- ============================================
-- GRAVIX V2 — SEED DATA: MATERIALS REFERENCE
-- Run after 001_initial_schema.sql
-- ============================================

-- Clear existing seed data (idempotent)
DELETE FROM public.materials WHERE TRUE;

-- ============================================
-- CYANOACRYLATES
-- ============================================

INSERT INTO public.materials (category, subcategory, name, description, properties, compatible_substrates, incompatible_substrates, common_failure_modes, application_guidelines, typical_applications)
VALUES

('adhesive', 'cyanoacrylate', 'General Purpose Ethyl CA',
 'Most common cyanoacrylate type. Good all-around adhesive for plastics, rubber, and most materials. Best on non-porous substrates.',
 '{"viscosity_range": "1-100 cP", "shear_strength": "2000-3500 PSI", "tensile_strength": "2500-4000 PSI", "temp_range": "-54°C to 82°C", "cure_method": "moisture-initiated", "fixture_time": "10-30 seconds", "full_cure": "24-72 hours", "gap_fill": "0.1-0.2mm"}',
 '["aluminum", "steel", "stainless steel", "copper", "ABS", "polycarbonate", "PVC", "nylon", "natural rubber", "neoprene", "nitrile", "ceramics", "glass"]',
 '["polyethylene (PE)", "polypropylene (PP)", "PTFE (Teflon)", "silicone rubber"]',
 '["debonding on contaminated surfaces", "blooming (white residue) in high humidity", "brittleness under impact", "poor gap fill performance", "thermal shock failure above 80°C"]',
 'Apply to one surface only. Use thin layer — excess slows cure. Ensure moisture present (humidity >40% ideal). Press parts together immediately. Fixture in 10-30 seconds.',
 ARRAY['electronics assembly', 'plastics bonding', 'rubber repair', 'general manufacturing', 'model building']),

('adhesive', 'cyanoacrylate', 'Methyl CA',
 'Best adhesive for metals and glass. Slightly lower shelf life than ethyl CA but superior metal bonding.',
 '{"viscosity_range": "5-50 cP", "shear_strength": "2500-4000 PSI", "temp_range": "-54°C to 82°C", "cure_method": "moisture-initiated", "fixture_time": "5-20 seconds", "full_cure": "24-48 hours", "gap_fill": "0.1mm"}',
 '["aluminum", "steel", "stainless steel", "copper", "brass", "glass", "ceramics"]',
 '["polyethylene (PE)", "polypropylene (PP)", "PTFE", "acidic woods"]',
 '["debonding from contaminated metal surfaces", "stress cracking on some plastics", "brittleness", "moisture degradation"]',
 'Best for metal-to-metal and metal-to-glass bonds. Abrade metals lightly before bonding. Store refrigerated for extended shelf life.',
 ARRAY['metal assembly', 'glass bonding', 'precision instruments', 'jewelry']),

('adhesive', 'cyanoacrylate', 'Rubber-Toughened CA',
 'Modified CA with rubber micro-particles for improved impact and peel resistance. Higher viscosity, better gap fill.',
 '{"viscosity_range": "100-3000 cP", "shear_strength": "2500-4000 PSI", "peel_strength": "high", "temp_range": "-54°C to 120°C", "cure_method": "moisture-initiated", "fixture_time": "30-60 seconds", "full_cure": "24-72 hours", "gap_fill": "up to 0.5mm"}',
 '["metals", "plastics", "rubber", "flexible substrates", "dissimilar materials"]',
 '["PE", "PP", "PTFE", "silicone"]',
 '["slower fixture time may cause alignment issues", "thicker bondline may be visible", "higher cost"]',
 'Ideal for applications requiring impact resistance or bonding dissimilar materials with different CTEs. Apply slightly thicker layer than standard CA.',
 ARRAY['automotive trim', 'speaker assembly', 'vibration-prone assemblies', 'dissimilar material bonding']),

('adhesive', 'cyanoacrylate', 'Surface Insensitive CA',
 'Formulated to cure on acidic and porous surfaces where standard CA is slow or fails. Contains activators.',
 '{"viscosity_range": "20-500 cP", "shear_strength": "1500-3000 PSI", "temp_range": "-54°C to 82°C", "cure_method": "moisture-initiated (tolerant)", "fixture_time": "15-45 seconds", "full_cure": "24-72 hours", "gap_fill": "0.2mm"}',
 '["wood", "leather", "paper", "cardboard", "cotton", "cork", "acidic surfaces", "all standard substrates"]',
 '["PE", "PP", "PTFE"]',
 '["lower ultimate strength than standard grades", "may still bloom in very high humidity"]',
 'Use when bonding porous or acidic materials. No primer needed for wood. Good for mixed substrate assemblies involving wood or paper.',
 ARRAY['woodworking', 'leather craft', 'bookbinding', 'pen turning', 'mixed material assembly']),

('adhesive', 'cyanoacrylate', 'Low-Odor/Low-Bloom CA',
 'Ethyl-based CA with reduced vapor emission. Prevents white residue (blooming) around bondline.',
 '{"viscosity_range": "20-200 cP", "shear_strength": "2000-3000 PSI", "temp_range": "-54°C to 82°C", "cure_method": "moisture-initiated", "fixture_time": "20-60 seconds", "full_cure": "24-72 hours", "bloom": "minimal"}',
 '["electronics", "optical components", "medical devices", "clean room assemblies"]',
 '["PE", "PP", "PTFE"]',
 '["slightly slower cure than standard", "higher cost", "may have lower ultimate strength"]',
 'Required for applications where blooming is unacceptable (optics, electronics near sensitive components). Store sealed.',
 ARRAY['electronics', 'optical assembly', 'medical devices', 'forensics', 'clean room']),

-- ============================================
-- EPOXIES
-- ============================================

('adhesive', 'epoxy', 'Two-Part Structural Epoxy',
 'Workhorse structural adhesive. Excellent strength, chemical resistance, and gap fill. Most versatile epoxy type.',
 '{"viscosity_range": "5000-50000 cP", "shear_strength": "3000-5000 PSI", "tensile_strength": "4000-8000 PSI", "temp_range": "-55°C to 150°C", "cure_method": "chemical reaction (2-part)", "pot_life": "30-90 minutes", "full_cure": "24 hours RT", "gap_fill": "excellent (up to several mm)"}',
 '["metals", "composites", "ceramics", "glass", "most plastics", "concrete", "stone", "wood"]',
 '["PE", "PP", "PTFE", "silicone rubber (poor without primer)"]',
 '["improper mix ratio", "insufficient cure time/temperature", "stress concentration at bond edges", "moisture contamination during cure", "exotherm on large volumes"]',
 'Mix thoroughly per manufacturer ratio. Apply to both surfaces for maximum strength. Clamp with even pressure. Room temperature cure 24h for full properties. Heat post-cure increases performance.',
 ARRAY['structural bonding', 'aerospace', 'automotive', 'marine', 'construction', 'general manufacturing']),

('adhesive', 'epoxy', 'Fast-Cure Epoxy (5-minute)',
 'Rapid cure for quick repairs and low-volume production. Lower ultimate strength than slow-cure grades.',
 '{"viscosity_range": "10000-30000 cP", "shear_strength": "2000-3500 PSI", "temp_range": "-40°C to 120°C", "cure_method": "chemical reaction", "pot_life": "3-5 minutes", "full_cure": "1 hour", "gap_fill": "good"}',
 '["metals", "plastics", "ceramics", "glass", "wood"]',
 '["PE", "PP", "PTFE"]',
 '["exotherm on large volumes (dangerous)", "lower strength than slow-cure", "poor performance in thin bondlines", "rapid pot life limits working time"]',
 'Mix small batches only — exotherm can be severe on large volumes. Apply immediately after mixing. Clamp within pot life.',
 ARRAY['field repairs', 'prototyping', 'hobby', 'quick assembly']),

('adhesive', 'epoxy', 'High-Temperature Epoxy',
 'Heat-cure epoxy for extreme temperature service. Requires oven or autoclave curing.',
 '{"viscosity_range": "20000-100000 cP", "shear_strength": "3500-6000 PSI", "tensile_strength": "6000-12000 PSI", "temp_range": "-55°C to 260°C", "cure_method": "heat cure required", "cure_schedule": "1-2 hours at 150°C", "gap_fill": "excellent"}',
 '["metals", "ceramics", "high-temp composites", "glass"]',
 '["thermoplastics (may deform during cure)", "PE", "PP"]',
 '["requires heat cure equipment", "brittle if overcured", "thermal stress on cooldown", "long cure cycles"]',
 'Requires oven or autoclave. Follow manufacturer cure schedule precisely. Ramp rate matters — too fast causes thermal stress. Cool slowly.',
 ARRAY['aerospace', 'automotive under-hood', 'industrial ovens', 'exhaust systems', 'turbine components']),

('adhesive', 'epoxy', 'Flexible Epoxy',
 'Modified epoxy with flexibilizer for improved impact and thermal cycling resistance. Sacrifices some peak strength.',
 '{"viscosity_range": "10000-40000 cP", "shear_strength": "1500-3000 PSI", "elongation": "5-15%", "temp_range": "-55°C to 120°C", "cure_method": "chemical reaction", "pot_life": "30-60 minutes", "shore_hardness": "Shore D 60-80"}',
 '["metals", "plastics", "composites", "dissimilar materials"]',
 '["PE", "PP", "PTFE"]',
 '["lower peak strength than rigid epoxy", "may creep under sustained load", "reduced chemical resistance"]',
 'Use where thermal cycling, vibration, or impact are concerns. Good for bonding dissimilar materials with different CTEs.',
 ARRAY['electronics potting', 'vibration damping', 'thermal cycling applications', 'dissimilar material bonding']),

-- ============================================
-- POLYURETHANES
-- ============================================

('adhesive', 'polyurethane', 'Flexible Polyurethane (1-part)',
 'Moisture-curing flexible adhesive. Excellent for outdoor use and materials with different thermal expansion.',
 '{"viscosity_range": "5000-30000 cP", "shear_strength": "800-2000 PSI", "elongation": "200-500%", "temp_range": "-40°C to 80°C", "cure_method": "moisture cure (1-part)", "tack_free": "2-4 hours", "full_cure": "24-72 hours", "shore_hardness": "Shore A 40-90"}',
 '["metals", "plastics", "rubber", "wood", "concrete", "foam", "fabric"]',
 '["PE (poor without treatment)", "PP (poor without treatment)", "PTFE", "oily surfaces"]',
 '["moisture sensitivity before cure", "slow cure in dry conditions", "yellowing in UV", "foaming if excess moisture"]',
 'Apply to clean, dry surfaces. Clamp or weight during cure. Humidity accelerates cure. Protect from UV after cure if discoloration matters.',
 ARRAY['construction', 'automotive windshields', 'marine', 'shoe manufacturing', 'foam bonding']),

('adhesive', 'polyurethane', 'Structural Polyurethane (2-part)',
 'Two-part PU for higher strength structural bonds while maintaining flexibility. Good on SMC and composites.',
 '{"viscosity_range": "10000-50000 cP", "shear_strength": "2000-3500 PSI", "temp_range": "-40°C to 90°C", "cure_method": "chemical reaction (2-part)", "pot_life": "10-30 minutes", "full_cure": "24 hours"}',
 '["metals", "plastics", "composites", "SMC/BMC", "fiberglass", "wood"]',
 '["PE", "PP", "PTFE", "wet substrates (foaming risk)"]',
 '["mix ratio sensitivity", "foaming if substrates wet", "pot life management", "lower strength than epoxy"]',
 'Ensure substrates are dry — moisture causes foaming. Mix precisely to manufacturer ratio. Good for large area bonding.',
 ARRAY['automotive panels', 'truck body assembly', 'composite bonding', 'marine']),

-- ============================================
-- SILICONES
-- ============================================

('adhesive', 'silicone', 'RTV Silicone (Room Temperature Vulcanizing)',
 'Extremely flexible sealant/adhesive. Outstanding temperature range and chemical resistance. Low strength.',
 '{"viscosity_range": "20000-100000 cP", "tensile_strength": "200-600 PSI", "elongation": "300-600%", "temp_range": "-60°C to 200°C", "cure_method": "moisture (RTV)", "tack_free": "15-60 minutes", "full_cure": "24-72 hours"}',
 '["glass", "metals", "ceramics", "many plastics", "painted surfaces"]',
 '["PE", "PP (poor)", "PTFE", "some plastics require primer"]',
 '["low structural strength", "primer often needed for durability", "slow deep-section cure", "acetic acid off-gas (acetoxy types)"]',
 'Primer recommended for most substrates for long-term durability. Allow moisture access for cure (don''t seal both sides). Neutral cure types for sensitive substrates.',
 ARRAY['gasket making', 'sealing', 'potting', 'electronics encapsulation', 'glass bonding', 'HVAC']),

('adhesive', 'silicone', 'High-Temperature Silicone',
 'Specialized silicone for extreme temperature service up to 315°C continuous.',
 '{"viscosity_range": "50000-200000 cP", "tensile_strength": "400-800 PSI", "temp_range": "-65°C to 315°C", "cure_method": "heat or RTV", "elongation": "200-400%"}',
 '["metals", "ceramics", "glass", "high-temp alloys"]',
 '["most plastics (melt at service temp)", "PE", "PP"]',
 '["requires primer on most substrates", "low shear strength", "slow cure for thick sections"]',
 'Use where extreme temperature resistance is primary requirement. Always use manufacturer-recommended primer for durability.',
 ARRAY['exhaust systems', 'oven seals', 'furnace gaskets', 'aerospace', 'industrial ovens']),

-- ============================================
-- ACRYLICS
-- ============================================

('adhesive', 'acrylic', 'Structural Acrylic (MMA)',
 'Two-part methacrylate adhesive. Bonds many substrates including difficult plastics. Strong odor but excellent performance.',
 '{"viscosity_range": "10000-100000 cP (paste)", "shear_strength": "3000-5000 PSI", "temp_range": "-40°C to 120°C", "cure_method": "chemical reaction (free-radical)", "pot_life": "3-15 minutes", "fixture_time": "5-15 minutes", "full_cure": "24 hours"}',
 '["metals", "plastics (including PP/PE with primer)", "composites", "painted surfaces", "galvanized steel", "SMC"]',
 '["PTFE", "silicone rubber"]',
 '["strong odor (ventilation required)", "flammable", "mix ratio sensitivity", "pot life management", "exotherm on thick bondlines"]',
 'Ensure good ventilation. Can bond many plastics without primer. Surface prep: degrease and light abrade. Avoid acetone on polycarbonate (stress cracking).',
 ARRAY['automotive panels', 'marine', 'sign making', 'composite repair', 'plastic assembly']),

-- ============================================
-- ANAEROBICS
-- ============================================

('adhesive', 'anaerobic', 'Thread Locker',
 'Cures in absence of air between close-fitting metal surfaces. Available in various strengths (low/medium/high).',
 '{"viscosity_range": "10-500 cP", "shear_strength": "varies by grade", "temp_range": "-55°C to 150°C", "cure_method": "absence of air + metal ions", "fixture_time": "10-30 minutes", "full_cure": "24 hours"}',
 '["ferrous metals", "plated metals", "stainless steel", "brass", "aluminum"]',
 '["plastics (no cure)", "non-metallic surfaces", "large gaps (>0.5mm)"]',
 '["won''t cure on plastics", "requires metal contact for cure initiation", "won''t cure in large gaps", "primer needed for inactive metals"]',
 'Apply to clean, oil-free threads. Use primer on inactive metals (zinc, stainless). Choose strength grade: low (removable), medium (removable with tools), high (permanent).',
 ARRAY['fastener locking', 'machine assembly', 'vibration resistance', 'thread sealing']),

('adhesive', 'anaerobic', 'Retaining Compound',
 'For bonding cylindrical assemblies (bearings, bushings, pins). High shear strength in thin gaps.',
 '{"viscosity_range": "500-5000 cP", "shear_strength": "2000-4000 PSI", "temp_range": "-55°C to 175°C", "cure_method": "absence of air + metal ions", "gap_fill": "0.1-0.25mm", "fixture_time": "15-30 minutes"}',
 '["ferrous metals", "plated metals", "stainless steel"]',
 '["plastics", "non-metallic surfaces", "gaps > 0.25mm"]',
 '["limited gap fill", "requires metal ions for cure", "inactive metals need primer", "removal requires heat"]',
 'Clean parts with solvent. Apply retaining compound to shaft or bore. Assemble with slight rotation. Allow 24h cure before loading.',
 ARRAY['bearing retention', 'bushing bonding', 'keyless shaft mounting', 'rotor-shaft assemblies']);

-- ============================================
-- SEED: SAMPLE CASE LIBRARY ENTRIES
-- ============================================

INSERT INTO public.case_library (title, summary, material_category, material_subcategory, failure_mode, root_cause, contributing_factors, solution, prevention_tips, lessons_learned, industry, application_type, tags, is_featured, slug, meta_description)
VALUES

('Cyanoacrylate Debonding on Anodized Aluminum',
 'A consumer electronics manufacturer experienced systematic debonding of CA glue joints between anodized aluminum housings and polycarbonate windows after 2-3 weeks in service.',
 'adhesive', 'cyanoacrylate', 'debonding',
 'Anodized aluminum oxide layer acting as weak boundary layer. Standard IPA cleaning insufficient.',
 ARRAY['Thermal cycling between -5°C and 45°C during shipping', 'Variable humidity in assembly area', 'No fixture time specification in work instructions'],
 'Implemented plasma treatment of aluminum surfaces before bonding. Switched to rubber-toughened CA for improved thermal cycling resistance. Added surface energy verification step (water contact angle <30°).',
 'Always verify surface preparation effectiveness with water contact angle or dyne pen test. Anodized surfaces require more aggressive preparation than bare aluminum.',
 'Surface preparation shortcuts are the #1 cause of CA bond failures in production. A 30-second plasma treatment or abrasion step saves thousands in warranty costs.',
 'consumer electronics', 'structural bonding',
 ARRAY['cyanoacrylate', 'aluminum', 'polycarbonate', 'debonding', 'surface prep', 'anodized'],
 TRUE,
 'cyanoacrylate-debonding-anodized-aluminum',
 'Case study: How a consumer electronics manufacturer solved systematic CA glue debonding on anodized aluminum using plasma treatment and rubber-toughened CA.'),

('Epoxy Cracking in Outdoor LED Display',
 'LED display modules bonded with two-part epoxy developed cracks and partial debonding after one winter season of outdoor exposure.',
 'adhesive', 'epoxy', 'cracking',
 'Rigid epoxy unable to accommodate thermal expansion differential between aluminum frame (CTE 23 ppm/°C) and glass cover (CTE 9 ppm/°C) during -25°C to +60°C cycling.',
 ARRAY['Adhesive was specified for strength only, flexibility not considered', 'No thermal cycling testing performed before production', 'Bondline was too thin (<0.5mm) providing no compliance'],
 'Switched to flexible epoxy (Shore D 65) with 0.8mm controlled bondline thickness using spacer beads. Passed 500 thermal cycles -40°C to +85°C without failure.',
 'For outdoor applications with dissimilar materials, always calculate CTE mismatch and select adhesive flexibility accordingly. Minimum bondline thickness of 0.5mm for thermal cycling applications.',
 'Strength alone is not enough. The highest-strength adhesive is often the worst choice for applications with significant thermal cycling or CTE mismatch.',
 'electronics', 'outdoor encapsulation',
 ARRAY['epoxy', 'cracking', 'thermal cycling', 'CTE mismatch', 'LED', 'outdoor'],
 TRUE,
 'epoxy-cracking-outdoor-led-display',
 'Case study: LED display manufacturer solved epoxy cracking by switching to flexible epoxy with controlled bondline thickness for thermal cycling.'),

('Blooming on Black Plastic Assembly',
 'White haze (blooming) appeared around CA bond joints on black ABS plastic housings within hours of assembly, creating unacceptable cosmetic defects.',
 'adhesive', 'cyanoacrylate', 'blooming',
 'Standard CA monomer vapor condensing as white poly(cyanoacrylate) powder on surfaces near the bond joint. High ambient humidity (70%+) in assembly area accelerated the effect.',
 ARRAY['Excess adhesive applied per joint', 'No climate control in assembly area', 'Parts stored in un-sealed containers post-bonding'],
 'Switched to low-bloom/low-odor CA grade. Reduced application amount by 50% using precision dispensing tips. Added humidity control to assembly area (target 40-50% RH). Implemented CA accelerator spray on outer surfaces to prevent vapor condensation.',
 'For any visible bond on dark surfaces, always specify low-bloom CA. Control humidity below 60% RH. Use minimum adhesive volume. Accelerator spray on surrounding surfaces locks down vapors.',
 'Blooming is almost always caused by too much adhesive + too much humidity. Fix both, or switch to low-bloom grade.',
 'consumer products', 'cosmetic assembly',
 ARRAY['cyanoacrylate', 'blooming', 'white residue', 'humidity', 'cosmetic', 'ABS'],
 TRUE,
 'ca-blooming-black-plastic-assembly',
 'Case study: Eliminating white blooming on black ABS plastic by switching to low-bloom CA, reducing volume, and controlling humidity.'),

('Silicone Adhesive Failure on Powder-Coated Steel',
 'RTV silicone gaskets systematically failed (adhesive failure) on powder-coated steel enclosures within 6 months of field service.',
 'adhesive', 'silicone', 'debonding',
 'No primer used on powder-coated surface. Silicone adhesives have inherently low adhesion to most coatings without primer, despite good mechanical properties.',
 ARRAY['Production team assumed silicone bonds to everything', 'No adhesion testing performed on actual production substrates', 'Powder coat surface energy lower than bare steel'],
 'Implemented silicone primer (SS4004P type) applied with 30-minute flash-off before silicone application. Pull adhesion increased from <50 PSI to >250 PSI. Zero field failures since implementation.',
 'Silicone adhesives almost always need primer for durable bonds, especially on coated, painted, or low-energy surfaces. Never skip adhesion testing on actual production substrates.',
 'The assumption that silicone bonds well to coated metals is one of the most common misconceptions in industrial adhesives. Always test, always prime.',
 'industrial equipment', 'gasketing',
 ARRAY['silicone', 'debonding', 'powder coat', 'primer', 'gasket', 'steel'],
 FALSE,
 'silicone-failure-powder-coated-steel',
 'Case study: RTV silicone gasket failure on powder-coated steel solved with proper primer application.'),

('Thread Locker Failure on Stainless Steel Fasteners',
 'Medium-strength thread locker failed to cure properly on stainless steel bolts, resulting in fasteners loosening under vibration.',
 'adhesive', 'anaerobic', 'debonding',
 'Stainless steel has low active metal ion content, insufficient to initiate anaerobic cure without primer/activator.',
 ARRAY['Work instruction did not specify primer for stainless steel', 'Assembly team accustomed to carbon steel where no primer is needed', 'No cure verification step in process'],
 'Added anaerobic activator/primer to work instructions for all stainless steel applications. Applied primer 5 minutes before thread locker. Implemented torque verification at 24 hours post-assembly.',
 'Anaerobic adhesives require active metal ions for cure. Stainless steel, zinc, and some plated metals are "inactive" — always use primer/activator on these substrates.',
 'Just because anaerobic thread locker works great on carbon steel does not mean it will cure on stainless. Always check substrate reactivity.',
 'machinery', 'fastener locking',
 ARRAY['anaerobic', 'thread locker', 'stainless steel', 'cure failure', 'primer', 'vibration'],
 FALSE,
 'thread-locker-failure-stainless-steel',
 'Case study: Anaerobic thread locker cure failure on stainless steel solved with proper activator/primer application.');
