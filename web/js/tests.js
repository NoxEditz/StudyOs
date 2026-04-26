/**
 * StudyOS Test Framework
 * Simple testing utility for validating core functionality.
 */

const Tests = {
  results: [],
  
  /**
   * Assertion logic - FIXED
   */
  assert(condition, message) {
    const passed = !!condition;
    
    this.results.push({
      passed,
      message,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '%c✅ PASS' : '%c❌ FAIL';
    const color = passed ? 'color: #4ade80' : 'color: #f87171';
    console.log(`[TEST] ${status}: %c${message}`, color, 'color: inherit');
    
    if (!passed) {
      console.trace('Failure trace:');
    }
    
    return passed;
  },

  /**
   * Expect style assertion for better readability
   */
  expect(actual) {
    return {
      toBe: (expected, message) => {
        return this.assert(actual === expected, message || `Expected ${actual} to be ${expected}`);
      },
      notToBe: (expected, message) => {
        return this.assert(actual !== expected, message || `Expected ${actual} not to be ${expected}`);
      },
      toContain: (item, message) => {
        return this.assert(actual && actual.includes && actual.includes(item), message || `Expected array/string to contain ${item}`);
      }
    };
  },

  async runAll() {
    console.clear();
    console.log('%c🚀 StudyOS Advanced Test Suite Running...', 'font-size: 1.2rem; font-weight: bold; color: #f0c040');
    this.results = [];
    const startTime = performance.now();
    
    try {
      this.testCoreLogic();
      this.testGamification();
      this.testStorageIntegration();
      this.testFailingCases();
      await this.testAsyncFeatures();
    } catch (e) {
      console.error('%c[FATAL ERROR] Test suite crashed:', 'color: red; font-weight: bold', e);
    }
    
    const duration = (performance.now() - startTime).toFixed(2);
    this.report(duration);
  },

  testCoreLogic() {
    console.log('\n%c--- Core Logic Tests ---', 'font-weight: bold');
    this.expect(typeof App).toBe('object', 'App object should be initialized');
    this.expect(App.activePage).toBe('dashboard', 'Initial page should be dashboard');
    
    // Test switchTab logic (mocking DOM if needed, but here we check state)
    switchTab('timer');
    this.expect(App.activePage).toBe('timer', 'Page should switch to timer');
    switchTab('dashboard'); // reset
  },

  testGamification() {
    console.log('\n%c--- Gamification Tests ---', 'font-weight: bold');
    const initialGam = getGam();
    const initialXP = initialGam.xp;
    
    addXP(10);
    const newGam = getGam();
    this.expect(newGam.xp).toBe(initialXP + 10, 'XP should increment correctly');
    
    const levelInfo = getLevelInfo(0);
    this.expect(levelInfo.level).toBe(1, 'Level 0 should be level 1');
    this.expect(levelInfo.title).toBe('مبتدئ', 'Level 1 title should be correct');
  },

  testStorageIntegration() {
    console.log('\n%c--- Storage Tests ---', 'font-weight: bold');
    const testKey = 'test_unit_' + Date.now();
    const testVal = { hello: 'world' };
    
    DB.set(testKey, testVal);
    const retrieved = DB.get(testKey);
    this.expect(JSON.stringify(retrieved)).toBe(JSON.stringify(testVal), 'DB should store and retrieve objects correctly');
    
    DB.del(testKey);
    this.expect(DB.get(testKey)).toBe(null, 'DB should delete items correctly');
  },

  testFailingCases() {
    console.log('\n%c--- Intentional Failure Verification ---', 'font-weight: bold; color: #f87171');
    // These tests are DESIGNED to fail to verify the fix works
    this.assert(false, 'Intentionally failing boolean check');
    this.expect(2 + 2).toBe(5, 'Intentionally failing math check (2+2 should be 4)');
    this.expect('StudyOS').toBe('studyos', 'Intentionally failing case-sensitivity check');
  },

  async testAsyncFeatures() {
    console.log('\n%c--- Async/Cloud Tests ---', 'font-weight: bold');
    this.expect(typeof cloudClient).toBe('function', 'Cloud client initializer should exist');
  },

  report(duration) {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed);
    const total = this.results.length;
    
    console.log('\n' + '='.repeat(40));
    console.log(`%cTEST RESULTS SUMMARY (${duration}ms)`, 'font-weight: bold');
    console.log(`Total: ${total}`);
    console.log(`%cPassed: ${passed}`, 'color: #4ade80');
    console.log(`%cFailed: ${failed.length}`, failed.length > 0 ? 'color: #f87171; font-weight: bold' : 'color: #4ade80');
    
    if (failed.length > 0) {
      console.log('\n%cFailed Test Cases:', 'color: #f87171; font-weight: bold');
      failed.forEach((f, i) => {
        console.log(`${i+1}. ${f.message}`);
      });
    } else {
      console.log('\n%c⭐ ALL SYSTEMS GO! All tests passed successfully.', 'color: #f0c040; font-weight: bold');
    }
    console.log('='.repeat(40) + '\n');
  }
};

// Auto-run tests if in debug mode or explicitly called
window.Tests = Tests;
