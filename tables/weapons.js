var weapons = {
    "mortar_81": {
        "displayName": "L16",
        "tableType": "ATAB",
        "angles": {
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":0, "table": mortar_81_all_ch0},
                    {"charge":1, "table": mortar_81_all_ch1},
                    {"charge":2, "table": mortar_81_all_ch2},
                    {"charge":3, "table": mortar_81_all_ch3},
                    {"charge":4, "table": mortar_81_all_ch4}
                ]
            }
        },
        "qdMod": 0
    },
    "mortar_81_itc": {
        "displayName": "ITC M252",
        "tableType": "ATAB",
        "angles": {
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":0, "table": ACE_1Rnd_82mm_Mo_HE_ch0},
                    {"charge":1, "table": ACE_1Rnd_82mm_Mo_HE_ch1},
                    {"charge":2, "table": ACE_1Rnd_82mm_Mo_HE_ch2},
                    {"charge":3, "table": ACE_1Rnd_82mm_Mo_HE_ch3},
                    {"charge":4, "table": ACE_1Rnd_82mm_Mo_HE_ch4}
                ]
            }
        },
        "qdMod": 0
    },
    "howitzer_105": {
        "displayName": "L118",
        "tableType": "ATAB",
        "angles": {
            "low": [0,45],
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":0, "table": howitzer_105_all_ch0_la},
                    {"charge":1, "table": howitzer_105_all_ch1_la},
                    {"charge":2, "table": howitzer_105_all_ch2_la},
                    {"charge":0, "table": howitzer_105_all_ch0_ha},
                    {"charge":1, "table": howitzer_105_all_ch1_ha},
                    {"charge":2, "table": howitzer_105_all_ch2_ha}
                ]
            }
        },
        "qdMod": 1333
    },
    "howitzer_155": {
        "displayName": "M198",
        "tableType": "ATAB",
        "angles": {
            "low": [0,45],
            "high": [45,85]
        },
        "roundTypes": {
            "HE": {
                "tables": [
                    {"charge":1, "table": howitzer_155_he_ch1_la},
                    {"charge":1, "table": howitzer_155_he_ch1_ha},
                ]
            },
            "WP": {
                "tables": [
                    {"charge":1, "table": howitzer_155_he_ch1_la},
                    {"charge":1, "table": howitzer_155_he_ch1_ha},
                ]
            }
        },
        "qdMod": 0
    },
    "commando_60": {
        "displayName": "M6 Commando Mortar",
        "tableType": "ATAB",
        "angles": {
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":0, "table": commando_60_all_ch0},
                    {"charge":1, "table": commando_60_all_ch1},
                    {"charge":2, "table": commando_60_all_ch2},
                    {"charge":3, "table": commando_60_all_ch3}
                ]
            }
        },
        "qdMod": 0
    },
    "mortar_82": {
        "displayName": "Mk6",
        "tableType": "ATAB",
        "angles": {
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":0, "table": mortar_82_all_ch0},
                    {"charge":1, "table": mortar_82_all_ch1},
                    {"charge":2, "table": mortar_82_all_ch2}
                ]
            }
        },
        "qdMod": 0
    },
    "howitzer_b_155": {
        "displayName": "Sholef",
        "tableType": "ATAB",
        "angles": {
            "low": [0,45],
            "high": [45,85]
        },
        "roundTypes": {
            "all": {
                "tables": [
                    {"charge":"close", "table": howitzer_b_155_ch0_la},
                    {"charge":"medium", "table": howitzer_b_155_ch1_la},
                    {"charge":"far", "table": howitzer_b_155_ch2_la},
                ]
            }
        },
        "qdMod": 0
    }
};
