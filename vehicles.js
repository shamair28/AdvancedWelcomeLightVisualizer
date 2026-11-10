const BASE_LED_LMM1_CUSTOM = "04,52,44,64,00,00,04,81,34,64,00,00,10,D2,24,64,0A,06,11,05,24,64,02,02,11,62,24,64,06,06,12,A5,20,64,02,02,13,10,20,64,02,02,14,50,30,64,00,00,23,81,43,64,04,05,23,A2,43,64,06,05,23,D0,50,64,06,06,23,E0,40,64,06,06,23,F4,43,64,00,05,24,D0,30,64,06,06,30,D2,24,64,0A,06,31,05,24,64,02,02,31,62,24,64,06,06,32,A5,20,64,02,02,33,10,20,64,02,02,34,50,30,64,00,00,43,20,34,64,06,06,43,42,44,1E,06,06,43,70,40,1E,06,06,43,81,67,1E,01,03,43,A2,67,1E,02,03,43,D0,50,1E,06,06,43,E0,40,1E,06,06,43,F0,63,1E,00,03,44,03,67,1E,00,03,44,50,20,64,00,00,44,90,18,00,00,0A,53,20,34,64,06,06,53,42,44,1E,06,06,53,70,40,1E,06,06,53,81,67,1E,07,03,53,A2,67,1E,02,03,53,D0,50,1E,06,06,53,E0,40,1E,06,06,53,F0,63,1E,00,03,54,03,67,1E,00,03,54,50,20,64,00,00,54,81,18,00,00,0A";
const BASE_LED_LMM1_STOCK = "04,52,44,64,00,00,04,81,34,64,00,00,10,D2,24,64,0A,06,11,05,24,64,02,02,11,62,24,64,06,06,12,A5,20,64,02,02,13,10,20,64,02,02,14,50,30,64,00,00,23,81,43,64,04,05,23,A2,43,64,06,05,23,D0,50,64,06,06,23,E0,40,64,06,06,23,F4,43,64,00,05,24,D0,30,64,06,06,30,D2,24,64,0A,06,31,05,24,64,02,02,31,62,24,64,06,06,32,A5,20,64,02,02,33,10,20,64,02,02,34,50,30,64,00,00,43,20,34,64,06,06,43,42,44,1E,06,06,43,70,40,1E,06,06,43,81,67,1E,01,03,43,A2,67,1E,02,03,43,D0,50,1E,06,06,43,E0,40,1E,06,06,43,F0,63,1E,00,03,44,03,67,1E,00,03,44,50,20,64,00,00,44,90,18,00,00,0A,53,20,34,64,06,06,53,42,44,1E,06,06,53,70,40,1E,06,06,53,81,67,1E,01,03,53,A2,67,1E,02,03,53,D0,50,1E,06,06,53,E0,40,1E,06,06,53,F0,63,1E,00,03,54,03,67,1E,00,03,54,50,20,64,00,00,54,81,18,00,00,0A";

