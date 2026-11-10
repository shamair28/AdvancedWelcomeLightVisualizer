const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

// Load vehicles.js into global scope
vm.runInThisContext(fs.readFileSync('vehicles.js', 'utf8'), { filename: 'vehicles.js' });

// ============================================================================
// Vehicle Config Validation
// ============================================================================

const VALID_TYPES = ['path', 'circle', 'polygon', 'rect', 'image'];

const REQUIRED_ATTRS = {
  path:    ['d'],
  circle:  ['cx', 'cy', 'r'],
  polygon: ['points'],
  rect:    ['x', 'y', 'width', 'height'],
  image:   ['href', 'x', 'y', 'width', 'height']
};

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function validateShape(shape, context) {
  assert.ok(VALID_TYPES.includes(shape.type),
    context + ': invalid shape type "' + shape.type + '"');
  const required = REQUIRED_ATTRS[shape.type];
  for (const attr of required) {
    assert.ok(attr in shape,
      context + ': shape type "' + shape.type + '" missing required attribute "' + attr + '"');
  }
  if ('color' in shape) {
    assert.ok(typeof shape.color === 'string' && HEX_COLOR_RE.test(shape.color),
      context + ': color must be a hex string (#RRGGBB or #RRGGBBAA), got "' + shape.color + '"');
  }
}

describe('VEHICLE_CONFIGS structure', () => {
  for (const [key, config] of Object.entries(VEHICLE_CONFIGS)) {
    describe(key, () => {
      it('should have a name and valid type', () => {
        assert.ok(typeof config.name === 'string' && config.name.length > 0,
          key + ': missing or empty name');
        assert.ok(config.type === 'grid' || config.type === 'image',
          key + ': type must be "grid" or "image", got "' + config.type + '"');
      });

      if (config.type === 'image') {
        it('should have image config properties', () => {
          assert.ok(typeof config.image === 'string', key + ': missing image path');
          assert.ok(typeof config.viewBox === 'string', key + ': missing viewBox');
          assert.ok(Array.isArray(config.channels), key + ': missing channels array');
          assert.ok(config.channels.length > 0, key + ': channels array is empty');
        });

        for (let i = 0; i < (config.channels || []).length; i++) {
          const ch = config.channels[i];
          const ctx = key + ' channel[' + i + ']';

          it('should have valid id and label for ' + ctx, () => {
            assert.ok(typeof ch.id === 'number', ctx + ': id must be a number');
            assert.ok(typeof ch.label === 'string' && ch.label.length > 0,
              ctx + ': missing or empty label');
          });

          it('should have valid shape(s) for ' + ctx, () => {
            if (ch.shapes) {
              assert.ok(Array.isArray(ch.shapes), ctx + ': shapes must be an array');
              assert.ok(ch.shapes.length > 0, ctx + ': shapes array is empty');
              for (let s = 0; s < ch.shapes.length; s++) {
                validateShape(ch.shapes[s], ctx + ' shapes[' + s + ']');
              }
            } else if (ch.type) {
              validateShape(ch, ctx);
            }
            // Channels with neither type nor shapes are label-only (no visual)
          });

          if (ch.physicalLight !== undefined) {
            it('should have valid physicalLight reference for ' + ctx, () => {
              const targets = Array.isArray(ch.physicalLight) ? ch.physicalLight : [ch.physicalLight];
              assert.ok(targets.length > 0 && targets.every(id => typeof id === 'number'),
                ctx + ': physicalLight must be a number or a non-empty array of numbers');
              for (const targetId of targets) {
                const target = config.channels.find(c => c.id === targetId);
                assert.ok(target, ctx + ': physicalLight references non-existent channel ' + targetId);
                assert.ok(target.shapes || target.type,
                  ctx + ': physicalLight references channel without shapes');
              }
            });
          }
        }
      }

      if (config.phases) {
        it('should have valid phases array', () => {
          assert.ok(Array.isArray(config.phases), key + ': phases must be an array');
          assert.ok(config.phases.length > 0, key + ': phases array is empty');
          for (let pi = 0; pi < config.phases.length; pi++) {
            const phase = config.phases[pi];
            const pctx = key + ' phases[' + pi + ']';
            assert.ok(typeof phase.name === 'string' && phase.name.length > 0,
              pctx + ': missing or empty name');
            assert.ok(Array.isArray(phase.channels) && phase.channels.length > 0,
              pctx + ': channels must be a non-empty array');
            for (const chId of phase.channels) {
              assert.ok(typeof chId === 'number', pctx + ': channel id must be a number');
            }
            if (phase.maxDuration !== null && phase.maxDuration !== undefined) {
              assert.ok(typeof phase.maxDuration === 'number' && phase.maxDuration >= 0,
                pctx + ': maxDuration must be a non-negative number or null');
            }
            if (phase.anchor !== undefined) {
              assert.ok(typeof phase.anchor === 'number' && phase.anchor >= 0,
                pctx + ': anchor must be a non-negative number');
            }
          }
        });
      }

      if (config.defaultStates) {
        it('should have valid defaultStates', () => {
          for (const [chIdStr, state] of Object.entries(config.defaultStates)) {
            const dctx = key + ' defaultStates[' + chIdStr + ']';
            assert.ok(typeof state.brightness === 'number',
              dctx + ': brightness must be a number');
            assert.ok(state.brightness >= 0 && state.brightness <= 100,
              dctx + ': brightness must be 0-100');
            if (state.rampUp !== undefined) {
              assert.ok(typeof state.rampUp === 'number' && state.rampUp >= 0,
                dctx + ': rampUp must be non-negative');
            }
            if (state.rampDown !== undefined) {
              assert.ok(typeof state.rampDown === 'number' && state.rampDown >= 0,
                dctx + ': rampDown must be non-negative');
            }
          }
        });
      }
    });
  }
});

