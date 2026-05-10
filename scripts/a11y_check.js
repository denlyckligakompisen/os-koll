import { createServer } from 'vite';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

async function run() {
  console.log('🏁 Starting Accessibility (a11y) Audit...');
  
  // 1. Programmatically start Vite development server
  console.log('🚀 Starting Vite development server...');
  const server = await createServer({
    server: { port: 5199, host: 'localhost' }
  });
  await server.listen();
  console.log('✔ Vite dev server is running on http://localhost:5199');

  // 2. Launch headless browser
  console.log('🌐 Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let failed = false;

  try {
    // 3. Navigate to the app
    console.log('🔗 Navigating to http://localhost:5199/allsvenskan...');
    await page.goto('http://localhost:5199/allsvenskan', { waitUntil: 'load', timeout: 10000 });

    // 4. Run Axe core accessibility engine
    console.log('🔍 Auditing page structure for accessibility...');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const violations = results.violations;

    if (violations.length > 0) {
      console.log(`\n❌ Found ${violations.length} accessibility violations:\n`);
      
      violations.forEach((v, index) => {
        console.log(`--------------------------------------------------`);
        console.log(`Violation #${index + 1}: [${v.id}] - Impact: ${v.impact?.toUpperCase()}`);
        console.log(`Description: ${v.description}`);
        console.log(`Help: ${v.help} (${v.helpUrl})`);
        console.log(`Nodes:`);
        v.nodes.forEach(n => {
          console.log(`  - Target: ${n.target.join(', ')}`);
          if (n.failureSummary) {
            console.log(`    Summary: ${n.failureSummary}`);
          }
        });
      });
      console.log(`--------------------------------------------------`);

      // We only fail on "critical" or "serious" violations to allow minor recommendations,
      // or we can fail on all to maintain 100% perfect quality! Let's fail on serious/critical.
      const criticalViolations = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      if (criticalViolations.length > 0) {
        console.log(`\n❌ Audit Failed: ${criticalViolations.length} critical/serious violations found.`);
        failed = true;
      } else {
        console.log('\n⚠ Warning: Minor violations found, but none are critical or serious.');
      }
    } else {
      console.log('\n🎉 Congratulations! 0 accessibility violations found. Your app is 100% accessible!');
    }
  } catch (err) {
    console.error('❌ Error during a11y audit:', err.message);
    failed = true;
  } finally {
    // 5. Clean up
    console.log('🧹 Cleaning up browser and server...');
    await browser.close();
    await server.close();
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log('✅ Accessibility Audit Passed!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
