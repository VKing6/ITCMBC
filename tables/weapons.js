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
    "mortar_82": {
        "tableType": "RTAB",
        "roundTypes": {
            "all": {"charges": [0, 1, 2]}
        }
    },
    "mortar_82_nwr": {
        "tableType": "RTAB",
        "roundTypes": {
            "all": {"charges": [0, 1, 2]}
        }
    }
};