describe('base LED vehicle config', () => {
  const config = VEHICLE_CONFIGS.bmw_g20_lci_base_led;

  it('should exist as a base LED image config', () => {
    assert.ok(config);
    assert.strictEqual(config.type, 'image');
    assert.strictEqual(config.baseLed, true);
    assert.ok(fs.existsSync(config.image), 'missing image asset ' + config.image);
    for (const ch of config.channels) {
      for (const shape of ch.shapes || []) {
        if (shape.type === 'image') assert.ok(fs.existsSync(shape.href), 'missing glow layer ' + shape.href);
        if (shape.type === 'image') assert.strictEqual('0 0 ' + shape.width + ' ' + shape.height, config.viewBox, 'glow layer must cover the viewBox');
      }
    }
  });

  it('should play on-curves in the unlock phase and off-curves in the switch-off phase', () => {
    assert.deepStrictEqual(config.phases.map(phase => phase.channels), [[1, 7, 4], [3, 5]]);
  });

  it('should drive both DRL tubes from the shared tube curves', () => {
    const byId = id => config.channels.find(ch => ch.id === id);
    assert.deepStrictEqual(byId(2).physicalLight, [1, 7]);
    assert.deepStrictEqual(byId(3).physicalLight, [1, 7]);
  });

  it('should label channels 1 to 7', () => {
    assert.deepStrictEqual(config.channels.map(ch => ch.id), [1, 2, 3, 4, 5, 6, 7]);
    for (const ch of config.channels) {
      assert.ok(typeof ch.label === 'string' && ch.label.length > 0);
    }
  });

  it('should be the only config flagged baseLed', () => {
    const flagged = Object.keys(VEHICLE_CONFIGS).filter(key => VEHICLE_CONFIGS[key].baseLed === true);
    assert.deepStrictEqual(flagged, ['bmw_g20_lci_base_led']);
  });
});

describe('generic vehicle has no phases', () => {
  it('should not have phases property', () => {
    assert.strictEqual(VEHICLE_CONFIGS.generic.phases, undefined);
  });
  it('should not have defaultStates property', () => {
    assert.strictEqual(VEHICLE_CONFIGS.generic.defaultStates, undefined);
  });
});
