import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Company } from '../entities/company.entity';
import * as bcrypt from 'bcrypt';

@EventSubscriber()
export class CompanySubscriber implements EntitySubscriberInterface<Company> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Company;
  }

  async beforeInsert(event: InsertEvent<Company>) {
    if (event.entity.password) {
      event.entity.password = await bcrypt.hash(event.entity.password, 10);
    }
  }

  async beforeUpdate(event: UpdateEvent<Company>) {
    if (event?.entity?.password) {
      event.entity.password = await bcrypt.hash(
        event.entity.password as string,
        10,
      );
    }
  }
}
