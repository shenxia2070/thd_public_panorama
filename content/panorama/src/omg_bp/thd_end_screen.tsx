import { useEffect, useMemo, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama-x';

export const EndScreen = () => {
    console.log("EndScreen!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    

    return (
        <Panel style={{ width: '100%', height: '100%' ,backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
        </Panel>
    )
}


// if (Game.GetMapInfo().map_name == `maps/1_thdots_map.vpk`) render(<EndScreen />, $.GetContextPanel());
render(<EndScreen />, $.GetContextPanel());