export interface ITokenDto {
  id: string;
  content: string;
  owner_type: string;
  owner_id: string;
  action: string;
  revoked: boolean;
  startAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
