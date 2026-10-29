export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Item {
  id: string;
  name: string;
  emoji: string;
}

export interface Move {
  id: string;
  itemId: string;
  memberId: string;
  location: string;
  at: number;
}

export interface AppState {
  members: Member[];
  items: Item[];
  moves: Move[];
  spots: string[];
  currentMemberId: string;
}
