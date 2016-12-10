// ARTY_generateFormattedBTab.sqf
//
// Generates a formatted ballistic table in SQF and copies to clipboard -- For use by designers & config makers.

// ["16aa_Magazine_1Rnd_81mm_HE",45,85,1, -2000,2000,100] call compile preprocessFileLineNumbers "fnc_formattedBTAB.sqf"


/*_magazine = _this select 0;
_elevMin = _this select 1;
_elevMax = _this select 2;
_elevStep = _this select 3;
_heightMin = _this select 4;
_heightMax = _this select 5;
_heightStep = _this select 6;
_muzzleVelocity = _this select 7;
_airFriction = _this select 8;*/

params [
    "_magazine",
    "_elevMin",
    "_elevMax",
    "_elevStep",
    "_heightMin",
    "_heightMax",
    "_heightStep",
    ["_muzzleVelocity",-1],
    ["_airFriction",-1000]
];

hint "4...";

// Normal artillery shell calculation
private _ammo = getText(configFile >> "CfgMagazines" >> _magazine >> "ammo");

if (_muzzleVelocity < 0) then {
    _muzzleVelocity = getNumber(configFile >> "CfgMagazines" >> _magazine >> "initSpeed");
};
if (_airFriction < -999) then {
    _airFriction = getNumber(configFile >> "CfgAmmo" >> _ammo >> "airFriction");
};
hint "2...";

private _ballistics = [_magazine, _elevMin, _elevMax, _elevStep, _heightMin, _heightMax, _heightStep, _muzzleVelocity, _airFriction] call compile preprocessFileLineNumbers "fnc_calcBallistics.sqf";

_ballistics params ["_btab","","","_maxOrd"];

hint "1...";

// Calculate min and max range based on median offset.
_mo = floor(((_heightMax - _heightMin) / _heightStep)*0.5);
private _rangeMin = 999999;
private _rangeMax = -1;
for [{_i=0;},{_i < count(_btab)},{_i=_i+1;}] do
{
    _slice = (_btab select _i) select 2;
    if (count _slice >= (_mo+1)) then
    {
        _range = (_slice select _mo) select 0;
        if (_range < _rangeMin) then {_rangeMin = _range;};
        if (_range > _rangeMax) then {_rangeMax = _range;};
    };
};

BTABDebug = [_muzzleVelocity, _airFriction, _rangeMin, _rangeMax, _maxOrd];

// Generate JSON

private _json = format ["// ACE2 ballistics table.%1// Magazine: %2%1// Ammo: %3%1// AirFriction: %4%1// MuzzleVelocity: %5%1// MaxOrdinate: %6%1%1", ToString [10], _magazine, _ammo, _airFriction, _muzzleVelocity, _maxOrd];
_json = _json + format ["%1_ch# = {%2", _magazine, ToString[10]];
_json = _json + format ["    ""minHeight"": %1,%2", _heightMin, ToString[10]];
_json = _json + format ["    ""maxHeight"": %1,%2", _heightMax, ToString[10]];
_json = _json + format ["    ""hstep"": %1,%2", _heightStep, ToString[10]];
_json = _json + format ["    ""minRange"": %1,%2", _rangeMin, ToString[10]];
_json = _json + format ["    ""maxRange"": %1,%2", _rangeMax, ToString[10]];
_json = _json + format ["    ""btab"": [%1", ToString[10]];
for [{_i=0;},{_i < count(_btab);},{_i=_i+1;}] do
{
    _tail = ",";
    if (_i == (count(_btab) - 1)) then
    {
        _tail = "";
    };
    _json =_json + format ["        %1%2%3", (_btab select _i), _tail, ToString [10] ];
};
_json = _json + format ["    ]%1",ToString [10]];

_json = _json + format ["};"];

hint "0";

copyToClipboard _json;
FORMATTEDBTAB = _json;
