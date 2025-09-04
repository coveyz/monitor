import { _support } from '@coveyz/monitor-utils';

export class Breadcrumb {
};

export const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());

