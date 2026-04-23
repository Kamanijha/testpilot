export interface Preset {
  id: string;
  title: string;
  scenario: string;
}

export const PRESETS: Preset[] = [
  {
    id: "login",
    title: "Login flow",
    scenario:
      "Navigate to https://example.com/login, enter 'user@example.com' in the email field, enter 'SuperSecret!23' in the password field, click the Sign In button, and verify that the URL is https://example.com/dashboard and a heading with the text 'Welcome' is visible.",
  },
  {
    id: "checkout",
    title: "Checkout happy path",
    scenario:
      "Open https://saucedemo.com, log in as 'standard_user' with password 'secret_sauce', add the 'Sauce Labs Backpack' to cart, go to cart, click Checkout, fill first name 'Kamani', last name 'Jha', postal code '110001', click Continue, click Finish, and assert the success page shows 'Thank you for your order'.",
  },
  {
    id: "form-validation",
    title: "Form validation (negative)",
    scenario:
      "Go to https://example.com/signup, leave the email field empty, enter 'short' in the password field, click Create Account, and verify an inline error 'Email is required' appears under the email field and 'Password must be at least 8 characters' appears under the password field.",
  },
  {
    id: "search",
    title: "Search + result filter",
    scenario:
      "On https://example.com/search, type 'wireless headphones' into the search box, press Enter, wait for results to load, click the 'Price: Low to High' sort option, and assert that the first product card's price is less than or equal to the second product card's price.",
  },
  {
    id: "file-upload",
    title: "File upload",
    scenario:
      "On https://example.com/profile, click the 'Change avatar' button, upload the file 'fixtures/avatar.png', wait for the upload progress bar to complete, and verify that the avatar image's src attribute contains 'avatar'.",
  },
  {
    id: "dynamic-wait",
    title: "Dynamic content (waits)",
    scenario:
      "Open https://example.com/reports, click the 'Generate report' button, wait up to 20 seconds for a toast with text 'Report ready' to appear, click the 'Download' link inside the toast, and verify the browser download starts with a file matching the pattern 'report-*.pdf'.",
  },
];
