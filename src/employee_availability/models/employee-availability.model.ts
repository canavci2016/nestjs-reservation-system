import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmployeeAvailability {
  @Field({ description: 'availability unique id' })
  id: string;

  @Field({ description: 'availability date' })
  availableDate: string;

  @Field({ description: 'availability start date' })
  startTime: string;

  @Field({ description: 'availability end date' })
  endTime: string;
}
