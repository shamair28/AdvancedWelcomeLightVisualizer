let loadedTemplateKey = null;
let lastNonBaseLedVehicle = '';
let lastNonBaseLedTemplate = '';
const BASE_LED_PARAM = 'baseled';

function copyToClipboard(fieldId) {
  const text = document.getElementById(fieldId).value;
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log("Copied to clipboard:", text);
    })
    .catch(err => {
      console.error("Failed to copy!", err);
    });
}

function pasteFromClipboard(fieldId) {
  navigator.clipboard.readText()
    .then(text => {
      document.getElementById(fieldId).value = text;
      console.log("Pasted from clipboard into", fieldId, ":", text);
    })
    .catch(err => {
      console.error("Failed to paste!", err);
    });
}

function copyAllFields() {
  const data = {
    left1: document.getElementById('leftStaging1').value,
    left2: document.getElementById('leftStaging2').value,
    right1: document.getElementById('rightStaging1').value,
    right2: document.getElementById('rightStaging2').value,
  };
  navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    .then(() => console.log('All fields copied to clipboard'))
    .catch(err => console.error('Failed to copy all fields:', err));
}

function setStagingFields(left1, left2, right1, right2) {
  document.getElementById('leftStaging1').value = left1;
  document.getElementById('leftStaging2').value = left2;
  document.getElementById('rightStaging1').value = right1;
  document.getElementById('rightStaging2').value = right2;
}

function pasteAllFields() {
  navigator.clipboard.readText()
    .then(text => {
      const data = JSON.parse(text);
      setStagingFields(data.left1 || '', data.left2 || '', data.right1 || '', data.right2 || '');
      buildDynamicFields();
      onDataEdited();
    })
    .catch(err => console.error('Failed to paste all fields:', err));
}

function clearAllFields() {
  setStagingFields('', '', '', '');
}

function buildDynamicFields() {
  // Parse input fields into byte arrays and sequences
  for (const side of ['left', 'right']) {
    const entry = sideData[side];

    const s1 = document.getElementById(`${side}Staging1`).value;
    const s2 = document.getElementById(`${side}Staging2`).value;

    entry.staging1Bytes = parseByteString(s1);
    entry.staging2Bytes = parseByteString(s2);

    ensureMaxSize(entry.staging1Bytes, MAX_STAGING1);
    ensureMaxSize(entry.staging2Bytes, MAX_STAGING2);

    entry.sequences = parseAllSequencesFromBytes(entry.staging1Bytes, entry.staging2Bytes);
    updateUsageUI(side, calculateSeqsSize(entry.sequences));
  }

  // Compute phase timeline and render
  const vehicleKey = document.getElementById("vehicleSelect").value;
  const config = VEHICLE_CONFIGS[vehicleKey] || VEHICLE_CONFIGS["generic"];
  currentPhaseTimeline = computePhaseTimeline(config, {
    left: sideData.left.sequences,
    right: sideData.right.sequences
  });

  renderDynamicSequences();
  rebuildAnimationPlayer();
  updateLmm1Section();
}

function isBaseLedMode() {
  return document.getElementById('baseLedToggle').checked === true;
}

function updateLmm1Section() {
  const section = document.getElementById('lmm1Section');
  const baseLed = isBaseLedMode();
  section.classList.toggle('hidden', !baseLed);
  if (!baseLed) return;

  const template = TEMPLATES[loadedTemplateKey];
  document.getElementById('lmm1Custom').value = (template && template.lmm1) || BASE_LED_LMM1_CUSTOM;
  document.getElementById('lmm1Stock').value = BASE_LED_LMM1_STOCK;
}

function onDataEdited() {
  loadedTemplateKey = null;
  document.getElementById('templateSelect').value = '';
  updateURLParams();
}

function getAllBytes() {
  return [
    ...sideData.left.staging1Bytes,
    ...sideData.left.staging2Bytes,
    ...sideData.right.staging1Bytes,
    ...sideData.right.staging2Bytes,
  ];
}

function encodeAllBytesToBase64() {
  return btoa(getAllBytes().map(h => String.fromCharCode(parseInt(h, 16))).join(''));
}

function hasAnyNonZeroData() {
  return getAllBytes().some(b => b !== '00');
}

function updateURLParams() {
  try {
    const params = new URLSearchParams();
    const vehicle = document.getElementById('vehicleSelect').value;
    if (vehicle) params.set('vehicle', vehicle);
    if (isBaseLedMode()) params.set(BASE_LED_PARAM, '1');

    if (loadedTemplateKey) {
      params.set('template', loadedTemplateKey);
    } else if (hasAnyNonZeroData()) {
      params.set('d', encodeAllBytesToBase64());
    }

    const query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  } catch (e) {
    // replaceState may be restricted on file:// protocol
  }
}

