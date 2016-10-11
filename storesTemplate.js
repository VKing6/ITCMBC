OVERALL DATA
{
    guns: {
        "1": GUN_TYPE
    },
    fireMissions: {
        "FM0001": FIREMISSION_TYPE
        
    }
}

FIREMISSION_TYPE
{
    target:{
        method: "shift",
        variables: {
            start: POS_TYPE,
            adjust: ADJUST_TYPE
        }
        position: POS_TYPE
    },
    sheaf:{
        SHEAF_TYPE
    }
}

STORED_POINT_TYPE
{
    name: "OP 13",
    position: POS_TYPE
}

POS_TYPE
{
    mgrs: {
        easting:"12345",
        northing:"12345"
    },
    mgrs_string:"1234512345",
    elev: "200"
}

ADJUST_TYPE
{
    ot: "",
    ad: "",
    lr: "",
    ud: ""
}

SHEAF_TYPE
{
    type: "parallel",
    quick: false,
    direction: 0,
    length: 0
}

GUN_TYPE
{
    name: "1",
    pos: POS_TYPE,
    type: "mortar_82"
}