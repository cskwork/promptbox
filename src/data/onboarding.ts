import type { CategoryKey } from "~/content/config";
import setupPrompt from "./pi-setup-prompt.txt?raw";

/** Developer-picked starter items shown on the homepage. */
export interface OnboardingPick {
 category: CategoryKey;
 slug: string;
}

export const ONBOARDING_PICKS: OnboardingPick[] = [
 // Default path: pi itself, restored from the pi-setup source of truth.
 { category: "harnesses", slug: "pi" },
 { category: "configs", slug: "pi-setup" },
 // Useful catalog entries after the base environment is running.
 { category: "skills", slug: "browser-qa" },
 { category: "skills", slug: "verify" },
 { category: "skills", slug: "diagnose" },
 { category: "skills", slug: "tdd" },
 { category: "skills", slug: "domain-modeling" },
 { category: "skills", slug: "grill-with-docs" },
 { category: "skills", slug: "handoff" },
 { category: "skills", slug: "wait-what" },
 { category: "skills", slug: "eli5" },
 { category: "skills", slug: "supergoal" },
 { category: "skills", slug: "superdesign" },
 { category: "skills", slug: "superoffice" },
 { category: "skills", slug: "superhacker" },
 { category: "tools", slug: "ego-lite" },
 { category: "tools", slug: "officecli" },
 { category: "tools", slug: "herdr" },
 { category: "plugins", slug: "autoresearch" },
];

/**
 * One source for every setup-prompt surface: homepage, catalog, and /tips.
 * scripts/check-install-prompt.mjs verifies the catalog fence against this file.
 */
export const INSTALL_PROMPT = setupPrompt.trimEnd();
