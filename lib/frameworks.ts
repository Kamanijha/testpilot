export type FrameworkId = "selenium-java" | "playwright-python" | "cypress-js";

export interface Framework {
  id: FrameworkId;
  label: string;
  language: string;
  filename: string;
  mime: string;
  badge: string;
}

export const FRAMEWORKS: Record<FrameworkId, Framework> = {
  "selenium-java": {
    id: "selenium-java",
    label: "Selenium · Java",
    language: "java",
    filename: "GeneratedTest.java",
    mime: "text/x-java-source",
    badge: "JAVA",
  },
  "playwright-python": {
    id: "playwright-python",
    label: "Playwright · Python",
    language: "python",
    filename: "test_generated.py",
    mime: "text/x-python",
    badge: "PY",
  },
  "cypress-js": {
    id: "cypress-js",
    label: "Cypress · JavaScript",
    language: "javascript",
    filename: "generated.cy.js",
    mime: "text/javascript",
    badge: "JS",
  },
};

export const FRAMEWORK_LIST: Framework[] = Object.values(FRAMEWORKS);

export function isFrameworkId(x: unknown): x is FrameworkId {
  return typeof x === "string" && x in FRAMEWORKS;
}
