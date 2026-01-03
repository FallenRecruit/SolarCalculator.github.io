// Racking system specifications
const rackingSystems = {
    'hopergy': {
        name: 'Hopergy',
        defaultGap: 20,
        defaultOverhang: 25,
        railLength: 4400
    },
    'clenergy': {
        name: 'Clenergy',
        defaultGap: 18,
        defaultOverhang: 20,
        railLength: 3600
    },
    'clenergy-universal': {
        name: 'Clenergy (Universal)',
        defaultGap: 20,
        defaultOverhang: 20,
        railLength: 3600
    },
    'schletter-proline': {
        name: 'Schletter ProLine',
        defaultGap: 20,
        defaultOverhang: 25,
        railLength: 4400
    },
    'schletter-classic': {
        name: 'Schletter Classic',
        defaultGap: 20,
        defaultOverhang: 25,
        railLength: 4400
    },
    'custom': {
        name: 'Custom',
        defaultGap: 20,
        defaultOverhang: 25,
        railLength: 4400
    }
};

// Navigation
const screens = document.querySelectorAll('.screen');
const backBtn = document.getElementById('backBtn');
const headerTitle = document.getElementById('headerTitle');

function showScreen(screenId, title) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'homeScreen') {
        backBtn.style.display = 'none';
        headerTitle.textContent = 'Solar Calculator';
    } else {
        backBtn.style.display = 'block';
        headerTitle.textContent = title;
    }
}

// Navigation button handlers
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const screen = btn.dataset.screen;
        const titles = {
            'railLength': 'Rail Length',
            'clampCount': 'Clamp Count',
            'cableLength': 'DC Cable Length',
            'stringSize': 'String Calculator'
        };
        showScreen(screen + 'Screen', titles[screen]);
    });
});

backBtn.addEventListener('click', () => showScreen('homeScreen'));

// Rail Length Calculator
const rackingSelect = document.getElementById('rackingSystem');
const panelWidthInput = document.getElementById('panelWidth');
const panelCountInput = document.getElementById('panelCount');
const rowCountInput = document.getElementById('rowCount');
const customGapCheck = document.getElementById('customGapCheck');
const customGapInput = document.getElementById('customGap');
const customOverhangCheck = document.getElementById('customOverhangCheck');
const customOverhangInput = document.getElementById('customOverhang');

// Update placeholders when racking system changes
rackingSelect.addEventListener('change', () => {
    const system = rackingSystems[rackingSelect.value];
    customGapInput.placeholder = `Default: ${system.defaultGap}`;
    customOverhangInput.placeholder = `Default: ${system.defaultOverhang}`;
});

// Enable/disable custom inputs
customGapCheck.addEventListener('change', () => {
    customGapInput.disabled = !customGapCheck.checked;
    if (!customGapCheck.checked) customGapInput.value = '';
});

customOverhangCheck.addEventListener('change', () => {
    customOverhangInput.disabled = !customOverhangCheck.checked;
    if (!customOverhangCheck.checked) customOverhangInput.value = '';
});

// Panel width presets
document.querySelectorAll('.preset-btn[data-width]').forEach(btn => {
    btn.addEventListener('click', () => {
        panelWidthInput.value = btn.dataset.width;
    });
});