const VEHICLE_CONFIGS = {
    "generic": {
        name: "Generic Channels (Grid)",
        type: "grid"
    },
    "bmw_g20_2020_laser": {
        name: "BMW G20 2020 Laser",
        type: "image",
        image: "assets/bmw_g20_2020_eu_laser.png",
        viewBox: "0 0 720 304",
        baseSide: "left",
        phases: [
            { name: "Phase 1", channels: [1, 2, 4], maxDuration: 20000 },
            { name: "Phase 2", channels: [3, 5], anchor: 20000, maxDuration: null }
        ],
        defaultStates: {
            2: { brightness: 67, rampUp: 2000, rampDown: 2000 },
            4: { brightness: 46, rampUp: 2000, rampDown: 2000 }
        },
        channels: [
            { id: 1,  label: "Low Beam",shapes: [
                    { type: "polygon", points: "192.784 82.302 265.999 89.676 277.061 121.807 214.906 116.013" },
                    { type: "polygon", points: "412.958 103.964 486.173 111.338 497.235 143.469 435.08 137.675" },
                    // { type: "rect", x: "209.846", y: "86.246", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "226.775", y: "87.939", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "243.85", y: "90.041", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "214.502", y: "102.328", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "231.431", y: "104.021", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "248.506", y: "106.123", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "433.349", y: "107.159", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "450.278", y: "108.852", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "467.353", y: "110.954", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "438.005", y: "123.241", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "454.934", y: "124.934", width: "15", height: "15", rx: "5", ry: "5" },
                    // { type: "rect", x: "472.009", y: "127.036", width: "15", height: "15", rx: "5", ry: "5" }
                ]
            },
            { id: 2, label: "DRL Phase 1", shapes: [
                    { type: "polygon", points: "106.927 73.874 129.049 78.088 113.774 96.524 164.34 162.892 184.883 175.533 312.879 183.434 324.993 195.549 192.784 188.175 171.188 181.854 142.744 164.472 95.865 115.486 85.857 94.943" },
                    { type: "polygon", points: "399.262 99.158 412.958 101.791 399.263 120.753 444.035 177.113 464.577 189.755 625.23 198.71 631.551 209.771 473.005 202.923 445.088 190.809 416.645 166.052 387.148 123.914 387.148 113.906" }
                ]
            },
            { id: 3,  label: "DRL Phase 2", physicalLight: 2 },
            { id: 4,  label: "Blue Accent Phase 1", shapes: [
                    // { type: "polygon", points: "192.784 82.302 265.999 89.676 277.061 121.807 214.906 116.013" },
                    // { type: "polygon", points: "412.958 103.964 486.173 111.338 497.235 143.469 435.08 137.675" },
                    { type: "polygon", points: "148.38 97.278 154.947 97.804 186.206 126.698 192.51 129.325 260.544 128.274 255.553 131.164 191.459 132.477 179.639 128.8", color: "#0000ffba" },
                    { type: "polygon", points: "417.1 140.883 429.446 148.763 497.217 149.026 493.802 154.542 430.759 154.017 421.565 148.238", color: "#0000ffba" }
                ]
            },
            { id: 5,  label: "Blue Accent Phase 2", physicalLight: 4 }
        ]
    },
    "bmw_g20_lci_base_led": {
        name: "BMW G20 LCI Base LED (000043AF)",
        type: "image",
        baseLed: true,
        image: "assets/bmw_g20_lci_base_led.png",
        viewBox: "0 0 720 324",
        baseSide: "left",
        // Unlock welcome plays the on-curves; switch-off (about 20 s later on the car) plays the off-curves
        phases: [
            { name: "Unlock welcome", channels: [1, 7, 4], maxDuration: 20000 },
            { name: "Switch-off", channels: [3, 5], anchor: 20000, maxDuration: null }
        ],
        // Steady state between the curves, from the Lmm1 brightness bytes (1E = 30% tubes, 64 = 100% side marker)
        defaultStates: {
            1: { brightness: 30 },
            7: { brightness: 30 },
            4: { brightness: 100 }
        },
        channels: [
            { id: 1, label: "Inner DRL tube, unlock welcome (on)", shapes: [
                    { type: "polygon", points: "300 101 641 105 645 112 629 123 338 121 345 140 396 224 388 229 380 228 293 148 290 132" }
                ]
            },
            { id: 2, label: "Both tubes, second welcome trigger (on)", physicalLight: [1, 7] },
            { id: 3, label: "Both tubes, switch-off (off)", physicalLight: [1, 7] },
            { id: 4, label: "US amber side marker, unlock (on)", shapes: [
                    { type: "polygon", points: "46 98 70 90 78 106 52 116", color: "#ffa000" }
                ]
            },
            { id: 5, label: "US amber side marker, switch-off (off)", physicalLight: 4 },
            { id: 6, label: "US amber side marker, second trigger (on)", physicalLight: 4 },
            { id: 7, label: "Outer DRL tube, unlock welcome (on, needs custom Lmm1)", shapes: [
                    { type: "polygon", points: "57 104 305 99 312 105 300 118 100 122 112 137 166 218 160 224 150 224 62 140 54 118" }
                ]
            }
        ]
    }
};
