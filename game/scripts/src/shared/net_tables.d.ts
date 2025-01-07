declare interface CustomNetTableDeclarations {
    game_timer: {
        game_timer: {
            current_time: number;
            current_state: 1 | 2 | 3 | 4 | 5;
            current_round: number;
        };
    };
    hero_list: {
        hero_list: Record<string, string> | string[];
    };
    custom_net_table_1: {
        key_1: number;
        key_2: string;
    };
    custom_net_table_3: {
        key_1: number;
        key_2: string;
    };
    react_table:{
        react_table_state: {}
        bp_list_all: {}
        bp_list_result: {}
        test:{
            hakurei: BpListResult;
            moriya: BpListResult;
        }
    }
    end_table: {
        keys: any
    };
}

interface BpListResult {
    [key: number]: BpListResultItem;
}
interface BpListResultItem {
    PlayerID: PlayerID;
    BanList: BPList;
    PickList: BPList;
    ChangeReceiveList: number[];
    Extra: {};
}
interface BPList {
    ['hero']: number;
    ['abi']: number;
    ['ult']: number;
}
