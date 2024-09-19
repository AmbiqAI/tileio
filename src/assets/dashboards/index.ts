import { cloneDeep } from 'lodash';
import { IDashboardSnapshot } from '../../models/dashboard';


export const availableDashboards = [
  {file: 'hk-dashboard-config.json', name: 'HeartKit Dashboard'}
];

export const loadDashboard = async (name: string): Promise<IDashboardSnapshot|undefined> => {
  return new Promise((res, rej) => {
    if (name == 'hk-dashboard-config.json') {
      import('./hk-dashboard-config.json').then((data) => {
        res(cloneDeep(data?.default as IDashboardSnapshot));
      });
    } else {
      res(undefined);
    }
  })
}
