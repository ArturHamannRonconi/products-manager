import { IdValueObject } from 'ddd-tool-kit';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';

interface SellerRepository {
  findById(id: IdValueObject): Promise<SellerAggregate | null>;
  findByEmail(email: EmailValueObject): Promise<SellerAggregate | null>;
  findByRefreshToken(rawToken: string): Promise<SellerAggregate | null>;
  save(seller: SellerAggregate): Promise<void>;
}

export { SellerRepository };
