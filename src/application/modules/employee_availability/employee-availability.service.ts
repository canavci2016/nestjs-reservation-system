import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import * as moment from 'moment';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeAvailability } from '../../../database/entities/employee-availability.entity';
import { UserEmployeeAppointmentStatus } from '../../../database/entities/user-employee-appointment.entity';

@Injectable()
export class EmployeeAvailabilityService {
  private readonly logger = new Logger(EmployeeAvailabilityService.name);

  constructor(
    @InjectRepository(EmployeeAvailability)
    private repository: Repository<EmployeeAvailability>,
    private readonly employeeService: EmployeeService,
  ) {
    this.logger.log('EmployeeAvailabilityService initialized');
  }

  async getAvailableTimeSlots(payload: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const employee = await this.employeeService.findOne({
      id: payload.employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }

    const whereQuery = {
      employeeId: payload.employeeId,
    };

    const startDate = payload.startDate
      ? moment(payload.startDate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    const endDate = payload.endDate
      ? moment(payload.endDate).format('YYYY-MM-DD')
      : moment(startDate).format('YYYY-MM-DD');

    whereQuery['availableDate'] = Between(startDate, endDate);

    const availableSlots = await this.repository.find({
      where: whereQuery,
      relations: { appointments: { user: true } },
      order: { availableDate: 'ASC', startTime: 'ASC' },
    });

    const newSlots = availableSlots.map((av) => ({
      ...av,
      acceptNewAppointments: true,
      numberOfAppointments: 0,
      startDayTime: av.availableDate + ' ' + av.startTime,
      startDayTimeInUnix: moment(av.availableDate + ' ' + av.startTime).unix(),
      endDayTime: av.availableDate + ' ' + av.endTime,
      appointments: av.appointments.map((ap) => ({
        ...ap,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: ap['__user__'],
      })),
    }));

    const sortedSlots = newSlots.sort((a, b) => {
      return a.startDayTimeInUnix - b.startDayTimeInUnix;
    });

    for (let index = 0; index < sortedSlots.length; index++) {
      const slot = sortedSlots[index];

      const validAppointments = slot.appointments.filter(
        (app) => app.status != UserEmployeeAppointmentStatus.REJECTED,
      );
      slot.numberOfAppointments = validAppointments.length;
      if (validAppointments.length == slot.capacity) {
        slot.acceptNewAppointments = false;
      }

      const slotStartTime = moment(slot.startDayTime, 'YYYY-MM-DD HH:mm');
      const slotStartEndTime = moment(slot.endDayTime, 'YYYY-MM-DD HH:mm');

      for (let ind = index + 1; ind < sortedSlots.length; ind++) {
        const slotItem = sortedSlots[ind];

        const targetTime = moment(slotItem.startDayTime, 'YYYY-MM-DD HH:mm');
        const isBetween = targetTime.isBetween(slotStartTime, slotStartEndTime);

        if (isBetween && validAppointments.length > 0) {
          sortedSlots[ind].acceptNewAppointments = false;
          continue;
        }
      }
    }

    return sortedSlots;
  }

  async save(payload: Partial<EmployeeAvailability>[]) {
    const companyId = payload[0].companyId;
    const employeeId = payload[0].employeeId;
    const employee = await this.employeeService.findOne({
      companyId,
      id: employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }

    const availabilities = await this.repository.find({
      where: payload.map((emp) => ({
        companyId: emp.companyId,
        employeeId: emp.employeeId,
        availableDate: emp.availableDate,
        startTime: emp.startTime,
      })),
    });

    if (availabilities.length > 0) {
      throw new ConflictException('duplicate records');
    }

    return this.repository.save(payload);
  }

  findOne(
    payload: FindOptionsWhere<EmployeeAvailability>,
  ): Promise<EmployeeAvailability | null> {
    return this.repository.findOneBy(payload);
  }

  async deleteBy(payload: Partial<EmployeeAvailability>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(EmployeeAvailability)
      .where(payload)
      .execute();

    return result;
  }

  async updateById(id: string, payload: Partial<EmployeeAvailability>) {
    return await this.repository
      .createQueryBuilder()
      .update(EmployeeAvailability)
      .set(payload)
      .where({ id: id })
      .execute();
  }
}