function restoreFromURLData() {
  const urlParams = new URLSearchParams(window.location.search);
  const encoded = urlParams.get('d');
  if (!encoded) return false;

  try {
    const binary = atob(encoded);
    // 252 + 168 + 252 + 168 = 840 bytes total
    if (binary.length !== 840) return false;

    const toHexArray = (start, len) =>
      Array.from({ length: len }, (_, i) =>
        binary.charCodeAt(start + i).toString(16).padStart(2, '0').toUpperCase()
      );

    setStagingFields(
      buildByteString(toHexArray(0, 252)),
      buildByteString(toHexArray(252, 168)),
      buildByteString(toHexArray(420, 252)),
      buildByteString(toHexArray(672, 168))
    );

    return true;
  } catch (e) {
    console.error('Failed to restore from URL data:', e);
    return false;
  }
}

function getDefault(paramName, configValue) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName) || configValue || "";
}

function initializeSelect(elementId, dataObj, urlParam, configKey, labelFn, filterFn = () => true) {
  const select = document.getElementById(elementId);
  select.innerHTML = '';
  const visibleKeys = Object.keys(dataObj).filter(key => filterFn(dataObj[key]));
  for (const key of visibleKeys) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = labelFn(key);
    select.appendChild(option);
  }
  const configVal = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG[configKey] : '';
  const defaultVal = getDefault(urlParam, configVal);
  if (defaultVal && visibleKeys.includes(defaultVal)) {
    select.value = defaultVal;
  }
}

function initTemplates() {
  if (typeof TEMPLATES === 'undefined') {
    console.warn('TEMPLATES not found. Make sure templates.js is loaded.');
    return;
  }
  initializeSelect('templateSelect', TEMPLATES, 'template', 'defaultTemplate', key => key, matchesBaseLedMode);
}

function matchesBaseLedMode(entry) {
  return (entry.baseLed === true) === isBaseLedMode();
}

function initVehicles() {
  if (typeof VEHICLE_CONFIGS === 'undefined') {
    console.warn('VEHICLE_CONFIGS not found. Make sure vehicles.js is loaded.');
    return;
  }
  initializeSelect('vehicleSelect', VEHICLE_CONFIGS, 'vehicle', 'defaultVehicle',
    key => VEHICLE_CONFIGS[key].name || key, matchesBaseLedMode);
}

function initBaseLedToggle() {
  const urlParams = new URLSearchParams(window.location.search);
  document.getElementById('baseLedToggle').checked = urlParams.get(BASE_LED_PARAM) === '1';
}

function onBaseLedToggled() {
  const vehicleSelect = document.getElementById('vehicleSelect');
  const templateSelect = document.getElementById('templateSelect');

  if (isBaseLedMode()) {
    lastNonBaseLedVehicle = vehicleSelect.value;
    lastNonBaseLedTemplate = loadedTemplateKey || '';
  }
  const defaultVehicle = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.defaultVehicle : '';
  const preferredVehicle = isBaseLedMode() ? '' : (lastNonBaseLedVehicle || defaultVehicle);
  const previousTemplateKey = loadedTemplateKey;

  initVehicles();
  if (preferredVehicle && VEHICLE_CONFIGS[preferredVehicle] && !VEHICLE_CONFIGS[preferredVehicle].baseLed) {
    vehicleSelect.value = preferredVehicle;
  }

  initTemplates();
  const stillListed = previousTemplateKey && TEMPLATES[previousTemplateKey]
    && matchesBaseLedMode(TEMPLATES[previousTemplateKey]);
  if (stillListed) {
    templateSelect.value = previousTemplateKey;
  } else {
    const defaultTemplate = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.defaultTemplate : '';
    const fallbackTemplate = isBaseLedMode() ? '' : (lastNonBaseLedTemplate || defaultTemplate);
    if (fallbackTemplate && TEMPLATES[fallbackTemplate] && matchesBaseLedMode(TEMPLATES[fallbackTemplate])) {
      templateSelect.value = fallbackTemplate;
    } else {
      templateSelect.selectedIndex = 0;
    }
    loadedTemplateKey = null;
    loadSelectedTemplate();
  }

  buildDynamicFields();
  updateURLParams();
}

function loadSelectedTemplate() {
  const select = document.getElementById('templateSelect');
  const key = select.value;

  if (!key || !TEMPLATES[key]) return;

  loadedTemplateKey = key;

  const data = TEMPLATES[key];
  setStagingFields(data.left1 || '', data.left2 || '', data.right1 || '', data.right2 || '');
}

window.addEventListener('DOMContentLoaded', () => {
  initBaseLedToggle();
  initTemplates();
});

window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  initVehicles();
  const restoredFromURL = restoreFromURLData();
  if (!restoredFromURL) {
    loadSelectedTemplate();
  } else {
    document.getElementById('templateSelect').value = '';
  }
  buildDynamicFields();
  updateURLParams();
};