// Calculate rail length
document.getElementById('calcRailBtn').addEventListener('click', () => {
    const system = rackingSystems[rackingSelect.value];
    const panelWidth = parseFloat(panelWidthInput.value);
    const panelCount = parseInt(panelCountInput.value);
    const rowCount = parseInt(rowCountInput.value) || 1;
    
    if (!panelWidth || panelWidth <= 0) {
        alert('Please enter a valid panel width');
        return;
    }
    if (!panelCount || panelCount <= 0) {
        alert('Please enter a valid panel count');
        return;
    }

    const gap = customGapCheck.checked && customGapInput.value 
        ? parseFloat(customGapInput.value) 
        : system.defaultGap;
    
    const overhang = customOverhangCheck.checked && customOverhangInput.value 
        ? parseFloat(customOverhangInput.value) 
        : system.defaultOverhang;

    // Calculate for one rail
    const totalPanelWidth = panelCount * panelWidth;
    const totalGaps = (panelCount - 1) * gap;
    const totalOverhang = 2 * overhang;
    const singleRailLength = totalPanelWidth + totalGaps + totalOverhang;

    // Rails per row (2 rails per row - top and bottom of panels)
    const railsPerRowLength = 2;
    const totalRailLengthNeeded = singleRailLength * railsPerRowLength * rowCount;

    // Calculate number of stock rails needed
    const stockRailsPerSingleRail = Math.ceil(singleRailLength / system.railLength);
    const totalStockRails = stockRailsPerSingleRail * railsPerRowLength * rowCount;
    
    // Splices per single rail run
    const splicesPerRail = Math.max(0, stockRailsPerSingleRail - 1);
    const totalSplices = splicesPerRail * railsPerRowLength * rowCount;

    // Waste
    const totalStockLength = totalStockRails * system.railLength;
    const waste = totalStockLength - totalRailLengthNeeded;

    // Display results
    document.getElementById('totalLength').textContent = 
        `${(totalRailLengthNeeded / 1000).toFixed(2)}m (${totalRailLengthNeeded.toFixed(0)}mm)`;
    document.getElementById('railsNeeded').textContent = 
        `${totalStockRails} × ${system.railLength / 1000}m`;
    document.getElementById('splicesNeeded').textContent = totalSplices;
    document.getElementById('wasteLength').textContent = 
        `${(waste / 1000).toFixed(2)}m`;

    let breakdown = `Per row (single rail run):\n`;
    breakdown += `  Panels: ${panelCount} × ${panelWidth}mm = ${totalPanelWidth}mm\n`;
    breakdown += `  Gaps: ${panelCount - 1} × ${gap}mm = ${totalGaps}mm\n`;
    breakdown += `  Overhangs: 2 × ${overhang}mm = ${totalOverhang}mm\n`;
    breakdown += `  Rail length: ${singleRailLength}mm (${(singleRailLength/1000).toFixed(2)}m)\n\n`;
    breakdown += `Total: ${rowCount} row${rowCount > 1 ? 's' : ''} × 2 rails = ${railsPerRowLength * rowCount} rail runs`;

    document.getElementById('railBreakdown').textContent = breakdown;
    document.getElementById('railResults').classList.add('show');
});

// Clamp Count Calculator
document.getElementById('calcClampBtn').addEventListener('click', () => {
    const panelCount = parseInt(document.getElementById('clampPanelCount').value);
    const rowCount = parseInt(document.getElementById('clampRowCount').value);
    const bracketSpacing = parseFloat(document.getElementById('bracketSpacing').value);
    const railLength = parseFloat(document.getElementById('clampRailLength').value);

    if (!panelCount || panelCount <= 0) {
        alert('Please enter a valid panel count');
        return;
    }
    if (!rowCount || rowCount <= 0) {
        alert('Please enter a valid row count');
        return;
    }

    // Per row: 2 end clamps at each end of row, mid clamps between panels
    // For a row of panels, you need 2 end clamps (one each side) per rail
    // And (panelCount - 1) mid clamps between panels per rail
    // Each row has 2 rails (top and bottom)
    
    const railsPerRow = 2;
    const totalRails = railsPerRow * rowCount;
    
    // End clamps: 2 per rail (one each end)
    const endClampsPerRail = 2;
    const totalEndClamps = endClampsPerRail * totalRails;
    
    // Mid clamps: (panels - 1) per rail
    const midClampsPerRail = panelCount - 1;
    const totalMidClamps = midClampsPerRail * totalRails;
    
    const totalClamps = totalEndClamps + totalMidClamps;

    // Roof brackets
    let bracketsPerRail = 0;
    if (railLength && bracketSpacing) {
        // Brackets at start, then every spacing interval
        bracketsPerRail = Math.ceil(railLength / bracketSpacing) + 1;
    }
    const totalBrackets = bracketsPerRail * totalRails;

    document.getElementById('endClamps').textContent = totalEndClamps;
    document.getElementById('midClamps').textContent = totalMidClamps;
    document.getElementById('totalClamps').textContent = totalClamps;
    document.getElementById('bracketsPerRail').textContent = bracketsPerRail || '-';
    document.getElementById('totalBrackets').textContent = totalBrackets || '-';
    document.getElementById('clampResults').classList.add('show');
});

