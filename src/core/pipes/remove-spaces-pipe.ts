import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RemoveSpacesPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return value.replace(/\s+/g, '');
    }

    if (typeof value === 'object' && value !== null) {
      return this.removeSpacesFromObject(value);
    }

    return value;
  }

  private removeSpacesFromObject(obj: Record<string, any>) {
    const result = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];

      if (typeof val === 'string') {
        result[key] = val.replace(/\s+/g, '');
      } else if (typeof val === 'object' && val !== null) {
        result[key] = this.removeSpacesFromObject(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  }
}