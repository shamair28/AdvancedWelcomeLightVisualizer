const { describe, it } = require('node:test');
const assert = require('node:assert');
require('./setup.js');

// ============================================================================
// Template Hex Validation
// ============================================================================
describe('Template hex validation', () => {
  const fields = ['left1', 'left2', 'right1', 'right2'];
  const hexBytePattern = /^[0-9A-Fa-f]{2}$/;

  for (const [name, tmpl] of Object.entries(TEMPLATES)) {
    for (const field of fields) {
      it('should contain only valid hex bytes in "' + name + '" ' + field, () => {
        const value = tmpl[field];
        if (!value || value.trim() === '') return;

        const tokens = value.split(',').map(t => t.trim());
        for (let i = 0; i < tokens.length; i++) {
          assert.match(tokens[i], hexBytePattern,
            '"' + name + '" field ' + field + ' byte ' + i + ': invalid hex "' + tokens[i] + '"');
        }
      });
    }
  }
});

// ============================================================================
// Base LED Template Validation
// ============================================================================
describe('Base LED templates', () => {
  const hexBytePattern = /^[0-9A-Fa-f]{2}$/;
  const parseBytes = value => value.split(',').map(token => token.trim());

  for (const [name, tmpl] of Object.entries(TEMPLATES)) {
    if (tmpl.lmm1 !== undefined) {
      it('should have exactly 252 valid hex bytes in lmm1 of "' + name + '"', () => {
        const bytes = parseBytes(tmpl.lmm1);
        assert.strictEqual(bytes.length, 252);
        for (const byte of bytes) assert.match(byte, hexBytePattern);
      });
    }

    if (tmpl.baseLed === true) {
      it('should have 252-byte Staging1 and 168-byte Staging2 per side in "' + name + '"', () => {
        assert.strictEqual(parseBytes(tmpl.left1).length, 252);
        assert.strictEqual(parseBytes(tmpl.right1).length, 252);
        assert.strictEqual(parseBytes(tmpl.left2).length, 168);
        assert.strictEqual(parseBytes(tmpl.right2).length, 168);
      });

      it('should define lmm1 in "' + name + '"', () => {
        assert.ok(typeof tmpl.lmm1 === 'string');
      });
    }
  }

  it('should include at least one base LED template and one non-base-LED template', () => {
    const templates = Object.values(TEMPLATES);
    assert.ok(templates.some(tmpl => tmpl.baseLed === true));
    assert.ok(templates.some(tmpl => tmpl.baseLed !== true));
  });

  it('should differ between custom and stock Lmm1 only at byte 208 (01 -> 07)', () => {
    const custom = parseBytes(BASE_LED_LMM1_CUSTOM);
    const stock = parseBytes(BASE_LED_LMM1_STOCK);
    assert.strictEqual(custom.length, 252);
    assert.strictEqual(stock.length, 252);
    const differing = custom.map((byte, i) => i).filter(i => custom[i] !== stock[i]);
    assert.deepStrictEqual(differing, [208]);
    assert.strictEqual(stock[208], '01');
    assert.strictEqual(custom[208], '07');
  });
});
