import { useEffect, useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

export const OMGBP = () => {
    // @ts-ignore
    const BP_table = CustomNetTables.GetTableValue("react_table", "test")
    const [count, setCount] = useState(0);
    
    // useEffect(() => {
    //     GameEvents.Subscribe("React_test", Click);
    // }, []);

    useGameEvent('React_test', data => {
        console.log('React_test ');
        console.log(data);
    },[])

    function Click() {
        console.log("clicked11111");
        console.log(BP_table);
        
    }
    return (
        <>
            {/* <Panel className='BP_HUD_box' onactivate={ () => Click()} >
                <Label className='UI_Label' text={count} />
            </Panel> */}
        </>
    );
};

render(<OMGBP />, $.GetContextPanel());
