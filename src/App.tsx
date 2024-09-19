import { createHashHistory } from 'history';
import { Router, Route, Redirect, Switch } from 'react-router-dom';
import DashboardsView from './pages/DashboardsView';
import RecordsView from './pages/RecordsView';
import DashboardDetailView from './pages/DashboardDetailView';
import SettingsView from './pages/SettingsView';
import SpeedDialNav from './components/SpeedDial';
import RecordDetailView from './pages/RecordDetailView';
import Notifications from './components/Notifications';
import Snackbar from './components/Snackbar';

export const history = createHashHistory();

export default function App() {
  return (
    <>
      <Router history={history}>
        <Snackbar maxSnack={5}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Switch>
            <Route exact path="/settings" component={SettingsView} />
            <Route exact path="/dashboards" component={DashboardsView} />
            <Route exact path="/records" component={RecordsView} />
            <Route path="/records/:id" component={RecordDetailView} />
            <Route path="/dashboards/:id" component={DashboardDetailView} />
            <Redirect from="/" exact to="/dashboards" />
            <Redirect from="*" to="/dashboards" />
          </Switch>
          <Notifications />
        </Snackbar>
        <SpeedDialNav />
      </Router>
    </>
  );
}
