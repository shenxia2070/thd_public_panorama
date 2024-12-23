import { useEffect, useMemo, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama-x';
export const OMGBP = () => {
    const [State, setState] = useState(1); //1表示ban人时间，2表示选人时间,3表示展示时间
    const [BpListAll, setBpListALl] = useState<bp_list[] | undefined>(undefined);
    const [BpListResultAll, setBpListResultAll] = useState<BpListResultAll>({
        hakurei: {} as BpListResult,
        moriya: {} as BpListResult,
    });
    const LocalPlayerInfo = Game.GetLocalPlayerInfo();
    const debounce = (func: (...args: any[]) => void, wait: number) => {
        let timeout: any;
        return (...args: any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            }, wait);
        };
    };
    useGameEvent(
        'React_BP_Init',
        () => {
            // @ts-ignore
            setBpListALl(CustomNetTables.GetTableValue('react_table', 'bp_list_all'));
            // @ts-ignore
            setBpListResultAll(CustomNetTables.GetTableValue('react_table', 'bp_list_result'));
        },
        []
    );
    useGameEvent(
        'LuaDataToReact',
        // debouncedHandler,
        () => {
            debouncedHandler();
        },
        []
    );
    useGameEvent(
        'LuaToReactFlash',
        data => {
            console.log('LuaToReactFlash');
            // @ts-ignore
            let panel = $(`#${data[1].panel_id}`);
            // @ts-ignore
            if (Game.GetLocalPlayerInfo().player_team_id == (data[1].team as DOTATeam_t)) {
                if (panel) {
                    panel.RemoveClass('flash');
                    panel.AddClass('flash');
                }
            }
        },
        []
    );
    useGameEvent(
        'React_Change_State',
        data => {
            console.log('React_Change_State ');
            console.log(data);
            // @ts-ignore
            setState(data.data);
            // @ts-ignore
            const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
            const GameModeLabel = dotaHud!.FindChildTraverse('GameModeLabel');
            // @ts-ignore
            if (data.data == 1) {
                // @ts-ignore
                // GameModeLabel.text = "BAN人时间"
                // @ts-ignore
            } else if (data.data == 2) {
                // @ts-ignore
                // GameModeLabel.text = "选人时间"
                // @ts-ignore
            } else if (data.data == 3) {
                // @ts-ignore
                // GameModeLabel.text = "决策时间"
                invisStrategyPanel();
            }
        },
        []
    );
    useEffect(() => {
        console.log('ReactToLua Init()');
        //测试以及掉线玩家重连初始化界面
        GameEvents.SendCustomGameEventToServer('ReactToLua', { data: 'test' });
        // @ts-ignore
        // setBpListALl(CustomNetTables.GetTableValue('react_table', 'bp_list_all'));
        // // @ts-ignore
        // setBpListResultAll(CustomNetTables.GetTableValue('react_table', 'bp_list_result'));
    }, []);
    // useEffect(() => {
    //     console.log('react_table变化');
    //     // @ts-ignore
    //     // console.log(react_table);
    // }, [react_table]);
    // useEffect(() => {
    //     console.log('BpListResult变化');
    //     console.log(BpListResultAll);
    // }, [BpListResultAll]);

    const debouncedHandler = debounce(
        () => {
            // @ts-ignore
            // setBpListResultAll(CustomNetTables.GetTableValue('react_table', 'bp_list_result'));
        },
        50 // 0.05秒
    );
    const clickList = (Player_box_index: number, key_string: keyof BPList, index: number, panel: Panel) => {
        // 首先判断id, 是否是自己的盒子
        const LocalPlayerID = Game.GetLocalPlayerID();
        const team = Game.GetLocalPlayerInfo().player_team_id;
        
        // console.log(LocalPlayerID);
        // console.log(`${PlayerID}点击了hero_list的${index}`);
        // console.log(PlayerID);
        const BpListResultAll = CustomNetTables.GetTableValue('react_table', 'bp_list_result') as BpListResultAll;
        //@ts-ignore
        const State = CustomNetTables.GetTableValue('react_table', 'react_table_state')[1] as number;
        let team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        let enemy_team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'moriya' : 'hakurei';
        let BP_tag: keyof BpListResultItem = 'BanList';
        const PlayerID = BpListResultAll[team_tag][Player_box_index].PlayerID
        console.log(`${Player_box_index}点击了${key_string}的${index},PlayerID是${PlayerID}`);
        console.log('State 是 : ' + State);

        if (State == 1) {
            // console.log('是ban人');
            BP_tag = 'BanList';
        } else if (State == 2) {
            // console.log('是选人');
            BP_tag = 'PickList';
        }
        if (LocalPlayerID != PlayerID || State == 3) {
            // 若不是自己的盒子, 则不发送,State == 3是展示 ,直接闪烁
            panelFlash(panel, Player_box_index, team);
            return;
        } else {
            // 若是自己的盒子, 则发送数据到lua , 修改后台数据
            let PlayerData = BpListResultAll[team_tag][Player_box_index][BP_tag];
            PlayerData[key_string] = index;
            console.log(`这是${Player_box_index}号盒子${team_tag}队伍的${BP_tag}的${key_string}的${index}`);
            
            // console.log('敌人ban的');
            // console.log(BpListResultAll[enemy_team_tag][Player_box_index].BanList);
            
            // console.log('自己选的');
            // console.log(PlayerData);
            // 若点击的是被ban的数据, 则不发送
            if (index == BpListResultAll[enemy_team_tag][Player_box_index].BanList[key_string] && State == 2) {
                console.log('点击的是被ban的数据');
                return;
            }
            GameEvents.SendCustomGameEventToServer('ChangeResult', { data: { PlayerData: PlayerData, team: team } });
        }
    };

    const sendSwapButton = (Player_box_index: number, LocalPlayerBoxIndex: number) => {
        const BpListResultAll = CustomNetTables.GetTableValue('react_table', 'bp_list_result') as BpListResultAll;
        const team = Game.GetLocalPlayerInfo().player_team_id;
        const team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        console.log(`${team_tag}的${LocalPlayerBoxIndex}号盒子,ID为点击了${Player_box_index}号盒子的交换按钮`);
        let ChangeReceive = BpListResultAll[team_tag][Player_box_index].ChangeReceiveList;
        // console.log(ChangeReceive.length);
        let length = ChangeReceive.length;
        let NewChangeReceive: number[] = [];
        if (length == undefined) {
            length = 0;
            NewChangeReceive = [LocalPlayerBoxIndex];
        } else {
            for (let i = 0; i < length; i++) {
                NewChangeReceive.push(ChangeReceive[i + 1]);
            }
        }
        console.log(NewChangeReceive);

        GameEvents.SendCustomGameEventToServer('ChangeReceive', {
            data: { Player_box_index: Player_box_index, NewChangeReceive: NewChangeReceive, team: team },
        });
    };

    const agreeSwapButton = (Player_box_index: number, index: number) => {
        // console.log(`${Player_box_index}号盒子,同意了${index}号盒子发送的交换`);
        const team = Game.GetLocalPlayerInfo().player_team_id;
        GameEvents.SendCustomGameEventToServer('AgreeReceive', { data: { Player_box_index: Player_box_index, index: index, team: team } });
    };

    // @ts-ignore
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
    const GameModeLabel = dotaHud!.FindChildTraverse('GameModeLabel');
    if (State == 1) {
        // @ts-ignore
        GameModeLabel.text = 'BAN人时间';
        // @ts-ignore
    } else if (State == 2) {
        // @ts-ignore
        GameModeLabel.text = '选人时间';
        // @ts-ignore
    } else if (State == 3) {
        // @ts-ignore
        GameModeLabel.text = '决策时间';
        invisStrategyPanel();
    }

    if (LocalPlayerInfo.player_id != -1 && LocalPlayerInfo.player_id != 23 && Game.GetMapInfo().map_name != `maps/dota.vpk`) {
        // if(false){
        invisAimPanel();
        return (
                <>
                    <Panel className="BP_HUD_box">
                        {new Array(5).fill(0).map((item, index) => {
                            return (
                                BpListAll && <PlayerBox key={`PlayerBox${index + 1}`} Player_box_index={index + 1} bp_list_all={BpListAll}  />
                            );
                        })}
                    </Panel>
                </>
            )
    } else {
        //观战

        return (
            <>
                <Panel style={{ width: '100%', height: '500px', backgroundColor: '#252525', marginTop: '20%', flowChildren: 'down' }}>
                    <Label style={{width: '100%', height: '50px',verticalAlign: 'center', textAlign: 'center', fontSize: '80px', color: '#fff'}} text={`${State}`}></Label>
                </Panel>
            </>
        );
    }


    function PlayerBox({ Player_box_index, bp_list_all }: { Player_box_index: number; bp_list_all: bp_list[]}) {
        // @ts-ignore
        var PlayerID: PlayerID;
        var EnemyID: PlayerID;
        // @ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;
        const BpListResultAll = useNetTableValues('react_table')?.bp_list_result as BpListResultAll;
        if (BpListResultAll == undefined) {
            return null;
        }
        const LocalPlayerInfo = Game.GetLocalPlayerInfo();
        const LocalPlayerID = LocalPlayerInfo.player_id;
        const team = Game.GetLocalPlayerInfo().player_team_id;
        const team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        const enemy_team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'moriya' : 'hakurei';
        if (BpListResultAll[team_tag][Player_box_index] != undefined) {
            // console.log(BpListResultAll[team_tag][Player_box_index].PlayerID);
            PlayerID = BpListResultAll[team_tag][Player_box_index].PlayerID;
            EnemyID = BpListResultAll[enemy_team_tag][Player_box_index].PlayerID;
        } else {
            return null;
        }
        let PlayerSteamID: string = '';
        let EnemyPlayerSteamID: string = '';
        if (Game.GetPlayerInfo(PlayerID) != undefined) {
            PlayerSteamID = Game.GetPlayerInfo(PlayerID).player_steamid;
        }
        if (Game.GetPlayerInfo(EnemyID) != undefined) {
            EnemyPlayerSteamID = Game.GetPlayerInfo(EnemyID).player_steamid;
        }
        let LocalPlayerBoxIndex: number;
        console.log(`${Player_box_index}号盒子的PlayerID是${BpListResultAll[team_tag][Player_box_index].PlayerID},EnemyID是${EnemyID}`);
        // console.log(BpListResultAll[team_tag][Player_box_index].PlayerID);
        for (let i = 1; i < 6; i++) {
            if (BpListResultAll[team_tag][i] != undefined) {
                if (BpListResultAll[team_tag][i].PlayerID == LocalPlayerID) {
                    LocalPlayerBoxIndex = i;
                }
            }
        }
        let hero_list: string[];
        let abi_list: string[];
        let ult_list: string[];
        const key_hero: keyof BPList = 'hero';
        const key_abi: keyof BPList = 'abi';
        const key_ult: keyof BPList = 'ult';
        if (bp_list_all !== undefined) {
            // console.log(bp_list_all[Player_box_index]);
            hero_list = bp_list_all[Player_box_index]['hero_list'];
            abi_list = bp_list_all[Player_box_index]['abi_list'];
            ult_list = bp_list_all[Player_box_index]['ult_list'];
        } else {
            return null;
        }
        // console.log('测试=================');
        
        const my_ban_hero_number = BpListResultAll[team_tag][Player_box_index].BanList.hero;
        const my_ban_abi_number = BpListResultAll[team_tag][Player_box_index].BanList.abi;
        const my_ban_ult_number = BpListResultAll[team_tag][Player_box_index].BanList.ult;
        const enemy_ban_hero_number = BpListResultAll[enemy_team_tag][Player_box_index].BanList.hero;
        const enemy_ban_abi_number = BpListResultAll[enemy_team_tag][Player_box_index].BanList.abi;
        const enemy_ban_ult_number = BpListResultAll[enemy_team_tag][Player_box_index].BanList.ult;

        const my_pick_hero_number = BpListResultAll[team_tag][Player_box_index].PickList.hero;
        const my_pick_abi_number = BpListResultAll[team_tag][Player_box_index].PickList.abi;
        const my_pick_ult_number = BpListResultAll[team_tag][Player_box_index].PickList.ult;
        const enemy_pick_hero_number = BpListResultAll[enemy_team_tag][Player_box_index].PickList.hero;
        const enemy_pick_abi_number = BpListResultAll[enemy_team_tag][Player_box_index].PickList.abi;
        const enemy_pick_ult_number = BpListResultAll[enemy_team_tag][Player_box_index].PickList.ult;

        
        let my_hero_name = hero_list[my_ban_hero_number];
        let my_abi_name = abi_list[my_ban_abi_number];
        let my_ult_name = ult_list[my_ban_ult_number];
        let enemy_hero_name = hero_list[enemy_ban_hero_number];
        let enemy_abi_name = abi_list[enemy_ban_abi_number];
        let enemy_ult_name = ult_list[enemy_ban_ult_number];
        if (State != 1) {
            my_hero_name = hero_list[my_pick_hero_number];
            my_abi_name = abi_list[my_pick_abi_number];
            my_ult_name = ult_list[my_pick_ult_number];
            enemy_hero_name = hero_list[enemy_pick_hero_number];
            enemy_abi_name = abi_list[enemy_pick_abi_number];
            enemy_ult_name = ult_list[enemy_pick_ult_number];
        }

        const ChangeReceiveList = Object.values(BpListResultAll[team_tag][Player_box_index].ChangeReceiveList);

        const { margin_left, margin_right } = getMargin(Player_box_index);
        return (
            <>
                <Panel className="Player_box" style={{ marginLeft: margin_left, marginRight: margin_right }}>
                    {<PlayerData key={`MyPlayerData_${Player_box_index}`} Player_box_index={Player_box_index} prosPlayerSteamID={PlayerSteamID} PlayerID={PlayerID} />}
                    {<MyShowBox key={`MyShowBox_${Player_box_index}`} Player_box_index={Player_box_index} prosMyHeroName={my_hero_name} prosMyAbiName={my_abi_name} prosMyUltName={my_ult_name} />}
                    {<SelectBoxHero key={`SelectBoxHero_${Player_box_index}`} Player_box_index={Player_box_index} PlayerID={PlayerID} propsMyBanHeroNumber = {my_ban_hero_number} propsMyPickHeroNumber = {my_pick_hero_number} propsEnemyBanHeroNumber = {enemy_ban_hero_number} />}
                    {<SelectBoxAbi key={`MySelectBoxAbi_${Player_box_index}` } Player_box_index={Player_box_index} PlayerID={PlayerID}  propsMyBanNumber = {my_ban_abi_number} propsMyPicNumber = {my_pick_abi_number} propsEnemyBanNumber = {enemy_ban_abi_number} key_type = {key_abi} />}
                    {<SelectBoxAbi key={`EnemySelectBoxAbi_${Player_box_index}` } Player_box_index={Player_box_index} PlayerID={PlayerID}  propsMyBanNumber = {my_ban_ult_number} propsMyPicNumber = {my_pick_ult_number} propsEnemyBanNumber = {enemy_ban_ult_number} key_type = {key_ult} />}
                    {<PlayerData key={`EnemyPlayerData_${Player_box_index}`} Player_box_index={Player_box_index} prosPlayerSteamID={EnemyPlayerSteamID} PlayerID={EnemyID} />}
                    {<EnemyShowBox key={`EnemyShowBox_${Player_box_index}`} Player_box_index={Player_box_index} prosEnemyHeroName={enemy_hero_name} prosEnemyAbiName={enemy_abi_name} prosEnemyUltName={enemy_ult_name} />}
                    <Panel className="swap_button" style={{ visibility: PlayerID == LocalPlayerID || State == 3 ? 'collapse' : 'visible' }}>
                        <TextButton
                            text={'交换位置'}
                            style={{ color: '#C0C0C0' }}
                            onactivate={() => sendSwapButton(Player_box_index, LocalPlayerBoxIndex)}
                        ></TextButton>
                    </Panel>
                    {new Array(5).fill(0).map((item, index) => {
                        return (
                            <AgreeSwapPanel key={`AgreeSwapPanel_${Player_box_index}_${index + 1}`} Player_box_index={Player_box_index} index={index + 1} LocalPlayerBoxIndex={LocalPlayerBoxIndex}/>
                        )
                    })}
                </Panel>
            </>
        );
    }
    function AgreeSwapPanel({Player_box_index,index,LocalPlayerBoxIndex}:{Player_box_index:number,index:number,LocalPlayerBoxIndex:number}) {
        const [LocalChangeReceiveList, setLocalChangeReceiveList] = useState<number[]>([]);
        const BpListResultAll = CustomNetTables.GetTableValue('react_table', 'bp_list_result') as BpListResultAll;
        //@ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;   
        const team = Game.GetLocalPlayerInfo().player_team_id;
        const team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        const ChangeReceiveList = Object.values(BpListResultAll[team_tag][Player_box_index].ChangeReceiveList);
        let visibility: Partial<'visible' | 'collapse'> = 'collapse';
        let buttonVisibility: Partial<'visible' | 'collapse'> = 'collapse';
        if (JSON.stringify(LocalChangeReceiveList) !== JSON.stringify(ChangeReceiveList)) {
          setLocalChangeReceiveList(ChangeReceiveList);
        }
        for (let i = 0; i < LocalChangeReceiveList.length; i++) {
            if (LocalChangeReceiveList[i] == index) {
                // console.log(`${Player_box_index}号盒子收到了${index}盒子的交换`);
                visibility = 'visible';
                buttonVisibility = 'visible';
            }
        }
        if (Player_box_index != LocalPlayerBoxIndex) {
            // visibility = 'collapse';
            buttonVisibility = 'collapse';
        }
        if (State == 3) {
            visibility = 'collapse';
            buttonVisibility = 'collapse';
        }
        let info_name = '未知玩家';
        const info = Game.GetPlayerInfo(BpListResultAll[team_tag][index].PlayerID);
        if (info) {
            info_name = info.player_name;
        }
        return useMemo(() => {
            return (
                <Panel
                key={`AgreeSwapButton_${Player_box_index}_${index}`}
                className=""
                style={{ width: '100%', height: '30px', flowChildren: 'left', visibility: visibility }}
            >
                <Panel style={{ marginRight: '5%', width: '70px', height: '30px', flowChildren: 'right' }}>
                    <TextButton
                        className='swap_button'
                        text={'同意交换'}
                        style={{ color: '#C0C0C0' ,visibility: buttonVisibility}}
                        onactivate={() => agreeSwapButton(Player_box_index, index)}
                    ></TextButton>
                </Panel>
                <Label
                    className="Player_box_element"
                    style={{ color: '#C0C0C0', marginRight: '20%' }}
                    text={`${info_name}发起交换`}
                />
            </Panel>
            );
        }, [LocalChangeReceiveList]);
    }
    function PlayerData({ Player_box_index,prosPlayerSteamID,PlayerID }: { Player_box_index: number,prosPlayerSteamID:string ,PlayerID:PlayerID }) {
        const [PlayerSteamID, setPlayerSteamID] = useState('');
        // console.log(`prosPlayerSteamID是${prosPlayerSteamID}`);
        
        const BpListResultAll = useNetTableValues('react_table')?.bp_list_result as BpListResultAll;
        const string  = Game.GetPlayerInfo(PlayerID) ? Game.GetPlayerInfo(PlayerID).player_name : '未知玩家'
        // console.log(`id是${id},string是${string}`);
        
        if(PlayerSteamID!=prosPlayerSteamID){
            setPlayerSteamID(prosPlayerSteamID);
        }
        return useMemo(() => {
            return (
                BpListResultAll && (
                    <Panel className="my_player_data" style={{ marginTop: State == 3 ? '20%' : '2px' }}>
                        <Panel style={{ width: '100%', height: '50px', flowChildren: 'right' }}>
                            <DOTAAvatarImage style={{ width: '30px', height: '100%', marginLeft: '20%' }} steamid={PlayerSteamID} />
                            <DOTAUserName
                                className="Player_box_element"
                                style={{ color: '#C0C0C0', marginLeft: '10px', horizontalAlign: 'left' }}
                                steamid={PlayerSteamID}
                            />
                            {/* <Label
                                className="Player_box_element"
                                style={{ color: '#C0C0C0', marginLeft: '10px', horizontalAlign: 'left' }}
                                text={string}
                            ></Label> */}
                        </Panel>
                    </Panel>
                )
            );
        }, [PlayerSteamID]);
    }

    function MyShowBox({ Player_box_index,prosMyHeroName,prosMyAbiName,prosMyUltName }: { Player_box_index: number,prosMyHeroName:string,prosMyAbiName:string,prosMyUltName:string }) {
        const [myHeroName, setmyHeroName] = useState(prosMyHeroName);
        const [myAbiName, setmyAbiName] = useState(prosMyAbiName);
        const [myUltName, setmyUltName] = useState(prosMyUltName);
        // console.log(`${Player_box_index}盒子的MyShowBox的myAbiName是:${myAbiName}`);
        
        // const [text , settext] = useState('');
        const team = Game.GetLocalPlayerInfo().player_team_id;
        const team_tag = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        // @ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;
        const text = prosMyHeroName == undefined ? '' : $.Localize(`#${myHeroName}`);
        if (myHeroName != prosMyHeroName) {
            setmyHeroName(prosMyHeroName);
            // settext(text);
        }
        if (myAbiName != prosMyAbiName) {
            setmyAbiName(prosMyAbiName);
        }
        if (myUltName != prosMyUltName) {
            setmyUltName(prosMyUltName);
        }
        return useMemo(() => {
            // console.log(`${Player_box_index}盒子的MyShowBox渲染,myHeroName:${myHeroName},prosMyHeroName是${prosMyHeroName}`);
            
            return (
                <Panel className="show_box">
                    <Panel
                        className="hero_img_box"
                        id={`${team_tag}_hero_${Player_box_index}`}
                        onactivate={panel => panelFlash(panel, Player_box_index, team)}
                    >
                        <DOTAHeroMovie className="hero_image_portrait" heroname={myHeroName} />
                    </Panel>
                    <Panel className="ability_info">
                        <Panel className="hero_name">
                            <Label
                                className="sub_label"
                                text={text}
                                style={{ color: '#C0C0C0', fontSize: '15px' }}
                            ></Label>
                        </Panel>
                        <Panel className="show_ability_box">
                            <Panel className="ability">
                                {myAbiName && <DOTAAbilityImage
                                    className="ability"
                                    id={`${team_tag}_abi_${Player_box_index}`}
                                    showtooltip={true}
                                    abilityname={myAbiName}
                                    style={{ width: '100%', height: '100%' }}
                                    onactivate={panel => {
                                        panelFlash(panel, Player_box_index, team);
                                    }}
                                />}
                            </Panel>
                            <Panel className="ability">
                                {myUltName && <DOTAAbilityImage
                                    className="ability"
                                    id={`${team_tag}_ult_${Player_box_index}`}
                                    showtooltip={true}
                                    abilityname={myUltName}
                                    style={{ width: '100%', height: '100%' }}
                                    onactivate={panel => {
                                        panelFlash(panel, Player_box_index, team);
                                    }}
                                />}
                            </Panel>
                        </Panel>
                    </Panel>
                </Panel>
            );
        }, [myHeroName, myAbiName, myUltName,State]);
    }
    function SelectBoxHero ({ Player_box_index,PlayerID,propsMyBanHeroNumber,propsMyPickHeroNumber,propsEnemyBanHeroNumber }: { Player_box_index: number ,PlayerID:PlayerID,propsMyBanHeroNumber:number,propsMyPickHeroNumber:number,propsEnemyBanHeroNumber:number}) {
        // console.log(`${Player_box_index}盒子的propsMyBanHeroNumber是${propsMyBanHeroNumber}`);
        const [myBanHeroNumber, setmyBanHeroNumber] = useState(propsMyBanHeroNumber);
        const [myPickHeroNumber, setmyPickHeroNumber] = useState(propsMyPickHeroNumber);
        const [enemyBanHeroNumber, setenemyBanHeroNumber] = useState(propsEnemyBanHeroNumber);
        //@ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;   
        const bpListAll = useNetTableValues('react_table')?.bp_list_all as bp_list[];
        const BpListResultAll = useNetTableValues('react_table')?.bp_list_result as BpListResultAll;
        const hero_list = bpListAll[Player_box_index].hero_list
        const key_hero: keyof BPList = 'hero';
        if (propsMyBanHeroNumber != myBanHeroNumber) {
            setmyBanHeroNumber(propsMyBanHeroNumber);
        }
        if (propsMyPickHeroNumber != myPickHeroNumber) {
            setmyPickHeroNumber(propsMyPickHeroNumber);
        }
        if (propsEnemyBanHeroNumber != enemyBanHeroNumber) {
            setenemyBanHeroNumber(propsEnemyBanHeroNumber);
        }
        return useMemo(() => {
            // console.log(`${Player_box_index}号盒子的SelectBoxHero渲染`);
            return (
                
                <Panel className="select_box div_1" style={{ visibility: State == 3 ? 'collapse' : 'visible' }}>
                        <Label className="sub_label" style={{ color: '#C0C0C0' }} text={'少女'}></Label>
                        {new Array(6).fill(0).map((item, index) => {
                            let ban_class_name = '';
                            let ability_class_name = '';
                            if (State == 1) {
                                // Ban人状态下只显示自己ban的英雄
                                if (myBanHeroNumber == index + 1) {
                                    ban_class_name = 'banned';
                                }
                            } else if (State == 2) {
                                // Pick人状态下显示enemy ban的英雄
                                if (enemyBanHeroNumber == index + 1) {
                                    ban_class_name = 'banned';
                                }
                                // 显示自己pick的英雄
                                if (myPickHeroNumber == index + 1) {
                                    ability_class_name = 'select_ability';
                                }
                            }
                            return (
                                hero_list[index + 1] && (
                                    <Image
                                        key={`${key_hero}_${Player_box_index}_${index + 1}`}
                                        id={`${key_hero}_${Player_box_index}_${index + 1}`}
                                        className={`hero_image ${ban_class_name} ${ability_class_name}`}
                                        src={`s2r://panorama/images/heroes/thd2_${hero_list[index + 1]}_png.vtex`}
                                        onactivate={panel => clickList(Player_box_index, key_hero, index + 1, panel)}
                                    ></Image>
                                )
                            );
                        })}
                    </Panel>
            )
        },[myBanHeroNumber,myPickHeroNumber,enemyBanHeroNumber,State])
    }
    function SelectBoxAbi ({ Player_box_index,PlayerID,propsMyBanNumber,propsMyPicNumber,propsEnemyBanNumber, key_type}: { Player_box_index: number , PlayerID:PlayerID, propsMyBanNumber:number,propsMyPicNumber:number,propsEnemyBanNumber:number,key_type: keyof BPList }) {
        const [myBanNumber, setmyBanNumber] = useState(propsMyBanNumber);
        const [myPickNumber, setmyPickNumber] = useState(propsMyPicNumber);
        const [enemyBanNumber, setenemyAbiNumber] = useState(propsEnemyBanNumber);
        //@ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;   
        const bpListAll = useNetTableValues('react_table')?.bp_list_all as bp_list[];
        let abi_list = bpListAll[Player_box_index].abi_list
        if (key_type == 'ult') {
            abi_list = bpListAll[Player_box_index].ult_list
        }
        if (propsMyBanNumber != myBanNumber) {
            setmyBanNumber(propsMyBanNumber);
        }
        if (propsMyPicNumber != myPickNumber) {
            setmyPickNumber(propsMyPicNumber);
        }
        if (propsEnemyBanNumber != enemyBanNumber) {
            setenemyAbiNumber(propsEnemyBanNumber);
        }
        return useMemo(() => {
            return (
                <Panel className="select_box div_2" style={{ visibility: State == 3 ? 'collapse' : 'visible' }}>
                    <Label className="sub_label" style={{ color: '#C0C0C0' }} text={'普通技能'}></Label>
                    {new Array(8).fill(0).map((item, index) => {
                        let ban_class_name = '';
                        let ability_class_name = '';
                        if (State == 1) {
                            // Ban人状态下只显示自己ban的技能
                            if (myBanNumber == index + 1) {
                                ban_class_name = 'banned';
                            }
                        } else if (State == 2) {
                            // Pick人状态下显示enemy ban的技能
                            if (enemyBanNumber == index + 1) {
                                ban_class_name = 'banned';
                            }
                            // 显示自己pick的技能
                            if (myPickNumber == index + 1) {
                                ability_class_name = 'select_ability';
                            }
                        }
                        return (
                            abi_list[index + 1] && (
                                <DOTAAbilityImage
                                    id={`${key_type}_${Player_box_index}_${index + 1}`}
                                    key={`${key_type}_${Player_box_index}_${index + 1}`}
                                    className={`ability ${ban_class_name} ${ability_class_name}`}
                                    showtooltip={true}
                                    abilityname={abi_list[index + 1]}
                                    onactivate={panel => clickList(Player_box_index, key_type, index + 1, panel)}
                                />
                            )
                        );
                    })}
                </Panel>
            );
        },[myBanNumber,myPickNumber,enemyBanNumber,State])
    }
    function EnemyShowBox ({ Player_box_index,prosEnemyHeroName,prosEnemyAbiName,prosEnemyUltName }: { Player_box_index: number,prosEnemyHeroName:string,prosEnemyAbiName:string,prosEnemyUltName:string }){
        // console.log("这是ShowBox组件渲染");
        const [enemyHeroName, setenemyHeroName] = useState(prosEnemyHeroName);
        const [enemyAbiName, setenemyAbiName] = useState(prosEnemyAbiName);
        const [enemyUltName, setenemyUltName] = useState(prosEnemyUltName);
        const team = Game.GetLocalPlayerInfo().player_team_id;
        const enemy_team_tag = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'moriya' : 'hakurei';
        // @ts-ignore
        const State = useNetTableValues('react_table')?.react_table_state[1] as number;        
        if (enemyHeroName != prosEnemyHeroName) {
            setenemyHeroName(prosEnemyHeroName);
        }
        if (enemyAbiName != prosEnemyAbiName) {
            setenemyAbiName(prosEnemyAbiName);
        }
        if (enemyUltName != prosEnemyUltName) {
            setenemyUltName(prosEnemyUltName);
        }
        return useMemo(() => {
            return (
                <Panel className="show_box" style={{ visibility: State == 3 ? 'visible' : 'collapse' }}>
                        <Panel
                            className="hero_img_box"
                            id={`${enemy_team_tag}_hero_${Player_box_index}`}
                            onactivate={panel => panelFlash(panel, Player_box_index, team)}
                        >
                            <DOTAHeroMovie className="hero_image_portrait" heroname={enemyHeroName} />
                        </Panel>
                        <Panel className="ability_info">
                            <Panel className="hero_name">
                                {enemyHeroName && (
                                    <Label
                                        className="sub_label"
                                        text={$.Localize(`#${enemyHeroName}`)}
                                        style={{ color: '#C0C0C0', fontSize: '15px' }}
                                    ></Label>
                                )}
                            </Panel>
                            <Panel className="show_ability_box">
                                <Panel className="ability">
                                    {enemyAbiName && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            id={`${enemy_team_tag}_abi_${Player_box_index}`}
                                            showtooltip={true}
                                            abilityname={enemyAbiName}
                                            style={{ width: '100%', height: '100%' }}
                                            onactivate={panel => panelFlash(panel, Player_box_index, team)}
                                        />
                                    )}
                                </Panel>
                                <Panel className="ability">
                                    {enemyUltName && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            id={`${enemy_team_tag}_ult_${Player_box_index}`}
                                            showtooltip={true}
                                            abilityname={enemyUltName}
                                            style={{ width: '100%', height: '100%' }}
                                            onactivate={panel => panelFlash(panel, Player_box_index, team)}
                                        />
                                    )}
                                </Panel>
                            </Panel>
                        </Panel>
                    </Panel>
            )
        },[enemyHeroName,enemyAbiName,enemyUltName,State])
    }

    function getMargin(Player_box_index: number): { margin_left: string; margin_right: string } {
        //屏幕
        const screen_width = Game.GetScreenWidth();
        const screen_height = Game.GetScreenHeight();
        const scale = Math.round((screen_width / screen_height) * 100) / 100;
        var margin_left = `10px`;
        var margin_right = `0px`;
        if (Player_box_index == 1) {
            if (scale == 1.6) {
                margin_left = `5%`;
            } else if (scale == 1.78) {
                margin_left = `10%`;
            } else if (scale == 2.33) {
                margin_left = `19%`;
            }
        }
        if (Player_box_index == 5) {
            if (scale == 1.6) {
                margin_right = `4%`;
            } else if (scale == 1.78) {
                margin_right = `8.9%`;
            } else if (scale == 2.33) {
                margin_right = `19%`;
            }
        }
        return { margin_left, margin_right };
    }
    function invisAimPanel() {
        // $.Msg("invis_aim_panel()");
        // @ts-ignore
        const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
        // @ts-ignore
        dotaHud.FindChildTraverse('HeroPickScreenContents').visible = false;
        // @ts-ignore
        dotaHud.FindChildTraverse('FriendsAndFoes').visible = false;
        // @ts-ignore
        dotaHud.FindChildTraverse('PreMinimapContainer').visible = false;
    }
    function invisStrategyPanel() {
        // $.Msg("invis_strategy_panel()");
        // @ts-ignore
        const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
        // @ts-ignore
        dotaHud.FindChildTraverse('StrategyScreen').visible = false;
        // @ts-ignore
        dotaHud.FindChildTraverse('RadiantTeamPlayers').visible = false;
        // @ts-ignore
        dotaHud.FindChildTraverse('DireTeamPlayers').visible = false;
    }
    function panelFlash(panel: Panel, Player_box_index: number, team: DOTATeam_t) {
        // if (panel) {
        // panel.RemoveClass('flash');
        // panel.AddClass('flash');
        // }
        GameEvents.SendCustomGameEventToServer('ReactFlash', { data: { Player_box_index: Player_box_index, team: team, panel_id: panel.id } });
    }
};


if (Game.GetMapInfo().map_name == `maps/1_thdots_map.vpk`) render(<OMGBP />, $.GetContextPanel());

interface bp_list {
    hero_list: Array<string>;
    abi_list: Array<string>;
    ult_list: Array<string>;
}
interface BpListResultItem {
    PlayerID: PlayerID;
    BanList: BPList;
    PickList: BPList;
    ChangeReceiveList: number[];
    Extra: {};
}

interface BpListResult {
    [key: number]: BpListResultItem;
}

interface BpListResultAll {
    hakurei: BpListResult;
    moriya: BpListResult;
}

interface BPList {
    ['hero']: number;
    ['abi']: number;
    ['ult']: number;
}
