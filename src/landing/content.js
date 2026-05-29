export const PILLARS = [
  {
    n: '01',
    emoji: '🎬',
    accent: 'saffron',
    title: 'Video-to-Recipe Intelligence',
    desc: 'Point Ruchi at any cooking video: TikTok, Instagram Reels, YouTube, or your own recordings. The AI watches, understands, and generates a fully structured recipe: ingredients with quantities, step-by-step instructions, cook times, and serving suggestions. Saved to your personal cookbook with a single tap, auto-tagged by cuisine, difficulty, and dietary profile.',
    tags: ['AI Vision', 'Video Analysis', 'Personal Cookbook', 'Auto-Tagging', 'Social Import'],
  },
  {
    n: '02',
    emoji: '🧺',
    accent: 'sage',
    title: 'Pantry-to-Plate Engine',
    desc: 'Scan your fridge or pantry with your camera. Ruchi identifies every visible ingredient and instantly surfaces recipes you can make right now, ranked by what you already have, dietary fit, and prep time. Each result carries a full nutritional breakdown, allergen flags, calorie counts, and macros. The gap between “I have food but nothing to eat” and “dinner is ready” disappears.',
    tags: ['Ingredient Scanner', 'Recipe Matching', 'Nutrition Data', 'Allergen Alerts', 'Macro Breakdown'],
  },
  {
    n: '03',
    emoji: '❤️',
    accent: 'terra',
    title: 'Personalised Health & Diet Coach',
    desc: 'Ruchi learns your dietary goals, health conditions, food preferences, and activity levels to become a proactive nutrition companion. It tracks calories and macros effortlessly, suggests tailored meal plans, recommends healthier swaps, and adapts in real time as your goals evolve, grounded in validated nutritional science, not generic advice.',
    tags: ['Calorie Tracking', 'Smart Swaps', 'Personalised Plans', 'Progress Analytics', 'Adaptive Coaching'],
  },
]

export const INTEGRATIONS = [
  { icon: '🛒', title: 'Grocery Delivery', desc: 'Missing an ingredient for tonight? Ruchi auto-fills a cart with exactly what the recipe needs and orders through your preferred partner in one tap.', ex: 'Instacart · Amazon Fresh · DoorDash · Shipt' },
  { icon: '⌚', title: 'Wearables & Fitness', desc: 'Activity data syncs in real time to recalibrate calorie targets, macro splits, and meal suggestions. A 10km run reshapes dinner automatically.', ex: 'Apple Health · Fitbit · Garmin · Whoop · Google Fit' },
  { icon: '🤖', title: 'AI Meal Planning', desc: 'Weekly plans auto-generated from pantry inventory, goals, preferences, calendar, and budget, refreshed every Sunday night, hands-free.', ex: 'GPT-4o Vision · Claude AI · Custom LLM Pipeline' },
  { icon: '👥', title: 'Social & Community', desc: 'Share recipes, cookbooks, and milestones with friends. Challenge groups, leaderboards, and collaborative planning make eating well social.', ex: 'Friends Feed · Cookbook Sharing · Challenges · Leaderboards' },
  { icon: '📱', title: 'Social Video Import', desc: 'One-tap import of cooking videos from social platforms, with no copy-pasting links. Ruchi reads the native share sheet on iOS and Android.', ex: 'TikTok · Instagram · YouTube · Pinterest · Facebook' },
  { icon: '📅', title: 'Calendar & Scheduling', desc: 'Plans map against your calendar. A packed Tuesday surfaces 15-minute recipes; a free Sunday suggests something ambitious.', ex: 'Google Calendar · Apple Calendar · Outlook' },
  { icon: '🏥', title: 'Health Records', desc: 'An optional, privacy-first integration aligns nutrition guidance with medical conditions, prescribed restrictions, or blood-work-informed targets.', ex: 'Apple Health Records · MyFitnessPal · HealthKit' },
]

export const DAY = [
  { time: '07:30', label: 'Morning', text: 'Open Ruchi to a personalised breakfast suggestion based on what’s in the fridge and today’s calorie target. One-tap log after eating.' },
  { time: '12:00', label: 'Lunchtime', text: 'A cooking reel scrolls by on Instagram. Tap “Extract Recipe” and Ruchi captures every step, saves it, and adds the two missing ingredients to your grocery list.' },
  { time: '14:00', label: 'Afternoon', text: 'Instacart delivers the two flagged ingredients. Ruchi confirms the pantry is now complete for tonight’s dinner.' },
  { time: '18:30', label: 'Dinner', text: 'Follow the guided recipe with step-by-step instructions. Log the meal. Your daily nutrition summary updates instantly.' },
  { time: '21:00', label: 'Evening', text: 'Review progress toward weekly goals. Ruchi auto-generates tomorrow’s plan, adjusting for the 3km walk synced from Apple Health.' },
]

export const STATS = [
  { num: '$220B', label: 'Global digital health & food-tech market, 2028 projected' },
  { num: '73%', label: 'Consumers who want personalised nutrition advice' },
  { num: '2.1B', label: 'Food-related videos viewed daily across social platforms' },
  { num: '$4.5B', label: 'Health & fitness app revenue globally, 2025' },
  { num: '68%', label: 'Adults who find current recipe apps too generic' },
  { num: '3×', label: 'Higher retention for apps combining social + health' },
]

export const TECH = [
  { group: 'AI & Intelligence', items: ['Computer vision for ingredient ID & video parsing', 'LLM integration for recipe & meal generation', 'ML personalisation engine that adapts over time', 'USDA FoodData Central & Open Food Facts'] },
  { group: 'Frontend & Mobile', items: ['React Native: one codebase, native iOS & Android', 'Physics-based animation library for fluid UI', 'Real-time camera processing for scanning', 'Offline-first architecture'] },
  { group: 'Backend & Infrastructure', items: ['Node.js / Python microservices', 'PostgreSQL + Redis for data & realtime', 'AWS / GCP with auto-scaling', 'HealthKit, Google Fit, Fitbit & Garmin APIs'] },
  { group: 'Privacy & Security', items: ['On-device health processing where possible', 'Granular user controls over shared data', 'HIPAA-aligned health record handling', 'No selling of user data to third parties, ever'] },
]

export const PHASES = [
  { phase: 'Phase 1', months: 'Months 1 – 3', title: 'Foundation & MVP', items: ['Video-to-recipe core engine', 'Camera-based pantry scanner', 'Basic calorie & macro tracking', 'Personal cookbook & saved recipes', 'Manual grocery list generation', 'Private beta with 500 users'] },
  { phase: 'Phase 2', months: 'Months 4 – 6', title: 'Intelligence Layer', items: ['AI weekly meal-plan generation', 'Wearables & Apple Health sync', 'Grocery delivery (Instacart)', 'Social video import', 'Advanced dietary recommendations', 'App Store & Google Play launch'] },
  { phase: 'Phase 3', months: 'Months 7 – 12', title: 'Community & Scale', items: ['Social feed, friends & challenges', 'Cookbook sharing & discovery', 'Calendar meal scheduling', 'Premium subscription tier', 'Brand partnerships', 'Target: 100,000+ active users'] },
]

export const MONEY = [
  'Freemium model: core features free, advanced AI planning & coaching behind Ruchi Pro',
  'Ruchi Pro subscription, est. $8.99/month or $69.99/year',
  'Affiliate commission on grocery orders initiated in-app',
  'Opt-in branded content with food & wellness brands',
  'Future: white-label licensing to insurers & corporate wellness',
]
