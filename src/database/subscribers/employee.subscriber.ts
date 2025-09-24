import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Employee } from '../entities/employee.entity';
import * as bcrypt from 'bcrypt';

@EventSubscriber()
export class EmployeeSubscriber implements EntitySubscriberInterface<Employee> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Employee;
  }

  async beforeInsert(event: InsertEvent<Employee>) {
    if (event.entity.password) {
      event.entity.password = await bcrypt.hash(event.entity.password, 10);
    }
  }

  async beforeUpdate(event: UpdateEvent<Employee>) {
    if (event?.entity?.password) {
      event.entity.password = await bcrypt.hash(
        event.entity.password as string,
        10,
      );
    }
  }
}
