export type Board = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateBoardInput = {
  title?: string;
};
