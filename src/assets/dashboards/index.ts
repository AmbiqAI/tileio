import { cloneDeep } from 'lodash';
import { IDashboardSnapshot } from '../../models/dashboard';


export const availableDashboards = [
  {file: 'hk-dashboard-config.json', name: 'HeartKit Dashboard'},
  {file: 'hk-ap510-vs-ap4.json', name: 'HeartKit: Vital Sign Monitoring'},
];

export const loadDashboard = async (name: string): Promise<IDashboardSnapshot|undefined> => {
  return new Promise((res, rej) => {
    if (name == 'hk-dashboard-config.json') {
      import('./hk-dashboard-config.json').then((data) => {
        res(cloneDeep(data?.default as IDashboardSnapshot));
      });
    } else if (name == 'hk-ap510-vs-ap4.json') {
      import('./hk-ap510-vs-ap4.json').then((data) => {
        res(cloneDeep(data?.default as IDashboardSnapshot));
      });
    }
    else {
      res(undefined);
    }
  })
}