// DC Cable Length Calculator
document.getElementById('calcCableBtn').addEventListener('click', () => {
    const panelHeight = parseFloat(document.getElementById('panelHeight').value);
    const panelCount = parseInt(document.getElementById('cablePanelCount').value);
    const inverterDistance = parseFloat(document.getElementById('inverterDistance').value);
    const stringCount = parseInt(document.getElementById('stringCount').value) || 1;

    if (!panelHeight || !panelCount || !inverterDistance) {
        alert('Please fill in all fields');
        return;
    }

    // Cable runs along panels (simplified - assumes series connection along height)
    // Plus leads to inverter (positive and negative)
    const panelRunLength = panelHeight * (panelCount - 1); // Cable between panels
    const inverterRun = inverterDistance * 2; // + and - cables to inverter
    
    const cablePerString = panelRunLength + inverterRun;
    const cableWithMargin = cablePerString * 1.1; // 10% extra
    const totalCable = cableWithMargin * stringCount;

    document.getElementById('cablePerString').textContent = 
        `${(cableWithMargin / 1000).toFixed(1)}m`;
    document.getElementById('totalCable').textContent = 
        `${(totalCable / 1000).toFixed(1)}m`;
    document.getElementById('cableResults').classList.add('show');
});

// String Size Calculator
document.getElementById('calcStringBtn').addEventListener('click', () => {
    const panelVoc = parseFloat(document.getElementById('panelVoc').value);
    const panelVmp = parseFloat(document.getElementById('panelVmp').value);
    const inverterMaxV = parseFloat(document.getElementById('inverterMaxV').value);
    const mpptMin = parseFloat(document.getElementById('mpptMin').value);
    const mpptMax = parseFloat(document.getElementById('mpptMax').value);
    const tempCoeff = parseFloat(document.getElementById('tempCoeff').value);
    const minTemp = parseFloat(document.getElementById('minTemp').value);

    if (!panelVoc || !panelVmp || !inverterMaxV || !mpptMin || !mpptMax) {
        alert('Please fill in all required fields');
        return;
    }

    // Adjust Voc for cold temperature (Voc increases when cold)
    // Temperature coefficient is usually negative (e.g., -0.29%/°C)
    // At temps below 25°C, Voc increases
    const tempDiff = 25 - minTemp; // How much colder than STC
    const vocAdjustment = 1 + (Math.abs(tempCoeff) / 100 * tempDiff);
    const adjustedVoc = panelVoc * vocAdjustment;

    // Max panels: limited by inverter max DC voltage at cold temp
    const maxPanels = Math.floor(inverterMaxV / adjustedVoc);

    // Min panels: Vmp must be above MPPT minimum (at hot temps Vmp drops, but simplified here)
    const minPanels = Math.ceil(mpptMin / panelVmp);

    // Voltage range for max panels
    const stringVocMax = maxPanels * adjustedVoc;
    const stringVmpMin = maxPanels * panelVmp * 0.85; // Rough hot weather estimate
    const stringVmpMax = maxPanels * panelVmp;

    document.getElementById('maxPanels').textContent = maxPanels;
    document.getElementById('minPanels').textContent = minPanels;
    document.getElementById('adjustedVoc').textContent = `${adjustedVoc.toFixed(2)}V`;

    let breakdown = `With ${maxPanels} panels:\n`;
    breakdown += `  Max Voc (cold): ${stringVocMax.toFixed(1)}V\n`;
    breakdown += `  Vmp range: ${stringVmpMin.toFixed(1)}V - ${stringVmpMax.toFixed(1)}V\n\n`;
    breakdown += `Inverter limits:\n`;
    breakdown += `  Max DC: ${inverterMaxV}V\n`;
    breakdown += `  MPPT: ${mpptMin}V - ${mpptMax}V`;

    document.getElementById('stringBreakdown').textContent = breakdown;
    document.getElementById('stringResults').classList.add('show');
});

// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed:', err));
    });
}
