import { useEffect, useMemo, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama-x';

export const EndScreen = () => {
    console.log("EndScreen!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    // @ts-ignore
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
    // @ts-ignore
    dotaHud.FindChildTraverse('GameEndContainer').visible = false;
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, true);
    return (
        <Panel style={{ width: '100%', height: '100%',backgroundColor: '#252525'}}>
            <TextButton style={{ width: '100px', height: '50px', color: '#C0C0C0' }} className="end_btn" text="返回主界面" />
        </Panel>
    )
}


// if (Game.GetMapInfo().map_name == `maps/1_thdots_map.vpk`) render(<EndScreen />, $.GetContextPanel());
render(<EndScreen />, $.GetContextPanel());