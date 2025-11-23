import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsYYYYMMDD(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isYYYYMMDD',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Validate format: YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
          }

          // Validate actual date correctness
          const date = new Date(value);
          return !isNaN(date.getTime());
        },
        defaultMessage() {
          return 'Date must be in YYYY-MM-DD format';
        },
      },
    });
  };
}
