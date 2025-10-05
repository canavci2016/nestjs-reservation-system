export class AwsSqsMessageQueryBuilder {
  obj: Record<string, any>;
  constructor() {
    this.obj = {};
  }
  setStr(key: string, value: object | string | number) {
    let val = value;

    if (typeof val == 'object') {
      val = JSON.stringify(val);
    }

    this.obj[key] = {
      DataType: 'String',
      StringValue: val,
    };

    return this;
  }

  getObj() {
    return this.obj;
  }
}
