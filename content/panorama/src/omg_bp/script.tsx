import { useEffect, useMemo, useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

export const OMGBP = () => {
    // @ts-ignore
    const BP_table = CustomNetTables.GetTableValue('react_table', 'test');
    const [Steate, setCount] = useState(5);
    const team_player_number = 5;
    const LocalPlayerInfo = Game.GetLocalPlayerInfo();
    const [bp_list_all, set_bp_list_all] = useState<bp_list[] | undefined>(undefined);
    const [State, setState] = useState(1); //1表示ban人时间，2表示选人时间,3表示展示时间
    const [jiaId, setjiaId] = useState<string[]>([]);
    const null_show_box: show_box = { hero_name: ``, abi_name: ``, ult_name: `` };
    const [BpListResultAll, setBpListResultAll] = useState<BpListResultAll>({
        hakurei: {} as BpListResult,
        moriya: {} as BpListResult,
    });
    // showBoxs,仅在前端使用,展示用
    const [showBoxs, setShowBoxs] = useState<{
        hakurei: show_box[];
        moriya: show_box[];
    }>({
        hakurei: [null_show_box, null_show_box, null_show_box, null_show_box, null_show_box],
        moriya: [null_show_box, null_show_box, null_show_box, null_show_box, null_show_box],
    });
    // console.log('OMGBP 11111111111111');
    // useEffect(() => {
    //     GameEvents.Subscribe("React_test", Click);
    // }, []);

    useGameEvent(
        'React_test',
        data => {
            console.log('React_test235674921 ');

            // @ts-ignore
            console.log(data.bp_list_result);

            // @ts-ignore
            setjiaId(data.jiaId);
            // @ts-ignore
            set_bp_list_all(data.bp_list_all);
            // @ts-ignore
            setBpListResultAll(data.bp_list_result);
            // @ts-ignore
            setState(data.react_table_state);
        },
        []
    );
    useGameEvent(
        'React_Change_State',
        data => {
            console.log('React_Change_State ');
            //@ts-ignore
            setState(data.data);
            
            // @ts-ignore
            const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
            const GameModeLabel = dotaHud!.FindChildTraverse("GameModeLabel")
            // @ts-ignore
            if (data.data == 1) {
                // @ts-ignore
                GameModeLabel.text = "BAN人时间"
                // @ts-ignore
            } else if (data.data == 2) {
                // @ts-ignore
                GameModeLabel.text = "选人时间"
                // @ts-ignore
            } else if (data.data == 3) {
                // @ts-ignore
                GameModeLabel.text = "决策时间"
            }
        },
        []
    );
    useEffect(() => {
        console.log('useEffect, 执行一次11');
        set_bp_list_all(undefined);
        // console.log(bp_list_all);
        // console.log(Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS);
        
        GameEvents.SendCustomGameEventToServer('React_BP_Init', { data: 'test1' });
    }, []);
    // useEffect(() => {
    //     // console.log('bp_list_all变化');
    //     // console.log(bp_list_all);
    //     // console.log('jiaId变化');
    //     // console.log(jiaId);
    //     // console.log('jiaId变化');
    //     // console.log(jiaId);

    //     // if (bp_list_all !== undefined) {
    //     //     console.log(Object.keys(bp_list_all[1]['abi_list']));
    //     //     console.log(Object.keys(bp_list_all[1]['abi_list']).length);
    //     // }
    // }, [bp_list_all, jiaId]);
    useEffect(() => {
        console.log('BpListResult变化');
        console.log(BpListResultAll.hakurei[1]);

        // if (bp_list_all !== undefined) {
        //     console.log(Object.keys(bp_list_all[1]['abi_list']));
        //     console.log(Object.keys(bp_list_all[1]['abi_list']).length);
        // }
    }, [BpListResultAll]);
    // useEffect(() => {
    //     console.log('showBoxs变化');
    //     console.log(showBoxs);
    //     // if (showBoxs !== undefined) {
    //     //     console.log(Object.keys(showBoxs[1]['abi_list']).length);
    //     // }
    //     // GameEvents.SendCustomGameEventToServer('ChangeResult', {data:null});
    // }, [showBoxs]);

    function ClickList(Player_box_index: number, key_string: keyof BPList, index: number, PlayerID: number, panel: Panel) {
        console.log(`${Player_box_index}点击了${key_string}的${index}`);
        // 首先判断id, 是否是自己的盒子
        const LocalPlayerID = Game.GetLocalPlayerID();
        const team = Game.GetLocalPlayerInfo().player_team_id;
        // console.log(LocalPlayerID);
        // console.log(`${PlayerID}点击了hero_list的${index}`);
        // console.log(PlayerID);
        var team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        var enemy_team_tag: keyof BpListResultAll = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'moriya' : 'hakurei';
        var BP_tag: keyof BpListResultItem = 'BanList';
        if (State == 1) {
            console.log('是ban人');
            BP_tag = 'BanList';
        } else if (State == 2) {
            console.log('是选人');
            BP_tag = 'PickList';
        } 
        if (LocalPlayerID != PlayerID || State == 3) {
            // 若不是自己的盒子, 则不发送,State == 3是展示 ,直接闪烁
            panel.RemoveClass('flash');
            panel.AddClass('flash');
            return;
        } else {
            // 若是自己的盒子, 则发送数据到lua , 修改后台数据
            // 若点击的是被ban的数据, 则不发送
            if (index == BpListResultAll[enemy_team_tag][Player_box_index].BanList[key_string]) {
                console.log('点击的是被ban的数据');
                return;
            }
            //根据State判断,1是ban,2是选人,3是展示
            // const WarpData:BPList = {
            //     ...BpListResultAll[team_tag][Player_box_index][BP_tap],
            // }
            var PlayerData = BpListResultAll[team_tag][Player_box_index][BP_tag];
            PlayerData[key_string] = index;
            console.log(PlayerData);

            GameEvents.SendCustomGameEventToServer('ChangeResult', { data: { PlayerData: PlayerData, team: team } });
        }
    }
    return useMemo(
        () => (
            <>
                <Panel className="BP_HUD_box">
                    {new Array(team_player_number).fill(0).map((item, index) => {
                        return (
                            bp_list_all &&
                            BpListResultAll && (
                                <Player_box
                                    key={index + 1}
                                    Player_box_index={index + 1}
                                    bp_list_all={bp_list_all}
                                    State={State}
                                    showBoxs={showBoxs}
                                    setShowBoxs={setShowBoxs}
                                    jiaId={jiaId}
                                    BpListResultAll={BpListResultAll}
                                />
                            )
                        );
                    })}
                </Panel>
            </>
        ),
        [bp_list_all, State, showBoxs, jiaId, BpListResultAll]
    );

    function Player_box({
        Player_box_index,
        bp_list_all,
        State,
        showBoxs,
        setShowBoxs,
        jiaId,
        BpListResultAll,
    }: {
        Player_box_index: number;
        bp_list_all: bp_list[];
        State: number;
        showBoxs: { hakurei: show_box[]; moriya: show_box[] };
        setShowBoxs: React.Dispatch<React.SetStateAction<{ hakurei: show_box[]; moriya: show_box[] }>>;
        jiaId: string[];
        BpListResultAll: BpListResultAll;
    }) {
        // console.log('Player_box' + Player_box_index);
        // @ts-ignore
        var PlayerID: number;
        const LocalPlayerInfo = Game.GetLocalPlayerInfo();
        const LocalPlayerID = LocalPlayerInfo.player_id;
        const team_tag: keyof BpListResultAll = Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'hakurei' : 'moriya';
        const enemy_team_tag: keyof BpListResultAll =
            Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS ? 'moriya' : 'hakurei';
        var BP_tag: keyof BpListResultItem = 'BanList';
        // var State = 2;
        if (State == 1) {
            BP_tag = 'BanList';
        } else if (State == 2) {
            BP_tag = 'PickList';
        }
        if (BpListResultAll[team_tag][Player_box_index] != undefined) {
            // console.log(BpListResultAll[team_tag][Player_box_index].PlayerID);
            PlayerID = BpListResultAll[team_tag][Player_box_index].PlayerID;
        } else {
            return null;
        }
        var PlayerID_string = jiaId[PlayerID];
        if (PlayerID == LocalPlayerID) {
            PlayerID_string = LocalPlayerInfo.player_name;
        }
        var EnemyID_string = jiaId[BpListResultAll[enemy_team_tag][Player_box_index].PlayerID];

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

            //遍历abi_list
            for (let i = 0; i < Object.keys(hero_list).length; i++) {
                const element = Object.keys(hero_list)[i];
            }
            // console.log(showBoxs[team_tag][Player_box_index-1].hero_name);
        } else {
            return null;
        }
        // console.log('测试=================');
        let my_hero_name = hero_list[BpListResultAll[team_tag][Player_box_index].BanList.hero];
        let my_abi_name = abi_list[BpListResultAll[team_tag][Player_box_index].BanList.abi];
        let my_ult_name = ult_list[BpListResultAll[team_tag][Player_box_index].BanList.ult];
        let enemy_hero_name = hero_list[BpListResultAll[enemy_team_tag][Player_box_index].BanList.hero];
        let enemy_abi_name = abi_list[BpListResultAll[enemy_team_tag][Player_box_index].BanList.abi];
        let enemy_ult_name = ult_list[BpListResultAll[enemy_team_tag][Player_box_index].BanList.ult];
        if (State == 2) {
            my_hero_name = hero_list[BpListResultAll[team_tag][Player_box_index].PickList.hero];
            my_abi_name = abi_list[BpListResultAll[team_tag][Player_box_index].PickList.abi];
            my_ult_name = ult_list[BpListResultAll[team_tag][Player_box_index].PickList.ult];
        }

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

        console.log(BpListResultAll.hakurei[Player_box_index].ChangeReceiveList);

        const { margin_left, margin_right } = GetMargin(Player_box_index);
        return (
            <>
                <Panel className="Player_box" style={{ marginLeft: margin_left, marginRight: margin_right }}>
                    <Panel className="my_player_data" style={{ marginTop: State == 3 ? '20%' : '2px'}}>
                        <Panel style={{width: '100%', height: '50px' }}>
                            <DOTAAvatarImage style={{ width: '30px', height: '100%', marginLeft: '25%' }} steamid={'local'}>
                                {/* <Image style={{ width: '50px', height: '50px' }} /> */}
                                {/* <Label className="Player_box_element" style={{ color: '#C0C0C0',width: '100px', height: '20px' }} text={PlayerID_string} /> */}
                            </DOTAAvatarImage>
                            {/* <DOTAUserName style={{ color: '#C0C0C0', width: '100%', height: '100%' ,marginTop: '15px', marginLeft: '36%' }} steamid={'local'} /> */}
                            <Label className="Player_box_element" style={{ color: '#C0C0C0' }} text={PlayerID_string} />
                        </Panel>
                    </Panel>
                    <Panel className="show_box">
                        <Panel className="hero_img_box">
                            <DOTAHeroMovie className="hero_image_portrait" heroname={my_hero_name} />
                        </Panel>
                        <Panel className="ability_info">
                            <Panel className="hero_name">
                                {my_hero_name && (
                                    <Label className="sub_label" text={$.Localize(`#${my_hero_name}`)} style={{ color: '#C0C0C0' ,fontSize: '15px'}}></Label>
                                )}
                            </Panel>
                            <Panel className="show_ability_box">
                                <Panel className="ability">
                                    {my_abi_name && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            showtooltip={true}
                                            abilityname={my_abi_name}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    )}
                                </Panel>
                                <Panel className="ability">
                                    {my_ult_name && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            showtooltip={true}
                                            abilityname={my_ult_name}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    )}
                                </Panel>
                            </Panel>
                        </Panel>
                    </Panel>
                    <Panel className="select_box div_1" style={{visibility: State == 3 ? 'collapse' : 'visible'}}>
                        <Label className="sub_label" style={{ color: '#C0C0C0' }} text={'少女'}></Label>
                        {new Array(6).fill(0).map((item, index) => {
                            return (
                                hero_list[index + 1] && (
                                    <Image
                                        key={index + 1}
                                        className={`hero_image ${enemy_ban_hero_number == index + 1 ? 'banned' : ''} ${(State == 1 && my_ban_hero_number == index + 1) ? 'banned' : ''} ${(State == 2 && my_pick_hero_number == index +1) ? "select_ability" : ''}`}
                                        src={`s2r://panorama/images/heroes/thd2_${hero_list[index + 1]}_png.vtex`}
                                        onactivate={panel => ClickList(Player_box_index, key_hero, index + 1, PlayerID, panel)}
                                    ></Image>
                                )
                            );
                        })}
                    </Panel>
                    <Panel className="select_box div_2" style={{visibility: State == 3 ? 'collapse' : 'visible'}}>
                        <Label className="sub_label" style={{ color: '#C0C0C0' }} text={'普通技能'}></Label>
                        {new Array(8).fill(0).map((item, index) => {
                            return (
                                abi_list[index + 1] && (
                                    <DOTAAbilityImage
                                        key={index + 1}
                                        className={`ability ${enemy_ban_abi_number == index + 1 ? 'banned' : ''} ${(State == 1 && my_ban_abi_number == index + 1) ? 'banned' : ''} ${(State == 2 && my_pick_abi_number == index + 1) ? "select_ability" : ''}`}
                                        showtooltip={true}
                                        abilityname={abi_list[index + 1]}
                                        onactivate={panel => ClickList(Player_box_index, key_abi, index + 1, PlayerID, panel)}
                                    ></DOTAAbilityImage>
                                )
                            );
                        })}
                    </Panel>
                    <Panel className="select_box div_3" style={{visibility: State == 3 ? 'collapse' : 'visible'}}>
                        <Label className="sub_label" style={{ color: '#C0C0C0' }} text={'终极技能'}></Label>
                        {new Array(8).fill(0).map((item, index) => {
                            return (
                                ult_list[index + 1] && (
                                    <DOTAAbilityImage
                                        key={index + 1}
                                        className={`ability ${enemy_ban_ult_number == index + 1 ? 'banned' : ''} ${(State == 1 && my_ban_ult_number == index + 1) ? 'banned' : ''} ${(State == 2 && my_pick_ult_number == index + 1) ? "select_ability" : ''}`}
                                        showtooltip={true}
                                        abilityname={ult_list[index + 1]}
                                        onactivate={panel => ClickList(Player_box_index, key_ult, index + 1, PlayerID, panel)}
                                    ></DOTAAbilityImage>
                                )
                            );
                        })}
                    </Panel>
                    <Panel className="enemy_player_data" style={{ marginTop: State == 3 ? '5%' : '5px'}}>
                        <Panel style={{width: '100%', height: '50px' }}>
                            <DOTAAvatarImage style={{ width: '30px', height: '100%', marginLeft: '25%' }} steamid={'local'}>
                                {/* <Image style={{ width: '50px', height: '50px' }} /> */}
                                {/* <Label className="Player_box_element" style={{ color: '#C0C0C0',width: '100px', height: '20px' }} text={PlayerID_string} /> */}
                            </DOTAAvatarImage>
                            {/* <DOTAUserName style={{ color: '#C0C0C0', width: '100%', height: '100%' ,marginTop: '15px', marginLeft: '36%' }} steamid={'local'} /> */}
                            <Label className="Player_box_element" style={{ color: '#C0C0C0' }} text={PlayerID_string} />
                        </Panel>
                    </Panel>
                    <Panel className="show_box" style={{visibility: State == 3 ? 'visible' : 'collapse'}}>
                        <Panel className="hero_img_box">
                            <DOTAHeroMovie className="hero_image_portrait" heroname={enemy_hero_name} />
                        </Panel>
                        <Panel className="ability_info">
                            <Panel className="hero_name">
                                {enemy_hero_name && (
                                    <Label className="sub_label" text={$.Localize(`#${enemy_hero_name}`)} style={{ color: '#C0C0C0',fontSize: '15px' }}></Label>
                                )}
                            </Panel>
                            <Panel className="show_ability_box">
                                <Panel className="ability">
                                    {enemy_abi_name && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            showtooltip={true}
                                            abilityname={enemy_abi_name}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    )}
                                </Panel>
                                <Panel className="ability">
                                    {enemy_ult_name && (
                                        <DOTAAbilityImage
                                            className="ability"
                                            showtooltip={true}
                                            abilityname={enemy_ult_name}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    )}
                                </Panel>
                            </Panel>
                        </Panel>
                    </Panel>
                    <Panel className='swap_button' style={{ visibility: PlayerID == LocalPlayerID ? 'collapse' : 'visible'}} >
                        <TextButton text={'交换少女'} style={{ color: '#C0C0C0' }} onactivate={() => {console.log('换人');}}></TextButton>
                    </Panel>
                    {
                        new Array(5).fill(0).map((item, index) => {
                            let visibility:string = 'collapse';
                            if( State == 3) {
                                visibility = 'collapse';
                            }else if(PlayerID != LocalPlayerID) {
                                visibility = 'collapse';
                            }else {
                                visibility = 'visible';
                            }
                            return (
                                //@ts-ignore
                                <Panel className='' style={{width: '100%', height: '25px' , flowChildren: 'right', visibility:visibility}}>
                                    <Label className="Player_box_element" style={{ color: '#C0C0C0',marginLeft: '20%' }} text={`${jiaId[index]}请求与你交换`} />
                                    <Panel className='swap_button' >
                                        <TextButton text={'同意交换'} style={{ color: '#C0C0C0',marginRight: '1px' }} onactivate={() => ClickSwapButton(Player_box_index, index + 1, PlayerID)}></TextButton>
                                    </Panel>
                                </Panel>
                            )
                        })
                    }
                </Panel>
            </>
        );
    }
    function ClickSwapButton( Player_box_index: number, index: number, PlayerID: number) {
        console.log('点击了交换按钮');
    }

    function GetMargin(Player_box_index: number): { margin_left: string; margin_right: string } {
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
};

// render(<OMGBP />, $.GetContextPanel());

interface bp_list {
    hero_list: Array<string>;
    abi_list: Array<string>;
    ult_list: Array<string>;
}

interface show_box {
    hero_name: string;
    abi_name: string;
    ult_name: string;
}

interface React_BP_List {
    hakurei: Array<show_box>;
    moriya: Array<show_box>;
}
interface BpListResultItem {
    PlayerID: number;
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
