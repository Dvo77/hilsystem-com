/**
 * GUILD MODULE REGISTRY — single source of truth for which moduleIds
 * belong to which Guild hub. Fixes the drift risk flagged this session:
 * Weights & Measures (WM_MODULE_IDS), Foundations (FOUNDATIONS_MODULE_IDS),
 * and Electric Forge (FORGE_MODULE_IDS) each independently hardcoded their
 * own array — fine for each hub knowing about itself, but the Guild root
 * page's new per-hub time trackers need the SAME mapping, and inventing a
 * fourth copy there would be exactly the "three chats, three shapes"
 * problem the Module Logging Standard already had to reconcile once.
 *
 * DEPLOY PATH: tools/guild-module-registry.js (same folder as
 * session-logger.js). Import as './guild-module-registry.js' from files in
 * tools/ directly (hil-guild.html), or '../guild-module-registry.js' from
 * one level down (foundations/, electric-forge/, weights-measures/,
 * natural-sciences/).
 *
 * MIGRATION NOTE: this doesn't yet replace the hardcoded arrays inside
 * foundations/index.html, electric-forge/index.html, or the
 * weights-measures hub file — those still work standalone as they are.
 * Pointing them at this file instead is the natural next cleanup pass
 * (delete their local array, import GUILD_HUBS, filter by id) but wasn't
 * done in this pass to keep this change scoped to the Guild root page.
 *
 * status field: 'live' = real modules exist and are linked; 'planned' =
 * hub is named/taxonomized but has no built modules yet (Arts, Economics
 * & Social Studies as of this write) — moduleIds stays [] until that
 * changes, and time-tracker bars for a 'planned' hub should render as
 * "not started yet" rather than a 0%-filled bar implying work exists.
 */

export const GUILD_HUBS = [
  {
    id: 'foundations',
    name: 'Foundations',
    icon: '🏷️',
    href: './foundations/',
    status: 'live',
    moduleIds: ['noun-first-lab', 'punctuation-explorer', 'tag-taxonomy-lab'],
  },
  {
    id: 'weights-measures',
    name: 'Weights & Measures',
    icon: '📏',
    href: './weights-measures/',
    status: 'live',
    moduleIds: [
      'ruler-simulator',
      'protractor-simulator',
      'hil-weather-spotters', // UNCONFIRMED — see Weights & Measures hub file's own note; guessed from filename convention, not verified against Weather Spotters' actual MODULE_MANIFEST.moduleId
    ],
  },
  {
    id: 'electric-forge',
    name: 'Electric Forge',
    icon: '⚡',
    href: './electric-forge/',
    status: 'live',
    moduleIds: ['wire-lab', 'multimeter-lab', 'motor-efficiency-lab', 'solar-battery-lab', 'circuit-lab', 'panel-phase-lab'],
  },
  {
    id: 'natural-sciences',
    name: 'Natural Sciences',
    icon: '⚛️',
    href: './natural-sciences/',
    status: 'live', // new hub locked Aug 1 2026 — chemistry/earth-science/biology home, first module is Periodic Table Lab; Earth Science and Biology are stubbed "coming soon" cards on the hub page itself but have no built module yet, so they're intentionally left out of moduleIds below until that changes
    moduleIds: ['periodic-table-lab'],
  },
  {
    id: 'arts',
    name: 'Arts',
    icon: '🎨',
    href: null,
    status: 'planned', // renamed/broadened from "Guild Music School — guitar, banjo, harmonica" per the locked taxonomy update; music becomes one category inside Arts, not its own hub
    moduleIds: [],
  },
  {
    id: 'economics-social-studies',
    name: 'Economics & Social Studies',
    icon: '💰',
    href: null,
    status: 'planned', // new Domain hub, locked this session — money mechanics, barter/trade, social studies, history folded in, GED coverage, absorbs the shelved Financial Simulator concept
    moduleIds: [],
  },
];

export function getHub(id) {
  return GUILD_HUBS.find(h => h.id === id) || null;
}
