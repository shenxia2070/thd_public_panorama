import { useEffect, useMemo, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama-x';

export const EndScreen = () => {
    console.log('EndScreen!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const [endTable, setEndTable] = useState(CustomNetTables.GetTableValue('end_table', 'keys'));
    const [isOpen, setIsOpen] = useState(false);
    // @ts-ignore
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent();
    // @ts-ignore
    dotaHud.FindChildTraverse('GameEndContainer').visible = false;
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, true);
    // console.log(endTable.chenghao);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateString = `${year}/${month}/${date} ${hours}:${minutes}`;
    useEffect(() => {
        // console.log('执行一次');

        CustomNetTables.SubscribeNetTableListener('end_table', (_, key, data) => {
            console.log(`CustomNetTables.SubscribeNetTableListener`);
            setEndTable(CustomNetTables.GetTableValue('end_table', 'keys'));
        });
        // 按Tab呼出面板
        (function () {
            // $.Msg('按Tab呼出面板');
            var key = 'Tab';
            const command = 'WheelButton' + Math.floor(Math.random() * 99999999);
            Game.CreateCustomKeyBind(key, command);
            Game.AddCommand(
                command,
                () => {
                    const panel = $('#thd_end_screen');
                    console.log(panel);

                    if (!panel) return;
                    panel.visible = !panel.visible;
                    setIsOpen(panel.visible);
                },
                '',
                0
            );
        })();
    }, []);

    // 数据
    let winner = '博丽';
    let time = 0;
    let hakureiKills = 0;
    let moriyaKills = 0;
    if (endTable != undefined) {
        if(endTable.winner == DOTATeam_t.DOTA_TEAM_BADGUYS){winner = '守矢'}
        time = Math.floor(endTable.time / 60);
        hakureiKills = endTable.hakureiKills;
        moriyaKills = endTable.moriyaKills;
    }
    return useMemo(() => {
        if (endTable != undefined) {
            return (
                <Panel
                    id="thd_end_screen"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#252525',
                        verticalAlign: 'center',
                        horizontalAlign: 'center',
                        opacity: '1',
                        flowChildren: 'down',
                        visibility: isOpen ? 'collapse' : 'visible',
                    }}
                >
                    <Label
                        style={{
                            width: 'fit-children',
                            height: 'fit-children',
                            verticalAlign: 'center',
                            horizontalAlign: 'center',
                            opacity: '1',
                            fontSize: '60px',
                            color: '#66ccff',
                            marginTop: '2%',
                        }}
                        text={`${winner}获胜`}
                    ></Label>
                    <Panel
                        style={{ width: 'fit-children', height: 'fit-children', horizontalAlign: 'center', marginTop: '2%', flowChildren: 'right' }}
                    >
                        <Label text={`日期: ${dateString}  时长:${time} 分钟`} />
                    </Panel>

                    <Panel style={{ width: '100%', height: 'fit-children', flowChildren: 'right', marginTop: '2%' }}>
                        <Panel style={{ width: '250px', height: 'fit-children', flowChildren: 'down' }}>
                            <TeamBox team={DOTATeam_t.DOTA_TEAM_GOODGUYS} teamKills={hakureiKills} />
                            <TeamBox team={DOTATeam_t.DOTA_TEAM_BADGUYS} teamKills={moriyaKills} />
                        </Panel>
                        <Panel style={{ width: '100%', height: 'fit-children', flowChildren: 'down', overflow: 'scroll squish', marginLeft: '15px' }}>
                            <TeamDatasTitle />
                            {new Array(5).fill(0).map((item, index) => {
                                return <TeamData key={`hakurei_${index}`} TeamNumber={DOTATeam_t.DOTA_TEAM_GOODGUYS} index={index} />;
                            })}
                            <TeamDatasTitle />
                            {new Array(5).fill(0).map((item, index) => {
                                return <TeamData key={`hakurei_${index}`} TeamNumber={DOTATeam_t.DOTA_TEAM_BADGUYS} index={index} />;
                            })}
                            <Panel style={{ width: '100%', height: '14px' }}></Panel>
                        </Panel>
                    </Panel>
                    <TextButton
                        className="ButtonBevel"
                        style={{ width: '180px', height: '64px', marginTop: '2%', horizontalAlign: 'center', fontSize: '40px' }}
                        text={'结束'}
                        onactivate={() => Game.FinishGame()}
                    />
                </Panel>
            );
        } else {
            console.log('endTable == undefined');
            return <></>;
        }
    }, [endTable]);
    function TeamDatasTitle() {
        return (
            <Panel style={{ width: 'fit-children', height: 'fit-children', flowChildren: 'right' }}>
                <Panel style={{ width: 'fit-children', height: 'fit-children', flowChildren: 'down' }}>
                    <Panel style={{ width: 'fit-children', height: '48px', flowChildren: 'right' }}>
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '30px' }} text={`RANK`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '70px' }} text={`本场称号`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '70px' }} text={`等级`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '80px' }} text={`组合`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '180px' }} text={`K/D/A`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '70px' }} text={`财产`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '250px' }} text={`物品`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '200px' }} text={`中立物品`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '40px' }} text={`输出`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '60px' }} text={`承受`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '60px' }} text={`治疗`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '60px' }} text={`GPM`} />
                        <Label style={{ color: '#94E3E3', fontSize: '20px', verticalAlign: 'center', marginLeft: '60px' }} text={`XPM`} />
                    </Panel>
                </Panel>
            </Panel>
        );
    }
    function TeamData({ TeamNumber, index }: { TeamNumber: DOTATeam_t; index: number }) {
        const endTable = CustomNetTables.GetTableValue('end_table', 'keys');
        const LocalTeam = Object.values(endTable.players)
            .map(player => {
                // @ts-ignore
                if (player.teamnumber == TeamNumber) {
                    return player as any;
                }
            })
            .filter(player => player != undefined);

        let PlayerID = LocalTeam[index] == undefined ? '' : LocalTeam[index].PlayerID;
        let heroName = LocalTeam[index] == undefined ? '' : LocalTeam[index].hero;
        let abiName = LocalTeam[index] == undefined ? '' : LocalTeam[index].normalSkill;
        let ultName = LocalTeam[index] == undefined ? '' : LocalTeam[index].ultimateSkill;
        let KDA = LocalTeam[index] == undefined ? '' : `${LocalTeam[index].kill}/${LocalTeam[index].death}/${LocalTeam[index].assist}`;
        let gold = LocalTeam[index] == undefined ? '' : LocalTeam[index].gold;
        let score = LocalTeam[index] == undefined ? '' : LocalTeam[index].score;
        let items = LocalTeam[index] == undefined ? '' : LocalTeam[index].items;
        let neutralItem = LocalTeam[index] == undefined ? '' : LocalTeam[index].neutralItem;
        let doneDamage = LocalTeam[index] == undefined ? '' : LocalTeam[index].doneDamage;
        let takeDamage = LocalTeam[index] == undefined ? '' : LocalTeam[index].takeDamage;
        let heal = LocalTeam[index] == undefined ? '' : LocalTeam[index].heal;
        let gpm = LocalTeam[index] == undefined ? '' : LocalTeam[index].gpm;
        let xpm = LocalTeam[index] == undefined ? '' : LocalTeam[index].xpm;

        return (
            <Panel style={{ width: 'fit-children', height: 'fit-children', flowChildren: 'right' }}>
                <Panel style={{ width: 'fit-children', height: '64px', flowChildren: 'right' }}>
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '35px' }} text={score} />
                    <Panel style={{ width: '180px', height: '48px', flowChildren: 'right-wrap' }}>
                        {/* 称号 */}
                        {PlayerID !== '' &&
                            Object.keys(endTable.chenghao).map((item: any) => {
                                if (endTable.chenghao[item] == PlayerID) {
                                    return (
                                        <Image
                                            key={`endtitle${item}`}
                                            style={{ verticalAlign: 'center', horizontalAlign: 'left' }}
                                            src={`file://{resources}/images/hud/end/title_${item}.png`}
                                        />
                                    );
                                }
                            })
                        }
                    </Panel>
                    {/* 等级 */}
                    <Label
                        className={`EndData`}
                        style={{ width: '50px', color: '#94E3E3', marginLeft: '0px' }}
                        text={`${LocalTeam[index] == undefined ? '' : LocalTeam[index].lvl}`}
                    />
                    {/* 头像 */}
                    <Image
                        src={`s2r://panorama/images/heroes/thd2_${heroName}_png.vtex`}
                        className="hero_image"
                        style={{ verticalAlign: 'center', marginLeft: '0px' }}
                    ></Image>
                    {/* 技能 */}
                    <DOTAAbilityImage
                        style={{ width: '64px', height: '64px', verticalAlign: 'center', marginLeft: '5px' }}
                        abilityname={abiName}
                        showtooltip={true}
                    />
                    <DOTAAbilityImage
                        style={{ width: '64px', height: '64px', verticalAlign: 'center', marginLeft: '5px' }}
                        abilityname={ultName}
                        showtooltip={true}
                    />
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '50px' }} text={`${KDA}`} />
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '30px' }} text={`${gold}`} />
                    <Panel style={{ width: 'fit-children', height: '100%', flowChildren: 'right', marginLeft: '0px' }}>
                        {new Array(6).fill(0).map((item, index) => {
                            const itemname = items[index + 1];
                            return (
                                <DOTAItemImage
                                    key={`item_${index}`}
                                    itemname={itemname}
                                    style={{ width: '64px', height: '47px', marginLeft: '5px', verticalAlign: 'center' }}
                                />
                            );
                        })}
                        <DOTAItemImage
                            itemname={neutralItem}
                            style={{ width: '64px', height: '47px', verticalAlign: 'center', marginLeft: '15px' }}
                        />
                    </Panel>
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '35px', verticalAlign: 'center',horizontalAlign:'center' }} text={`${doneDamage}`} />
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '0px', verticalAlign: 'center',horizontalAlign:'center' }} text={`${takeDamage}`} />
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '10px', verticalAlign: 'center',horizontalAlign:'center' }} text={`${heal}`} />
                    <Label className={`EndData`} style={{ width: '100px', marginLeft: '0px', verticalAlign: 'center',horizontalAlign:'center' }} text={`${gpm}`} />
                    <Label className={`EndData`} style={{ width: '90px', marginLeft: '0px', verticalAlign: 'center',horizontalAlign:'center' }} text={`${xpm}`} />
                </Panel>
            </Panel>
        );
    }

    function TeamBox({ team, teamKills }: { team: DOTATeam_t; teamKills: number }) {
        let teamName = team == DOTATeam_t.DOTA_TEAM_GOODGUYS ? '博丽' : '守矢';
        return (
            <Panel style={{ width: '100%', height: 'fit-children', flowChildren: 'right' }}>
                <Panel style={{ width: 'fit-children', height: 'fit-children', flowChildren: 'down' }}>
                    <Panel style={{ width: '250px', height: '48px', flowChildren: 'right' }}>
                        <Label style={{ color: '#94E3E3', fontSize: '40px' }} text={`  ${teamName} ${teamKills}`} />
                    </Panel>
                    {new Array(5).fill(0).map((item, index) => {
                        return <Player key={`hakurei_${index}`} index={index} TeamNumber={team} />;
                    })}
                </Panel>
            </Panel>
        );
    }

    function Player({ index, TeamNumber }: { index: number; TeamNumber: number }) {
        const endTable = CustomNetTables.GetTableValue('end_table', 'keys');
        const LocalTeam = Object.values(endTable.players)
            .map(player => {
                // @ts-ignore
                if (player.teamnumber == TeamNumber) {
                    return player as any;
                }
            })
            .filter(player => player != undefined);
        let sid = LocalTeam[index] == undefined ? '' : LocalTeam[index].sid;
        let lid = LocalTeam[index] == undefined ? '' : LocalTeam[index].lid;
        return (
            <Panel style={{ width: '100%', height: '64px', flowChildren: 'right', paddingLeft: '1%', backgroundColor: '#404040' }}>
                <DOTAAvatarImage style={{ width: '54px', height: '54px', verticalAlign: 'center' }} steamid={lid} />
                <DOTAUserName
                    className="Player_box_element"
                    style={{
                        color: '#C0C0C0',
                        marginLeft: '10px',
                        verticalAlign: 'center',
                        horizontalAlign: 'left',
                    }}
                    steamid={sid}
                />
            </Panel>
        );
    }
};

if (Game.GetMapInfo().map_name == `maps/1_thdots_map.vpk`) render(<EndScreen />, $.GetContextPanel());
// render(<EndScreen />, $.GetContextPanel());
